/* Shared demo tooltips: auto-advance one at a time; hover/focus can interrupt */
(function () {
  let tip = document.getElementById('site-tip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'site-tip';
    tip.setAttribute('role', 'tooltip');
    document.body.appendChild(tip);
  }

  const AUTO_MS = 4200;
  const RESUME_MS = 5200;
  const START_DELAY = 900;

  let active = null;
  let hideTimer = null;
  let autoTimer = null;
  let resumeTimer = null;
  let autoIndex = -1;
  let manual = false;
  let paused = false;
  let anchors = [];

  function visible(el) {
    if (!el || !el.isConnected) return false;
    const st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden' || st.opacity === '0') return false;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const vw = window.innerWidth || document.documentElement.clientWidth;
    return r.bottom > 40 && r.top < vh - 40 && r.right > 0 && r.left < vw;
  }

  function collect() {
    anchors = [...document.querySelectorAll('[data-tip]')].filter((el) => {
      // Prefer controls/labels visitors need; skip decorative empties
      return (el.getAttribute('data-tip') || '').trim().length > 0;
    });
  }

  function clearHighlight() {
    document.querySelectorAll('.tip-current').forEach((el) => el.classList.remove('tip-current'));
  }

  function place(el) {
    const text = el.getAttribute('data-tip') || '';
    const title = el.getAttribute('data-tip-title') || '';
    tip.innerHTML = (title ? '<strong>' + title + '</strong>' : '') + text;
    tip.classList.add('show');
    clearHighlight();
    el.classList.add('tip-current');

    const r = el.getBoundingClientRect();
    const tw = tip.offsetWidth || 240;
    const th = tip.offsetHeight || 60;
    let left = r.left + r.width / 2 - tw / 2;
    left = Math.max(10, Math.min(left, window.innerWidth - tw - 10));
    let top = r.top - th - 12;
    if (top < 8) top = r.bottom + 12;
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  }

  function show(el, fromManual) {
    if (!el) return;
    clearTimeout(hideTimer);
    active = el;
    if (fromManual) {
      manual = true;
      stopAuto();
      scheduleResume();
    }
    place(el);
  }

  function hideNow() {
    tip.classList.remove('show');
    clearHighlight();
    active = null;
  }

  function hide() {
    hideTimer = setTimeout(() => {
      if (manual) {
        hideNow();
        manual = false;
        scheduleResume();
      }
    }, 120);
  }

  function stopAuto() {
    clearTimeout(autoTimer);
    autoTimer = null;
  }

  function scheduleResume() {
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      if (!paused) startAuto(true);
    }, RESUME_MS);
  }

  function nextAuto() {
    if (paused || manual || document.hidden) return;
    collect();
    if (!anchors.length) return;

    let tries = anchors.length;
    let el = null;
    while (tries--) {
      autoIndex = (autoIndex + 1) % anchors.length;
      const candidate = anchors[autoIndex];
      if (visible(candidate)) {
        el = candidate;
        break;
      }
    }
    if (!el) {
      autoTimer = setTimeout(nextAuto, AUTO_MS);
      return;
    }

    // Soft-scroll if tip target is near edges
    const r = el.getBoundingClientRect();
    if (r.top < 70 || r.bottom > window.innerHeight - 70) {
      try {
        el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
      } catch (_) {}
    }

    show(el, false);
    autoTimer = setTimeout(nextAuto, AUTO_MS);
  }

  function startAuto(immediate) {
    stopAuto();
    if (paused || document.hidden) return;
    autoTimer = setTimeout(nextAuto, immediate ? 200 : START_DELAY);
  }

  function bind(el) {
    if (el.dataset.tipBound) return;
    el.dataset.tipBound = '1';
    el.classList.add('tip-anchor');
    if (!el.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/i.test(el.tagName)) {
      el.setAttribute('tabindex', '0');
    }
    el.addEventListener('mouseenter', () => show(el, true));
    el.addEventListener('mouseleave', hide);
    el.addEventListener('focus', () => show(el, true));
    el.addEventListener('blur', hide);
    el.addEventListener('click', (e) => {
      // Manual pin on tap/click; still only one tip
      if (active === el && tip.classList.contains('show') && manual) {
        hide();
      } else {
        e.stopPropagation();
        show(el, true);
      }
    });
  }

  function scan(root) {
    (root || document).querySelectorAll('[data-tip]').forEach(bind);
    collect();
  }

  document.addEventListener('click', (e) => {
    if (manual && active && !e.target.closest('[data-tip]') && e.target !== tip) {
      hide();
    }
  });
  window.addEventListener('scroll', () => { if (active) place(active); }, true);
  window.addEventListener('resize', () => { if (active) place(active); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAuto();
    else if (!manual && !paused) startAuto(true);
  });

  function init() {
    scan();
    startAuto(false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CoTips = {
    scan: function (root) { scan(root); },
    show: function (el) { show(el, true); },
    hide: hideNow,
    pause: function () { paused = true; stopAuto(); hideNow(); },
    resume: function () { paused = false; startAuto(true); }
  };
})();
