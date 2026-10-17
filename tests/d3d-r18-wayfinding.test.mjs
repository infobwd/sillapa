/**
 * D3D-R18 interactive wayfinding — Local-First regression suite.
 * Run: node --test tests/d3d-r18-wayfinding.test.mjs
 * No GitHub Actions, browser, live GPS, floor plan or venue APIs required.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 WAYFINDING_STOPS,WAYFINDING_NODE_COORDINATES,isWayfindingStop,
 buildingWayfindingStop,planWayfindingRoute,sampleWayfindingRoute,
 wayfindingHash,parseWayfindingHash
} from '../venues/wayfinding-r18.mjs';
import {inVehicleOnlyArea,fromVanToRegistrationWaypoints,
 fromRegistrationToBuildingWaypoints} from '../venues/dropoff-r17.mjs';

const scene=readFileSync(new URL('../venues/schematic-3d.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');

function segments(route,fn) {
 for(let i=1;i<route.points.length;i++){
  const a=route.points[i-1],b=route.points[i];
  for(let j=0;j<=100;j++){
   const t=j/100;
   fn([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,
    (a[2]||0)+((b[2]||0)-(a[2]||0))*t],route.nodeIds[i-1]);
  }
 }
}
const approx=(a,b)=>Math.abs(a-b)<.000001;

test('five explicit, unique Sillapa 74 planning stops are modeled',()=>{
 assert.deepEqual(WAYFINDING_STOPS.map(x=>x.id),
  ['dropoff','registration','building1','building2','meeting2']);
 assert.equal(new Set(WAYFINDING_STOPS.map(x=>x.id)).size,5);
 for(const entry of WAYFINDING_STOPS){
  assert.equal(isWayfindingStop(entry.id),true);
  assert.equal(WAYFINDING_NODE_COORDINATES[entry.id].length,3);
  assert.ok(entry.label.includes('จำลอง')||entry.id!=='meeting2');
 }
 assert.equal(isWayfindingStop('__proto__'),false);
 assert.equal(isWayfindingStop('meeting3'),false);
});

test('every distinct stop pair has a complete connected walk graph',()=>{
 for(const start of WAYFINDING_STOPS)for(const end of WAYFINDING_STOPS){
  const route=planWayfindingRoute(start.id,end.id);
  assert.equal(route.from,start.id);
  assert.equal(route.to,end.id);
  assert.equal(route.nodeIds[0],start.id);
  assert.equal(route.nodeIds.at(-1),end.id);
  assert.equal(route.points.length,route.nodeIds.length);
  assert.equal(route.schematic,true);
  assert.match(route.note,/จำลอง/);
  assert.ok(Number.isFinite(route.sceneDistance));
  if(start.id!==end.id)assert.ok(route.sceneDistance>0);
  const reverse=planWayfindingRoute(end.id,start.id);
  assert.ok(approx(reverse.sceneDistance,route.sceneDistance));
 }
});

test('route between drop-off and reception matches the R17B protected sidewalk',()=>{
 const route=planWayfindingRoute('dropoff','registration');
 const van=fromVanToRegistrationWaypoints(1);
 assert.deepEqual(route.points[0].slice(0,2),van[0].slice(0,2));
 assert.ok(route.nodeIds.includes('east118'));
 assert.ok(route.nodeIds.includes('domeApproach'));
 assert.deepEqual(route.points.at(-1).slice(0,2),[4.407,-5.75]);
 const onward=planWayfindingRoute('registration','meeting2');
 assert.ok(onward.nodeIds.includes('b1Stairs'));
 assert.deepEqual(onward.points.at(-1),[2.70,9.75,2.6]);
 assert.deepEqual(fromRegistrationToBuildingWaypoints(0,0).at(-1),
  onward.points.at(-1));
});

test('all routes avoid R17B vehicle-only drop-off zone, WC and external highway',()=>{
 const restrooms=[[-10.5,-7,5.9,10.1],[-10.5,-7,-6.1,-1.9]];
 for(const start of WAYFINDING_STOPS)for(const end of WAYFINDING_STOPS){
  const route=planWayfindingRoute(start.id,end.id);
  segments(route,p=>{
   assert.equal(inVehicleOnlyArea(p),false,start.id+'→'+end.id+' in dropoff bay');
   assert.ok(p[1]<17.24,'does not enter marked moving cross-road');
   for(const [xmin,xmax,zmin,zmax] of restrooms)
    assert.ok(p[0]<xmin||p[0]>xmax||p[1]<zmin||p[1]>zmax,
     'walkway cannot pass WC block');
  });
 }
});

test('Building 2 links to the east-side walkway without invented indoor stairs',()=>{
 const route=planWayfindingRoute('dropoff','building2');
 assert.ok(route.nodeIds.includes('rearEast'));
 assert.ok(!route.nodeIds.includes('b1Stairs'));
 assert.ok(route.points.every(p=>p[2]===0));
 assert.deepEqual(route.points.at(-1),[5.45,-11.5,0]);
});

test('interpolated animated marker clamps progress and follows elevation',()=>{
 const r=planWayfindingRoute('dropoff','meeting2');
 let at=sampleWayfindingRoute(r.points,0);
 assert.ok(approx(at.x,7)&&approx(at.z,16.52)&&approx(at.y,0));
 at=sampleWayfindingRoute(r.points,1);
 assert.ok(approx(at.x,2.7)&&approx(at.z,9.75)&&approx(at.y,2.6));
 assert.deepEqual(sampleWayfindingRoute(r.points,2),at);
 assert.deepEqual(sampleWayfindingRoute(r.points,-10),
  sampleWayfindingRoute(r.points,0));
 assert.deepEqual(sampleWayfindingRoute(r.points,Number.NaN),
  sampleWayfindingRoute(r.points,0));
 assert.throws(()=>sampleWayfindingRoute([],0),TypeError);
 let raised=false;
 for(let i=0;i<=100;i++)if(sampleWayfindingRoute(r.points,i/100).y>0.1)raised=true;
 assert.equal(raised,true);
});

test('clickable historic building labels map only to approved schematic stops',()=>{
 assert.equal(buildingWayfindingStop('อาคาร 1'),'building1');
 assert.equal(buildingWayfindingStop(' อาคาร   2 '),'building2');
 assert.equal(buildingWayfindingStop('อาคารโดม'),'registration');
 assert.equal(buildingWayfindingStop('ห้องเรียนอื่น'),null);
 assert.equal(buildingWayfindingStop('<script>'),null);
 assert.throws(()=>planWayfindingRoute('invalid','building1'),RangeError);
});

test('URL fragment validates known identifiers and supports browser back',()=>{
 const hash=wayfindingHash('dropoff','meeting2');
 assert.equal(hash,'#wayfinding=dropoff:meeting2');
 assert.deepEqual(parseWayfindingHash(hash),{from:'dropoff',to:'meeting2'});
 assert.equal(parseWayfindingHash('#wayfinding=dropoff:evil'),null);
 assert.equal(parseWayfindingHash('#wayfinding=dropoff:__proto__'),null);
 assert.equal(parseWayfindingHash('#wayfinding=%3Cscript%3E:meeting2'),null);
 assert.equal(parseWayfindingHash('#x=1'),null);
 assert.equal(wayfindingHash('invalid','registration'),'');
 assert.match(scene,/location\.hash=hash/);
 assert.match(scene,/window\.addEventListener\('hashchange',applyWayfindingHash\)/);
 assert.match(scene,/function applyWayfindingHash\(\)/);
});

test('accessible selector/buttons, active route control and disabled second venue',()=>{
 for(const id of ['wayfindingBar','routeFrom','routeTo','routeShow',
  'routeOverview','routeFollow','vehicleFollow','routeLayer',
  'routeClear','routeStatus','wayfindingTip']){
  assert.match(scene,new RegExp('id="'+id+'"'));
 }
 assert.match(scene,/aria-label="เส้นทางเดินในฉาก 3D"/);
 assert.match(scene,/wayfindingFrom\.value='dropoff'/);
 assert.match(scene,/wayfindingTo\.value='registration'/);
 assert.match(scene,/setWayfindingControlsAvailability\(false\)/);
 assert.match(scene,/if\(district\)createWayfindingPins\(\);applyWayfindingHash\(\)/);
 assert.match(scene,/function setWayfindingSelection\(from,to\)/);
 assert.match(scene,/const routeStop=buildingWayfindingStop\(g\.label\)/);
 assert.match(scene,/const pin=hit\.object\.userData\.wayfindingStop/);
 assert.match(scene,/wayfindingShowButton\.focus\(\)/);
 assert.match(scene,/if\(e\.key==='Escape'&&wayfindingRoute\)/);
});

test('the 3D layer draws line, arrow, endpoints and followable animated marker',()=>{
 assert.match(scene,/function renderWayfindingGeometry\(route\)/);
 assert.match(scene,/new THREE\.LineDashedMaterial\(/);
 assert.match(scene,/new THREE\.ConeGeometry\(\.31,\.78,7\)/);
 assert.match(scene,/new THREE\.RingGeometry\(\.45,\.67,24\)/);
 assert.match(scene,/new THREE\.SphereGeometry\(\.38,12,8\)/);
 assert.match(scene,/const pose=sampleWayfindingRoute\(wayfindingRoute\.points,fraction\)/);
 assert.match(scene,/wayfindingMarker\.position\.set\(pose\.x,pose\.y\+\.82,pose\.z\)/);
 assert.match(scene,/function animateWayfindingFollow\(t\)/);
 assert.match(scene,/animateStudentTour\(t\);animateWayfindingFollow\(t\);controls\.update\(\)/);
 assert.match(scene,/controls\.target\.lerp\(target,\.065\)/);
 assert.match(scene,/const hash=wayfindingHash\(from,to\)/);
});

test('layers and camera modes do not compete with R17B student tour or vehicle motion',()=>{
 assert.match(scene,/if\(studentTourOn\)stopStudentTour\(\)/);
 assert.match(scene,/stopWayfindingFollow\(\);\s*studentTourOn=true/);
 assert.match(scene,/wayfindingGroup\.visible=!wayfindingHidden/);
 assert.match(scene,/if\(wayfindingFollowMode==='route'\)stopWayfindingFollow\(\)/);
 assert.match(scene,/if\(wayfindingFollowMode==='vehicle'\)stopWayfindingFollow\(\)/);
 assert.match(scene,/wayfindingFollowVehicle=buses\.find\(b=>b\.route==='building-dropoff'\)/);
 assert.match(scene,/if\(!trafficEnabled&&wayfindingFollowMode==='vehicle'\)stopWayfindingFollow\(\)/);
 assert.match(scene,/document\.querySelector\('#topView'\)\.addEventListener\('click',\(\)=>\{stopWayfindingFollow\(\)/);
 assert.match(scene,/document\.querySelector\('#resetView'\)\.addEventListener\('click',\(\)=>\{stopWayfindingFollow\(\)/);
 assert.match(scene,/if\(wayfindingGroup\)wayfindingGroup\.visible=false/);
});

test('the R18 release updates public PWA without touching score or registration',()=>{
 assert.match(sw,/sillapa-public-v25-3d-r18-20261017/);
 assert.match(sw,/venues\/wayfinding-r18\.mjs/);
 assert.match(sw,/venues\/dropoff-r17\.mjs/);
 assert.match(index,/venue=kanchanaburi-pesa4&v=r18/);
 assert.match(index,/venue=anuban-bophloi&v=r18/);
 assert.match(scene,/ไม่ใช่เส้นทางจริง/);
 assert.match(scene,/ผังอาคารจริงหรือแผนที่นำทาง/);
});
