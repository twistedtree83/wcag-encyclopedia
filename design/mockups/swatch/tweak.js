/* Tweak bar. Edits every design token in swatch.css live, lets you pick an element on the page to jump to its
   controls, checks the result still passes contrast, and exports the tokens as CSS for the real build. */
(() => {
  const KEY = 'swatch-tweaks-v2';
  const root = document.documentElement;
  const PALETTES = {
    karma: { n: 'Karma', a1: '#9CCADE', a2: '#F8D17D', a3: '#FFB3A9', ink: '#1F5E7A' },
    citrus: { n: 'Citrus', a1: '#A8DDB5', a2: '#F6E27A', a3: '#FFB37A', ink: '#2F6B3A' },
    mineral: { n: 'Mineral', a1: '#B9C4E6', a2: '#E8C9A0', a3: '#A9C7B9', ink: '#34477E' },
    berry: { n: 'Berry', a1: '#F2A7C3', a2: '#FFD59E', a3: '#A6D8E8', ink: '#8E2A55' }
  };
  const HEAD = ['Gabarito', 'Bricolage Grotesque', 'Familjen Grotesk', 'Fraunces', 'Instrument Sans', 'Onest', 'Figtree'];
  const BODY = ['Golos Text', 'Atkinson Hyperlegible', 'Onest', 'Figtree', 'Instrument Sans', 'Bricolage Grotesque'];
  const ATTR_DEF = { theme: 'dark', palette: 'karma', nav: 'pill', cards: 'filled', shadow: 'none', loops: 'on', hero: 'split', motion: 'on', eyebrow: 'normal', badges: 'solid', princ: 'colour', failline: 'on' };
  const W = [['300', 'Light'], ['400', 'Regular'], ['500', 'Medium'], ['600', 'Semibold'], ['700', 'Bold'], ['800', 'Heavy']];

  /* control helpers: c = colour, r = range, a = attribute switch */
  const c = (k, l) => ({ t: 'c', k, l });
  const r = (k, l, min, max, step, u = 'px') => ({ t: 'r', k, l, min, max, step, u });
  const a = (k, l, opts) => ({ t: 'a', k, l, opts });
  const G = [
    { id: 'theme', n: 'Theme and palette', c: [a('theme', 'Theme', [['dark', 'Dark'], ['light', 'Light']]), { t: 'p', l: 'Palette' }] },
    { id: 'page', n: 'Page colours', c: [c('--bg', 'Page background'), c('--deep', 'Panels (checker, filters)'), c('--raise', 'Raised surfaces'), c('--ink', 'Main text'), c('--ink-2', 'Secondary text'), c('--line', 'Dividers'), c('--line-2', 'Field and control borders'), c('--focus', 'Focus ring')] },
    { id: 'accents', n: 'Accent colours', c: [c('--a1', 'Accent 1 (Perceivable, links)'), c('--a2', 'Accent 2 (Operable, primary)'), c('--a3', 'Accent 3 (Understandable, errors)'), c('--a4', 'Accent 4 (Robust)'), c('--on-a', 'Text on accents'), c('--accent-text', 'Accent used as text'), c('--a-ink', 'Dark accent for light theme')] },
    { id: 'head', n: 'Headings', c: [{ t: 'f', k: '--fh', l: 'Heading font', opts: HEAD }, { t: 'w', k: '--hw', l: 'Display weight (h1, h2, numbers)', opts: W.slice(2) }, { t: 'w', k: '--hw2', l: 'Title weight (cards, h3)', opts: W.slice(2) }, r('--h1', 'Home headline size', 56, 140, 2), r('--h1-sub', 'Page headline size', 44, 120, 2), r('--h2', 'Section heading size', 32, 96, 2), r('--h3', 'Card title size', 16, 32, 1), r('--num', 'Big numbers', 32, 96, 2), r('--hls', 'Letter spacing', -.06, .04, .005, 'em'), r('--hlh', 'Line height', .85, 1.3, .01, '')] },
    { id: 'body', n: 'Body text', c: [{ t: 'f', k: '--fb', l: 'Body font', opts: BODY }, { t: 'w', k: '--bw', l: 'Body weight', opts: W.slice(0, 3) }, r('--body', 'Body size', 15, 22, 1), r('--lede', 'Intro paragraph size', 16, 28, 1), r('--small', 'Small text size', 13, 17, 1), r('--eye', 'Eyebrow size', 12, 20, 1), r('--lh', 'Line height', 1.3, 1.9, .05, ''), r('--ts', 'Scale everything', .85, 1.2, .01, '×'), a('eyebrow', 'Eyebrow style', [['normal', 'Sentence'], ['caps', 'Capitals']])] },
    { id: 'layout', n: 'Layout and spacing', c: [r('--maxw', 'Content width', 960, 1600, 10), r('--gut', 'Side margins', 16, 120, 2), r('--sp', 'Space between sections', 48, 200, 2), r('--gap', 'Gap between cards', 6, 40, 1), r('--pad', 'Padding inside cards', 14, 48, 1), r('--hero-gap', 'Hero column gap', 24, 120, 2), a('hero', 'Home hero', [['split', 'Side by side'], ['stacked', 'Stacked']])] },
    { id: 'shape', n: 'Corners and borders', c: [r('--rad', 'Card corners', 0, 48, 1), r('--rad-sm', 'Field corners', 0, 24, 1), r('--bwid', 'Border width', 1, 4, .5), c('--line', 'Divider colour'), c('--line-2', 'Control border colour')] },
    { id: 'buttons', n: 'Buttons', c: [c('--btn-bg', 'Primary background'), c('--btn-fg', 'Primary text'), c('--btn2-line', 'Secondary border'), r('--rad-btn', 'Corners', 0, 30, 1), r('--btn-h', 'Height', 40, 64, 1), r('--btn-px', 'Side padding', 12, 40, 1), { t: 'w', k: '--btn-w', l: 'Weight', opts: W.slice(2) }] },
    { id: 'nav', n: 'Navigation', c: [a('nav', 'Current page style', [['pill', 'Pill'], ['underline', 'Underline'], ['plain', 'Plain']]), c('--nav-on-bg', 'Current page background'), c('--nav-on-fg', 'Current page text'), r('--nav-gap', 'Gap between links', 0, 24, 1)] },
    { id: 'cards', n: 'Cards and panels', c: [a('cards', 'Card style', [['filled', 'Filled'], ['outline', 'Outlined']]), a('shadow', 'Shadow', [['none', 'None'], ['soft', 'Soft'], ['hard', 'Hard']]), c('--card-bg', 'Card background'), c('--deep', 'Panel background'), r('--lift', 'Hover lift', 0, 8, 1), a('failline', '“Fails when” line on index cards', [['on', 'Show'], ['off', 'Hide']])] },
    { id: 'princ', n: 'Principle cards', c: [a('princ', 'Colour', [['colour', 'Accent colours'], ['mono', 'Plain cards']]), r('--pc-h', 'Height', 200, 440, 10)] },
    { id: 'chips', n: 'Filters, chips and badges', c: [c('--chip-on-bg', 'Selected chip background'), c('--chip-on-fg', 'Selected chip text'), r('--rad-chip', 'Chip corners', 0, 30, 1), a('badges', 'Level AA badge', [['solid', 'Solid'], ['outline', 'Outline']]), c('--badge-bg', 'AA badge background'), c('--badge-fg', 'AA badge text'), r('--rad-badge', 'Badge corners', 0, 12, 1)] },
    { id: 'check', n: 'Colour check and demos', c: [r('--prev-pad', 'Preview padding', 12, 48, 1), c('--exhibit', 'Demo of the week background'), c('--err-text', 'Fail and error text'), c('--ok-text', 'Pass text')] },
    { id: 'loops', n: 'Dashed loop lines', c: [a('loops', 'Show', [['on', 'On'], ['off', 'Off']]), c('--loop', 'Colour'), r('--loop-w', 'Thickness', .5, 4, .1), r('--loop-dash', 'Dash length', 2, 24, 1), r('--loop-o', 'Opacity', .1, 1, .05, '')] },
    { id: 'pledge', n: 'Pledge panel and footer', c: [c('--pledge-bg', 'Pledge background'), c('--pledge-fg', 'Pledge text'), c('--foot-bg', 'Footer background')] },
    { id: 'motion', n: 'Motion', c: [a('motion', 'Hover motion', [['on', 'On'], ['off', 'Off']]), r('--speed', 'Speed', 0, .5, .01, 's')] }
  ];
  const ALL = [...new Set(G.flatMap(g => g.c.filter(x => x.k && x.t !== 'a').map(x => x.k)))];
  const COLOURS = new Set(G.flatMap(g => g.c.filter(x => x.t === 'c').map(x => x.k)));

  let S = { at: { ...ATTR_DEF }, v: {} };
  try { const o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (o) S = { at: { ...ATTR_DEF, ...o.at }, v: o.v || {} }; } catch (e) { }
  const setPalette = k => { const p = PALETTES[k]; if (!p) return; S.at.palette = k; Object.assign(S.v, { '--a1': p.a1, '--a2': p.a2, '--a3': p.a3, '--a-ink': p.ink }); };

  let panel = null;
  function apply() {
    for (const k in ATTR_DEF) if (k !== 'palette') root.dataset[k] = S.at[k];
    ALL.forEach(k => root.style.removeProperty(k));
    for (const k in S.v) root.style.setProperty(k, S.v[k]);
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { }
    if (panel) { sync(); audit(); }
  }
  apply();

  /* ---------- reading values ---------- */
  const raw = k => getComputedStyle(root).getPropertyValue(k).trim();
  const toHex = v => {
    v = (v || '').trim();
    if (/^#[0-9a-f]{6}$/i.test(v)) return v.toUpperCase();
    if (/^#[0-9a-f]{3}$/i.test(v)) return ('#' + v.slice(1).split('').map(x => x + x).join('')).toUpperCase();
    const m = v.match(/rgba?\(([^)]+)\)/); if (m) { const p = m[1].split(/[ ,/]+/).map(Number); if (p[3] === 0) return 'transparent'; return '#' + p.slice(0, 3).map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase(); }
    if (v === 'transparent') return 'transparent';
    return '';
  };
  const num = k => parseFloat(raw(k));

  /* ---------- panel markup ---------- */
  let uid = 0;
  function ctl(x) {
    const id = 'twc' + (++uid);
    if (x.t === 'c') return `<div class="row"><label for="${id}-t">${x.l}</label><span class="col"><input type="color" data-k="${x.k}" aria-label="${x.l} picker"><input type="text" id="${id}-t" data-k="${x.k}" spellcheck="false" maxlength="11"></span></div>`;
    if (x.t === 'r') return `<div class="row"><label for="${id}">${x.l}</label><div class="rg"><input type="range" id="${id}" data-k="${x.k}" data-u="${x.u}" min="${x.min}" max="${x.max}" step="${x.step}"><output for="${id}" data-o="${x.k}"></output></div></div>`;
    if (x.t === 'f') return `<div class="row"><label for="${id}">${x.l}</label><select id="${id}" data-k="${x.k}" data-font="1">${x.opts.map(o => `<option>${o}</option>`).join('')}</select></div>`;
    if (x.t === 'w') return `<div class="row"><span class="lab2" id="${id}">${x.l}</span><div class="seg" role="radiogroup" aria-labelledby="${id}">${x.opts.map(([v, t]) => `<label><input type="radio" name="${id}" data-k="${x.k}" value="${v}"><span>${t}</span></label>`).join('')}</div></div>`;
    if (x.t === 'a') return `<div class="row"><span class="lab2" id="${id}">${x.l}</span><div class="seg" role="radiogroup" aria-labelledby="${id}">${x.opts.map(([v, t]) => `<label><input type="radio" name="${id}" data-a="${x.k}" value="${v}"><span>${t}</span></label>`).join('')}</div></div>`;
    if (x.t === 'p') return `<div class="row"><span class="lab2" id="${id}">${x.l}</span><div class="seg" role="radiogroup" aria-labelledby="${id}">${Object.entries(PALETTES).map(([k, p]) => `<label><input type="radio" name="${id}" data-a="palette" value="${k}"><span><span class="sw3" aria-hidden="true"><i style="background:${p.a1}"></i><i style="background:${p.a2}"></i><i style="background:${p.a3}"></i></span>${p.n}</span></label>`).join('')}</div></div>`;
  }
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'tw-open'; btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'tw');
  btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 4h9M15 4h1M2 9h3M9 9h7M2 14h7M13 14h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="13" cy="4" r="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="7" cy="9" r="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="11" cy="14" r="2" fill="none" stroke="currentColor" stroke-width="2"/></svg>Tweaks';
  panel = document.createElement('section');
  panel.id = 'tw'; panel.className = 'tw'; panel.hidden = true; panel.setAttribute('aria-labelledby', 'tw-title');
  panel.innerHTML = `
  <div class="tw-h"><h2 id="tw-title">Tweaks</h2><div class="r"><button type="button" class="tw-pick" aria-pressed="false"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2l5 12 2-5 5-2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>Pick element</button><button type="button" class="tw-x" aria-label="Close tweaks"><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2l10 10M12 2 2 12" stroke="currentColor" stroke-width="2.2"/></svg></button></div></div>
  <div class="tw-b">
    <p class="tw-hint">Choose Pick element, then click anything on the page to jump to its settings. Changes apply to every page and are saved in this browser.</p>
    ${G.map(g => `<details data-g="${g.id}"${g.id === 'theme' ? ' open' : ''}><summary>${g.n}</summary><div class="gb">${g.c.map(ctl).join('')}<button type="button" class="gr" data-reset="${g.id}">Reset ${g.n.toLowerCase()}</button></div></details>`).join('')}
    <div class="audit" aria-labelledby="tw-au"><h3 id="tw-au">Does it still pass?</h3><ul id="tw-audit"></ul></div>
    <label class="sr" for="tw-json">Settings or CSS</label><textarea id="tw-json" hidden></textarea>
  </div>
  <div class="tw-f"><button type="button" class="pri" id="tw-css">Copy CSS</button><button type="button" id="tw-copy">Copy settings</button><button type="button" id="tw-imp">Paste settings</button><button type="button" id="tw-reset">Reset all</button><p class="stat" id="tw-stat" aria-live="polite"></p></div>`;
  document.body.append(btn, panel);
  const tip = document.createElement('div'); tip.className = 'tw-tip'; tip.hidden = true; tip.setAttribute('aria-hidden', 'true'); document.body.append(tip);
  const $ = s => panel.querySelector(s), $$ = s => [...panel.querySelectorAll(s)];
  const say = t => { $('#tw-stat').textContent = t; };

  function sync() {
    $$('[data-a]').forEach(i => i.checked = S.at[i.dataset.a] === i.value);
    $$('input[type=radio][data-k]').forEach(i => i.checked = String(num(i.dataset.k)) === i.value);
    $$('select[data-font]').forEach(s => s.value = raw(s.dataset.k).replace(/["']/g, ''));
    $$('input[type=range]').forEach(i => { const v = num(i.dataset.k); if (document.activeElement !== i) i.value = v; const o = panel.querySelector(`output[data-o="${i.dataset.k}"]`); if (o) o.textContent = (+v.toFixed(3)) + i.dataset.u; });
    $$('.col').forEach(w => { const [p, t] = w.querySelectorAll('input'); const h = toHex(raw(t.dataset.k)); p.value = /^#/.test(h) ? h.toLowerCase() : '#000000'; if (document.activeElement !== t) t.value = h; });
  }

  /* ---------- contrast audit ---------- */
  const lum = h => { const q = [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16) / 255).map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return .2126 * q[0] + .7152 * q[1] + .0722 * q[2]; };
  const ratio = (x, y) => { const p = lum(x), q = lum(y); return (Math.max(p, q) + .05) / (Math.min(p, q) + .05); };
  const hx = k => { const h = toHex(raw(k)); return /^#/.test(h) ? h : toHex(raw('--bg')); };
  function audit() {
    const rows = [['Main text on page', '--ink', '--bg', 4.5], ['Secondary text on page', '--ink-2', '--bg', 4.5], ['Secondary text on panels', '--ink-2', '--deep', 4.5], ['Secondary text on cards', '--ink-2', '--card-bg', 4.5], ['Accent text on page', '--accent-text', '--bg', 4.5], ['Error text on page', '--err-text', '--bg', 4.5], ['Primary button text', '--btn-fg', '--btn-bg', 4.5], ['Text on accent 1', '--on-a', '--a1', 4.5], ['Text on accent 2', '--on-a', '--a2', 4.5], ['Text on accent 3', '--on-a', '--a3', 4.5], ['Current nav item', '--nav-on-fg', '--nav-on-bg', 4.5], ['Selected chip', '--chip-on-fg', '--chip-on-bg', 4.5], ['AA badge', '--badge-fg', '--badge-bg', 4.5], ['Pledge panel', '--pledge-fg', '--pledge-bg', 4.5], ['Control borders on page', '--line-2', '--bg', 3], ['Control borders on panels', '--line-2', '--deep', 3], ['Control borders on cards', '--line-2', '--card-bg', 3], ['Focus ring on page', '--focus', '--bg', 3]];
    let bad = 0;
    $('#tw-audit').innerHTML = rows.map(([n, f, b, t]) => { const v = ratio(hx(f), hx(b)); const ok = v >= t; if (!ok) bad++; return `<li><span>${n}</span><span class="${ok ? 'ok' : 'bad'}">${v.toFixed(1)} : 1 ${ok ? '✓' : '✗ needs ' + t}</span></li>`; }).join('');
    $('#tw-au').textContent = bad ? `Does it still pass? ${bad} ${bad === 1 ? 'problem' : 'problems'}` : 'Does it still pass? Yes';
  }
  sync(); audit();

  /* ---------- editing ---------- */
  panel.addEventListener('input', e => {
    const t = e.target, k = t.dataset.k;
    if (t.type === 'range') { S.v[k] = t.value + (t.dataset.u === '×' ? '' : t.dataset.u); apply(); }
    else if (t.type === 'color') { S.v[k] = t.value.toUpperCase(); apply(); }
    else if (t.type === 'text' && k) { const v = t.value.trim(); if (/^#?([0-9a-f]{3}){1,2}$/i.test(v)) { S.v[k] = toHex(v[0] === '#' ? v : '#' + v); apply(); } else if (v === 'transparent') { S.v[k] = v; apply(); } }
  });
  panel.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.a === 'palette') { setPalette(t.value); apply(); }
    else if (t.dataset.a === 'theme') { S.at.theme = t.value; for (const k of COLOURS) delete S.v[k]; setPalette(S.at.palette); apply(); }
    else if (t.dataset.a) { S.at[t.dataset.a] = t.value; apply(); }
    else if (t.type === 'radio' && t.dataset.k) { S.v[t.dataset.k] = t.value; apply(); }
    else if (t.dataset.font) { S.v[t.dataset.k] = `"${t.value}"`; apply(); }
    else if (t.type === 'text') sync();
  });
  panel.addEventListener('click', e => {
    const b = e.target.closest('[data-reset]'); if (!b) return;
    const g = G.find(x => x.id === b.dataset.reset);
    g.c.forEach(x => { if (x.t === 'a') S.at[x.k] = ATTR_DEF[x.k]; else if (x.k) delete S.v[x.k]; });
    if (g.id === 'theme') { S.v = {}; setPalette('karma'); }
    apply(); say(`${g.n} reset.`);
  });

  /* ---------- export ---------- */
  const ta = $('#tw-json');
  function css() {
    const lines = ALL.map(k => `  ${k}: ${raw(k)};`);
    const at = Object.keys(ATTR_DEF).filter(k => k !== 'palette').map(k => `data-${k}="${S.at[k]}"`).join(' ');
    return `/* WCAG Encyclopedia tokens, exported from the tweak bar.\n   Put these attributes on <html>: ${at} */\n:root{\n${lines.join('\n')}\n}`;
  }
  async function out(text, msg) {
    ta.hidden = false; ta.readOnly = true; ta.value = text;
    try { await navigator.clipboard.writeText(text); say(msg); } catch (e) { ta.focus(); ta.select(); say('Copy the selected text above.'); }
  }
  $('#tw-css').onclick = () => out(css(), 'CSS copied. Paste it into the chat or the stylesheet.');
  $('#tw-copy').onclick = () => out(JSON.stringify(S), 'Settings copied. Paste them into the chat.');
  $('#tw-imp').onclick = function () {
    if (this.dataset.mode !== 'apply') { ta.hidden = false; ta.readOnly = false; ta.value = ''; ta.focus(); this.textContent = 'Apply pasted settings'; this.dataset.mode = 'apply'; say('Paste settings into the box, then choose Apply.'); return; }
    try { const o = JSON.parse(ta.value); S = { at: { ...ATTR_DEF, ...o.at }, v: o.v || {} }; apply(); say('Settings applied.'); }
    catch (e) { say('That text is not valid settings. Copy it again from Copy settings.'); }
    this.textContent = 'Paste settings'; this.dataset.mode = '';
  };
  $('#tw-reset').onclick = () => { S = { at: { ...ATTR_DEF }, v: {} }; apply(); say('Everything reset to the original design.'); };

  /* ---------- open, close ---------- */
  const open = o => { panel.hidden = !o; btn.setAttribute('aria-expanded', o); if (o) { sync(); audit(); $('.tw-x').focus(); } else { picking(false); btn.focus(); } };
  btn.onclick = () => open(panel.hidden);
  $('.tw-x').onclick = () => open(false);
  document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; if (isPicking) { picking(false); $('.tw-pick').focus(); } else if (!panel.hidden && panel.contains(document.activeElement)) open(false); });

  /* ---------- pick an element ---------- */
  const MAP = [
    ['header nav', 'nav', 'Navigation'], ['.brand', 'head', 'Logo'], ['.btn', 'buttons', 'Button'], ['.chips button, .presets button', 'chips', 'Filter chip'],
    ['.lv, .new-tag', 'chips', 'Level badge'], ['.chk-in, .cf, .swap', 'check', 'Colour inputs'], ['.prev', 'check', 'Colour preview'], ['.res, .score, .fix', 'check', 'Check results'],
    ['.lab, .scale', 'check', 'Demo of the week'], ['.chk', 'check', 'Colour check'], ['.princ a', 'princ', 'Principle card'], ['.news a', 'accents', 'New in 2.2 card'],
    ['.stage', 'check', 'Demo stage'], ['.pledge', 'pledge', 'Pledge panel'], ['footer.foot', 'pledge', 'Footer'], ['.filters', 'chips', 'Filters panel'],
    ['h1', 'head', 'Headline'], ['h2, h3, .big, .mini b, .num', 'head', 'Heading'], ['.grid a, .pairs > li, .surf, .rules li', 'cards', 'Card'],
    ['.mk, .shape', 'accents', 'Principle marker'], ['.eyebrow', 'body', 'Eyebrow'], ['p, li, span, small, label, dt, dd, q', 'body', 'Text'], ['section, main, .wrap', 'layout', 'Section']
  ];
  let isPicking = false, hl = null;
  const match = el => { for (const [s, g, l] of MAP) { const m = el.closest(s); if (m) return { el: m, g, l }; } return null; };
  const inside = el => panel.contains(el) || btn.contains(el);
  function onMove(e) {
    if (inside(e.target)) { tip.hidden = true; hl && hl.classList.remove('tw-hl'); return; }
    const m = match(e.target); hl && hl.classList.remove('tw-hl'); hl = m && m.el;
    if (m) { hl.classList.add('tw-hl'); tip.hidden = false; tip.textContent = m.l + ' → ' + G.find(g => g.id === m.g).n; tip.style.left = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8) + 'px'; tip.style.top = (e.clientY + 18) + 'px'; } else tip.hidden = true;
  }
  function onClick(e) {
    if (inside(e.target)) return;
    e.preventDefault(); e.stopPropagation();
    const m = match(e.target); picking(false);
    if (m) jump(m.g, m.l);
  }
  function jump(g, label) {
    $$('details').forEach(d => d.open = d.dataset.g === g);
    const d = panel.querySelector(`details[data-g="${g}"]`);
    d.classList.add('flash'); setTimeout(() => d.classList.remove('flash'), 1400);
    d.scrollIntoView({ block: 'start' }); d.querySelector('summary').focus();
    say(`${label}: showing ${G.find(x => x.id === g).n}.`);
  }
  function picking(on) {
    isPicking = on; root.classList.toggle('tw-picking', on); $('.tw-pick').setAttribute('aria-pressed', on);
    if (on) { document.addEventListener('mousemove', onMove, true); document.addEventListener('click', onClick, true); say('Click any element on the page. Press Escape to stop.'); }
    else { document.removeEventListener('mousemove', onMove, true); document.removeEventListener('click', onClick, true); tip.hidden = true; hl && hl.classList.remove('tw-hl'); }
  }
  $('.tw-pick').onclick = () => picking(!isPicking);
  window.twJump = jump;
  if (new URLSearchParams(location.search).has('tweaks')) open(true);
})();
