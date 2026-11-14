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

test('audited 66 current activity rows: 61 criteria links matched and 5 new rows pending verification',()=>{
  assert.equal(rows.length,66);
  const status=rows.map(r=>({...r,...data.lookup(r.id,r.name,r.level)}));
  assert.equal(status.filter(x=>x.status==='matched').length,61);
  assert.equal(status.filter(x=>x.status==='review').length,5);
  assert.deepEqual(status.filter(x=>x.status==='review').map(x=>x.id).sort((a,b)=>a-b),
    [70,71,72,73,74]);
  assert.equal(new Set(rows.map(r=>r.id)).size,rows.length);
});

test('PDF link lookup blocks wrong grade, renamed activity and unknown row',()=>{
  const r=rows.find(r=>r.id===1);
  assert.equal(data.lookup(r.id,r.name,r.level).document.key,'14');
  assert.equal(data.lookup(r.id,r.name,'ป.1–ป.3').status,'review');
  assert.equal(data.lookup(r.id,r.name+' (เปลี่ยนชื่อ)',r.level).status,'review');
  assert.equal(data.lookup(999,'กิจกรรมใหม่','ป.1–ป.3').status,'review');
  const math=rows.find(r=>r.id===20);
  assert.equal(data.lookup(math.id,math.name,math.level).status,'matched');
  const poetry=rows.find(r=>r.id===13);
  assert.equal(data.lookup(poetry.id,poetry.name,poetry.level).status,'matched'); // Six stanzas verified against Round-74 Thai criteria.
  const restored=rows.find(r=>r.id===67);
  assert.equal(data.lookup(restored.id,restored.name,restored.level).document.key,'13');
});

