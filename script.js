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
