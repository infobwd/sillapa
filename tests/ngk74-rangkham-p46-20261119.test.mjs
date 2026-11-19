import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../nongkum.html', import.meta.url), 'utf8');
const rows = [...html.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/g)].map(match => match[0]);
const byId = id => rows.find(row => row.includes('data-label="ลำดับ">' + id + '</td>'));
const rangkham = rows.filter(row => row.includes('class="venue-school"') && row.includes('>บ้านรางขาม</span>'));

test('updated Word restores Rang Kham fast math P4-P6 without a duplicate activity', () => {
  const row = byId(18);
  assert.ok(row, 'Row #18 must exist');
  assert.match(row, /<strong>คิดเลขเร็ว<\/strong>/);
  assert.match(row, /data-label="ระดับชั้น">ป\.4–ป\.6/);
  assert.match(row, /<strong>6 โรงเรียน<\/strong>/);
  assert.equal((row.match(/class="venue-school"/g) || []).length, 6);
  assert.equal((row.match(/>บ้านรางขาม<\/span>/g) || []).length, 1);
  assert.equal(rangkham.length, 9);
  assert.doesNotMatch(byId(17), />บ้านรางขาม<\/span>/);
});

test('public school view shows current provenance instead of stale hold warning', () => {
  assert.match(html, /id="ngk74-rangkham-source-check"/);
  assert.match(html, /เอกสารที่ได้รับ 19 พ\.ย\. 2569/);
  assert.doesNotMatch(html, /รอยืนยันช่วงชั้นคิดเลขเร็วอีก 1 รายการ/);
  assert.match(html, /ยังต้องให้โรงเรียนตรวจทานประเภทย่อย/);
  assert.match(html, /rangkham\.hidden=select\.value!==/);
});

test('summary totals reflect current eight-school and 67-activity register', () => {
  const activityRows = rows.filter(row => row.includes('data-label="ลำดับ">') && row.includes('class="venue-school"'));
  const members = row => [...row.matchAll(/<span class="venue-school">([^<]+)<\\/span>/g)].map(m => m[1]);
  const uniqueSchools = new Set(activityRows.flatMap(members));
  const shared = activityRows.filter(row => members(row).length >= 2);
  assert.equal(activityRows.length, 67);
  assert.equal(uniqueSchools.size, 8);
  assert.equal(shared.length, 32);
  assert.match(html, /<b>8<\\/b><span>โรงเรียนที่แจ้ง<\\/span>/);
  assert.match(html, /<b>32<\\/b><span>รายการพบ 2 โรงเรียนขึ้นไป<\\/span>/);
  assert.match(html, /<b>67<\\/b><span>รายการแยกกิจกรรมและระดับ<\\/span>/);
});
