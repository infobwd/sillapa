'use strict';
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'nongkum.html'), 'utf8');
const doc = fs.readFileSync(path.join(root, 'docs/NGK74_NONGKRATHUM_PDF_20261119_ACCEPTANCE.md'), 'utf8');
const details = html.match(/<details class="school" id="nongkum-nongkrathum-20261114">([\s\S]*?)<\/details>/)?.[1];
const panel = html.match(/<section class="ngk-confirmation-panel" id="ngk74-nongkrathum-confirmation"([\s\S]*?)<\/section>/)?.[1];
const field = html.match(/<table class="venue-table">([\s\S]*?)<\/tbody><\/table>/)?.[1];
assert.ok(details && panel && field, 'school evidence, confirmation, and field table must exist');
const rows = [...field.matchAll(/<tr><td data-label="ลำดับ">(\d+)<\/td>[\s\S]*?<\/tr>/g)].map(m => ({
  id: Number(m[1]),
  text: m[0],
  schools: [...m[0].matchAll(/<span class="venue-school">([^<]+)<\/span>/g)].map(s=>s[1]),
  count: Number(m[0].match(/<strong>(\d+) โรงเรียน<\/strong>/)?.[1])
}));

test('19 Nov PDF remains archived while 21 Nov additional male contest updates current totals', () => {
  assert.match(details, /Word 14 พ\.ย\. กับ PDF 19 พ\.ย\. 2569/);
  assert.match(details, /29 แถว \/ 35 ช่วงชั้น/);
  assert.match(details, /ลำดับ 27 ไม่มีเครื่องหมายระดับชั้น/);
  assert.match(panel, /2 ประเด็นรอตรวจ/);
  assert.match(panel, /รายการ #76/);
  assert.equal(rows.length, 68);
  assert.equal(new Set(rows.map(r=>r.id)).size, 68);
  assert.equal(rows.filter(r=>r.schools.includes('บ้านหนองกระทุ่ม')).length, 36);
  for (const row of rows) assert.equal(row.count, row.schools.length, 'count mismatch at ' + row.id);
});

test('current criteria descriptions are not confused with pending school confirmations', () => {
  assert.doesNotMatch(details, /รอตรวจเกณฑ์/);
  assert.match(details, /ช่วง ม\.1–3 จับคู่เกณฑ์ครั้งที่ 74 แล้ว/);
  assert.match(details, /เกณฑ์ครั้งที่ 74 กำหนด ป\.1–6 และยังรอยืนยันช่วงชั้น/);
  assert.ok(rows.find(r=>r.id===76)?.schools.includes('บ้านหนองกระทุ่ม'));
  assert.ok(!rows.find(r=>r.id===60)?.schools.includes('บ้านหนองกระทุ่ม'));
  const missing=[7,8,9,11,14,41,49,51];
  for(const id of missing){const row=rows.find(x=>x.id===id);if(row)assert.ok(!row.schools.includes('บ้านหนองกระทุ่ม'),'removed entry '+id);}
  assert.match(doc, /ไม่ใช่หลักฐานการถอนแข่งขัน/);
  assert.match(doc, /\*\*ไม่ทำเครื่องหมาย\*\*/);
});

test('source trace avoids publishing student and teacher identities', () => {
  assert.match(details, /ไม่เผยแพร่ไฟล์หรือรายชื่อบุคคล/);
  assert.doesNotMatch(details, /ด\.ญ\.|ด\.ช\.|เด็กชาย\s*[ก-ฮ]|เด็กหญิง\s*[ก-ฮ]/);
  assert.doesNotMatch(doc, /ด\.ญ\.|ด\.ช\.|เด็กชาย\s*[ก-ฮ]|เด็กหญิง\s*[ก-ฮ]/);
  assert.match(details, /NGK74_NONGKRATHUM_PDF_20261119_ACCEPTANCE\.md/);
});
