'use strict';
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'nongkum.html'),'utf8');
const css=fs.readFileSync(path.join(root,'nongkum-criteria74.css'),'utf8');
const src=fs.readFileSync(path.join(root,'round74-criteria-sources.js'),'utf8');
const ctx={};
new Function('window',src)(ctx);
const data=ctx.SILLAPA74_CRITERIA_SOURCES;

const rows=[...html.matchAll(/<tr><td data-label="ลำดับ">(\d+)<\/td><td data-label="รายการแข่งขัน"><strong>([^<]+)<\/strong>[\s\S]*?<td data-label="ระดับชั้น">([^<]+)<\/td>/g)]
 .map(m=>({id:Number(m[1]),name:m[2].trim(),level:m[3].trim()}));

test('source module preserves 17 direct Round-74 PDFs and confirmed folder/catalog links',()=>{
  assert.equal(Object.keys(data.documents).length,17);
  assert.equal(data.folderUrl,'https://drive.google.com/drive/folders/1x3oxZyV817SbGyFmX8L7tZQEwJ75gzMH');
  assert.equal(data.catalogUrl,'https://drive.google.com/file/d/1ZX58b67IeQjNziOr-NtKgRrMd7xhOWUQ/view?usp=drivesdk');
  for(const doc of Object.values(data.documents)){
    assert.match(doc.url,/^https:\/\/drive\.google\.com\/file\/d\/[A-Za-z0-9_-]+\/view\?usp=drivesdk$/);
    assert.ok(doc.title && doc.fileId);
  }
  assert.equal(data.documents['14'].fileId,'1lq0IVZJWquD-brsu-u3DIjpfenvJkmug');
  assert.equal(data.documents['2'].fileId,'1cU_xpBxCKEVThbkSNC5GNSEgy7nsu-Kw');
  assert.equal(data.documents['16'].fileId,'12ZunpZ9xRJTHAOfbuPUYPYKt-tY0HeMM');
});

test('audited 63 current activity rows: 57 matched and 6 held for review',()=>{
  assert.equal(rows.length,63);
  const status=rows.map(r=>({...r,...data.lookup(r.id,r.name,r.level)}));
  assert.equal(status.filter(x=>x.status==='matched').length,57);
  assert.equal(status.filter(x=>x.status==='review').length,6);
  assert.deepEqual(status.filter(x=>x.status==='review').map(x=>x.id).sort((a,b)=>a-b),
    [13,20,21,58,59,60]);
  assert.equal(new Set(rows.map(r=>r.id)).size,rows.length);
});

test('PDF link lookup blocks wrong grade, renamed activity and unknown row',()=>{
  const r=rows.find(r=>r.id===1);
  assert.equal(data.lookup(r.id,r.name,r.level).document.key,'14');
  assert.equal(data.lookup(r.id,r.name,'ป.1–ป.3').status,'review');
  assert.equal(data.lookup(r.id,r.name+' (เปลี่ยนชื่อ)',r.level).status,'review');
  assert.equal(data.lookup(999,'กิจกรรมใหม่','ป.1–ป.3').status,'review');
  const math=rows.find(r=>r.id===20);
  assert.equal(data.lookup(math.id,math.name,math.level).status,'review');
  const poetry=rows.find(r=>r.id===13);
  assert.match(data.lookup(poetry.id,poetry.name,poetry.level).reason,/6 บท/);
  const gardening=rows.find(r=>r.id===58);
  assert.equal(data.lookup(gardening.id,gardening.name,gardening.level).candidate,null);
  const restored=rows.find(r=>r.id===67);
  assert.equal(data.lookup(restored.id,restored.name,restored.level).document.key,'13');
});

test('HTML loads source before rendering and keeps round-70 reference as secondary',()=>{
  const scriptTag='<script src="./round74-criteria-sources.js"></script>';
  assert.ok(html.indexOf(scriptTag)>0);
  assert.ok(html.indexOf(scriptTag)<html.indexOf("rows.forEach(row=>{"));
  assert.match(html,/href="\.\/nongkum-criteria74\.css"/);
  assert.match(html,/slot\.dataset\.criteria74Status=source74\.status/);
  assert.match(html,/link\.dataset\.criteria74Link='true'/);
  assert.match(html,/link\.dataset\.criteria70Link='true'/);
  assert.match(html,/source74\.document\.url/);
  assert.match(html,/class="criteria74-source-panel"/);
  assert.match(html,/id="nongkum-criteria-library-list"/);
  assert.match(html,/id="nongkum-criteria-status"/);
  assert.match(html,/ไม่ใช่เกณฑ์รับรองครั้งที่ 74/);
});

function element(tag){
  return {tag,className:'',dataset:{},textContent:'',children:[],append(...xs){this.children.push(...xs)},
    replaceChildren(...xs){this.children=[...xs]}};
}
function fakeRow(id,history){
  const r=rows.find(r=>r.id===id);
  return {
    querySelectorAll(){return [{textContent:String(id)},
      {querySelector(){return {textContent:r.name}}}, {},{textContent:r.level}]},
    querySelector(selector){
      if(selector!=='.criteria-slot')return null;
      return {querySelector(q){return q==='[data-criteria70-link]'&&history?{href:'https://example.org/70'}:null}};
    }
  };
}
test('criteria UI filters 74 matches and review cases with correct links',()=>{
  const begin=html.indexOf(" const libraryList=document.getElementById('nongkum-criteria-library-list');");
  const end=html.indexOf('\n function show(which,updateHash=true)',begin);
  assert.ok(begin>0&&end>begin);
  const snippet=html.slice(begin,end);
  const input={value:''},status={value:'all'},results=element('div'),count=element('p');
  const list=element('ul');
  const document={createElement:element,getElementById:()=>list};
  const run=new Function('rows','input','status','results','count','document','window',
    snippet+'return {entries,render};');
  const view=run([fakeRow(1,true),fakeRow(13,false),fakeRow(20,false)],
    input,status,results,count,document,ctx);
  assert.equal(list.children.length,17);
  assert.equal(view.entries.length,3);
  view.render();
  assert.equal(results.children.length,3);
  assert.match(count.textContent,/จับคู่ PDF เกณฑ์ครั้งที่ 74 ได้ 1 แถว/);
  status.value='official';view.render();
  assert.equal(results.children.length,1);
  assert.equal(results.children[0].children[0].textContent,'การปั้นดินน้ำมัน');
  const direct=results.children[0].children.find(e=>e.tag==='a');
  assert.equal(direct.href,data.documents['14'].url);
  status.value='review';view.render();
  assert.equal(results.children.length,2);
  status.value='historical';view.render();
  assert.equal(results.children.length,1);
  input.value='ไม่มีอยู่จริง';view.render();
  assert.match(results.children[0].textContent,/ไม่พบรายการตามชื่อ/);
});

test('criteria links are keyboard-visible and dark-mode readable',()=>{
  assert.match(css,/criteria74-primary-link:focus-visible/);
  assert.match(css,/prefers-color-scheme:dark/);
  assert.match(css,/criteria74-card-badge\[data-status="review"\]/);
  assert.match(css,/min-height:44px/);
  assert.match(css,/criteria74-library/);
});
