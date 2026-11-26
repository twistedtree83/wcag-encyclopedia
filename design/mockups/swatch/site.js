/* Shared helpers for the Swatch mockup: colour maths, data, header/footer, colour check, index, pairs. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- colour ---------- */
const norm = h => { h = String(h).trim().replace(/^#/, ''); if (/^[0-9a-f]{3}$/i.test(h)) h = h.split('').map(c => c + c).join(''); return /^[0-9a-f]{6}$/i.test(h) ? '#' + h.toUpperCase() : null; };
const rgb = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16));
const hex = a => '#' + a.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
const lum = h => { const c = rgb(h).map(v => v / 255).map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const fmt = r => (Math.floor(r * 100) / 100).toFixed(2);
/* Nearest colour of the same hue that reaches the target: mix towards black and white, keep the smaller change. */
function nearestPass(fg, bg, target = 4.5) {
  const f = rgb(fg); let best = null;
  for (const to of [[0, 0, 0], [255, 255, 255]]) {
    for (let t = .01; t <= 1.001; t += .01) {
      const c = hex(f.map((v, i) => v + (to[i] - v) * t));
      if (ratio(c, bg) >= target) { if (!best || t < best.t) best = { c, t }; break; }
    }
  }
  return best && best.c;
}

/* ---------- data ---------- */
const PN = ['', 'Perceivable', 'Operable', 'Understandable', 'Robust'];
const PT = ['', 'If you can’t perceive it, it isn’t there for you.', 'Every control has to be reachable by whatever you drive it with.', 'A thing you can perceive and operate can still make no sense.', 'Assistive technology can only relay what the markup says.'];
const NEW = ['2.4.11', '2.5.7', '2.5.8', '3.2.6', '3.3.7', '3.3.8'];
const cmp = (a, b) => { const x = a.split('.').map(Number), y = b.split('.').map(Number); return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]; };
const DATA = (window.CORPUS || []).map(([num, name, level, plain, fail, pass]) => ({ num, name, level, plain, fail, pass, p: +num[0], isNew: NEW.includes(num) })).sort((a, b) => cmp(a.num, b.num));
const byNum = n => DATA.find(d => d.num === n);
const curl = n => `criterion.html?c=${n}`;
const lvTag = l => `<span class="lv ${l === 'AA' ? 'aa' : ''}"><span class="sr">Level </span>${l}</span>`;

/* ---------- header and footer ---------- */
function chrome(current) {
  const brand = `<i aria-hidden="true"><b style="background:var(--a1)"></b><b style="background:var(--a2)"></b><b style="background:var(--a3)"></b></i>WCAG Encyclopedia`;
  const links = [['index.html', 'Home'], ['criteria.html', 'Criteria'], ['contrast.html', 'Colour check'], ['index.html#pledge', 'About']];
  $('#hdr').innerHTML = `<a class="brand" href="index.html">${brand}</a><nav aria-label="Main"><ul>${links.map(([h, t]) => `<li><a href="${h}"${t === current ? ' aria-current="page"' : ''}>${t}</a></li>`).join('')}</ul></nav>`;
  $('#ftr').innerHTML = `<div><a class="brand" href="index.html">${brand}</a><p>Every Level A and AA criterion of WCAG 2.2, explained in plain language and shown working and broken.</p></div>
  <div><h2>Principles</h2><ul>${[1, 2, 3, 4].map(i => `<li><a href="criteria.html?p=${i}">${PN[i]}</a></li>`).join('')}</ul></div>
  <div><h2>Tools</h2><ul><li><a href="contrast.html">Colour check</a></li><li><a href="criteria.html">Search criteria</a></li><li><a href="criteria.html?new=1">New in 2.2</a></li></ul></div>
  <div><h2>About</h2><ul><li><a href="index.html#pledge">How we test</a></li><li><a href="#">Accessibility statement</a></li><li><a href="#">Source code</a></li></ul></div>`;
}

