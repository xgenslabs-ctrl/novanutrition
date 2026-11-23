import { PRODUCTS, ORDER } from './products.js';
import { icon } from './icons.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const state = { product: 'whey', size: 1 };
let tub = null;

/* ---------- loading ---------- */
const bar = $('.loader__bar span');
const setLoad = (v) => { bar.style.transform = `scaleX(${v})`; };

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function boot() {
  setLoad(0.15);
  const fonts = Promise.all([
    document.fonts.load('800 italic 100px "Barlow Condensed"'),
    document.fonts.load('700 italic 100px "Barlow Condensed"'),
    document.fonts.load('600 32px "Barlow Condensed"'),
    document.fonts.load('500 26px "Barlow Condensed"'),
  ]).catch(() => {});
  const [mark, word] = await Promise.all([
    loadImage('assets/logo/nova-logo-chrome-mark.png'),
    loadImage('assets/logo/nova-logo-chrome-wordmark.png'),
    fonts,
  ]);
  setLoad(0.6);

  try {
    const { createTub } = await import('./tub.js');
    tub = createTub({ canvas: $('.tub-canvas'), images: { mark, word }, reducedMotion });
    tub.setAnchors($$('[data-tub]'), $('#spin'));
    tub.setFollowers({ sideEls: $$('[data-side]') });
  } catch (err) {
    console.warn('3D tub unavailable', err);
    document.documentElement.classList.add('no-webgl');
  }
  setLoad(1);

  renderProduct(false);
  setupSmoothScroll();
  setupBadgeFlick();
  setTimeout(intro, reducedMotion ? 0 : 350);
}

/* ---------- intro: the one orchestrated moment ---------- */
function intro() {
  document.body.classList.remove('is-loading');
  const flare = $('.hero__flare');
  const word = $('.hero__word');
  if (reducedMotion || !window.gsap) {
    flare.style.opacity = 1;
    if (tub) tub.state.intro = 1;
    return;
  }
  const tl = gsap.timeline({ delay: 0.25 });
  tl.from(word, { yPercent: 18, opacity: 0, duration: 1.1, ease: 'power3.out' }, 0)
    .fromTo(flare, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 1.4, ease: 'expo.out' }, 0.35);
  if (tub) tl.to(tub.state, { intro: 1, duration: 1.5, ease: 'power3.out' }, 0.45);
  tl.from('.hero__copy, .hero__aside', { opacity: 0, y: 20, duration: 0.8, ease: 'power2.out', stagger: 0.1 }, 0.9);
  tl.from('.hero__ring', { opacity: 0, rotation: -40, duration: 1.2, ease: 'power3.out' }, 0.8)
    .from('.badge', { opacity: 0, duration: 0.5, ease: 'power2.out', stagger: 0.12 }, 1.1)
    .from('.hero__note', { opacity: 0, x: -12, duration: 0.6, ease: 'power2.out' }, 1.5);
}

/* ---------- badge flick: the mouse "hits" a badge, it flies off and springs back ---------- */
function setupBadgeFlick() {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!fine || reducedMotion || !window.gsap || !window.InertiaPlugin) return;
  gsap.registerPlugin(InertiaPlugin);
  const clampV = gsap.utils.clamp(-1080, 1080);
  const clampR = gsap.utils.clamp(-60, 60);
  let lastX = 0, lastY = 0, dx = 0, dy = 0, queued = false;
  const hero = $('.hero');
  hero.addEventListener('mousemove', (e) => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      dx = e.clientX - lastX; dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      queued = false;
    });
  });
  // badges are re-rendered when the product changes, so listen on the list
  $('[data-badges]').addEventListener('mouseover', (e) => {
    const badge = e.target.closest('.badge');
    if (!badge || badge.contains(e.relatedTarget)) return;
    const inner = badge.querySelector('.badge__inner');
    const r = inner.getBoundingClientRect();
    const ox = e.clientX - (r.left + r.width / 2);
    const oy = e.clientY - (r.top + r.height / 2);
    const spin = (ox * dy - oy * dx) / (Math.hypot(ox, oy) || 1);
    gsap.to(inner, {
      inertia: {
        x: { velocity: clampV(dx * 30), end: 0 },
        y: { velocity: clampV(dy * 30), end: 0 },
        rotation: { velocity: clampR(spin * 15), end: 0 },
        resistance: 180,
      },
    });
  });
}

