/* IA-2 dependency-free local tests. Run: node tests/ia2-registry.test.cjs
 * No GitHub Actions required by LOCAL_FIRST governance.
 * Based on the actual HTML draft and the repository's round70-catalog.js. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const rootDir = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(rootDir, file), 'utf8');

function extractDraft(s) {
  const marker = 'const NX=', pos = s.indexOf(marker);
  assert.ok(pos >= 0, 'Main HTML must contain the 74 draft');
  const start = s.indexOf('{', pos);
  let depth = 0, quoted = false, escaped = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === '"') quoted = false;
    } else if (c === '"') quoted = true;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return JSON.parse(s.slice(start,i + 1));
  }
  throw new Error('Malformed NX draft data');
}
const html = read('index.html');
const nx = extractDraft(html);
const win = {};
const controls = {};
const fieldIDs=['ia2Group','ia2Grade','ia2Search','ia2Source','ia2Status','ia2Stage',
  'ia2List','ia2Count','ia2Empty','ia2Export','ia2Reset','ia2Expand','ia2Stats'];
for (const id of fieldIDs) controls[id] = {
  value: id === 'ia2Search' ? '' : 'all',innerHTML:'',textContent:'',hidden:false,disabled:false,
  events:{},addEventListener(type,fn){this.events[type]=fn},
  trigger(type){this.events[type]?.()},focus(){this.focused=true}
};
const fakeRoot={dataset:{},querySelector:query=>controls[query.slice(1)]};
const fakeDoc={
  getElementById:id=>id === 'ia2Root' ? fakeRoot : null,
  body:{appendChild(){}},
  createElement(){return {click(){},remove(){}}}
};
const downloads=[];
class FakeBlob {
  constructor(parts,opts){downloads.push({data:parts.join(''),type:opts.type})}
}
const context={window:win,document:fakeDoc,Blob:FakeBlob,
  URL:{createObjectURL(){return 'blob:local-test'},revokeObjectURL(){}},
  setTimeout(){},console};
vm.runInNewContext(read('round70-catalog.js'),context,{filename:'round70-catalog.js'});
vm.runInNewContext(read('ia2-registry.js'),context,{filename:'ia2-registry.js'});
const api=win.SILLAPA_IA2;
assert.ok(api && api.buildRegistry && api.filteredFamilies && api.exportRows && api.mount);
const families=api.buildRegistry(nx.groups,win.SILLAPA70_CATALOG);
const bySource=cycle=>families.filter(x=>x.historyCycle === cycle);
assert.equal(families.length,56,'56 draft activity families');
assert.equal(new Set(families.map(x=>x.key)).size,56,'unique temporary family keys');
assert.equal(bySource('70').length,25,'25 historically mapped round-70 families');
assert.equal(bySource('73').length,29,'29 historically mapped round-73 families');
assert.equal(bySource('unresolved').length,2,'two unmatched families');
assert.equal(bySource('70').reduce((n,x)=>n+x.events.length,0),63,'all 63 historical 70 grade variants');
const old70=bySource('70').flatMap(f=>f.events);
assert.equal(new Set(old70.map(e=>e.sourceId)).size,63,'no duplicate round-70 source ids');
assert.equal(bySource('73').reduce((n,x)=>n+x.events.length,0),83,'all 83 historical 73 title variants');
assert.equal(bySource('unresolved').map(x=>x.draftTitle).join('|'),'กลุ่มนาฏศิลป์|กลุ่ม Soft Power');
assert.equal(families.every(x=>x.draft74Status==='draft'&&x.official74ActivityId===null&&
  x.approvedStage74===null&&x.mappingApproved74===false),true,'no invented 74 approvals');
const handwriting=families.find(x=>x.draftTitle==='คัดลายมือสื่อภาษาไทย');
assert.equal(handwriting.events.map(x=>x.sourceId).join(','),'030,031,032');
assert.equal(handwriting.events.map(x=>x.grade).join(','),'ป.1-ป.3,ป.4-ป.6,ม.1-ม.3');
const scouts=families.find(x=>x.draftTitle==='กิจกรรมลูกเสือ เนตรนารี ยุวกาชาด ผู้บำเพ็ญประโยชน์');
assert.equal(scouts.events.length,8,'the source's 8 separate scout/youth-red-cross events');
assert.equal(api.filteredFamilies(families,{source:'70'}).length,25);
assert.equal(api.filteredFamilies(families,{source:'73'}).length,29);
assert.equal(api.filteredFamilies(families,{source:'unresolved'}).length,2);
assert.equal(api.filteredFamilies(families,{query:'030'}).length,1);
assert.equal(api.filteredFamilies(families,{grade:'ป.1-ป.3',source:'70'}).length,12);
assert.equal(api.filteredFamilies(families,{status:'confirmed'}).length,0);
assert.equal(api.filteredFamilies(families,{stage:'district'}).length,0);
assert.equal(api.filteredFamilies(families,{stage:'cluster'}).length,0);
assert.equal(api.filteredFamilies(families,{stage:'unknown'}).length,56);
const rows=api.exportRows(families);
assert.equal(rows.length,149,'148 historical/placeholder rows + header');
assert.ok(rows.every(x=>x.length===15),'stable 15-column CSV');
assert.ok(rows.slice(1).every(x=>x[4]===''&&x[5]==='ยังไม่ประกาศ'),'do not export fake 74 IDs or stages');
assert.ok(rows.slice(1).every(x=>x[3]==='ร่าง — ยังไม่ยืนยัน'),'drafts clearly marked');

const page=api.mount({draftGroups:nx.groups,round70:win.SILLAPA70_CATALOG});
assert.equal(page.ok,true);
assert.equal(fakeRoot.dataset.ready,'true');
assert.match(controls.ia2Count.textContent,/พบ 56/);
controls.ia2Source.value='70';controls.ia2Source.trigger('change');
assert.match(controls.ia2Count.textContent,/พบ 25/);
controls.ia2Search.value='030';controls.ia2Search.trigger('input');
assert.match(controls.ia2Count.textContent,/พบ 1/);
assert.match(controls.ia2List.innerHTML,/030/);
assert.doesNotMatch(controls.ia2List.innerHTML,/031/);
controls.ia2Search.value='';
controls.ia2Grade.value='ป.1-ป.3';controls.ia2Grade.trigger('change');
assert.match(controls.ia2Count.textContent,/พบ 12/);
assert.doesNotMatch(controls.ia2List.innerHTML,/<span class="ia2-child-grade">ม.1-ม.3<\/span>/);
controls.ia2Export.trigger('click');
assert.equal(downloads.length,1);
assert.ok(downloads[0].data.startsWith('\ufeff'));
assert.ok(downloads[0].data.includes('030'));
assert.ok(!downloads[0].data.includes('"031"'));
controls.ia2Status.value='confirmed';controls.ia2Status.trigger('change');
assert.match(controls.ia2Count.textContent,/พบ 0/);
assert.equal(controls.ia2Export.disabled,true);
assert.equal(controls.ia2Empty.hidden,false);
controls.ia2Reset.trigger('click');
assert.match(controls.ia2Count.textContent,/พบ 56/);
assert.equal(controls.ia2Grade.value,'all');
assert.equal(controls.ia2Status.value,'all');
assert.equal(controls.ia2Search.value,'');
controls.ia2Expand.trigger('click');
assert.equal(controls.ia2Expand.textContent,'ย่อรายการย่อยทั้งหมด');
assert.match(controls.ia2List.innerHTML,/data-key="draft-F01-A01" open/);
console.log('PASS IA-2 local contract + mount test: 56 families, 63 round-70 variants,');
console.log('     29 round-73 families, 2 unresolved, filtering, child rows, CSV, resets and expansions.');
