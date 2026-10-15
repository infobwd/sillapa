/* IA-5 LOCAL_FIRST node tests: node tests/ia5-judge-venue.test.cjs */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const ia5=require('../ia5-judge-venue.js');
const {makeStore,historyGroups,select,summary,exportCSV,validatePublicSnapshot,RISKS,KEY}=ia5;
const fam=[
  {key:'draft-F01-A01',groupName:'ศิลปะ',draftTitle:'วาดภาพ',historyCycle:'73'},
  {key:'draft-F01-A02',groupName:'ศิลปะ',draftTitle:'=EXCEL',historyCycle:'70'},
  {key:'draft-F02-A01',groupName:'ดนตรี',draftTitle:'เดี่ยวดนตรี',historyCycle:'unresolved'}
];
const map=new Map();
const storage={getItem:k=>map.has(k)?map.get(k):null,setItem:(k,v)=>map.set(k,String(v))};
let store=makeStore(storage,fam);
assert.equal(store.info().lastSaved,true);
assert.equal(store.info().blocked,false);
assert.deepEqual(store.get(fam[0].key,'district'),{judges:null,rooms:null,capacity:null,flags:{}});
assert.equal(summary(fam,store,'district').judges,null,'unknown is never zero');
assert.equal(summary(fam,store,'district').rooms,null);
assert.equal(store.set('invalid','district',{judges:5}),false,'unknown draft family');
assert.equal(store.set(fam[0].key,'invalid',{judges:5}),false,'unsupported stage');
assert.equal(store.set(fam[0].key,'district',{judgeName:'Private Person'}),false,
  'personal fields cannot be persisted');
assert.equal(store.set(fam[0].key,'district',{judges:3,rooms:2,capacity:35}),true);
assert.deepEqual(store.get(fam[0].key,'district'),{judges:3,rooms:2,capacity:35,flags:{}});
assert.equal(store.set(fam[0].key,'district',{risk:'team_supervisor',checked:true}),true);
assert.equal(store.get(fam[0].key,'district').flags.team_supervisor,true);
assert.equal(store.set(fam[0].key,'district',{risk:'availability',checked:true}),true);
assert.equal(store.set(fam[0].key,'district',{risk:'not_valid',checked:true}),false);
assert.equal(store.set(fam[0].key,'district',{risk:'team_supervisor',checked:'yes'}),false);
assert.equal(store.set(fam[0].key,'district',{risk:'venue_capacity',checked:true}),true);
assert.equal(RISKS.length,5);
assert.equal(store.set(fam[0].key,'cluster',{judges:5,rooms:1,capacity:50}),true);
assert.equal(store.get(fam[0].key,'cluster').judges,5,'cluster plan separate from district');
assert.equal(store.get(fam[0].key,'district').judges,3);
assert.deepEqual(store.get(fam[0].key,'cluster').flags,{},'risk flags do not travel across scopes');
assert.equal(store.set(fam[1].key,'district',{judges:1,rooms:1}),true);
assert.equal(store.set(fam[2].key,'district',{judges:2,rooms:1}),true);
let s=summary(fam,store,'district');
assert.equal(s.activities,3);assert.equal(s.judgeKnown,3);assert.equal(s.roomKnown,3);
assert.equal(s.judges,6);assert.equal(s.rooms,4);assert.equal(s.risks,1);
assert.equal(summary(fam,store,'cluster').judges,null,'unknown cluster counts must stay unknown');
assert.equal(select(fam,store,'district',{risk:'attention'}).length,1);
assert.equal(select(fam,store,'cluster',{risk:'attention'}).length,0);
assert.equal(select(fam,store,'district',{risk:'pending'}).length,0);
assert.equal(select(fam,store,'cluster',{risk:'pending'}).length,2);
assert.equal(select(fam,store,'district',{group:'ศิลปะ'}).length,2);
assert.equal(select(fam,store,'district',{query:'เดี่ยว'}).length,1);
store=makeStore(storage,fam);
assert.equal(store.get(fam[0].key,'district').judges,3,'reload device plan');
assert.equal(store.get(fam[0].key,'cluster').capacity,50);
assert.equal(store.set(fam[0].key,'district',{judges:''}),true);
assert.equal(summary(fam,store,'district').judges,null,'cleared input is unknown, not zero');
assert.equal(store.set(fam[0].key,'district',{judges:0}),true);
assert.equal(store.get(fam[0].key,'district').judges,null,'zero is not invented capacity');
assert.equal(store.set(fam[0].key,'district',{judges:4}),true);
assert.equal(store.set(fam[0].key,'district',{risk:'team_supervisor',checked:false}),true);
assert.equal(store.get(fam[0].key,'district').flags.team_supervisor,undefined);
const csv=exportCSV(fam,store,'district');
assert.ok(csv.startsWith('\ufeff'));
assert.ok(csv.includes("'=EXCEL"),'CSV formula injection sanitized');
assert.ok(csv.includes('แผนในเครื่องนี้ ไม่ใช่แต่งตั้ง/จัดสนาม'));
assert.ok(csv.includes('ความจุคาดการณ์ต่อห้อง'));
assert.ok(!csv.includes('Private Person'),'private test input rejected');
assert.ok(!csv.includes('นายสมชาย'),'no synthetic judge roster emitted');
assert.equal(KEY,'sillapa74:judge-venue-planning:v1');