/* ---------- colour check ---------- */
const ICON_OK = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M1.5 7.5 5.5 11.5 12.5 2.5" stroke="currentColor" stroke-width="2.4" fill="none"/></svg>';
const ICON_NO = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2l10 10M12 2 2 12" stroke="currentColor" stroke-width="2.4"/></svg>';
const CHECKS = [[4.5, 'Body text', 'AA · 1.4.3'], [3, 'Large text', 'AA · 1.4.3'], [7, 'Body text', 'AAA · 1.4.6'], [3, 'Borders & icons', 'AA · 1.4.11']];
function checker(root, fg0 = '#1A1C1C', bg0 = '#F8D17D') {
  const id = root.id || 'chk';
  root.innerHTML = `
  <h2 class="t" id="${id}-h">${root.dataset.title || 'Check a colour pair'}</h2>
  <p class="s">Pick a text colour and a background. Everything below is drawn in those two colours and measured live.</p>
  <div class="chk-in">
    <fieldset><legend>Text colour</legend><div class="cf"><input type="color" id="${id}-fgc" aria-label="Text colour picker"><input type="text" id="${id}-fg" aria-label="Text colour hex code" spellcheck="false" autocomplete="off" maxlength="7"></div></fieldset>
    <button type="button" class="swap" id="${id}-sw" aria-label="Swap text and background colours"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 7h12m0 0-3-3m3 3-3 3M16 13H4m0 0 3-3m-3 3 3 3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    <fieldset><legend>Background</legend><div class="cf"><input type="color" id="${id}-bgc" aria-label="Background colour picker"><input type="text" id="${id}-bg" aria-label="Background hex code" spellcheck="false" autocomplete="off" maxlength="7"></div></fieldset>
  </div>
  <div class="prev" id="${id}-pv" role="group" aria-label="Preview in the chosen colours">
    <p class="pvh">Opening hours</p>
    <p>Monday to Friday, nine until five. <span class="lnk">See holiday hours</span></p>
    <div class="row"><span class="fbtn">Book a visit</span><span class="finp">Email address</span></div>
    <small>Small print: closed on public holidays.</small>
  </div>
  <div class="score"><span>Contrast ratio</span><output id="${id}-out" for="${id}-fg ${id}-bg"></output></div>
  <ul class="res" id="${id}-res"></ul>
  <div class="fix" id="${id}-fix" hidden><span id="${id}-fixt"></span><button type="button" class="btn o sm" id="${id}-fixb"></button></div>
  <label class="chk-x"><input type="checkbox" id="${id}-gr"> Preview in greyscale</label>
  <p class="sr" aria-live="polite" id="${id}-live"></p>`;
  root.setAttribute('aria-labelledby', id + '-h');
  const F = $('#' + id + '-fg'), B = $('#' + id + '-bg'), FC = $('#' + id + '-fgc'), BC = $('#' + id + '-bgc');
  let fg = fg0, bg = bg0, timer;
  function draw(announce = true) {
    F.value = fg; B.value = bg; FC.value = fg.toLowerCase(); BC.value = bg.toLowerCase();
    F.removeAttribute('aria-invalid'); B.removeAttribute('aria-invalid');
    const r = ratio(fg, bg), pv = $('#' + id + '-pv');
    pv.style.color = fg; pv.style.background = bg;
    $('#' + id + '-out').textContent = fmt(r) + ' : 1';
    $('#' + id + '-res').innerHTML = CHECKS.map(([t, n, l]) => { const ok = r >= t; return `<li class="${ok ? 'ok' : 'bad'}"><strong>${ok ? ICON_OK + 'Passes' : ICON_NO + 'Fails'}</strong><span>${n}, ${l}</span><span>needs ${t} : 1</span></li>`; }).join('');
    const fix = $('#' + id + '-fix');
    if (r < 4.5) { const c = nearestPass(fg, bg); fix.hidden = !c; if (c) { $('#' + id + '-fixt').innerHTML = `Closest passing text colour: <b>${c}</b>, ${fmt(ratio(c, bg))} : 1`; const b = $('#' + id + '-fixb'); b.textContent = 'Use ' + c; b.onclick = () => set(c, bg); } }
    else fix.hidden = true;
    if (announce) { clearTimeout(timer); timer = setTimeout(() => { $('#' + id + '-live').textContent = `${fmt(r)} to 1. ${r >= 7 ? 'Passes for all text, even AAA.' : r >= 4.5 ? 'Passes for all text at AA.' : r >= 3 ? 'Passes only for large text, borders and icons.' : 'Fails for text and for controls.'}`; }, 500); }
  }
  function set(f, b) { fg = f; bg = b; draw(); }
  const onHex = (inp, which) => () => { const v = norm(inp.value); if (v) { which === 'f' ? fg = v : bg = v; const keep = inp.value; draw(); inp.value = keep; } };
  F.addEventListener('input', onHex(F, 'f')); B.addEventListener('input', onHex(B, 'b'));
  F.addEventListener('blur', () => draw(false)); B.addEventListener('blur', () => draw(false));
  FC.addEventListener('input', () => set(norm(FC.value), bg)); BC.addEventListener('input', () => set(fg, norm(BC.value)));
  $('#' + id + '-sw').onclick = () => set(bg, fg);
  $('#' + id + '-gr').onchange = e => $('#' + id + '-pv').classList.toggle('grey', e.target.checked);
  draw(false);
  return { set };
}

