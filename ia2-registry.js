/* IA-2 — Public planning registry, read-only, no approved round-74 entry IDs.
 * Inputs: original NX draft and archived 70 catalog. It never writes to an API.
 * Future official 74 records require an independently authorized public export. */
(function (global) {
  'use strict';
  const LEVELS = ['ปฐมวัย','ป.1-ป.3','ป.4-ป.6','ป.1-ป.6','ป.1-ม.3','ม.1-ม.3'];
  const gradeFromTitle = title => {
    const match = String(title || '').match(/ปฐมวัย|ป\.1-ป\.3|ป\.4-ป\.6|ป\.1-ป\.6|ป\.1-ม\.3|ม\.1-ม\.3/);
    return match ? match[0] : null;
  };
  const clean = value => String(value == null ? '' : value).normalize('NFC').toLocaleLowerCase('th-TH').trim();
  const escapeHTML = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[ch]));
  const csvField = value => {
    let s = String(value == null ? '' : value);
    if (/^[\s]*[=+@\-]/.test(s)) s = "'" + s; // prevent formula evaluation on spreadsheet open
    return '"' + s.replace(/"/g, '""') + '"';
  };
  const saveCSV = (filename, table) => {
    const csv = '\ufeff' + table.map(row => row.map(csvField).join(',')).join('\r\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };
  const id2 = n => String(n + 1).padStart(2,'0');

  function buildRegistry(draftGroups, round70) {
    if (!Array.isArray(draftGroups)) throw new Error('Missing round-74 planning draft');
    const historical = round70 && round70.families ? round70.families : {};
    const families = [];
    draftGroups.forEach((group, gi) => (group.i || []).forEach((activity, ai) => {
      const key = 'draft-F' + id2(gi) + '-A' + id2(ai);
      const prior73 = Array.isArray(activity.a) ? activity.a : [];
      const by70 = !prior73.length && Array.isArray(historical[activity.t]) ? historical[activity.t] : [];
      const from = prior73.length ? '73' : by70.length ? '70' : 'unresolved';
      const events = from === '70'
        ? by70.map((source, ix) => ({
            historyCycle:'70', sourceId:String(source.id), title:String(source.title),
            grade:source.level || null, sourceRowKey:'70-' + source.id,
            mapping:'family_title_reference', ordinal:ix + 1
          }))
        : from === '73'
        ? prior73.map((title, ix) => ({
            historyCycle:'73', sourceId:null, title:String(title),
            grade:gradeFromTitle(title), sourceRowKey:'73-' + key + '-' + id2(ix),
            mapping:'draft_to_historical_title', ordinal:ix + 1
          }))
        : [];
      families.push({
        key, groupIndex:gi, groupName:String(group.g), draftTitle:String(activity.t),
        draftSubtypes:(Array.isArray(activity.s) ? activity.s : []).map(String),
        historyCycle:from, sourceState:from === 'unresolved' ? 'unmatched' : 'historical_reference',
        draft74Status:'draft', official74ActivityId:null, approvedStage74:null,
        activityPolicy74:null, representativeQuota74:null, mappingApproved74:false,
        events, grades:[...new Set(events.map(row => row.grade).filter(Boolean))],
        searchText:clean([group.g,activity.t,...(activity.s || []),...events.flatMap(e=>[e.title,e.grade,e.sourceId])].join(' '))
      });
    }));
    return families;
  }
  const defaultFilters = () => ({query:'',group:'all',grade:'all',source:'all',status:'all',stage:'all'});
  function filteredFamilies(rows, filter) {
    const f = {...defaultFilters(),...filter};
    return rows.filter(fam => {
      if (f.group !== 'all' && String(fam.groupIndex) !== String(f.group)) return false;
      if (f.source !== 'all' && fam.historyCycle !== f.source) return false;
      if (f.status === 'confirmed') return false; // no approved 74 source is connected
      if (f.stage === 'cluster' || f.stage === 'district') return false; // all stage scopes unknown
      if (f.grade !== 'all' && !fam.grades.includes(f.grade)) return false;
      if (f.query && !fam.searchText.includes(clean(f.query))) return false;
      return true;
    });
  }
  function visibleEvents(family, filter = {}) {
    const grade=filter.grade || 'all',query=clean(filter.query || '');
    const familyMatch=!query || clean([family.groupName,family.draftTitle,...family.draftSubtypes].join(' ')).includes(query);
    return family.events.filter(e =>
      (grade==='all' || e.grade===grade) &&
      (familyMatch || clean([e.title,e.grade,e.sourceId].join(' ')).includes(query))
    );
  }
  function exportRows(families, filter = {}) {
    const header = ['รหัสในแผน (ไม่ใช่รหัสรายการแข่งขันทางการ)','กลุ่มกิจกรรม','ชื่อกิจกรรมที่กำลังวางแผนสำหรับครั้งที่ 74',
      'สถานะครั้งที่ 74','รหัสรายการครั้งที่ 74','ระดับการแข่งขัน 74','โหมดรับสมัคร 74',
      'อ้างอิงการแข่งขันครั้งที่','รหัสรายการจากครั้งก่อน','ชื่อรายการย่อยจากต้นทาง','ระดับชั้นต้นทาง',
      'ประเภทรายการย่อย (ตามชื่อเดิม)','สถานะการเทียบรายการ','แหล่งข้อมูล','หมายเหตุ'];
    const out = [header];
    for (const family of families) {
      const source = family.historyCycle === '70' ? '70' : family.historyCycle === '73' ? '73' : 'ไม่พบรายการตรงตัว';
      const srcName = source === '70' ? 'ฐานรายการครั้งที่ 70 สพป.ร้อยเอ็ด เขต 3' :
        source === '73' ? 'ข้อมูลย้อนหลังการแข่งขันครั้งที่ 73 ใน Sillapa' : 'รอตรวจสอบรายการเดิม';
      const notes = family.historyCycle === 'unresolved'
        ? 'ไม่มีข้อมูลรายการย่อย/ระดับชั้นที่จับคู่ได้; ห้ามสมมติจากชื่อกลุ่ม'
        : 'ใช้ข้อมูลการแข่งขันครั้งก่อนเพื่อช่วยวางแผนเท่านั้น; ระดับชั้นและสิทธิ์แข่งขันครั้งที่ 74 รอประกาศ';
      const matched=visibleEvents(family,filter);
      const matches = matched.length ? matched : [{sourceId:null,title:'',grade:null}];
      matches.forEach(ev => out.push([
        family.key, family.groupName,family.draftTitle,'ร่าง — ยังไม่ยืนยัน',
        '', 'ยังไม่ประกาศ', 'ยังไม่ประกาศ',
        source,ev.sourceId || '',ev.title || '',ev.grade || '',
        ev.title || '',family.sourceState === 'unmatched' ? 'รอตรวจสอบ' : 'เทียบกับการแข่งขันครั้งก่อน (ยังไม่ยืนยันครั้งที่ 74)',
        srcName,notes
      ]));
    }
    return out;
  }
  const sourceLabel = family => family.historyCycle === '70' ? 'อ้างอิงครั้งที่ 70'
    : family.historyCycle === '73' ? 'อ้างอิงครั้งที่ 73' : 'รอตรวจสอบรายการเดิม';
  function familyHTML(family, expand, round70URL, filter = {}) {
    const title = escapeHTML(family.draftTitle), group = escapeHTML(family.groupName);
    const total = family.events.length,shown=visibleEvents(family,filter);
    const grades = family.grades.map(level => '<span class="ia2-grade">' + escapeHTML(level) + '</span>').join('');
    const visibleGrades = grades || '<span class="ia2-grade pending">ระดับชั้นรอตรวจสอบ</span>';
    const safeURL = typeof round70URL === 'string' && /^https:\/\/[^\s]+$/.test(round70URL) ? escapeHTML(round70URL) : null;
    const link = family.historyCycle === '70' && safeURL
      ? '<a href="' + safeURL + '" target="_blank" rel="noopener noreferrer" class="ia2-ref-link">ดูแหล่งอ้างอิงรายการครั้งที่ 70 ↗</a>'
      : family.historyCycle === '73'
      ? '<a href="#acts" class="ia2-ref-link">ดูฐานข้อมูลย้อนหลังครั้งที่ 73 ›</a>'
      : '<span class="ia2-unknown">ไม่มีรายการย่อยที่จับคู่ได้ตรงตัว ต้องตรวจสอบกับประกาศต้นทาง</span>';
    const rows = shown.map(e => '<li class="ia2-child">' +
      '<span class="ia2-child-grade">' + escapeHTML(e.grade || 'ไม่ระบุ') + '</span>' +
      '<span class="ia2-child-main"><b>' + escapeHTML(e.title) + '</b>' +
      '<small>' + (e.sourceId ? 'รหัสรายการครั้งที่ ' + escapeHTML(e.historyCycle) + ': ' + escapeHTML(e.sourceId)
      : 'ไม่มีรหัสรายการเดิมในข้อมูลนี้') + '</small></span></li>').join('');
    const records = shown.length ? '<ol class="ia2-child-list">' + rows + '</ol>'
      : '<div class="ia2-child-none">ยังไม่มีรายการย่อยที่ตรวจสอบได้ — อย่าตีความว่าไม่มีการแข่งขันหรือว่ามีทุกระดับชั้น</div>';
    return '<details class="ia2-family" data-key="' + escapeHTML(family.key) + '"' + (expand ? ' open' : '') + '>' +
      '<summary><span class="ia2-family-top"><span class="ia2-family-name">' + title + '</span>' +
      '<span class="ia2-status" title="สถานะรายการในร่าง ไม่ใช่การอนุมัติ">ร่าง 74</span></span>' +
      '<span class="ia2-family-meta">' + group + ' · ' + sourceLabel(family) +
      ' · ' + (total ? total + ' รายการย่อยอ้างอิง' + (shown.length!==total ? ' (แสดง '+shown.length+')' : '') : 'ยังไม่พบรายการย่อยตรงตัว') + '</span>' +
      '<span class="ia2-grades">' + visibleGrades + '</span>' +
      '<span class="ia2-hint">ดูข้อมูลรายการย่อยและที่มา <span aria-hidden="true">▾</span></span></summary>' +
      '<div class="ia2-family-detail"><div class="ia2-warning"><b>สถานะ: ร่างการแข่งขันครั้งที่ 74</b>' +
      ' ยังไม่มีรหัสกิจกรรม ระดับแข่งขัน เกณฑ์ หรือโควตาตัวแทนครั้งที่ 74 ที่ได้รับการยืนยัน</div>' +
      '<div class="ia2-family-ref"><b>รายการจากการแข่งขันครั้งก่อน:</b> ' + sourceLabel(family) +
      (family.draftSubtypes.length ? '<div>ชื่อประเภทย่อยในร่าง: ' + family.draftSubtypes.map(escapeHTML).join(' / ') + '</div>' : '') + '</div>' +
      records + '<div class="ia2-bottom-ref">' + link + '</div></div></details>';
  }
  function mount(opts) {
    const root = document.getElementById('ia2Root');
    if (!root) return {ok:false,reason:'Registry container not found'};
    const families = buildRegistry(opts.draftGroups,opts.round70);
    const unmatched = families.filter(f => f.historyCycle === 'unresolved');
    const counts = {
      families:families.length, mapped70:families.filter(f => f.historyCycle === '70').length,
      variants70:families.filter(f=>f.historyCycle==='70').reduce((n,f)=>n+f.events.length,0),
      mapped73:families.filter(f => f.historyCycle === '73').length,
      unresolved:unmatched.length
    };
    const selectGroup=root.querySelector('#ia2Group'),selectGrade=root.querySelector('#ia2Grade'),
      elSearch=root.querySelector('#ia2Search'),elSource=root.querySelector('#ia2Source'),
      elStatus=root.querySelector('#ia2Status'),elStage=root.querySelector('#ia2Stage'),
      elList=root.querySelector('#ia2List'),elCount=root.querySelector('#ia2Count'),
      elEmpty=root.querySelector('#ia2Empty'),elExport=root.querySelector('#ia2Export'),
      elReset=root.querySelector('#ia2Reset'),elExpand=root.querySelector('#ia2Expand'),
      elStats=root.querySelector('#ia2Stats');
    const required=[selectGroup,selectGrade,elSearch,elSource,elStatus,elStage,elList,elCount,elEmpty,elExport,elReset,elExpand,elStats];
    if(required.some(x=>!x))throw Error('IA-2 registry HTML contract mismatch');
    selectGroup.innerHTML='<option value="all">ทุกกลุ่มกิจกรรม</option>' +
      opts.draftGroups.map((g,i)=>'<option value="'+i+'">'+escapeHTML(g.g)+'</option>').join('');
    const levels=[...new Set(families.flatMap(f=>f.grades))].sort((a,b)=>{
      const i=LEVELS.indexOf(a),j=LEVELS.indexOf(b);
      return (i<0?99:i)-(j<0?99:j)||a.localeCompare(b,'th');
    });
    selectGrade.innerHTML='<option value="all">ทุกระดับชั้น (ข้อมูลย้อนหลัง)</option>' +
      levels.map(level=>'<option value="'+escapeHTML(level)+'">'+escapeHTML(level)+'</option>').join('');
    elStats.innerHTML='<div><b>'+counts.families+'</b><small>กลุ่มกิจกรรมในร่าง 74</small></div>' +
      '<div><b>'+counts.mapped70+'</b><small>กลุ่มอ้างอิงครั้งที่ 70</small></div>' +
      '<div><b>'+counts.variants70+'</b><small>รายการย่อยครั้งที่ 70</small></div>' +
      '<div><b>'+counts.unresolved+'</b><small>กลุ่มรอตรวจสอบแหล่งอ้างอิง</small></div>';
    let visible=families,expandAll=false;
    function filters(){
      return {query:elSearch.value,group:selectGroup.value,grade:selectGrade.value,
        source:elSource.value,status:elStatus.value,stage:elStage.value};
    }
    function render(){
      const f=filters();
      visible=filteredFamilies(families,f);
      elCount.textContent='พบ '+visible.length+' จาก '+families.length+' กลุ่มกิจกรรมในร่าง';
      const search=clean(f.query);
      elList.innerHTML=visible.map(fam=>familyHTML(fam,expandAll||f.grade!=='all'||
        Boolean(search && !clean(fam.draftTitle+' '+fam.groupName).includes(search)),
        opts.round70 && opts.round70.source,f)).join('');
      elEmpty.hidden=visible.length!==0;
      if(!visible.length){
        elEmpty.textContent=(f.stage==='district'||f.stage==='cluster'||f.status==='confirmed')
          ? 'ยังไม่มีประกาศยืนยันรายการแข่งขันครั้งที่ 74 จึงยังแสดงรายการในเงื่อนไขนี้ไม่ได้'
          : 'ไม่พบรายการตามที่เลือก ลองล้างตัวกรองหรือค้นหาด้วยชื่อกิจกรรมและระดับชั้น';
      }
      elExport.disabled=visible.length===0;
      elExpand.disabled=visible.length===0;
      elExpand.textContent=expandAll?'ย่อรายการย่อยทั้งหมด':'ขยายรายการย่อยทั้งหมด';
    }
    [selectGroup,selectGrade,elSource,elStatus,elStage].forEach(el=>el.addEventListener('change',render));
    elSearch.addEventListener('input',render);
    elReset.addEventListener('click',()=>{
      elSearch.value='';selectGroup.value='all';selectGrade.value='all';
      elSource.value='all';elStatus.value='all';elStage.value='all';expandAll=false;render();
      elSearch.focus({preventScroll:true});
    });
    elExpand.addEventListener('click',()=>{expandAll=!expandAll;render()});
    elExport.addEventListener('click',()=>{
      if(!visible.length)return;
      saveCSV('Sillapa74_ทะเบียนร่าง_รายการอ้างอิง.csv',exportRows(visible,filters()));
    });
    render();
    root.dataset.ready='true';
    return {ok:true,families,counts,filter:filteredFamilies,exportRows};
  }
  global.SILLAPA_IA2={buildRegistry,filteredFamilies,exportRows,mount};
})(window);
