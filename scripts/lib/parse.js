// Parseur du format source des conversations (content/*.txt).
// Voir docs/GUIDE_REDACTION.md pour la description du format.
'use strict';
const fs = require('fs');
const path = require('path');

const HAN = /[㐀-䶿一-鿿豈-﫿\u{20000}-\u{2FFFF}]/u;
const TOKEN_RE = /([㐀-䶿一-鿿豈-﫿\u{20000}-\u{2FFFF}]+)\/([A-Za-zÜüÀ-ž0-9]+)/gu;

// Niveaux : plage d'identifiants, longueur cible (caractères chinois).
const LEVELS = [
  { n: 1, from: 1, to: 60, min: 70, max: 130, name: 'Débutant', hsk: 'HSK 1' },
  { n: 2, from: 61, to: 120, min: 130, max: 220, name: 'Élémentaire', hsk: 'HSK 2' },
  { n: 3, from: 121, to: 180, min: 220, max: 320, name: 'Intermédiaire', hsk: 'HSK 3' },
  { n: 4, from: 181, to: 230, min: 320, max: 430, name: 'Intermédiaire +', hsk: 'HSK 4' },
  { n: 5, from: 231, to: 270, min: 430, max: 560, name: 'Avancé', hsk: 'HSK 5' },
  { n: 6, from: 271, to: 300, min: 560, max: 720, name: 'Expert', hsk: 'HSK 6' },
];
function levelOf(id) {
  return LEVELS.find((l) => id >= l.from && id <= l.to) || null;
}

function splitSyllables(py) {
  // "wo3men5" -> ["wo3","men5"] ; renvoie null si le format est invalide.
  const s = py.toLowerCase().replace(/ü/g, 'v');
  const out = [];
  const re = /([a-z]+)([1-5])/g;
  let m;
  let pos = 0;
  while ((m = re.exec(s))) {
    if (m.index !== pos) return null;
    out.push(m[1] + m[2]);
    pos = re.lastIndex;
  }
  if (pos !== s.length) return null;
  return out;
}

// Découpe une ligne chinoise en segments : {t:'w', zh, py, syl} ou {t:'p', text}
function parseZhLine(line) {
  const segs = [];
  let last = 0;
  TOKEN_RE.lastIndex = 0;
  let m;
  while ((m = TOKEN_RE.exec(line))) {
    if (m.index > last) segs.push({ t: 'p', text: line.slice(last, m.index) });
    segs.push({ t: 'w', zh: m[1], py: m[2], syl: splitSyllables(m[2]) });
    last = TOKEN_RE.lastIndex;
  }
  if (last < line.length) segs.push({ t: 'p', text: line.slice(last) });
  // nettoyage des espaces dans la ponctuation
  for (const s of segs) if (s.t === 'p') s.text = s.text.replace(/\s+/g, '');
  return segs.filter((s) => s.t === 'w' || s.text.length);
}

