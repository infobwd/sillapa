/**
 * D3D-R20A — visual-only 3D regression. Local-First Node 22+
 * node --test tests/d3d-r20a-visual-language.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {VISUAL_R20A,getSceneCameraPreset,getVenueLabelStyle} from '../venues/visual-r20a.mjs';
const scene=readFileSync(new URL('../venues/schematic-3d.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');

test('source labels distinguish illustration, structure and historical rows',()=>{
 assert.notEqual(VISUAL_R20A.highway,VISUAL_R20A.campusRoad);
 assert.notEqual(VISUAL_R20A.parcel,VISUAL_R20A.ground);
 assert.equal(getVenueLabelStyle('จุดรับ–ส่ง (จำลอง)').background,VISUAL_R20A.labelAmber);
 assert.equal(getVenueLabelStyle('ลงทะเบียน (จำลอง)').background,VISUAL_R20A.labelAmber);
 assert.equal(getVenueLabelStyle('อาคารโดม').background,VISUAL_R20A.labelTeal);
 assert.equal(getVenueLabelStyle('อาคาร 1').background,VISUAL_R20A.labelBlue);
 assert.equal(getVenueLabelStyle('ห้องประชุม ชั้น 2').background,VISUAL_R20A.labelTeal);
});
test('responsive camera presets used by both opening and reset',()=>{
 assert.deepEqual(getSceneCameraPreset(false,true),[25,29,33]);
 assert.notDeepEqual(getSceneCameraPreset(true,true),getSceneCameraPreset(true,false));
 for(const coords of [getSceneCameraPreset(true,true),getSceneCameraPreset(true,false)]){
  assert.equal(coords.length,3);
  assert.ok(coords.every(n=>Number.isFinite(n)&&n>0));
 }
 assert.equal((scene.match(/camera\.position\.set\(\.\.\.getSceneCameraPreset\(/g)||[]).length,2);
 assert.match(scene,/function flyToBuilding\(/);
});
test('semantic informational color palette and readable canvas labels',()=>{
 assert.match(scene,/scene\.background=new THREE\.Color\(VISUAL_R20A\.sky\)/);
 assert.match(scene,/color:VISUAL_R20A\.ground/);
 assert.match(scene,/const style=getVenueLabelStyle\(name\)/);
 assert.match(scene,/ctx\.fillText\(name,334,79,570\)/);
 assert.match(scene,/mesh\.userData\.label=label/);
 assert.match(scene,/ctx\.fillStyle=VISUAL_R20A\.historical/);
});
test('historical/schematic/unverified key is visible outside scene and mobile responsive',()=>{
 assert.match(scene,/class="scene-visual-key"/);
 for(const label of ['ข้อมูลจากครั้งที่ 73','รถ คน และทางเดินเป็นภาพจำลอง','ตำแหน่งอาคารยังไม่ยืนยัน'])assert.ok(scene.includes(label),label);
 assert.match(scene,/\.scene-visual-key \.unverified/);
 assert.match(scene,/@media\(max-width:680px\)/);
 assert.ok(scene.indexOf('class="scene-visual-key"')<scene.indexOf('<div id="scene">'));
});
test('R19B vehicles, R17B student route and R18 interaction retained',()=>{
 assert.match(scene,/from '\.\/junction-r19b\.mjs'/);
 assert.match(scene,/const corridorBlocked=shouldHoldVehicleCorridor\(current,wanted/);
 assert.match(scene,/\[-10,25\.2\],\[0,25\.2\],\[10,25\.2\],\[13,29\]/);
 assert.match(scene,/function animateStudentTour\(t\)/);
 assert.match(scene,/function animateWayfindingFollow\(t\)/);
});
test('PWA v29 refreshes helper and both venue deep links',()=>{
 assert.match(sw,/sillapa-public-v33-3d-r20c1-20261018/);
 assert.match(sw,/venues\/visual-r20a\.mjs/);
 assert.match(sw,/venues\/junction-r19b\.mjs/);
 assert.match(index,/venue=kanchanaburi-pesa4&v=r20c1/);
 assert.match(index,/venue=anuban-bophloi&v=r20c1/);
});
