'use strict';
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'nongkum.html'),'utf8');
const css=fs.readFileSync(path.join(root,'nongkum-home-desktop.css'),'utf8');

test('desktop home stylesheet is additive, and all four summary counts stay source-derived',()=>{
  assert.match(html,/href="\.\/nongkum-desktop\.css"><link rel="stylesheet" href="\.\/nongkum-home-desktop\.css"/);
  assert.match(html,/\['all',activityRecords\.length\]/);
  assert.match(html,/\['multi',multiRecords\.length\]/);
  assert.match(html,/\['single',singleRecords\.length\]/);
  assert.match(html,/\['schools',uniqueSchools\.length\]/);
  assert.equal((html.match(/aria-controls="insight-detail" data-insight=/g)||[]).length,4);
  assert.doesNotMatch(html,/ผู้สมัคร 1 โรงเรียน|รายการที่มีผู้สมัครหลายโรงเรียน/);
});
test('desktop-only home geometry and dark-mode insight styling',()=>{
  assert.match(css,/@media \(min-width:1200px\)/);
  assert.match(css,/grid-template-areas:/);
  assert.match(css,/"prompt schedule"/);
  assert.match(css,/"insights insights"/);
  assert.match(css,/max-height:none;overflow:visible/);
  assert.match(css,/prefers-color-scheme:dark/);
  assert.match(css,/#role-home \.insight-detail \{/);
  assert.match(css,/prefers-reduced-motion:reduce/);
});
test('existing data and role/filter/export paths remain',()=>{
  for(const id of ['choose-school','choose-venue','insight-all','insight-multi','insight-single','insight-schools','audit-school','venue-status-tabs','school-export-print','school-export-csv','venue-export-print']){
    assert.ok(html.includes('id="'+id+'"'),id);
  }
  assert.match(html,/ไม่ใช่ระบบสมัครแข่งขัน/);
  assert.match(html,/ข้อมูลระดับกลุ่มหนองกุ่ม อาจเปลี่ยนแปลงได้/);
});
const start=html.indexOf("const insightDetail=document.getElementById('insight-detail');");
const end=html.indexOf("const emptyPage=document.getElementById('empty-entries')",start);
assert.ok(start>0&&end>start,'insight logic segment exists');
const insightJS=html.slice(start,end);
function element(tag){
  const listeners={};
  const classes=new Set();
  return {
    tag,className:'',hidden:false,children:[],textContent:'',dataset:{},attributes:{},
    append(...items){this.children.push(...items)},
    replaceChildren(...items){this.children=[...items]},
    setAttribute(name,value){this.attributes[name]=value},
    addEventListener(name,callback){listeners[name]=callback},
    click(){listeners.click?.()},
    classList:{toggle(name,active){if(active)classes.add(name);else classes.delete(name)},remove(name){classes.delete(name)}}
  };
}
function setup(desktop){
  const breakpoint={matches:desktop,listeners:[],addEventListener(_,callback){this.listeners.push(callback)}};
  const cards=['all','multi','single','schools'].map(kind=>{
    const card=element('button');card.dataset.insight=kind;return card;
  });
  const detail=element('div');
  const document={
    getElementById:id=>id==='insight-detail'?detail:null,
    querySelectorAll:q=>q==='[data-insight]'?cards:[],
    createElement:element
  };
  const records=Array.from({length:61},(_,i)=>({
    name:'รายการ '+(i+1),level:'ป.1–3',schools:i<33?['โรงเรียน ก','โรงเรียน ข']:['โรงเรียน ก']
  }));
  const multi=records.filter(x=>x.schools.length>=2);
  const single=records.filter(x=>x.schools.length===1);
  const search={value:'old search'},venueSelect={value:'old category'};
  let visited=null;
  const run=new Function('document','window','activityRecords','multiRecords','singleRecords','uniqueSchools','school','search','venueSelect','choose',
    insightJS+'return {get status(){return selectedVenueStatus}};');
  const context=run(document,{matchMedia:()=>breakpoint},records,multi,single,
    ['โรงเรียน ก','โรงเรียน ข'],{options:[]},search,venueSelect,role=>{visited=role});
  const count=()=>detail.children.find(x=>x.className==='insight-records')?.children.length||0;
  const more=()=>detail.children.find(x=>x.className==='insight-view-all');
  return {cards,detail,breakpoint,count,more,search,venueSelect,context,get visited(){return visited}};
}
test('desktop initially collapsed; drill-down shows five then routes to matching venue filter',()=>{
  const ui=setup(true);
  assert.equal(ui.detail.hidden,true);
  assert.equal(ui.count(),0);
  ui.cards[1].click();
  assert.equal(ui.detail.hidden,false);
  assert.equal(ui.count(),5);
  assert.equal(ui.cards[1].attributes['aria-expanded'],'true');
  assert.equal(ui.more().textContent,'ดูทั้งหมด 33 รายการ');
  ui.more().click();
  assert.equal(ui.visited,'venue');
  assert.equal(ui.context.status,'multi');
  assert.equal(ui.venueSelect.value,'');
  assert.equal(ui.search.value,'');
  assert.equal(ui.detail.hidden,true);
  ui.cards[0].click();
  assert.equal(ui.count(),5);
  ui.cards[0].click();
  assert.equal(ui.detail.hidden,true);
});
test('mobile starts compact, offers three-record previews and see-all filter',()=>{
  const mobile=setup(false);
  assert.equal(mobile.detail.hidden,true);
  assert.equal(mobile.count(),0);
  mobile.cards[1].click();
  assert.equal(mobile.count(),3);
  assert.equal(mobile.more().textContent,'ดูทั้งหมด 33 รายการ');
  mobile.cards[2].click();
  assert.equal(mobile.count(),3);
  assert.equal(mobile.more().textContent,'ดูทั้งหมด 28 รายการ');
  mobile.more().click();
  assert.equal(mobile.visited,'venue');
  assert.equal(mobile.context.status,'single');
  const desktop=setup(true);
  desktop.breakpoint.matches=false;
  desktop.breakpoint.listeners.forEach(fn=>fn());
  assert.equal(desktop.detail.hidden,true);
  assert.equal(desktop.count(),0);
  desktop.cards[1].click();
  assert.equal(desktop.count(),3);
});