/* ---------- smooth scroll ---------- */
let lenis = null;
function setupSmoothScroll() {
  if (!reducedMotion && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const el = id === '#top' ? document.body : $(id);
      if (!el) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(id === '#top' ? 0 : el, { offset: id === '#top' ? 0 : -10 });
      else el.scrollIntoView();
      if (id !== '#top') el.setAttribute('tabindex', '-1'), el.focus({ preventScroll: true });
    });
  });
}

/* ---------- scroll-driven UI (stats, nav) ---------- */
const spin = $('#spin');
const nav = $('.nav');
const progress = $('.spin__progress span');
function onScroll() {
  nav.classList.toggle('is-solid', window.scrollY > window.innerHeight * 0.6);
  const r = spin.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight)));
  progress.style.transform = `scaleX(${p})`;
  // one card at a time: 4 cards share the scroll length of the section
  const cards = $$('.card');
  const active = p < 0.04 ? -1 : Math.min(cards.length - 1, Math.floor((p - 0.04) / (0.96 / cards.length)));
  cards.forEach((el, i) => {
    el.classList.toggle('is-on', i === active);
    el.classList.toggle('is-past', i < active);
  });
  requestAnimationFrame(onScroll);
}
requestAnimationFrame(onScroll);

/* ---------- products ---------- */
const tabsEl = $('[data-tabs]');
ORDER.forEach((key) => {
  const b = document.createElement('button');
  b.className = 'tab';
  b.type = 'button';
  b.setAttribute('role', 'tab');
  b.id = `tab-${key}`;
  b.textContent = PRODUCTS[key].tab;
  b.setAttribute('aria-controls', 'range-panel');
  b.addEventListener('click', () => selectProduct(key));
  tabsEl.append(b);
});
tabsEl.addEventListener('keydown', (e) => {
  const i = ORDER.indexOf(state.product);
  let n = null;
  if (e.key === 'ArrowRight') n = (i + 1) % ORDER.length;
  if (e.key === 'ArrowLeft') n = (i - 1 + ORDER.length) % ORDER.length;
  if (e.key === 'Home') n = 0;
  if (e.key === 'End') n = ORDER.length - 1;
  if (n === null) return;
  e.preventDefault();
  selectProduct(ORDER[n]);
  $(`#tab-${ORDER[n]}`).focus();
});

function selectProduct(key) {
  if (key === state.product) return;
  state.product = key;
  state.size = 1;
  const range = $('.range');
  range.classList.add('is-swapping');
  if (tub && window.gsap && !reducedMotion) {
    // spin the tub a full turn and swap the label while it faces away
    let swapped = false;
    gsap.to(tub.state, {
      extraRot: tub.state.extraRot + Math.PI * 2,
      sideRot: tub.state.sideRot - Math.PI * 2,
      duration: 1.1,
      ease: 'power3.inOut',
      onUpdate() {
        if (!swapped && this.progress() > 0.4) { swapped = true; renderProduct(true); }
      },
    });
    setTimeout(() => range.classList.remove('is-swapping'), 450);
  } else {
    renderProduct(true);
    range.classList.remove('is-swapping');
  }
}

