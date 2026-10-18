/**
 * D3D-R20C — historical executive dashboard and muted flagpole field.
 * Run locally: node --test tests/d3d-r20c-executive-dashboard.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {executiveSnapshot,formatExecutiveSourceNotice} from '../venues/executive-r20c.mjs';
import {VISUAL_R20A} from '../venues/visual-r20a.mjs';
const data=JSON.parse(readFileSync(new URL('../venues/history73.json',import.meta.url),'utf8'));
const scene=readFileSync(new URL('../venues/schematic-3d.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');

test('overview derives exact venue and row totals from the checked-in historical source',()=>{
 const district=executiveSnapshot(data.venues,'kanchanaburi-pesa4');
 const school=executiveSnapshot(data.venues,'anuban-bophloi');
 assert.equal(data.edition,73);
 assert.equal(data.publicationStatus,'historical-review-only');
 assert.equal(district.venueCount,2);
 assert.equal(district.totalHistoricalRows,98);
 assert.equal(district.selectedRows,45);
 assert.equal(district.selectedBuildings,3);
 assert.equal(district.selectedMatchingPending,45);
 assert.equal(school.selectedRows,53);
 assert.equal(school.selectedBuildings,10);
 assert.equal(school.selectedMatchingPending,53);
 assert.equal(district.hasApproved74Data,false);
 assert.equal(school.hasApproved74Data,false);
});

test('executive summary counts table rows rather than unique activities or participants',()=>{
 const fake=[{id:'a',name:'Test',edition:73,rows:[
  {activity:'Same',building:'อาคาร 1',reviewStatus:'needs_activity_id_match'},
  {activity:'Same',building:'อาคาร1',reviewStatus:'ready'}, // never count ready as 74 approval
  {activity:'Other',building:'อาคารโดม',room:'Room A'}
 ]},{id:'b',name:'74 hidden',edition:74,rows:[{building:'X'}]}];
 const v=executiveSnapshot(fake,'a');
 assert.equal(v.venueCount,1);
 assert.equal(v.totalHistoricalRows,3);
 assert.equal(v.selectedRows,3);
 assert.equal(v.selectedBuildings,2);
 assert.equal(v.roomSpecifiedRows,1);
 assert.equal(v.selectedMatchingPending,1);
 assert.equal(v.hasApproved74Data,false);
 assert.ok(formatExecutiveSourceNotice(v).includes('ยังไม่มีข้อมูลยืนยันความพร้อมครั้งที่ 74'));
});

test('unknown venue or broken input fails closed without inventing executive KPIs',()=>{
 const v=executiveSnapshot(data.venues,'not-a-venue');
 assert.equal(v.selectedRows,0);
 assert.equal(v.selectedBuildings,0);
 assert.equal(v.selectedId,null);
 assert.deepEqual(v.buildings,[]);
 assert.equal(v.hasApproved74Data,false);
 assert.equal(executiveSnapshot(null,'x').totalHistoricalRows,0);
});

test('dashboard presents accessible four historical metrics and real venue selectors',()=>{
 for(const id of ['executiveOverview','execVenues','execTotalRows','execVenueRows','execBuildings','execSource','execChooseBuilding','execResetCamera','execShowHistory']){
  assert.ok(scene.includes('id="'+id+'"'),id);
 }
 assert.match(scene,/function renderExecutiveDashboard\(venue\)/);
 assert.match(scene,/const stats=executiveSnapshot\(venues,venue\.id\)/);
 assert.match(scene,/active=\{groups,choose\};renderExecutiveDashboard\(v\)/);
 assert.match(scene,/active\.choose\(group\)/);
 assert.match(scene,/document\.querySelector\('#resetView'\)\.click\(\)/);
 assert.match(scene,/list\.scrollIntoView/);
 assert.match(scene,/\.venue-executive-actions button\{min-height:44px/);
});

test('R20C disclosures execute without TDZ on mobile and resize correctly',()=>{
 const script=scene.match(/<script type="module">([\s\S]*?)<\/script>/);
 assert.ok(script,'ES module not found');
 const source=script[1];
 const begin=source.indexOf('const wayfindingMore=');
 const end=source.indexOf('const qualitySelector=',begin);
 assert.ok(begin>=0&&end>begin);
 const els=new Map(),handlers=[];
 const document={querySelector(q){
  if(!els.has(q))els.set(q,{open:undefined});
  return els.get(q);
 }};
 const media={matches:true,addEventListener(event,fn){if(event==='change')handlers.push(fn)}};
 const window={matchMedia(){return media;}};
 assert.doesNotThrow(()=>runInNewContext(source.slice(begin,end),{document,window}));
 assert.equal(els.get('#venueLayers').open,false);
 assert.equal(els.get('#executiveOverview').open,false);
 assert.equal(handlers.length,4);
 handlers[3]({matches:false});
 assert.equal(els.get('#executiveOverview').open,true);
 handlers[3]({matches:true});
 assert.equal(els.get('#executiveOverview').open,false);
});

test('behind-flagpole field is matte sage-grey with unchanged geometry and subdued stripes',()=>{
 assert.equal(VISUAL_R20A.forecourt,'#a7bbb5');
 assert.match(scene,/slab\(36,17,0,32,VISUAL_R20A\.forecourt,\.11\)/);
 assert.match(scene,/slab\(\.08,5\.6,x,36,'#dce4dd',\.255\)/);
 assert.match(scene,/slab\(18,\.09,0,39,'#dce4dd',\.256\)/);
 assert.match(scene,/const flagX=0,flagZ=40\.0/);
 assert.match(scene,/dropoffJunctionEntry\(b,b\.progress,next,currentPose,wanted\)/);
 assert.match(scene,/function animateStudentTour\(t\)/);
});

test('public cache v32 precaches R20C and both deep links update without changing historical source',()=>{
 assert.match(sw,/sillapa-public-v33-3d-r20c1-20261018/);
 assert.match(sw,/venues\/executive-r20c\.mjs/);
 assert.match(index,/venue=kanchanaburi-pesa4&v=r20c1/);
 assert.match(index,/venue=anuban-bophloi&v=r20c1/);
 assert.equal(data.venues[0].rows.length+data.venues[1].rows.length,98);
});
