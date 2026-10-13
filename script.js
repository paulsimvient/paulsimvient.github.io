const toggle = document.querySelector('.mobile-toggle');
const nav = document.querySelector('.nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
}

const form = document.querySelector('.form:not(#access-form)');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const note = document.querySelector('#form-note');
    const btn = form.querySelector('button[type="submit"]');
    const name = (form.elements.namedItem('name')?.value || '').trim();
    const email = (form.elements.namedItem('email')?.value || '').trim();
    const message = (form.elements.namedItem('message')?.value || '').trim();

    if (!email || !message) {
      if (note) note.textContent = 'Please complete the required fields.';
      return;
    }

    if (btn) btn.disabled = true;
    if (note) note.textContent = 'Sending…';

    fetch('https://formsubmit.co/ajax/paul@invia.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        message,
        _subject: 'Paul Cummings site — contact',
        source: 'paulsimvient.github.io/contact.html',
        _template: 'table',
        _captcha: 'false'
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error('request failed');
        return res.json().catch(() => ({}));
      })
      .then(() => {
        form.reset();
        if (note) note.textContent = 'Thanks — the message was sent.';
      })
      .catch(() => {
        if (note) note.textContent = 'Something went wrong. Email paul@invia.com instead.';
        if (btn) btn.disabled = false;
      });
  });
}
