/**
 * D3D-R18A — drop-off crossing priority + touch-friendly R18 UI.
 * Local-First, no GitHub Actions.
 * node --test tests/d3d-r18a-crossing-mobile.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 BUILDING_DROPOFF_TIMING,DROPOFF_LINK_LIMITS,
 shouldVanWaitForLink,isVehicleInDropoffLink,
 shouldHoldFollowerAtDropoff,vehicleFootprintsConflict
} from '../venues/dropoff-r17.mjs';

const scene=readFileSync(new URL('../venues/schematic-3d.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const pose=(x,z,yaw=Math.PI/2)=>({visible:true,point:{x,z},yaw});
const clock=BUILDING_DROPOFF_TIMING;

test('a waiting van yields to either car already inside the cross-road link',()=>{
 const bay=pose(7,18.55);
 assert.equal(isVehicleInDropoffLink('front-park',pose(10,22)),true);
 assert.equal(isVehicleInDropoffLink('rear-parking',pose(13,23,0)),true);
 assert.equal(isVehicleInDropoffLink('front-park',pose(-10,22)),false);
 assert.equal(isVehicleInDropoffLink('rear-parking',pose(13,40,0)),false);
 for(const [route,other] of [
  ['front-park',pose(10,22)],['rear-parking',pose(13,23,0)]
 ]){
  assert.equal(shouldVanWaitForLink(bay,pose(7.01,18.55),
   route,other,clock.dwellEnd,clock.dwellEnd),true);
 }
 assert.equal(shouldVanWaitForLink(bay,pose(7.01,18.55),
  'front-park',pose(-9,22),clock.dwellEnd,clock.dwellEnd),false);
 assert.equal(shouldVanWaitForLink(bay,pose(7.01,18.55),
  'front-park',pose(10,22),clock.dwellEnd+.01,clock.dwellEnd),false,
  'committed van cannot suddenly lose right-of-way');
});

test('once the van moves out, new cars stop BEFORE reaching its turning envelope',()=>{
 const van=pose(10,20),start=clock.dwellEnd,end=clock.departEnd;
 assert.ok(DROPOFF_LINK_LIMITS.frontStopX<=-5.5);
 assert.ok(DROPOFF_LINK_LIMITS.rearStopZ<=9);
 assert.equal(shouldHoldFollowerAtDropoff('front-park',
  pose(-5.65,22),pose(-5.55,22),.52,van,start,end),true);
 assert.equal(shouldHoldFollowerAtDropoff('rear-parking',
  pose(13,8.45,0),pose(13,8.55,0),.52,van,start,end),true);
 assert.equal(shouldHoldFollowerAtDropoff('front-park',
  pose(0,22),pose(.3,22),.52,van,start,end),false,
  'car already inside clears first, avoiding mutual waiting');
 assert.equal(shouldHoldFollowerAtDropoff('front-park',
  pose(-5.65,22),pose(-5.55,22),start,van,start,end),false,
  'waiting van cannot reserve the road before it actually departs');
 assert.equal(shouldHoldFollowerAtDropoff('front-park',
  pose(-5.65,22),pose(-5.55,22),.52,pose(13,34,0),start,end),false,
  'follow car releases only when van completely clears crossing');
});

test('shared corridor still checks physical bodies before movement',()=>{
 assert.equal(vehicleFootprintsConflict(pose(10,22),pose(11.0,20.0),
  3.9,4.4,1.56,1.92,.65),true);
 assert.match(scene,/shouldVanWaitForLink\(currentPose,wanted,other\.route,occupied/);
 assert.match(scene,/shouldHoldFollowerAtDropoff\(b\.route,currentPose,wanted/);
 assert.match(scene,/const corridorBlocked=shouldHoldVehicleCorridor\(current,wanted/);
 assert.match(scene,/if\(corridorBlocked\|\|/);
 assert.match(scene,/if\(!canEnterMainRoad\(currentPose,wanted,highway\)\)blocked=true/);
});

test('route bar hides secondary actions behind one disclosure on small screens',()=>{
 assert.match(scene,/<details id="routeMore" class="wayfinding-more" open>/);
 assert.match(scene,/<summary aria-label="ขยายหรือยุบเครื่องมือนำทาง"/);
 assert.match(scene,/const mobileWayfindingQuery=window\.matchMedia\('\(max-width:680px\)'\)/);
 assert.match(scene,/wayfindingMore\.open=!event\.matches/);
 assert.match(scene,/mobileWayfindingQuery\.addEventListener\('change',syncWayfindingDisclosure\)/);
 assert.match(scene,/\.wayfinding-actions\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(scene,/#routeShow\{width:100%;min-height:46px\}/);
 assert.match(scene,/#routeShow\{background:#163852;color:#fff/);
});

test('every 3D scene action is reachable as a 44px touch target',()=>{
 for(const id of ['studentTour','toggleTraffic','togglePeople','toggleRoofs',
  'zoomIn','zoomOut','topView','resetView']){
  assert.match(scene,new RegExp('<button id="'+id+'" data-mobile-label="'));
 }
 assert.match(scene,/\.scene-tools\{display:grid;grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
 assert.match(scene,/\.scene-tools button\{min-height:44px;/);
 assert.match(scene,/\.scene-tools button\[data-mobile-label\]::after\{content:attr\(data-mobile-label\)/);
 assert.match(scene,/\.model-panel\.open~\.scene-tools\{display:none\}/);
 assert.match(scene,/studentTourButton\.dataset\.mobileLabel='⏹ หยุด'/);
 assert.match(scene,/e\.currentTarget\.dataset\.mobileLabel=trafficEnabled\?'🚗 รถ':'🚗 ปิด'/);
 assert.match(scene,/e\.currentTarget\.dataset\.mobileLabel=peopleVisible\?'👥 คน':'👥 ปิด'/);
});

test('mobile 3D starts closer to the venue and reset chooses the same framing',()=>{
 assert.match(scene,/getSceneCameraPreset\(true,mount\.clientWidth<680\)/);
 assert.match(scene,/#scene\{height:clamp\(485px,70svh,760px\);min-height:485px\}/);
 assert.match(scene,/bottom:max\(8px,env\(safe-area-inset-bottom\)\)/);
 assert.match(scene,/min-height:44px;touch-action:manipulation/);
});

test('PWA invalidates R18 files and launches refreshed R18A venue links',()=>{
 assert.match(sw,/sillapa-public-v32-3d-r20c-20261018/);
 assert.match(sw,/venues\/dropoff-r17\.mjs/);
 assert.match(sw,/venues\/wayfinding-r18\.mjs/);
 assert.match(index,/venue=kanchanaburi-pesa4&v=r20c/);
 assert.match(index,/venue=anuban-bophloi&v=r20c/);
});
