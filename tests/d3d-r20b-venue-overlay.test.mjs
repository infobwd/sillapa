/**
 * D3D-R20B — public schematic overlay, not verified round-74 statuses.
 * LOCAL_FIRST: node --test tests/d3d-r20b-venue-overlay.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {LAYER_KEYS,LAYER_DEFAULTS,normalizeVenueLayers,withVenueLayer,
 historyOverlaySummary,schematicPointsForVenue} from '../venues/overlay-r20b.mjs';
const html=readFileSync(new URL('../venues/schematic-3d.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('layer defaults keep points off and reject invalid preferences',()=>{
 assert.deepEqual(LAYER_DEFAULTS,{labels:true,historical:true,points:false});
 assert.deepEqual(LAYER_KEYS,['labels','historical','points']);
 assert.deepEqual(normalizeVenueLayers(null),LAYER_DEFAULTS);
 assert.deepEqual(normalizeVenueLayers({labels:false,historical:'false',points:true,admin:true}),
  {labels:false,historical:true,points:true});
 assert.deepEqual(withVenueLayer(LAYER_DEFAULTS,'points',true),{labels:true,historical:true,points:true});
 assert.deepEqual(withVenueLayer(LAYER_DEFAULTS,'bad-key',true),LAYER_DEFAULTS);
});
test('historical counts group normalized building names, not inferred readiness',()=>{
 assert.deepEqual(historyOverlaySummary([]),{edition:73,activities:0,buildings:0,verified:false});
 const rows=[{building:'อาคาร 1'},{building:'อาคาร1'},{building:'อาคาร 2'},{building:null}];
 assert.deepEqual(historyOverlaySummary(rows),{edition:73,activities:4,buildings:3,verified:false});
 assert.equal(historyOverlaySummary(null).activities,0);
});
test('five district-only points are explicitly simulated with real numeric scene coordinates',()=>{
 const points=schematicPointsForVenue('kanchanaburi-pesa4');
 assert.equal(points.length,5);
 assert.ok(points.every(p=>p.id&&p.label.includes('จำลอง')
  &&Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.z)));
 assert.deepEqual(schematicPointsForVenue('anuban-bophloi'),[]);
 assert.deepEqual(schematicPointsForVenue('unknown-venue'),[]);
});
test('layer controls have labels, touch targets and mobile disclosure',()=>{
 for(const id of ['venueLayers','layerLabels','layerHistorical','layerPoints','venueLayersStatus','venuePoiNames']){
  assert.ok(html.includes('id="'+id+'"'),id);
 }
 assert.match(html,/class="venue-layer-controls"/);
 assert.match(html,/venueLayerInputs\[key\]\.addEventListener\('change'/);
 assert.match(html,/saveSetting\('sillapa-3d-venue-layers'/);
 assert.match(html,/syncVenueLayerDisclosure\(mobileWayfindingQuery\)/);
 assert.match(html,/\.venue-layers label\{[^}]*min-height:44px/);
});
test('switches actually affect 3D objects and historic tags; cleanup is tied to scene',()=>{
 assert.match(html,/buildingLabelSprites\.push\(sprite\)/);
 assert.match(html,/for\(const label of buildingLabelSprites\)label\.visible=venueLayers\.labels/);
 assert.match(html,/badge\.visible=venueLayers\.historical&&!topDown/);
 assert.match(html,/tags\.hidden=!venueLayers\.historical/);
 assert.match(html,/poiRoot\.visible=venueLayers\.points/);
 assert.match(html,/buildingLabelSprites\.length=0;poiRoot=null/);
 assert.match(html,/if\(district\)\{buildVenuePoiOverlay\(v\.id\);createWayfindingPins\(\)\}/);
});
test('no unverified 74 status is introduced; preserved R19B and student path',()=>{
 assert.match(html,/ยังไม่มีสถานะความพร้อมครั้งที่ 74 ที่ได้รับการรับรอง/);
 assert.match(html,/const corridorBlocked=shouldHoldVehicleCorridor\(current,wanted/);
 assert.match(html,/dropoffJunctionEntry\(b,b\.progress,next,currentPose,wanted\)/);
 assert.match(html,/function animateStudentTour\(t\)/);
 assert.match(html,/function animateWayfindingFollow\(t\)/);
});
test('PWA v30 caches the helper and updates both venue URLs',()=>{
 assert.match(sw,/sillapa-public-v31-3d-r20b1-20261018/);
 assert.match(sw,/venues\/overlay-r20b\.mjs/);
 assert.match(index,/venue=kanchanaburi-pesa4&v=r20b1/);
 assert.match(index,/venue=anuban-bophloi&v=r20b1/);
});

test('R20B1: disclosure startup has no TDZ and breakpoint listeners work',()=>{
 const module=html.match(/<script type="module">([\s\S]*?)<\/script>/);
 assert.ok(module,'scene ES module missing');
 const code=module[1];
 const start=code.indexOf('const wayfindingMore=');
 const end=code.indexOf('const venueLayersStatus=',start);
 assert.ok(start>=0&&end>start,'initialization excerpt was not found');
 const handlers=[];
 const nodes=new Map();
 const document={querySelector(selector){
  if(!nodes.has(selector))nodes.set(selector,{open:undefined});
  return nodes.get(selector);
 }};
 const mq={matches:true,addEventListener(type,callback){
  if(type==='change')handlers.push(callback);
 }};
 const window={matchMedia(){return mq;}};
 assert.doesNotThrow(()=>runInNewContext(code.slice(start,end),{document,window}));
 assert.equal(nodes.get('#venueLayers').open,false,'mobile overlay initially collapsed');
 assert.equal(handlers.length,3,'R18, R19 and R20B listeners all registered');
 handlers[2]({matches:false});
 assert.equal(nodes.get('#venueLayers').open,true,'desktop overlay expanded');
 handlers[2]({matches:true});
 assert.equal(nodes.get('#venueLayers').open,false,'mobile overlay collapsed again');
});
