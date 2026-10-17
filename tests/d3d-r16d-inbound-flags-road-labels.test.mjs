/**
 * D3D-R16D — moving arrivals from the highway, road markings, and
 * welcome-flag wind. Run locally, no GitHub Actions:
 * node --test tests/d3d-r16d-inbound-flags-road-labels.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {computeHighwayProgress,canAdvanceInboundRoad} from '../venues/traffic-r16.mjs';

const scene=readFileSync(new URL('../venues/schematic-3d.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');

test('all arriving vehicles use the same left-road approach before internal arrival',()=>{
 assert.match(scene,/const entryCurve=pointsToCurve\(\[\s*\[-65,49\.25\],\[-52,49\.25\]/);
 assert.match(scene,/\[-17,49\.25\],\[-13,46\.2\],\[-13,45\.8\]/);
 assert.match(scene,/car\.entryCurve=entryCurve/);
 assert.match(scene,/function inboundArrivalPose\(b,q,arrivalEnd\)/);
 assert.match(scene,/const entryEnd=\.15/);
 assert.match(scene,/if\(q<clock\.arrivalEnd\)return inboundArrivalPose\(b,q,clock\.arrivalEnd\)/);
 assert.match(scene,/if\(q<\.40\)return inboundArrivalPose\(b,q,\.40\)/);
 assert.match(scene,/canAdvanceInboundRoad\(currentPose,wanted,highway\)/);
 assert.match(scene,/p\.inboundRoad&&p\.point\.z>=45\.5/);
 assert.match(scene,/inboundRoad:!!p\.inboundRoad/);
 assert.match(scene,/sameEntry=wanted\.inboundRoad&&pose\.inboundRoad/);
});

test('inbound vehicle yields to road car ahead/behind at entry but follows once joined',()=>{
 const car=x=>({direction:1,lane:49.25,travel:114,highwayProgress:x+57,speed:2.9});
 const waiting={visible:true,inboundRoad:true,point:{x:-60,z:49.25}};
 const next={visible:true,inboundRoad:true,point:{x:-59.8,z:49.25}};
 assert.equal(canAdvanceInboundRoad(waiting,next,[car(-56)]),false,'ahead near spawn');
 assert.equal(canAdvanceInboundRoad(waiting,next,[car(-62)]),false,'behind near spawn');
 assert.equal(canAdvanceInboundRoad(waiting,next,[car(-44)]),true,'clear lane gap');
 const current={visible:true,inboundRoad:true,point:{x:-30,z:49.25}};
 const candidate={visible:true,inboundRoad:true,point:{x:-29.9,z:49.25}};
 assert.equal(canAdvanceInboundRoad(current,candidate,[car(-33)]),true,'following cars yield to entrant');
 assert.equal(canAdvanceInboundRoad(current,candidate,[car(-25)]),false,'entrant yields ahead');
 assert.equal(canAdvanceInboundRoad(current,{...candidate,inboundRoad:false},[car(-25)]),true,'road access ends inside gate');
 assert.equal(canAdvanceInboundRoad(waiting,next,[{...car(-56),lane:54.75,direction:-1}]),true,'opposite lane separate');
});

test('traffic behind a committed inbound car respects eastbound separation',()=>{
 const behind={direction:1,lane:49.25,travel:114,speed:2.9,highwayProgress:57-34}; // x=-34
 const occupant={x:-28,z:49.25,inboundRoad:true};
 assert.equal(computeHighwayProgress([behind],[occupant],1).get(behind),behind.highwayProgress);
 assert.ok(computeHighwayProgress([behind],[],1).get(behind)>behind.highwayProgress);
 const west={...behind,lane:54.75,direction:-1,highwayProgress:57};
 assert.ok(computeHighwayProgress([west],[occupant],1).get(west)>west.highwayProgress);
});

test('six-minute approach simulation has repeated arrivals and no highway overlap',()=>{
 const cars=[49.25,54.75].flatMap((lane,dir)=>[0,.2,.4,.6,.8].map(phase=>({
  lane,direction:dir?-1:1,travel:154,speed:2.9,highwayProgress:154*phase
 })));
 const points=[[-65,49.25],[-52,49.25],[-36,49.25],[-24,49.25],
  [-17,49.25],[-13,46.2],[-13,45.8]];
 const distances=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
 const length=distances.reduce((a,b)=>a+b,0);
 function pose(q){
  let d=Math.min(1,Math.max(0,q/.15))*length;
  for(let i=0;i<distances.length;i++){
   if(d<=distances[i]||i===distances.length-1){
    const u=distances[i]?d/distances[i]:0;
    return {visible:true,inboundRoad:q<.15,point:{
     x:points[i][0]+(points[i+1][0]-points[i][0])*u,
     z:points[i][1]+(points[i+1][1]-points[i][1])*u
    }};
   }
   d-=distances[i];
  }
 }
 let q=0,completed=0,blocked=0,travel=0;
 for(let frame=0;frame<360*60;frame++){
  const candidate=(q+1/60*.010)%1;
  if(q<.15){
   if(canAdvanceInboundRoad(pose(q),pose(Math.min(candidate,.15)),cars))
    q=candidate;
   else blocked++;
  }else{
   q=candidate;
   if(q<.0002)completed++;
  }
  const occupancy=q<.15?[{...pose(q).point,inboundRoad:true}]:[];
  const updates=computeHighwayProgress(cars,occupancy,1/60);
  for(const c of cars){
   const before=c.highwayProgress;
   c.highwayProgress=updates.get(c);
   if(c===cars[0])travel+=(c.highwayProgress-before+154)%154;
  }
  for(const group of [cars.slice(0,5),cars.slice(5)]){
   const ps=group.map(c=>c.highwayProgress).sort((a,b)=>a-b);
   for(let j=0;j<5;j++)
    assert.ok((ps[(j+1)%5]-ps[j]+154)%154>=9.99);
  }
  if(q>0&&q<.15){
   const p=pose(q).point;
   if(p.x>-47&&p.x<-16)
    for(const c of cars.slice(0,5)){
     const x=-c.travel/2+c.highwayProgress;
     assert.ok(Math.abs(x-p.x)>=9.75,'a highway car overlaps inbound vehicle');
    }
  }
 }
 assert.ok(completed>=2,'vehicle arrived repeatedly');
 assert.ok(blocked>0,'yielding was exercised');
 assert.ok(travel>500,'highway buses keep moving');
 assert.match(scene,/slab\(140,d\.road3342\.width,0,d\.road3342\.z/);
 assert.match(scene,/b\.model\.visible=Math\.abs\(x\)<68/);
});

test('four welcome pennants flutter in Thai flag animation loop',()=>{
 assert.match(scene,/new THREE\.PlaneGeometry\(\.72,\.47,12,4\)/);
 assert.match(scene,/pennant\.userData\.flagWidth=\.72/);
 assert.match(scene,/pennant\.userData\.flagAmplitude=\.38/);
 assert.match(scene,/flagCloths\.push\(pennant\)/);
 assert.match(scene,/const width=cloth\.userData\.flagWidth\|\|2\.45/);
 assert.match(scene,/const phase=cloth\.userData\.windPhase\|\|0/);
 assert.match(scene,/pos\.setZ\(i,free\*free\*ripple\)/);
 assert.match(scene,/function dispose\(\)\{buildingLabelSprites\.length=0;poiRoot=null;currentOverlayVenue=null;stopWayfindingFollow\(\);/);
 assert.match(scene,/venueBadges\.length=0;walkers\.length=0;buses\.length=0;flagCloths\.length=0/);
});

test('Road 3342 direction labels point right to U Thong and left to Bo Phloi',()=>{
 assert.match(scene,/asphaltText\('← บ่อพลอย',-31,54\.75/);
 assert.match(scene,/asphaltText\('ไปอู่ทอง →',31,49\.25/);
 assert.match(scene,/asphaltText\('ถนนหมายเลข 3342',0,52/);
 assert.match(scene,/writing\.rotation\.x=-Math\.PI\/2/);
 assert.match(scene,/writing\.position\.set\(x,\.298,z\)/);
});

test('PWA cache and venue links refreshed for R16D',()=>{
 assert.match(sw,/sillapa-public-v32-3d-r20c-20261018/);
 assert.match(sw,/venues\/traffic-r16\.mjs/);
 assert.match(sw,/venues\/vehicle-models-r16b\.mjs/);
 assert.match(index,/venue=kanchanaburi-pesa4&v=r20c/);
 assert.match(index,/venue=anuban-bophloi&v=r20c/);
});
