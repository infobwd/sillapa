/* IA-3 Local-First contract tests. Run: node tests/ia3-readiness.test.cjs */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const {validateSnapshot,derive,selectRows}=require('../ia3-readiness.js');
const iso='2026-10-15T09:00:00+07:00';
const fixture=()=>({
  schema_version:'sillapa-readiness-v1',cycle_id:'74',
  publication_id:'fixture-only-publication',publication_state:'published',
  data_version:'test-1',source_system:'AcademicCompetitionManager',
  source_reference:'synthetic-fixture-not-production',source_as_of:iso,
  published_at:'2026-10-15T10:00:00+07:00',
  coverage:{catalog:'complete',obligations:'complete',teams:'complete',issues:'complete'},
  activity_catalog:[
    {activity_id:'a1',family_id:'f1',title:'กิจกรรมสมมติ 1',category:'สมมติ',stage_scope:'district',
     competition_mode:'representative_only',approval_state:'confirmed',source_reference:'fixture',source_as_of:iso},
    {activity_id:'a2',family_id:'f1',title:'กิจกรรมสมมติ 2',category:'สมมติ',stage_scope:'district',
     competition_mode:'representative_plus_open',approval_state:'published',source_reference:'fixture',source_as_of:iso},
    {activity_id:'a3',family_id:'f2',title:'กิจกรรมเปิดสมมติ',category:'สมมติ',stage_scope:'district',
     competition_mode:'open',approval_state:'confirmed',source_reference:'fixture',source_as_of:iso},
    {activity_id:'a4',family_id:'f2',title:'กิจกรรมปิดสมมติ',category:'สมมติ',stage_scope:'district',
     competition_mode:'closed',approval_state:'confirmed',source_reference:'fixture',source_as_of:iso}
  ],
  clusters:[{cluster_id:'g1',label:'กลุ่มสมมติ 1'},{cluster_id:'g2',label:'กลุ่มสมมติ 2'}],
  public_readiness_aggregates:[
    {record_id:'r1',activity_id:'a1',cluster_id:'g1',stage_scope:'district',obligation_state:'required',
     planning_state:'drafting',submission_state:'submitted',verification_state:'verified',
     qualified_teams:2,verified_at:iso,source_as_of:iso},
    {record_id:'r2',activity_id:'a1',cluster_id:'g2',stage_scope:'district',obligation_state:'required',
     planning_state:'drafting',submission_state:'submitted',verification_state:'pending',
     qualified_teams:null,verified_at:null,source_as_of:iso},
    {record_id:'r3',activity_id:'a2',cluster_id:'g1',stage_scope:'district',obligation_state:'required',
     planning_state:'not_started',submission_state:'not_started',verification_state:'not_reviewed',
     qualified_teams:null,verified_at:null,source_as_of:iso}
  ],
  public_issues:[{issue_id:'i1',activity_id:'a2',cluster_id:'g1',title:'ประเด็นสมมติ',
    state:'open',source_reference:'fixture'}]
});
function invalid(mut,reason){
  const data=fixture();mut(data);
  assert.equal(validateSnapshot(data).ok,false,reason);
}
assert.equal(validateSnapshot(null).ok,false);
assert.equal(validateSnapshot(fixture()).ok,true);
invalid(x=>x.cycle_id='73','wrong cycle');
invalid(x=>x.publication_state='draft','unpublished');
invalid(x=>x.publication_id=null,'missing publication id');
invalid(x=>x.source_as_of=null,'missing source timestamp');
invalid(x=>x.published_at='2026-10-14T12:00:00+07:00','chronology');
invalid(x=>x.coverage.obligations='unknown','missing coverage quality');
invalid(x=>x.student_names=['anyone'],'PII key at root');
invalid(x=>x.public_readiness_aggregates[0].student_name='anyone','PII field in row');
invalid(x=>x.public_readiness_aggregates[1].record_id='r1','duplicate record ID');
invalid(x=>x.public_readiness_aggregates[1].cluster_id='g1','duplicate group activity pair');
invalid(x=>x.public_readiness_aggregates[0].stage_scope='cluster','wrong stage');
invalid(x=>x.activity_catalog[0].competition_mode='unknown','unknown policy');
invalid(x=>x.public_readiness_aggregates[0].activity_id='ghost','unknown activity');
invalid(x=>x.public_readiness_aggregates[0].cluster_id='ghost','unknown cluster');
invalid(x=>x.public_readiness_aggregates[0].qualified_teams=-1,'invalid count');
invalid(x=>x.public_readiness_aggregates[1].qualified_teams=3,'non-verified qualified teams');
invalid(x=>x.public_readiness_aggregates[0].verified_at=null,'verified timestamp required');
invalid(x=>{x.public_readiness_aggregates[0].activity_id='a3'},'no obligations from open');
invalid(x=>{x.public_readiness_aggregates[0].activity_id='a4'},'no obligations from closed');
invalid(x=>{x.public_issues[0].teacher='private name'},'private issue field');
const base=fixture();
const m=derive(base);
assert.equal(m.kpis.confirmedActivities,4);
assert.equal(m.kpis.requiredGroups,2);
assert.equal(m.kpis.submittedGroups,1,'all applicable tasks for a group, not just one submitted');
assert.equal(m.kpis.verifiedRecords,1,'submitted != verified');
assert.equal(m.kpis.qualifiedTeams,null,'unknown team count masks aggregate KPI');
assert.equal(m.kpis.openIssues,1);
base.public_readiness_aggregates[1].verification_state='verified';
base.public_readiness_aggregates[1].verified_at=iso;
base.public_readiness_aggregates[1].qualified_teams=0;
base.public_readiness_aggregates[2].submission_state='submitted';
base.public_readiness_aggregates[2].verification_state='locked';
base.public_readiness_aggregates[2].verified_at=iso;
base.public_readiness_aggregates[2].qualified_teams=0;
assert.equal(derive(base).kpis.qualifiedTeams,2,'more than one representative is counted');
assert.equal(selectRows(base,{cluster:'g1',activity:'all',stage:'district',status:'submitted'}).length,2);
assert.equal(selectRows(base,{cluster:'all',activity:'all',stage:'district',status:'needs_revision'}).length,0);
const subset=derive(base,{cluster:'g1',activity:'all',stage:'all',status:'all'});
assert.equal(subset.kpis.verifiedRecords,null,'filtered KPIs cannot claim full coverage');
assert.equal(subset.rows.length,2);
const partial=fixture();partial.coverage.obligations='partial';partial.coverage.catalog='partial';
assert.equal(derive(partial).kpis.requiredGroups,null);
assert.equal(derive(partial).kpis.confirmedActivities,null);
const zero=fixture();zero.public_readiness_aggregates=[];zero.public_issues=[];
assert.equal(derive(zero).kpis.requiredGroups,0,'confirmed empty + full coverage = real zero');
const html=read('index.html'),sw=read('sw.js');
for(const token of ['id="v-readiness"','id="ia3Root"','ia3-readiness.js','ia3.css',
  "SILLAPA_IA3.mount({rootId:'ia3Root',snapshot:null})"]){
  assert.ok(html.includes(token),'missing HTML integration: '+token);
}
for(const token of ['./ia3.css','./ia3-readiness.js','sillapa-public-v5-ia3']){
  assert.ok(sw.includes(token),'missing SW shell: '+token);
}
assert.ok(html.includes('data-go="groups"'),'historical navigation retained');
assert.equal(/fetch\(|https?:\/\/|localStorage|sessionStorage/i.test(read('ia3-readiness.js')),false,
  'No network calls, hardcoded external fetch, or private storage in IA-3 module');
console.log('IA-3 LOCAL: PASS — contract, policy, denominator, duplicate, filter, source and PWA shell');