test('HTML loads source before rendering and keeps round-70 reference as secondary',()=>{
  const scriptTag=html.match(/<script src="\.\/round74-criteria-sources\.js(?:\?[^\"]+)?"><\/script>/)?.[0];
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
  const view=run([fakeRow(1,true),fakeRow(70,false),fakeRow(71,false)],
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

test('all live table slots render 61 verified PDF74 links and 5 review notices for new school activities',()=>{
  const begin=html.indexOf("rows.forEach(row=>{\nconst cells=");
  const end=html.indexOf("const school=document.getElementById('audit-school')",begin);
  assert.ok(begin>0&&end>begin,'source-to-slot integration code exists');
  const loop=html.slice(begin,end);
  function makeSlot(){
    return {dataset:{},children:[],append(...xs){this.children.push(...xs);}};
  }
  const slots=[];
  const domRows=rows.map(info=>{
    const slot=makeSlot();slots.push({info,slot});
    const cell1={querySelector(sel){
      if(sel==='strong')return {textContent:info.name};
      if(sel==='.criteria-slot')return slot;
      return null;
    }};
    return {querySelectorAll(){return [{textContent:String(info.id)},cell1,{}, {textContent:info.level}]}};
  });
  const window={SILLAPA74_CRITERIA_SOURCES:data,SILLAPA70_CATALOG:{source:'https://example.org/70',families:{}}};
  const document={createElement:element};
  new Function('rows','window','document',loop)(domRows,window,document);
  assert.equal(slots.filter(x=>x.slot.dataset.criteria74Status==='matched').length,61);
  assert.equal(slots.filter(x=>x.slot.dataset.criteria74Status==='review').length,5);
  const links=slots.flatMap(x=>x.slot.children.filter(n=>n.dataset?.criteria74Link==='true'));
  assert.equal(links.length,61);
  for(const a of links){
    assert.ok(Object.values(data.documents).some(d=>d.url===a.href),'PDF URL must be in reviewed Drive folder');
    assert.equal(a.target,'_blank');
    assert.equal(a.rel,'noopener noreferrer');
  }
});

test('criteria links are keyboard-visible and dark-mode readable',()=>{
  assert.match(css,/criteria74-primary-link:focus-visible/);
  assert.match(css,/prefers-color-scheme:dark/);
  assert.match(css,/criteria74-card-badge\[data-status="review"\]/);
  assert.match(css,/min-height:44px/);
  assert.match(css,/criteria74-library/);
});


test('Nongkum male music items share the approved Round-74 PDF without publishing student names',()=>{
  const maleFolk=rows.find(r=>r.id===52);
  const maleClassic=rows.find(r=>r.id===68);
  assert.ok(maleFolk && maleClassic);
  assert.equal(data.lookup(maleFolk.id,maleFolk.name,maleFolk.level).document.key,'12');
  assert.equal(data.lookup(maleClassic.id,maleClassic.name,maleClassic.level).document.key,'12');
  assert.equal(maleClassic.level,'ป.1–ป.6');
  const folkStart=html.indexOf('<tr><td data-label="ลำดับ">52</td>');
  const classicStart=html.indexOf('<tr><td data-label="ลำดับ">68</td>');
  assert.ok(folkStart>=0 && classicStart>=0);
  const folkRow=html.slice(folkStart,html.indexOf('</tr>',folkStart)+5);
  const classicRow=html.slice(classicStart,html.indexOf('</tr>',classicStart)+5);
  assert.equal((folkRow.match(/class="venue-school"/g)||[]).length,3);
  assert.equal((classicRow.match(/class="venue-school"/g)||[]).length,1);
  assert.ok(folkRow.includes('บ้านหนองกุ่ม') && classicRow.includes('บ้านหนองกุ่ม'));
  assert.ok(folkRow.includes('3 โรงเรียน') && classicRow.includes('1 โรงเรียน'));
  assert.equal(data.lookup(68,maleClassic.name,'ม.1–ม.3').status,'review');
});

test('Inclusive-art PDF and category are correct; withdrawn Sao Hong garden rows are absent',()=>{
  const ids=new Set(rows.map(r=>r.id));
  assert.equal(rows.length,66);
  assert.equal(ids.size,66);
  assert.equal(ids.has(58),false);
  assert.equal(ids.has(59),false);
  assert.equal(html.includes('การแข่งขันจัดสวนถาดแบบแห้ง'),false);
  assert.equal(html.includes('การแข่งขันจัดสวนถาดแบบชื้น'),false);
  const inclusive=rows.find(r=>r.id===60);
  assert.equal(inclusive.name,'การแข่งขันการวาดภาพระบายสี (โรงเรียนเรียนรวม)');
  assert.equal(inclusive.level,'ป.1–ป.6');
  assert.equal(data.lookup(60,inclusive.name,inclusive.level).document.key,'17');
  assert.equal(data.lookup(60,'วาดภาพระบายสี',inclusive.level).status,'review');
  assert.equal(data.lookup(58,'การแข่งขันจัดสวนถาดแบบแห้ง','ป.1–ป.6').status,'review');
  assert.ok(html.includes("venueCategoryLookup.set(venueNameKey('การแข่งขันการวาดภาพระบายสี (โรงเรียนเรียนรวม)')"));
  assert.ok(html.includes("group:'โรงเรียนเรียนรวม',name:'กลุ่มศิลปะ'"));
  const start=html.indexOf('<tr><td data-label="ลำดับ">60</td>');
  const row=html.slice(start,html.indexOf('</tr>',start)+5);
  assert.equal((row.match(/class="venue-school"/g)||[]).length,2);
  assert.ok(row.includes('บ้านหนองกุ่ม') && row.includes('บ้านหนองกระทุ่ม'));
  const music=rows.find(r=>r.id===68);
  assert.equal(data.lookup(68,music.name,music.level).document.key,'12');
});

test('NGK74 inclusive singing category preserves confirmed music and fixes the original special-education record',()=>{
  const getRow=id=>html.match(new RegExp('<tr><td data-label="ลำดับ">'+id+'<\\/td>[\\s\\S]*?<\\/tr>'))?.[0];
  const female=getRow(51),male=getRow(52),special=getRow(69),classic=getRow(68);
  assert.ok(female&&male&&special&&classic);
  assert.equal((female.match(/class="venue-school"/g)||[]).length,4);
  assert.ok(!female.includes('บ้านหนองกุ่ม'));
  assert.ok(male.includes('บ้านหนองกุ่ม')&&classic.includes('บ้านหนองกุ่ม'));
  assert.equal((special.match(/class="venue-school"/g)||[]).length,1);
  assert.ok(special.includes('บ้านหนองกุ่ม'));
  const item=rows.find(x=>x.id===69);
  assert.equal(item.level,'ป.1–ป.6');
  assert.equal(item.name,'การประกวดการขับร้องเพลงไทยลูกทุ่ง (โรงเรียนเรียนรวม) — บกพร่องทางการเรียนรู้');
  assert.equal(data.lookup(item.id,item.name,item.level).document.key,'17');
  assert.equal(data.lookup(item.id,item.name,'ป.4–ป.6').status,'review');
  assert.equal(data.lookup(51,rows.find(x=>x.id===51).name,'ป.1–ป.6').document.key,'12');
  assert.ok(html.includes("group:'โรงเรียนเรียนรวม',name:'กลุ่มดนตรี'"));
});

test('Cover Dance Contest P1-P3 is confirmed by the Round-74 learner-development PDF',()=>{
  const cover=rows.find(r=>r.id===75);
  assert.ok(cover);
  assert.equal(cover.name,'การเต้นประกอบเพลง Cover Dance Contest (ลูกเสือต้านภัยยาเสพติด)');
  assert.equal(cover.level,'ป.1–ป.3');
  const found=data.lookup(cover.id,cover.name,cover.level);
  assert.equal(found.status,'matched');
  assert.equal(found.document.key,'16');
  assert.equal(found.document.fileId,'12ZunpZ9xRJTHAOfbuPUYPYKt-tY0HeMM');
  assert.equal(data.lookup(75,cover.name,'ม.1–ม.3').status,'review');
  assert.match(html,/<td data-label="ลำดับ">75<\/td>[\s\S]*?ตรวจเทียบเกณฑ์ครั้งที่ 74 แล้ว/);
});