// 73 historical reports retain only aggregates and deduplicate person index within a group.
const archive={p:[['สมมติ A','โรงเรียน A'],['สมมติ B','โรงเรียน B'],['สมมติ C','โรงเรียน C']],
  a:{'วาดภาพ ป.1':[[0,0],[1,1]],'วาดภาพ ป.4':[[0,2]],'ดนตรี':[[0,0],[2,1]],'ไม่มีหมวด':[[1,0]],'invalid':[[99,0]]}};
const hist=historyGroups(archive,a=>a.startsWith('วาดภาพ')?'ศิลปะ':a==='ดนตรี'?'ดนตรี':'',
  {'วาดภาพ ป.1':[{school:'A'}],'ดนตรี':[{school:'B'},{school:'C'}]});
assert.deepEqual(hist.find(x=>x.group==='ศิลปะ'),{group:'ศิลปะ',events:2,judges:2,positions:3,schoolFlags:1});
assert.deepEqual(hist.find(x=>x.group==='ดนตรี'),{group:'ดนตรี',events:1,judges:2,positions:2,schoolFlags:2});
assert.equal(JSON.stringify(hist).includes('สมมติ A'),false,'person names excluded from output');
assert.equal(JSON.stringify(hist).includes('โรงเรียน A'),false,'person affiliation excluded');
assert.equal(hist.length,2);

// Explicit future publication gate: closed source schema, no identity/PII, verified denominator.
const published={
 schema:'sillapa-ia5-public-v1',cycle:74,publication_status:'approved',
 source_system:'AcademicCompetitionManager',source_as_of:'2026-10-14T11:00:00+07:00',
 published_at:'2026-10-15T11:00:00+07:00',
 coverage:{activities:'complete',judges:'complete',schedule:'complete',venues:'complete'},
 rows:[{activity_id:'official-74-001',stage:'district',required_judges:4,
  available_judges:2,confirmed_rooms:0,confirmed_slots:0,conflict_count:1}]
};
assert.equal(validatePublicSnapshot(published).ok,true);
assert.equal(validatePublicSnapshot({...published,rows:[{...published.rows[0],available_judges:5}]}).ok,true,
  'available staffing can legitimately exceed minimum required');
for(const edit of [
 {cycle:73},{publication_status:'draft'},{source_system:'Other'},
 {coverage:{...published.coverage,venues:'partial'}},{source_as_of:'2026-12-99'},
 {published_at:'2026-10-14T01:00:00+07:00'},
 {rows:[{...published.rows[0],judge_name:'Private Person'}]},
 {rows:[{...published.rows[0],available_judges:1.5}]},
 {rows:[published.rows[0],published.rows[0]]},
 {rows:[{...published.rows[0],conflict_count:-1}]}
])assert.equal(validatePublicSnapshot({...published,...edit}).ok,false,'reject unsafe/unapproved release');
assert.equal(validatePublicSnapshot({...published,rows:[]}).ok,true,
  'empty complete source is valid contract, but UI still requires separate publication gate');

