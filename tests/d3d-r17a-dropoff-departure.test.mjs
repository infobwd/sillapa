/**
 * D3D-R17A: check the reported stopped-van / blocked-pickup behavior.
 * Local-only: node --test tests/d3d-r17a-dropoff-departure.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 BUILDING_DROPOFF_TIMING,FRONT_PARK_TIMING,DROP_OFF_BAY,
 vehicleFootprintMargin,vehicleOverlapDepth,vehicleFootprintsConflict,
 mustYieldAtDropoff,shouldHoldDropoffRelease
} from '../venues/dropoff-r17.mjs';

const scene=readFileSync(new URL('../venues/schematic-3d.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const pose=(x,z,yaw=Math.PI/2)=>({visible:true,point:{x,z},yaw});
const vanLength=4.4,pickupLength=3.9,vanWidth=1.92,pickupWidth=1.56;
const hold=(current,wanted,other,departing=true)=>
 shouldHoldDropoffRelease(current,wanted,other,
  vanLength,pickupLength,vanWidth,pickupWidth,departing);

test('completed unloading has bounded dwell then must enter departure phase',()=>{
 const van=BUILDING_DROPOFF_TIMING,pickup=FRONT_PARK_TIMING;
 assert.equal(van.arrivalEnd,.38);
 assert.ok(van.dwellEnd> .434,'last of 4 pupils alights before van leaves');
 assert.ok((van.dwellEnd-van.arrivalEnd)/.009<11,'van unloads in under 11 seconds');
 assert.ok((van.dwellEnd-van.arrivalEnd)/.009>7,'van pauses visibly for children');
 assert.ok((pickup.reverseStart-pickup.arrivalEnd)/.010<=10.01);
 assert.ok(pickup.reverseStart<pickup.reverseEnd);
 assert.ok(pickup.reverseEnd<pickup.departEnd);
 assert.ok(van.dwellEnd<van.departEnd&&van.departEnd<.94);
 assert.match(scene,/const clock=BUILDING_DROPOFF_TIMING/);
 assert.match(scene,/if\(q<clock\.dwellEnd\)/);
 assert.match(scene,/if\(q<clock\.departEnd\)/);
 assert.match(scene,/const clock=FRONT_PARK_TIMING/);
 assert.match(scene,/if\(q<clock\.reverseEnd\)/);
});

test('dedicated van exit pulls east of cross-road before turning north',()=>{
 assert.equal(DROP_OFF_BAY.x,7);
 assert.equal(DROP_OFF_BAY.z,18.55);
 const path=[
  [7,18.55],[9.25,18.55],[11.35,18.55],[13,19.0],
  [13,23.7],[13,29],[13,38],[13,43.8]
 ];
 for(const [x,z] of path){
  if(z>=20)assert.ok(x>=12.9,'northbound segment stays in east side road');
 }
 assert.match(scene,/\[DROP_OFF_BAY\.x,DROP_OFF_BAY\.z\],\[9\.25,18\.55\]/);
 assert.match(scene,/\[11\.35,18\.55\],\[13,19\.0\],\[13,23\.7\]/);
 assert.doesNotMatch(scene,/\[9\.2,19\.15\],\s*\[10,22\]/);
 assert.match(scene,/b\.route==='building-dropoff'&&b\.progress>=BUILDING_DROPOFF_TIMING\.dwellEnd/);
});

test('vehicle trying to drive deeper into a parked pickup is held',()=>{
 const now=pose(7,18.55),other=pose(9,20.6);
 const into=pose(7.02,18.55);
 assert.ok(vehicleFootprintsConflict(into,other,4.4,3.9,1.92,1.56,.85));
 assert.equal(hold(now,into,other,true),true,'van must yield when closing gap');
 assert.equal(hold(now,into,other,false),true,'non-departing van must also yield');
 const newOverlap=hold(pose(4,18.55),pose(7.02,18.55),other,true);
 assert.equal(newOverlap,true,'do not create a new overlap just to force movement');
});

test('previously crowded drop-off can release van by reducing overlap',()=>{
 const pickup=pose(5,20.6);
 let x=7,moved=0,previous=Infinity;
 for(let i=0;i<220;i++){
  const current=pose(x,18.55),wanted=pose(x+.03,18.55);
  const depth=vehicleOverlapDepth(current,pickup,vanLength,pickupLength,vanWidth,pickupWidth);
  assert.ok(depth<=previous+.0001,'penetration cannot worsen');
  previous=depth;
  assert.equal(hold(current,wanted,pickup,true),false,'safe van escape should never deadlock');
  x+=.03;moved++;
 }
 assert.ok(x>13.5);
 assert.equal(moved,220);
 assert.ok(vehicleFootprintMargin(pose(x,18.55),pickup,
  vanLength,pickupLength,vanWidth,pickupWidth)>=0,'van separated from pickup');
});

test('van yields while pickup approaches then continues after lane clears',()=>{
 const van=pose(7,18.55),candidate=pose(7.02,18.55);
 let pickupX=9,held=0,released=false;
 for(let frame=0;frame<300;frame++){
  const pickup=pose(pickupX,20.6);
  if(hold(van,candidate,pickup,true))held++;
  else {released=true;break}
  pickupX+=.02;
 }
 assert.ok(held>0,'must yield when pickup still overlaps');
 assert.ok(released,'must eventually depart after pickup clears its side');
});

test('outbound / inbound highway guards and passenger path remain intact',()=>{
 assert.match(scene,/canEnterMainRoad\(currentPose,wanted,highway\)/);
 assert.match(scene,/canAdvanceInboundRoad\(currentPose,wanted,highway\)/);
 assert.match(scene,/registrationPhase\(q,start\)/);
 assert.match(scene,/fromRegistrationToBuildingWaypoints\(line,j\)/);
 assert.match(scene,/const pointBlocked=gap<gapLimit&&!releasingAway/);
 assert.match(scene,/shouldHoldDropoffRelease\(current,wanted,pose/);
});

test('PWA R17A cache refresh and both shortcut URLs',()=>{
 assert.match(sw,/sillapa-public-v29-3d-r20a-20261017/);
 assert.match(sw,/venues\/dropoff-r17\.mjs/);
 assert.match(index,/venue=kanchanaburi-pesa4&v=r20a/);
 assert.match(index,/venue=anuban-bophloi&v=r20a/);
});
