'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'nongkum.html'), 'utf8');
const loader = fs.readFileSync(path.join(root, 'nongkum-mobile-ux.js'), 'utf8');
const shareJS = fs.readFileSync(path.join(root, 'nongkum-school-share.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'nongkum-school-share.css'), 'utf8');
const registrySrc = fs.readFileSync(path.join(root, 'nongkum-schools.js'), 'utf8');

function element(tag) {
  const events = {};
  return {
    tag,children:[],attributes:{},dataset:{},style:{},hidden:false,value:'',
    textContent:'',href:'',className:'',
    append(...parts){this.children.push(...parts);},
    setAttribute(key,value){this.attributes[key]=value;},
    addEventListener(key,callback){events[key]=callback;},
    dispatchEvent(event){return events[event.type]?.(event);},
    click(){return events.click?.();},
    select(){this.selected=true;},
    remove(){this.removed=true;},
    _events:events
  };
}
function setup(requested) {
  const registryWindow = {};
  vm.runInNewContext(registrySrc, {window:registryWindow});
  const registry = registryWindow.NONGKUM_SCHOOLS;
  const school = element('select');
  school.options = [{value:''}, ...registry.schools.map(s=>({value:s.name}))];
  const search = element('input');
  search.value = 'old term';
  const open = element('button');
  let openClicks = 0;
  open.addEventListener('click',()=>{openClicks++;});
  const more = element('details');
  const panel = element('div');
  panel.querySelector=selector=>selector==='.school-export-more'?more:null;
  panel.insertBefore=child=>{panel.inserted=child;};
  const rows = [
    ['71020019','71020025'],['71020019'],['71020025'],
    ['71020022','71020021'],['71020023']
  ].map(ids=>({
    querySelectorAll(selector){
      if(selector!=='td:nth-child(6) .venue-school')return [];
      return ids.map(id=>({dataset:{schoolId:id},textContent:registry.displayName(id)}));
    }
  }));
  const objects={'audit-school':school,'audit-search':search,'choose-school':open,'school-export':panel};
  const body=element('body');
  const doc={
    body,
    getElementById:id=>objects[id]||null,
    querySelectorAll:selector=>selector==='#complete-field-plan .venue-table tbody tr'?rows:[],
    createElement:element,
    execCommand:()=>true
  };
  let copied=null;
  const listeners={};
  const query=requested?'?school='+encodeURIComponent(requested):'';
  const win={
    document:doc,NONGKUM_SCHOOLS:registry,
    location:{search:query,href:'https://infobwd.github.io/sillapa/nongkum.html'+query+'#list'},
    Event:class{constructor(type,opts){this.type=type;this.bubbles=opts?.bubbles;}},
    navigator:{clipboard:{async writeText(text){copied=text;}}},
    addEventListener(name,handler){listeners[name]=handler;}
  };
  vm.runInNewContext(shareJS,{window:win,URL,URLSearchParams,encodeURIComponent});
  const wrap=panel.inserted,actions=wrap.children[0];
  return {
    win,doc,registry,school,search,wrap,
    line:actions.children[0],copy:actions.children[1],status:wrap.children[1],
    get openClicks(){return openClicks;},get copied(){return copied;},listeners
  };
}

test('mount uses existing school list; no changes to original school activity table or source',()=>{
  for (const marker of ['id="audit-school"','id="school-export"','id="school-export-csv"','id="school-export-print"'])assert.ok(html.includes(marker));
  assert.match(loader,/nongkum-school-share\.js/);
  assert.match(loader,/nongkum-school-share\.css/);
  assert.match(shareJS,/new URL\('nongkum.html', root\.location\.href\)/);
  assert.match(shareJS,/new URLSearchParams\(root\.location\.search\)/);
  assert.doesNotMatch(shareJS,/localStorage|fetch\(|\.submit\(|password|secret/i);
  assert.match(css,/min-height:48px/);
  assert.match(css,/focus-visible/);
  assert.match(css,/prefers-color-scheme:dark/);
});

test('all eight registry schools create their own share links without hardcoded totals',()=>{
  const h=setup('');
  for(const s of h.registry.schools){
    h.school.value=s.name;h.school.dispatchEvent({type:'change'});
    assert.equal(h.wrap.hidden,false);
    const line=new URL(h.line.href);
    assert.equal(line.hostname,'line.me');
    assert.equal(line.pathname,'/R/share');
    const message=line.searchParams.get('text');
    assert.ok(message.includes('โรงเรียน'+s.name));
    assert.ok(message.includes('school='+s.school_id+'#list'));
    assert.ok(message.includes('ไม่ใช่หลักฐานการสมัคร'));
  }
  h.school.value='';h.school.dispatchEvent({type:'change'});
  assert.equal(h.wrap.hidden,true);
});

test('deep link opens selected school with cleared search and correct count',()=>{
  const h=setup('71020019');
  assert.equal(h.school.value,'บ้านวังด้ง');
  assert.equal(h.search.value,'');
  assert.equal(h.openClicks,1);
  assert.equal(h.wrap.hidden,false);
  assert.ok(decodeURIComponent(h.line.href).includes('ข้อมูลที่รวบรวมในระบบ 2 รายการ'));
});
test('unknown and malformed school params do not change selected school',()=>{
  for(const id of ['00000000','71020019extra','บ้านวังด้ง']) {
    const h=setup(id);
    assert.equal(h.school.value,'');
    assert.equal(h.openClicks,0);
    assert.equal(h.wrap.hidden,true);
  }
});

test('copy control copies the selected school URL and changes with school selector',async()=>{
  const h=setup('');
  h.school.value='บ้านรางขาม';h.school.dispatchEvent({type:'change'});
  await h.copy.click();
  assert.equal(h.copied,'https://infobwd.github.io/sillapa/nongkum.html?school=71020025#list');
  assert.match(h.status.textContent,/คัดลอกลิงก์แล้ว/);
  h.school.value='บ้านวังด้ง';h.school.dispatchEvent({type:'change'});
  assert.ok(new URL(h.line.href).searchParams.get('text').includes('school=71020019#list'));
});

test('copy control falls back if Clipboard API is unavailable',async()=>{
  const h=setup('71020019');
  h.win.navigator.clipboard=null;
  await h.copy.click();
  assert.match(h.status.textContent,/คัดลอกลิงก์แล้ว/);
  assert.ok(h.doc.body.children[0].selected);
  assert.ok(h.doc.body.children[0].removed);
});
