'use strict';
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'..','nongkum.html'),'utf8');
const originalIds=[7,8,9,11,14,41,49,51];
const panel=html.match(/<section class="ngk-confirmation-panel" id="ngk74-nongkrathum-confirmation" hidden[\s\S]*?<\/section>/)?.[0];
test('Nongkrathum confirmation audit is hidden until its school is selected',()=>{
  assert.ok(panel,'pending review panel must exist');
  assert.match(html,/select\.value!=='บ้านหนองกระทุ่ม'/);
  assert.match(html,/select\.addEventListener\('change',showReviewForSchool\)/);
  assert.match(panel,/รายการรอโรงเรียนยืนยัน/);
  assert.match(panel,/9 ประเด็นรอยืนยัน/);
  assert.match(panel,/ยังไม่ถือว่าโรงเรียนถอนแข่งขัน/);
});
test('all eight historical entries are preserved for confirmation, not counted as entered teams',()=>{
  const ids=[...panel.matchAll(/data-original-activity-id="(\d+)"/g)].map(m=>Number(m[1]));
  assert.deepEqual(ids,originalIds);
  assert.equal((panel.match(/รอโรงเรียนยืนยัน<\/strong>/g)||[]).length,8);
  assert.match(panel,/เดี่ยวฆ้องวงเล็ก[\s\S]*?ม\.1–ม\.3/);
  assert.match(panel,/การเขียนเรียงความ/);
  assert.match(panel,/ท่องอาขยานทำนองเสนาะ/);
  assert.match(panel,/ต่อคำศัพท์ภาษาไทย/);
  assert.match(panel,/วาดภาพระบายสี/);
  assert.match(panel,/การขับร้องเพลงไทยลูกทุ่ง หญิงเดี่ยว/);
  assert.match(panel,/ไม่เพิ่มในยอดรายการที่ยืนยันแล้ว/);
});
test('grade discrepancy uses Word P4-P6 vs official P1-P6 and links official source',()=>{
  assert.match(panel,/Word ของโรงเรียนลำดับ 22 เลือก <strong>ป\.4–ป\.6<\/strong>/);
  assert.match(panel,/เกณฑ์ดนตรีครั้งที่ 74 กำหนดกลุ่มแข่งขัน <strong>ป\.1–ป\.6<\/strong>/);
  assert.match(panel,/1l7PBOtmvSMPxbo8316dOFgssei92jhXh/);
  assert.match(panel,/1ESqis5f5BZlS96RutXdkIUhMgyrC9aL4/);
  assert.doesNotMatch(panel,/ด\.ช\.|ด\.ญ\.|นาย\s*[ก-ฮ]|นางสาว\s*[ก-ฮ]/);
});
test('field-plan table stays distinct from a historical confirmation panel',()=>{
  const table=html.match(/<table class="venue-table">([\s\S]*?)<\/tbody><\/table>/)?.[1];
  assert.ok(table);
  assert.equal((table.match(/<td data-label="ลำดับ">\d+<\/td>/g)||[]).length,66);
  assert.match(html,/\.ngk-confirmation-panel\[hidden\]\{display:none!important\}/);
});
