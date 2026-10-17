/**
 * R17B: six-minute mixed traffic replay using ACTUAL scene movement functions
 * extracted from HTML, with simplified linear stand-ins for THREE curves.
 * Approximates motion only: NOT a real Three.js/WebGL visual acceptance run.
 * Run locally: node --test tests/d3d-r17b-traffic-replay.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 DROP_OFF_BAY,BUILDING_DROPOFF_TIMING,FRONT_PARK_TIMING,
 inDropoffZone,shouldHoldDropoffRelease,
 shouldHoldFollowerAtDropoff,shouldHoldVehicleCorridor
} from '../venues/dropoff-r17.mjs';
import {
 computeHighwayProgress,canEnterMainRoad,canAdvanceInboundRoad
} from '../venues/traffic-r16.mjs';
const html=readFileSync(new URL('../venues/schematic-3d.html',import.meta.url),'utf8');
class V3 {
 constructor(x,y,z){this.x=x;this.y=y;this.z=z}
 distanceTo(b){return Math.hypot(this.x-b.x,this.y-b.y,this.z-b.z)}
}
class LinearCurve {
 constructor(points){this.points=points;this.steps=points.slice(1).map((b,i)=>points[i].distanceTo(b));this.total=this.steps.reduce((a,b)=>a+b,0)}
 at(u,dir=false){
  let distance=Math.max(0,Math.min(.999999,u))*this.total;
  for(let i=0;i<this.steps.length;i++){
   const l=this.steps[i];
   if(distance<=l||i===this.steps.length-1){
    const a=this.points[i],b=this.points[i+1],t=l?Math.min(1,distance/l):0;
    if(dir){return {x:(b.x-a.x)/l,z:(b.z-a.z)/l}}
    return new V3(a.x+(b.x-a.x)*t,0,a.z+(b.z-a.z)*t);
   }
   distance-=l;
  }
 }
 getPointAt(u){return this.at(u)}
 getTangentAt(u){return this.at(u,true)}
}
const curve=points=>new LinearCurve(points.map(([x,z])=>new V3(x,0,z)));
const model=(length,width)=>({visible:false,position:{set(x,y,z){this.x=x;this.z=z}},rotation:{y:0},userData:{vehicleLength:length,vehicleWidth:width}});
function replay(seconds=360){
 const entry=curve([[-65,49.25],[-52,49.25],[-36,49.25],[-24,49.25],
  [-17,49.25],[-13,46.2],[-13,45.8]]);
 const exit=curve([[13,43.8],[13,47.4],[15.5,49.25],[27,49.25],[49,49.25]]);
 const inner=[
  {route:'front-park',bay:[-7,36],progress:0,speed:.01,
   arrive:curve([[-13,45.8],[-13,34],[-10,30.3],[-7,30.7],[-7,33],[-7,36]]),
   depart:curve([[-7,30.7],[-8.3,29.7],[-10,26],[-10,22],[0,22],[10,22],[13,26],[13,40],[13,43.8]]),
   model:model(3.9,1.56)},
  {route:'front-park',bay:[-3.5,36],progress:.5,speed:.01,
   arrive:curve([[-13,45.8],[-13,33],[-10,29.7],[-5.4,30],[-3.5,31],[-3.5,33.4],[-3.5,36]]),
   depart:curve([[-3.5,30.7],[-5.8,29.3],[-9.2,25],[-10,22],[0,22],[10,22],[13,26],[13,40],[13,43.8]]),
   model:model(3.5,1.67)},
  {route:'building-dropoff',progress:.31,speed:.009,
   arrive:curve([[-13,45.8],[-13,34],[-13,24],[-9.7,22],[-3,22],
     [1.6,22],[3.1,19.65],[5.5,18.55],[DROP_OFF_BAY.x,DROP_OFF_BAY.z]]),
   depart:curve([[DROP_OFF_BAY.x,DROP_OFF_BAY.z],[9.25,18.55],
     [11.35,18.55],[13,19],[13,23.7],[13,29],[13,38],[13,43.8]]),
   model:model(4.4,1.92)},
  {route:'rear-parking',bay:[3.4,-35],progress:.37,speed:.008,
   arrive:curve([[-13,45.8],[-13,18],[-13,-15],[-10,-27],
     [-4,-27],[1,-27],[3.4,-27],[3.4,-31],[3.4,-35]]),
   depart:curve([[3.4,-29.5],[7,-27],[10,-27],[13,-23],[13,5],[13,30],[13,43.8]]),
   model:model(3.9,1.56)}
 ];
 for(const c of inner){c.entryCurve=entry;c.exitCurve=exit}
 const road=[49.25,54.75].flatMap((lane,d)=>[0,.2,.4,.6,.8].map(phase=>({
  route:'main-road',lane,direction:d?-1:1,
  travel:154,highwayProgress:154*phase,speed:2.9,model:model(7,2.2)
 })));
 const buses=[...inner,...road],start=html.indexOf('function highwayExitPose('),
  end=html.indexOf('// R15: deterministic',start),
  move=html.indexOf('function animateDistrictVehicles(t){'),
  moveEnd=html.indexOf('function animateBuses(t)',move);
 assert.ok(start>0&&end>start&&move>0&&moveEnd>move);
 const extras={
  DROP_OFF_BAY,BUILDING_DROPOFF_TIMING,FRONT_PARK_TIMING,inDropoffZone,
  shouldHoldDropoffRelease,shouldHoldFollowerAtDropoff,shouldHoldVehicleCorridor,
  computeHighwayProgress,canEnterMainRoad,canAdvanceInboundRoad
 };
 const keys=Object.keys(extras),values=Object.values(extras);
 const logic=new Function('THREE','buses','animateDropoffPassengers',...keys,
  'let lastVehicleUpdate=null;\n'+html.slice(start,end)+'\n'
   +html.slice(move,moveEnd)+'\nreturn {animateDistrictVehicles,trafficPose};')(
    {Vector3:V3},buses,()=>{},...values);
 const record=inner.map(c=>({route:c.route,progress:c.progress,cycles:0,
  longestHold:0,hold:0,total:0}));
 for(let i=0;i<seconds*60;i++){
  logic.animateDistrictVehicles(i/60);
  for(let j=0;j<inner.length;j++){
   const c=inner[j],r=record[j],difference=(c.progress-r.progress+1)%1;
   if(c.progress<r.progress)r.cycles++;
   if(difference<1e-10){r.hold+=1/60;r.longestHold=Math.max(r.longestHold,r.hold)}
   else{r.hold=0;r.total+=difference}
   r.progress=c.progress;
  }
 }
 return record;
}
test('all four internal vehicles complete multiple cycles without mutual deadlock',()=>{
 const results=replay();
 for(const r of results){
  assert.ok(r.cycles>=2,r.route+' did not complete at least 2 loops: '+JSON.stringify(r));
  assert.ok(r.longestHold<55,r.route+' stuck for '+r.longestHold.toFixed(1)+' s');
 }
});
