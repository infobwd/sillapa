/* IA-6 LOCAL_FIRST: node tests/ia6-executive.test.cjs */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const API=require('../ia6-executive.js');
const {validateRelease,validateTombstone,resolve,scorecard,draftAudit,quality,meetingCSV,mount}=API;
const draft=[
 {key:'draft-F01-A01',groupName:'ศิลปะ',historyCycle:'70',events:[{},{},{}]},
 {key:'draft-F01-A02',groupName:'ศิลปะ',historyCycle:'73',events:[{},{}]},
 {key:'draft-F02-A01',groupName:'เพลง',historyCycle:'unresolved',events:[]}
];
const audited=draftAudit(draft);
assert.deepEqual(audited,{families:3,unique:3,from70:1,from73:1,unresolved:1,child70:3,child73:2});
const none=resolve();
assert.equal(none.state,'disconnected');
assert.equal(none.ok,false);
assert.ok(scorecard(none,'district').every(m=>m.value===null&&m.denom===null));
assert.ok(quality(none,draft,'district').some(a=>a.id==='source'));
const draftCSV=meetingCSV({state:none,families:draft,stage:'district'});
assert.ok(draftCSV.startsWith('\ufeff'));
assert.ok(draftCSV.includes('ไม่ใช่การรับรอง'));
assert.ok(draftCSV.includes('—'));
assert.ok(!draftCSV.includes('สมมติ กรรมการ'));
const coverage=()=>({activities:'complete',obligations:'complete',teams:'complete',
 judges:'complete',venues:'complete',issues:'complete'});
const stage=stage_scope=>({
 stage_scope,coverage:stage_scope==='cluster'?{...coverage(),obligations:'missing'}:coverage(),activities_confirmed:20,
 obligations_required:stage_scope==='cluster'?null:10,
 obligations_submitted:stage_scope==='cluster'?null:6,
 obligations_verified:stage_scope==='cluster'?null:4,
 teams_verified:14,judges_required:30,judges_available:33,
 venues_required:6,venues_confirmed:3,issues_open:2
});
const published={
 schema:'sillapa-ia6-public-v1',cycle_id:'74',publication_id:'pub-example-001',
 publication_state:'published',data_version:'version-1',source_system:'AcademicCompetitionManager',
 source_reference:'public-official-aggregate-reference',
 source_as_of:'2026-10-14T10:00:00+07:00',
 published_at:'2026-10-15T10:00:00+07:00',
 stage_summaries:[stage('district'),stage('cluster')]
};
const assertBad=release=>assert.equal(validateRelease(release).ok,false,'reject invalid authorized release');
assert.equal(validateRelease(published).ok,true);
assert.equal(validateRelease({...published,stage_summaries:[{
 ...stage('cluster'),coverage:coverage(),obligations_required:5,
 obligations_submitted:3,obligations_verified:2
}]}).ok,false,'cluster rows must never create a district representative obligation');
assert.equal(validateRelease({...published,stage_summaries:[stage('district')]}).ok,true,'single scoped release permitted');
assert.equal(validateRelease({...published,stage_summaries:[stage('cluster'),stage('cluster')]}).ok,false);
for(const mutation of [
 {cycle_id:'73'},{publication_state:'draft'},{source_system:'other'},
 {source_as_of:null},{source_as_of:'2026-10-14'}, {published_at:'2026-10-13T01:00:00+07:00'},
 {publication_id:''},{data_version:''},{personName:'Private'},
 {stage_summaries:[{...stage('district'),judge_name:'private'}]},
 {stage_summaries:[{...stage('district'),activities_confirmed:-1}]},
 {stage_summaries:[{...stage('district'),activities_confirmed:1.5}]},
 {stage_summaries:[{...stage('district'),coverage:{...coverage(),issues:'broken'}}]},
 {stage_summaries:[{...stage('district'),coverage:{...coverage(),venues:'partial'}}]},
 {stage_summaries:[{...stage('district'),obligations_verified:7}]},
 {stage_summaries:[{...stage('district'),obligations_submitted:11}]},
 {stage_summaries:[{...stage('district'),venues_confirmed:7}]},
 {stage_summaries:[{...stage('district'),stage_scope:'other'}]}
])assertBad({...published,...mutation});
const partial={...stage('district'),coverage:{...coverage(),judges:'partial'},
 judges_available:null,judges_required:null};
const cleanPartial={...published,stage_summaries:[partial]};
assert.equal(validateRelease(cleanPartial).ok,true,'partial scope accepted only with null count');
const status=resolve({release:cleanPartial,now:Date.parse('2026-10-16T10:00:00+07:00')});
assert.equal(status.ok,true);
const metrics=scorecard(status,'district');
assert.equal(metrics.find(m=>m.id==='judges').value,null);
assert.equal(metrics.find(m=>m.id==='judges').denom,null);
assert.equal(metrics.find(m=>m.id==='activities').value,20);
assert.equal(metrics.find(m=>m.id==='representatives').value,4);
assert.equal(metrics.find(m=>m.id==='representatives').denom,10);
assert.equal(scorecard(status,'cluster').every(m=>m.value===null),true,'no cross-stage count fallback');
assert.ok(quality(status,draft,'district').some(a=>a.id==='partial_judges'));
assert.ok(quality(status,draft,'cluster').some(a=>a.id==='stage'));
const zero={...stage('district'),activities_confirmed:0,obligations_required:0,
 obligations_submitted:0,obligations_verified:0,teams_verified:0,judges_required:0,
 judges_available:0,venues_required:0,venues_confirmed:0,issues_open:0};
