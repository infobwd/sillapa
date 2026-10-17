#!/usr/bin/env node
/**
 * D3D-R12 local-first headless smoke test.
 * Run: node tests/d3d-r12-traffic-smoke.mjs
 * Extracts production motion functions from the Three.js HTML and runs them
 * with geometry/scene stubs. Does NOT certify WebGL rendering or real physics.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';

const page=fs.readFileSync(new URL('../venues/schematic-3d.html',import.meta.url),'utf8');
function part(from,to){
 const begin=page.indexOf(from),end=page.indexOf(to,begin);
 assert.ok(begin>=0&&end>begin,'Missing motion anchor: '+from);
 return page.slice(begin,end);
}
class Vector3{
 constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z})}
 distanceTo(p){return Math.hypot(this.x-p.x,this.y-p.y,this.z-p.z)}
 set(x,y,z){Object.assign(this,{x,y,z});return this}
}
class Group{
 constructor(){this.position=new Vector3();this.rotation={y:0};this.userData={};this.visible=true}
 add(){}
}
class Curve{
 // Distance-based polyline is deliberately approximate to CatmullRomCurve3.
 constructor(points){
  this.points=points;
  this.lengths=[];this.total=0;
  for(let i=1;i<points.length;i++){
   const d=points[i-1].distanceTo(points[i]);
   this.lengths.push(d);this.total+=d;
  }
 }
 getPointAt(u){
  let distance=Math.min(1,Math.max(0,u))*this.total;
  for(let i=0;i<this.lengths.length;i++){
   const length=this.lengths[i];
   if(distance<=length||i===this.lengths.length-1){
    const a=this.points[i],b=this.points[i+1],t=Math.min(1,distance/(length||1));
    return new Vector3(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,a.z+(b.z-a.z)*t);
   }
   distance-=length;
  }
  return this.points.at(-1);
 }
 getTangentAt(u){
  const a=this.getPointAt(Math.max(0,u-.0001)),b=this.getPointAt(Math.min(1,u+.0001));
  return new Vector3(b.x-a.x,b.y-a.y,b.z-a.z);
 }
}
const THREE={Vector3,Group,CatmullRomCurve3:Curve};
const model=()=>({position:new Vector3(),rotation:{y:0},visible:true});
const production=[
 part('function addMainRoadTraffic(root){','// D3D-R7: front open'),
 part('function addDistrictVehicles(activityCount){','// D3D-R12: departure'),
 part('const MAIN_ROAD_SPEED=','function schoolJourney('),
 part('function vehicleFootprintOverlap(','function animateBuses(t){')
].join('\n');
const mocks=`
const buses=[],objects=[],scene={add(){}},peopleVisible=true,trafficEnabled=true;
function makeDistrictCar(){return mk()}
function makeBlueLowPolyPickup(){return mk()}
function makeBlueLowPolySedan(){return mk()}
function makeBlueCityBus(){return mk()}
function makeWhiteTenWheelTruck(){return mk()}
function makeWhitePassengerVan(){return mk()}
function makeRoadVan(){return mk()}
function makeDropoffPerson(){return {visible:false,userData:{}}}
function schoolJourney(){return [[0,0,0],[1,0,1]]}
function schoolPolyline(){return {total:1}}
function pointsToCurve(a){
 return new THREE.CatmullRomCurve3(a.map(([x,z])=>new THREE.Vector3(x,0,z)));
}
function animateDropoffPassengers(){}
`;
// Do not update test logic independently of production: use extracted functions.
const sim=Function('THREE','mk',
 mocks+production+
 '\naddDistrictVehicles(40);return {buses,animateDistrictVehicles,vehicleFootprintOverlap,time:()=>roadSimTime};'
)(THREE,model);
const cars=sim.buses;
assert.equal(cars.filter(c=>c.route==='main-road').length,8);
assert.ok(cars.some(c=>c.route==='pickup-school'));
assert.ok(cars.some(c=>c.route==='building-dropoff'));

let merges=0,cycles=0,insideCollisionFrames=0,highwayCollisionFrames=0;
const lastMode=cars.slice(0,6).map(c=>c.exitMode);
const lastProgress=cars.slice(0,6).map(c=>c.progress);
for(let frame=0;frame<24000;frame++){
 sim.animateDistrictVehicles((frame+1)*.05);
 for(let i=0;i<6;i++){
  const c=cars[i];
  if(c.exitMode==='turn'&&lastMode[i]!=='turn')merges++;
  if(c.progress<lastProgress[i]&&lastProgress[i]>.94)cycles++;
  lastMode[i]=c.exitMode;lastProgress[i]=c.progress;
 }
 for(let i=0;i<cars.length;i++)for(let j=i+1;j<cars.length;j++){
  const a=cars[i],b=cars[j];
  if(!a.model.visible||!b.model.visible)continue;
  const pa={visible:true,point:a.model.position,yaw:a.model.rotation.y};
  const pb={visible:true,point:b.model.position,yaw:b.model.rotation.y};
  if(!sim.vehicleFootprintOverlap(a,pa,b,pb,false))continue;
  if(i<6&&j<6)insideCollisionFrames++;
  if(Math.abs(pa.point.z-49.25)<1.5&&Math.abs(pb.point.z-49.25)<1.5)highwayCollisionFrames++;
 }
}
assert.ok(merges>=20,'Expected repeated highway merges, got '+merges);
assert.ok(cycles>=20,'Expected repeated return cycles, got '+cycles);
assert.equal(insideCollisionFrames,0,'Internal vehicle body overlap');
assert.equal(highwayCollisionFrames,0,'Main-road vehicle body overlap');

const school=Function('THREE',
 part('function schoolJourney(destination,index){','function setStudentOpacity(')+
 '\nreturn {schoolJourney,schoolPolyline,studentPoseAt};'
)(THREE);
for(const destination of ['dome','meeting-room'])for(let i=0;i<4;i++){
 const route=school.schoolPolyline(school.schoolJourney(destination,i));
 assert.ok(route.total>10);
 const pose=school.studentPoseAt(route,route.total);
 assert.ok(pose.arrived);
 assert.ok(destination==='meeting-room'?pose.y>=2.5:pose.y===0);
}
console.log('PASS — '+(sim.time()/60).toFixed(1)+' min, '+merges+
 ' merges, '+cycles+' cycles, zero vehicle body overlaps; all school routes finish.');
