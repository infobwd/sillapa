/**
 * D3D-R19 — deterministic quality, throttling and motion policy for the
 * public THREE.js venue visualisation. No browser globals or network I/O.
 */
export const QUALITY_LEVELS=Object.freeze(['low','balanced','high']);
const LEVELS=Object.freeze({
 low:Object.freeze({fps:24,maxDpr:1.0,ambientDensity:.5,pinLimit:3,detailDistance:55}),
 balanced:Object.freeze({fps:30,maxDpr:1.4,ambientDensity:.75,pinLimit:5,detailDistance:95}),
 high:Object.freeze({fps:60,maxDpr:2,ambientDensity:1,pinLimit:5,detailDistance:125})
});
export function validQualityMode(mode){
 return ['auto',...QUALITY_LEVELS].includes(mode);
}
export function chooseInitialQuality(env={}){
 const width=Number.isFinite(env.width)?env.width:1024;
 const cores=Number.isFinite(env.cores)?env.cores:8;
 const memory=Number.isFinite(env.memory)?env.memory:8;
 if(env.saveData||memory<=2||cores<=2||width<=380)return 'low';
 if(width<=900||memory<=4||cores<=4)return 'balanced';
 return 'high';
}
export function getQualityProfile(mode='auto',env={}){
 const quality=mode==='auto'?chooseInitialQuality(env):
  validQualityMode(mode)?mode:'balanced';
 const setting=LEVELS[quality];
 return Object.freeze({
  mode:validQualityMode(mode)?mode:'auto',quality,
  fps:setting.fps,maxDpr:setting.maxDpr,
  pixelRatio:Math.min(Math.max(1,Number(env.devicePixelRatio)||1),setting.maxDpr),
  ambientDensity:setting.ambientDensity,
  pinLimit:setting.pinLimit,detailDistance:setting.detailDistance,
  reducedMotion:Boolean(env.reducedMotion)
 });
}
export function limitAmbientCount(activityCount,isDistrict,profile){
 const min=isDistrict?10:8,max=isDistrict?20:12;
 const base=Math.min(max,Math.max(min,Math.round(activityCount*.26)));
 return Math.max(isDistrict?5:4,Math.round(base*(profile?.ambientDensity??1)));
}
export function shouldDrawFrame(previousMs,currentMs,fps){
 if(!Number.isFinite(currentMs))return false;
 if(previousMs===null||!Number.isFinite(previousMs))return true;
 return currentMs-previousMs>=1000/Math.max(1,fps)-1.5;
}
export function boundedSceneDelta(previousMs,currentMs,maxStep=.065){
 if(previousMs===null||!Number.isFinite(previousMs))return 1/60;
 if(!Number.isFinite(currentMs)||currentMs<=previousMs)return 0;
 return Math.min(maxStep,(currentMs-previousMs)/1000);
}
export function measureQualityDrop(current,slowWindows,observedFps,targetFps){
 if(!QUALITY_LEVELS.includes(current))return current;
 if(slowWindows<2||!Number.isFinite(observedFps)||observedFps>=targetFps*.72)
  return current;
 const index=QUALITY_LEVELS.indexOf(current);
 return QUALITY_LEVELS[Math.max(0,index-1)];
}
export function visibleBadgeLimit(profile,near=true){
 return near?profile?.pinLimit??5:0;
}
export function shouldAnimateDecorations(reducedMotion){
 return !Boolean(reducedMotion);
}
