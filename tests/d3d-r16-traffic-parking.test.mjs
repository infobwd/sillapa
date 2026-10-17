/**
 * D3D-R16: local-only, no browser/CI quota required.
 * Run: node --test tests/d3d-r16-traffic-parking.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {computeHighwayProgress,canEnterMainRoad} from '../venues/traffic-r16.mjs';

const scene=readFileSync(new URL('../venues/schematic-3d.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');

function makeLane(direction=1,lane=49.25){
 return [0,38,76].map(p=>({lane,direction,speed:2.9,travel:114,highwayProgress:p}));
}
function laneHeadway(cars){
 const values=cars.map(c=>c.highwayProgress).sort((a,b)=>a-b);
 return Math.min(...values.map((p,i)=>(values[(i+1)%values.length]-p+114)%114));
}

test('300-second mixed-lane run stays mobile and maintains at least 10-unit headway',()=>{
 const a=makeLane(1),b=makeLane(-1,54.75);
 let busTravel=0;
 for(let frame=0;frame<300*60;frame++){
  const t=frame/60;
  const occupant=t>40&&t<56?{x:18+(t-40)*1.9,z:49.25}:null;
  const updates=computeHighwayProgress([...a,...b],occupant?[occupant]:[],1/60);
  for(const car of [...a,...b]){
   const before=car.highwayProgress;
   car.highwayProgress=updates.get(car);
   if(car===a[0])busTravel+=(car.highwayProgress-before+car.travel)%car.travel;
  }
  assert.ok(laneHeadway(a)>=9.999,'eastbound headway');
  assert.ok(laneHeadway(b)>=9.999,'westbound headway');
 }
 assert.ok(busTravel>200,'bus progresses after temporary merged-vehicle follow');
});

test('highway cars do not wait for vehicles queued before merge line',()=>{
 const highway=makeLane(1);
 const updates=computeHighwayProgress(highway,[],1);
 assert.ok(updates.get(highway[0])>highway[0].highwayProgress);
 // The car is stopped BEFORE its body protrudes into the highway.
 const current={visible:true,onHighway:false,point:{x:13,z:43.8}};
 const wanted={visible:true,onHighway:true,point:{x:13,z:43.8}};
 const approaching=[{lane:49.25,direction:1,travel:114,highwayProgress:72,speed:2.9}];
 assert.equal(canEnterMainRoad(current,wanted,approaching),false);
 assert.equal(canEnterMainRoad(current,wanted,[]),true);
 assert.equal(canEnterMainRoad({...current,onHighway:true,point:{x:17,z:49.25}},wanted,approaching),true);
 assert.equal(canEnterMainRoad(current,wanted,[{...approaching[0],lane:54.75,direction:-1}]),true);
});

test('main-road vehicle follows only an already-merged occupant',()=>{
 const car={lane:49.25,direction:1,travel:114,speed:2.9,highwayProgress:72};
 assert.equal(computeHighwayProgress([car],[{x:18,z:49.25}],1).get(car),72);
 assert.ok(computeHighwayProgress([car],[{x:18,z:54.75}],1).get(car)>72);
});

test('Building 1 paths bypass the actual sign x ±5.65 at z=12.6',()=>{
 assert.match(scene,/\[\[5\.5,19\],\[6\.12,17\],\[6\.12,14\.7\]/);
 assert.match(scene,/const bypassX=6\.09\+j\*\.055/);
 for(let passenger=0;passenger<4;passenger++){
  const x=6.09+passenger*.055;
  assert.ok(x-.2>5.65,'body clears sign');
  assert.ok(x+.2<6.475,'body stays outside pavilion edge');
 }
 assert.match(scene,/const bypass=isDistrict&&\(routeIndex===0\|\|routeIndex===1\)/);
});

test('R16B relocation adjoins REAR facade of extension, with road clearance',()=>{
 const match=scene.match(/const epX=([\d.]+),epZ=(-?[\d.]+),epW=([\d.]+),epL=([\d.]+)/);
 assert.ok(match,'extension-front parking dimensions found');
 const [x,z,w,l]=match.slice(1).map(Number);
 assert.ok(Math.abs(z+l/2-(-19.2))<.02,'attached to negative-Z extension wall');
 assert.ok(z-l/2>-25,'rear transverse road has its full pavement');
 assert.ok(x+w/2<10.5&&x-w/2>-10.5,'both side roads remain clear');
 for(const px of [-3.5,0,3.5])assert.ok(Math.abs(px)+.85<w/2,'parked sedan inside canopy');
 assert.match(scene,/\{x:-3\.50,z:-21\.30,angle:0\}/);
 assert.match(scene,/\{x:3\.50,z:-21\.30,angle:0\}/);
 assert.match(scene,/\{x:18\.15,z:1\.4,angle:Math\.PI\/2\}/);
});

test('PWA refresh includes imported helpers and R16C venue URLs',()=>{
 assert.match(sw,/sillapa-public-v24-3d-r17b-20261017/);
 assert.match(sw,/venues\/traffic-r16\.mjs/);
 assert.match(sw,/venues\/vehicle-models-r16b\.mjs/);
 assert.match(scene,/import \{computeHighwayProgress,canEnterMainRoad,canAdvanceInboundRoad\}/);
 const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.match(index,/venue=kanchanaburi-pesa4&v=r17b/);
 assert.match(index,/venue=anuban-bophloi&v=r17b/);
});
