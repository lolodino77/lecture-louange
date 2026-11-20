#!/usr/bin/env node
// Valide un ou plusieurs fichiers de conversations.
// Usage : node scripts/validate.js content/001-010.txt [autres fichiers...]
//         node scripts/validate.js --all          (tout le dossier content/)
//         ajouter --quiet pour n'afficher que les erreurs, --lengths pour le détail des longueurs
'use strict';
const fs = require('fs');
const path = require('path');
const OpenCC = require('opencc-js');
const { pinyin } = require('pinyin-pro');
const P = require('./lib/parse');

const ROOT = path.join(__dirname, '..');
const CONTENT = path.join(ROOT, 'content');
const t2c = OpenCC.Converter({ from: 'tw', to: 'cn' });
const c2t = OpenCC.Converter({ from: 'cn', to: 'tw' });

const ALLOW_CHARS = new Set(['台', '祢', '祂', '游']); // 游 : forme standard de Taïwan pour « nager » (游泳)
const PY_OVERRIDE = { 祢: ['ni3'], 祂: ['ta1'], 們: ['men5', 'men2'], 哪: ['na3', 'nei3', 'na5'], 誰: ['shei2', 'shui2'], 這: ['zhe4', 'zhei4'], 那: ['na4', 'nei4', 'na3'], 一: ['yi1', 'yi2', 'yi4'], 不: ['bu4', 'bu2'] };

// Lectures de Taïwan (norme du projet, voir docs/GUIDE_REDACTION.md §1) que le dictionnaire continental de pinyin-pro ne connaît pas.
const TW_READINGS = { 微: ['wei2'], 期: ['qi2'], 突: ['tu2'], 識: ['shi4'], 息: ['xi2'], 蹟: ['ji1'], 髮: ['fa3'], 跌: ['die2'], 檔: ['dang3'], 質: ['zhi2'], 撒: ['sa4'], 夕: ['xi4'], 差: ['chai4'], 惜: ['xi2'], 同: ['tong1'], 熄: ['xi2'] };

// Mots dont la lecture en contexte diffère du dictionnaire automatique mais est correcte (vérifiés à la main).
const KNOWN_OK = { 流血: 'liu2xie3', 樂手: 'yue4shou3', 聖樂: 'sheng4yue4', 降服: 'xiang2fu2', 抹布: 'mo3bu4', 哽咽: 'geng3ye4', 露出: 'lou4chu1', 測度: 'ce4duo2', 角色: 'jiao3se4', 同行: 'tong2xing2' };

const args = process.argv.slice(2);
const quiet = args.includes('--quiet');
const showLengths = args.includes('--lengths');
let files = args.filter((a) => !a.startsWith('--'));
if (args.includes('--all') || files.length === 0) {
  files = fs.readdirSync(CONTENT).filter((f) => f.endsWith('.txt')).map((f) => path.join(CONTENT, f));
}

const songs = new Set(
  fs
    .readFileSync(path.join(ROOT, 'docs', 'chants_streamofpraise.txt'), 'utf8')
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter((x) => x && !x.startsWith('#'))
);

// séries déclarées dans tout le dossier
const allData = P.loadAll(CONTENT);
const seriesIds = new Set(allData.series.map((s) => s.id));
for (const f of files) for (const s of P.parseFile(f).series) seriesIds.add(s.id);

const norm = (s) => s.toLowerCase().replace(/ü/g, 'v').replace(/0$/, '5');
const base = (s) => s.replace(/[1-5]$/, '');
const readCache = new Map();
function readingsOf(ch) {
  if (readCache.has(ch)) return readCache.get(ch);
  const set = new Set();
  if (PY_OVERRIDE[ch]) PY_OVERRIDE[ch].forEach((x) => set.add(x));
  else {
    for (const c of new Set([ch, t2c(ch)])) {
      for (const r of pinyin(c, { toneType: 'num', multiple: true, type: 'array' })) set.add(norm(r));
    }
  }
  (TW_READINGS[ch] || []).forEach((x) => set.add(x));
  readCache.set(ch, set);
  return set;
}

let nErr = 0;
let nWarn = 0;
const report = [];
const push = (level, where, msg) => {
  if (level === 'error') nErr++;
  else nWarn++;
  report.push({ level, where, msg });
};

