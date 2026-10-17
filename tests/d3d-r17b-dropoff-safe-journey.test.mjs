/**
 * D3D-R17B: owner screenshot regressions for drop-off vegetation, people,
 * van/follower safety and an immediately visible pupil journey.
 * Local-only: node --test tests/d3d-r17b-dropoff-safe-journey.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 SAFE_ALIGHT_Z,PEDESTRIAN_EXCLUSION,inVehicleOnlyArea,
 fromVanToRegistrationWaypoints,fromRegistrationToBuildingWaypoints,
 registrationPhase,shouldHoldFollowerAtDropoff,shouldHoldVehicleCorridor,
 vehicleFootprintsConflict,BUILDING_DROPOFF_TIMING
} from '../venues/dropoff-r17.mjs';

const scene=readFileSync(new URL('../venues/schematic-3d.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const pose=(x,z,yaw=Math.PI/2)=>({visible:true,point:{x,z},yaw});

function walkSample(route,fn){
 for(let i=1;i<route.length;i++){
  const p=route[i-1],q=route[i];
  for(let j=0;j<=100;j++){
   const t=j/100;
   fn([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t],i);
  }
 }
}

test('two shrubs that previously overlapped pickup/van bay are no longer placed',()=>{
 assert.match(scene,/const rightDropoff=x===9\.5/);
 assert.match(scene,/if\(rightDropoff\)continue; \/\/ R17B: remove the two trees/);
 assert.match(scene,/rightDropoff\?4\.2:7/);
 assert.match(scene,/rightDropoff\?14\.7:16\.2/);
 assert.equal(inVehicleOnlyArea([5.1,18.4]),true);
 assert.equal(inVehicleOnlyArea([8.5,18.4]),true);
 assert.equal(inVehicleOnlyArea([7.2,SAFE_ALIGHT_Z]),false);
 assert.ok(SAFE_ALIGHT_Z<PEDESTRIAN_EXCLUSION.minZ-.5);
});

test('ambient walkers start inside the protected sidewalk, not at z=19 in bay',()=>{
 assert.match(scene,/\[\[6\.12,16\.42\],\[6\.12,15\.3\]/);
 assert.doesNotMatch(scene,/\[\[5\.5,19\],\[6\.12,17\]/);
 for(const p of [[6.12,16.42],[6.12,15.3],[6.12,11.2]])
  assert.equal(inVehicleOnlyArea(p),false);
});

test('ALL four van passengers reach dome before Building 1 upstairs, clear of vehicle bay',()=>{
 assert.match(scene,/const enter=fromVanToRegistrationWaypoints\(j\)/);
 assert.match(scene,/const onward=fromRegistrationToBuildingWaypoints\(line,slot\)/);
 assert.match(scene,/const line=j%2,slot=Math\.floor\(j\/2\)/);
 assert.doesNotMatch(scene,/const route=\[\[7\+offset,16\.95\]/);
 for(let j=0;j<4;j++){
  const arrive=fromVanToRegistrationWaypoints(j);
  const depart=fromRegistrationToBuildingWaypoints(j%2,Math.floor(j/2));
  assert.equal(arrive[0][1],SAFE_ALIGHT_Z);
  assert.deepEqual(arrive.at(-1),depart[0]);
  assert.deepEqual(depart.at(-1),[2.70,9.75,2.6]);
  for(const route of [arrive,depart])
   walkSample(route,p=>assert.equal(inVehicleOnlyArea(p),false,
    'student route must not enter moving-vehicle/parking zone'));
 }
 for(const [q,step] of [[.42,'to-dome'],[.74,'queue'],[.82,'to-building'],[.93,'arrived']])
  assert.equal(registrationPhase(q,.398).step,step);
});

test('following pickup waits upstream while van holds the link reservation',()=>{
 const van=pose(9.1,18.55),depart=BUILDING_DROPOFF_TIMING;
 assert.equal(shouldHoldFollowerAtDropoff('front-park',
  pose(-5.64,22),pose(-5.58,22),.50,van,depart.dwellEnd,depart.departEnd),true);
 assert.equal(shouldHoldFollowerAtDropoff('front-park',
  pose(-5.64,22),pose(-5.58,22),.40,van,depart.dwellEnd,depart.departEnd),false);
 assert.equal(shouldHoldFollowerAtDropoff('front-park',
  pose(0,22),pose(.2,22),.50,van,depart.dwellEnd,depart.departEnd),false,
  'cars already crossing must clear; van waits before entry');
 assert.equal(shouldHoldFollowerAtDropoff('rear-parking',
  pose(13,8.48,0),pose(13,8.52,0),.50,van,depart.dwellEnd,depart.departEnd),true);
 assert.match(scene,/shouldHoldFollowerAtDropoff\(b\.route,currentPose,wanted/);
});

test('swept vehicle envelope prevents pickup from overtaking or hitting departing van',()=>{
 const van=pose(11.4,19.1),vanNext=pose(12.9,21.0,.6);
 const pickup=pose(9.0,22),pickupNext=pose(12.0,22);
 assert.equal(shouldHoldVehicleCorridor(pickup,pickupNext,van,vanNext,
  3.9,4.4,1.56,1.92,false),true,'pickup must yield to turning van');
 assert.equal(vehicleFootprintsConflict(pose(-4,22),van,3.9,4.4,1.56,1.92,.65),false);
 assert.equal(shouldHoldVehicleCorridor(pose(-5,22),pose(-4.9,22),van,vanNext,
  3.9,4.4,1.56,1.92,false),false,'far car can approach freely');
 assert.match(scene,/const corridorBlocked=shouldHoldVehicleCorridor\(current,wanted/);
 assert.match(scene,/if\(corridorBlocked\|\|/);
});

test('45-second sequential rear-end avoidance keeps moving follower clear',()=>{
 let vanX=7.0,carX=-8.0,held=0,vanSteps=0;
 for(let frame=0;frame<45*60;frame++){
  const dt=1/60;
  const van=pose(vanX,18.55);
  const vanNext=pose(Math.min(13,vanX+dt*.50),18.55);
  const car=pose(carX,22),candidate=pose(Math.min(13,carX+dt*1.1),22);
  if(!shouldHoldVehicleCorridor(van,vanNext,car,car,4.4,3.9,1.92,1.56,true)){
   vanX=vanNext.point.x;vanSteps++;
  }
  const reserved=shouldHoldFollowerAtDropoff('front-park',car,candidate,
   frame<30*60?.51:.70,pose(vanX,18.55),
   BUILDING_DROPOFF_TIMING.dwellEnd,BUILDING_DROPOFF_TIMING.departEnd);
  if(!reserved&&!shouldHoldVehicleCorridor(car,candidate,
    pose(vanX,18.55),pose(vanX,18.55),3.9,4.4,1.56,1.92,false))
   carX=candidate.point.x;
  else held++;
 }
 assert.ok(vanSteps>100,'van is able to leave its bay');
 assert.ok(held>0,'following pickup sees a reservation');
 assert.ok(carX>0,'pickup eventually enters after the van clears');
});

test('visible guided journey has a real interaction, moving students and stage HUD',()=>{
 assert.match(scene,/id="studentTour"/);
 assert.match(scene,/id="studentTourStatus"/);
 assert.match(scene,/studentTourButton\.addEventListener\('click'/);
 assert.match(scene,/function buildStudentTour\(\)/);
 assert.match(scene,/function animateStudentTour\(t\)/);
 assert.match(scene,/if\(local<16\)pose=studentJourneyPoint\(arrival,local\/16\)/);
 assert.match(scene,/else if\(local<22\)pose=studentJourneyPoint\(arrival,1\)/);
 assert.match(scene,/else if\(local<39\)pose=studentJourneyPoint\(onward,\(local-22\)\/17\)/);
 assert.match(scene,/figure\.visible=true;figure\.scale\.setScalar\(1\.45\)/);
 assert.match(scene,/controls\.target\.lerp\(target,\.065\)/);
 assert.match(scene,/studentTourGroup\.visible=true;studentTourStatus\.hidden=false/);
 assert.match(scene,/animateStudentTour\(t\);animateWayfindingFollow\(t\);\s*controls\.update\(\)/);
 assert.match(scene,/studentTourButton\.disabled=!district/);
 assert.match(scene,/if\(studentTourOn\)stopStudentTour\(\)/);
 assert.match(scene,/roofVisible=false;/);
 assert.match(scene,/studentTourStatus\.textContent=stage/);
});

test('existing road/competition records remain out of R17B scope and PWA refreshes',()=>{
 assert.match(scene,/canEnterMainRoad\(currentPose,wanted,highway\)/);
 assert.match(scene,/canAdvanceInboundRoad\(currentPose,wanted,highway\)/);
 assert.match(scene,/registrationPhase\(q,start\)/);
 assert.match(sw,/sillapa-public-v28-3d-r19b-20261017/);
 assert.match(sw,/venues\/dropoff-r17\.mjs/);
 assert.match(index,/venue=kanchanaburi-pesa4&v=r19b/);
 assert.match(index,/venue=anuban-bophloi&v=r19b/);
});
