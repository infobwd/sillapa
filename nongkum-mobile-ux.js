/* NGK-MOBILE-UX-03: a back-to-top control that stays clear of the mobile nav.
   Does not change route, selected school, filters or page content. */
(function () {
  'use strict';
  const button = document.getElementById('ngk-back-to-top');
  const nav = document.querySelector('.mobile-bottom-nav');
  if (!button || !nav) return;

  const mobile = window.matchMedia('(max-width:1199px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let queued = false;

  function syncBottomOffset() {
    if (!mobile.matches) return;
    const height = nav.getBoundingClientRect().height;
    if (height > 0) {
      document.documentElement.style.setProperty('--ngk-bottom-nav-height', Math.ceil(height) + 'px');
    }
  }

  function updateVisibility() {
    queued = false;
    const scrollY = Math.max(window.scrollY || 0, document.scrollingElement?.scrollTop || 0);
    const threshold = Math.max(480, window.innerHeight * .75);
    const focusedInput = document.activeElement?.matches?.('input, textarea, select, [contenteditable="true"]');
    const dialogOpen = Boolean(document.querySelector('.main-info-dialog:not([hidden]), dialog[open], [role="dialog"]:not([hidden])'));
    const keyboardOpen = Boolean(window.visualViewport && window.visualViewport.height < window.innerHeight * .72);
    button.hidden = !mobile.matches || scrollY < threshold || focusedInput || dialogOpen || keyboardOpen;
  }

  function scheduleUpdate() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(updateVisibility);
  }

  function onResize() {
    syncBottomOffset();
    scheduleUpdate();
  }

  button.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    // Move keyboard/screen-reader focus to the page heading without changing navigation.
    const heading = document.querySelector('header h1');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll:true });
    }
    scheduleUpdate();
  });

  window.addEventListener('scroll', scheduleUpdate, { passive:true });
  window.addEventListener('resize', onResize, { passive:true });
  window.addEventListener('pageshow', onResize);
  document.addEventListener('focusin', scheduleUpdate);
  document.addEventListener('focusout', scheduleUpdate);
  if (mobile.addEventListener) mobile.addEventListener('change', onResize);
  else if (mobile.addListener) mobile.addListener(onResize);

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(onResize);
    observer.observe(nav);
  }
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', scheduleUpdate, { passive:true });
  }

  onResize();
})();
