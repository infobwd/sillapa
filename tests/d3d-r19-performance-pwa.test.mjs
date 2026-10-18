/**
 * D3D-R19 — Mobile / adaptive render / reduced motion / PWA regression.
 * Run locally: node --test tests/d3d-r19-performance-pwa.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 QUALITY_LEVELS,validQualityMode,chooseInitialQuality,getQualityProfile,
 limitAmbientCount,shouldDrawFrame,boundedSceneDelta,
 measureQualityDrop,visibleBadgeLimit,shouldAnimateDecorations
} from '../venues/performance-r19.mjs';

const scene=readFileSync(new URL('../venues/schematic-3d.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');

test('quality settings use explicit immutable, user-selectable levels',()=>{
 assert.deepEqual(QUALITY_LEVELS,['low','balanced','high']);
 for(const name of ['auto',...QUALITY_LEVELS])assert.equal(validQualityMode(name),true);
 for(const bad of ['',null,'ultra','__proto__','full'])assert.equal(validQualityMode(bad),false);
 const low=getQualityProfile('low',{devicePixelRatio:3});
 const med=getQualityProfile('balanced',{devicePixelRatio:3});
 const high=getQualityProfile('high',{devicePixelRatio:3});
 assert.equal(low.fps,24);assert.equal(med.fps,30);assert.equal(high.fps,60);
 assert.equal(low.pixelRatio,1);assert.equal(med.pixelRatio,1.4);
 assert.equal(high.pixelRatio,2);
 assert.ok(low.ambientDensity<med.ambientDensity&&med.ambientDensity<high.ambientDensity);
});

test('automatic device detection conservatively handles small and low-power devices',()=>{
 assert.equal(chooseInitialQuality({width:375,cores:8,memory:8}),'low');
 assert.equal(chooseInitialQuality({width:850,cores:8,memory:8}),'balanced');
 assert.equal(chooseInitialQuality({width:1280,cores:8,memory:8}),'high');
 assert.equal(chooseInitialQuality({width:1280,cores:2,memory:8}),'low');
 assert.equal(chooseInitialQuality({width:1280,cores:8,memory:1}),'low');
 assert.equal(chooseInitialQuality({width:1280,cores:8,memory:8,saveData:true}),'low');
 assert.equal(chooseInitialQuality({width:1280,cores:4,memory:8}),'balanced');
 const auto=getQualityProfile('auto',{width:375,devicePixelRatio:3});
 assert.equal(auto.quality,'low');assert.equal(auto.mode,'auto');
});

test('render density is adaptive for background people but does not mutate official data',()=>{
 const low=getQualityProfile('low'),high=getQualityProfile('high');
 assert.ok(limitAmbientCount(70,true,low)<limitAmbientCount(70,true,high));
 assert.ok(limitAmbientCount(70,false,low)<limitAmbientCount(70,false,high));
 assert.ok(limitAmbientCount(0,true,low)>=5);
 assert.ok(limitAmbientCount(1000,true,high)<=20);
 assert.ok(visibleBadgeLimit(low)<=visibleBadgeLimit(high));
 assert.equal(visibleBadgeLimit(high,false),0);
 assert.match(scene,/limitAmbientCount\(activityCount,isDistrict,qualityProfile\)/);
 assert.match(scene,/qualityProfile\.detailDistance/);
});

test('frame limiter caps updates by selected FPS without time-based vehicle jumps',()=>{
 assert.equal(shouldDrawFrame(null,1000,24),true);
 assert.equal(shouldDrawFrame(1000,1008,24),false);
 assert.equal(shouldDrawFrame(1000,1043,24),true);
 assert.equal(shouldDrawFrame(1000,1034,30),true);
 assert.equal(shouldDrawFrame(1000,1012,60),false);
 assert.equal(shouldDrawFrame(1000,1018,60),true);
 assert.equal(shouldDrawFrame(1000,NaN,60),false);
 assert.equal(boundedSceneDelta(null,0),1/60);
 assert.equal(boundedSceneDelta(1000,1040),.04);
 assert.equal(boundedSceneDelta(1000,300000),.065);
 assert.equal(boundedSceneDelta(1000,1000),0);
});

test('quality drops only after repeated underperformance in auto mode',()=>{
 assert.equal(measureQualityDrop('high',1,12,60),'high');
 assert.equal(measureQualityDrop('high',2,12,60),'balanced');
 assert.equal(measureQualityDrop('balanced',2,10,30),'low');
 assert.equal(measureQualityDrop('low',3,1,24),'low');
 assert.equal(measureQualityDrop('high',2,50,60),'high');
 assert.equal(measureQualityDrop('high',2,NaN,60),'high');
 assert.match(scene,/qualityMode==='auto'&&elapsed>0/);
 assert.match(scene,/autoTierOverride=next/);
});

test('reduced motion reduces decorations but keeps vehicles and students moving',()=>{
 assert.equal(shouldAnimateDecorations(false),true);
 assert.equal(shouldAnimateDecorations(true),false);
 assert.match(scene,/if\(peopleVisible&&shouldAnimateDecorations\(motionReduced\)\)animateWalkers\(t\)/);
 assert.match(scene,/animateBuses\(t\)/);
 assert.match(scene,/if\(shouldAnimateDecorations\(motionReduced\)\)\{animateRoadArrows\(t\);animateFlag\(t\)\}/);
 assert.match(scene,/animateStudentTour\(t\);animateWayfindingFollow\(t\)/);
 assert.match(scene,/controls\.enableDamping=!motionReduced/);
});

test('scene time is shared by camera flights and traffic, paused when hidden',()=>{
 assert.doesNotMatch(scene,/const clock=new THREE\.Clock\(\)/);
 assert.match(scene,/let simulationTime=0,lastRenderedMs=null/);
 assert.match(scene,/if\(!renderActive\|\|document\.hidden\|\|!sceneInViewport\)/);
 assert.match(scene,/if\(!shouldDrawFrame\(lastRenderedMs,frameMs,qualityProfile\.fps\)\)return/);
 assert.match(scene,/const dt=boundedSceneDelta\(lastRenderedMs,frameMs\)/);
 assert.match(scene,/lastRenderedMs=frameMs;simulationTime\+=dt/);
 assert.match(scene,/new IntersectionObserver\(entries=>/);
 assert.match(scene,/document\.addEventListener\('visibilitychange'/);
 assert.match(scene,/wayfindingFollowStart=simulationTime/);
 assert.match(scene,/studentTourStart=simulationTime/);
});

test('quality dropdown and motion controls persist only explicit display settings',()=>{
 assert.match(scene,/id="performanceMore"/);
 assert.match(scene,/id="qualityMode"/);
 assert.match(scene,/id="motionMode"/);
 assert.match(scene,/id="performanceStatus"/);
 assert.match(scene,/savedSetting\('sillapa-3d-quality'\)/);
 assert.match(scene,/saveSetting\('sillapa-3d-quality',qualityMode\)/);
 assert.match(scene,/saveSetting\('sillapa-3d-reduced-motion',savedReduced\)/);
 assert.match(scene,/matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
 assert.match(scene,/const deviceProfile=\(\)=>/);
 assert.match(scene,/renderer\.setPixelRatio\(qualityProfile\.pixelRatio\)/);
});

test('mobile touch gestures, bottom sheet and eight scene buttons stay operable',()=>{
 assert.match(scene,/controls\.touches\.ONE=THREE\.TOUCH\.ROTATE/);
 assert.match(scene,/controls\.touches\.TWO=THREE\.TOUCH\.DOLLY_PAN/);
 assert.match(scene,/renderer\.domElement\.style\.touchAction='none'/);
 assert.match(scene,/id="modelPanel" class="model-panel" role="dialog"/);
 assert.match(scene,/const sheetHead=document\.createElement\('div'\)/);
 assert.match(scene,/sheetHead\.className='sheet-head'/);
 assert.match(scene,/expand\.setAttribute\('aria-expanded','false'\)/);
 assert.match(scene,/panel\.classList\.toggle\('expanded'\)/);
 assert.match(scene,/close\.setAttribute\('aria-label','ปิดรายละเอียดอาคาร'\)/);
 assert.match(scene,/\.model-panel\.expanded\{max-height:72%\}/);
 assert.match(scene,/\.sheet-head button\{float:none;min-height:44px/);
 assert.match(scene,/\.scene-tools\{display:grid;grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
});

test('WebGL errors provide retry, useful explanation and safe history-only fallback',()=>{
 assert.match(scene,/id="sceneHealth" role="alert" hidden/);
 assert.match(scene,/id="sceneRetry" type="button"/);
 assert.match(scene,/window\.addEventListener\('unhandledrejection'/);
 assert.match(scene,/window\.addEventListener\('offline'/);
 assert.match(scene,/webglcontextlost/);
 assert.match(scene,/webglcontextrestored/);
 assert.match(scene,/window\.addEventListener\('error'/);
 assert.match(scene,/จำเป็นต้องเชื่อมต่ออินเทอร์เน็ตเพื่อโหลด Three\.js/);
 assert.match(scene,/ดูข้อมูลสนามแบบรายการ/);
});

test('new PWA precaches correct public venue assets and fallback is the actual venue',()=>{
 assert.match(sw,/sillapa-public-v33-3d-r20c1-20261018/);
 for(const file of ['performance-r19.mjs','schematic-3d.html','history73.json','venue-shell.css']){
  assert.ok(sw.includes('./venues/'+file),file+' in shell');
 }
 assert.match(sw,/url\.pathname\.endsWith\('\/venues\/schematic-3d\.html'\)/);
 assert.match(sw,/caches\.match\(request,\s*\{ignoreSearch: true\}\)/);
 assert.match(sw,/not guaranteed|NOT offline guaranteed/);
 assert.match(index,/venue=kanchanaburi-pesa4&v=r20c1/);
 assert.match(index,/venue=anuban-bophloi&v=r20c1/);
});

test('standalone 3D page shows its own update banner; never reloads without click',()=>{
 assert.match(scene,/id="sceneUpdate" role="status" class="scene-update" hidden/);
 assert.match(scene,/id="sceneUpdateReload" type="button"/);
 assert.match(scene,/navigator\.serviceWorker\.addEventListener\('controllerchange'/);
 assert.match(scene,/if\(had3DController\)sceneUpdateNotice\.hidden=false/);
 assert.match(scene,/navigator\.serviceWorker\.register\('\.\.\/sw\.js'/);
 assert.match(scene,/document\.querySelector\('#sceneUpdateReload'\)\.addEventListener\('click',\(\)=>location\.reload\(\)\)/);
});

test('scene runtime declarations remain executable, not hidden behind line comments',()=>{
 const js=scene.split('<script type="module">')[1].split('</script>')[0];
 const executable=js.split('\n').map(line=>line.split('//')[0]).join('\n');
 for(const declaration of ['const buses=[]','const flagCloths=[]',
  'const registrationStaff=[]','const buildingTargets=new Map()']){
  assert.ok(executable.includes(declaration),declaration+' must be executable');
 }
 assert.match(scene,/renderer\.setAnimationLoop\(loop\)/);
});

test('graph, vehicle and historical 73 content stay separated from R19 optimization',()=>{
 assert.match(scene,/from '\.\/wayfinding-r18\.mjs'/);
 assert.match(scene,/from '\.\/traffic-r16\.mjs'/);
 assert.match(scene,/from '\.\/dropoff-r17\.mjs'/);
 assert.match(scene,/data\.edition!==73\|\|data\.publicationStatus!=='historical-review-only'/);
 assert.match(scene,/ไม่ใช่กำหนดการครั้งที่ 74/);
 assert.match(scene,/render\(scene,camera\)/);
});
