/* IA-4 standalone local-first regression suite: node tests/ia4-school-workspace.test.cjs */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=n=>fs.readFileSync(path.join(root,n),'utf8');
const {createStore,renderSummary,renderChecks,STEPS,KEY}=require('../ia4-workspace.js');
const activity=['กิจกรรมหนึ่ง','กิจกรรมสอง'],levels=['ป.1-ป.3','ป.4-ป.6'];
function makeStorage(init={},fail=false){
  const data=new Map(Object.entries(init));
  return {getItem:k=>data.has(k)?data.get(k):null,
    setItem:(k,v)=>{if(fail)throw Error('quota');data.set(k,String(v))},
    dump:()=>Object.fromEntries(data)};
}
const original={school:'โรงเรียน ก',items:{'กิจกรรมหนึ่ง':['ป.1-ป.3'],'กิจกรรมสอง':['ป.4-ป.6']}};
const originalJson=JSON.stringify(original);
const storage=makeStorage({plan74:originalJson});
let store=createStore(storage,activity,levels);
assert.equal(store.info().migrated,true);
assert.deepEqual(store.current(),original,'import existing school plan without dropping levels');
assert.equal(storage.getItem('plan74'),originalJson,'never modify old plan74');
assert.equal(store.info().selectedSchool,'โรงเรียน ก');
assert.equal(store.progress().activities,2);
assert.equal(store.setCheck('กิจกรรมหนึ่ง','criteria',true),true);
assert.equal(store.getChecks('กิจกรรมหนึ่ง').criteria,true);
assert.equal(store.setCheck('กิจกรรมหนึ่ง','not-a-step',true),false);
assert.equal(store.setCheck('unknown','criteria',true),false);
store.selectSchool('โรงเรียน ข');
assert.deepEqual(store.current(),{school:'โรงเรียน ข',items:{}},'switch does not carry old school items');
assert.equal(store.progress().activities,0,'new school checklist starts empty');
assert.equal(store.setCheck('กิจกรรมหนึ่ง','criteria',true),false,'cannot check absent item');
assert.equal(store.savePlan({school:'โรงเรียน ก',items:{'กิจกรรมสอง':[]}}),false,
  'cross-school write rejected');
assert.equal(store.savePlan({school:'โรงเรียน ข',items:{'กิจกรรมหนึ่ง':['ป.4-ป.6']}}),true);
assert.equal(store.setCheck('กิจกรรมหนึ่ง','criteria',true),true);
store.selectSchool('โรงเรียน ก');
assert.deepEqual(store.current(),original,'return to school A has its own plan');
assert.equal(store.getChecks('กิจกรรมหนึ่ง').criteria,true,'school A checks persisted');
store.selectSchool('โรงเรียน ข');
assert.deepEqual(store.current().items,{'กิจกรรมหนึ่ง':['ป.4-ป.6']});
assert.equal(store.getChecks('กิจกรรมหนึ่ง').criteria,true,'school B separate checklist');
store.selectSchool('โรงเรียน ก');
store.savePlan({school:'โรงเรียน ก',items:{'กิจกรรมสอง':['ป.4-ป.6']}});
assert.deepEqual(store.getChecks('กิจกรรมหนึ่ง'),{},'removed item checklist deleted');
assert.deepEqual(store.current().items,{'กิจกรรมสอง':['ป.4-ป.6']});
store=createStore(storage,activity,levels);
assert.equal(store.info().migrated,false,'new-format reopening does not reimport legacy');
assert.equal(store.info().selectedSchool,'โรงเรียน ก');
assert.deepEqual(store.current().items,{'กิจกรรมสอง':['ป.4-ป.6']});
assert.equal(storage.getItem('plan74'),originalJson,'preserve old source even after edits');

// Input sanitization: no unknown activities, grade levels, student fields, or prototype pollution.
store.savePlan({school:'โรงเรียน ก',items:{'กิจกรรมหนึ่ง':['ป.1-ป.3','ป.1-ป.3','ม.9'],
  '__proto__':['a'],'unknown':['ป.1-ป.3']}});
assert.deepEqual(store.current().items,{'กิจกรรมหนึ่ง':['ป.1-ป.3']});
assert.equal(Object.prototype.polluted,undefined);
assert.equal(store.progress().total,3);
assert.equal(store.setCheck('กิจกรรมหนึ่ง','criteria',true),true);
assert.equal(store.setCheck('กิจกรรมหนึ่ง','levels',true),true);
assert.equal(store.setCheck('กิจกรรมหนึ่ง','documents',true),true);
assert.equal(store.progress().complete,1);
assert.equal(store.progress().done,3);
assert.ok(renderChecks(store,'กิจกรรมหนึ่ง').includes('checked'));
assert.ok(renderSummary(store).includes('ไม่ใช่ใบสมัคร'));
assert.ok(!renderSummary(store).includes('สมัครแล้ว'));
assert.equal(STEPS.length,3);
assert.equal(KEY,'sillapa74:school-workspace:v1');

