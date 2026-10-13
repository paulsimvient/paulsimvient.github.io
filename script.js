const toggle = document.querySelector('.mobile-toggle');
const nav = document.querySelector('.nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
}

const traces = [
  'Keep competing explanations visible',
  'Choose a test where they disagree',
  'Run control and change under the same setup',
  'Record the measured difference',
  'Lock the rules before the final check',
  'Confirm on a reserved case',
  'Keep the claim with its limits',
  'Human review before operational use'
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

const q = document.querySelector('[data-query]');
const claim = document.querySelector('[data-claim]');
const layerEls = [...document.querySelectorAll('.layer')];
let layerAnimStep = 0;
if (q) {
  setInterval(() => {
    layerAnimStep = (layerAnimStep + 1) % 6;
    q.textContent = ['3', '3', '2', '2', '1', '1'][layerAnimStep];
    if (claim) {
      claim.textContent = ['candidate', 'candidate', 'provisional', 'provisional', 'supported', 'supported'][layerAnimStep];
    }
    layerEls.forEach((x, i) => x.classList.toggle('active', i === layerAnimStep));
  }, 1800);
}