/* ---------- done well, done badly ---------- */
const PAIRS = [
  { t: 'Pale grey on white', why: 'Looks refined on a bright monitor and disappears on a phone in sunlight.', bad: ['#B5B5B5', '#FFFFFF'], good: ['#5E5E5E', '#FFFFFF'] },
  { t: 'White on yellow', why: 'Yellows are light colours. Dark text works on them; white text never does.', bad: ['#FFFFFF', '#F8D17D'], good: ['#1A1C1C', '#F8D17D'] },
  { t: 'Pastel link on white', why: 'Keep the hue, drop the lightness. The link stays on brand and becomes readable.', bad: ['#9CCADE', '#FFFFFF'], good: ['#1F5E7A', '#FFFFFF'] },
  { t: 'Red on green', why: 'Similar lightness, different hue. For many colour-blind readers the two become one.', bad: ['#D0312D', '#3A9A3A'], good: ['#FFFFFF', '#245A24'] },
  { t: 'Muted text in dark mode', why: 'Secondary text drifts towards the background. Lift it until it reads.', bad: ['#5A5B5F', '#2A2B2D'], good: ['#C3C3BE', '#2A2B2D'] },
  { t: 'Soft red error message', why: 'A friendly coral feels gentle and fails as text. Errors must be the easiest thing to read.', bad: ['#FF8A80', '#FFFFFF'], good: ['#A83226', '#FFFFFF'] }
];
function tile(fg, bg, good, label) {
  const r = ratio(fg, bg);
  const text = good ? `<span class="sm" style="color:${fg}">${label}</span>` : `<span class="sm" style="color:${fg}" data-t="${label}" aria-hidden="true"></span>`;
  return `<div class="tile" style="background:${bg}">${text}<span class="tag">${good ? ICON_OK : ICON_NO}${good ? 'Well' : 'Badly'} · ${fmt(r)} : 1<span class="sr">. ${fg} text on ${bg}.</span></span></div>`;
}
function renderPairs(ul, onLoad, n = PAIRS.length) {
  ul.innerHTML = PAIRS.slice(0, n).map((p, i) => `<li class="surf"><h3>${p.t}</h3><div class="duo">${tile(p.bad[0], p.bad[1], false, 'Opening hours')}${tile(p.good[0], p.good[1], true, 'Opening hours')}</div><p>${p.why}</p><button type="button" class="btn o sm" data-i="${i}">Try it in the checker<span class="sr">: ${p.t}</span></button></li>`).join('');
  ul.addEventListener('click', e => { const b = e.target.closest('button[data-i]'); if (b) onLoad(PAIRS[+b.dataset.i]); });
}

