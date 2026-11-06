/* NGK-SHARE-74-01: school-level LINE review links, public/read-only. */
(function (root) {
  'use strict';
  const doc = root.document;
  const registry = root.NONGKUM_SCHOOLS;
  const school = doc && doc.getElementById('audit-school');
  const panel = doc && doc.getElementById('school-export');
  const search = doc && doc.getElementById('audit-search');
  const openSchool = doc && doc.getElementById('choose-school');
  if (!registry || !school || !panel || !search || !openSchool) return;

  const normalizeId = value => {
    const id = String(value || '');
    return /^\d{8}$/.test(id) && registry.schoolById(id) ? id : null;
  };
  const schoolId = () => normalizeId(registry.resolveId(school.value));
  const rows = Array.from(doc.querySelectorAll('#complete-field-plan .venue-table tbody tr'));
  function totalFor(id) {
    return rows.filter(row => Array.from(row.querySelectorAll('td:nth-child(6) .venue-school'))
      .some(label => registry.resolveId(label.dataset.schoolId || label.textContent.trim()) === id)).length;
  }
  function schoolUrl(id) {
    const url = new URL('nongkum.html', root.location.href);
    url.searchParams.set('school', id);
    url.hash = 'list';
    return url.toString();
  }
  function messageFor(id) {
    const label = 'โรงเรียน' + registry.displayName(id);
    return '📋 ตรวจสอบรายการแข่งขันศิลปหัตถกรรมนักเรียน ครั้งที่ 74\n' +
      '🏫 ' + label + '\n' +
      'ข้อมูลที่รวบรวมในระบบ ' + totalFor(id) + ' รายการ\n\n' +
      'กรุณาตรวจสอบว่ารายการครบถ้วน ไม่มีรายการเกิน และระดับชั้นถูกต้องหรือไม่\n' +
      'หากพบข้อผิดพลาดโปรดแจ้งผู้ประสานงาน\n\n' +
      '🔗 เปิดดูรายการทั้งหมดของโรงเรียน\n' + schoolUrl(id) + '\n\n' +
      'หมายเหตุ: ข้อมูลเพื่อเตรียมการแข่งขัน ไม่ใช่หลักฐานการสมัครหรือรายการที่รับรองแล้ว';
  }

  const wrap = doc.createElement('div');
  wrap.className = 'ngk-school-share';
  wrap.hidden = true;
  const actions = doc.createElement('div');
  actions.className = 'ngk-school-share-actions';
  const line = doc.createElement('a');
  line.className = 'ngk-school-share-line';
  line.textContent = 'แชร์ผ่าน LINE';
  line.href = '#';
  line.target = '_blank';
  line.rel = 'noopener noreferrer';
  const copy = doc.createElement('button');
  copy.className = 'ngk-school-share-copy';
  copy.type = 'button';
  copy.textContent = 'คัดลอกลิงก์';
  const status = doc.createElement('small');
  status.className = 'ngk-school-share-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  actions.append(line, copy);
  wrap.append(actions, status);
  const more = panel.querySelector('.school-export-more');
  panel.insertBefore(wrap, more || panel.firstChild);

  function refresh() {
    const id = schoolId();
    wrap.hidden = !id;
    status.textContent = '';
    line.href = id ? 'https://line.me/R/share?text=' + encodeURIComponent(messageFor(id)) : '#';
  }
  async function copyLink() {
    const id = schoolId();
    if (!id) {
      status.textContent = 'กรุณาเลือกโรงเรียนก่อนคัดลอกลิงก์';
      return;
    }
    const url = schoolUrl(id);
    try {
      if (!root.navigator || !root.navigator.clipboard || !root.navigator.clipboard.writeText) throw new Error('clipboard-unavailable');
      await root.navigator.clipboard.writeText(url);
      status.textContent = 'คัดลอกลิงก์แล้ว นำไปวางใน LINE ได้ทันที';
    } catch (_) {
      const field = doc.createElement('textarea');
      field.value = url;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      doc.body.append(field);
      field.select();
      let worked = false;
      try { worked = Boolean(doc.execCommand && doc.execCommand('copy')); } catch (_) {}
      field.remove();
      status.textContent = worked ? 'คัดลอกลิงก์แล้ว นำไปวางใน LINE ได้ทันที' :
        'คัดลอกไม่ได้ กรุณาใช้ปุ่มแชร์ผ่าน LINE แทน';
    }
  }
  copy.addEventListener('click', copyLink);
  school.addEventListener('change', refresh);
  root.addEventListener('pageshow', refresh);
  refresh();

  // Deep-link selection is restricted to public registry IDs, never arbitrary names.
  const requested = new URLSearchParams(root.location.search).get('school');
  const requestedId = normalizeId(requested);
  if (requestedId) {
    const option = Array.from(school.options).find(item => registry.resolveId(item.value) === requestedId);
    if (option) {
      school.value = option.value;
      search.value = ''; // A shared link always opens the whole school's list.
      school.dispatchEvent(new root.Event('change', { bubbles: true }));
      openSchool.click(); // Reuse the existing school-mode render and navigation.
    }
  }
})(window);
