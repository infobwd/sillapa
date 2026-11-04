'use strict';
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'nongkum.html'),'utf8');
const css=fs.readFileSync(path.join(root,'nongkum-mobile-ux-04.css'),'utf8');
const topJS=fs.readFileSync(path.join(root,'nongkum-mobile-ux.js'),'utf8');

test('mobile layout uses new reference filter, disclosure and unobtrusive top button',()=>{
  for(const value of ['id="nongkum-criteria-status"','class="ngk-school-instructions"','class="ngk-table-guide"','href="./nongkum-mobile-ux-04.css"']){
    assert.ok(html.includes(value),value);
  }
  assert.match(css,/\.ngk-back-to-top\s*\{[\s\S]*?min-width:52px/);
  assert.match(css,/#nongkum-criteria-status/);
  assert.match(css,/\.insight-records\s*\{[\s\S]*?max-height:none/);
  assert.match(topJS,/function overlapsPrimaryAction\(/);
  assert.match(topJS,/overlapsPrimaryAction\(\)/);
  assert.match(html,/ไม่ใช่เกณฑ์รับรองครั้งที่ 74/);
});

test('home KPI preview is three on phone and five on desktop, initially collapsed',()=>{
  assert.match(html,/const preview=homeDesktopQuery\.matches\?ordered\.slice\(0,5\):ordered\.slice\(0,3\)/);
  assert.match(html,/if\(selected\.length>preview\.length\)/);
  assert.match(html,/collapseInsight\(\);\s*const syncHomeInsights=\(\)=>collapseInsight\(\);/);
  assert.doesNotMatch(html,/addRecord\(x\.name,detail\+\(/);
  assert.match(html,/if\(activeInsightKind===kind\)collapseInsight\(\)/);
});

test('criteria filters now prioritize verified Round-74 PDFs and retain Round-70 history',()=>{
  assert.match(html,/id="nongkum-criteria-status"/);
  assert.match(html,/<option value="official">มี PDF เกณฑ์ครั้งที่ 74/);
  assert.match(html,/<option value="review">ต้องตรวจสอบชื่อหรือระดับชั้น/);
  assert.match(html,/<option value="historical">มีทะเบียนย้อนหลังครั้งที่ 70/);
  assert.match(html,/criteria74-card-badge/);
  assert.match(html,/data-criteria70-link/);
  assert.match(html,/ไม่ใช่เกณฑ์รับรองครั้งที่ 74/);
});
function topHarness(){
  const listeners={},docListeners={},mediaListeners={};
  const floating={hidden:true,addEventListener(name,fn){if(name==='click')this.click=fn;}};
  const nav={getBoundingClientRect(){return {height:80}}};
  const match={matches:true,addEventListener(name,fn){mediaListeners[name]=fn;}};
  const reduced={matches:false};
  const action={rect:{left:120,right:380,top:673,bottom:727,width:260,height:54},
    getBoundingClientRect(){return this.rect}};
  const document={
    scrollingElement:{scrollTop:0},activeElement:null,documentElement:{style:{setProperty(){}}},
    getElementById(){return floating},
    querySelector(selector){if(selector==='.mobile-bottom-nav')return nav;return null;},
    querySelectorAll(){return [action]},
    addEventListener(name,fn){docListeners[name]=fn}
  };
  const win={scrollY:750,innerWidth:390,innerHeight:820,
    matchMedia:q=>q==='(max-width:1199px)'?match:reduced,
    requestAnimationFrame(fn){this.raf=fn;},addEventListener(name,fn){listeners[name]=fn}};
  new Function('window','document',topJS)(win,document);
  const flush=()=>{const fn=win.raf;win.raf=null;fn?.()};
  flush();
  return {floating,action,flush,win,listeners,match,mediaListeners};
}
test('top button hides if a content action intersects its viewport area',()=>{
  const h=topHarness();
  assert.equal(h.floating.hidden,true,'must not cover bottom-right CTA');
  h.action.rect={left:120,right:380,top:200,bottom:245,width:260,height:45};
  h.listeners.scroll();
  h.flush();
  assert.equal(h.floating.hidden,false,'reappear once CTA is clear');
  h.match.matches=false;
  h.mediaListeners.change();
  h.flush();
  assert.equal(h.floating.hidden,true,'must not appear on desktop');
});

test('the existing app controls and historical source remain intact',()=>{
  for(const id of ['id="nav-home"','id="nav-list"','id="nav-criteria"','id="nav-info"','id="school-export-csv"','id="school-export-print"','id="venue-export-print"']){
    assert.ok(html.includes(id),id);
  }
  assert.match(html,/window\.SILLAPA70_CATALOG/);
  assert.match(html,/\['all',activityRecords\.length\]/);
  assert.match(html,/\['schools',uniqueSchools\.length\]/);
  assert.doesNotMatch(html,/รายชื่อครูผู้ควบคุมทีมและนักเรียน\s*:\s*\[/);
});
