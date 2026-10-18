import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {executiveSnapshot,formatExecutiveSourceNotice} from '../venues/executive-r20c.mjs';
const scene=readFileSync(new URL('../venues/schematic-3d.html',import.meta.url),'utf8');
const src=JSON.parse(readFileSync(new URL('../venues/history73.json',import.meta.url),'utf8'));
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function lum(hex){const v=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722}
function ratio(a,b){const [hi,lo]=[lum(a),lum(b)].sort((a,b)=>b-a);return (hi+.05)/(lo+.05)}
test('follow controls remain legible even when disabled on mobile',()=>{
 assert.ok(ratio('#33485d','#e0e7ef')>=4.5);
 assert.ok(ratio('#ffffff','#155777')>=4.5);
 assert.match(scene,/#routeFollow:disabled,/);
 assert.match(scene,/#studentTour:disabled,/);
 assert.match(scene,/background:#e0e7ef;border-color:#8596ac;color:#33485d;opacity:1/);
 assert.match(scene,/#studentTour:disabled::after/);
 assert.match(scene,/#routeFollow:not\(:disabled\)/);
});
test('walking route button explains the prerequisite and offers plain Thai actions',()=>{
 assert.match(scene,/id="routeFollow"[^>]*aria-describedby="routeStatus"[^>]*disabled/);
 assert.match(scene,/title="กดแสดงเส้นทางก่อน จึงดูตัวอย่างการเดินได้"/);
 assert.match(scene,/wayfindingFollowButton\.disabled=!district\|\|!wayfindingRoute\|\|wayfindingHidden/);
 assert.match(scene,/wayfindingFollowButton\.title=wayfindingFollowButton\.disabled/);
 assert.match(scene,/▶ ดูตัวอย่างการเดิน/);
 assert.match(scene,/🚐 ดูรถตู้วิ่ง/);
 assert.match(scene,/data-mobile-label="👣 เด็กเดิน"/);
});
test('dashboard explains table-based, potentially repeated historical records',()=>{
 for(const phrase of ['สนามที่มีข้อมูลครั้งที่ 73','รายการที่บันทึกไว้ทั้งหมด','รายการของสนามที่เลือก','อาคารที่มีข้อมูล','อาจมีกิจกรรมซ้ำกัน','ไม่ใช่จำนวนทีมสมัครแข่งขัน','เลือกอาคารที่ต้องการดู'])assert.ok(scene.includes(phrase),phrase);
 for(const oldPhrase of ['สนามที่มีข้อมูลย้อนหลัง','แถวในตารางย้อนหลังรวม','กลุ่มอาคารที่อ้างถึง'])assert.ok(!scene.includes(oldPhrase));
});
test('two historical venues and source row totals remain unchanged',()=>{
 const district=executiveSnapshot(src.venues,'kanchanaburi-pesa4');
 const school=executiveSnapshot(src.venues,'anuban-bophloi');
 assert.deepEqual([district.venueCount,district.totalHistoricalRows,district.selectedRows,school.selectedRows],[2,98,45,53]);
 assert.equal(district.hasApproved74Data,false);
 assert.match(formatExecutiveSourceNotice(district),/ยังไม่มีข้อมูลยืนยันความพร้อมครั้งที่ 74/);
 assert.ok(!formatExecutiveSourceNotice(district).includes('45 แถว'));
});
test('route motion and traffic collision routines are unchanged',()=>{
 assert.match(scene,/dropoffJunctionEntry\(b,b\.progress,next,currentPose,wanted\)/);
 assert.match(scene,/function animateStudentTour\(t\)/);
 assert.match(scene,/function animateWayfindingFollow\(t\)/);
 assert.match(scene,/function renderExecutiveDashboard\(venue\)/);
 assert.match(scene,/รถ คน และทางเดินเป็นภาพจำลอง/);
});
test('PWA v33 refreshes scene links',()=>{
 assert.match(sw,/sillapa-public-v33-3d-r20c1-20261018/);
 assert.match(index,/venue=kanchanaburi-pesa4&v=r20c1/);
 assert.match(index,/venue=anuban-bophloi&v=r20c1/);
});
