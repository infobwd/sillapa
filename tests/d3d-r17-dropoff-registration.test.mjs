/**
 * D3D-R17 — local-only acceptance tests (no GitHub Actions).
 * node --test tests/d3d-r17-dropoff-registration.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 DROP_OFF_BAY,DOME_QUEUES,inDropoffZone,vehicleFootprintsConflict,
 mustYieldAtDropoff,registrationQueuePoint,toRegistrationWaypoints,
 fromRegistrationToBuildingWaypoints,registrationPhase
} from '../venues/dropoff-r17.mjs';

const scene=readFileSync(new URL('../venues/schematic-3d.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const pose=(x,z,yaw=Math.PI/2)=>({visible:true,point:{x,z},yaw});

test('body-based curbside spacing holds approaching vehicles but lets passing cars use road',()=>{
 const parked=pose(7,18.55);
 const passing=pose(7,22);
 assert.equal(DROP_OFF_BAY.x,7);
 assert.equal(DROP_OFF_BAY.z,18.55);
 assert.equal(inDropoffZone(passing.point),true);
 assert.equal(mustYieldAtDropoff(passing,parked,4.2,4.4,1.6,1.92),false,
  'car moving in separate lane should not stop due to arbitrary center distance');
 assert.equal(mustYieldAtDropoff(pose(7.2,19.5),parked,4.2,4.4,1.6,1.92),true);
 assert.equal(mustYieldAtDropoff(pose(3,22),pose(7.3,22),4.2,4.4,1.7,1.92),true,
  'following car with 4.3 m center gap must yield');
 assert.equal(mustYieldAtDropoff(pose(1,22),pose(7.3,22),4.2,4.4,1.7,1.92),false);
 assert.equal(vehicleFootprintsConflict({...passing,visible:false},parked,4.4,4.4),false);
 assert.equal(mustYieldAtDropoff(pose(18,22),parked,4.2,4.4),false,'other parcel');
});

test('five-minute repeated curbside pass avoids the parked van and close followers wait',()=>{
 const van=pose(7,18.55),carA={x:-10},carB={x:-13.5};
 let advancedA=0,advancedB=0,held=0;
 for(let frame=0;frame<300*60;frame++){
  const dt=1/60;
  const nextA=carA.x+dt*1.5,nextB=carB.x+dt*1.5;
  const bodyA=pose(nextA,22),bodyB=pose(nextB,22);
  if(nextA>12)carA.x=-18;
  else if(!mustYieldAtDropoff(bodyA,van,3.9,4.4,1.75,1.92)){carA.x=nextA;advancedA++}
  if(nextB>12)carB.x=-18;
  else if(!mustYieldAtDropoff(bodyB,van,3.9,4.4,1.75,1.92)
    &&!mustYieldAtDropoff(bodyB,pose(carA.x,22),3.9,3.9,1.75,1.75)){
   carB.x=nextB;advancedB++;
  }else held++;
  if(carA.x>=-12&&carA.x<=12)
   assert.equal(vehicleFootprintsConflict(pose(carA.x,22),van,3.9,4.4,1.75,1.92,.85),false);
 }
 assert.ok(advancedA>1000,'lead car passes drop-off');
 assert.ok(advancedB>200,'second car eventually advances');
 assert.ok(held>0,'following driver observes clear spacing');
});

test('drop-off vehicle pulls off cross-road and uses a marked waiting bay',()=>{
 assert.match(scene,/const toBuilding=pointsToCurve\(\[[\s\S]*\[3\.1,19\.65\],\[5\.5,18\.55\],\[DROP_OFF_BAY\.x,DROP_OFF_BAY\.z\]/);
 assert.match(scene,/const fromBuilding=pointsToCurve\(\[[\s\S]*\[DROP_OFF_BAY\.x,DROP_OFF_BAY\.z\],\[9\.25,18\.55\]/);
 assert.match(scene,/slab\(7\.2,2\.55,6\.65,18\.55/);
 assert.match(scene,/slab\(7\.4,\.72,6\.7,16\.88/);
 assert.match(scene,/inBayZone&&bodyBlocked/);
 assert.match(scene,/shouldHoldDropoffRelease\(current,wanted,pose/);
 assert.match(scene,/for\(const staff of registrationStaff\)staff\.visible=peopleVisible/);
});

function distanceToRect(route,[xmin,xmax,zmin,zmax]){
 let nearest=Infinity;
 for(let i=1;i<route.length;i++){
  let a=route[i-1],b=route[i];
  for(let k=0;k<=200;k++){
   const u=k/200,x=a[0]+(b[0]-a[0])*u,z=a[1]+(b[1]-a[1])*u;
   const dx=Math.max(xmin-x,0,x-xmax),dz=Math.max(zmin-z,0,z-zmax);
   nearest=Math.min(nearest,Math.hypot(dx,dz));
  }
 }
 return nearest;
}
test('six queue spots are distinct and route around both restroom blocks and sign',()=>{
 assert.equal(DOME_QUEUES.length,2);
 const six=[];
 for(let line=0;line<2;line++){
  for(let slot=0;slot<3;slot++){
   const q=registrationQueuePoint(line,slot);
   six.push(q.join(','));
   const route=toRegistrationWaypoints(-8.4,line,slot);
   const leave=fromRegistrationToBuildingWaypoints(line,slot);
   assert.deepEqual(route.at(-1),q);
   assert.deepEqual(leave[0],q);
   for(const leg of [route,leave]){
    assert.ok(distanceToRect(leg,[-10.5,-7,5.9,10.1])>.3,'Building 1 WC');
    assert.ok(distanceToRect(leg,[-10.5,-7,-6.1,-1.9])>.3,'dome WC');
   }
   assert.ok(leave.some(p=>p[0]===6.12&&p[1]===11.8),'east-side Building 1 sign bypass');
   assert.ok(q[0]>3.8&&q[0]<5.1,'queue on desk-facing EAST dome end');
   assert.ok(q[0]-DOME_QUEUES[line].deskX>=.6,'queue spot in front of table');
   assert.ok(distanceToRect(route,[-5.0,-3.2,-6.8,-1.2])>.3,'avoids west-end dome stage');
   assert.ok(distanceToRect(route,[-1.1,2.0,-6.7,-1.3])>.3,'avoids red audience chairs');
   assert.deepEqual(leave.at(-1),[2.70,9.75,2.6]);
   assert.ok(leave.some(p=>p[0]===6.12&&p[1]===-1.15),'exit via dome EAST opening');
  }
 }
 assert.equal(new Set(six).size,6);
});

test('visible registration stage sequence includes queue dwell and onward upstairs',()=>{
 for(const index of [0,1,2]){
  const start=.316+index*.012;
  assert.equal(registrationPhase(start-.001,start).step,'not-unloaded');
  assert.equal(registrationPhase(.65,start).step,'to-dome');
  assert.equal(registrationPhase(.74,start).step,'queue');
  assert.equal(registrationPhase(.86,start).step,'to-building');
  assert.equal(registrationPhase(.93,start).step,'arrived');
 }
 assert.match(scene,/const phase=registrationPhase\(q,start\),line=b\.queueLine\|\|0/);
 assert.match(scene,/toRegistrationWaypoints\(b\.bay\[0\]-1\.4-j\*\.34,line,j\)/);
 assert.match(scene,/fromRegistrationToBuildingWaypoints\(line,j\)/);
 assert.match(scene,/if\(phase\.step==='queue'\)/);
});

test('dome contains two reception desks and two staff, clear of the original stage',()=>{
 assert.match(scene,/const reception=new THREE\.Group\(\);group\.add\(reception\)/);
 assert.match(scene,/for\(const lane of \[-1\.75,1\.75\]\)/);
 assert.match(scene,/receptionBox\(2\.35,\.12,\.78,lane,\.91,4\.12,receptionWood\)/);
 assert.match(scene,/for\(const distance of \[5\.0,5\.65,6\.30\]\)/);
 assert.match(scene,/staffRoot\.add\(staff\)/);
 assert.match(scene,/registrationStaff\.push\(staffRoot\)/);
 assert.match(scene,/makeBuildingLabel\('ลงทะเบียน \(จำลอง\)'/);
 assert.match(scene,/makeBuildingLabel\('ห้องประชุม ชั้น 2 \(จำลอง\)'/);
 assert.match(scene,/stage\.position\.set\(0,\.48,-5\.25\)/);
 assert.match(scene,/officeRoofs\.push\(roof\);roof\.visible=roofVisible/);
 assert.match(scene,/roofToggle\.textContent=roofVisible\?'🏠 หลังคา':'🏠 ดูภายใน'/);
});

test('R17 service worker and both venue URLs refresh with drop-off helper',()=>{
 assert.match(sw,/sillapa-public-v32-3d-r20c-20261018/);
 assert.match(sw,/venues\/dropoff-r17\.mjs/);
 assert.match(sw,/venues\/traffic-r16\.mjs/);
 assert.match(sw,/venues\/vehicle-models-r16b\.mjs/);
 assert.match(index,/venue=kanchanaburi-pesa4&v=r20c/);
 assert.match(index,/venue=anuban-bophloi&v=r20c/);
});
