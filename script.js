const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('nav');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
document.querySelectorAll('.arrow').forEach(b => b.addEventListener('click', () => {
  const t = document.getElementById('track');
  t.scrollBy({ left: b.dataset.dir * (t.querySelector('.card').offsetWidth + 24), behavior: 'smooth' });
}));
const contactForm = document.getElementById('contact-form');
if (contactForm) contactForm.addEventListener('submit', e => {
  e.preventDefault();
  const lines = ['Hello Autozone Motors, I would like to get in touch.', ''];
  new FormData(contactForm).forEach((v, k) => { v = String(v).trim(); if (v) lines.push(`${k}: ${v}`); });
  window.open('https://wa.me/923333053389?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
});
