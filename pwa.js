/* Sillapa PWA: install recommendation, manual iOS guidance, SW and update notice. */
(() => {
  'use strict';
  const card = document.getElementById('pwaInstallCard');
  const button = document.getElementById('pwaInstallBtn');
  const dismiss = document.getElementById('pwaInstallDismiss');
  const help = document.getElementById('pwaInstallHelp');
  const footer = document.getElementById('pwaInstallFooter');
  const update = document.getElementById('pwaUpdateNotice');
  if (!card || !button || !dismiss || !help || !footer || !update) return;

  let installPrompt = null;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const isMobile = () => matchMedia('(max-width:1023px)').matches || ios;
  const isDismissed = () => {
    try { return Date.now() < Number(localStorage.getItem('sillapaInstallHiddenUntil') || 0); }
    catch (_) { return false; }
  };
  function paint(force = false) {
    if (standalone()) {
      card.hidden = true;
      footer.hidden = true;
      return;
    }
    if (!force && isDismissed()) {
      card.hidden = true;
      return;
    }
    card.hidden = !force && !isMobile() && !installPrompt;
    button.textContent = installPrompt ? 'ติดตั้งแอป' : 'ดูวิธีติดตั้ง';
  }
  const instructions = ios
    ? 'iPhone/iPad: แตะเมนูแชร์ (Share) ของเบราว์เซอร์ แล้วเลือก “เพิ่มไปยังหน้าจอโฮม” (Add to Home Screen) และกด “เพิ่ม” หากไม่พบเมนู ให้เลื่อนรายการในหน้าแชร์'
    : /Android/i.test(navigator.userAgent)
      ? 'Android: แตะเมนู ⋮ ใน Chrome แล้วเลือก “ติดตั้งแอป” หรือ “เพิ่มไปยังหน้าจอหลัก”'
      : 'คอมพิวเตอร์: เปิดเว็บใน Chrome หรือ Edge แล้วเลือกไอคอนติดตั้งบนแถบที่อยู่ หรือเลือก “ติดตั้งแอป” ในเมนูเบราว์เซอร์';

  function showGuide() {
    paint(true);
    help.textContent = instructions;
    help.hidden = false;
    button.setAttribute('aria-expanded', 'true');
  }
  button.addEventListener('click', async () => {
    if (!installPrompt) {
      showGuide();
      return;
    }
    const event = installPrompt;
    installPrompt = null;
    try {
      await event.prompt(); // must be called synchronously from a user gesture, before any other awaits
      const choice = await event.userChoice;
      if (choice && choice.outcome === 'accepted') {
        card.hidden = true;
      } else {
        showGuide();
      }
    } catch (_) {
      showGuide();
    }
    button.textContent = 'ดูวิธีติดตั้ง';
  });
  footer.addEventListener('click', () => {
    showGuide();
    card.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });
  dismiss.addEventListener('click', () => {
    try { localStorage.setItem('sillapaInstallHiddenUntil', String(Date.now() + 14 * 86400000)); }
    catch (_) {}
    card.hidden = true;
    help.hidden = true;
    button.setAttribute('aria-expanded', 'false');
  });
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    paint();
  });
  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    card.hidden = true;
    footer.hidden = true;
  });
  paint();

  document.getElementById('pwaUpdateReload').addEventListener('click', () => location.reload());
  document.getElementById('pwaUpdateClose').addEventListener('click', () => { update.hidden = true; });

  if ('serviceWorker' in navigator && window.isSecureContext) {
    let hadController = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController) update.hidden = false; // not shown on first install
      hadController = true;
    });
    window.addEventListener('load', async () => {
      try {
        const reg = await navigator.serviceWorker.register('./sw.js', {
          scope: './',
          updateViaCache: 'none'
        });
        reg.update().catch(() => {});
      } catch (error) {
        console.warn('Sillapa: offline cache could not be registered', error);
      }
    }, { once: true });
  }
})();
