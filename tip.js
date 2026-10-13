/* Shared demo tooltips: hover/focus/tap on [data-tip] */
(function () {
  let tip = document.getElementById('site-tip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'site-tip';
    tip.setAttribute('role', 'tooltip');
    document.body.appendChild(tip);
  }

  let active = null;
  let hideTimer = null;

  function place(el) {
    const text = el.getAttribute('data-tip') || '';
    const title = el.getAttribute('data-tip-title') || '';
    tip.innerHTML = (title ? '<strong>' + title + '</strong>' : '') + text;
    tip.classList.add('show');
    const r = el.getBoundingClientRect();
    const tw = tip.offsetWidth || 240;
    const th = tip.offsetHeight || 60;
    let left = r.left + r.width / 2 - tw / 2;
    left = Math.max(10, Math.min(left, window.innerWidth - tw - 10));
    let top = r.top - th - 10;
    if (top < 8) top = r.bottom + 10;
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  }

  function show(el) {
    clearTimeout(hideTimer);
    active = el;
    place(el);
  }

  function hide() {
    hideTimer = setTimeout(() => {
      tip.classList.remove('show');
      active = null;
    }, 80);
  }

  function bind(el) {
    if (el.dataset.tipBound) return;
    el.dataset.tipBound = '1';
    el.classList.add('tip-anchor');
    if (!el.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/i.test(el.tagName)) {
      el.setAttribute('tabindex', '0');
    }
    el.addEventListener('mouseenter', () => show(el));
    el.addEventListener('mouseleave', hide);
    el.addEventListener('focus', () => show(el));
    el.addEventListener('blur', hide);
    el.addEventListener('click', (e) => {
      if (window.matchMedia('(hover: none)').matches) {
        e.stopPropagation();
        if (active === el && tip.classList.contains('show')) hide();
        else show(el);
      }
    });
  }

  function scan(root) {
    (root || document).querySelectorAll('[data-tip]').forEach(bind);
  }

  document.addEventListener('click', (e) => {
    if (active && !e.target.closest('[data-tip]') && e.target !== tip) hide();
  });
  window.addEventListener('scroll', () => { if (active) place(active); }, true);
  window.addEventListener('resize', () => { if (active) place(active); });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => scan());
  } else {
    scan();
  }
  window.CoTips = { scan, show, hide };
})();
