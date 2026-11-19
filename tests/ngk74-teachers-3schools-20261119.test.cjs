'use strict';
// Local-first public-roster regression for NGK74-TEACHERS-3S-20261119.
// Run: node tests/ngk74-teachers-3schools-20261119.test.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const directory=fs.readFileSync(path.join(root,'teacher-directory.html'),'utf8');
const list=fs.readFileSync(path.join(root,'teacher-verified-list.html'),'utf8');
const verification=fs.readFileSync(path.join(root,'teacher-verification.html'),'utf8');
function extract(name){
  const re=new RegExp('const '+name+'=(\\[[\\s\\S]*?\\]);');
  const m=directory.match(re);assert(m,'Cannot find '+name);return JSON.parse(m[1]);
}
const baseline=extract('approvedTeachers');
const additional=extract('coordinatorApproved20261119');
assert.equal(baseline.length,45,'keep existing snapshot');
assert.equal(additional.length,30,'30 scoped confirmed staff');
const totals=additional.reduce((m,item)=>(m.set(item.school,(m.get(item.school)||0)+1),m),new Map());
assert.deepEqual([...totals.entries()],[
  ['บ้านหนองกุ่ม',9],
  ['บ้านเสาหงส์',8],
  ['วัดทุ่งมะสัง',13]
]);
const all=[...baseline,...additional];
assert.equal(all.length,75);
assert.equal(new Set(all.map(x=>x.school+'|'+x.name.replace(/\\s+/g,''))).size,75,'no duplicate roster person within school');
for(const row of additional){
  assert(row.name&&row.school);
  assert(row.major||row.subject,'source-grounded subject or major');
  for(const key of Object.keys(row))assert(['name','school','subject','major','source'].includes(key),'no private properties');
}
assert(directory.includes('const publishedTeachers=approvedTeachers.concat(coordinatorApproved20261119)'));
assert(directory.includes('const matches=publishedTeachers.filter('));
assert(directory.includes('<strong>75</strong><span>รายชื่อที่แสดงบนเว็บ</span>'));
assert(list.includes('รายชื่อที่แสดงบนเว็บ <strong>75</strong>'));
assert(verification.includes('แสดง 75 รายชื่อ'));
assert(verification.includes('ครู'));
assert(!JSON.stringify(additional).includes('T-0000'));
console.log('PASS NGK74 teachers 3-school roster: 45 baseline + 30 new = 75; 9/8/13, scoped fields and synchronized pages');
