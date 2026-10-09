(() => {
  const WA = '923333053389';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const form = $('#bk'), panes = $$('.bk-pane'), steps = $$('#bkSteps li');
  const back = $('#bkBack'), next = $('#bkNext'), send = $('#bkSend'), err = $('#bkErr'), bar = $('#bkBar');
  let step = 1;

  /* make -> model dropdowns (list taken from the pricing page) */
  const CARS = {
    'Toyota': ['Corolla 09', 'Vitz', 'Mira', 'Move', 'Corolla 13 to 26', 'Grande', 'Aqua', 'Yaris', 'Prius', 'Yaris Import', 'Cross', 'Raiz', 'Camry', 'Prado', 'Fortuner', 'Revo', 'Vigo', 'Land Cruiser V8'],
    'Honda': ['Civic CF', 'Civic Reborn', 'Civic Rebirth', 'Civic X 17', 'Civic Turbo 1.5', 'Civic New', 'City 7-10', 'City 10-22', 'City 22-26', 'Vezel', 'BRV'],
    'Suzuki': ['Alto', 'Cultus', 'Wagon R', 'Swift New'],
    'Hyundai': ['Tucson', 'Sonata', 'Elantra'],
    'Haval': ['Jolion', 'Jolion Hybrid', 'H6', 'BJ40', 'H6 HEV', 'Tank'],
    'Kia': ['Sportage', 'Stonic', 'Santa Fe', 'Picanto'],
    'Changan': ['Alsvin', 'Oshan X7', 'Karvan'],
    'Chery': ['Tigo 6'],
    'BYD': ['Atto 3'],
    'Jaecoo': ['J5', 'J7'],
    'JAC': ['J9 Hunter'],
    'MG': ['HS / ZS'],
    'Peugeot': ['Peugeot']
  };
  /* vehicle category for every model, so the category is picked automatically */
  const CAT_LISTS = {
    'Hatchback': ['Toyota Vitz', 'Toyota Mira', 'Toyota Move', 'Toyota Aqua', 'Toyota Prius', 'Toyota Yaris Import', 'Suzuki Alto', 'Suzuki Cultus', 'Suzuki Wagon R', 'Suzuki Swift New', 'Kia Picanto'],
    'Sedan': ['Toyota Corolla 09', 'Toyota Corolla 13 to 26', 'Toyota Grande', 'Toyota Yaris', 'Toyota Camry',
      'Honda Civic CF', 'Honda Civic Reborn', 'Honda Civic Rebirth', 'Honda Civic X 17', 'Honda Civic Turbo 1.5', 'Honda Civic New', 'Honda City 7-10', 'Honda City 10-22', 'Honda City 22-26',
      'Hyundai Sonata', 'Hyundai Elantra', 'Changan Alsvin'],
    'SUV': ['Toyota Cross', 'Toyota Raiz', 'Honda Vezel', 'Honda BRV', 'Hyundai Tucson', 'Haval Jolion', 'Haval Jolion Hybrid', 'Haval H6', 'Haval BJ40', 'Haval H6 HEV',
      'Kia Sportage', 'Kia Stonic', 'Kia Santa Fe', 'Changan Oshan X7', 'Changan Karvan', 'Chery Tigo 6', 'BYD Atto 3', 'Jaecoo J5', 'Jaecoo J7', 'MG HS / ZS'],
    'Full Size SUV': ['Toyota Prado', 'Toyota Fortuner', 'Toyota Revo', 'Toyota Vigo', 'Toyota Land Cruiser V8', 'Haval Tank', 'JAC J9 Hunter']
  };
  const CAT = {};
  Object.entries(CAT_LISTS).forEach(([cat, list]) => list.forEach(n => { CAT[n] = cat; }));
  const catNote = document.createElement('p');
  catNote.className = 'bk-hint bk-cat'; catNote.hidden = true;
  $('.bk-opts.four').after(catNote);
  const autoCat = () => {
    const cat = CAT[`${mk.value} ${md.value}`];
    if (!cat) { catNote.hidden = true; return; }
    const r = $$('input[name=vehicle]').find(r => r.value === cat);
    if (r) { r.checked = true; form.dispatchEvent(new Event('change')); }
    catNote.innerHTML = `Category set to <b>${cat}</b> for ${mk.value} ${md.value}. You can change it above if needed.`;
    catNote.hidden = false;
  };
  const mk = form.elements.make, md = form.elements.model, ot = form.elements.other, otW = $('#otherWrap');
  const optHtml = (list, first) => `<option value="">${first}</option>` + list.map(x => `<option>${x}</option>`).join('');
  mk.innerHTML = optHtml([...Object.keys(CARS), 'Other'], 'Select make');
  const syncOther = () => {
    const show = mk.value === 'Other' || md.value === 'Other';
    otW.hidden = !show; ot.required = show;
  };
  const syncModel = () => {
    const m = mk.value;
    md.disabled = !m || m === 'Other';
    md.innerHTML = m && m !== 'Other' ? optHtml([...CARS[m], 'Other'], 'Select model')
      : `<option value="">${m === 'Other' ? 'Not needed' : 'Select make first'}</option>`;
    syncOther(); autoCat();
  };
  mk.addEventListener('change', syncModel);
  md.addEventListener('change', () => { syncOther(); autoCat(); });
  $$('input[name=vehicle]').forEach(r => r.addEventListener('change', () => { catNote.hidden = true; }));
  const carName = () => {
    const m = mk.value, o = ot.value.trim();
    if (!m) return '';
    if (m === 'Other') return o;
    return md.value === 'Other' ? `${m} ${o}`.trim() : (md.value ? `${m} ${md.value}` : '');
  };

  /* date: today or later; time slots 9AM-8PM (open 9AM to 9PM) */
  const dateEl = form.elements.date, timeEl = form.elements.time;
  const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  dateEl.min = iso(new Date());
  const fmt = h => `${((h + 11) % 12) + 1}:00 ${h < 12 ? 'AM' : 'PM'}`;
  const fillTimes = () => {
    const now = new Date(), today = dateEl.value === iso(now), keep = timeEl.value;
    timeEl.innerHTML = '<option value="">Select a time</option>';
    for (let h = 9; h <= 20; h++) {
      if (today && h <= now.getHours()) continue;
      timeEl.insertAdjacentHTML('beforeend', `<option>${fmt(h)}</option>`);
    }
    if ([...timeEl.options].some(o => o.value === keep)) timeEl.value = keep;
  };
  fillTimes();

  /* prefill from ?service=key&vehicle=name */
  const q = new URLSearchParams(location.search);
  if (q.get('service')) { const c = $(`input[data-key="${q.get('service')}"]`); if (c) c.checked = true; }
  if (q.get('vehicle')) { const r = $$('input[name=vehicle]').find(r => r.value.toLowerCase() === q.get('vehicle').toLowerCase()); if (r) r.checked = true; }

  /* remember contact details on this device */
  try { const sv = JSON.parse(localStorage.getItem('azbk') || '{}');
    ['name', 'phone', 'reg'].forEach(k => { if (sv[k] && !form.elements[k].value) form.elements[k].value = sv[k]; });
    if (sv.make && CARS[sv.make]) { mk.value = sv.make; syncModel(); if (sv.model && [...md.options].some(o => o.value === sv.model)) md.value = sv.model; syncOther(); } } catch (e) {}

  const data = () => {
    const f = form.elements;
    return {
      vehicle: ($('input[name=vehicle]:checked') || {}).value || '',
      car: carName(), reg: f.reg.value.trim(),
      services: $$('input[name=service]:checked').map(c => c.value),
      notes: f.notes.value.trim(), date: f.date.value, time: f.time.value,
      name: f.name.value.trim(), phone: f.phone.value.trim()
    };
  };
  const prettyDate = v => v ? new Date(v + 'T00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '';

  const summary = () => {
    const d = data();
    $('#sVeh').textContent = d.vehicle ? d.vehicle + (d.car ? ' - ' + d.car : '') + (d.reg ? ' (' + d.reg + ')' : '') : '-';
    $('#sSvc').innerHTML = d.services.length ? d.services.map(s => `<span class="bk-tag">${s}</span>`).join('') : 'None selected';
    $('#sWhen').textContent = d.date || d.time ? [prettyDate(d.date), d.time].filter(Boolean).join(', ') : '-';
    $('#sWho').textContent = d.name || d.phone ? [d.name, d.phone].filter(Boolean).join(' / ') : '-';
  };
  form.addEventListener('input', e => { if (e.target === dateEl) fillTimes(); err.textContent = ''; summary(); });
  form.addEventListener('change', summary);

  const validate = n => {
    const d = data();
    if (n === 1) {
      if (!mk.value) return 'Please select your car make.';
      if (mk.value !== 'Other' && !md.value) return 'Please select your car model.';
      if ((mk.value === 'Other' || md.value === 'Other') && !ot.value.trim()) return 'Please type your car make and model.';
    }
    if (n === 2 && !d.services.length) return 'Please select at least one service.';
    if (n === 3) { if (!d.date) return 'Please choose a date.'; if (!d.time) return 'Please choose a time.'; }
    if (n === 4) {
      if (d.name.length < 2) return 'Please enter your name.';
      if (d.phone.replace(/\D/g, '').length < 10) return 'Please enter a valid phone number.';
    }
    return '';
  };

  const show = n => {
    step = n;
    panes.forEach(p => p.classList.toggle('on', +p.dataset.step === n));
    steps.forEach((s, i) => { s.classList.toggle('on', i + 1 === n); s.classList.toggle('done', i + 1 < n); });
    bar.style.width = (n / 4 * 100) + '%';
    back.style.visibility = n === 1 ? 'hidden' : 'visible';
    next.hidden = n === 4; send.hidden = n !== 4;
    err.textContent = '';
    const top = form.getBoundingClientRect().top + scrollY - 110;
    if (scrollY > top) scrollTo({ top, behavior: 'smooth' });
  };
  next.onclick = () => { const m = validate(step); if (m) { err.textContent = m; return; } show(step + 1); };
  back.onclick = () => show(step - 1);
  steps.forEach((s, i) => s.addEventListener('click', () => {
    if (i + 1 < step) return show(i + 1);
    for (let n = 1; n <= i; n++) { const m = validate(n); if (m) { show(n); err.textContent = m; return; } }
    show(i + 1);
  }));
  form.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') { e.preventDefault(); step < 4 ? next.click() : send.click(); } });

  form.addEventListener('submit', e => {
    e.preventDefault();
    for (let n = 1; n <= 4; n++) { const m = validate(n); if (m) { show(n); err.textContent = m; return; } }
    const d = data();
    try { localStorage.setItem('azbk', JSON.stringify({ name: d.name, phone: d.phone, reg: d.reg, make: mk.value, model: md.value })); } catch (x) {}
    const msg = [
      '*New Service Booking - Autozone Motors*', '',
      `*Name:* ${d.name}`, `*Phone:* ${d.phone}`, '',
      `*Vehicle:* ${d.vehicle} - ${d.car}${d.reg ? ' (' + d.reg + ')' : ''}`,
      '*Services:*', ...d.services.map(s => `- ${s}`),
      d.notes ? `*Problem / notes:* ${d.notes}` : '', '',
      `*Preferred date:* ${prettyDate(d.date)}`, `*Preferred time:* ${d.time}`, '',
      'Please confirm my booking. Thank you.'
    ].filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n');
    const url = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
    $('#bkLink').href = url;
    $('#bkDone').hidden = false;
    document.body.style.overflow = 'hidden';
    window.open(url, '_blank', 'noopener');
  });
  $('#bkAgain').onclick = () => {
    $('#bkDone').hidden = true; document.body.style.overflow = '';
    $$('input[name=service]').forEach(c => c.checked = false);
    form.elements.notes.value = ''; dateEl.value = ''; timeEl.value = '';
    summary(); show(1);
  };
  show(1); summary();
})();
