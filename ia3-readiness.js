/* IA-3: public-only organizer readiness. No network, credentials or automatic backend integration.
 * Proposed read-v1 static projection requires a SEPARATE owner/publication approval. */
(function (global, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (global) global.SILLAPA_IA3 = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  const UNKNOWN = '—';
  const POLICIES = ['representative_only', 'open', 'representative_plus_open', 'closed'];
  const PLANNING = ['not_started', 'drafting'];
  const SUBMISSION = ['not_started', 'drafting', 'submitted'];
  const REVIEW = ['not_reviewed', 'pending', 'needs_revision', 'verified', 'locked'];
  const LABEL = {
    not_started:'ยังไม่เริ่มดำเนินการ', drafting:'กำลังเตรียมข้อมูล',
    submitted:'ส่งข้อมูลแล้ว', not_reviewed:'ยังไม่ได้ส่งให้ตรวจ',
    pending:'รอตรวจสอบ', needs_revision:'ต้องแก้ไข',
    verified:'ตรวจสอบแล้ว', locked:'ยืนยันเรียบร้อยแล้ว',
    representative_only:'ส่งตัวแทนจากกลุ่ม',
    open:'สมัครตรงตามระดับที่เปิด',
    representative_plus_open:'ส่งตัวแทนและสมัครตรง',
    closed:'ไม่เปิดรับสมัคร'
  };
  const KEYS = {
    root: ['schema_version','cycle_id','publication_id','publication_state','data_version',
      'source_system','source_reference','source_as_of','published_at','coverage',
      'activity_catalog','clusters','public_readiness_aggregates','public_issues'],
    coverage: ['catalog','obligations','teams','issues'],
    activity: ['activity_id','family_id','title','category','stage_scope','competition_mode','approval_state','source_reference','source_as_of'],
    cluster: ['cluster_id','label'],
    aggregate: ['record_id','activity_id','cluster_id','stage_scope','obligation_state',
      'planning_state','submission_state','verification_state','qualified_teams',
      'verified_at','source_as_of'],
    issue: ['issue_id','activity_id','stage_scope','cluster_id','title','state','source_reference']
  };
  const text = x => typeof x === 'string' && x.trim().length > 0;
  const str = x => String(x == null ? '' : x);
  const escapeHTML = x => str(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const isTime = x => text(x) && /\dT\d\d:\d\d/.test(x) &&
    /(?:Z|[+-]\d\d:\d\d)$/.test(x) && !Number.isNaN(Date.parse(x));
  const only = (o,allowed) => !!o && typeof o === 'object' && !Array.isArray(o) &&
    Object.keys(o).every(k=>allowed.includes(k));
  const natural = n => Number.isSafeInteger(n) && n >= 0;
  const activityKey = (id,stage) => id + '\u0000' + stage;
  function validateSnapshot(input) {
    const fail = reason => ({ok:false,reason});
    if (!only(input,KEYS.root)) return fail('โครงสร้างเผยแพร่มีฟิลด์ที่ไม่อนุญาต');
    if (input.schema_version !== 'sillapa-readiness-v1' || input.cycle_id !== '74' ||
        input.publication_state !== 'published' || input.source_system !== 'AcademicCompetitionManager' ||
        !text(input.publication_id) || !text(input.data_version) || !text(input.source_reference) ||
        !isTime(input.source_as_of) || !isTime(input.published_at)) return fail('ชุดข้อมูลยังไม่ผ่านเงื่อนไขเผยแพร่');
    if (Date.parse(input.published_at) < Date.parse(input.source_as_of)) return fail('เวลาของชุดข้อมูลไม่สอดคล้องกัน');
    const c = input.coverage;
    if (!only(c,KEYS.coverage) || !KEYS.coverage.every(k=>['complete','partial'].includes(c[k])))
      return fail('ขาดขอบเขตความครบถ้วนของข้อมูล');
    if (!Array.isArray(input.activity_catalog) || !Array.isArray(input.clusters) ||
        !Array.isArray(input.public_readiness_aggregates) || !Array.isArray(input.public_issues))
      return fail('รายการข้อมูลสาธารณะไม่ครบ');
    const ids = new Set(), groups = new Set(), records = new Set(), issues = new Set();
    for (const a of input.activity_catalog) {
      if (!only(a,KEYS.activity) || !text(a.activity_id) || !text(a.family_id) ||
          !text(a.title) || !text(a.category) || !['district','cluster'].includes(a.stage_scope) ||
          !POLICIES.includes(a.competition_mode) ||
          !['confirmed','published'].includes(a.approval_state) ||
          !text(a.source_reference) || !isTime(a.source_as_of) || ids.has(activityKey(a.activity_id,a.stage_scope)))
        return fail('รายการแข่งขันมีข้อมูลไม่ครบหรือซ้ำ');
      ids.add(activityKey(a.activity_id,a.stage_scope));
    }
    for (const g of input.clusters) {
      if (!only(g,KEYS.cluster) || !text(g.cluster_id) || !text(g.label) || groups.has(g.cluster_id))
        return fail('ข้อมูลกลุ่มเครือข่ายไม่ครบหรือซ้ำ');
      groups.add(g.cluster_id);
    }
    const policyOf = new Map(input.activity_catalog.map(a=>[activityKey(a.activity_id,a.stage_scope),a.competition_mode]));
    for (const r of input.public_readiness_aggregates) {
      if (!only(r,KEYS.aggregate) || !text(r.record_id) || !ids.has(activityKey(r.activity_id,r.stage_scope)) ||
          !groups.has(r.cluster_id) || !['district','cluster'].includes(r.stage_scope) ||
          !['required','not_applicable'].includes(r.obligation_state) ||
          (r.planning_state !== null && !PLANNING.includes(r.planning_state)) ||
          (r.submission_state !== null && !SUBMISSION.includes(r.submission_state)) ||
          (r.verification_state !== null && !REVIEW.includes(r.verification_state)) ||
          (r.qualified_teams !== null && !natural(r.qualified_teams)) ||
          (r.verified_at !== null && !isTime(r.verified_at)) ||
          !isTime(r.source_as_of) || records.has(r.record_id))
        return fail('ข้อมูลการส่งตัวแทนไม่ถูกต้อง');
      if (r.obligation_state === 'required' && (r.stage_scope !== 'district' ||
          ['closed','open'].includes(policyOf.get(activityKey(r.activity_id,r.stage_scope)))))
        return fail('ข้อมูลภาระส่งตัวแทนขัดกับนโยบายกิจกรรม');
      if ((reviewed(r) && !isTime(r.verified_at)) ||
          (r.qualified_teams !== null && (!reviewed(r) || r.obligation_state !== 'required')))
        return fail('ข้อมูลทีมผ่านเกณฑ์ยังไม่ได้รับรองหรือไม่มีเวลาตรวจรับ');
      records.add(r.record_id);
    }
    const pairs = new Set();
    for (const r of input.public_readiness_aggregates) {
      const pair = r.cluster_id + '\u0000' + activityKey(r.activity_id,r.stage_scope);
      if (pairs.has(pair)) return fail('มีภาระกลุ่มและกิจกรรมซ้ำกัน');
      pairs.add(pair);
    }
    for (const i of input.public_issues) {
      if (!only(i,KEYS.issue) || !text(i.issue_id) || !ids.has(activityKey(i.activity_id,i.stage_scope)) ||
          (i.cluster_id !== null && !groups.has(i.cluster_id)) || !text(i.title) ||
          !['open','resolved'].includes(i.state) || !text(i.source_reference) || issues.has(i.issue_id))
        return fail('ข้อมูลประเด็นติดตามไม่ครบหรือซ้ำ');
      issues.add(i.issue_id);
    }
    return {ok:true,reason:null};
  }
  const applicable = r => r.obligation_state === 'required';
  const reviewed = r => ['verified','locked'].includes(r.verification_state);
  const submitted = r => ['submitted'].includes(r.submission_state);
  const countOrUnknown = (complete,number) => complete ? number : null;
  function selectRows(data,filters) {
    return data.public_readiness_aggregates.filter(r=>
      (filters.cluster === 'all' || r.cluster_id === filters.cluster) &&
      (filters.activity === 'all' || r.activity_id === filters.activity) &&
      ((!filters.category || filters.category === 'all') || data.activity_catalog.some(a=>activityKey(a.activity_id,a.stage_scope)===activityKey(r.activity_id,r.stage_scope) && a.category===filters.category)) &&
      (filters.stage === 'all' || r.stage_scope === filters.stage) &&
      (filters.status === 'all' || r.submission_state === filters.status ||
       r.verification_state === filters.status || r.planning_state === filters.status));
  }
  function derive(data,filters={cluster:'all',category:'all',activity:'all',stage:'all',status:'all'}) {
    if (!validateSnapshot(data).ok) throw Error('unapproved public readiness input');
    const rows = selectRows(data,filters);
    const activities = data.activity_catalog.filter(a=>(filters.activity === 'all' || a.activity_id === filters.activity) && ((!filters.category || filters.category === 'all') || a.category === filters.category));
    const requireRows = rows.filter(applicable);
    const byGroup = new Map();
    requireRows.forEach(r => {if (!byGroup.has(r.cluster_id)) byGroup.set(r.cluster_id,[]);byGroup.get(r.cluster_id).push(r);});
    const allGroupSubmitted = [...byGroup.values()].filter(a=>a.every(submitted)).length;
    const coverage = data.coverage;
    const scoped = filters.cluster === 'all' && (!filters.category || filters.category === 'all') && filters.activity === 'all' &&
      filters.stage === 'all' && filters.status === 'all';
    // Partial feeds must NEVER present filtered counts as a complete official zero.
    const full = k => coverage[k] === 'complete';
    const openIssues = data.public_issues.filter(i=>i.state==='open' &&
      (filters.activity==='all' || i.activity_id===filters.activity) &&
      (filters.stage==='all' || i.stage_scope===filters.stage) &&
      ((!filters.category || filters.category==='all') || activities.some(a=>activityKey(a.activity_id,a.stage_scope)===activityKey(i.activity_id,i.stage_scope))) &&
      (filters.cluster==='all' || i.cluster_id===filters.cluster));
    return {
      rows, scoped, issues:openIssues, activities,
      kpis: {
        confirmedActivities:countOrUnknown(full('catalog') && scoped,activities.filter(a=>a.stage_scope==='district').length),
        requiredGroups:countOrUnknown(full('obligations') && scoped,byGroup.size),
        submittedGroups:countOrUnknown(full('obligations') && scoped,allGroupSubmitted),
        verifiedRecords:countOrUnknown(full('obligations') && scoped,requireRows.filter(reviewed).length),
        qualifiedTeams:countOrUnknown(full('teams') && full('obligations') && scoped &&
          requireRows.every(r=>r.qualified_teams !== null),
          requireRows.reduce((n,r)=>n+(r.qualified_teams ?? 0),0)),
        openIssues:countOrUnknown(full('issues') && scoped,openIssues.length)
      }
    };
  }
  const num = value => value === null ? UNKNOWN : value.toLocaleString('th-TH');
  const fmtDate = value => value ? new Date(value).toLocaleString('th-TH',
    {dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Bangkok'}) : 'ยังไม่มีข้อมูลยืนยัน';
  const state = r => r.verification_state && r.verification_state!=='not_reviewed' ?
    LABEL[r.verification_state] : LABEL[r.submission_state || r.planning_state] || 'ยังไม่มีข้อมูลยืนยัน';
  const option = (value,label) => '<option value="'+escapeHTML(value)+'">'+escapeHTML(label)+'</option>';
  function makeTemplate() {
    const tiles = [
      ['confirmedActivities','รายการแข่งขันยืนยันจัด','รายการย่อยระดับเขตที่อนุมัติ'],
      ['requiredGroups','กลุ่มที่ต้องส่งตัวแทน','นับเฉพาะกลุ่มและกิจกรรมที่ต้องส่งตัวแทนตามเกณฑ์'],
      ['submittedGroups','กลุ่มที่ส่งข้อมูลครบแล้ว','ต้องส่งครบทุกกิจกรรมที่รับผิดชอบ'],
      ['verifiedRecords','ข้อมูลที่เขตตรวจแล้ว','นับแต่ละกิจกรรมของแต่ละกลุ่มที่ตรวจแล้ว'],
      ['qualifiedTeams','ทีมที่ได้รับสิทธิ์แข่งระดับเขต','นับเฉพาะทีมที่เขตรับรองแล้ว'],
      ['openIssues','ประเด็นที่ต้องติดตาม','เฉพาะประเด็นที่อนุมัติให้เผยแพร่']
    ];
    return '<div class="ia3-head"><span class="ia-eyebrow">IA-3 · ความพร้อมครั้งที่ 74</span><h2>ติดตามการเตรียมงานระดับเขต</h2>'+
      '<p>แยกข้อมูลการวางแผน การส่งตัวแทน และการตรวจรับออกจากกัน ไม่ใช่ระบบรับสมัครหรือรายงานผลการแข่งขัน</p></div>'+
      '<div class="ia3-source" id="ia3Source" role="status" aria-live="polite"></div>'+
      '<div class="ia3-kpis" id="ia3Kpis">'+tiles.map(([k,t,s])=>
        '<article class="ia3-kpi"><span>'+t+'</span><strong data-kpi="'+k+'">—</strong><small>'+s+'</small><em class="ia3-kpi-source" data-kpi-source="'+k+'">แหล่งข้อมูล: — · ยืนยัน: — · เวลา: —</em></article>').join('')+'</div>'+
      '<div class="ia3-section-head"><h3>ความพร้อมรายกลุ่มเครือข่าย</h3><small>แสดงข้อมูลเฉพาะที่อนุมัติเผยแพร่</small></div>'+
      '<div class="ia3-filters" id="ia3Filters">'+
      '<label>กลุ่มเครือข่าย<select id="ia3Cluster"><option value="all">ทุกกลุ่ม</option></select></label>'+
      '<label>หมวดหมู่<select id="ia3Category"><option value="all">ทุกหมวด</option></select></label>'+ 
      '<label>กิจกรรม<select id="ia3Activity"><option value="all">ทุกกิจกรรม</option></select></label>'+
      '<label>ระดับการแข่งขัน<select id="ia3Stage">'+option('all','ทุกระดับ')+option('district','ระดับเขต')+option('cluster','ระดับกลุ่ม')+'</select></label>'+
      '<label>สถานะข้อมูล<select id="ia3Status">'+option('all','ทุกสถานะ')+
         [...new Set([...PLANNING,...SUBMISSION,...REVIEW])].map(v=>option(v,LABEL[v])).join('')+'</select></label></div>'+
      '<div id="ia3Result" class="ia3-result" role="status" aria-live="polite"></div>'+
      '<div id="ia3Rows" class="ia3-rows"></div>'+
      '<div class="ia3-section-head"><h3>ประเด็นที่ต้องติดตาม</h3></div>'+
      '<div id="ia3Issues" class="ia3-issues"></div>'+
      '<div class="ia3-section-head"><h3>กำหนดการสำหรับวางแผน</h3></div>'+
      '<div class="ia3-schedule"><p><b>4 ธ.ค. 2569</b> · กำหนดส่งข้อมูลตัวแทนจากกลุ่มสู่เขต ไม่ใช่วันปิดรับสมัครทุกกิจกรรม</p>'+
      '<p><b>21–24 ธ.ค. 2569</b> · ช่วงแข่งขันระดับเขตเบื้องต้น รอประกาศยืนยันจริง</p></div>'+
      '<p class="ia3-caution">แหล่งอ้างอิง: ระบบแข่งขันหลัก AcademicCompetitionManager (ยังไม่มีชุดเผยแพร่ที่อนุมัติ) · ข้อมูลย้อนหลังครั้งที่ 73 ไม่ใช่ความพร้อมครั้งที่ 74</p>';
  }
  function mount(args) {
    if (typeof document === 'undefined') return false;
    const el = document.getElementById(args && args.rootId || 'ia3Root');
    if (!el) return false;
    el.innerHTML = makeTemplate();
    const pick = id => document.getElementById(id);
    const filters = {cluster:'all',category:'all',activity:'all',stage:'all',status:'all'};
    const snap = args && args.snapshot || null;
    const validation = snap ? validateSnapshot(snap) : null;
    const approved = validation && validation.ok;
    const source = pick('ia3Source'), rows = pick('ia3Rows'), issues = pick('ia3Issues');
    if (approved) {
      pick('ia3Cluster').innerHTML = option('all','ทุกกลุ่ม')+
        snap.clusters.map(g=>option(g.cluster_id,g.label)).join('');
      pick('ia3Category').innerHTML = option('all','ทุกหมวด')+
        [...new Set(snap.activity_catalog.map(a=>a.category))].sort((a,b)=>a.localeCompare(b,'th'))
          .map(a=>option(a,a)).join('');
      pick('ia3Activity').innerHTML = option('all','ทุกกิจกรรม')+
        [...new Map(snap.activity_catalog.map(a=>[a.activity_id,a.title])).entries()].map(([id,title])=>option(id,title)).join('');
    }
    function draw() {
      const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
      if (!approved) {
        source.textContent = snap ?
          'ข้อผิดพลาดข้อมูล: ชุดเผยแพร่ไม่ผ่านการตรวจสอบ ('+validation.reason+')' :
          (offline?'ออฟไลน์ · ':'')+'ยังไม่มีข้อมูลการส่งงานและความพร้อมครั้งที่ 74 ที่เขตรับรองให้แสดง · วันที่อัปเดต: —';
        rows.innerHTML = '<div class="ia3-empty"><b>ยังไม่มีข้อมูลความพร้อมที่ยืนยันแล้ว</b><p>ข้อมูลกลุ่มที่ส่งแล้ว การตรวจรับ และยอดทีมจะแสดงเมื่อมีชุดข้อมูลสาธารณะที่ได้รับอนุมัติเท่านั้น ไม่ใช้สถิติครั้งที่ 73 แทน</p></div>';
        issues.innerHTML = '<div class="ia3-empty"><b>ยังไม่มีข้อมูลประเด็นที่เผยแพร่ได้</b><p>ไม่ถือว่าปัญหาเป็นศูนย์จนกว่าจะตรวจสอบข้อมูลครบ</p></div>';
        pick('ia3Result').textContent='ยังไม่มีข้อมูลที่เขตยืนยัน';
        el.querySelectorAll('[data-kpi]').forEach(x=>x.textContent=UNKNOWN);
        el.querySelectorAll('[data-kpi-source]').forEach(x=>x.textContent='ข้อมูลจาก: ยังไม่ประกาศ · วันที่ตรวจสอบ: —');
        el.querySelectorAll('select').forEach(x=>x.disabled=true);
        return;
      }
      source.textContent = (offline?'ออฟไลน์ · ภาพข้อมูลที่โหลดไว้ | ':'')+
        'เผยแพร่แล้ว · รหัสเผยแพร่ '+snap.publication_id+' · แหล่ง '+snap.source_system+
        ' / '+snap.source_reference+' · ข้อมูล ณ '+fmtDate(snap.source_as_of)+
        ' · เผยแพร่ '+fmtDate(snap.published_at)+
        (Object.values(snap.coverage).some(x=>x!=='complete')?' · บางส่วนยังไม่ครบ':'');
      const model=derive(snap,filters);
      Object.entries(model.kpis).forEach(([k,v])=> {
        const element=el.querySelector('[data-kpi="'+k+'"]');
        if (element) element.textContent=num(v);
        const foot=el.querySelector('[data-kpi-source="'+k+'"]');
        if (foot) foot.textContent='แหล่ง: '+snap.source_system+' · สถานะ: เผยแพร่ · ณ '+fmtDate(snap.source_as_of);
      });
      pick('ia3Result').textContent = 'รายการที่ตรงตัวกรอง '+model.rows.length.toLocaleString('th-TH')+' รายการ (ข้อมูลที่เผยแพร่)';
      if (!model.rows.length) {
        rows.innerHTML='<div class="ia3-empty"><b>ไม่มีรายการในตัวกรองนี้</b><p>ไม่ใช่หลักฐานว่ากลุ่มหรือกิจกรรมไม่มีหน้าที่ส่งตัวแทน โปรดตรวจขอบเขตชุดข้อมูล</p></div>';
      } else {
        const names=new Map(snap.clusters.map(g=>[g.cluster_id,g.label]));
        const acts=new Map(snap.activity_catalog.map(a=>[activityKey(a.activity_id,a.stage_scope),a]));
        const values=model.rows.map(r=>{
          const a=acts.get(activityKey(r.activity_id,r.stage_scope));
          return {group:escapeHTML(names.get(r.cluster_id)),activity:escapeHTML(a.title),
            stage:escapeHTML(r.stage_scope==='district'?'เขตพื้นที่':'กลุ่มเครือข่าย'),
            policy:escapeHTML(LABEL[a.competition_mode]),planning:escapeHTML(LABEL[r.planning_state]||'ยังไม่มีข้อมูลยืนยัน'),submission:escapeHTML(LABEL[r.submission_state]||'ยังไม่มีข้อมูลยืนยัน'),
            review:escapeHTML(LABEL[r.verification_state]||'ยังไม่มีข้อมูลยืนยัน'),
            qualification:escapeHTML(r.obligation_state==='required'?'ต้องส่งตัวแทน':'ไม่ต้องส่งตัวแทนตามข้อมูลที่รับรอง'),
            teams:num(r.qualified_teams),date:escapeHTML(fmtDate(r.source_as_of))};
        });
        rows.innerHTML='<div class="ia3-table-wrap"><table class="ia3-table"><thead><tr>'+
          ['กลุ่มเครือข่าย','กิจกรรม','ระดับ','นโยบาย','ต้องส่งตัวแทนหรือไม่','การเตรียม','การส่ง','การตรวจรับ','ทีมผ่านเกณฑ์','ข้อมูล ณ'].map(s=>'<th>'+s+'</th>').join('')+
          '</tr></thead><tbody>'+values.map(v=>'<tr>'+[v.group,v.activity,v.stage,v.policy,v.qualification,v.planning,v.submission,v.review,v.teams,v.date].map(s=>'<td>'+s+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>'+
          '<div class="ia3-mobile-rows">'+values.map(v=>'<article class="ia3-row-card"><h4>'+v.group+'</h4>'+
          '<p>'+v.activity+'</p><dl><div><dt>ระดับ</dt><dd>'+v.stage+'</dd></div><div><dt>นโยบาย</dt><dd>'+v.policy+'</dd></div>'+
          '<div><dt>ภาระ</dt><dd>'+v.qualification+'</dd></div>'+
          '<div><dt>การเตรียม</dt><dd>'+v.planning+'</dd></div><div><dt>ส่งข้อมูล</dt><dd>'+v.submission+'</dd></div><div><dt>การตรวจรับ</dt><dd>'+v.review+'</dd></div>'+
          '<div><dt>ทีมผ่านเกณฑ์</dt><dd>'+v.teams+'</dd></div><div><dt>ข้อมูล ณ</dt><dd>'+v.date+'</dd></div></dl></article>').join('')+'</div>';
      }
      issues.innerHTML=model.issues.length?'<ul>'+model.issues.map(i=>'<li><b>'+escapeHTML(i.title)+
        '</b><small>กิจกรรม '+escapeHTML(i.activity_id)+' · ระดับ '+escapeHTML(i.stage_scope==='district'?'เขตพื้นที่':'กลุ่มเครือข่าย')+' · แหล่ง '+escapeHTML(i.source_reference)+'</small></li>').join('')+'</ul>':
        '<div class="ia3-empty"><b>ไม่มีประเด็นที่เผยแพร่ในตัวกรองนี้</b><p>'+
        (snap.coverage.issues==='complete'?'ข้อมูลส่วนนี้ได้รับการตรวจครบแล้ว':'ข้อมูลยังไม่ครบ จึงยังบอกไม่ได้ว่าไม่มีเรื่องต้องติดตาม')+'</p></div>';
    }
    ['Cluster','Category','Activity','Stage','Status'].forEach(name=>{
      pick('ia3'+name).addEventListener('change',e=>{filters[name.toLowerCase()]=e.target.value;draw();});
    });
    if (typeof window !== 'undefined') {
      window.addEventListener('online',draw);
      window.addEventListener('offline',draw);
    }
    draw();
    return true;
  }
  return {validateSnapshot,derive,selectRows,mount,LABEL};
});
