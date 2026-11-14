'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const test=require('node:test');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'nongkum.html'),'utf8');
const criteria=fs.readFileSync(path.join(root,'round74-criteria-sources.js'),'utf8');
const ctx={window:{}};
vm.runInNewContext(criteria,ctx);
const official=ctx.window.SILLAPA74_CRITERIA_SOURCES;
const table=html.match(/<table class="venue-table">([\s\S]*?)<\/tbody><\/table>/)?.[1];
assert.ok(table,'field preparation table must exist');
const rows=[...table.matchAll(/<tr><td data-label="ลำดับ">(\d+)<\/td>[\s\S]*?<\/tr>/g)].map(m=>{
 const markup=m[0],id=Number(m[1]);
 const schools=[...markup.matchAll(/<span class="venue-school">([^<]+)<\/span>/g)].map(x=>x[1]);
 return {id,schools,markup,activity:markup.match(/<td data-label="รายการแข่งขัน"><strong>([^<]+)<\/strong>/)?.[1],level:markup.match(/<td data-label="ระดับชั้น">([^<]+)<\/td>/)?.[1],count:Number(markup.match(/<strong>(\d+) โรงเรียน<\/strong>/)?.[1])};
});
const schoolName='บ้านหนองกระทุ่ม';
const documented=new Set([1,2,3,4,5,6,13,15,16,17,18,21,23,26,28,29,30,31,33,34,37,38,43,47,50,52,53,57,60,70,71,72,73,74,75]);
const newIds=[70,71,72,73,74,75];
test('Word 29-line source is reconciled to 35 documented school-and-grade rows',()=>{
 assert.equal(rows.length,66);
 assert.equal(new Set(rows.map(r=>r.id)).size,66);
 assert.deepEqual(rows.filter(r=>r.schools.includes(schoolName)).map(r=>r.id).sort((a,b)=>a-b),[...documented].sort((a,b)=>a-b));
 for(const row of rows)assert.equal(row.count,row.schools.length,'school count mismatch in '+row.id);
 for(const id of [9,11,49])assert.ok(!rows.some(r=>r.id===id),'obsolete single-school row '+id);
 for(const id of [7,8,14,41,51])assert.ok(rows.some(r=>r.id===id&&!r.schools.includes(schoolName)),'keep other schools in row '+id);
});
test('six new records are review-only without pretending official criteria was verified',()=>{
 const sources=rows.map(r=>({id:r.id,status:official.lookup(r.id,r.activity,r.level).status}));
 const held=sources.filter(x=>x.status==='review').map(x=>x.id).sort((a,b)=>a-b);
 assert.deepEqual(held,newIds);
 assert.equal(sources.filter(x=>x.status==='matched').length,60);
 for(const id of newIds){
   const row=rows.find(r=>r.id===id);
   assert.ok(row.markup.includes('รอตรวจเกณฑ์ครั้งที่ 74'));
   assert.ok(row.schools.includes(schoolName));
 }
 assert.equal(official.lookup(13,'กาพย์ยานี 11 (6 บท)','ม.1–ม.3').document.key,'1');
});
test('Word source details expose activity and grade only, not student/teacher identities',()=>{
 const detail=html.match(/<details class="school" id="nongkum-nongkrathum-20261114">([\s\S]*?)<\/details>/)?.[1];
 assert.ok(detail);
 assert.equal((detail.match(/<li>/g)||[]).length,29);
 for(const num of ['4','8','22','27','31'])assert.ok(detail.includes('ลำดับเอกสาร '+num+':'));
 assert.match(detail,/35 จุด/);
 assert.match(detail,/ลำดับ 27 ไม่มีเครื่องหมายระดับชั้น/);
 assert.doesNotMatch(detail,/ด\.ญ\.|ด\.ช\.|นางสาว\s*[ก-ฮ]|นาย\s*[ก-ฮ]/);
 assert.match(html,/ไม่ใช่ระบบสมัครแข่งขัน บันทึกชื่อครูผู้ควบคุมทีมและนักเรียน หรือประกาศผลการแข่งขัน/);
});