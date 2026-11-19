'use strict';
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'..','nongkum.html'),'utf8');
const panel=html.match(/<section class="ngk-confirmation-panel" id="ngk74-nongkrathum-confirmation" hidden[\s\S]*?<\/section>/)?.[0];
const removedIds=[7,8,9,11,14,41,49,51];
const table=html.match(/<table class="venue-table">([\s\S]*?)<\/tbody><\/table>/)?.[1];
const rows=[...table.matchAll(/<tr><td data-label="ลำดับ">(\d+)<\/td>[\s\S]*?<\/tr>/g)].map(m=>({
 id:Number(m[1]),markup:m[0],schools:[...m[0].matchAll(/<span class="venue-school">([^<]+)<\/span>/g)].map(x=>x[1])
}));
test('Nongkrathum remaining issues panel stays hidden until its school is selected',()=>{
 assert.ok(panel);
 assert.match(html,/select\.value!=='บ้านหนองกระทุ่ม'/);
 assert.match(html,/select\.addEventListener\('change',showReviewForSchool\)/);
 assert.match(panel,/2 ประเด็นรอตรวจ/);
 assert.match(panel,/ตัดออกจากบัญชีรายการของโรงเรียนแล้ว/);
 assert.doesNotMatch(panel,/data-original-activity-id=/);
});
test('eight historically unlisted activities are not in current Nongkrathum entries',()=>{
 assert.equal(rows.length,67);
 for(const id of removedIds){
   const row=rows.find(x=>x.id===id);
   if(row)assert.ok(!row.schools.includes('บ้านหนองกระทุ่ม'),'school still entered in excluded '+id);
 }
 assert.equal(rows.filter(x=>x.schools.includes('บ้านหนองกระทุ่ม')).length,35);
 assert.match(panel,/ไม่กระทบโรงเรียนอื่น/);
});
test('grade discrepancy and inclusive activity subtype remain separately pending',()=>{
 assert.match(panel,/Word และ PDF ของโรงเรียนลำดับ 22 เลือก <strong>ป\.4–ป\.6<\/strong>/);
 assert.match(panel,/เกณฑ์ดนตรีครั้งที่ 74 กำหนดกลุ่มแข่งขัน <strong>ป\.1–ป\.6<\/strong>/);
 assert.match(panel,/1l7PBOtmvSMPxbo8316dOFgssei92jhXh/);
 assert.match(panel,/รายการ #76/);
 assert.match(panel,/ยังไม่ระบุประเภทความบกพร่อง/);
 assert.match(panel,/1ESqis5f5BZlS96RutXdkIUhMgyrC9aL4/);
 assert.match(html,/data-label="ลำดับ">76<\/td>/);
});
test('Thai luk krung correction is female solo in M1-M3 only for Nongkrathum',()=>{
 const row=rows.find(x=>x.id===74);
 assert.ok(row);
 assert.match(row.markup,/ขับร้องเพลงไทยลูกกรุง หญิงเดี่ยว/);
 assert.match(row.markup,/ระดับชั้น">ม\.1–ม\.3/);
 assert.deepEqual(row.schools,['บ้านหนองกระทุ่ม']);
 assert.match(panel,/หญิงเดี่ยว ม\.1–ม\.3/);
 const maleElsewhere=rows.find(x=>x.id===68);
 assert.ok(maleElsewhere.markup.includes('การขับร้องเพลงไทยลูกกรุง ชายเดี่ยว'));
});
test('no personal names in public status panel',()=>{
 assert.doesNotMatch(panel,/ด\.ช\.|ด\.ญ\.|นาย\s*[ก-ฮ]|นางสาว\s*[ก-ฮ]/);
 assert.match(html,/\.ngk-confirmation-panel\[hidden\]\{display:none!important\}/);
});
