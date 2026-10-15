'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const html=read('index.html');
const css=read('ia1.css');
const sw=read('sw.js');
const readme=read('README.md');
const roadmap=read('docs/SILLAPA74_INFORMATION_ARCHITECTURE_ROADMAP.md');
const between=(start,end)=>{
  const a=html.indexOf(start),b=html.indexOf(end,a+start.length);
  assert.ok(a!==-1&&b>a,'expected HTML section '+start);
  return html.slice(a,b);
};
const home=between('id="v-overview"','<!-- Representatives -->');
const archive=between('id="v-archive"','<footer aria-label=');
assert.ok(home.indexOf('ia-stat-grid')<home.indexOf('ia-history-glance'),'74 planning KPIs precede 73 summary');
assert.ok(home.includes('ia-action-list'),'74 preparation actions preserved');
assert.ok(!home.includes('id="tiles"'),'73 shortcut menu is not on the homepage');
assert.equal((html.match(/id="tiles"/g)||[]).length,1,'a single historic shortcuts mount remains');
assert.ok(archive.includes('id="tiles"'),'shortcuts now render within #archive');
assert.ok(archive.includes('data-go="next"'),'70 references remain accessible in the archive');
assert.ok(home.includes('id="iaHistoricalCharts"'),'historic charts have a native details disclosure');
assert.ok(home.indexOf('id="iaHistoricalCharts"')<home.indexOf('id="kpis"'));
assert.ok(home.includes('id="wall"')&&home.includes('id="topSchools"')&&home.includes('id="topCats"'),'73 charts remain in DOM');
for(const id of ['iaHistoryWorks','iaHistorySchools','iaHistoryActs']){
  assert.ok(home.includes('id="'+id+'"'),'compact historical metric mount: '+id);
  assert.ok(html.includes("$('#"+id+"').textContent="),'compact historical metric uses filtered real 73 records');
}
assert.match(html,/const TKEYS=\['reps','groups','schools','acts','judges','export'\]/,'all six archive shortcuts retained');
assert.match(html,/judges:'archive',executive:'overview'/,'historical judges active navigation maps to archive');
assert.match(html,/data-go="judges"><b>กรรมการครั้งที่ 73/,'historic judges discoverable from More');
assert.match(html,/data-go="archive"><b>🗂️ คลังข้อมูลย้อนหลัง/,'archive discoverable from More');
for(const id of ['reps','groups','schools','acts','judges','next','prep','readiness','venue','executive']){
  assert.ok(html.includes("['"+id+"',")||html.includes("['"+id+"',")||html.includes("id=\"v-"+id+"\""),'legacy route preserved: '+id);
}
assert.match(html,/\['overview','ภาพรวม'/);
assert.match(html,/\['next','รายการ 74'/);
assert.match(html,/\['prep','โรงเรียน'/);
assert.ok(html.includes("id=\"navMore\""),'More navigation retained');
assert.match(css,/#v-archive \.ia-archive-shortcuts/);
assert.match(css,/env\(safe-area-inset-bottom,0px\) \+ 48px/,'extra clearance beneath fixed nav');
assert.match(css,/prefers-reduced-motion:reduce/);
assert.match(sw,/sillapa-public-v11-ia6-20261015/,'versioned PWA cache for changed shell');
assert.ok(sw.includes("'./index.html'")&&sw.includes("'./ia1.css'"),'changed UI assets in the cache');
assert.ok(readme.includes('งานที่ยังเหลือ')&&readme.includes('PR #13 Merge แล้ว'));
assert.ok(roadmap.includes('Delivery reconciliation and next gates'));
console.log('PASS navigation-archive-ux: 74-first homepage, 6 archived shortcuts, legacy views, More, safe area, documentation and SW');