function parseFile(file) {
  const raw = fs.readFileSync(file, 'utf8').replace(/^﻿/, '');
  const lines = raw.split(/\r?\n/);
  const series = [];
  const stories = [];
  const problems = [];
  let cur = null;
  let mode = null; // 'head' | 'body'
  let pendingZh = null;

  const rel = path.basename(file);
  const flushPending = () => {
    if (pendingZh) {
      problems.push({ level: 'error', file: rel, line: pendingZh.lineNo, id: cur && cur.id, msg: 'Ligne chinoise sans traduction (ligne "= ..." manquante).' });
      cur.sentences.push({ zhRaw: pendingZh.text, segs: parseZhLine(pendingZh.text), fr: '', lineNo: pendingZh.lineNo });
      pendingZh = null;
    }
  };
  const endStory = () => {
    if (cur) {
      flushPending();
      stories.push(cur);
    }
    cur = null;
    mode = null;
  };

  lines.forEach((l, i) => {
    const lineNo = i + 1;
    const line = l.trim();
    if (!line || line.startsWith('#')) return;
    if (line.startsWith('@series')) {
      endStory();
      const parts = line.replace(/^@series\s*/, '').split('|').map((x) => x.trim());
      if (parts.length < 4) problems.push({ level: 'error', file: rel, line: lineNo, msg: 'Déclaration @series incomplète (id | zh | fr | description).' });
      series.push({ id: parts[0], zh: parts[1] || '', fr: parts[2] || '', desc: parts.slice(3).join(' | '), file: rel, lineNo });
      return;
    }
    const sm = line.match(/^===\s*(\d{1,3})\s*$/);
    if (sm) {
      endStory();
      cur = { id: parseInt(sm[1], 10), meta: {}, sentences: [], file: rel, lineNo };
      mode = 'head';
      return;
    }
    if (!cur) {
      problems.push({ level: 'error', file: rel, line: lineNo, msg: 'Texte hors d\'une conversation : ' + line.slice(0, 40) });
      return;
    }
    if (mode === 'head') {
      if (line === '---') {
        mode = 'body';
        return;
      }
      const hm = line.match(/^([a-z_]+)\s*:\s*(.*)$/);
      if (!hm) {
        problems.push({ level: 'error', file: rel, line: lineNo, id: cur.id, msg: 'En-tête invalide (attendu "clé: valeur" ou "---") : ' + line.slice(0, 40) });
        return;
      }
      cur.meta[hm[1]] = hm[2].trim();
      return;
    }
    // corps
    if (line.startsWith('=')) {
      const fr = line.replace(/^=\s*/, '');
      if (!pendingZh) {
        problems.push({ level: 'error', file: rel, line: lineNo, id: cur.id, msg: 'Traduction sans ligne chinoise juste avant.' });
        return;
      }
      cur.sentences.push({ zhRaw: pendingZh.text, segs: parseZhLine(pendingZh.text), fr, lineNo: pendingZh.lineNo });
      pendingZh = null;
      return;
    }
    flushPending();
    pendingZh = { text: line, lineNo };
  });
  endStory();

  for (const s of stories) {
    s.vocab = parseVocab(s.meta.vocab || '');
  }
  return { series, stories, problems };
}

function parseVocab(v) {
  return v
    .split('|')
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => {
      const i = x.indexOf('=');
      if (i < 0) return { zh: x.trim(), fr: '' };
      return { zh: x.slice(0, i).trim(), fr: x.slice(i + 1).trim() };
    });
}

function loadAll(dir) {
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.txt'))
    .sort();
  const all = { series: [], stories: [], problems: [] };
  for (const f of files) {
    const r = parseFile(path.join(dir, f));
    all.series.push(...r.series);
    all.stories.push(...r.stories);
    all.problems.push(...r.problems);
  }
  all.stories.sort((a, b) => a.id - b.id);
  return all;
}

function countHan(story) {
  let n = 0;
  for (const s of story.sentences) for (const g of s.segs) if (g.t === 'w') n += [...g.zh].length;
  return n;
}

// Conversion pinyin numérique -> pinyin à diacritiques
const TONES = {
  a: 'āáǎàa', e: 'ēéěèe', i: 'īíǐìi', o: 'ōóǒòo', u: 'ūúǔùu', v: 'ǖǘǚǜü',
};
function numToMark(syl) {
  const m = syl.toLowerCase().match(/^([a-zv]+)([1-5])$/);
  if (!m) return syl;
  let [, base, tone] = m;
  tone = parseInt(tone, 10);
  base = base.replace(/v/g, 'ü');
  if (tone === 5) return base;
  const plain = base.replace(/ü/g, 'v');
  let idx = -1;
  if (plain.includes('a')) idx = plain.indexOf('a');
  else if (plain.includes('e')) idx = plain.indexOf('e');
  else if (plain.includes('ou')) idx = plain.indexOf('o');
  else {
    for (let k = plain.length - 1; k >= 0; k--) {
      if ('iouv'.includes(plain[k])) {
        idx = k;
        break;
      }
    }
  }
  if (idx < 0) return base;
  const ch = plain[idx];
  const marked = TONES[ch][tone - 1];
  return base.slice(0, idx) + marked + base.slice(idx + 1);
}

