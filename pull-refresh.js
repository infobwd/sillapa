/* Pull to refresh on touch devices. Native browser pull-to-refresh still works where provided.
 * Only arms at document top; ignore forms, dialogs, or horizontal gestures. */
(() => {
  'use strict';
  if (!('ontouchstart' in window || navigator.maxTouchPoints > 0)) return;
  const hint = document.getElementById('pullRefreshHint');
  if (!hint) return;
  const max = 122, threshold = 85;
  let startY = 0, startX = 0, distance = 0, armed = false, active = false, refreshing = false;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reset = () => {
    armed = false; active = false; distance = 0;
    hint.classList.remove('visible', 'ready');
    hint.style.removeProperty('--pull');
  };
  document.addEventListener('touchstart', event => {
    if (refreshing || event.touches.length !== 1) return;
    if (window.scrollY > 2 || document.body.style.overflow === 'hidden') return;
    if (event.target.closest('input,textarea,select,button,a,.sheet,.scrim,.nav')) return;
    armed = true; active = false; distance = 0;
    startX = event.touches[0].clientX; startY = event.touches[0].clientY;
  }, {passive:true});
  document.addEventListener('touchmove', event => {
    if (!armed || refreshing || event.touches.length !== 1) return;
    const x = event.touches[0].clientX - startX;
    const y = event.touches[0].clientY - startY;
    if (y < 0 || Math.abs(x) > Math.abs(y) * 0.65 || window.scrollY > 2) { reset(); return; }
    if (y < 14) return;
    active = true;
    distance = Math.min(y * 0.67, max);
    hint.classList.add('visible');
    hint.classList.toggle('ready', distance >= threshold);
    hint.style.setProperty('--pull', Math.round(Math.min(1,distance/threshold)));
    hint.querySelector('span').textContent = distance >= threshold ? 'ปล่อยเพื่อรีเฟรชข้อมูล' : 'ดึงลงเพื่อรีเฟรช';
    if (event.cancelable) event.preventDefault();
  }, {passive:false});
  document.addEventListener('touchend', async () => {
    if (!armed) return;
    const reload = active && distance >= threshold;
    reset();
    if (!reload || refreshing) return;
    refreshing = true;
    hint.classList.add('visible','ready');
    hint.querySelector('span').textContent = 'กำลังตรวจสอบข้อมูลล่าสุด…';
    // The service worker uses network-first navigation: online = fresh; offline = saved snapshot.
    try { if (navigator.serviceWorker) { const reg = await navigator.serviceWorker.getRegistration('./'); await reg?.update(); } }
    catch (_) {}
    window.location.reload();
  }, {passive:true});
  document.addEventListener('touchcancel', reset, {passive:true});
  window.addEventListener('pagehide', reset);
})();
