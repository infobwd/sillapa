/* IA-5 public-only judge/venue planning. No personnel roster, backend or authenticated API.
   The family keys are temporary draft references from IA-2, not official 74 IDs. */
(function(global,factory){
  const api=factory();
  if(typeof module==='object' && module.exports)module.exports=api;
  if(global)global.SILLAPA_IA5=api;
})(typeof window!=='undefined'?window:null,function(){
  'use strict';
  const KEY='sillapa74:judge-venue-planning:v1';
  const STAGES=['cluster','district'];
  const RISKS=[
    {key:'team_supervisor',label:'ผู้ควบคุมทีมอาจทำหน้าที่กรรมการด้วย'},
    {key:'same_school',label:'โรงเรียนที่เกี่ยวข้องส่งทีมในกิจกรรมเดียวกัน'},
    {key:'schedule_overlap',label:'เวลาจัดกิจกรรมหรือภารกิจอาจซ้อนกัน'},
    {key:'availability',label:'ยังต้องสอบถามความสะดวกมาปฏิบัติหน้าที่'},
    {key:'venue_capacity',label:'ความจุห้องหรืออุปกรณ์อาจไม่เพียงพอ'}
  ];
  const isObject=x=>x&&typeof x==='object'&&!Array.isArray(x);
  const own=(x,k)=>Object.prototype.hasOwnProperty.call(x,k);
  const e=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const allowedFields=new Set(['schema','cycle','publication_status','source_system','source_as_of','published_at','coverage','rows']);
  function validIso(s){return typeof s==='string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/.test(s) && !Number.isNaN(Date.parse(s))}
  function validatePublicSnapshot(doc){
    if(!isObject(doc)||Object.keys(doc).some(k=>!allowedFields.has(k)))return {ok:false,reason:'unexpected release fields'};
    if(doc.schema!=='sillapa-ia5-public-v1'||doc.cycle!==74||doc.publication_status!=='approved'
      ||doc.source_system!=='AcademicCompetitionManager'||!validIso(doc.source_as_of)||!validIso(doc.published_at))
      return {ok:false,reason:'not an approved sourced publication'};
    if(Date.parse(doc.published_at)<Date.parse(doc.source_as_of))return {ok:false,reason:'publication chronology'};
    if(!isObject(doc.coverage)||Object.keys(doc.coverage).sort().join('|')!=='activities|judges|schedule|venues'
      ||Object.values(doc.coverage).some(v=>v!=='complete'))
      return {ok:false,reason:'incomplete coverage'};
    if(!Array.isArray(doc.rows))return {ok:false,reason:'missing row coverage'};
    const keys=new Set();
    for(const row of doc.rows){
      if(!isObject(row)||Object.keys(row).sort().join('|')!==
        'activity_id|available_judges|confirmed_rooms|confirmed_slots|conflict_count|required_judges|stage')
        return {ok:false,reason:'unsafe row fields'};
      if(typeof row.activity_id!=='string'||!/^[-_A-Za-z0-9]{1,64}$/.test(row.activity_id)||
        !STAGES.includes(row.stage))return {ok:false,reason:'missing canonical id or stage'};
      for(const k of ['available_judges','required_judges','confirmed_rooms','confirmed_slots','conflict_count'])
        if(!Number.isSafeInteger(row[k])||row[k]<0)return {ok:false,reason:'not verified counts'};
      if(row.available_judges>row.required_judges)return {ok:false,reason:'available exceeds requirement'};
      const id=row.activity_id+'|'+row.stage;
      if(keys.has(id))return {ok:false,reason:'duplicate canonical activity-stage'};
      keys.add(id);
    }
    // This validator alone does not authorize loading a feed, mapping old names to 74 IDs,
    // publishing personal assignments, or treating the absence of rows as zero.
    return {ok:true,rows:doc.rows.length,source_as_of:doc.source_as_of};
  }
  function sanitizeCount(v){
    if(v===''||v==null||typeof v==='boolean')return null;
    if(typeof v==='string'&&!/^[1-9][0-9]{0,2}$/.test(v.trim()))return null;
    const n=Number(v);
    return Number.isSafeInteger(n)&&n>=1&&n<=999?n:null;
  }
  function makeStore(storage,families){
    const allowed=new Set((families||[]).map(f=>f.key).filter(k=>typeof k==='string'&&/^draft-F\d+-A\d+$/.test(k)));
    let state={version:1,plans:{}},blocked=false,lastSaved=true;
    try {
      const existing=storage?.getItem(KEY);
      if(existing!==null&&existing!==undefined){
        const raw=JSON.parse(existing);
        if(!isObject(raw)||raw.version!==1||!isObject(raw.plans))throw Error('invalid saved schema');
        for(const [id,p] of Object.entries(raw.plans)){
          const [key,stage,...overflow]=id.split('|');
          if(overflow.length||!allowed.has(key)||!STAGES.includes(stage)||!isObject(p))continue;
          const clean={judges:sanitizeCount(p.judges),rooms:sanitizeCount(p.rooms),capacity:sanitizeCount(p.capacity),flags:{}};
          if(isObject(p.flags))RISKS.forEach(r=>{if(p.flags[r.key]===true)clean.flags[r.key]=true});
          state.plans[id]=clean;
        }
      }
    }catch(_){blocked=true;lastSaved=false}
    function write(){
      if(blocked)return false;
      try{storage.setItem(KEY,JSON.stringify(state));lastSaved=true;return true}
      catch(_){lastSaved=false;return false}
    }
    const blank=()=>({judges:null,rooms:null,capacity:null,flags:{}});
    function get(key,stage){
      if(!allowed.has(key)||!STAGES.includes(stage))return blank();
      const p=state.plans[key+'|'+stage]||blank();
      return {judges:p.judges,rooms:p.rooms,capacity:p.capacity,flags:{...p.flags}};
    }
    function set(key,stage,patch){
      if(!allowed.has(key)||!STAGES.includes(stage)||!isObject(patch)||
        Object.keys(patch).some(k=>!['judges','rooms','capacity','risk','checked'].includes(k)))return false;
      const id=key+'|'+stage,p=get(key,stage);
      if(own(patch,'judges'))p.judges=sanitizeCount(patch.judges);
      if(own(patch,'rooms'))p.rooms=sanitizeCount(patch.rooms);
      if(own(patch,'capacity'))p.capacity=sanitizeCount(patch.capacity);
      if(own(patch,'risk')){
        if(!RISKS.some(r=>r.key===patch.risk)||typeof patch.checked!=='boolean')return false;
        if(patch.checked)p.flags[patch.risk]=true;else delete p.flags[patch.risk];
      }else if(own(patch,'checked'))return false;
      state.plans[id]=p;
      return write();
    }
    return {get,set,info:()=>({lastSaved,blocked,key:KEY,scope:'this device only'})};
  }
  function historyGroups(archivedJudges,groupForAct,conflictsByAct={}){
    // Accept only index references for aggregate computation; do not return names.
    const out=new Map();
    if(!isObject(archivedJudges)||!Array.isArray(archivedJudges.p)||!isObject(archivedJudges.a))return [];
    for(const [act,assignments] of Object.entries(archivedJudges.a)){
      const group=groupForAct(act);
      if(typeof group!=='string'||!group||!Array.isArray(assignments))continue;
      let r=out.get(group);
      if(!r){r={group,events:new Set(),judges:new Set(),positions:0,schoolFlags:0};out.set(group,r)}
      r.events.add(act);
      if(Array.isArray(conflictsByAct[act]))r.schoolFlags+=conflictsByAct[act].length;
      assignments.forEach(v=>{
        if(!Array.isArray(v)||!Number.isInteger(v[0])||v[0]<0||v[0]>=archivedJudges.p.length)return;
        r.judges.add(v[0]);r.positions++;
      });
    }
    return [...out.values()].map(r=>({group:r.group,events:r.events.size,judges:r.judges.size,positions:r.positions,schoolFlags:r.schoolFlags}))
      .sort((a,b)=>a.group.localeCompare(b.group,'th'));
  }
  function summary(families,store,stage,filter){
    const chosen=filter?select(families,store,stage,filter):families;
    const data=chosen.map(f=>store.get(f.key,stage));
    const judgeKnown=data.filter(p=>p.judges!==null).length,roomKnown=data.filter(p=>p.rooms!==null).length;
    const risks=data.filter(p=>Object.values(p.flags).some(Boolean)).length;
    return {activities:chosen.length,judgeKnown,roomKnown,risks,
      judges:judgeKnown===chosen.length&&chosen.length>0?data.reduce((n,p)=>n+p.judges,0):null,
      rooms:roomKnown===chosen.length&&chosen.length>0?data.reduce((n,p)=>n+p.rooms,0):null};
  }
  function select(families,store,stage,filter){
    const q=String(filter?.query||'').trim().toLocaleLowerCase('th-TH'),group=filter?.group||'all',
      flag=filter?.risk||'all';
    return (families||[]).filter(f=>{
      if(group!=='all'&&f.groupName!==group)return false;
      if(q&&!String(f.groupName+' '+f.draftTitle).toLocaleLowerCase('th-TH').includes(q))return false;
      const p=store.get(f.key,stage),risked=Object.values(p.flags).some(Boolean);
      return flag==='all'||(flag==='attention'&&risked)||(flag==='pending'&&(p.judges===null||p.rooms===null));
    });
  }
  function exportCSV(rows,store,stage){
    const header=['ชนิดข้อมูล','ชื่อกิจกรรมในร่าง 74','หมวดกิจกรรม','รหัสชั่วคราว','ระดับแข่งขันเพื่อวางแผน','จำนวนกรรมการคาดการณ์','จำนวนห้องคาดการณ์','ความจุคาดการณ์ต่อห้อง (คน)','ธงให้ตรวจ (ไม่ใช่คำวินิจฉัย)','หลักฐานที่มาของกิจกรรม'];
    const cell=v=>{let s=String(v??'');if(/^\s*[=+\-@]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'};
    const list=[header,...rows.map(f=>{
      const p=store.get(f.key,stage);
      return ['แผนในเครื่องนี้ ไม่ใช่แต่งตั้ง/จัดสนาม',f.draftTitle,f.groupName,f.key,
        stage==='cluster'?'ระดับกลุ่ม':'ระดับเขต',p.judges??'',p.rooms??'',p.capacity??'',
        RISKS.filter(r=>p.flags[r.key]).map(r=>r.label).join('; '),
        'ร่างครั้งที่ 74 / อ้างอิง '+f.historyCycle];
    })];
    return '\ufeff'+list.map(r=>r.map(cell).join(',')).join('\r\n');
  }
  const option=(value,label)=>'<option value="'+e(value)+'">'+e(label)+'</option>';
  const count=n=>n===null?'—':String(n);
  function draw(root,ctx,filters){
    const {families,store,historical}=ctx,stage=filters.stage;
    const visible=select(families,store,stage,filters),tot=summary(families,store,stage);
    const known=ctx.historyByGroup;
    const sg=store.info();
    root.querySelector('#ia5Kpi').innerHTML=[
      ['กิจกรรมในร่าง 74',families.length+'','ข้อมูลร่าง ไม่ใช่รายการยืนยัน'],
      ['กรรมการแต่งตั้งจริง ครั้งที่ 74','—','ยังไม่มีข้อมูลประกาศที่ได้รับอนุมัติ'],
      ['สนาม/ห้องที่ยืนยันแล้ว ครั้งที่ 74','—','ยังไม่มีตารางจัดสนามที่ยืนยัน'],
      ['ระบุประมาณการกรรมการ · '+(stage==='cluster'?'ระดับกลุ่ม':'ระดับเขต'),tot.judgeKnown+'/'+tot.activities,'แผนในเครื่องนี้เท่านั้น'],
      ['กรรมการคาดการณ์ (รวม)',count(tot.judges),tot.judges===null?'ยังกรอกไม่ครบทุกกิจกรรมในร่าง':'รวมร่างในเครื่องนี้ ไม่ใช่ยอดที่อนุมัติ'],
      ['ห้องคาดการณ์ (รวม)',count(tot.rooms),tot.rooms===null?'ยังกรอกไม่ครบทุกกิจกรรมในร่าง':'รวมร่างในเครื่องนี้ ไม่ใช่ห้องที่จัดสรรจริง']
    ].map(t=>'<div class="ia5-kpi"><small>'+e(t[0])+'</small><strong>'+e(t[1])+'</strong><span>'+e(t[2])+'</span></div>').join('');
    root.querySelector('#ia5Source').textContent=
      'แหล่งข้อมูล: ร่างกิจกรรมครั้งที่ 74 (IA-2) + ภาพรวมกรรมการครั้งที่ 73 จากข้อมูลย้อนหลังที่มีอยู่ในเว็บ · ไม่ใช่คำสั่งแต่งตั้งครั้งที่ 74';
    root.querySelector('#ia5Local').textContent=sg.lastSaved
      ?'แผนประมาณการในเบราว์เซอร์เครื่องนี้เท่านั้น · ไม่ส่งไปยังระบบแข่งขันหลัก · การสลับระดับกลุ่ม/เขตเก็บแยก'
      :'บันทึกแผนในเครื่องไม่สำเร็จ · โปรดส่งออก CSV เก็บสำรอง (ข้อมูลที่เห็นอาจหายเมื่อรีเฟรช)';
    root.querySelector('#ia5Local').setAttribute('role',sg.lastSaved?'note':'alert');
    root.querySelector('#ia5Found').textContent='แสดง '+visible.length+' จาก '+families.length+' กิจกรรมในร่าง · '+(stage==='cluster'?'ระดับกลุ่ม':'ระดับเขต')+' (แผนเฉพาะเครื่อง)';
    const shown=visible.slice(0,filters.limit);
    root.querySelector('#ia5Rows').innerHTML=shown.length?shown.map(f=>{
      const p=store.get(f.key,stage),h=known.get(f.groupName);
      return '<article class="ia5-row" data-family="'+e(f.key)+'">'+
        '<div class="ia5-row-head"><div><strong>'+e(f.draftTitle)+'</strong><small>'+e(f.groupName)+' · '+e(f.key)+' (รหัสในร่าง) · อ้างอิง '+e(f.historyCycle==='unresolved'?'ยังไม่มีข้อมูลตรงตัว': 'ครั้งที่ '+f.historyCycle)+'</small></div>'+
        '<span class="ia5-status">'+(Object.values(p.flags).some(Boolean)?'มีประเด็นให้ตรวจ':'ยังไม่รับรอง')+'</span></div>'+
        '<p class="ia5-history">ภาพรวมกลุ่มครั้งที่ 73: '+(h?e(h.judges)+' คนเคยเป็นกรรมการ · '+e(h.events)+' รายการ':'— ไม่พบข้อมูลย้อนหลังของกลุ่มที่จับคู่ได้')+' · <b>ไม่ใช่รายชื่อเสนอแต่งตั้ง</b></p>'+
        '<div class="ia5-fields"><label>กรรมการที่คาดว่าต้องเตรียม <small>(แผน)</small><input type="number" min="1" max="999" inputmode="numeric" placeholder="—" data-ia5-field="judges" data-key="'+e(f.key)+'" value="'+(p.judges??'')+'"></label>'+
        '<label>ห้องที่คาดว่าต้องเตรียม <small>(แผน)</small><input type="number" min="1" max="999" inputmode="numeric" placeholder="—" data-ia5-field="rooms" data-key="'+e(f.key)+'" value="'+(p.rooms??'')+'"></label>'+ 
        '<label>ความจุที่คาดว่าต้องรองรับ <small>(คน/ห้อง · แผน)</small><input type="number" min="1" max="999" inputmode="numeric" placeholder="—" data-ia5-field="capacity" data-key="'+e(f.key)+'" value="'+(p.capacity??'')+'"></label></div>'+
        '<details class="ia5-risks"><summary>ตรวจประเด็นก่อนเสนอกรรมการ/จัดสนาม <span>'+RISKS.filter(r=>p.flags[r.key]).length+' ข้อที่ทำเครื่องหมาย</span></summary>'+
        '<p>ทำเครื่องหมายเมื่อพบประเด็นที่ต้องตรวจต่อ ไม่ใช่ข้อยุติว่ามีผลประโยชน์ทับซ้อนหรือแต่งตั้งแล้ว</p>'+
        RISKS.map(r=>'<label><input type="checkbox" data-ia5-risk="'+e(r.key)+'" data-key="'+e(f.key)+'"'+(p.flags[r.key]?' checked':'')+'><span>'+e(r.label)+'</span></label>').join('')+'</details>'+
        '</article>';
    }).join(''):'<p class="ia5-empty">ไม่พบกิจกรรมตามตัวกรอง · ลองเลือกกลุ่มอื่นหรือกดล้างตัวกรอง</p>';
    const more=root.querySelector('#ia5More');
    more.hidden=visible.length<=filters.limit;
    more.textContent='ดูเพิ่ม '+Math.min(12,visible.length-filters.limit)+' กิจกรรม';
    // Historical figures never drive official 74 requirements, appointments or capacity.
    const groups=[...new Set(families.map(f=>f.groupName))];
    root.querySelector('#ia5HistoricRows').innerHTML=groups.map(g=>{
      const r=historical.find(x=>x.group===g);
      const draft=families.filter(f=>f.groupName===g).length;
      return '<tr><th scope="row">'+e(g)+'</th><td>'+draft+' <small>ร่าง</small></td>'+
        '<td>'+(r?r.events:'—')+'</td><td>'+(r?r.judges:'—')+'</td><td>'+(r?r.positions:'—')+'</td>'+
        '<td>'+(r?r.schoolFlags:'—')+'</td><td>—</td><td>—</td></tr>';
    }).join('');
  }
  function mount(opts){
    const root=document.getElementById(opts.rootId||'ia5Root');
    if(!root)return {ok:false,reason:'container not found'};
    const families=opts.families||[];
    if(!families.length)throw Error('IA-5 requires IA-2 draft families');
    if(new Set(families.map(f=>f.key)).size!==families.length)throw Error('duplicate draft family key');
    const historical=opts.historical||[];
    const historyByGroup=new Map(historical.map(h=>[h.group,h]));
    let storage=opts.storage;
    if(!storage){try{storage=window.localStorage}catch(_){
      storage={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};
    }}
    const store=makeStore(storage,families),ctx={families,historical,historyByGroup,store};
    const filters={stage:'district',group:'all',risk:'all',query:'',limit:12};
    root.innerHTML='<div class="ia5-lead"><p class="ia5-chip">IA-5 · เครื่องมือช่วยเตรียมงาน ไม่ใช่คำสั่งแต่งตั้ง</p>'+
      '<h2>กรรมการและสนามแข่งขัน</h2><p>ใช้ข้อมูลกรรมการครั้งที่ 73 เพื่อดูรูปแบบย้อนหลัง วางจำนวนคน/ห้องที่คาดว่าจะใช้กับกิจกรรมในร่างครั้งที่ 74 และจดประเด็นที่ต้องตรวจต่อโดยไม่กรอกรายชื่อบุคคล</p></div>'+
      '<p class="ia5-caution">สถานะครั้งที่ 74: <b>ยังไม่มีประกาศแต่งตั้งกรรมการ ตารางสนาม ห้อง ความจุ และช่วงเวลารายกิจกรรมที่รับรอง</b> ช่วง 21–24 ธ.ค. 2569 เป็นกำหนดระดับเขตเบื้องต้น ไม่ใช่วัน/ห้องที่จัดสรรแล้ว</p>'+
      '<div class="ia5-kpis" id="ia5Kpi"></div><p class="ia5-source" id="ia5Source"></p>'+
      '<section class="ia5-work"><div class="ia5-work-title"><h3>โต๊ะวางแผนกำลังคนและสนาม</h3><p>จำนวนที่กรอกเป็น <b>ประมาณการในเครื่อง</b> เท่านั้น ไม่ใช่จำนวนที่ผู้จัดรับรอง การเลือกระดับกลุ่ม/เขตไม่ใช่การยืนยันว่ารายการนั้นเปิดแข่งขันในระดับดังกล่าว</p></div>'+
      '<div class="ia5-controls"><label>ระดับแข่งขันที่กำลังวางแผน<select id="ia5Stage">'+option('district','ระดับเขต')+option('cluster','ระดับกลุ่มเครือข่าย')+'</select></label>'+
      '<label>กลุ่มกิจกรรม<select id="ia5Group">'+option('all','ทุกกลุ่ม')+
      [...new Set(families.map(f=>f.groupName))].map(g=>option(g,g)).join('')+'</select></label>'+
      '<label>รายการที่ต้องดู<select id="ia5Risk">'+option('all','ทั้งหมด')+option('attention','มีธงประเด็นที่ต้องตรวจ')+
      option('pending','ยังไม่ได้ใส่ประมาณการครบ')+'</select></label>'+
      '<label>ค้นหากิจกรรม<input id="ia5Query" type="search" placeholder="ชื่อกิจกรรมหรือหมวด"></label></div>'+
      '<div class="ia5-actions"><button type="button" id="ia5Reset">ล้างตัวกรอง</button>'+
      '<button type="button" id="ia5Export">ส่งออกแผน CSV (ไม่รวมข้อมูลบุคคล)</button></div>'+
      '<p class="ia5-local" id="ia5Local" aria-live="polite"></p><p class="ia5-found" id="ia5Found"></p>'+
      '<div id="ia5Rows" class="ia5-list"></div><button class="ia5-more" id="ia5More" type="button" hidden>ดูเพิ่ม</button></section>'+
      '<section class="ia5-historical"><h3>ภาพรวมอ้างอิงครั้งที่ 73 เทียบรายการในร่างครั้งที่ 74</h3>'+
      '<p>นับกรรมการไม่ซ้ำภายในกลุ่มในครั้งที่ 73 เท่านั้น คนเดียวอาจอยู่หลายกลุ่ม จึงไม่ควรรวมคอลัมน์นี้ข้ามกลุ่มเป็นจำนวนคนทั้งหมด สัญญาณโรงเรียนร่วมแข่งขันในครั้งที่ 73 เป็นเพียงเรื่องควรตรวจ ไม่ใช่คำวินิจฉัยความขัดแย้งหรือฐานการแต่งตั้งครั้งที่ 74</p>'+
      '<div class="ia5-table-wrap"><table><thead><tr><th scope="col">กลุ่มกิจกรรม</th><th scope="col">กิจกรรมในร่าง 74</th><th scope="col">รายการแข่ง 73 ที่มีกรรมการ</th><th scope="col">กรรมการในกลุ่ม 73</th><th scope="col">ตำแหน่ง 73</th><th scope="col">สัญญาณโรงเรียนร่วมแข่ง 73</th><th scope="col">แต่งตั้งจริง 74</th><th scope="col">สนามยืนยัน 74</th></tr></thead>'+
      '<tbody id="ia5HistoricRows"></tbody></table></div></section>'+
      '<section class="ia5-next"><h3>เงื่อนไขก่อนแต่งตั้งและจัดสนามจริง</h3>'+
      '<p>ตรวจผู้ควบคุมทีม, โรงเรียนที่ส่งแข่งขัน, ภาระซ้อน/วันเวลา, ความพร้อมมาปฏิบัติงาน และความจุห้องจากผู้รับผิดชอบ ก่อนออกคำสั่ง/ประกาศ โดยต้องทำในระบบแข่งขันหลักที่กำหนดสิทธิ์ ไม่ใช้ข้อมูลในเครื่องเป็นหลักฐานยืนยัน</p>'+
      '<button type="button" data-go="judges" class="ia5-archive-link">ดูกรรมการย้อนหลังครั้งที่ 73 ›</button>'+
      '<p>การเพิ่มข้อมูลการแต่งตั้งจริงหรือการจัดสนามที่ยืนยันแล้วต้องผ่าน Data Owner/PDPA Gate และมีชุดข้อมูลสาธารณะซึ่งตรวจสอบได้เป็น PR แยกต่างหาก</p></section>';
    const redraw=()=>draw(root,ctx,filters);
    const id=k=>root.querySelector('#'+k);
    id('ia5Stage').addEventListener('change',ev=>{filters.stage=ev.target.value;filters.limit=12;redraw()});
    id('ia5Group').addEventListener('change',ev=>{filters.group=ev.target.value;filters.limit=12;redraw()});
    id('ia5Risk').addEventListener('change',ev=>{filters.risk=ev.target.value;filters.limit=12;redraw()});
    id('ia5Query').addEventListener('input',ev=>{filters.query=ev.target.value;filters.limit=12;redraw()});
    id('ia5Reset').addEventListener('click',()=>{
      filters.group='all';filters.risk='all';filters.query='';filters.limit=12;
      id('ia5Group').value='all';id('ia5Risk').value='all';id('ia5Query').value='';redraw();
    });
    id('ia5More').addEventListener('click',()=>{filters.limit+=12;redraw()});
    root.addEventListener('change',ev=>{
      const el=ev.target;
      if(el.matches('[data-ia5-field]')){
        store.set(el.dataset.key,filters.stage,{[el.dataset.ia5Field]:el.value});redraw();
      }else if(el.matches('[data-ia5-risk]')){
        store.set(el.dataset.key,filters.stage,{risk:el.dataset.ia5Risk,checked:el.checked});
        const row=el.closest('.ia5-row'),p=store.get(el.dataset.key,filters.stage);
        if(row){
          const n=RISKS.filter(r=>p.flags[r.key]).length;
          row.querySelector('.ia5-risks summary span').textContent=n+' ข้อที่ทำเครื่องหมาย';
          row.querySelector('.ia5-status').textContent=n?'มีประเด็นให้ตรวจ':'ยังไม่รับรอง';
        }
        const notice=id('ia5Local');
        notice.textContent=store.info().lastSaved
          ?'บันทึกธงประเด็นในเครื่องนี้แล้ว · ไม่ใช่การตรวจรับหรือคำวินิจฉัยทางการ'
          :'บันทึกธงประเด็นไม่สำเร็จ · โปรดส่งออก CSV เก็บสำรอง';
        notice.setAttribute('role',store.info().lastSaved?'note':'alert');
        if(filters.risk==='attention')redraw();
      }
    });
    id('ia5Export').addEventListener('click',()=>{
      const csv=exportCSV(select(families,store,filters.stage,filters),store,filters.stage);
      const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
      const link=document.createElement('a');link.href=url;link.download='sillapa74_ia5_device_plan_'+filters.stage+'.csv';
      document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    });
    redraw();return {ok:true,store,filters,redraw};
  }
  return {KEY,STAGES,RISKS,makeStore,historyGroups,summary,select,exportCSV,mount,validatePublicSnapshot};
});
