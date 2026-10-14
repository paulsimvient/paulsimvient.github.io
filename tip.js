/* Shared demo tooltips: one tip at a time; step changes force a live focus tip */
(function () {
  let tip = document.getElementById('site-tip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'site-tip';
    tip.setAttribute('role', 'tooltip');
    document.body.appendChild(tip);
  }

  const AUTO_MS = 5200;
  const RESUME_MS = 6000;
  const START_DELAY = 1400;
  const STEP_HOLD_MS = 3800;
  const TARGET_HOLD_MS = 3200;

  let active = null;
  let hideTimer = null;
  let autoTimer = null;
  let resumeTimer = null;
  let stepTimer = null;
  let autoIndex = -1;
  let manual = false;
  let stepLocked = false;
  let paused = false;
  let anchors = [];

  function visible(el) {
    if (!el || !el.isConnected) return false;
    const st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const vw = window.innerWidth || document.documentElement.clientWidth;
    return r.bottom > 40 && r.top < vh - 40 && r.right > 0 && r.left < vw;
  }

  function collect() {
    anchors = [...document.querySelectorAll('[data-tip]')].filter((el) =>
      (el.getAttribute('data-tip') || '').trim().length > 0
    );
  }

  function clearHighlight() {
    document.querySelectorAll('.tip-current').forEach((el) => el.classList.remove('tip-current'));
  }

  function contentFor(el, mode) {
    const title = el.getAttribute('data-tip-title') || '';
    const focus = (el.getAttribute('data-focus') || '').trim();
    const tipText = (el.getAttribute('data-tip') || '').trim();
    let body = tipText;
    let head = title;
    if (mode === 'focus' && focus) {
      body = focus;
      head = title ? ('Focus · ' + title) : 'Focus now';
    }
    return { head, body };
  }

  function place(el, mode) {
    const { head, body } = contentFor(el, mode || 'tip');
    tip.innerHTML = (head ? '<strong>' + head + '</strong>' : '') + body;
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

  function show(el, fromManual, mode) {
    if (!el) return;
    clearTimeout(hideTimer);
    active = el;
    if (fromManual) {
      manual = true;
      stepLocked = false;
      stopAuto();
      clearTimeout(stepTimer);
      scheduleResume();
    }
    place(el, mode || 'tip');
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
      if (!paused && !stepLocked) startAuto(true);
    }, RESUME_MS);
  }

  function nextAuto() {
    if (paused || manual || stepLocked || document.hidden) return;
    collect();
    // Prefer non-step chrome when idle; skip active step buttons that already had focus tips
    const pool = anchors.filter((el) => !el.classList.contains('phase') && !el.matches('.phase-bar button'));
    const list = pool.length ? pool : anchors;
    if (!list.length) return;

    let tries = list.length;
    let el = null;
    while (tries--) {
      autoIndex = (autoIndex + 1) % list.length;
      const candidate = list[autoIndex];
      if (visible(candidate)) {
        el = candidate;
        break;
      }
    }
    if (!el) {
      autoTimer = setTimeout(nextAuto, AUTO_MS);
      return;
    }
    show(el, false, 'tip');
    autoTimer = setTimeout(nextAuto, AUTO_MS);
  }

  function startAuto(immediate) {
    stopAuto();
    if (paused || stepLocked || document.hidden) return;
    autoTimer = setTimeout(nextAuto, immediate ? 250 : START_DELAY);
  }

  /** Real-time step tip: only one tip, pinned to the active action, then optional look-at target */
  function focusStep(el, opts) {
    opts = opts || {};
    if (typeof el === 'string') el = document.querySelector(el);
    if (!el) return;
    clearTimeout(stepTimer);
    clearTimeout(resumeTimer);
    stopAuto();
    manual = false;
    stepLocked = true;

    try {
      el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    } catch (_) {}

    show(el, false, 'focus');

    const targetSel = opts.target || el.getAttribute('data-focus-target');
    const hold = opts.hold || STEP_HOLD_MS;

    stepTimer = setTimeout(() => {
      if (targetSel) {
        const target = document.querySelector(targetSel);
        if (target && visible(target)) {
          // Ensure target has tip content for placement
          if (!target.getAttribute('data-tip') && el.getAttribute('data-focus')) {
            target.setAttribute('data-tip', el.getAttribute('data-focus'));
            if (!target.getAttribute('data-tip-title')) {
              target.setAttribute('data-tip-title', el.getAttribute('data-tip-title') || 'Look here');
            }
            bind(target);
          }
          show(target, false, target.getAttribute('data-focus') ? 'focus' : 'tip');
          stepTimer = setTimeout(() => {
            stepLocked = false;
            if (!paused) startAuto(true);
          }, opts.targetHold || TARGET_HOLD_MS);
          return;
        }
      }
      stepLocked = false;
      if (!paused) startAuto(true);
    }, hold);
  }

  function bind(el) {
    if (el.dataset.tipBound) return;
    el.dataset.tipBound = '1';
    el.classList.add('tip-anchor');
    if (!el.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/i.test(el.tagName)) {
      el.setAttribute('tabindex', '0');
    }
    el.addEventListener('mouseenter', () => show(el, true, 'tip'));
    el.addEventListener('mouseleave', hide);
    el.addEventListener('focus', () => show(el, true, 'tip'));
    el.addEventListener('blur', hide);
    el.addEventListener('click', (e) => {
      if (active === el && tip.classList.contains('show') && manual) {
        hide();
      } else {
        e.stopPropagation();
        show(el, true, 'tip');
      }
    });
  }

  function scan(root) {
    (root || document).querySelectorAll('[data-tip]').forEach(bind);
    collect();
  }

  document.addEventListener('click', (e) => {
    if (manual && active && !e.target.closest('[data-tip]') && e.target !== tip) hide();
  });
  window.addEventListener('scroll', () => { if (active) place(active, stepLocked ? 'focus' : 'tip'); }, true);
  window.addEventListener('resize', () => { if (active) place(active, stepLocked ? 'focus' : 'tip'); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAuto();
      clearTimeout(stepTimer);
    } else if (!manual && !paused && !stepLocked) {
      startAuto(true);
    }
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
    show: function (el) { show(el, true, 'tip'); },
    focusStep: focusStep,
    hide: hideNow,
    pause: function () { paused = true; stopAuto(); clearTimeout(stepTimer); stepLocked = false; hideNow(); },
    resume: function () { paused = false; startAuto(true); }
  };
})();
