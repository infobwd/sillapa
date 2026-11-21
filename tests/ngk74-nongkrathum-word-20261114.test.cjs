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
const documented=new Set([1,2,3,4,5,6,13,15,16,17,18,21,23,26,28,29,30,31,33,34,37,38,43,47,50,52,53,57,76,70,71,72,73,74,75,77]);
const newIds=[70,71,72,73,74,75];
const pendingIds=[76];
test('Word 29-line source retains 35 documented marks plus new male entry #77',()=>{
 assert.equal(rows.length,68);
 assert.equal(new Set(rows.map(r=>r.id)).size,68);
 assert.deepEqual(rows.filter(r=>r.schools.includes(schoolName)).map(r=>r.id).sort((a,b)=>a-b),[...documented].sort((a,b)=>a-b));
 for(const row of rows)assert.equal(row.count,row.schools.length,'school count mismatch in '+row.id);
 for(const id of [9,11,49])assert.ok(!rows.some(r=>r.id===id),'obsolete single-school row '+id);
 for(const id of [7,8,14,41,51])assert.ok(rows.some(r=>r.id===id&&!r.schools.includes(schoolName)),'keep other schools in row '+id);
});
test('six new school activities match PDFs; inclusive painting subtype remains pending',()=>{
 const sources=rows.map(r=>({id:r.id,status:official.lookup(r.id,r.activity,r.level).status}));
 const held=sources.filter(x=>x.status==='review').map(x=>x.id).sort((a,b)=>a-b);
 assert.deepEqual(held,pendingIds);
 assert.equal(sources.filter(x=>x.status==='matched').length,67);
 for(const id of pendingIds){
   const row=rows.find(r=>r.id===id);
   assert.ok(row.markup.includes('รอยืนยันประเภทความบกพร่อง'));
   assert.ok(row.schools.includes(schoolName));
   assert.equal(official.lookup(id,row.activity,row.level).status,'review');
 }
 for(const id of newIds){
   const row=rows.find(r=>r.id===id);
   assert.ok(row.schools.includes(schoolName));
   assert.equal(official.lookup(id,row.activity,row.level).status,'matched');
 }
 const dance=rows.find(r=>r.id===75);
 assert.ok(dance.schools.includes(schoolName));
 assert.equal(official.lookup(75,dance.activity,dance.level).document.key,'16');
 assert.ok(dance.markup.includes('เทียบเกณฑ์แล้ว'));
 assert.equal(official.lookup(13,'กาพย์ยานี 11 (6 บท)','ม.1–ม.3').document.key,'1');
 const painting=rows.find(r=>r.id===60);
 assert.ok(!painting.schools.includes(schoolName),'Nongkrathum must not be assumed to share verified subtype with Nongkum');
});
test('Word source details expose activity and grade only, not student/teacher identities',()=>{
 const detail=html.match(/<details class="school" id="nongkum-nongkrathum-20261114">([\s\S]*?)<\/details>/)?.[1];
 assert.ok(detail);
 assert.equal((detail.match(/<li>/g)||[]).length,29);
 for(const num of ['4','8','22','27','31'])assert.ok(detail.includes('ลำดับเอกสาร '+num+':'));
 assert.match(detail,/35 จุด/);
 assert.match(detail,/ลำดับ 27 ไม่มีเครื่องหมายระดับชั้นในต้นฉบับ/);
 assert.match(detail,/ผู้ประสานงานยืนยัน 19 พ.ย. 2569 ให้ใช้หญิงเดี่ยว ม.1–3 แทนชายเดี่ยว/);
 assert.doesNotMatch(detail,/ด\.ญ\.|ด\.ช\.|นางสาว\s*[ก-ฮ]|นาย\s*[ก-ฮ]/);
 assert.match(html,/ไม่ใช่ระบบสมัครแข่งขัน บันทึกชื่อครูผู้ควบคุมทีมและนักเรียน หรือประกาศผลการแข่งขัน/);
});
test('2026-11-19 live school list uses female solo in music row #74 while old document stays attributed',()=>{
 const maleAddition=rows.find(r=>r.id===77);
 assert.equal(maleAddition.activity,'การขับร้องเพลงไทยลูกกรุง ชายเดี่ยว');
 assert.equal(maleAddition.level,'ม.1–ม.3');
 assert.deepEqual(maleAddition.schools,[schoolName]);
 assert.equal(official.lookup(77,maleAddition.activity,maleAddition.level).status,'matched');
 const music=rows.find(r=>r.id===74);
 assert.equal(music.activity,'การขับร้องเพลงไทยลูกกรุง หญิงเดี่ยว');
 assert.equal(music.level,'ม.1–ม.3');
 assert.deepEqual(music.schools,[schoolName]);
 assert.equal(official.lookup(74,music.activity,music.level).status,'matched');
 assert.equal(official.lookup(74,'การขับร้องเพลงไทยลูกกรุง ชายเดี่ยว','ม.1–ม.3').status,'review');
});
