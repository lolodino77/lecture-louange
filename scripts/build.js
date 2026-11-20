#!/usr/bin/env node
// Génère le site statique dans site/ à partir de content/*.txt et data/glossaire.tsv.
// Usage : node scripts/build.js
'use strict';
const fs = require('fs');
const path = require('path');
const OpenCC = require('opencc-js');
const P = require('./lib/parse');

const ROOT = path.join(__dirname, '..');
const OUT = process.env.LL_OUT || path.join(ROOT, 'site');
const STORY_DIR = 'conversations';
const t2cRaw = OpenCC.Converter({ from: 'tw', to: 'cn' });
// 祢 / 祂 restent identiques en simplifié (usage des Églises sinophones)
const t2c = (s) => {
  const a = [...s];
  const b = [...t2cRaw(s)];
  if (a.length !== b.length) return b.join('');
  return b.map((c, i) => (a[i] === '祢' || a[i] === '祂' ? a[i] : c)).join('');
};

const SITE_NAME = 'Lecture Louange';
const LEVEL_COLORS = { 1: '#34a853', 2: '#16998a', 3: '#2b7bb9', 4: '#5a5fc4', 5: '#8a4fb0', 6: '#b07a1f' };
const LEVEL_DESC = {
  1: 'Les tout premiers pas : salutations, église, prière, chant. Phrases très courtes et premiers mots de la foi.',
  2: 'Noël, Nouvel An chinois, Pâques : Luc découvre l\'Évangile. Passé, comparaison, causes et conséquences.',
  3: 'Baptême, équipe de louange, service : repentance, nouvelle naissance, pardon et mission.',
  4: 'Mission à Hualien, épître aux Romains, débats avec David : justification, alliance, fruit de l\'Esprit.',
  5: 'Deuil et espérance, grâce et loi, entrée au séminaire : herméneutique, eschatologie, Église et mission.',
  6: 'Trinité, christologie, credo, Réforme et théologie de l\'adoration — jusqu\'au dernier culte.',
};

const CAST = [
  ['路加', 'lù jiā', 'Luc', 'Étudiant français arrivé à Taipei pour apprendre le chinois. Curieux et sincère, il découvre la foi au fil des conversations.'],
  ['小恩', 'xiǎo ēn', 'Xiao En', 'Étudiante taïwanaise, chanteuse de l\'équipe de louange et partenaire d\'échange linguistique de Luc.'],
  ['王牧師', 'wáng mùshī', 'Le pasteur Wang', 'Pasteur de l\'église de la Grâce, chaleureux et amateur de métaphores.'],
  ['王師母', 'wáng shīmǔ', 'Mme Wang', 'Son épouse, qui accueille tout le monde… et cuisine pour tout le monde.'],
  ['美玲', 'měi líng', 'Meiling', 'Responsable de la louange, exigeante et douce.'],
  ['阿傑', 'ā jié', 'A-Jie', 'Guitariste blagueur, parfois impulsif.'],
  ['陳奶奶', 'chén nǎinai', 'Mamie Chen', 'Grand-mère de Xiao En, femme de prière qui connaît tous les vieux cantiques.'],
  ['小光', 'xiǎo guāng', 'Xiao Guang', 'Fils de Meiling, 8 ans, champion des questions naïves… et profondes.'],
  ['張長老', 'zhāng zhǎnglǎo', 'L\'ancien Zhang', 'Ancien professeur, il anime l\'étude biblique avec précision et patience.'],
  ['林老師', 'lín lǎoshī', 'Le professeur Lin', 'Professeur au séminaire de Taipei.'],
  ['大衛', 'dà wèi', 'David', 'Ami de Luc, étudiant en philosophie, sceptique honnête qui pose les questions difficiles.'],
];

// ---------- utilitaires ----------
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad = (n) => String(n).padStart(3, '0');
const slugify = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
const pyMarks = (syl) => (syl || []).map(P.numToMark).join(' ');
const write = (rel, content) => {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content, 'utf8');
};
const ytSearch = (song) => 'https://www.youtube.com/results?search_query=' + encodeURIComponent('讚美之泉 ' + song);

// ---------- données ----------
const data = P.loadAll(process.env.LL_CONTENT || path.join(ROOT, 'content'));
const stories = data.stories.filter((s) => P.levelOf(s.id));
const seriesById = new Map(data.series.map((s) => [s.id, s]));

