#!/usr/bin/env node
// Met à jour le bloc automatique de docs/ETAT_DES_LIEUX.md (avancement par tranche,
// conversations manquantes, résultat de la validation) à partir de content/*.txt.
// Usage : node scripts/etat.js   (ou npm run etat)
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const P = require('./lib/parse');

const ROOT = path.join(__dirname, '..');
const DOC = path.join(ROOT, 'docs', 'ETAT_DES_LIEUX.md');
const START = '<!-- ETAT:DEBUT (bloc généré par npm run etat, ne pas modifier à la main) -->';
const END = '<!-- ETAT:FIN -->';
const pad = (n) => String(n).padStart(3, '0');

const data = P.loadAll(path.join(ROOT, 'content'));
const byId = new Map(data.stories.map((s) => [Number(s.id), s]));
const seriesById = new Map(data.series.map((s) => [s.id, s]));

// avancement par tranche de 10
const rows = [];
for (let a = 1; a <= 300; a += 10) {
  const ids = [];
  for (let i = a; i < a + 10; i++) if (byId.has(i)) ids.push(i);
  const series = [...new Set(ids.map((i) => byId.get(i).meta.series))].map((id) => (seriesById.get(id) || {}).fr || id);
  const state =
    ids.length === 10 ? '✅ 10/10' : ids.length === 0 ? '⏳ 0/10' : `🔄 ${ids.length}/10 (${ids.map(pad).join(', ')})`;
  rows.push(`| ${pad(a)}–${pad(a + 9)} | ${P.levelOf(a).n} | ${state} | ${series.join(' · ') || '—'} |`);
}

// par niveau
const perLevel = P.LEVELS.map((lv) => {
  let n = 0;
  for (let i = lv.from; i <= lv.to; i++) if (byId.has(i)) n++;
  return `| ${lv.n} | ${pad(lv.from)}–${pad(lv.to)} | ${n} / ${lv.to - lv.from + 1} |`;
});

// plages manquantes
const ranges = [];
for (let i = 1; i <= 300; i++) {
  if (byId.has(i)) continue;
  const r = ranges[ranges.length - 1];
  if (r && r[1] === i - 1) r[1] = i;
  else ranges.push([i, i]);
}
const missing = ranges.reduce((t, [a, b]) => t + b - a + 1, 0);

// validation
let validation;
try {
  validation = execFileSync(process.execPath, [path.join(__dirname, 'validate.js'), '--all', '--quiet'], { encoding: 'utf8' });
} catch (e) {
  validation = String(e.stdout || '');
}
const vLine = validation.trim().split(/\r?\n/).pop() || '(validation non disponible)';

const now = new Date();
const stamp = now.toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Paris' });
const block = [
  START,
  `_Généré le ${stamp}._`,
  '',
  `**${data.stories.length} / 300 conversations rédigées** (${Math.round((data.stories.length / 300) * 100)} %), ` +
    `${data.series.length} séries déclarées. Validation : ${vLine}`,
  '',
  '| Niveau | Numéros | Rédigées |',
  '|---|---|---|',
  ...perLevel,
  '',
  '| Tranche | Niveau | État | Séries |',
  '|---|---|---|---|',
  ...rows,
  '',
  `**Manquantes (${missing})** : ` +
    (ranges.map(([a, b]) => (a === b ? pad(a) : `${pad(a)}–${pad(b)}`) + ` (${b - a + 1})`).join(', ') || 'aucune') +
    '.',
  END,
].join('\n');

let doc = fs.readFileSync(DOC, 'utf8');
const i = doc.indexOf(START);
const j = doc.indexOf(END);
if (i < 0 || j < 0) {
  console.error(`Marqueurs introuvables dans ${path.relative(ROOT, DOC)}.`);
  process.exit(1);
}
doc = doc.slice(0, i) + block + doc.slice(j + END.length);
fs.writeFileSync(DOC, doc, 'utf8');
console.log(`${path.relative(ROOT, DOC)} mis à jour : ${data.stories.length}/300 conversations, ${missing} manquantes.`);
