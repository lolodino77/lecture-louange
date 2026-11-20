#!/usr/bin/env node
// Liste les mots écrits avec plusieurs pinyin dans le corpus (pour repérer ce qu'il reste à harmoniser).
const CONTENT = require('path').join(__dirname, '..', 'content');
const fs = require('fs');
const m=new Map();
for(const f of fs.readdirSync(CONTENT).filter(x=>x.endsWith('.txt'))){
  for(const l of fs.readFileSync(CONTENT+'/'+f,'utf8').split('\n')){
    if(l.startsWith('= ')||l.startsWith('#')||l.startsWith('@')||/^[a-z_]+:/.test(l)||l.startsWith('===')||l==='---')continue;
    const re=/([\u4e00-\u9fff]+)\/([a-z0-9]+)/g;let x;
    while((x=re.exec(l))){ const k=x[1]; if(!m.has(k))m.set(k,new Map()); const mm=m.get(k); mm.set(x[2],(mm.get(x[2])||0)+1);}
  }
}
const out=[];
for(const [w,mm] of m){ if(mm.size>1){ out.push([w,[...mm].sort((a,b)=>b[1]-a[1]).map(([p,c])=>p+'×'+c).join(' · ')]); } }
out.sort((a,b)=>a[0].localeCompare(b[0]));
console.log(out.length);
for(const [w,v] of out) console.log(w+'  '+v);
