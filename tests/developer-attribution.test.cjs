/* LOCAL_FIRST: node tests/developer-attribution.test.cjs
   Attribution is visible without claiming official ownership of competition records. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=file=>fs.readFileSync(path.resolve(__dirname,'..',file),'utf8');
const html=read('index.html'),css=read('ia1.css'),sw=read('sw.js');
const fullName='นายนพรุจ ลับบัวงาม',role='ผู้อำนวยการโรงเรียนบ้านวังด้ง';
const home=html.match(/<section class="view" id="v-overview"[\s\S]*?<\/section>/);
assert.ok(home,'overview exists');
assert.ok(home[0].includes('class="sillapa-home-credit"'),'quiet overview attribution exists');
assert.ok(home[0].includes(fullName)&&home[0].includes(role),'name and position visible on overview');
const intro=home[0].indexOf('class="ia-provenance"'),credit=home[0].indexOf('class="sillapa-home-credit"');
assert.ok(intro>=0&&credit>intro,'credit follows source disclaimer rather than replacing hero');
const footer=html.match(/<footer aria-label="เกี่ยวกับเว็บไซต์และแหล่งข้อมูล">([\s\S]*?)<\/footer>/);
assert.ok(footer,'accessible sitewide footer exists');
assert.ok(footer[1].includes(fullName)&&footer[1].includes(role),'sitewide footer credits developer');
assert.ok(footer[1].includes('<details class="sillapa-footer-about">'),'about info is a native disclosure');
assert.ok(footer[1].includes('<summary>เกี่ยวกับเว็บไซต์นี้</summary>'),'about summary is in Thai');
assert.ok(footer[1].includes('ไม่ใช่เว็บไซต์ลงทะเบียนสมัครแข่งขันหรือรายงานผลการแข่งขัน'),'no registration/results confusion');
assert.ok(footer[1].includes('ไม่ใช้แทนประกาศอย่างเป็นทางการ'),'no organizer endorsement');
assert.ok(footer[1].includes('แหล่งข้อมูลต้นทาง'),'separate source ownership');
assert.ok(footer[1].includes('id="pwaInstallFooter"')&&footer[1].includes('data-pdpa'),'existing footer actions preserved');
assert.ok(!/ท่านผู้อำนวยการ|ผู้ริเริ่มคนแรก|โดยสำนักงานเขตพื้นที่|ได้รับการรับรองจากสำนักงานเขตพื้นที่/.test(footer[1]),'avoid boast/official designation');
assert.equal((html.match(/นายนพรุจ ลับบัวงาม/g)||[]).length,2,'only two low-key attribution placements');
assert.ok(css.includes('.sillapa-home-credit')&&css.includes('.sillapa-footer-about summary:focus-visible'),'subtle and keyboard focus styling');
assert.match(sw,/sillapa-public-v\d+-ia6-20261015/,'new PWA cache version for changed HTML/CSS');
assert.ok(sw.includes('./index.html')&&sw.includes('./ia1.css'),'changed assets covered by offline shell');
for(const [i,m] of [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].entries()){
  new vm.Script(m[1],{filename:'index.inline.credit.'+i+'.js'});
}
console.log('DEVELOPER CREDIT LOCAL PASS: discreet attribution, role, site disclaimer, accessibility, PWA cache and legacy footer');
