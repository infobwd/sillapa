import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {occupiesDropoffJunction,dropoffJunctionEntry,selectDropoffJunctionOwner} from '../venues/junction-r19b.mjs';
const p=(x,z)=>({visible:true,point:{x,z},yaw:0});
const car=(route,progress)=>({route,progress});
const scene=readFileSync(new URL('../venues/schematic-3d.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('a car already crossing retains right-of-way over rear pickup and waiting van',()=>{
 const front=car('front-park',.55),rear=car('rear-parking',.71),van=car('building-dropoff',.465);
 const poses=new Map([[front,p(7.6,25.2)],[rear,p(13,8.4)],[van,p(7,18.55)]]);
 assert.equal(selectDropoffJunctionOwner([front,rear,van],null,c=>poses.get(c)),front);
 assert.equal(dropoffJunctionEntry(rear,.71,.711,p(13,8.4),p(13,8.6)),true);
 assert.equal(occupiesDropoffJunction(rear,.71,poses.get(rear)),false);
 assert.equal(occupiesDropoffJunction(front,.55,poses.get(front)),true);
});
test('an already crossing pickup clears first; the stopped van is not an owner',()=>{
 const rear=car('rear-parking',.735),van=car('building-dropoff',.465);
 const poses=new Map([[rear,p(13,18.5)],[van,p(7,18.55)]]);
 assert.equal(selectDropoffJunctionOwner([van,rear],null,c=>poses.get(c)),rear);
 assert.equal(occupiesDropoffJunction(van,.465,poses.get(van)),false);
 assert.equal(occupiesDropoffJunction(rear,.735,p(13,33.1)),false);
});
test('vacant junction reserves for the van immediately before departure',()=>{
 const van=car('building-dropoff',.4648);
 assert.equal(selectDropoffJunctionOwner([van],null,()=>p(7,18.55)),van);
 assert.equal(occupiesDropoffJunction(van,.466,p(8,18.55)),true);
 assert.equal(occupiesDropoffJunction(van,.58,p(13,34)),false);
});
test('parking arrivals must not reserve the crossing before actually departing',()=>{
 assert.equal(occupiesDropoffJunction(car('front-park',.3),.3,p(-3.5,30)),false);
 assert.equal(occupiesDropoffJunction(car('front-park',.48),.48,p(-3.5,30.7)),false);
 assert.equal(occupiesDropoffJunction(car('front-park',.56),.56,p(10,25.2)),true);
});
test('scene road and geometry separate arrival and departure while preserving pedestrian curb',()=>{
 assert.equal((scene.match(/\[-10,25\.2\],\[0,25\.2\],\[10,25\.2\],\[13,29\]/g)||[]).length,2);
 assert.match(scene,/slab\(38,7\.5,0,z\+1\.75/);
 assert.match(scene,/dropoffJunctionOwner=selectDropoffJunctionOwner/);
 assert.match(scene,/dropoffJunctionEntry\(b,b\.progress,next,currentPose,wanted\)/);
 assert.match(scene,/7\.4,\.72,6\.7,16\.88/);
});
test('PWA cache and both scene links refresh with the fix',()=>{
 assert.match(sw,/sillapa-public-v33-3d-r20c1-20261018/);
 assert.match(sw,/venues\/junction-r19b\.mjs/);
 assert.match(index,/venue=kanchanaburi-pesa4&v=r20c1/);
 assert.match(index,/venue=anuban-bophloi&v=r20c1/);
});