for (const file of files) {
  const r = P.parseFile(file);
  const rel = path.basename(file);
  r.problems.forEach((p) => push(p.level, `${rel}:${p.line}${p.id ? ' [' + p.id + ']' : ''}`, p.msg));
  for (const s of r.series) {
    if (!/^\d{3}$/.test(s.id)) push('warn', `${rel}:${s.lineNo}`, `Identifiant de série "${s.id}" : utiliser le numéro (3 chiffres) de sa première conversation.`);
  }
  const seen = new Set();
  for (const st of r.stories) {
    const W = (ln) => `${rel}:${ln} [${String(st.id).padStart(3, '0')}]`;
    if (seen.has(st.id)) push('error', W(st.lineNo), 'Identifiant en double.');
    seen.add(st.id);
    const lv = P.levelOf(st.id);
    if (!lv) push('error', W(st.lineNo), 'Identifiant hors de 1–300.');
    for (const k of ['series', 'title_zh', 'title_fr', 'tagline', 'song', 'vocab']) {
      if (!st.meta[k]) push('error', W(st.lineNo), `Champ d'en-tête manquant : ${k}`);
    }
    if (st.meta.series && !seriesIds.has(st.meta.series)) push('error', W(st.lineNo), `Série "${st.meta.series}" non déclarée (@series).`);
    if (st.meta.song && !songs.has(st.meta.song)) push('warn', W(st.lineNo), `Chant "${st.meta.song}" absent de docs/chants_streamofpraise.txt (vérifier l'orthographe exacte).`);
    if (st.vocab.length < 2 || st.vocab.length > 10) push('warn', W(st.lineNo), `vocab : ${st.vocab.length} entrée(s) (attendu 3 à 8).`);
    if (st.sentences.length === 0) push('error', W(st.lineNo), 'Aucune phrase.');

    const tokensInStory = new Set();
    for (const sen of st.sentences) {
      if (!sen.fr) push('error', W(sen.lineNo), 'Traduction vide.');
      for (const g of sen.segs) {
        if (g.t === 'p') {
          if (P.HAN.test(g.text)) push('error', W(sen.lineNo), `Caractère(s) chinois sans pinyin : « ${g.text} » (forme attendue 漢字/pin1yin1).`);
          if (/[A-Za-z]{2,}/.test(g.text) && !/alpha|beta|gamma|omega/.test(g.text)) push('warn', W(sen.lineNo), `Lettres latines dans la ligne chinoise : « ${g.text} ».`);
          continue;
        }
        tokensInStory.add(g.zh);
        const chars = [...g.zh];
        if (!g.syl) {
          push('error', W(sen.lineNo), `Pinyin mal formé pour ${g.zh}/${g.py} (chaque syllabe doit finir par un chiffre 1–5, ü = v).`);
          continue;
        }
        if (g.syl.length !== chars.length) {
          push('error', W(sen.lineNo), `${g.zh}/${g.py} : ${chars.length} caractère(s) mais ${g.syl.length} syllabe(s).`);
          continue;
        }
        chars.forEach((ch, i) => {
          // caractères simplifiés
          if (!ALLOW_CHARS.has(ch) && c2t(ch) !== ch && t2c(ch) === ch) {
            push('error', W(sen.lineNo), `« ${ch} » dans ${g.zh} semble être un caractère simplifié (traditionnel : ${c2t(ch)}).`);
          }
          const rd = readingsOf(ch);
          if (!rd.size) return;
          const syl = g.syl[i];
          const bases = new Set([...rd].map(base));
          if (!bases.has(base(syl))) {
            push('error', W(sen.lineNo), `${g.zh}/${g.py} : « ${ch} » lu ${syl}, lectures connues : ${[...rd].join(', ')}.`);
          } else if (!syl.endsWith('5') && !rd.has(syl)) {
            push('warn', W(sen.lineNo), `${g.zh}/${g.py} : ton de « ${ch} » (${syl}) inhabituel ; lectures connues : ${[...rd].join(', ')}.`);
          }
        });
        // lecture du mot entier en contexte (mots de 2+ caractères)
        if (chars.length > 1) {
          const ref = pinyin(t2c(g.zh), { toneType: 'num', type: 'array' }).map(norm);
          const diff = ref.some((x, i) => base(x) !== base(g.syl[i]));
          if (diff && KNOWN_OK[g.zh] !== g.py.replace(/d/g, (d) => d) && !(KNOWN_OK[g.zh] && KNOWN_OK[g.zh] === g.py)) push('warn', W(sen.lineNo), `${g.zh}/${g.py} : à vérifier (dictionnaire : ${ref.join('')}).`);
        }
      }
    }
    for (const v of st.vocab) {
      if (!v.fr) push('warn', W(st.lineNo), `vocab « ${v.zh} » sans définition (forme 詞=définition).`);
      if (!tokensInStory.has(v.zh)) push('warn', W(st.lineNo), `vocab « ${v.zh} » n'apparaît pas comme mot (token) dans le texte.`);
    }
    if (lv) {
      const n = P.countHan(st);
      if (n < lv.min || n > lv.max) push('warn', W(st.lineNo), `Longueur ${n} caractères (cible niveau ${lv.n} : ${lv.min}–${lv.max}).`);
      if (showLengths) report.push({ level: 'info', where: W(st.lineNo), msg: `${n} caractères, ${st.sentences.length} phrases` });
    }
  }
}

for (const r of report) {
  if (quiet && r.level !== 'error') continue;
  const tag = r.level === 'error' ? 'ERREUR' : r.level === 'warn' ? 'avert.' : 'info  ';
  console.log(`${tag}  ${r.where}  ${r.msg}`);
}
console.log(`\n${files.length} fichier(s) — ${nErr} erreur(s), ${nWarn} avertissement(s).`);
process.exit(nErr ? 1 : 0);
