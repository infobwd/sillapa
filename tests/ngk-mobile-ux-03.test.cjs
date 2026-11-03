'use strict';
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'nongkum.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'nongkum-mobile-ux.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'nongkum-mobile-ux.js'), 'utf8');

test('new controls are present without replacing the existing navigation and exports', () => {
  assert.match(html, /href="\.\/nongkum-mobile-ux\.css"/);
  assert.match(html, /id="ngk-back-to-top"[^>]*aria-label="เลื่อนกลับขึ้นด้านบนของหน้า" hidden/);
  assert.match(html, /<script src="\.\/nongkum-mobile-ux\.js"><\/script>/);
  for (const marker of ['id="nav-home"', 'id="nav-list"', 'id="nav-criteria"', 'id="nav-info"',
    'id="choose-school"', 'id="choose-venue"', 'id="school-export-print"', 'id="school-export-csv"']) {
    assert.ok(html.includes(marker), 'Preserve ' + marker);
  }
});

test('text growth and contrast fix are scoped to mobile; desktop remains separate', () => {
  assert.match(css, /@media \(max-width:767px\)/);
  assert.match(css, /#role-home \.nongkum-home-lead/);
  assert.match(css, /color:#49647e/);
  assert.match(css, /#role-home > \.role-choices \.role-choice small/);
  assert.match(css, /font-size:clamp\(14px,3\.9vw,15\.5px\)/);
  assert.match(css, /body header p \{ font-size:15px/);
  assert.match(css, /@media \(max-width:767px\) and \(prefers-color-scheme:dark\)/);
  assert.match(css, /@media \(min-width:1200px\)/);
  assert.match(css, /\.ngk-back-to-top \{ display:none!important; \}/);
});

test('button respects bottom navigation safe area, accessibility and reduced motion', () => {
  assert.match(css, /bottom:calc\(var\(--ngk-bottom-nav-height, 78px\) \+ 14px\)/);
  assert.match(css, /env\(safe-area-inset-right/);
  assert.match(css, /min-height:48px/);
  assert.match(css, /\.ngk-back-to-top:focus-visible/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(js, /ResizeObserver/);
  assert.match(js, /window\.scrollTo\(\{ top: 0, behavior:/);
  assert.match(js, /heading\.focus\(\{ preventScroll:true \}\)/);
});

function harness() {
  const windowListeners = {}, documentListeners = {}, mediaListeners = {}, variables = {};
  const button = {hidden:true, click:null, addEventListener(name, callback) {if(name === 'click') this.click = callback;}};
  const heading = {tabIndex:0, focusOptions:null, focus(options) {this.focusOptions=options;}};
  const nav = {height:86, getBoundingClientRect(){return {height:this.height};}};
  const mobile={matches:true, addEventListener(name,callback){mediaListeners[name]=callback;}};
  const reducedMotion={matches:false};
  let modalOpen=false;
  const doc={
    scrollingElement:{scrollTop:0}, activeElement:null,
    documentElement:{style:{setProperty(name,value){variables[name]=value;}}},
    getElementById(id){return id==='ngk-back-to-top'?button:null;},
    querySelector(query){
      if(query === '.mobile-bottom-nav') return nav;
      if(query === 'header h1') return heading;
      if(query.includes('dialog')) return modalOpen?{}:null;
      return null;
    },
    addEventListener(name,callback){documentListeners[name]=callback;}
  };
  const viewport={height:820,addEventListener(){}};
  const win={
    innerHeight:820,scrollY:0,visualViewport:viewport,
    matchMedia(query){return query === '(max-width:1199px)' ? mobile : reducedMotion;},
    scrollTo(options){this.scrolledTo=options;},
    requestAnimationFrame(callback){this.frame=callback;return 1;},
    addEventListener(name,callback){windowListeners[name]=callback;}
  };
  new Function('window','document', js)(win,doc);
  const flush=()=>{if(win.frame){const frame=win.frame;win.frame=null;frame();}};
  const trigger=name=>{windowListeners[name]?.();flush();};
  flush();
  return {button,heading,nav,mobile,reducedMotion,variables,win,doc,viewport,flush,trigger,documentListeners,mediaListeners,
    openModal(value){modalOpen=value;}};
}

test('button is hidden initially; shows after scrolling and measures the real nav',()=>{
  const h=harness();
  assert.equal(h.button.hidden,true);
  assert.equal(h.variables['--ngk-bottom-nav-height'],'86px');
  h.win.scrollY=620;
  h.trigger('scroll');
  assert.equal(h.button.hidden,false);
  h.nav.height=92;
  h.trigger('resize');
  assert.equal(h.variables['--ngk-bottom-nav-height'],'92px');
  h.win.scrollY=0;
  h.trigger('scroll');
  assert.equal(h.button.hidden,true);
});

test('button hides for keyboard entry, dialogs and viewport keyboard overlay',()=>{
  const h=harness();
  h.win.scrollY=700;
  h.trigger('scroll');
  assert.equal(h.button.hidden,false);
  h.doc.activeElement={matches:()=>true};
  h.documentListeners.focusin();
  h.flush();
  assert.equal(h.button.hidden,true);
  h.doc.activeElement=null;
  h.documentListeners.focusout();
  h.flush();
  assert.equal(h.button.hidden,false);
  h.openModal(true);
  h.trigger('scroll');
  assert.equal(h.button.hidden,true);
  h.openModal(false);
  h.viewport.height=500;
  h.trigger('scroll');
  assert.equal(h.button.hidden,true);
});

test('click scrolls to top without changing filters, and observes reduced motion',()=>{
  const h=harness();
  h.win.scrollY=700;h.trigger('scroll');
  h.button.click();
  assert.equal(h.win.scrolledTo.top,0);
  assert.equal(h.win.scrolledTo.behavior,'smooth');
  assert.equal(h.heading.tabIndex,-1);
  assert.equal(h.heading.focusOptions.preventScroll,true);
  h.reducedMotion.matches=true;
  h.button.click();
  assert.equal(h.win.scrolledTo.behavior,'instant');
});

test('desktop media query hides the mobile-only control',()=>{
  const h=harness();
  h.win.scrollY=700;h.trigger('scroll');
  assert.equal(h.button.hidden,false);
  h.mobile.matches=false;
  h.mediaListeners.change();
  h.flush();
  assert.equal(h.button.hidden,true);
});
