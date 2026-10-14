const toggle = document.querySelector('.mobile-toggle');
const nav = document.querySelector('.nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
}

const traces = [
  'DCA case: reconstruct the recorded encounter',
  'Sandbox: keep rival explanations visible',
  'Change one factor under a matched seed',
  'Watch what the counterfactual creates',
  'Re-run thousands of matched trials',
  'Rank which intervention mattered most',
  'Keep the claim with its model limits',
  'Human review before treating it as a finding'
];
let ti = 0;
const tr = document.querySelector('.trace');
if (tr) {
  setInterval(() => {
    const line = document.createElement('div');
    line.className = 'trace-line hot';
    line.textContent = traces[ti % traces.length];
    tr.appendChild(line);
    [...tr.children].forEach((x, i, a) => {
      x.className = 'trace-line' + (i === a.length - 1 ? ' hot' : '');
    });
    while (tr.children.length > 6) tr.removeChild(tr.firstChild);
    ti++;
  }, 1600);
}

const claim = document.querySelector('[data-claim]');
const layerEls = [...document.querySelectorAll('.layer')];
let layerAnimStep = 0;
if (layerEls.length) {
  setInterval(() => {
    layerAnimStep = (layerAnimStep + 1) % layerEls.length;
    if (claim) {
      claim.textContent = ['record', 'stage', 'change', 'creates', 'trials', 'limits'][layerAnimStep] || 'record';
    }
    layerEls.forEach((x, i) => x.classList.toggle('active', i === layerAnimStep));
  }, 1800);
}