// Orphan (legacy plan74 with no school) is quarantined until explicit adoption.
const orphanLegacy=JSON.stringify({school:'',items:{'กิจกรรมสอง':['ป.4-ป.6']}});
const orph=makeStorage({plan74:orphanLegacy});
const ms=createStore(orph,activity,levels);
assert.equal(ms.info().hasOrphan,true);
assert.equal(ms.current().school,'');
assert.deepEqual(ms.current().items,{});
assert.equal(ms.adoptOrphan(),false,'must select school before adopting');
ms.selectSchool('โรงเรียน ค');
assert.equal(ms.adoptOrphan(),true);
assert.deepEqual(ms.current().items,{'กิจกรรมสอง':['ป.4-ป.6']});
assert.equal(ms.info().hasOrphan,false);
assert.equal(orph.getItem('plan74'),orphanLegacy,'orphan source also retained');
// Orphan import must not silently overwrite a currently planned event.
const extra=makeStorage({plan74:orphanLegacy});
const mx=createStore(extra,activity,levels);
mx.selectSchool('โรงเรียน ก');
mx.savePlan({school:'โรงเรียน ก',items:{'กิจกรรมสอง':['ป.1-ป.3']}});
assert.equal(mx.adoptOrphan(),true);
assert.deepEqual(mx.current().items['กิจกรรมสอง'],['ป.1-ป.3'],'new plan wins collision');

// Fail-safe if storage is full, blocked or corrupt.
const locked=makeStorage({},true);
const lockedStore=createStore(locked,activity,levels);
assert.equal(lockedStore.info().lastSaved,false);
assert.equal(lockedStore.selectSchool('โรงเรียน ก').school,'โรงเรียน ก');
assert.equal(lockedStore.info().lastSaved,false);
const blockedRead={getItem(){throw Error('storage unavailable')},setItem(){throw Error('storage unavailable')}};
const blockedStore=createStore(blockedRead,activity,levels);
assert.equal(blockedStore.info().blocked,true,'Storage read failure does not abort public page');
assert.equal(blockedStore.info().lastSaved,false);
assert.equal(createStore(makeStorage(),activity,levels).selectSchool('__proto__').school,'',
  'unsafe prototype key cannot become a school profile');
const corrupt=makeStorage({[KEY]:'{"version":2,"schools":{}}',plan74:originalJson});
const corruptStore=createStore(corrupt,activity,levels);
assert.equal(corruptStore.info().blocked,true);
corruptStore.selectSchool('โรงเรียน ข');
assert.equal(corrupt.getItem(KEY),'{"version":2,"schools":{}}','corrupt new storage never overwritten');

// HTML and PWA integration checks.
const html=read('index.html'),sw=read('sw.js'),code=read('ia4-workspace.js');
for(const s of ['id="ia4Summary"','ia4.css','ia4-workspace.js','IA4Store.selectSchool',
  'window.SILLAPA_IA4.renderChecks','data-ia4-check',"IA4Store.savePlan(PLAN)"]){
  assert.ok(html.includes(s),'IA-4 integration: '+s);
}
assert.ok(!html.includes("db.collection('plans')"),'retired unapproved shared school-plan DB');
assert.ok(html.includes('id="v-prep"')&&html.includes('id="v-readiness"')&&html.includes('id="ia2Root"'),
  'legacy, IA-2 and IA-3 routes remain');
assert.match(sw,/sillapa-public-v\d+-ia\d+-\d{8}/,'PWA cache must be explicitly versioned');
assert.ok(sw.includes('./ia4.css')&&sw.includes('./ia4-workspace.js'));
assert.equal(/fetch\(|XMLHttpRequest|navigator\.sendBeacon|sessionStorage/i.test(code),false,
  'local helper must make no network calls');
assert.equal(/setItem\(['"]plan74['"]|removeItem\(['"]plan74['"]/.test(code),false,
  'legacy plan74 key must be read only');
const inline=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
assert.ok(inline.length>=2,'inline script extraction');
inline.forEach((code,i)=>new vm.Script(code,{filename:'index.inline.'+i+'.js'}));
console.log('IA-4 LOCAL PASS: scoped plans, legacy import, quarantine, checklist, quota, offline shell and index parse');
