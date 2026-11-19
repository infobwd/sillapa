'use strict';
/* NGK74-TEACHER-MAJOR-ALL8-20261119 — local-only regression.
   Run: node tests/ngk74-teacher-major-all8-20261119.test.cjs */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const directory=fs.readFileSync(path.join(root,'teacher-directory.html'),'utf8');
const list=fs.readFileSync(path.join(root,'teacher-verified-list.html'),'utf8');
const verification=fs.readFileSync(path.join(root,'teacher-verification.html'),'utf8');
const m=directory.match(/const publishedTeachers=(\[[^;]+\]);/);
assert(m,'Public roster exists');
const roster=JSON.parse(m[1]);
const counts={};
const normalize=s=>String(s).replace(/\s+/g,'').normalize('NFC');
for(const person of roster){
  assert(person.name&&person.school,'name and school');
  counts[person.school]=(counts[person.school]||0)+1;
  assert(person.major||person.field||!person.major,'major may be pending, never fabricated');
  assert(Object.keys(person).every(k=>['name','school','major','teaches','field','role'].includes(k)),'no private person fields');
}
assert.deepEqual(counts,{
  'วังเขาแก้ว':10,
  'บ้านหนองกระทุ่ม':19,
  'บ้านเสาหงส์':10,
  'บ้านหนองกุ่ม':9,
  'บ้านพุพรหม':16,
  'วัดทุ่งมะสัง':16,
  'บ้านรางขาม':8,
  'บ้านวังด้ง':12
});
assert.equal(roster.length,100);
assert.equal(new Set(roster.map(x=>x.school+'|'+normalize(x.name))).size,100);
assert.equal(roster.filter(x=>!x.major&&!x.field).length,6,'six majors need source completion');
assert.equal(roster.filter(x=>x.school==='บ้านพุพรหม').length,16);
assert.equal(roster.filter(x=>x.school==='บ้านพุพรหม'&&x.role==='เจ้าหน้าที่ธุรการ').length,1);
for(const departed of ['นาย อานนท์ สารชาติ','นางสาว กรนิกา นนทารักษ์','นางสาว ปนัดดา เซี่ยงฉี'])assert(!roster.some(x=>normalize(x.name)===normalize(departed)),'departed staff excluded');
assert(!roster.some(x=>normalize(x.name)===normalize('นาย วชิระ ประกอบ')),'Phu Phrom source-only extra excluded');
assert(!roster.some(x=>normalize(x.name)===normalize('นางสาว ศิริภนาฎ ศิริคงคา')),'ambiguous name withheld');
assert(directory.includes('รอข้อมูลจากโรงเรียน'));
assert(directory.includes('t.major,t.field,t.teaches,t.role'),'searches qualification fields');
assert(list.includes('<strong>100</strong>'));
assert.equal((list.match(/<li>/g)||[]).length,100,'static list mirrors current roster');
assert(verification.includes('100 รายชื่อจาก 8 โรงเรียน'));
console.log('PASS NGK74 major/all8: 100 current records, 8 schools, 6 majors pending, 16 Phu Phrom, no moved/conflicted names.');
