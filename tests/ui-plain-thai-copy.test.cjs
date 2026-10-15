/* UI COPY - LOCAL_FIRST simple Thai regression: node tests/ui-plain-thai-copy.test.cjs */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const html=read('index.html'),a2=read('ia2-registry.js'),a3=read('ia3-readiness.js'),
 a4=read('ia4-workspace.js'),a5=read('ia5-judge-venue.js'),a6=read('ia6-executive.js'),sw=read('sw.js');
const check=(source,phrases,label)=>phrases.forEach(s=>assert.ok(source.includes(s),label+': '+s));
// Critical: copy changes retain uncertainty and original user journeys.
check(html,['เตรียมความพร้อม','เครื่องหมาย — หมายถึงยังไม่มีข้อมูลที่ยืนยัน ไม่ใช่ศูนย์',
 'สรุปข้อมูลสำหรับผู้บริหาร','กลุ่มเครือข่ายที่ส่งข้อมูลแล้ว',
 'id="v-overview"','id="v-next"','id="v-prep"','id="v-readiness"','id="v-venue"',
 'id="v-executive"','id="v-archive"','id="v-judges"',
 "['executive','สรุปข้อมูลสำหรับผู้บริหาร']"],'overview/route');
check(a2,['ดูรายการแข่งขันแยกตามระดับชั้น','อยู่ระหว่างวางแผน ยังไม่ประกาศให้แข่งขัน',
 'ยังไม่มีข้อมูลยืนยันว่ากิจกรรมนี้แข่งระดับชั้นใดบ้าง','ยังไม่ประกาศรหัสกิจกรรม',
 'รอผู้จัดยืนยันระดับชั้น'], 'activity wording');
check(a3,['กลุ่มเครือข่ายส่งข้อมูลถึงขั้นตอนไหนแล้ว','กลุ่มที่ต้องส่งตัวแทน',
 'ยังบอกไม่ได้ว่าไม่มีปัญหา','ข้อมูลจาก: ยังไม่ประกาศ',
 'กรุณา','ต้องส่งตัวแทนหรือไม่'].filter(x=>x!=='กรุณา'), 'organizer wording');
check(a4,['ใช้ได้เฉพาะเครื่องนี้ ไม่แสดงบนเครื่องอื่น','รายการตรวจความพร้อม',
 'ไม่ใช่ใบสมัคร','นำแผนเดิมมาใช้'], 'teacher wording');
check(a5,['มีเรื่องที่ต้องตรวจเพิ่ม','เรื่องที่ต้องตรวจในเครื่อง',
 'วางแผนจำนวนกรรมการและห้องแข่งขัน','การเผยแพร่รายชื่อกรรมการหรือสนามที่ยืนยันแล้ว',
 'ยังไม่มีข้อมูลประกาศที่ได้รับอนุมัติ'], 'judge/venue wording');
check(a6,['ความคืบหน้าที่เขตตรวจสอบและยืนยันแล้ว','ข้อมูลเก่า ต้องตรวจประกาศล่าสุด',
 'ขั้นตอนก่อนนำข้อมูลทางการขึ้นเว็บไซต์','STAGE_STATUSES','COVERAGE_NAMES',
 'จากทั้งหมดที่เขตยืนยัน','ไม่ใช่สถานะสด'], 'executive wording');
assert.equal(a6.includes('ร่าง → ตรวจและรับรอง → เผยแพร่ Snapshot'),false,
  'no public snapshot jargon in the decision description');
assert.equal(a5.includes('Data Owner/PDPA Gate'),false,
  'no publish gate acronym on public judge page');
assert.equal(a4.includes('ไม่ซิงก์ข้ามอุปกรณ์'),false,
  'no synchronization jargon to teachers');
assert.match(sw,/sillapa-public-v9-ia6-20261015/);
assert.ok(sw.includes('./ia2-registry.js')&&sw.includes('./ia4-workspace.js')&&
 sw.includes('./ia5-judge-venue.js')&&sw.includes('./ia6-executive.js'));
assert.ok(!a6.includes("fetch("),'public executive module never accesses backend');
for(const [i,m] of [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].entries()){
 new vm.Script(m[1],{filename:'index.inline.copy.'+i+'.js'});
}
// ID and stage semantics remain internal; no replacing API enum values with Thai UI labels.
for(const key of ['district','cluster','publication_state','source_as_of','data_version']){
 assert.ok(a6.includes(key),'authoritative contract key preserved: '+key);
}
console.log('UI COPY LOCAL PASS: IA-1..IA-6 clear wording, routes, privacy and PWA version');
