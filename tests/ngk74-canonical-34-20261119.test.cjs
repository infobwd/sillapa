'use strict';
/*
 * NGK74-CANONICAL-34-20261119 — regression for source-row/canonical-row distinction.
 * Local-first: node tests/ngk74-canonical-34-20261119.test.cjs
 * Read-only; no network, personal data, or GitHub Actions.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'nongkum.html'), 'utf8');
const begin = html.indexOf('<tbody><tr><td data-label="ลำดับ">1</td>');
const end = html.indexOf('</tbody>', begin);
assert(begin >= 0 && end > begin, 'venue table exists');
const rows = [...html.slice(begin, end).matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(m => {
  const htmlRow = m[0];
  const num = Number((htmlRow.match(/data-label="ลำดับ">(\d+)</) || [])[1]);
  const name = (htmlRow.match(/data-label="รายการแข่งขัน"><strong>([^<]+)/) || [])[1];
  const grade = (htmlRow.match(/data-label="ระดับชั้น">([^<]+)/) || [])[1];
  const schools = [...htmlRow.matchAll(/class="venue-school">([^<]+)</g)].map(x => x[1]);
  const count = Number((htmlRow.match(/data-label="จำนวนโรงเรียน"><strong>(\d+)/) || [])[1]);
  assert.equal(count, schools.length, 'school total agrees with names in source row ' + num);
  assert.equal(new Set(schools).size, count, 'no repeated school in source row ' + num);
  return {num, name, grade, schools, count};
});
assert.equal(rows.length, 67, 'preserve 67 raw source rows');
assert.equal(rows.filter(r => r.schools.length >= 2).length, 33, '33 raw multi-school rows prior to canonical merging');
const aliases = {
  'เล่านิทาน Story Telling': 'การแข่งขันการเล่านิทาน (Story Telling)',
  'จัดทำหนังสือเล่มเล็ก': 'การจัดทำหนังสือเล่มเล็ก'
};
const normalized = new Map();
const duplicates = [];
for (const r of rows) {
  const key = (aliases[r.name] || r.name) + '|' + r.grade;
  if (!normalized.has(key)) { normalized.set(key, {num: r.num, schools: new Set(r.schools)}); continue; }
  const first = normalized.get(key);
  duplicates.push([first.num, r.num]);
  for (const school of r.schools) first.schools.add(school);
}
assert.deepEqual(duplicates, [[55,74], [3,61], [31,65]], 'three duplicate activity/level source pairs');
assert.equal(normalized.size, 64, '64 competition/grade rows shown after canonical merge');
const contested = [...normalized.values()].filter(r => r.schools.size >= 2);
assert.equal(contested.length, 34, '34 canonical multi-school activities');
assert.equal(rows.find(r => r.num===40).count, 5, 'drawing P4-6 has five schools');
assert.equal(rows.filter(r => r.schools.includes('บ้านวังด้ง')).length, 13, 'Wang Dong participates in 13 rows');
assert.match(html, /<b>34<\/b><span>รายการพบ 2 โรงเรียนขึ้นไป \(หลังรวมซ้ำ\)<\/span>/);
assert.match(html, /<b>64<\/b><span>รายการแยกกิจกรรมและระดับ \(หลังรวมซ้ำ\)<\/span>/);
assert.match(html, /ร่างจัดสนาม: 34 รายการแข่งขัน · 22 ห้อง\/พื้นที่เพิ่มเติม \(ยังไม่อนุมัติ\)/);
assert.match(html, /ขับร้องเพลงไทยลูกกรุง หญิงเดี่ยว ม\.1–3 \(แถวต้นทาง #55 และ #74/);
assert.match(html, /<strong>26 รายการ<\/strong>/);
assert.match(html, /<strong>22 ห้อง\/พื้นที่<\/strong>/);
const plannedIds = [1,2,33,39,40,47,51,52,3,4,5,6,7,12,15,16,17,18,20,21,23,37,10,26,28,29,30,31,43,32,44,57,56,55];
assert.equal(plannedIds.length,34);
assert.equal(new Set(plannedIds).size,34);
assert.deepEqual([...new Set(plannedIds)].sort((a,b)=>a-b),contested.map(r=>r.num).sort((a,b)=>a-b));
console.log('NGK74 canonical 34: PASS — 67 source rows, 64 merged competitions, 34 multi-school, 22 draft rooms/areas.');
