'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'nongkum.html'), 'utf8');
const rows = [...html.matchAll(/<tr><td data-label="ลำดับ">(\d+)<\/td>([\s\S]*?)<\/tr>/g)].map(m => {
  const raw = m[2];
  return {
    id: Number(m[1]),
    name: raw.match(/data-label="รายการแข่งขัน"><strong>([^<]+)/)?.[1],
    level: raw.match(/data-label="ระดับชั้น">([^<]+)/)?.[1],
    count: Number(raw.match(/data-label="จำนวนโรงเรียน"><strong>(\d+)/)?.[1]),
    schools: [...raw.matchAll(/class="venue-school">([^<]+)/g)].map(x => x[1])
  };
});
const school = 'บ้านหนองกุ่ม';
const expected = [2,3,4,6,10,17,18,25,28,29,31,32,52,56,60,68,69].sort((a,b) => a-b);
const find = id => rows.find(r => r.id === id);

test('preserve 67 distinct school activity/level rows', () => {
  assert.equal(rows.length, 67);
  assert.equal(new Set(rows.map(r => r.id)).size, 67);
});
test('all visible row totals match unique school pills', () => {
  rows.forEach(r => {
    assert.equal(r.count, r.schools.length, 'row '+r.id);
    assert.equal(new Set(r.schools).size, r.count, 'row '+r.id);
  });
});
test('Ban Nong Kum is confirmed for precisely 17 PDF-matched rows', () => {
  assert.deepEqual(rows.filter(r => r.schools.includes(school)).map(r => r.id).sort((a,b)=>a-b), expected);
  assert.equal(find(1).count, 7);
  assert.ok(!find(1).schools.includes(school));
  assert.equal(find(2).name, 'การสร้างภาพด้วยการฉีก ตัด ปะ กระดาษ');
  assert.equal(find(3).level, 'ป.1–ป.3');
  assert.equal(find(4).level, 'ป.4–ป.6');
  assert.equal(find(17).level, 'ป.1–ป.3');
  assert.equal(find(18).level, 'ป.4–ป.6');
});
test('retain shared competition brackets while explaining PDF school grades', () => {
  [32,52,60,68,69].forEach(id => assert.equal(find(id).level, 'ป.1–ป.6', 'row '+id));
  assert.match(html, /id="ngk74-nongkum-confirmed" hidden/);
  assert.match(html, /nongkum.hidden=select.value!==/);
  assert.match(html, /14 กิจกรรมหลัก/);
  assert.match(html, /17 รายการแข่งขัน/);
  assert.match(html, /โรงเรียนบ้านหนองกุ่ม · ยืนยันรายการตามเอกสารโรงเรียน/);
});
test('do not publish private PDF or child names in the new school confirmation', () => {
  const panel = html.match(/<section class="ngk-confirmation-panel" id="ngk74-nongkum-confirmed"[\s\S]*?<\/section>/)?.[0];
  assert.ok(panel);
  assert.doesNotMatch(panel, /drive\.google\.com\/file|เด็กชาย|เด็กหญิง|ด\.ช\.|ด\.ญ\./);
});
