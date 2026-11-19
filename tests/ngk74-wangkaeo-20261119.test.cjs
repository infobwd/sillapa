'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'nongkum.html'), 'utf8');
const rows = [...html.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(x => x[1]).filter(x => x.includes('data-label="รายการแข่งขัน"'));
const school = 'วังเขาแก้ว (หงำอุปถัมภ์)';
const records = rows.map(row => ({
  id: row.match(/data-label="ลำดับ">([^<]+)/)?.[1],
  activity: row.match(/data-label="รายการแข่งขัน"><strong>([^<]+)/)?.[1],
  level: row.match(/data-label="ระดับชั้น">([^<]+)/)?.[1],
  total: Number(row.match(/data-label="จำนวนโรงเรียน"><strong>(\d+)/)?.[1]),
  schools: [...row.matchAll(/class="venue-school">([^<]+)/g)].map(x => x[1]),
}));
const byId = id => records.find(x => x.id === String(id));

test('keeps 67 activity/level rows with unique ids', () => {
  assert.equal(records.length, 67);
  assert.equal(new Set(records.map(x => x.id)).size, 67);
});
test('each displayed school count agrees with the school pills; no duplication per row', () => {
  for (const r of records) {
    assert.equal(r.total, r.schools.length, r.id);
    assert.equal(r.schools.length, new Set(r.schools).size, r.id);
  }
});
test('Wang Kaeo 11 school rows, including three new source-confirmed matches', () => {
  assert.deepEqual(records.filter(r => r.schools.includes(school)).map(r => r.id).sort((a,b)=>Number(a)-Number(b)),
    ['1','2','3','4','6','7','37','39','40','44','45'].sort((a,b)=>Number(a)-Number(b)));
  assert.equal(byId(3).total, 7);
  assert.equal(byId(6).total, 7);
  assert.equal(byId(44).total, 2);
  assert.equal(byId(3).level, 'ป.1–ป.3');
  assert.equal(byId(6).level, 'ป.1–ป.3');
  assert.equal(byId(44).level, 'ป.1–ป.3');
});
test('summary and review note align with source without changing shared rows', () => {
  assert.equal(records.filter(r => r.total >= 2).length, 33);
  assert.match(html, /<b>33<\/b><span>รายการพบ 2 โรงเรียนขึ้นไป/);
  assert.equal(byId(7).activity, 'การเขียนเรื่องความ');
  assert.equal(byId(37).level, 'ป.1–ป.6');
  assert.match(html, /id="ngk74-wangkaeo-source-check" hidden/);
  assert.match(html, /wangkaeo.hidden=select.value!==/);
  assert.match(html, /2 จุดต้องตรวจทานก่อนใช้จัดแข่งขัน/);
});
