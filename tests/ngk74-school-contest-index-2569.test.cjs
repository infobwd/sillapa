'use strict';
/* NGK74-SCHOOL-JSON-2569-20261120 — public privacy and school-activity consistency.
 * Local-first: node tests/ngk74-school-contest-index-2569.test.cjs
 * This test DOES NOT read or require private student records. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const p=path.join(__dirname,'..','data','nongkum-school-contest-index-2569.json');
const d=JSON.parse(fs.readFileSync(p,'utf8'));
assert.equal(d.summary.school_count,8);
assert.equal(d.summary.raw_source_row_count,67);
assert.equal(d.summary.canonical_competition_count,64);
assert.equal(d.summary.multi_school_competition_count,34);
assert.equal(d.summary.school_competition_records,156);
assert.equal(d.schools.length,8);
const counts=[30,17,35,17,24,9,11,13];
d.schools.forEach((school,i)=>{
  assert.equal(school.competition_count,counts[i]);
  assert.equal(school.competitions.length,counts[i]);
  assert.equal(new Set(school.competitions.map(x=>x.contest_id)).size,counts[i]);
  for(const x of school.competitions) {
    assert(x.activity&&x.level&&x.source_row_ids?.length>0);
    assert(Object.keys(x).every(k=>['contest_id','activity','level','source_row_ids','multi_school'].includes(k)));
  }
});
const all=d.schools.flatMap(x=>x.competitions);
assert(!JSON.stringify(d).includes('เด็กชาย'));
assert(!JSON.stringify(d).includes('เด็กหญิง'));
assert(!JSON.stringify(d).includes('นางสาว'));
assert(!JSON.stringify(d).includes('นักเรียน') || !d.schools.some(s=>s.competitions.some(c=>'students' in c)));
assert(!all.some(x=>'coaches' in x||'students' in x||'student_names' in x));
const key=id=>d.schools.reduce((n,s)=>n+(s.competitions.some(c=>c.contest_id===id)?1:0),0);
assert.equal(key(3),8);
assert.equal(key(31),5);
assert.equal(key(55),2);
assert.equal(key(40),5);
assert.deepEqual(d.summary.merged_source_pairs,[[3,61],[31,65],[55,74]]);
console.log('PASS school index: 8 schools, 64 distinct canonical activities, 156 school-activity records, no student or coach personal names.');
