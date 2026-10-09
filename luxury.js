(() => {
  const d = document, root = d.documentElement;
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const mk = (tag, cls, html) => { const e = d.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };

  /* ---- preloader (first visit per session) + ready flag ---- */
  let seen = false;
  try { seen = sessionStorage.getItem('azpre') === '1'; sessionStorage.setItem('azpre', '1'); } catch (e) {}
  const ready = () => root.classList.add('ready');
  if (!seen && !reduce) {
    const pre = mk('div', 'pre', '<div><img src="assets/logo.png" alt=""><i></i></div>');
    d.body.appendChild(pre);
    const hide = () => { pre.classList.add('out'); setTimeout(() => { pre.remove(); ready(); }, 450); };
    setTimeout(hide, 1500);
  } else { requestAnimationFrame(ready); }
  setTimeout(ready, 3000);

  /* ---- split hero headings into animated words ---- */
  let wi = 0;
  const split = n => {
    [...n.childNodes].forEach(c => {
      if (c.nodeType === 3) {
        const frag = d.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(t => {
          if (!t) return;
          if (/^\s+$/.test(t)) frag.appendChild(d.createTextNode(' '));
          else frag.appendChild(mk('span', 'w', `<span style="--i:${wi++}">${t}</span>`));
        });
        c.replaceWith(frag);
      } else if (c.nodeType === 1 && c.tagName !== 'BR') split(c);
    });
  };
  const h1 = $('.hero h1, .page-hero h1');
  if (h1) { h1.setAttribute('aria-label', h1.textContent.replace(/\s+/g, ' ').trim()); split(h1); }

  /* ---- progress bar, header, fabs, parallax ---- */
  const bar = mk('div', 'progress'); d.body.appendChild(bar);
  const wa = mk('a', 'fab wa', '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5A11.8 11.8 0 0 0 1.9 17.8L0 24l6.3-1.7A11.8 11.8 0 0 0 12 23.8h0A11.8 11.8 0 0 0 20.5 3.5zM12 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4a9.8 9.8 0 1 1 8.3 4.6zm5.4-7.3c-.3-.1-1.7-.8-2-.9s-.5-.1-.7.1-.8.9-.9 1.1-.3.2-.6.1a8 8 0 0 1-4-3.5c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-.9-2.1c-.2-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.7 3.7 0 0 0-1.1 2.7 6.4 6.4 0 0 0 1.4 3.4 14.6 14.6 0 0 0 5.6 4.9c2 .9 2.8.9 3.8.8a3.2 3.2 0 0 0 2.1-1.5 2.6 2.6 0 0 0 .2-1.5c-.1-.1-.3-.2-.6-.3z"/></svg>');
  wa.href = 'https://wa.me/923333053389'; wa.setAttribute('aria-label', 'Chat on WhatsApp'); wa.target = '_blank'; wa.rel = 'noopener';
  const top = mk('button', 'fab top', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>');
  top.setAttribute('aria-label', 'Back to top');
  top.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });
  d.body.append(wa, top);

  const header = $('.site-header'), nav = $('#nav'), heroes = $$('.hero, .page-hero');
  const hero0 = heroes[0];
  if (hero0 && hero0.classList.contains('hero')) hero0.appendChild(mk('div', 'scroll-cue', '<i></i>Scroll'));
  let lastY = 0, tick = false;
  const onScroll = () => {
    const y = scrollY, max = root.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    header.classList.toggle('scrolled', y > 40);
    header.classList.toggle('hide', y > 320 && y > lastY + 4 && !(nav && nav.classList.contains('open')));
    if (y < lastY - 4 || y < 320) header.classList.remove('hide');
    top.classList.toggle('show', y > 700);
    if (!reduce) heroes.forEach(h => h.style.setProperty('--py', Math.min(y, innerHeight * 1.2) * .28 + 'px'));
    lastY = y; tick = false;
  };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---- scroll reveal with stagger ---- */
  const sel = '.kicker,section:not(.hero):not(.page-hero) h2,.cats-text .muted,.tile,.card,.promo-inner>*,.steps li,.why-img,.ticks li,details,.mini,.scard,.panel,.info,.form,.foot-grid>div,.closing .wrap>*,.stat,.tablewrap,.cats-car,.sub-h,.sec .muted,.sec p.muted';
  const items = $$(sel).filter(e => !e.closest('.hero,.page-hero,.marquee'));
  const seenP = new Map();
  items.forEach(e => {
    const p = e.parentElement, i = seenP.get(p) || 0; seenP.set(p, i + 1);
    e.style.setProperty('--d', Math.min(i, 8) * 80 + 'ms');
    e.classList.add('rv');
  });
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    const e = en.target; io.unobserve(e); e.classList.add('in');
    setTimeout(() => { e.classList.remove('rv', 'in'); e.style.removeProperty('--d'); }, 1300);
  }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  items.forEach(e => io.observe(e));

  /* ---- counters ---- */
  const co = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target, to = +el.dataset.count; co.unobserve(el);
    if (reduce) { el.textContent = to; return; }
    const t0 = performance.now(), dur = 1700;
    const step = t => { const k = Math.min((t - t0) / dur, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 4))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: .6 });
  $$('[data-count]').forEach(e => co.observe(e));

  /* ---- spotlight, tilt, magnetic buttons ---- */
  $$('.card,.tile,.mini,.scard,.panel,.steps li,details,.stat,.form').forEach(e => e.classList.add('spot'));
  $$('.spot').forEach(e => e.addEventListener('pointermove', ev => {
    const r = e.getBoundingClientRect();
    e.style.setProperty('--mx', ev.clientX - r.left + 'px');
    e.style.setProperty('--my', ev.clientY - r.top + 'px');
  }));
  if (fine && !reduce) {
    $$('.card,.mini,.scard,.stat').forEach(e => {
      e.classList.add('tilt');
      e.addEventListener('pointermove', ev => {
        const r = e.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width - .5, y = (ev.clientY - r.top) / r.height - .5;
        e.style.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) translateY(-6px)`;
      });
      e.addEventListener('pointerleave', () => { e.style.transform = ''; });
    });
    $$('.btn').forEach(b => {
      b.addEventListener('pointermove', ev => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${((ev.clientX - r.left) / r.width - .5) * 14}px,${((ev.clientY - r.top) / r.height - .5) * 10}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });

    /* ---- custom cursor ---- */
    const ring = mk('div', 'cur'), dot = mk('div', 'cur-dot');
    d.body.append(ring, dot); root.classList.add('hascur');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('pointermove', e => {
      mx = e.clientX; my = e.clientY; ring.classList.add('show'); dot.classList.add('show');
      dot.style.transform = `translate(${mx}px,${my}px)`;
    });
    d.addEventListener('mouseleave', () => { ring.classList.remove('show'); dot.classList.remove('show'); });
    (function loop() { rx += (mx - rx) * .16; ry += (my - ry) * .16; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); })();
    d.addEventListener('pointerover', e => ring.classList.toggle('big', !!e.target.closest('a,button,summary,.card,.tile,.scard,input,select,textarea')));
  }

  /* ---- carousel: drag + progress ---- */
  const track = $('#track');
  if (track) {
    const prog = mk('div', 'tprog', '<i></i>'); track.after(prog);
    const pi = $('i', prog);
    const upd = () => { const w = track.scrollWidth - track.clientWidth, vis = track.clientWidth / track.scrollWidth;
      pi.style.width = vis * 100 + '%'; pi.style.left = (w > 0 ? track.scrollLeft / w : 0) * (100 - vis * 100) + '%'; };
    track.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
    let down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; });
    addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5) { moved = true; track.classList.add('drag'); } track.scrollLeft = sl - dx; });
    addEventListener('pointerup', () => { if (!down) return; down = false; track.classList.remove('drag'); });
    track.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  }

  /* ---- smooth FAQ accordion ---- */
  $$('details').forEach(dt => {
    const s = $('summary', dt), p = $('p', dt);
    s.addEventListener('click', e => {
      if (reduce || !dt.animate) return;
      e.preventDefault();
      const from = dt.offsetHeight;
      const run = (a, b, done) => { dt.style.overflow = 'hidden';
        const an = dt.animate({ height: [a + 'px', b + 'px'] }, { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });
        an.onfinish = () => { dt.style.overflow = ''; done && done(); }; };
      if (!dt.open) { dt.open = true; run(from, dt.offsetHeight); }
      else run(from, from - p.offsetHeight - parseFloat(getComputedStyle(p).marginTop), () => { dt.open = false; });
    });
  });

  /* ---- page transitions + contact form feedback ---- */
  d.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button || a.target) return;
    const h = a.getAttribute('href');
    if (!h || h[0] === '#' || /^(https?:|mailto:|tel:)/.test(h) || !/\.html($|#)/.test(h)) return;
    e.preventDefault(); root.classList.add('leaving');
    setTimeout(() => { location.href = h; }, 330);
  });
  addEventListener('pageshow', e => { if (e.persisted) root.classList.remove('leaving'); });
  const form = $('#contact-form');
  if (form) form.addEventListener('submit', () => {
    const t = mk('div', 'toast', 'Opening your email app...'); d.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 600); }, 3500);
  });
})();