// Corrupt or full browser storage: fail safely, never claim save success.
const damaged={getItem(){return '{"version":999}'},setItem(){throw Error('must not rewrite')}};
const bad=makeStore(damaged,fam);assert.equal(bad.info().blocked,true);
assert.equal(bad.set(fam[0].key,'district',{judges:2}),false);
const quota={getItem(){return null},setItem(){throw Error('quota')}};
const full=makeStore(quota,fam);
assert.equal(full.set(fam[0].key,'district',{rooms:4}),false);
assert.equal(full.info().lastSaved,false);

// Legacy UI remains; static hosting and offline shell are updated.
const html=read('index.html'),sw=read('sw.js'),js=read('ia5-judge-venue.js');
for(const token of ['id="v-venue"','id="ia5Root"','ia5.css','ia5-judge-venue.js',
 'SILLAPA_IA5.historyGroups(JG,AGRP,JCON)','SILLAPA_IA5.mount({rootId:',
 'id="v-judges"','id="ia4Summary"','id="ia3Root"','id="ia2Root"','data-go="judges"'])
 assert.ok(html.includes(token),'missing retained IA integration '+token);
assert.match(sw,/sillapa-public-v7-ia5-20261015/);
assert.ok(sw.includes('./ia5.css')&&sw.includes('./ia5-judge-venue.js'));
assert.equal(/fetch\(|XMLHttpRequest|navigator\.sendBeacon|db\.collection/i.test(js),false,
 'IA-5 must not fetch private core data');
assert.equal(/judgeName|telephone|id_card|citizen_id|emailAddress/i.test(js),false,
 'IA-5 public runtime should contain no personal identifier contract');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
scripts.forEach((script,i)=>new vm.Script(script,{filename:'index.inline.'+i+'.js'}));

// Mount and initial render with minimal DOM controls (without a browser).
const elements={};
for(const id of ['ia5Kpi','ia5Source','ia5Local','ia5Found','ia5Rows','ia5HistoricRows',
 'ia5More','ia5Stage','ia5Group','ia5Risk','ia5Query','ia5Reset','ia5Export']){
 elements['#'+id]={innerHTML:'',textContent:'',value:'',hidden:false,
  setAttribute(){},addEventListener(type,fn){this['on'+type]=fn}};
}
const fakeRoot={innerHTML:'',querySelector:q=>elements[q],addEventListener(){}};
const oldDoc=global.document;
global.document={getElementById:id=>id==='ia5Root'?fakeRoot:null};
try{
 const loaded=ia5.mount({rootId:'ia5Root',families:fam,historical:hist,storage});
 assert.equal(loaded.ok,true);
 assert.ok(elements['#ia5Rows'].innerHTML.includes('วาดภาพ'));
 assert.ok(elements['#ia5Rows'].innerHTML.includes('สมมติ A')===false);
 assert.ok(elements['#ia5Kpi'].innerHTML.includes('กรรมการแต่งตั้งจริง'));
 assert.ok(elements['#ia5HistoricRows'].innerHTML.includes('โรงเรียนร่วมแข่ง')===false);
 elements['#ia5Stage'].value='cluster';
 elements['#ia5Stage'].onchange({target:elements['#ia5Stage']});
 assert.equal(loaded.filters.stage,'cluster');
 elements['#ia5Group'].value='ดนตรี';
 elements['#ia5Group'].onchange({target:elements['#ia5Group']});
 assert.ok(elements['#ia5Rows'].innerHTML.includes('เดี่ยวดนตรี'));
 assert.ok(!elements['#ia5Rows'].innerHTML.includes('วาดภาพ'));
}finally{if(oldDoc===undefined)delete global.document;else global.document=oldDoc}
console.log('IA-5 LOCAL PASS: source gate, history, local stage isolation, capacity, risk, CSV, offline and mounted UI');