function renderProduct(updateText) {
  const p = PRODUCTS[state.product];
  const size = p.sizes[state.size];
  document.documentElement.style.setProperty('--accent', p.accent);

  $$('.tab').forEach((t) => {
    const on = t.id === `tab-${p.key}`;
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
  });
  $('[data-panel]').setAttribute('aria-labelledby', `tab-${p.key}`);
  $('[data-name]').textContent = p.tab;
  $('[data-flavour]').textContent = p.flavour;
  $('[data-blurb]').textContent = p.blurb;
  $('[data-serving]').textContent = p.serving;
  $('[data-facts]').innerHTML = p.facts.map(([a, b]) => `<tr><th scope="row">${a}</th><td>${b}</td></tr>`).join('');

  const badges = $('[data-badges]');
  badges.setAttribute('aria-label', `${p.tab} at a glance`);
  badges.innerHTML = p.spin.slice(0, 3).map(([n, u, l]) => `<li class="badge"><div class="badge__inner"><b>${n}<small>${u}</small></b><span>${l}</span></div></li>`).join('');

  $('[data-stats]').innerHTML = p.spin.map(([n, u, l, text, ic]) => `
    <li class="card">
      <div class="card__icon">${icon(ic)}</div>
      <h3>${n}<small>${u}</small><span>${l}</span></h3>
      <svg class="card__arrow" viewBox="0 0 60 30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6c10-4 16 2 13 7-2 3-7 2-6-2 2-6 20-5 36 10"/><path d="M40 22l8 1-1-8"/></svg>
      <p>${text}</p>
    </li>`).join('');

  $('[data-sizes]').innerHTML = p.sizes.map((s, i) => `
    <button class="size" type="button" role="radio" aria-checked="${i === state.size}" tabindex="${i === state.size ? 0 : -1}" data-i="${i}">
      <b>${s.label}</b><span>${s.servings} servings</span>
    </button>`).join('');

  // the two products not chosen go in the side slots of the lineup
  const others = ORDER.filter((k) => k !== p.key).map((k) => PRODUCTS[k]);
  others.forEach((o, i) => {
    $(`[data-side="${i}"]`).dataset.product = o.key;
    $(`[data-side="${i}"]`).setAttribute('aria-label', `Show ${o.tab}`);
    $(`[data-side-note="${i}"]`).textContent = `${o.tab}, ${o.flavour}`;
  });
  $$('[data-side-name]').forEach((el, i) => { el.textContent = `Show ${others[i].tab}`; });
  $('[data-scoop-note]').innerHTML = p.scoopNote.join('<br>');
  setScoopPhoto(p.scoopImg);

  $('[data-inside-name]').textContent = p.tab;
  $('[data-benefits]').innerHTML = p.benefits.map(([h, t]) => `<li><h3>${h}</h3><p>${t}</p></li>`).join('');

  if (tub) {
    tub.setLabel(p, size);
    tub.setSides(others);
    tub.setAccent(p.accent);
    const targets = { bodyScale: p.bodyScale, sizeMul: size.mul };
    if (window.gsap && updateText && !reducedMotion) gsap.to(tub.state, { ...targets, duration: 0.8, ease: 'power3.out' });
    else Object.assign(tub.state, targets);
  }
}

/* scoop photo (generated in Google Flow): crossfade to the selected product's powder */
function setScoopPhoto(name) {
  const img = $('[data-scoop-img]');
  const webp = $('[data-scoop-webp]');
  const src = 'assets/images/scoop-' + name;
  if (img.getAttribute('src') === src + '.jpg') return;
  const bg = $('[data-scoop-bg]');
  const swap = () => { webp.srcset = src + '.webp'; img.src = src + '.jpg'; bg.src = src + '.webp'; };
  if (reducedMotion) { swap(); return; }
  img.classList.add('is-fading');
  bg.classList.add('is-fading');
  setTimeout(() => {
    img.onload = () => { img.classList.remove('is-fading'); bg.classList.remove('is-fading'); };
    swap();
  }, 380);
}
// warm the cache so the swap is instant
['vanilla', 'creatine'].forEach((n) => { const i = new Image(); i.src = 'assets/images/scoop-' + n + '.webp'; });

/* clicking a side tub in the lineup picks that product */
$$('[data-side]').forEach((b) => b.addEventListener('click', () => selectProduct(b.dataset.product)));

/* ---------- sizes ---------- */
const sizesEl = $('[data-sizes]');
sizesEl.addEventListener('click', (e) => {
  const b = e.target.closest('.size');
  if (b) selectSize(+b.dataset.i);
});
sizesEl.addEventListener('keydown', (e) => {
  const max = PRODUCTS[state.product].sizes.length - 1;
  let n = null;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = Math.min(max, state.size + 1);
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = Math.max(0, state.size - 1);
  if (n === null) return;
  e.preventDefault();
  selectSize(n);
  $(`.size[data-i="${n}"]`).focus();
});

function selectSize(i) {
  const p = PRODUCTS[state.product];
  state.size = i;
  $$('.size').forEach((b) => {
    const on = +b.dataset.i === i;
    b.setAttribute('aria-checked', on);
    b.tabIndex = on ? 0 : -1;
  });
  if (tub) {
    tub.setLabel(p, p.sizes[i]);
    if (window.gsap && !reducedMotion) gsap.to(tub.state, { sizeMul: p.sizes[i].mul, duration: 0.7, ease: 'back.out(1.6)' });
    else tub.state.sizeMul = p.sizes[i].mul;
  }
}

/* ---------- distributor form (Netlify Forms) ---------- */
const form = $('[data-form]');
const status = $('[data-status]');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.classList.remove('is-error');
  status.textContent = 'Sending…';
  try {
    const res = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString(),
    });
    if (!res.ok) throw new Error(res.status);
    form.reset();
    status.textContent = 'Request sent. Our team will reply by email.';
  } catch {
    status.classList.add('is-error');
    status.textContent = 'Your request didn’t send. Check your connection and try again.';
  }
});

$('[data-year]').textContent = new Date().getFullYear();

boot();
