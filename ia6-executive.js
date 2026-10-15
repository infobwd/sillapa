/* IA-6 public-safe executive decision dashboard. No live data, hidden API, or publish controls. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SILLAPA_IA6=api;})(typeof window!=='undefined'?window:null,function(){
'use strict';
const UNKNOWN='—',STAGES=['district','cluster'],COV=['activities','obligations','teams','judges','venues','issues'];
const METRICS=[
{id:'activities',label:'รายการที่ยืนยันให้แข่งขัน',field:'activities_confirmed',cover:'activities'},
{id:'representatives',label:'ภาระส่งตัวแทนที่ตรวจรับแล้ว',field:'obligations_verified',denom:'obligations_required',cover:'obligations'},
{id:'teams',label:'ทีมที่มีข้อมูลรับรอง',field:'teams_verified',cover:'teams'},
{id:'judges',label:'กรรมการที่ยืนยันพร้อม',field:'judges_available',denom:'judges_required',cover:'judges'},
{id:'venues',label:'ห้อง/สนามที่ยืนยันจัดสรร',field:'venues_confirmed',denom:'venues_required',cover:'venues'},
{id:'issues',label:'ประเด็นที่ยังต้องจัดการ',field:'issues_open',cover:'issues'}];
const ROOT=['schema','cycle_id','publication_id','publication_state','data_version','source_system','source_reference','source_as_of','published_at','stage_summaries'];
const FIELDS=['stage_scope','coverage','activities_confirmed','obligations_required','obligations_submitted','obligations_verified','teams_verified','judges_required','judges_available','venues_required','venues_confirmed','issues_open'];
const TOMBSTONE=['schema','cycle_id','publication_id','data_version','state','revoked_at','superseded_by','source_system','source_reference'];
const obj=x=>x&&typeof x==='object'&&!Array.isArray(x);
const exact=(x,keys)=>obj(x)&&Object.keys(x).length===keys.length&&keys.every(k=>Object.prototype.hasOwnProperty.call(x,k));
const text=x=>typeof x==='string'&&x.trim().length>0&&x.length<=256;
const clock=x=>typeof x==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/.test(x)&&!Number.isNaN(Date.parse(x));
const natural=x=>Number.isSafeInteger(x)&&x>=0;
const h=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const csv=x=>{let s=String(x??'');if(/^\s*[=+\-@]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
const format=x=>x===null||x===undefined?UNKNOWN:String(x);
const groups={
activities:['activities_confirmed'],
obligations:['obligations_required','obligations_submitted','obligations_verified'],
teams:['teams_verified'],judges:['judges_required','judges_available'],
venues:['venues_required','venues_confirmed'],issues:['issues_open']};
function validateRelease(doc){
 const fail=reason=>({ok:false,reason});
 if(!exact(doc,ROOT))return fail('invalid/extra publication fields');
 if(doc.schema!=='sillapa-ia6-public-v1'||doc.cycle_id!=='74'||
 doc.publication_state!=='published'||doc.source_system!=='AcademicCompetitionManager'||
 !text(doc.publication_id)||!text(doc.data_version)||!text(doc.source_reference)||
 !clock(doc.source_as_of)||!clock(doc.published_at))return fail('source or authorization unconfirmed');
 if(Date.parse(doc.published_at)<Date.parse(doc.source_as_of))return fail('publication chronology');
 if(!Array.isArray(doc.stage_summaries)||doc.stage_summaries.length<1||doc.stage_summaries.length>2)return fail('missing scope');
 const seen=new Set();
 for(const row of doc.stage_summaries){
  if(!exact(row,FIELDS)||!STAGES.includes(row.stage_scope)||seen.has(row.stage_scope))return fail('invalid or duplicate stage');
  seen.add(row.stage_scope);
  if(!exact(row.coverage,COV)||COV.some(k=>!['complete','partial','missing'].includes(row.coverage[k])))return fail('invalid coverage');
  if(FIELDS.filter(k=>k!=='stage_scope'&&k!=='coverage').some(k=>row[k]!==null&&!natural(row[k])))return fail('invalid count');
  for(const [c,fields] of Object.entries(groups)){
   if(row.coverage[c]==='complete'&&fields.some(f=>!natural(row[f])))return fail('incomplete denominator');
   if(row.coverage[c]!=='complete'&&fields.some(f=>row[f]!==null))return fail('partial figures presented as complete');
  }
  if(row.stage_scope==='cluster'&&row.coverage.obligations!=='missing')return fail('representative obligations apply only to district');
  if(row.coverage.obligations==='complete'&&
    (row.obligations_verified>row.obligations_submitted||row.obligations_submitted>row.obligations_required))
    return fail('obligations exceed scope');
  if(row.coverage.venues==='complete'&&row.venues_confirmed>row.venues_required)return fail('confirmed venue > required');
 }
 return {ok:true,publication_id:doc.publication_id,data_version:doc.data_version};
}
function validateTombstone(doc){
 if(!exact(doc,TOMBSTONE)||doc.schema!=='sillapa-ia6-revocation-v1'||doc.cycle_id!=='74'||
 !text(doc.publication_id)||!text(doc.data_version)||doc.state!=='revoked'||
 !clock(doc.revoked_at)||!text(doc.source_reference)||doc.source_system!=='AcademicCompetitionManager'||
 !(doc.superseded_by===null||text(doc.superseded_by)))return {ok:false,reason:'invalid revocation notice'};
 return {ok:true};
}
function resolve({release=null,revocation=null,offline=false,now=Date.now()}={}){
 if(!release)return {ok:false,state:'disconnected',release:null,offline,reason:'ยังไม่มีข้อมูลจริงที่อนุมัติเผยแพร่'};
 const checked=validateRelease(release);
 if(!checked.ok)return {ok:false,state:'invalid',release:null,offline,reason:checked.reason};
 if(revocation){
  const rev=validateTombstone(revocation);
  if(!rev.ok)return {ok:false,state:'hold',release:null,offline,reason:'การเพิกถอนยังตรวจสอบไม่ได้'};
  if(revocation.publication_id===release.publication_id&&revocation.data_version===release.data_version&&
   Date.parse(revocation.revoked_at)>=Date.parse(release.published_at))
   return {ok:false,state:'revoked',release:null,offline,reason:'ชุดข้อมูลเผยแพร่ถูกเพิกถอน'};
 }
 const age=Math.max(0,now-Date.parse(release.source_as_of));
 return {ok:true,state:offline?'cached_unverified':age>7*86400000?'stale':'published_snapshot',
  release,offline,ageDays:Math.floor(age/86400000)};
}
function scorecard(state,stage){
 const row=state.ok&&STAGES.includes(stage)?state.release.stage_summaries.find(x=>x.stage_scope===stage):null;
 return METRICS.map(m=>{
  const trusted=!!row&&row.coverage[m.cover]==='complete';
  return {id:m.id,label:m.label,value:trusted?row[m.field]:null,
   denom:trusted&&m.denom?row[m.denom]:null,
   coverage:row?row.coverage[m.cover]:'missing',
   source:trusted?state.release.source_reference:null,
   version:trusted?state.release.data_version:null,
   sourceAsOf:trusted?state.release.source_as_of:null};
 });
}
function draftAudit(families){
 const list=Array.isArray(families)?families:[];
 return {families:list.length,unique:new Set(list.map(x=>x.key)).size,
  from70:list.filter(x=>x.historyCycle==='70').length,from73:list.filter(x=>x.historyCycle==='73').length,
  unresolved:list.filter(x=>x.historyCycle==='unresolved').length,
  child70:list.filter(x=>x.historyCycle==='70').reduce((n,x)=>n+(x.events||[]).length,0),
  child73:list.filter(x=>x.historyCycle==='73').reduce((n,x)=>n+(x.events||[]).length,0)};
}
function quality(state,families,stage){
 const d=draftAudit(families),alerts=[];
 if(d.unique!==d.families)alerts.push({id:'duplicate',label:'มีรหัสกิจกรรมในร่างซ้ำ ต้องตรวจรายการ'});
 if(d.unresolved)alerts.push({id:'unmapped',label:'กลุ่มกิจกรรมที่ยังไม่จับคู่รายการย่อย '+d.unresolved+' กลุ่ม'});
 if(!state.ok)alerts.push({id:'source',label:'ข้อมูลจริงยังใช้สรุปเพื่ออนุมัติไม่ได้ · '+state.reason});
 if(state.ok){
  const row=state.release.stage_summaries.find(x=>x.stage_scope===stage);
  if(!row)alerts.push({id:'stage',label:'ยังไม่มีข้อมูลรับรองสำหรับระดับที่เลือก'});
  else COV.filter(k=>row.coverage[k]!=='complete').forEach(k=>alerts.push({id:'partial_'+k,label:'ขอบเขต '+k+' ไม่ครบ · ไม่แสดง KPI'}));
  if(state.state==='stale')alerts.push({id:'stale',label:'ข้อมูลต้นทางเก่ากว่า 7 วัน · ต้องตรวจประกาศใหม่'});
 }
 if(state.offline)alerts.push({id:'offline',label:'เปิดแบบออฟไลน์ · ยังตรวจสอบการเผยแพร่ล่าสุดหรือคำสั่งเพิกถอนไม่ได้'});
 return alerts;
}
function meetingCSV({state,families,stage}){
 const d=draftAudit(families),metrics=scorecard(state,stage);
 const rows=[
 ['ชนิดรายงาน','IA-6 สรุปเพื่อประชุม ไม่ใช่การรับรองการแข่งขันครั้งที่ 74'],
 ['ขอบเขต',stage==='district'?'ระดับเขต':'ระดับกลุ่มเครือข่าย'],
 ['สถานะการเผยแพร่',state.state],
 ['รหัสเผยแพร่',state.ok?state.release.publication_id:UNKNOWN],
 ['รุ่นข้อมูล',state.ok?state.release.data_version:UNKNOWN],
 ['แหล่งข้อมูล',state.ok?state.release.source_reference:UNKNOWN],
 ['ข้อมูล ณ',state.ok?state.release.source_as_of:UNKNOWN],
 ['เผยแพร่ ณ',state.ok?state.release.published_at:UNKNOWN],
 ['ข้อควรระวังออฟไลน์',state.offline?'ไม่สามารถตรวจสอบคำสั่งถอนเผยแพร่ใหม่':'ไม่ใช่เรียลไทม์'],
 ['กลุ่มกิจกรรมในร่าง 74',d.families],['อ้างอิงครั้งที่ 70',d.from70],
 ['อ้างอิงครั้งที่ 73',d.from73],['ยังไม่จับคู่รายการย่อย',d.unresolved],
 ...metrics.map(m=>[m.label,format(m.value),format(m.denom),m.coverage,m.source||UNKNOWN,m.version||UNKNOWN,m.sourceAsOf||UNKNOWN]),
 ...quality(state,families,stage).map(a=>['ข้อควรตรวจ '+a.id,a.label]),
 ['หมายเหตุ','ไม่รวมข้อมูลส่วนบุคคล แผนในเครื่อง หรือรายชื่อกรรมการย้อนหลัง']
 ];
 return '\ufeff'+rows.map(r=>r.map(csv).join(',')).join('\r\n');
}
function draw(root,ctx,stage){
 const {state,families}=ctx,d=draftAudit(families),metrics=scorecard(state,stage);
 root.querySelector('#ia6Status').textContent=state.ok?
  'เวอร์ชัน '+state.release.data_version+' · '+state.state+' · ข้อมูล ณ '+state.release.source_as_of:
  'ยังไม่มีชุดข้อมูลทางการครั้งที่ 74 ที่อนุมัติให้สรุป';
 root.querySelector('#ia6Source').textContent=state.ok?
  'ที่มา '+state.release.source_system+' · '+state.release.source_reference+
  ' · รหัสเผยแพร่ '+state.release.publication_id+' · เผยแพร่ '+state.release.published_at:
  'แหล่งที่มี: ร่างรายการ 74 จาก IA-2 และอ้างอิง 70/73 · ไม่มีข้อมูลรับรองจาก AcademicCompetitionManager';
 root.querySelector('#ia6Offline').textContent=state.offline?
  'ออฟไลน์: ไม่อาจยืนยันข้อมูลล่าสุดหรือประกาศเพิกถอนได้ ให้ตรวจออนไลน์ก่อนใช้ตัดสินใจ':
  'หน้าเว็บและ PWA อาจมีข้อมูลที่แคชไว้ · ไม่ใช่สถานะสด ต้องตรวจประกาศฉบับล่าสุดก่อนตัดสินใจ';
 root.querySelector('#ia6Kpis').innerHTML=metrics.map(m=>'<div class="ia6-kpi"><small>'+h(m.label)+'</small>'+
  '<strong>'+format(m.value)+'</strong><span>'+
  h(m.value===null?'ยังไม่มีแหล่งข้อมูลรับรองที่ครอบคลุม':'อ้างอิง '+m.source+' · '+m.sourceAsOf)+'</span>'+
  (m.denom!==null?'<p>จากยอดที่รับรอง '+format(m.denom)+'</p>':'')+'</div>').join('');
 root.querySelector('#ia6Draft').innerHTML=[
  ['กลุ่มกิจกรรมในร่างครั้งที่ 74',d.families,'ร่าง ไม่ใช่รายการย่อยที่รับรอง'],
  ['กลุ่มอ้างอิงครั้งที่ 70',d.from70,'แหล่งประวัติการแข่งขันครั้งที่ 70'],
  ['กลุ่มอ้างอิงครั้งที่ 73',d.from73,'ฐานผลการแข่งขันย้อนหลัง'],
  ['กลุ่มที่รอตรวจรายการย่อย',d.unresolved,'ไม่เดาระดับชั้นหรือเกณฑ์']
 ].map(x=>'<div><b>'+format(x[1])+'</b><span>'+h(x[0])+'</span><small>'+h(x[2])+'</small></div>').join('');
 root.querySelector('#ia6Alerts').innerHTML=quality(state,families,stage).map(a=>
  '<li>'+h(a.label)+'</li>').join('')||'<li>ไม่พบสัญญาณเตือนตามเงื่อนไขระบบ ไม่ใช่การรับรองจากผู้จัด</li>';
 root.querySelector('#ia6StageHint').textContent=stage==='district'?
  'ขอบเขตระดับเขต · ภาระส่งตัวแทนต้องพิจารณาโหมดรับสมัครที่รับรอง ไม่ใช่ทุกกิจกรรม':
  'ขอบเขตระดับกลุ่มเครือข่าย · ห้ามใช้ตัวเลขจากการสมัครตรงระดับเขตมานับเป็นภาระส่งตัวแทนของกลุ่ม';
}
function mount({rootId='ia6Root',families=[],release=null,revocation=null,offline=false,now=Date.now()}={}){
 const root=document.getElementById(rootId);if(!root)return {ok:false,reason:'container missing'};
 const ctx={families,state:resolve({release,revocation,offline,now})};
 let stage='district';
 root.innerHTML='<header class="ia6-hero"><span>IA-6 · Executive Decision Dashboard</span>'+
 '<h2>ศูนย์วิเคราะห์สำหรับผู้บริหาร</h2><p>สรุปสิ่งที่ตรวจสอบได้ สิ่งที่ต้องเตรียม และการตัดสินใจที่ยังรอผู้จัดรับรอง โดยไม่ตีความข้อมูลร่างหรือข้อมูลเก่าเป็นผลจริง</p>'+
 '<nav class="ia6-links"><button type="button" data-go="readiness">ความพร้อมผู้จัด ›</button>'+
 '<button type="button" data-go="venue">กรรมการและสนาม ›</button>'+
 '<button type="button" data-go="next">ทะเบียนรายการ 74 ›</button></nav></header>'+
 '<section class="ia6-source"><b id="ia6Status"></b><p id="ia6Source"></p><p id="ia6Offline"></p></section>'+
 '<section class="ia6-panel"><div class="ia6-bar"><div><h3>ตัวชี้วัดการดำเนินงานที่ได้รับการรับรอง</h3>'+
 '<p>ต้องมีตัวตั้ง ตัวหาร แหล่งที่มา และขอบเขตครบ จึงแสดงตัวเลขทางการ</p></div>'+
 '<label>ระดับการแข่งขัน<select id="ia6Stage"><option value="district">ระดับเขต</option>'+
 '<option value="cluster">ระดับกลุ่มเครือข่าย</option></select></label></div>'+
 '<p class="ia6-hint" id="ia6StageHint"></p><div class="ia6-kpis" id="ia6Kpis"></div></section>'+
 '<section class="ia6-panel"><div class="ia6-bar"><h3>ข้อมูลร่างประกอบการเตรียมงาน</h3>'+
 '<span class="ia6-chip">ไม่ใช่ข้อมูลอนุมัติการแข่งขัน</span></div><div class="ia6-draft" id="ia6Draft"></div>'+
 '<p class="ia6-hint">ตัวเลขนี้นับกลุ่มกิจกรรมจาก IA-2 ไม่ใช่รายการย่อยที่เปิดแข่งจริง · ข้อมูลครั้งที่ 70/73 ใช้ศึกษาเท่านั้น</p></section>'+
 '<section class="ia6-panel"><h3>วาระตัดสินใจและติดตามงาน</h3><ol class="ia6-tasks">'+
 '<li><b>ยืนยันทะเบียนกิจกรรมและระดับชั้น</b><span>ตรวจรหัสกิจกรรม เกณฑ์และโหมดรับสมัครตามระดับการแข่งขัน</span></li>'+
 '<li><b>ตรวจสถานะโรงเรียนและกลุ่มเครือข่าย</b><span>แยกการวางแผน ส่งแล้ว ตรวจสอบแล้ว และรับรองแล้ว</span></li>'+
 '<li><b>ตรวจกรรมการและสนาม</b><span>ผู้ควบคุมทีม โรงเรียนที่เข้าแข่งขัน เวลาซ้อน และความจุห้องต้องตรวจโดยเจ้าหน้าที่ที่ได้รับมอบหมาย</span></li>'+
 '<li><b>อนุมัติการเผยแพร่ข้อมูลส่วนรวม</b><span>ตรวจความครบถ้วน สิทธิ์ PDPA เวอร์ชันข้อมูล และแผนแก้ไข/ถอนเผยแพร่</span></li></ol>'+
 '<div class="ia6-dates"><b>กำหนดเบื้องต้น (ต้องยืนยันกับประกาศล่าสุด)</b>'+
 '<p>4 ธ.ค. 2569 · กำหนดส่งตัวแทนจากกลุ่ม ไม่ใช่ปิดรับสมัครทุกประเภท</p>'+
 '<p>21–24 ธ.ค. 2569 · ช่วงแข่งขันระดับเขตเบื้องต้น ไม่ใช่ตารางห้องรายกิจกรรม</p></div></section>'+
 '<section class="ia6-panel"><h3>คุณภาพข้อมูลและการเผยแพร่</h3><ul class="ia6-alerts" id="ia6Alerts"></ul>'+
 '<div class="ia6-publish"><h4>การควบคุมเผยแพร่</h4>'+
 '<p>ร่าง → ตรวจและรับรอง → เผยแพร่ Snapshot → ปรับปรุง/ถอนเผยแพร่</p>'+
 '<p>เว็บสาธารณะไม่มีปุ่มอนุมัติหรือถอนข้อมูลจริง ผู้ดูแลต้องดำเนินการผ่านระบบหลักพร้อมล้าง PWA Cache และตรวจผลหลังเผยแพร่</p></div>'+
 '<button type="button" id="ia6Export" class="ia6-export">ส่งออก CSV สรุปสำหรับประชุม (ไม่รวมข้อมูลบุคคล)</button>'+
 '<p class="ia6-hint">CSV ระบุสถานะ แหล่งข้อมูล เวอร์ชัน และช่องที่ยังเป็น — โดยไม่รวมแผนในเครื่องหรือรายชื่อกรรมการ</p></section>';
 root.querySelector('#ia6Stage').addEventListener('change',e=>{
  if(!STAGES.includes(e.target.value))return;stage=e.target.value;draw(root,ctx,stage);
 });
 root.querySelector('#ia6Export').addEventListener('click',()=>{
  const content=meetingCSV({state:ctx.state,families:ctx.families,stage});
  const url=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='sillapa74_ia6_meeting_'+stage+'.csv';
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 draw(root,ctx,stage);
 return {ok:true,getState:()=>ctx.state,stage:()=>stage,redraw:()=>draw(root,ctx,stage)};
}
return {STAGES,COV,METRICS,validateRelease,validateTombstone,resolve,scorecard,draftAudit,quality,meetingCSV,mount};
});
