#!/usr/bin/env node
// Extrait tous les mots (mot + pinyin) des conversations, avec un exemple, pour rédiger le glossaire.
// Usage : node scripts/extract_words.js [nombre_de_lots]
//  -> data/a_definir/lot-01.tsv … (seulement les mots absents de data/glossaire.tsv)
'use strict';
const fs = require('fs');
const path = require('path');
const P = require('./lib/parse');

const ROOT = path.join(__dirname, '..');
const nLots = parseInt(process.argv[2] || '5', 10);
const data = P.loadAll(path.join(ROOT, 'content'));

const known = new Set();
const gf = path.join(ROOT, 'data', 'glossaire.tsv');
if (fs.existsSync(gf)) {
  for (const l of fs.readFileSync(gf, 'utf8').split(/\r?\n/)) {
    const [zh, py] = l.split('\t');
    if (zh && py) known.add(zh + '|' + py);
  }
}

const words = new Map();
for (const st of data.stories) {
  for (const sen of st.sentences) {
    const zhText = sen.segs.map((g) => (g.t === 'w' ? g.zh : g.text)).join('');
    for (const g of sen.segs) {
      if (g.t !== 'w' || !g.syl) continue;
      const py = g.syl.join('');
      const k = g.zh + '|' + py;
      if (known.has(k)) continue;
      if (!words.has(k)) words.set(k, { zh: g.zh, py, marks: g.syl.map(P.numToMark).join(' '), n: 0, ex: zhText, fr: sen.fr, first: st.id });
      words.get(k).n++;
    }
  }
}
const list = [...words.values()].sort((a, b) => a.first - b.first || b.n - a.n);
const outDir = path.join(ROOT, 'data', 'a_definir');
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
const size = Math.ceil(list.length / nLots);
for (let i = 0; i < nLots; i++) {
  const chunk = list.slice(i * size, (i + 1) * size);
  if (!chunk.length) continue;
  const lines = ['# mot\tpinyin_num\tpinyin\toccurrences\texemple\ttraduction_exemple'];
  for (const w of chunk) lines.push([w.zh, w.py, w.marks, w.n, w.ex, w.fr].join('\t'));
  fs.writeFileSync(path.join(outDir, `lot-${String(i + 1).padStart(2, '0')}.tsv`), lines.join('\n') + '\n', 'utf8');
}
console.log(`${list.length} mots à définir, répartis en ${Math.min(nLots, Math.ceil(list.length / size))} lots dans data/a_definir/.`);