// glossaire : clé "mot|pinyin" puis "mot"
const glossary = new Map();
const glossFile = path.join(ROOT, 'data', 'glossaire.tsv');
if (fs.existsSync(glossFile)) {
  for (const line of fs.readFileSync(glossFile, 'utf8').split(/\r?\n/)) {
    if (!line.trim() || line.startsWith('#')) continue;
    const [zh, py, def] = line.split('\t');
    if (!zh || !def) continue;
    const k = zh + '|' + (py || '').toLowerCase();
    if (!glossary.has(k)) glossary.set(k, def.trim());
    if (!glossary.has(zh)) glossary.set(zh, def.trim());
  }
}
// définitions des mots clés (prioritaires dans leur propre conversation, sinon en secours)
const vocabDefs = new Map();
for (const st of stories) for (const v of st.vocab) if (v.fr && !vocabDefs.has(v.zh)) vocabDefs.set(v.zh, v.fr);
const missingDefs = new Map();
function defOf(word, pyNum, story) {
  const own = story && story.vocab.find((v) => v.zh === word && v.fr);
  if (own) return own.fr;
  const g = glossary.get(word + '|' + pyNum) || glossary.get(word) || vocabDefs.get(word);
  if (g) return g;
  missingDefs.set(word + '\t' + pyNum, (missingDefs.get(word + '\t' + pyNum) || 0) + 1);
  return '';
}

// slugs, niveaux, séries
for (const st of stories) {
  st.level = P.levelOf(st.id);
  st.slug = pad(st.id) + '-' + slugify(st.meta.title_fr || 'conversation');
  st.href = `${STORY_DIR}/${st.slug}.html`;
  st.chars = P.countHan(st);
  st.series = seriesById.get(st.meta.series) || { id: st.meta.series || '?', zh: '', fr: 'Série', desc: '' };
}
const seriesList = [];
for (const st of stories) {
  let s = seriesList.find((x) => x.id === st.series.id);
  if (!s) {
    s = { ...st.series, stories: [], level: st.level };
    seriesList.push(s);
  }
  s.stories.push(st);
}

// ---------- illustrations SVG (bannière de série) ----------
function heroSvg(series, level, { w = 1120, h = 480, big = true } = {}) {
  const c = LEVEL_COLORS[level.n];
  const zh = esc(series.zh || '讚美');
  const id = 'g' + series.id + (big ? 'b' : 's') + w;
  const fs1 = Math.round(Math.min(h * 0.3, (w * 0.8) / Math.max(2, [...(series.zh || '讚美')].length)));
  // faisceaux de lumière partant du coin supérieur droit
  const cx = w * 0.88;
  const cy = -h * 0.12;
  const L = w * 1.4;
  const rays = big
    ? Array.from({ length: 7 }, (_, i) => {
        const a1 = ((100 + i * 12) * Math.PI) / 180;
        const a2 = ((105 + i * 12) * Math.PI) / 180;
        const p = (a) => `${(cx + Math.cos(a) * L).toFixed(0)},${(cy + Math.sin(a) * L).toFixed(0)}`;
        return `<polygon points="${cx.toFixed(0)},${cy.toFixed(0)} ${p(a1)} ${p(a2)}" fill="#fff" fill-opacity="0.07"/>`;
      }).join('')
    : '';
  const cross = big
    ? `<g fill="#fff" fill-opacity="0.85"><rect x="${(w * 0.075).toFixed(0)}" y="${(h * 0.12).toFixed(0)}" width="${(w * 0.011).toFixed(0)}" height="${(h * 0.24).toFixed(0)}" rx="2"/><rect x="${(w * 0.056).toFixed(0)}" y="${(h * 0.18).toFixed(0)}" width="${(w * 0.049).toFixed(0)}" height="${(w * 0.011).toFixed(0)}" rx="2"/></g>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(series.fr)}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.22"/><stop offset="0.6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.12"/></linearGradient></defs><rect width="${w}" height="${h}" fill="${c}"/><rect width="${w}" height="${h}" fill="url(#${id})"/>${rays}${cross}${
    big ? `<text x="${w / 2}" y="${h * 0.6}" text-anchor="middle" font-family="'Noto Serif TC','PMingLiU','Songti TC',serif" font-size="${fs1}" font-weight="700" fill="#fff" lang="zh-Hant">${zh}</text><text x="${w / 2}" y="${h * 0.8}" text-anchor="middle" font-family="Nunito,'Segoe UI',sans-serif" font-size="${Math.round(h * 0.07)}" font-weight="700" fill="#fff" fill-opacity="0.92">${esc(series.fr)}</text>` : `<text x="${w / 2}" y="${h * 0.68}" text-anchor="middle" font-family="'Noto Serif TC','PMingLiU',serif" font-size="${Math.round(h * 0.5)}" font-weight="700" fill="#fff" lang="zh-Hant">${esc([...(series.zh || '讚')][0])}</text>`
  }</svg>`;
}