const zeroRelease={...published,stage_summaries:[zero]};
const yesZero=resolve({release:zeroRelease,now:Date.parse('2026-10-15T15:00:00+07:00')});
assert.equal(scorecard(yesZero,'district')[0].value,0,'real complete zero is allowed');
assert.equal(scorecard(yesZero,'cluster')[0].value,null,'missing stage unknown');
const old=resolve({release:published,now:Date.parse('2026-10-24T10:00:00+07:00')});
assert.equal(old.state,'stale');
assert.ok(quality(old,draft,'district').some(a=>a.id==='stale'));
const offline=resolve({release:published,offline:true,now:Date.parse('2026-10-15T14:00:00+07:00')});
assert.equal(offline.state,'cached_unverified');
assert.ok(quality(offline,draft,'district').some(a=>a.id==='offline'));
const tomb={
 schema:'sillapa-ia6-revocation-v1',cycle_id:'74',publication_id:'pub-example-001',
 data_version:'version-1',state:'revoked',revoked_at:'2026-10-15T11:00:00+07:00',
 superseded_by:null,source_system:'AcademicCompetitionManager',
 source_reference:'release-revocation-official'
};
assert.equal(validateTombstone(tomb).ok,true);
assert.equal(resolve({release:published,revocation:tomb}).state,'revoked');
assert.ok(scorecard(resolve({release:published,revocation:tomb}),'district').every(m=>m.value===null),
 'revoked publication must not drive KPI');
assert.equal(resolve({release:published,revocation:{...tomb,state:'draft'}}).state,'hold');
assert.equal(resolve({release:published,revocation:{...tomb,judge:'private'}}).state,'hold');
assert.equal(resolve({release:published,revocation:{...tomb,data_version:'different'}}).ok,true,
 'tombstone for another data revision does not revoke the current revision');
const exported=meetingCSV({state:status,families:[{...draft[0],key:'=IMPORT',groupName:'=SUM(1)'}],stage:'district'});
assert.ok(exported.includes('public-official-aggregate-reference'));
assert.ok(exported.includes('version-1'));
assert.ok(exported.includes('รหัสเผยแพร่'));
assert.ok(!exported.includes('Private Person'),'report contains only aggregate metadata');
const textJs=read('ia6-executive.js'),html=read('index.html'),sw=read('sw.js');
for(const str of ['id="v-executive"','id="ia6Root"','ia6-executive.js','ia6.css',
 'data-go="executive"',"['executive','Dashboard สำหรับผู้บริหาร']",
 "executive:'overview'",'SILLAPA_IA6.mount({','release:null,revocation:null',
 'id="ia5Root"','id="ia4Summary"','id="ia3Root"','id="ia2Root"','id="v-judges"'])
 assert.ok(html.includes(str),'IA-6/previous view integration '+str);
assert.match(sw,/sillapa-public-v\d+-ia\d+-\d{8}/,'PWA cache version advances after UI copy changes');
assert.ok(sw.includes('./ia6.css')&&sw.includes('./ia6-executive.js'));
assert.equal(/fetch\(|XMLHttpRequest|localStorage|sessionStorage|navigator\.sendBeacon|db\.collection/.test(textJs),false,
 'IA-6 never reads local plans or fetches private backend data');
const inline=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
assert.ok(inline.length>0);
inline.forEach((source,i)=>new vm.Script(source,{filename:'inline-index-'+i+'.js'}));
// Minimal DOM mount validates output and user-driven stage changes.
const el={};
for(const id of ['ia6Status','ia6Source','ia6Offline','ia6Kpis','ia6Draft','ia6Alerts',
 'ia6StageHint','ia6Stage','ia6Export']){
 el['#'+id]={textContent:'',innerHTML:'',value:'district',addEventListener(n,fn){this['on'+n]=fn}};
}
const root={innerHTML:'',querySelector:q=>el[q]};
const oldDoc=global.document;
global.document={getElementById:id=>id==='ia6Root'?root:null};
try{
 const dashboard=mount({rootId:'ia6Root',families:draft,release:null});
 assert.equal(dashboard.ok,true);
 assert.equal(dashboard.stage(),'district');
 assert.ok(el['#ia6Kpis'].innerHTML.includes('—'));
 assert.ok(el['#ia6Draft'].innerHTML.includes('3'));
 assert.ok(el['#ia6Status'].textContent.includes('ยังไม่มี'));
 el['#ia6Stage'].onchange({target:{value:'cluster'}});
 assert.equal(dashboard.stage(),'cluster');
 assert.ok(el['#ia6StageHint'].textContent.includes('กลุ่ม'));
 const trusted=mount({rootId:'ia6Root',families:draft,release:published,now:Date.parse('2026-10-15T11:00:00+07:00')});
 assert.equal(trusted.ok,true);
 assert.equal(trusted.getState().state,'published_snapshot');
 assert.ok(el['#ia6Kpis'].innerHTML.includes('20'));
 const revoked=mount({rootId:'ia6Root',families:draft,release:published,revocation:tomb});
 assert.equal(revoked.ok,true);
 assert.ok(el['#ia6Kpis'].innerHTML.includes('—'));
}finally{if(oldDoc===undefined)delete global.document;else global.document=oldDoc}
console.log('IA-6 LOCAL PASS: strict publication/revocation/denominators/stage scope/source/CSV and executive mount');
