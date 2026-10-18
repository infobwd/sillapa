/**
 * R16C: regression for the owner-supplied screenshot of cars overlapping
 * at the outbound gate. Run locally without GitHub Actions:
 * node --test tests/d3d-r16c-exit-merge.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {computeHighwayProgress,canEnterMainRoad} from '../venues/traffic-r16.mjs';

const scene=readFileSync(new URL('../venues/schematic-3d.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');

function roadFleet(){
 return [49.25,54.75].flatMap((lane,index)=>[0,.2,.4,.6,.8].map(phase=>({
  lane,direction:index===0?1:-1,travel:114,speed:2.9,highwayProgress:114*phase
 })));
}
function roadX(c){return c.direction===1?-c.travel/2+c.highwayProgress:c.travel/2-c.highwayProgress}
const waitingPose={visible:true,onHighway:false,point:{x:13,z:43.8}};
const requestedPose={visible:true,onHighway:true,point:{x:13,z:43.8}};
function eastboundAt(x){return {lane:49.25,direction:1,travel:114,speed:2.9,highwayProgress:x+57}}
function travelExit(elapsed){
 // Piecewise distance approximation of the same illustrative exit curve.
 // The vehicle makes the turn over 18 seconds and then leaves the scene.
 const u=Math.max(0,Math.min(1,elapsed/18));
 const pts=[[13,43.8],[13,47.4],[15.5,49.25],[27,49.25],[49,49.25]];
 const lengths=pts.slice(1).map((p,i)=>Math.hypot(p[0]-pts[i][0],p[1]-pts[i][1]));
 const distance=u*lengths.reduce((x,y)=>x+y,0);
 let d=distance;
 for(let i=0;i<lengths.length;i++){
  if(d<=lengths[i]||i===lengths.length-1){
   const v=Math.min(1,d/lengths[i]),a=pts[i],b=pts[i+1];
   return {x:a[0]+(b[0]-a[0])*v,z:a[1]+(b[1]-a[1])*v};
  }
  d-=lengths[i];
 }
 return {x:49,z:49.25};
}

test('all exit routes stop with long van body behind highway pavement',()=>{
 assert.match(scene,/slab\(4\.5,\.12,x,x===d\.gate\.exitX\?43\.8:46\.2/);
 assert.match(scene,/\[13,40\],\[13,43\.8\]/);
 assert.match(scene,/\[13,38\],\[13,43\.8\]/);
 assert.match(scene,/\[13,30\],\[13,43\.8\]/);
 assert.match(scene,/exitCurve=pointsToCurve\(\[\[13,43\.8\]/);
 // Highway parcel edge z=47.5; longest moving internal van is 4.4 units.
 assert.ok(43.8+4.4/2<47.5-.5);
});

test('exit vehicle yields once, not again halfway through the turn',()=>{
 assert.equal(canEnterMainRoad(waitingPose,requestedPose,[eastboundAt(15.5)]),false);
 assert.equal(canEnterMainRoad(waitingPose,requestedPose,[eastboundAt(4)]),false);
 assert.equal(canEnterMainRoad(waitingPose,requestedPose,[eastboundAt(22)]),false);
 assert.equal(canEnterMainRoad(waitingPose,requestedPose,[eastboundAt(2),eastboundAt(26)]),true);
 assert.equal(canEnterMainRoad(requestedPose,{...requestedPose,point:{x:14,z:47}},[eastboundAt(14)]),true);
 // Westbound traffic is a separate lane.
 assert.equal(canEnterMainRoad(waitingPose,requestedPose,[{...eastboundAt(15.5),lane:54.75,direction:-1}]),true);
});

test('following highway vehicle reserves whole turn, not just merging center',()=>{
 const behind=eastboundAt(4),farAhead=eastboundAt(34);
 const justCommitted={x:13,z:43.8,exitMerge:true};
 assert.equal(computeHighwayProgress([behind,farAhead],[justCommitted],1).get(behind),behind.highwayProgress);
 assert.ok(computeHighwayProgress([behind,farAhead],[],1).get(behind)>behind.highwayProgress);
 assert.match(scene,/exitMerge:!!p.onHighway/);
 assert.match(scene,/sameExit=wanted\.point\.x>10/);
 assert.match(scene,/gap<gapLimit/);
});

test('six-minute repeated entry scenario keeps road cars clear of committed exit',()=>{
 const cars=roadFleet();
 let committedAt=null,mergeCount=0,lastCycle=-999,totalBusDistance=0;
 for(let frame=0;frame<360*60;frame++){
  const t=frame/60;
  // Another vehicle requests entry after the previous merged and left.
  if(committedAt===null&&t-lastCycle>=35){
   if(canEnterMainRoad(waitingPose,requestedPose,cars)){
    committedAt=t;mergeCount++;lastCycle=t;
   }
  }
  const occupied=committedAt!==null&&t-committedAt<18
   ?travelExit(t-committedAt):null;
  if(committedAt!==null&&!occupied)committedAt=null;
  const merge=occupied?[{...occupied,exitMerge:true}]:[];
  const updates=computeHighwayProgress(cars,merge,1/60);
  for(const car of cars){
   const old=car.highwayProgress;car.highwayProgress=updates.get(car);
   if(car===cars[0])totalBusDistance+=(car.highwayProgress-old+114)%114;
  }
  for(const group of [cars.slice(0,5),cars.slice(5)]){
   const p=group.map(c=>c.highwayProgress).sort((a,b)=>a-b);
   for(let i=0;i<p.length;i++)
    assert.ok((p[(i+1)%p.length]-p[i]+114)%114>=9.99,'main lane headway');
  }
  if(occupied&&occupied.x<49){
   for(const car of cars.slice(0,5)){
    const gap=occupied.x-roadX(car);
    if(gap>=0&&gap<=30)
     assert.ok(gap>=9.98,'road vehicle touched committed turning car');
   }
  }
 }
 assert.ok(mergeCount>=3,'multiple vehicles eventually enter the highway');
 assert.ok(totalBusDistance>350,'blue bus remains moving in live traffic');
});

test('R16C PWA invalidation and versioned venue links',()=>{
 assert.match(sw,/sillapa-public-v33-3d-r20c1-20261018/);
 assert.match(sw,/venues\/traffic-r16\.mjs/);
 assert.match(sw,/venues\/vehicle-models-r16b\.mjs/);
 const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.match(index,/venue=kanchanaburi-pesa4&v=r20c1/);
 assert.match(index,/venue=anuban-bophloi&v=r20c1/);
});
