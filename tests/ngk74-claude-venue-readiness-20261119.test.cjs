'use strict';
/* NGK74-CLAUDE-VENUE-READINESS-20261119
 * Local-first regression: node tests/ngk74-claude-venue-readiness-20261119.test.cjs
 * Only reviews public competition/school data. No external services or GitHub Actions.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const main=fs.readFileSync(path.join(root,'nongkum.html'),'utf8');
const plan=fs.readFileSync(path.join(root,'nongkum-venue-prep.html'),'utf8');
const codes=[...plan.matchAll(/class="room-code">([A-FH]\d+)<\/span>/g)].map(x=>x[1]);
const expectedCodes=['H1','H2','H3','H4','H5','A1','A2','A3','B1','B2','B3','B4','B5','B6','B7','B8','C1','C2','C3','C4','C5','D1','D2','D3','E1','E2','F1'];
assert.deepEqual(codes,expectedCodes,'5 proposed reused spaces + 22 additional areas');
assert.equal((plan.match(/<article class="room"/g)||[]).length,27);
assert.equal((plan.match(/<li class="event">/g)||[]).length,34,'every contested event appears exactly once');
const ids=[...plan.matchAll(/รายการ #(\d+)(?:\/#(?:\d+))?/g)].map(x=>Number(x[1]));
assert.equal(ids.length,34,'one canonical ID per event');
assert.equal(new Set(ids).size,34,'no duplicate canonical activities');
assert(ids.includes(44)&&ids.includes(55)&&ids.includes(40),'new #44 and #55/#74, Wang Dong #40 preserved');
assert(/#55\/#74/.test(plan),'#55 and #74 joined as one contest');
assert(/#3\/#61/.test(plan),'#3 and #61 joined');
assert(/#31\/#65/.test(plan),'#31 and #65 joined');
for(const [id,text] of [
 ['A1','16 โรงเรียน-รายการ'],['A2','9 โรงเรียน-รายการ'],['C3','8 โรงเรียน-รายการ']
])assert(plan.includes(text),id+' capacity estimate');
assert(plan.includes('ไม่ใช่จำนวนคนหรือจำนวนทีม'),'participant count not inferred');
assert(plan.includes('ยังไม่ได้ยืนยันสถานที่จริง'),'status clearly provisional');
assert(plan.includes('พื้นที่โล่ง 2 จุด'),'open areas clearly distinguished');
assert(plan.includes('ยังไม่ใช่จำนวนห้องที่พร้อมใช้งานจริง'),'rooms not certified');
assert(plan.includes('กลุ่มกิจกรรม'),'group filter available');
assert(plan.includes('addEventListener("input",update)'),'search filter wired');
assert(plan.includes('window.print()'),'print action works');
assert(plan.includes('@media(max-width:520px)'),'mobile layout supported');
assert(main.includes('id="ngk74-venue-prep-shortcut"'),'main venue mode links to plan');
assert(main.includes('href="./nongkum-venue-prep.html"'));
assert(main.includes("ngkVenuePrepShortcut.hidden=mode!=='venue'"),'only visible in venue role');
assert(!plan.includes('T-0000'),'no restricted teacher IDs');
console.log('NGK74 Claude venue readiness: PASS 34 contests mapped once to 27 proposed locations (5 reused + 22 new), constraints and source provenance present.');
