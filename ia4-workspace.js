/* IA-4: device-local school workspace. NO network, auth, or official registration statuses.
   School display labels are LEGACY local selectors, not canonical competition school IDs. */
(function (root,factory) {
  const api=factory();
  if (typeof module === 'object' && module.exports) module.exports=api;
  if (root) root.SILLAPA_IA4=api;
})(typeof window !== 'undefined'?window:null,function(){
  'use strict';
  const KEY='sillapa74:school-workspace:v1';
  const LEGACY='plan74'; // read-only migration input; never overwrite or delete it.
  const STEPS=[
    {id:'criteria',label:'อ่านประกาศและตรวจเกณฑ์การแข่งขันฉบับล่าสุด'},
    {id:'levels',label:'ตรวจระดับชั้นและความพร้อมของนักเรียนกับครูผู้รับผิดชอบ'},
    {id:'documents',label:'เตรียมเอกสารตามที่ผู้จัดประกาศ'}
  ];
  const maxName=120;
  const own=(x,k)=>Object.prototype.hasOwnProperty.call(x,k);
  const obj=x=>x&&typeof x==='object'&&!Array.isArray(x);
  const str=x=>typeof x==='string'?x.trim():'';
  const html=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clone=x=>JSON.parse(JSON.stringify(x));
  function createStore(storage,allowedTitles,allowedLevels) {
    if(!storage || typeof storage.getItem!=='function' || typeof storage.setItem!=='function')
      throw Error('IA-4 requires device localStorage');
    const validTitles=new Set(allowedTitles||[]);
    const validLevels=new Set(allowedLevels||[]);
    const sanitiseItems=input=>{
      const out={};
      if(!obj(input))return out;
      Object.keys(input).forEach(k=>{
        if (!validTitles.has(k))return;
        const arr=Array.isArray(input[k])?input[k]:[];
        out[k]=[...new Set(arr.filter(v=>typeof v==='string'&&validLevels.has(v)))];
      });
      return out;
    };
    const sanitiseChecks=input=>{
      const out={};if(!obj(input))return out;
      Object.entries(input).forEach(([title,values])=>{
        if(!validTitles.has(title)||!obj(values))return;
        out[title]={};
        STEPS.forEach(step=>{if(values[step.id]===true)out[title][step.id]=true});
      });
      return out;
    };
    const cleanSchool=label=>{
      const s=str(label).slice(0,maxName);
      return ['__proto__','constructor','prototype'].includes(s)?'':s;
    };
    const empty=()=>({items:{},checks:{}});
    function profile(raw){return {items:sanitiseItems(raw?.items),checks:sanitiseChecks(raw?.checks)};}
    let state={version:1,selectedSchool:'',schools:{},orphan:null};
    let blocked=false,lastSaved=true,migrated=false;
    let saved=null;
    try{saved=storage.getItem(KEY)}catch(_){blocked=true;lastSaved=false}
    if(saved!==null && !blocked){
      try {
        const doc=JSON.parse(saved);
        if(!obj(doc)||doc.version!==1||!obj(doc.schools)||typeof doc.selectedSchool!=='string')
          throw Error('bad local profile');
        Object.entries(doc.schools).forEach(([name,v])=>{
          const key=cleanSchool(name);if(key&&key===name)state.schools[key]=profile(v);
        });
        state.selectedSchool=cleanSchool(doc.selectedSchool);
        state.orphan=doc.orphan?profile(doc.orphan):null;
      }catch(_){blocked=true;lastSaved=false}
    } else if (!blocked) {
      // Import once into a NEW key; do not mutate plan74 or merge across schools.
      let raw=null;try{raw=JSON.parse(storage.getItem(LEGACY)||'null')}catch(_){}
      if(obj(raw)) {
        const items=sanitiseItems(raw.items),school=cleanSchool(raw.school);
        if(school){state.selectedSchool=school;state.schools[school]={items,checks:{}};migrated=true}
        else if(Object.keys(items).length){state.orphan={items,checks:{}};migrated=true}
      }
    }
    function persist(){
      if(blocked){lastSaved=false;return false}
      try{storage.setItem(KEY,JSON.stringify(state));lastSaved=true;return true}
      catch(_){lastSaved=false;return false}
    }
    if(saved===null)persist();
    function current() {
      const school=state.selectedSchool;
      const p=school&&state.schools[school]||empty();
      return {school,items:clone(p.items)};
    }
    function selectSchool(school){
      const name=cleanSchool(school);
      if(name&&!own(state.schools,name))state.schools[name]=empty();
      state.selectedSchool=name;persist();
      return current();
    }
    function savePlan(plan){
      if(!plan||cleanSchool(plan.school)!==state.selectedSchool||!state.selectedSchool)return false;
      const p=state.schools[state.selectedSchool]||empty();
      p.items=sanitiseItems(plan.items);
      Object.keys(p.checks).forEach(title=>{if(!own(p.items,title))delete p.checks[title]});
      state.schools[state.selectedSchool]=p;
      return persist();
    }
    function getChecks(title){
      const p=state.schools[state.selectedSchool];
      return p&&p.checks[title]?clone(p.checks[title]):{};
    }
    function setCheck(title,step,value){
      if(!state.selectedSchool||!validTitles.has(title)||!STEPS.some(s=>s.id===step))return false;
      const p=state.schools[state.selectedSchool];
      if(!p||!own(p.items,title))return false;
      p.checks[title]??={};
      p.checks[title][step]=value===true;
      return persist();
    }
    function adoptOrphan(){
      if(!state.selectedSchool||!state.orphan)return false;
      const p=state.schools[state.selectedSchool]||empty();
      Object.entries(state.orphan.items).forEach(([title,levels])=>{
        if(!own(p.items,title))p.items[title]=levels;
      });
      state.schools[state.selectedSchool]=p;state.orphan=null;
      return persist();
    }
    function progress(){
      const p=state.schools[state.selectedSchool]||empty();
      const titles=Object.keys(p.items);
      const complete=titles.filter(t=>STEPS.every(step=>p.checks[t]?.[step.id]===true)).length;
      const done=titles.reduce((n,t)=>n+STEPS.filter(step=>p.checks[t]?.[step.id]===true).length,0);
      return {activities:titles.length,complete,done,total:titles.length*STEPS.length};
    }
    const info=()=>({selectedSchool:state.selectedSchool,hasOrphan:!!state.orphan,
      migrated,blocked,lastSaved,profileCount:Object.keys(state.schools).length,
      key:KEY});
    return {selectSchool,current,savePlan,getChecks,setCheck,adoptOrphan,progress,info,STEPS};
  }
  function renderSummary(store){
    const p=store.progress(),m=store.info();
    return '<div class="ia4-topline"><span class="ia4-local-tag">แผนในเครื่องนี้ · ไม่ใช่ใบสมัคร</span>'+
      '<span class="ia4-device">ใช้ได้เฉพาะเครื่องนี้ ไม่แสดงบนเครื่องอื่น</span></div>'+
      '<div class="ia4-head"><h2>เตรียมแข่งขันของโรงเรียน</h2>'+
      '<p>เลือกโรงเรียนก่อน แล้วค่อยวางแผนกิจกรรมและตรวจรายการเตรียมงาน ไม่ต้องกรอกข้อมูลส่วนตัวของนักเรียนหรือครู</p></div>'+
      '<div class="ia4-stats">'+
      '<div><strong>'+p.activities+'</strong><small>กิจกรรมในแผนเครื่องนี้</small></div>'+
      '<div><strong>'+p.complete+'</strong><small>กิจกรรมที่ตรวจรายการเตรียมงานครบ</small></div>'+
      '<div><strong>'+p.done+'/'+p.total+'</strong><small>ขั้นตอนเตรียมงานที่ทำแล้ว</small></div></div>'+
      (!m.selectedSchool?'<p class="ia4-prompt">กรุณาเลือกโรงเรียนก่อนเริ่มวางแผน เพื่อให้ข้อมูลของแต่ละโรงเรียนแยกกัน</p>':'')+
      (m.hasOrphan?'<p class="ia4-warning">พบแผนเดิมที่ยังไม่ได้เลือกโรงเรียน · เลือกโรงเรียนก่อน แล้วกดปุ่มนำแผนเดิมมาใช้ ระบบจะเก็บแผนเก่าไว้ด้วย <button type="button" id="ia4Adopt"'+(!m.selectedSchool?' disabled':'')+'>นำแผนเดิมมาใช้กับโรงเรียนนี้</button></p>':'')+
      (!m.lastSaved?'<p class="ia4-warning" role="alert">ไม่สามารถบันทึกแผนในเครื่องได้ กรุณาตรวจพื้นที่ว่างหรือการตั้งค่าเบราว์เซอร์ และส่งออกไฟล์ไว้สำรอง</p>':'')+
      '<p class="ia4-tip">ระดับชั้นและกิจกรรมในหน้านี้ใช้ข้อมูลการแข่งขันครั้งก่อนช่วยวางแผน ยังไม่ใช่รายการเปิดสมัครจริง ให้ตรวจประกาศและสถานะจากระบบแข่งขันหลักเมื่อเปิดใช้งาน</p>';
  }
  function renderChecks(store,title){
    const checks=store.getChecks(title);
    return '<fieldset class="ia4-checklist"><legend>รายการตรวจความพร้อม · ครูทำเครื่องหมายเมื่อเตรียมเสร็จ</legend>'+
      STEPS.map(s=>'<label><input type="checkbox" data-ia4-check="'+s.id+'" data-ia4-title="'+html(title)+'"'+
        (checks[s.id]?' checked':'')+'><span>'+html(s.label)+'</span></label>').join('')+'</fieldset>';
  }
  return {createStore,renderSummary,renderChecks,STEPS,KEY};
});
