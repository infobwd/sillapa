/**
 * D3D-R19 — adaptive quality, accessible mobile scene and PWA resilience.
 * Local-First: node --test tests/d3d-r19-mobile-performance-pwa.test.mjs
 * This test checks deterministic policy and source integrity; actual GPU FPS,
 * Safari, iPad touch and offline CDN behavior still require device acceptance.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 QUALITY_LEVELS,validQualityMode,chooseInitialQuality,getQualityProfile,
 limitAmbientCount,shouldDrawFrame,boundedSceneDelta,measureQualityDrop,
 visibleBadgeLimit,shouldAnimateDecorations
} from '../venues/performance-r19.mjs';

const scene=readFileSync(new URL('../venues/schematic-3d.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const pwa=readFileSync(new URL('../pwa.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');

test('auto chooses a deterministic device-appropriate detail tier',()=>{
 assert.deepEqual(QUALITY_LEVELS,['low','balanced','high']);
 assert.equal(chooseInitialQuality({width:375,cores:8,memory:8}),'low');
 assert.equal(chooseInitialQuality({width:700,cores:8,memory:8}),'balanced');
 assert.equal(chooseInitialQuality({width:1200,cores:8,memory:8}),'high');
 assert.equal(chooseInitialQuality({width:1200,cores:2,memory:8}),'low');
 assert.equal(chooseInitialQuality({width:1200,cores:8,memory:2}),'low');
 assert.equal(chooseInitialQuality({width:1200,cores:8,memory:8,saveData:true}),'low');
 assert.equal(chooseInitialQuality({width:1200,cores:4,memory:8}),'balanced');
});

test('quality selection limits DPR and render cadence without changing historical data',()=>{
 const env={width:1200,cores:8,memory:8,devicePixelRatio:3};
 const high=getQualityProfile('high',env);
 const medium=getQualityProfile('balanced',env);
 const low=getQualityProfile('low',env);
 assert.equal(high.pixelRatio,2);
 assert.equal(medium.pixelRatio,1.4);
 assert.equal(low.pixelRatio,1);
 assert.equal(high.fps,60);
 assert.equal(medium.fps,30);
 assert.equal(low.fps,24);
 assert.ok(low.ambientDensity<medium.ambientDensity);
 assert.ok(medium.ambientDensity<high.ambientDensity);
 assert.equal(getQualityProfile('bad-value',env).quality,'balanced');
 assert.equal(validQualityMode('bad-value'),false);
 assert.equal(validQualityMode('auto'),true);
});

test('low detail reduces ambient population but retains illustrative vehicle/pupil routes',()=>{
 const n=90;
 const high=limitAmbientCount(n,true,getQualityProfile('high',{width:1200}));
 const low=limitAmbientCount(n,true,getQualityProfile('low',{width:375}));
 assert.ok(high>low);
 assert.ok(low>=5);
 assert.equal(limitAmbientCount(n,false,getQualityProfile('low')),6);
 assert.equal(visibleBadgeLimit(getQualityProfile('low'),false),0);
 assert.ok(visibleBadgeLimit(getQualityProfile('high'),true)>=5);
 assert.match(scene,/const totalPeople=limitAmbientCount\(activityCount,isDistrict,qualityProfile\)/);
 assert.match(scene,/function refreshAmbientWalkerVisibility\(\)/);
 assert.match(scene,/walkers\[i\]\.person\.visible=i<maxVisible/);
 assert.match(scene,/lastRenderedMs=null;performanceWindowStart=null;performanceSamples=0;\s*refreshAmbientWalkerVisibility\(\)/);
 assert.match(scene,/addWalkers\(district,activityCount\);refreshAmbientWalkerVisibility\(\);animateWalkers\(simulationTime\)/);
 assert.match(scene,/if\(!w\.person\.visible\|\|w\.length<=0\)continue/);
 assert.match(scene,/renderer\.setPixelRatio\(qualityProfile\.pixelRatio\);\s*paintPerformanceStatus\(\);\s*refreshAmbientWalkerVisibility\(\)/);
 assert.match(scene,/camDistance<=qualityProfile\.detailDistance/);
 assert.match(scene,/addDistrictVehicles\(activityCount\);buildStudentTour\(\)/);
 assert.match(scene,/fromVanToRegistrationWaypoints\(j\)/);
});

test('frame gate throttles without advancing animation on skipped frames',()=>{
 assert.equal(shouldDrawFrame(null,100,30),true);
 assert.equal(shouldDrawFrame(100,110,30),false);
 assert.equal(shouldDrawFrame(100,134,30),true);
 assert.equal(shouldDrawFrame(100,117,60),true);
 assert.equal(shouldDrawFrame(100,117,24),false);
 assert.equal(shouldDrawFrame(100,150,24),true);
 assert.equal(shouldDrawFrame(100,Number.NaN,24),false);
 assert.equal(boundedSceneDelta(null,123),1/60);
 assert.equal(boundedSceneDelta(0,16),.016);
 assert.equal(boundedSceneDelta(0,500),.065);
 assert.equal(boundedSceneDelta(20,10),0);
 assert.match(scene,/if\(!shouldDrawFrame\(lastRenderedMs,frameMs,qualityProfile\.fps\)\)return/);
 assert.match(scene,/const dt=boundedSceneDelta\(lastRenderedMs,frameMs\)/);
 assert.match(scene,/lastRenderedMs=frameMs;simulationTime\+=dt/);
 assert.doesNotMatch(scene,/const t=clock\.getElapsedTime\(\)/);
});

test('scene pauses when backgrounded, offscreen or GPU context is lost',()=>{
 assert.match(scene,/if\(!renderActive\|\|document\.hidden\|\|!sceneInViewport\)/);
 assert.match(scene,/document\.addEventListener\('visibilitychange'/);
 assert.match(scene,/IntersectionObserver\(entries=>/);
 assert.match(scene,/if\(!sceneInViewport\)\{lastRenderedMs=null/);
 assert.match(scene,/renderer\.domElement\.addEventListener\('webglcontextlost'/);
 assert.match(scene,/event\.preventDefault\(\);renderActive=false/);
 assert.match(scene,/renderer\.domElement\.addEventListener\('webglcontextrestored'/);
 assert.match(scene,/renderActive=true;lastRenderedMs=null;hideSceneHealth\(\)/);
 assert.match(scene,/sceneHealth\.hidden=false/);
});

test('automatic quality falls back after sustained pressure, never below low',()=>{
 assert.equal(measureQualityDrop('high',0,12,60),'high');
 assert.equal(measureQualityDrop('high',1,12,60),'high');
 assert.equal(measureQualityDrop('high',2,30,60),'balanced');
 assert.equal(measureQualityDrop('balanced',2,14,30),'low');
 assert.equal(measureQualityDrop('low',2,9,24),'low');
 assert.equal(measureQualityDrop('high',3,55,60),'high');
 assert.match(scene,/const next=measureQualityDrop\(qualityProfile\.quality,slowWindows/);
 assert.match(scene,/autoTierOverride=next/);
 assert.match(scene,/renderer\.setPixelRatio\(qualityProfile\.pixelRatio\)/);
 assert.match(scene,/new THREE\.WebGLRenderer\(\{antialias:qualityProfile\.quality==='high'/);
});

test('reduced motion preserves essential moving traffic but stops ambient decoration',()=>{
 assert.equal(shouldAnimateDecorations(true),false);
 assert.equal(shouldAnimateDecorations(false),true);
 assert.match(scene,/if\(peopleVisible&&shouldAnimateDecorations\(motionReduced\)\)animateWalkers\(t\)/);
 assert.match(scene,/animateBuses\(t\);/);
 assert.match(scene,/if\(shouldAnimateDecorations\(motionReduced\)\)\{animateRoadArrows\(t\);animateFlag\(t\)\}/);
 assert.match(scene,/if\(motionReduced\)\{\s*camera\.position\.copy\(flight\.toCamera\)/);
 assert.match(scene,/if\(!motionReduced\)\{\s*controls\.target\.lerp\(target/);
 assert.match(scene,/controls\.enableDamping=!motionReduced/);
 assert.match(scene,/reducedMotionQuery=window\.matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
});

test('visible performance controls have persisted preference and accessible status',()=>{
 assert.match(scene,/id="performanceBar"/);
 assert.match(scene,/<details id="performanceMore" class="performance-more" open>/);
 assert.match(scene,/function syncPerformanceDisclosure\(event\)\{performanceDisclosure\.open=!event\.matches\}/);
 assert.match(scene,/mobileWayfindingQuery\.addEventListener\('change',syncPerformanceDisclosure\)/);
 assert.match(scene,/id="qualityMode"/);
 assert.match(scene,/id="motionMode" type="button" aria-pressed="false"/);
 assert.match(scene,/id="performanceStatus" role="status" aria-live="polite"/);
 assert.match(scene,/savedSetting\('sillapa-3d-quality'\)/);
 assert.match(scene,/saveSetting\('sillapa-3d-quality',qualityMode\)/);
 assert.match(scene,/savedSetting\('sillapa-3d-reduced-motion'\)/);
 assert.match(scene,/saveSetting\('sillapa-3d-reduced-motion',savedReduced\)/);
 assert.match(scene,/qualitySelector\.addEventListener\('change'/);
 assert.match(scene,/motionModeButton\.addEventListener\('click'/);
 assert.match(scene,/try\{return localStorage\.getItem\(key\)\}catch/);
 assert.match(scene,/\.performance-bar label\{display:flex/);
});

test('mobile touch gestures and details sheets retain safe hit targets',()=>{
 assert.match(scene,/controls\.touches\.ONE=THREE\.TOUCH\.ROTATE/);
 assert.match(scene,/controls\.touches\.TWO=THREE\.TOUCH\.DOLLY_PAN/);
 assert.match(scene,/renderer\.domElement\.style\.touchAction='none'/);
 assert.match(scene,/\.performance-bar button\{width:100%;min-width:0/);
 assert.match(scene,/\.model-panel\{left:8px;right:8px;bottom:max\(8px,env\(safe-area-inset-bottom\)\)/);
 assert.match(scene,/\.model-panel button\{position:sticky;top:0/);
 assert.match(scene,/\.scene-tools button\{min-height:44px/);
 assert.match(scene,/min-height:44px/);
});

test('stale history and font refresh never trigger duplicate scene rebuilds',()=>{
 assert.match(scene,/let labelsRefreshed=false/);
 assert.match(scene,/if\(labelsRefreshed\|\|!venues\.length\)return;labelsRefreshed=true/);
 assert.match(scene,/fetch\('\.\/history73\.json',\{cache:'no-store'\}\)/);
 assert.match(scene,/data\.publicationStatus!=='historical-review-only'/);
 assert.match(scene,/setWayfindingControlsAvailability\(false\)/);
 assert.match(scene,/showSceneHealth\('ข้อมูลสนามยังไม่พร้อม'/);
 assert.match(scene,/id="sceneRetry" type="button"/);
});

test('module/CDN and WebGL failures remain actionable without falsely promising offline 3D',()=>{
 assert.match(scene,/R19: surface a useful error even when the external Three\.js module fails/);
 assert.match(scene,/window\.addEventListener\('error',function\(event\)/);
 assert.match(scene,/window\.addEventListener\('unhandledrejection'/);
 assert.match(scene,/window\.addEventListener\('offline'/);
 assert.match(scene,/id="sceneHealth" role="alert" hidden/);
 assert.match(scene,/Three\.js ในครั้งแรก/);
 assert.match(scene,/href="\.\/">ดูข้อมูลสนามแบบรายการ/);
 assert.match(sw,/offline navigations must/);
 assert.match(sw,/caches\.match\(request, \{ignoreSearch: true\}\)/);
 assert.match(sw,/url\.pathname\.endsWith\('\/venues\/schematic-3d\.html'\)/);
 assert.match(sw,/return Response\.error\(\)/);
});

test('PWA v27 updates the proper 3D assets and surfaces queued SW updates',()=>{
 assert.match(sw,/sillapa-public-v28-3d-r19b-20261017/);
 for(const path of ['performance-r19.mjs','schematic-3d.html','venue-shell.css','history73.json']){
  assert.ok(sw.includes("'./venues/"+path+"'"),'offline shell includes '+path);
 }
 assert.ok(sw.includes("if (/\\.(?:css|m?js|json)$/.test(url.pathname))"),
  'network-first public code/style/JSON shell assets');
 assert.match(pwa,/reg\.waiting && navigator\.serviceWorker\.controller/);
 assert.match(pwa,/reg\.addEventListener\('updatefound'/);
 assert.match(pwa,/installing\.state === 'installed' && navigator\.serviceWorker\.controller/);
 assert.match(pwa,/navigator\.serviceWorker\.addEventListener\('controllerchange'/);
 assert.match(index,/venue=kanchanaburi-pesa4&v=r19b/);
 assert.match(index,/venue=anuban-bophloi&v=r19b/);
});