// Conversion pinyin numérique -> zhuyin (注音符號)
const ZY_INIT = { b: 'ㄅ', p: 'ㄆ', m: 'ㄇ', f: 'ㄈ', d: 'ㄉ', t: 'ㄊ', n: 'ㄋ', l: 'ㄌ', g: 'ㄍ', k: 'ㄎ', h: 'ㄏ', j: 'ㄐ', q: 'ㄑ', x: 'ㄒ', zh: 'ㄓ', ch: 'ㄔ', sh: 'ㄕ', r: 'ㄖ', z: 'ㄗ', c: 'ㄘ', s: 'ㄙ' };
const ZY_FIN = {
  a: 'ㄚ', o: 'ㄛ', e: 'ㄜ', ai: 'ㄞ', ei: 'ㄟ', ao: 'ㄠ', ou: 'ㄡ', an: 'ㄢ', en: 'ㄣ', ang: 'ㄤ', eng: 'ㄥ', er: 'ㄦ', ong: 'ㄨㄥ',
  i: 'ㄧ', ia: 'ㄧㄚ', ie: 'ㄧㄝ', iao: 'ㄧㄠ', iu: 'ㄧㄡ', iou: 'ㄧㄡ', ian: 'ㄧㄢ', in: 'ㄧㄣ', iang: 'ㄧㄤ', ing: 'ㄧㄥ', iong: 'ㄩㄥ', io: 'ㄧㄛ',
  u: 'ㄨ', ua: 'ㄨㄚ', uo: 'ㄨㄛ', uai: 'ㄨㄞ', ui: 'ㄨㄟ', uei: 'ㄨㄟ', uan: 'ㄨㄢ', un: 'ㄨㄣ', uen: 'ㄨㄣ', uang: 'ㄨㄤ', ueng: 'ㄨㄥ',
  v: 'ㄩ', ve: 'ㄩㄝ', van: 'ㄩㄢ', vn: 'ㄩㄣ', m: 'ㄇ', n: 'ㄋ', ng: 'ㄫ',
};
const ZY_TONE = ['', '', 'ˊ', 'ˇ', 'ˋ'];
function numToZhuyin(syl) {
  const m = syl.toLowerCase().replace(/ü/g, 'v').match(/^([a-z]+)([1-5])$/);
  if (!m) return syl;
  let s = m[1];
  const tone = parseInt(m[2], 10);
  let ini = '';
  let fin = s;
  const im = s.match(/^(zh|ch|sh|[bpmfdtnlgkhjqxrzcs])(.*)$/);
  if (im && im[2] !== '' && !(im[1] === 'n' && im[2] === 'g')) {
    ini = im[1];
    fin = im[2];
  } else if (im && im[2] === '' && 'mn'.includes(im[1])) {
    fin = im[1];
  }
  if (!ini) {
    // y / w
    const yw = {
      yi: 'i', ya: 'ia', ye: 'ie', yao: 'iao', you: 'iu', yan: 'ian', yin: 'in', yang: 'iang', ying: 'ing', yong: 'iong', yo: 'io',
      yu: 'v', yue: 've', yuan: 'van', yun: 'vn', wu: 'u', wa: 'ua', wo: 'uo', wai: 'uai', wei: 'ui', wan: 'uan', wen: 'un', wang: 'uang', weng: 'ueng',
    };
    if (yw[s]) fin = yw[s];
  }
  if (ini && 'jqx'.includes(ini) && fin.startsWith('u')) fin = 'v' + fin.slice(1);
  if ((ini === 'n' || ini === 'l') && fin === 'ue') fin = 've';
  let body;
  if (['zh', 'ch', 'sh', 'r', 'z', 'c', 's'].includes(ini) && fin === 'i') body = ZY_INIT[ini];
  else body = (ini ? ZY_INIT[ini] : '') + (ZY_FIN[fin] !== undefined ? ZY_FIN[fin] : fin);
  if (tone === 5) return '˙' + body;
  return body + ZY_TONE[tone];
}

module.exports = { numToZhuyin, HAN, LEVELS, levelOf, parseFile, loadAll, parseZhLine, splitSyllables, countHan, numToMark, parseVocab };