/* ---------- criteria index ---------- */
function indexCard(d) {
  return `<li><a class="surf" href="${curl(d.num)}"><span class="top"><span class="mk p${d.p}" aria-hidden="true"></span>${d.num}<span class="sr">, ${PN[d.p]}</span>${d.isNew ? '<span class="new-tag">New in 2.2</span>' : ''}${lvTag(d.level)}</span><h3>${esc(d.name)}</h3><p><b>Fails when:</b> ${esc(d.fail)}</p></a></li>`;
}
function index(root, { limit = 0, init = {} } = {}) {
  const st = { p: +init.p || 0, l: init.l || 'all', q: init.q || '', n: !!init.n };
  root.innerHTML = `
  <form class="filters" role="search" onsubmit="return false">
    <div><label for="iq">Search criteria</label><input id="iq" type="search" placeholder="Try “focus”, “1.4” or “captions”" autocomplete="off"></div>
    <div><span class="gl" id="fp-l">Principle</span><div class="chips" role="group" aria-labelledby="fp-l" id="fp"><button type="button" data-p="0">All</button>${[1, 2, 3, 4].map(i => `<button type="button" data-p="${i}"><span class="mk p${i}" aria-hidden="true"></span>${PN[i]}</button>`).join('')}</div></div>
    <div><span class="gl" id="fl-l">Level</span><div class="chips" role="group" aria-labelledby="fl-l" id="fl">${['all', 'A', 'AA'].map(l => `<button type="button" data-l="${l}">${l === 'all' ? 'All' : l}</button>`).join('')}<button type="button" data-n="1">New in 2.2</button></div></div>
  </form>
  <p class="count" id="icount" aria-live="polite"></p>
  <ul class="grid" id="igrid"></ul>
  ${limit ? `<div style="display:flex;justify-content:center;margin:28px 0 0"><a class="btn o" id="iall" href="criteria.html">See all 55 criteria</a></div>` : ''}`;
  const q = $('#iq', root); q.value = st.q;
  function draw() {
    $$('#fp button', root).forEach(b => b.setAttribute('aria-pressed', +b.dataset.p === st.p));
    $$('#fl button[data-l]', root).forEach(b => b.setAttribute('aria-pressed', b.dataset.l === st.l));
    $('#fl button[data-n]', root).setAttribute('aria-pressed', st.n);
    const s = st.q.trim().toLowerCase();
    const list = DATA.filter(d => (!st.p || d.p === st.p) && (st.l === 'all' || d.level === st.l) && (!st.n || d.isNew) && (!s || (d.num + ' ' + d.name + ' ' + d.plain + ' ' + d.fail).toLowerCase().includes(s)));
    const filtered = s || st.p || st.l !== 'all' || st.n;
    const shown = limit && !filtered ? list.slice(0, limit) : list;
    $('#igrid', root).innerHTML = shown.length ? shown.map(indexCard).join('') : '<li class="empty">Nothing matches. Try a number such as 2.4, or clear the filters.</li>';
    $('#icount', root).textContent = `Showing ${shown.length} of ${list.length} ${list.length === 1 ? 'criterion' : 'criteria'}${filtered ? ' that match' : ''}.`;
  }
  $('#fp', root).onclick = e => { const b = e.target.closest('button'); if (b) { st.p = +b.dataset.p; draw(); } };
  $('#fl', root).onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.n) st.n = !st.n; else st.l = b.dataset.l; draw(); };
  q.oninput = () => { st.q = q.value; draw(); };
  draw();
  return { setP(p) { st.p = p; draw(); }, focus() { q.focus({ preventScroll: true }); } };
}
