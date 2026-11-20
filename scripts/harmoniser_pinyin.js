#!/usr/bin/env node
// Harmonise le pinyin du corpus sur la norme de Taïwan (voir docs/GUIDE_REDACTION.md) : ü→v, pas de sandhi pour 一/不, lectures de caractère et mots arbitrés.
// Usage : node scripts/harmoniser_pinyin.js   (modifie content/*.txt en place ; à relancer après chaque nouvelle tranche)
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'content');

// 1) lectures de Taïwan, au niveau du caractère (liste de docs/ETAT_DES_LIEUX.md)
const CHAR = { 微: 'wei2', 期: 'qi2', 突: 'tu2', 識: 'shi4', 息: 'xi2', 蹟: 'ji1', 髮: 'fa3', 跌: 'die2' };

// 2) mots à variantes : forme retenue (majoritaire dans le corpus, ou lecture 教育部 quand les deux se valent)
const WORD = {
  名字: 'ming2zi5', 告訴: 'gao4su4', 喜歡: 'xi3huan5', 地方: 'di4fang1', 弟兄: 'di4xiong1', 朋友: 'peng2you5',
  故事: 'gu4shi5', 早上: 'zao3shang4', 明白: 'ming2bai5', 清楚: 'qing1chu5', 眼睛: 'yan3jing1', 知道: 'zhi1dao4',
  窗戶: 'chuang1hu5', 衣服: 'yi1fu5', 舒服: 'shu1fu5', 木頭: 'mu4tou5', 浪子: 'lang4zi3', 漂亮: 'piao4liang5',
  頭上: 'tou2shang5', 沒關係: 'mei2guan1xi5', 關係: 'guan1xi5', 對不起: 'dui4bu4qi3', 小時候: 'xiao3shi2hou5',
  有時候: 'you3shi2hou5', 厲害: 'li4hai4', 可惜: 'ke3xi1', 同工: 'tong2gong1', 事情: 'shi4qing5', 免得: 'mian3de5',
  在乎: 'zai4hu1', 多少: 'duo1shao3', 招呼: 'zhao1hu1', 星星: 'xing1xing1', 部分: 'bu4fen4', 脾氣: 'pi2qi4',
  想想: 'xiang3xiang3', 種子: 'zhong3zi5', 葡萄: 'pu2tao2', 葡萄樹: 'pu2tao2shu4', 差點: 'cha4dian3',
  看不見: 'kan4bu4jian4', 看得見: 'kan4de5jian4', 降服: 'xiang2fu2', 哎呀: 'ai1ya1', 背包: 'bei1bao1',
  女孩: 'nv3hai2', 女生: 'nv3sheng1',
};

const SYL = /[a-z]+[1-5]/g;
let nChanged = 0;

function fixToken(zh, py) {
  const chars = [...zh];
  const syl = py.replace(/ü/g, 'v').match(SYL);
  if (!syl || syl.join('') !== py.replace(/ü/g, 'v') || syl.length !== chars.length) return py.replace(/ü/g, 'v');
  // mot entier
  if (WORD[zh]) return WORD[zh];
  chars.forEach((c, i) => {
    if (c === '一' && /^yi[24]$/.test(syl[i])) syl[i] = 'yi1';
    if (c === '不' && syl[i] === 'bu2') syl[i] = 'bu4';
    if (CHAR[c]) syl[i] = CHAR[c];
  });
  return syl.join('');
}

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.txt'))) {
  const p = path.join(dir, f);
  const t = fs.readFileSync(p, 'utf8');
  const out = t
    .split('\n')
    .map((l) => {
      if (l.startsWith('= ') || l.startsWith('#') || l.startsWith('@') || /^[a-z_]+:/.test(l) || l.startsWith('===') || l === '---' || !/\//.test(l)) return l;
      return l.replace(/([一-鿿]+)\/([a-zü0-9]+)/g, (m, zh, py) => {
        const np = fixToken(zh, py);
        if (np !== py) nChanged++;
        return zh + '/' + np;
      });
    })
    .join('\n');
  if (out !== t) fs.writeFileSync(p, out);
}
console.log('tokens modifiés :', nChanged);
