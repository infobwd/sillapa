'use strict';
/* NGK74-DEDUP-20261120: inspect public source rows without modifying old source evidence. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'nongkum.html'), 'utf8');
const snapshot = JSON.parse(fs.readFileSync(path.join(root, 'nongkum-canonical-74.json'), 'utf8'));
const begin = html.indexOf('<tbody><tr><td data-label="ลำดับ">1</td>');
const end = html.indexOf('</tbody>', begin);
assert(begin >= 0 && end > begin);
const sourceRows = [...html.slice(begin,end).matchAll(/<tr><td data-label="ลำดับ">(\d+)<\/td>([\s\S]*?)<\/tr>/g)].map(m => {
  const markup = m[2];
  const schools = [...markup.matchAll(/class="venue-school">([^<]+)<\/span>/g)].map(x => x[1]);
  return {
    id: Number(m[1]),
    name: markup.match(/data-label="รายการแข่งขัน"><strong>([^<]+)<\/strong>/)?.[1],
    level: markup.match(/data-label="ระดับชั้น">([^<]+)<\/td>/)?.[1],
    schools,
    count: Number(markup.match(/data-label="จำนวนโรงเรียน"><strong>(\d+)/)?.[1]),
    status: markup.match(/data-label="สถานะ">([\s\S]*?)<\/td>/)?.[1].replace(/<[^>]+>/g, '').trim()
  };
});
const aliases = {
  'เล่านิทาน Story Telling': 'การแข่งขันการเล่านิทาน (Story Telling)',
  'จัดทำหนังสือเล่มเล็ก': 'การจัดทำหนังสือเล่มเล็ก'
};
const expected = new Map();
for (const row of sourceRows) {
  assert.equal(row.count, row.schools.length, 'school count for source row ' + row.id);
  assert.equal(new Set(row.schools).size, row.schools.length, 'duplicate school in source row ' + row.id);
  const activity = aliases[row.name] || row.name;
  const key = activity + '|' + row.level;
  if (!expected.has(key)) expected.set(key, {
    id: row.id, activity, level: row.level, schools: [], sourceRowIds: [],
    sourceNames: [], sourceStatuses: []
  });
  const item = expected.get(key);
  item.sourceRowIds.push(row.id);
  if (!item.sourceNames.includes(row.name)) item.sourceNames.push(row.name);
  if (!item.sourceStatuses.includes(row.status)) item.sourceStatuses.push(row.status);
  for (const school of row.schools) if (!item.schools.includes(school)) item.schools.push(school);
}
test('one source-derived competition per canonical activity and grade', () => {
  assert.equal(sourceRows.length, 67, 'original source rows retained for traceability');
  assert.equal(expected.size, 64);
  assert.equal(snapshot.summary.sourceRowCount, 67);
  assert.equal(snapshot.summary.canonicalActivityCount, 64);
  assert.equal(snapshot.summary.multiSchoolActivityCount, 34);
  assert.equal(snapshot.summary.singleSchoolActivityCount, 30);
  assert.equal(snapshot.summary.schoolCount, 8);
  assert.equal(snapshot.summary.mergedPairCount, 3);
  assert.equal(snapshot.activities.length, 64);
  assert.equal(snapshot.activities.filter(a => a.schoolCount >= 2).length, 34);
  assert.equal(new Set(snapshot.activities.flatMap(a => a.schools)).size, 8);
  assert.equal(snapshot.status, 'REFERENCE_ONLY_UNAPPROVED_NOT_REGISTRATION');
});
test('64 saved items exactly preserve all original school memberships, sources and statuses', () => {
  assert.deepEqual(snapshot.activities.map(a => a.id), [...expected.values()].map(a => a.id));
  for (const saved of snapshot.activities) {
    const old = expected.get(saved.activity + '|' + saved.level);
    assert.ok(old, saved.activity);
    assert.equal(saved.id, old.id);
    assert.deepEqual(saved.sourceRowIds, old.sourceRowIds);
    assert.deepEqual(saved.sourceNames, old.sourceNames);
    assert.deepEqual(saved.sourceStatuses, old.sourceStatuses);
    assert.deepEqual(saved.schools, old.schools);
    assert.equal(saved.schoolCount, old.schools.length);
  }
});
test('three merged pairs: Thai handwriting 8, Story Telling 5, female Luk Krung solo 2 schools', () => {
  assert.deepEqual(snapshot.merges.map(x => x.sourceRowIds), [[3,61],[31,65],[55,74]]);
  assert.deepEqual(snapshot.merges.map(x => x.schoolCount), [8,5,2]);
  assert.ok(snapshot.activities.find(a => a.id === 3).schools.includes('บ้านวังด้ง'));
  assert.ok(snapshot.activities.find(a => a.id === 31).schools.includes('บ้านวังด้ง'));
  assert.ok(snapshot.activities.find(a => a.id === 55).schools.includes('บ้านหนองกระทุ่ม'));
  assert.equal(snapshot.activities.find(a => a.id === 55).level, 'ม.1–ม.3');
});
test('school-facing view includes merger receipt and reviewable canonical JSON link', () => {
  assert.match(html, /id="ngk74-duplicate-consolidation"/);
  assert.match(html, /href="\.\/nongkum-canonical-74\.json"/);
  assert.match(html, /ยังไม่ใช่การรับสมัครหรือรับรองรายการแข่งขัน/);
});