// ---------- gabarit ----------
function page({ title, desc, body, depth = 0, bodyClass = '' }) {
  const up = depth ? '../' : '';
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="icon" href="${up}assets/logo.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Noto+Serif+TC:wght@700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${up}assets/style.css">
</head>
<body class="${bodyClass}">
<header>
  <div class="container">
    <a class="logo" href="${up}index.html"><img src="${up}assets/logo.svg" alt="" width="34" height="34"><div>${SITE_NAME}</div></a>
    <nav aria-label="Navigation principale"><ul>
      <li><a href="${up}index.html">Lecture</a></li>
      <li><a href="${up}grammaire.html">Grammaire</a></li>
      <li><a href="${up}vocabulaire.html">Vocabulaire</a></li>
      <li><a href="${up}cartes.html">Cartes</a></li>
      <li><a href="${up}chants.html">Chants</a></li>
      <li><button type="button" class="search-btn" id="search-open" aria-label="Rechercher" data-root="${up}"><svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button></li>
      <li><a class="nav-cta" id="cta-continue" href="${up}${stories[0] ? stories[0].href : 'index.html'}" data-root="${up}">Commencer</a></li>
    </ul></nav>
  </div>
</header>
<div id="search-layer" class="search-layer" hidden>
  <div class="search-panel" role="dialog" aria-label="Recherche">
    <div class="search-row"><input type="search" id="search-input" placeholder="Titre, mot chinois, pinyin, chant, mot français…" autocomplete="off" aria-label="Rechercher"><button type="button" id="search-close" aria-label="Fermer">×</button></div>
    <div id="search-results" class="search-results"></div>
  </div>
</div>
<main>
${body}
</main>
<footer><div class="container"><p>${SITE_NAME} — conversations graduées en chinois traditionnel pour apprendre le vocabulaire chrétien, inspirées des titres des chants de <a href="https://www.youtube.com/@streamofpraise/videos" rel="noopener" target="_blank">讚美之泉 Stream of Praise</a>. Versets : 和合本 (1919) et Louis Segond (1910). Aucune parole de chant n'est reproduite.</p></div></footer>
<script src="${up}assets/site.js"></script>
</body>
</html>
`;
}

// ---------- page de conversation ----------
function wordSpan(g, story, sentFr) {
  const py = pyMarks(g.syl);
  const pyNum = (g.syl || []).join('');
  const def = defOf(g.zh, pyNum, story);
  const simp = t2c(g.zh);
  const zy = (g.syl || []).map(P.numToZhuyin).join(' ');
  return `<span class="char" data-pinyin="${esc(py)}" data-zhuyin="${esc(zy)}" data-def="${esc(def)}"><ruby><span class="hz" data-simp="${esc(simp)}" data-trad="${esc(g.zh)}">${esc(g.zh)}</span><rt>${esc(py)}</rt></ruby></span>`;
}
function punctSpan(text) {
  return `<span class="punct" data-simp="${esc(t2c(text))}" data-trad="${esc(text)}">${esc(text)}</span>`;
}

function storyPage(st, idx) {
  const prev = stories[idx - 1];
  const next = stories[idx + 1];
  const lv = st.level;
  const paras = st.sentences
    .map((sen) => {
      const zh = sen.segs.map((g) => (g.t === 'w' ? wordSpan(g, st, sen.fr) : punctSpan(g.text))).join('');
      return `<p><span class="sentence" data-trans="${esc(sen.fr)}"><span class="zh">${zh}</span><span class="sent-trans">${esc(sen.fr)}</span></span></p>`;
    })
    .join('\n');
  const vocab = st.vocab
    .map((v) => {
      // pinyin du mot clé : première occurrence dans le texte
      let py = '';
      for (const sen of st.sentences) {
        const g = sen.segs.find((x) => x.t === 'w' && x.zh === v.zh);
        if (g) {
          py = pyMarks(g.syl);
          break;
        }
      }
      return `<li><span class="vk-hz hz" data-simp="${esc(t2c(v.zh))}" data-trad="${esc(v.zh)}" lang="zh-Hant">${esc(v.zh)}</span><span class="vk-py">${esc(py)}</span><span class="vk-def">${esc(v.fr)}</span></li>`;
    })
    .join('');
  const series = st.series;
  const body = `<div class="content-wrapper story-page">
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../index.html">Accueil</a> › <a href="../index.html#niveau-${lv.n}">Lecture</a> › <a href="../niveau-${lv.n}.html">Niveau ${lv.n}</a> › ${esc(st.meta.title_fr)}</nav>
    <div style="max-width:760px;margin:0 auto">
      <h1>${esc(st.meta.title_fr)}</h1>
      <p class="story-zh-title hz" lang="zh-Hant" data-simp="${esc(t2c(st.meta.title_zh))}" data-trad="${esc(st.meta.title_zh)}">${esc(st.meta.title_zh)}</p>
      <p class="story-meta-line"><a href="../niveau-${lv.n}.html" title="Niveau estimé (équivalent ${lv.hsk})"><strong>Niveau ${lv.n}</strong></a> · ${st.chars} caractères · <a href="../index.html#serie-${esc(series.id)}">${esc(series.fr)}</a> · n° ${pad(st.id)}/300</p>
      <p class="story-tagline">${esc(st.meta.tagline)}</p>
      <p class="story-hero-wrap">${heroSvg(series, lv)}</p>

      <div class="reader-controls">
        <span class="ctrl">
          <label for="pinyin-toggle">Pinyin</label>
          <label class="switch"><input type="checkbox" id="pinyin-toggle"><span class="slider"></span></label>
        </span>
        <span class="ctrl">
          <span class="script-switch phon-switch" role="group" aria-label="Notation phonétique">
            <button type="button" id="phon-py" aria-pressed="true" title="Pinyin">拼</button>
            <button type="button" id="phon-zy" aria-pressed="false" title="Zhuyin (注音)">ㄅ</button>
          </span>
        </span>
        <span class="ctrl">
          <label for="trans-toggle">Traduction</label>
          <label class="switch"><input type="checkbox" id="trans-toggle"><span class="slider"></span></label>
        </span>
        <span class="ctrl">
          <span class="script-switch" role="group" aria-label="Jeu de caractères">
            <button type="button" id="script-simp" aria-pressed="false">简 Simplifié</button>
            <button type="button" id="script-trad" aria-pressed="true">繁 Traditionnel</button>
          </span>
        </span>
        <span class="ctrl"><button type="button" class="listen-btn" id="listen-all" aria-pressed="false">🔊 Écouter</button></span>
        <span class="ctrl ctrl-hint">Touchez un mot pour sa définition</span>
      </div>
    </div>
    <div id="smart-reader" lang="zh-Hant" data-story="${st.id}">
${paras}
    </div>
    <div class="reader-nudge">
      <span class="nudge-icon" aria-hidden="true">🎵</span>
      <p><strong>Le chant de cette conversation : <span lang="zh-Hant">《${esc(st.meta.song)}》</span></strong>
        <span class="nudge-sub">Écoutez-le en lisant, chanté par 讚美之泉 Stream of Praise. <a href="${ytSearch(st.meta.song)}" target="_blank" rel="noopener">Chercher sur YouTube</a>.</span>
      </p>
    </div>
    <section class="vocab-key" aria-labelledby="vk-title">
      <h2 id="vk-title">Vocabulaire clé</h2>
      <ul>${vocab}</ul>
    </section>
    <nav class="story-nav" aria-label="Autres conversations">${prev ? `<a class="nav-prev" href="${prev.slug}.html"><span class="nav-label">Conversation précédente</span>${esc(prev.meta.title_fr)}</a>` : '<span></span>'}${next ? `<a class="nav-next" href="${next.slug}.html"><span class="nav-label">Conversation suivante</span>${esc(next.meta.title_fr)}</a>` : '<span></span>'}</nav>
    <p class="reader-meta">Plus de conversations : <a href="../niveau-${lv.n}.html">niveau ${lv.n}</a> · <a href="../index.html#serie-${esc(series.id)}">toute la série « ${esc(series.fr)} »</a> · <a href="../vocabulaire.html">tout le vocabulaire</a> · <a href="../chants.html">tous les chants</a></p>
  </div>
  <div id="definition-box" role="dialog" aria-live="polite" aria-label="Définition">
    <div class="def-inner">
      <div class="def-head"><span class="def-hanzi" lang="zh-Hant"></span><span class="def-pinyin"></span><span class="def-zhuyin" lang="zh-Hant"></span><button type="button" class="def-audio" aria-label="Écouter le mot">🔊</button><button type="button" class="def-save" aria-pressed="false">＋ Carte</button></div>
      <p class="def-meaning"></p>
      <div class="def-trans"><span class="def-trans-label">Phrase <button type="button" class="def-audio def-audio-sm" data-what="sentence" aria-label="Écouter la phrase">▶</button></span><span class="def-trans-text"></span></div>
      <button type="button" class="def-close" aria-label="Fermer">×</button>
    </div>
  </div>
  <script src="../assets/reader.js"></script>`;
  return page({
    title: `${st.meta.title_fr} — ${st.meta.title_zh} : conversation en chinois traditionnel avec pinyin (niveau ${lv.n}) | ${SITE_NAME}`,
    desc: `${st.meta.tagline} Conversation n° ${st.id} en chinois traditionnel avec pinyin, traduction française et définitions au toucher.`,
    body,
    depth: 1,
    bodyClass: 'story',
  });
}

// ---------- index & niveaux ----------
function storyCard(st) {
  return `<li><a href="${st.href}" data-id="${st.id}"><span class="sc-body"><span class="t">${esc(st.meta.title_fr)}</span><span class="t-zh" lang="zh-Hant">${esc(st.meta.title_zh)}</span></span><span class="lv">N${st.level.n}</span></a></li>`;
}
function seriesBlock(s, depth2 = true) {
  return `<div class="rp-set${depth2 ? ' rp-depth-2' : ''}" id="serie-${esc(s.id)}">
            <div class="rp-set-head">
              <span class="rp-thumb">${heroSvg(s, s.level, { w: 240, h: 160, big: false })}</span>
              <div><h4>${esc(s.fr)} <span class="zh-sub" lang="zh-Hant">${esc(s.zh)}</span> <span class="count">${s.stories.length} conversation${s.stories.length > 1 ? 's' : ''}</span></h4><p class="set-desc">${esc(s.desc)}</p></div>
            </div>
            <div class="story-list"><ul>
              ${s.stories.map(storyCard).join('\n              ')}
            </ul></div>
          </div>`;
}
function levelSection(lv) {
  const ss = seriesList.filter((s) => s.level.n === lv.n);
  const n = stories.filter((s) => s.level.n === lv.n).length;
  const first = ss[0];
  return `<section class="category-card rp-coll" id="niveau-${lv.n}">
        <div class="rp-coll-head">
          <span class="rp-coll-img">${first ? heroSvg({ id: 'lv' + lv.n, zh: ['', '初信', '蒙恩', '跟隨', '服事', '進深', '敬拜'][lv.n], fr: 'Niveau ' + lv.n }, lv, { w: 240, h: 160, big: false }) : ''}</span>
          <div><h2>Niveau ${lv.n} — ${lv.name} <span class="count">${n} conversations · ≈ ${lv.hsk}</span></h2>
          <p class="cat-desc">${esc(LEVEL_DESC[lv.n])} Conversations ${pad(lv.from)} à ${pad(lv.to)}, ${lv.min}–${lv.max} caractères.</p></div>
        </div>
        ${ss.map((s) => seriesBlock(s)).join('\n        ')}
      </section>`;
}
function levelRow(current) {
  return `<div class="rp-level-row">
          ${P.LEVELS.map((lv) => `<a href="niveau-${lv.n}.html"${current === lv.n ? ' class="current"' : ''}><strong>Niveau ${lv.n}</strong><span>${lv.name} · ${stories.filter((s) => s.level.n === lv.n).length}</span></a>`).join('\n          ')}
          <a class="rp-trad" href="vocabulaire.html"><strong>詞 Vocabulaire</strong><span>Tous les mots clés</span></a>
          <a class="rp-trad" href="chants.html"><strong>♪ Chants</strong><span>${new Set(stories.map((s) => s.meta.song)).size} chants</span></a>
        </div>`;
}

function indexPage() {
  const total = stories.length;
  const body = `<div class="container rp-page">
    <div class="rp-intro-wrap">
      <h1>Lecture en chinois traditionnel : ${total} conversations de louange avec pinyin</h1>
      <p class="rp-intro">Des conversations graduées pour apprendre le chinois <strong>et</strong> le vocabulaire de la foi chrétienne — prière, louange, Bible, théologie. Touchez n'importe quel mot pour voir son pinyin et sa définition en français : pas de dictionnaire à ouvrir, pas de copier-coller. Chaque conversation suit Luc, un étudiant français arrivé à Taipei, et s'inspire d'un chant de 讚美之泉 Stream of Praise.</p>
      <nav class="rp-bylevel" aria-label="Lire par niveau">
        <h2 class="rp-nav-title">Lire par niveau</h2>
        ${levelRow(0)}
        <p class="rp-test">Vous débutez ? <a href="${stories[0] ? stories[0].href : '#'}">Commencez par la conversation n° 1</a> — la difficulté monte doucement jusqu'à la n° 300. Les niveaux sont des estimations sur l'échelle HSK.</p>
        <p class="progress" id="progress" data-total="${total}"></p>
      </nav>
    </div>
    <nav class="rp-jump" aria-label="Niveaux">
      <span class="rp-jump-label">Aller au niveau :</span>
      ${P.LEVELS.map((lv) => `<a href="#niveau-${lv.n}">Niveau ${lv.n} · ${lv.name} <span>${stories.filter((s) => s.level.n === lv.n).length}</span></a>`).join('\n      ')}
    </nav>
    <p class="rp-explain">Chaque conversation a trois interrupteurs : afficher le <strong>pinyin</strong> au-dessus des caractères, afficher la <strong>traduction</strong> française sous chaque phrase, et passer du <strong>traditionnel</strong> au simplifié — vos réglages vous suivent d'une conversation à l'autre. Sous le texte : le chant associé et les mots clés à retenir.</p>
    <div class="rp-categories">
      ${P.LEVELS.map(levelSection).join('\n      ')}
    </div>
    <section class="cast" id="personnages">
      <h2>Les personnages</h2>
      <ul class="cast-list">
        ${CAST.map((c) => `<li><span class="cast-zh" lang="zh-Hant">${esc(c[0])}</span><span class="cast-py">${esc(c[1])}</span><strong>${esc(c[2])}</strong><span class="cast-desc">${esc(c[3])}</span></li>`).join('\n        ')}
      </ul>
      <p class="rp-explain small">Raccourcis clavier dans une conversation : <kbd>←</kbd> <kbd>→</kbd> conversation précédente / suivante, <kbd>P</kbd> pinyin, <kbd>T</kbd> traduction, <kbd>Échap</kbd> fermer la définition, <kbd>/</kbd> rechercher.</p>
    </section>
  </div>`;
  return page({ title: `Lecture en chinois traditionnel : ${total} conversations de louange avec pinyin et traduction | ${SITE_NAME}`, desc: 'Conversations graduées en chinois traditionnel pour apprendre le vocabulaire chrétien et théologique, avec pinyin et traduction française.', body });
}

function levelPage(lv) {
  const n = stories.filter((s) => s.level.n === lv.n).length;
  const body = `<div class="container rp-page">
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Accueil</a> › <a href="index.html">Lecture</a> › Niveau ${lv.n}</nav>
    <div class="rp-intro-wrap">
      <h1>Niveau ${lv.n} — ${lv.name} : ${n} conversations (≈ ${lv.hsk})</h1>
      <p class="rp-intro">${esc(LEVEL_DESC[lv.n])} Longueur : ${lv.min} à ${lv.max} caractères par conversation.</p>
      <nav class="rp-bylevel" aria-label="Lire par niveau">
        <h2 class="rp-nav-title">Lire par niveau</h2>
        ${levelRow(lv.n)}
      </nav>
    </div>
    <div class="rp-categories">${levelSection(lv)}</div>
  </div>`;
  return page({ title: `Niveau ${lv.n} (${lv.name}) : conversations chrétiennes en chinois traditionnel | ${SITE_NAME}`, desc: LEVEL_DESC[lv.n], body });
}

// Mots clés : première apparition, pinyin, zhuyin, exemple
const plainZh = (sen) => sen.segs.map((g) => (g.t === 'w' ? g.zh : g.text)).join('');
function collectVocab() {
  const seen = new Map();
  for (const st of stories) {
    for (const v of st.vocab) {
      if (seen.has(v.zh)) {
        seen.get(v.zh).also.push(st);
        continue;
      }
      let py = '';
      let zy = '';
      let ex = '';
      let exfr = '';
      for (const sen of st.sentences) {
        const g = sen.segs.find((x) => x.t === 'w' && x.zh === v.zh);
        if (g) {
          py = pyMarks(g.syl);
          zy = (g.syl || []).map(P.numToZhuyin).join(' ');
          ex = plainZh(sen);
          exfr = sen.fr;
          break;
        }
      }
      seen.set(v.zh, { zh: v.zh, py, zy, fr: v.fr || defOf(v.zh, '', null), st, also: [], ex, exfr });
    }
  }
  return seen;
}
const VOCAB = collectVocab();

function vocabPage() {
  const seen = VOCAB;
  const byLevel = P.LEVELS.map((lv) => {
    const items = [...seen.values()].filter((x) => x.st.level.n === lv.n);
    return `<section class="vocab-level" id="vocab-niveau-${lv.n}"><h2>Niveau ${lv.n} — ${lv.name} <span class="count">${items.length} mots</span></h2>
      <table class="vocab-table"><thead><tr><th>Mot</th><th>Pinyin</th><th>Définition</th><th>Vu dans</th></tr></thead><tbody>
      ${items.map((x) => `<tr data-search="${esc((x.zh + ' ' + x.py + ' ' + x.fr).toLowerCase())}"><td class="hz-cell" lang="zh-Hant">${esc(x.zh)}</td><td class="py-cell">${esc(x.py)}</td><td>${esc(x.fr)}</td><td><a href="${x.st.href}">n° ${pad(x.st.id)}</a>${x.also.length ? ` <span class="also">+${x.also.length}</span>` : ''}</td></tr>`).join('\n      ')}
      </tbody></table></section>`;
  }).join('\n');
  const body = `<div class="container rp-page">
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Accueil</a> › Vocabulaire</nav>
    <div class="rp-intro-wrap"><h1>Vocabulaire clé : ${seen.size} mots de la foi, du niveau 1 au niveau 6</h1>
    <p class="rp-intro">Les mots clés de chaque conversation, dans l'ordre où ils apparaissent. Cliquez sur le numéro pour relire la conversation où le mot est introduit. Pour les réviser : <a href="cartes.html">cartes de révision</a>, ou import dans Anki (fichiers texte séparés par des tabulations : mot, pinyin, zhuyin, définition, exemple, traduction, n°) : ${P.LEVELS.map((lv) => `<a href="anki/niveau-${lv.n}.txt" download>niveau ${lv.n}</a>`).join(' · ')} · <a href="anki/tout.txt" download>tout</a>.</p>
    <p><input type="search" id="vocab-filter" class="vocab-filter" placeholder="Filtrer : 恩典, en dian, grâce…" aria-label="Filtrer le vocabulaire"></p></div>
    ${byLevel}
  </div>`;
  return page({ title: `Vocabulaire chrétien en chinois traditionnel (${seen.size} mots) | ${SITE_NAME}`, desc: 'Liste des mots clés chrétiens et théologiques en chinois traditionnel, avec pinyin et définition française.', body });
}

function songsPage() {
  const bySong = new Map();
  for (const st of stories) {
    if (!bySong.has(st.meta.song)) bySong.set(st.meta.song, []);
    bySong.get(st.meta.song).push(st);
  }
  const body = `<div class="container rp-page">
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Accueil</a> › Chants</nav>
    <div class="rp-intro-wrap"><h1>Les ${bySong.size} chants de 讚美之泉 derrière les conversations</h1>
    <p class="rp-intro">Chaque conversation s'inspire du titre et du thème d'un chant de <a href="https://www.youtube.com/@streamofpraise/videos" target="_blank" rel="noopener">讚美之泉 Stream of Praise</a>. Les paroles ne sont pas reproduites : écoutez les chants sur YouTube, puis relisez la conversation.</p></div>
    <div class="story-list songs-list"><ul>
    ${[...bySong.entries()].map(([song, sts]) => `<li><div class="song-item"><span class="song-title" lang="zh-Hant">《${esc(song)}》</span><span class="song-links">${sts.map((st) => `<a href="${st.href}">n° ${pad(st.id)}</a>`).join(' ')} · <a href="${ytSearch(song)}" target="_blank" rel="noopener">YouTube ↗</a></span></div></li>`).join('\n    ')}
    </ul></div>
  </div>`;
  return page({ title: `Chants de 讚美之泉 Stream of Praise utilisés | ${SITE_NAME}`, desc: 'Les chants de louange qui inspirent chaque conversation.', body });
}

// ---------- grammaire ----------
const GRAMMAR = require('./lib/grammar');
function rubyLine(sen) {
  return sen.segs
    .map((g) => (g.t === 'w' ? `<ruby>${esc(g.zh)}<rt>${esc(pyMarks(g.syl))}</rt></ruby>` : esc(g.text)))
    .join('');
}
function grammarPage() {
  const blocks = P.LEVELS.map((lv) => {
    const pts = GRAMMAR.filter((g) => g.lv === lv.n).map((g) => {
      // exemples : phrases courtes de niveau proche, au plus 3, de conversations différentes
      const cands = [];
      for (const st of stories) {
        for (const sen of st.sentences) {
          const txt = plainZh(sen);
          if (g.re.test(txt)) cands.push({ st, sen, len: txt.length, dist: Math.abs(st.level.n - g.lv) + (st.level.n < g.lv ? 0.5 : 0) });
        }
      }
      cands.sort((a, b) => a.dist - b.dist || Math.abs(a.len - 24) - Math.abs(b.len - 24));
      const picked = [];
      const used = new Set();
      for (const c of cands) {
        if (used.has(c.st.id) || c.len > 70) continue;
        picked.push(c);
        used.add(c.st.id);
        if (picked.length === 3) break;
      }
      const total = cands.length;
      return `<article class="gram-point" id="g-${g.id}">
        <h3><span class="gram-zh" lang="zh-Hant">${esc(g.zh)}</span> <span class="gram-fr">${esc(g.fr)}</span></h3>
        <p class="gram-struct">${esc(g.struct)}</p>
        <p class="gram-expl">${esc(g.expl)}</p>
        ${picked.length ? `<ul class="gram-ex">${picked.map((c) => `<li><span class="gx-zh" lang="zh-Hant">${rubyLine(c.sen)}</span><span class="gx-fr">${esc(c.sen.fr)}</span><a class="gx-link" href="${c.st.href}">n° ${pad(c.st.id)} · ${esc(c.st.meta.title_fr)}</a></li>`).join('')}</ul>` : ''}
        ${total ? `<p class="gram-count">Rencontré ${total} fois dans les conversations.</p>` : ''}
      </article>`;
    });
    return `<section class="category-card gram-level" id="grammaire-niveau-${lv.n}"><h2>Niveau ${lv.n} — ${lv.name} <span class="count">${pts.length} points</span></h2>${pts.join('\n')}</section>`;
  }).join('\n');
  const body = `<div class="container rp-page">
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Accueil</a> › Grammaire</nav>
    <div class="rp-intro-wrap"><h1>Grammaire : ${GRAMMAR.length} structures, avec des exemples tirés des conversations</h1>
    <p class="rp-intro">Les structures à connaître à chaque niveau, expliquées en une phrase, puis illustrées par de vraies phrases des conversations (pinyin au-dessus, traduction dessous). Cliquez sur un exemple pour le relire dans son contexte.</p>
    <p class="gram-toggle"><label><input type="checkbox" id="gram-py" checked> Afficher le pinyin</label></p></div>
    <nav class="rp-jump" aria-label="Niveaux">${P.LEVELS.map((lv) => `<a href="#grammaire-niveau-${lv.n}">Niveau ${lv.n}</a>`).join('')}</nav>
    <div class="rp-categories gram-list">${blocks}</div>
  </div>`;
  return page({ title: `Grammaire chinoise en contexte chrétien : ${GRAMMAR.length} structures | ${SITE_NAME}`, desc: 'Structures grammaticales du chinois, niveau par niveau, illustrées par les conversations.', body });
}

// ---------- cartes de révision ----------
function cardsPage() {
  const body = `<div class="container rp-page">
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Accueil</a> › Cartes</nav>
    <div class="rp-intro-wrap"><h1>Cartes de révision</h1>
    <p class="rp-intro">Révisez les mots clés de chaque niveau ou les mots que vous avez enregistrés en lisant (bouton « ＋ Carte » dans la définition). Répétition espacée : un mot bien connu revient de plus en plus tard. Votre progression reste dans ce navigateur.</p></div>
    <div class="cards-app" id="cards-app">
      <div class="deck-row" id="deck-row" role="group" aria-label="Paquet"></div>
      <div class="deck-stats" id="deck-stats"></div>
      <div class="flashcard" id="flashcard" hidden>
        <div class="fc-front"><span class="fc-hz" lang="zh-Hant" id="fc-hz"></span></div>
        <div class="fc-back" id="fc-back" hidden>
          <div class="fc-py" id="fc-py"></div>
          <div class="fc-zy" id="fc-zy" lang="zh-Hant"></div>
          <div class="fc-def" id="fc-def"></div>
          <div class="fc-ex"><span lang="zh-Hant" id="fc-ex"></span><span class="fc-exfr" id="fc-exfr"></span><a id="fc-link" href="#">Relire la conversation</a></div>
        </div>
        <div class="fc-actions">
          <button type="button" class="fc-btn fc-show" id="fc-show">Afficher la réponse</button>
          <button type="button" class="fc-btn fc-again" id="fc-again" hidden>À revoir</button>
          <button type="button" class="fc-btn fc-good" id="fc-good" hidden>Je savais</button>
          <button type="button" class="fc-btn fc-easy" id="fc-easy" hidden>Facile</button>
          <button type="button" class="def-audio" id="fc-audio" aria-label="Écouter">🔊</button>
        </div>
      </div>
      <div class="cards-done" id="cards-done" hidden></div>
      <p class="cards-export"><button type="button" class="fc-btn" id="cards-export">Exporter ce paquet pour Anki (.txt)</button> <button type="button" class="fc-btn fc-ghost" id="cards-reset">Remettre ce paquet à zéro</button></p>
    </div>
  </div>
  <script src="assets/vocab-data.js"></script>
  <script src="assets/cards.js"></script>`;
  return page({ title: `Cartes de révision du vocabulaire chrétien | ${SITE_NAME}`, desc: 'Révision espacée des mots clés en chinois traditionnel.', body });
}

// ---------- génération ----------
fs.rmSync(path.join(OUT, STORY_DIR), { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
stories.forEach((st, i) => write(`${STORY_DIR}/${st.slug}.html`, storyPage(st, i)));
write('index.html', indexPage());
P.LEVELS.forEach((lv) => write(`niveau-${lv.n}.html`, levelPage(lv)));
write('vocabulaire.html', vocabPage());
write('chants.html', songsPage());
write('grammaire.html', grammarPage());
write('cartes.html', cardsPage());

// données des cartes et index de recherche
const vocabArr = [...VOCAB.values()].map((x) => ({ zh: x.zh, s: t2c(x.zh), py: x.py, zy: x.zy, fr: x.fr, id: x.st.id, lv: x.st.level.n, href: x.st.href, ex: x.ex, exfr: x.exfr }));
write('assets/vocab-data.js', 'window.LL_VOCAB=' + JSON.stringify(vocabArr) + ';\n');
const searchIdx = {
  s: stories.map((st) => ({ id: st.id, lv: st.level.n, t: st.meta.title_fr, z: st.meta.title_zh, g: st.meta.tagline, se: st.series.fr, so: st.meta.song, h: st.href, x: st.sentences.map(plainZh).join(''), p: [...new Set(st.sentences.flatMap((sen) => sen.segs.filter((g) => g.t === 'w').map((g) => (g.syl || []).join('').replace(/[1-5]/g, ''))))].join(' ') })),
  v: vocabArr.map((v) => ({ zh: v.zh, py: v.py, fr: v.fr, id: v.id, h: v.href })),
};
write('assets/search-index.js', 'window.LL_SEARCH=' + JSON.stringify(searchIdx) + ';\n');
// export Anki (TSV)
const ankiLine = (v) => [v.zh, v.py, v.zy, v.fr, v.ex, v.exfr, 'n° ' + pad(v.id)].map((x) => String(x || '').replace(/[\t\n]/g, ' ')).join('\t');
fs.rmSync(path.join(OUT, 'anki'), { recursive: true, force: true });
P.LEVELS.forEach((lv) => write(`anki/niveau-${lv.n}.txt`, vocabArr.filter((v) => v.lv === lv.n).map(ankiLine).join('\n') + '\n'));
write('anki/tout.txt', vocabArr.map(ankiLine).join('\n') + '\n');
// copie des fichiers statiques
const ASSETS = path.join(ROOT, 'src', 'assets');
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
for (const f of fs.readdirSync(ASSETS)) fs.copyFileSync(path.join(ASSETS, f), path.join(OUT, 'assets', f));

// mots sans définition (pour le glossaire)
fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
const miss = [...missingDefs.entries()].sort((a, b) => b[1] - a[1]);
fs.writeFileSync(path.join(ROOT, 'data', 'mots_sans_definition.tsv'), miss.map(([k, n]) => k + '\t' + n).join('\n') + '\n', 'utf8');
console.log(`${stories.length} conversations, ${seriesList.length} séries, ${glossary.size ? glossary.size + ' entrées de glossaire' : 'pas de glossaire'}, ${miss.length} mots sans définition.`);
console.log('Site généré dans ' + OUT);
