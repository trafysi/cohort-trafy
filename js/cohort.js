(function () {
  'use strict';

  /* Where leads are sent. Set this to your form/CRM endpoint (Google Apps Script web app, see google-sheets-leads.gs).
     Until then, leads are kept only in this browser's localStorage. */
  var LEAD_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwAXcFJQgyGXdlkUqiQ1GgV-_dQgE8ntd2BfcLkFEZg-CFlG0-egyFvmTgrD3Rj6pZc/exec';
  var PDF = '/cohort/assets/downloads/trafy-ai-engineer-cohort-curriculum.pdf';

  var modal = document.getElementById('leadModal');
  var form = document.getElementById('leadForm');
  var formWrap = document.getElementById('leadFormWrap');
  var done = document.getElementById('leadDone');
  var errEl = document.getElementById('leadErr');
  var lastFocus = null;

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function sstore(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { } }
  function sload(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }

  /* graduation year options */
  var sel = form.elements.year, y = new Date().getFullYear() + 5;
  for (; y >= 2005; y--) { var o = document.createElement('option'); o.value = o.textContent = y; sel.appendChild(o); }

  function open(intent) {
    lastFocus = document.activeElement;
    var submitted = load('trafy_lead_submitted') === '1';
    formWrap.hidden = false; done.hidden = true;
    if (submitted && !intent) { startDownload(); return; }
    modal.hidden = false;
    document.body.classList.add('lock');
    setTimeout(function () { var f = form.elements.name; if (f) f.focus(); }, 50);
  }
  function close() {
    modal.hidden = true;
    document.body.classList.remove('lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function startDownload() {
    var a = document.createElement('a');
    a.href = PDF; a.download = 'Trafy-AI-Engineer-Cohort-Curriculum.pdf';
    document.body.appendChild(a); a.click(); a.remove();
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-open-lead]');
    if (t) { e.preventDefault(); open(t.getAttribute('data-intent')); return; }
    if (e.target.closest('[data-close-lead]') || e.target === modal) close();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) close(); });

  function fail(msg, field) {
    errEl.textContent = msg; errEl.hidden = false;
    if (field && field.focus) field.focus();
    return false;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errEl.hidden = true;
    var f = form.elements;
    var name = f.name.value.trim(), email = f.email.value.trim(), phone = f.phone.value.replace(/\D/g, '');
    var pro = form.querySelector('input[name=pro]:checked');
    if (name.length < 2) return fail('Please enter your full name.', f.name);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Please enter a valid email address.', f.email);
    if (!/^[6-9]\d{9}$/.test(phone)) return fail('Please enter a valid 10-digit mobile number.', f.phone);
    if (!f.year.value) return fail('Please select your graduation year.', f.year);
    if (!pro) return fail('Please tell us if you are a working professional.');

    var lead = {
      name: name, email: email, phone: '+91' + phone, graduationYear: f.year.value, workingProfessional: pro.value,
      page: location.pathname, source: (document.referrer ? 'referral' : 'direct'), at: new Date().toISOString()
    };
    try {
      var all = JSON.parse(load('trafy_leads') || '[]'); all.push(lead); store('trafy_leads', JSON.stringify(all));
    } catch (er) { }
    store('trafy_lead_submitted', '1');
    if (LEAD_ENDPOINT) {
      try { fetch(LEAD_ENDPOINT, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(lead), keepalive: true }); } catch (er) { }
    }
    formWrap.hidden = true; done.hidden = false;
    startDownload();
  });

  /* auto-open once per visit, shortly after the page loads */
  if (sload('trafy_popup_seen') !== '1' && load('trafy_lead_submitted') !== '1') {
    setTimeout(function () {
      if (modal.hidden) { sstore('trafy_popup_seen', '1'); open('auto'); }
    }, 2500);
  }

  /* expand / collapse all phases */
  var toggle = document.getElementById('toggleAll');
  var phases = document.querySelectorAll('.phase');
  if (toggle) toggle.addEventListener('click', function () {
    var openAll = toggle.textContent.trim() === 'Expand all';
    phases.forEach(function (p) { p.open = openAll; });
    toggle.textContent = openAll ? 'Collapse all' : 'Expand all';
  });


  /* ===================== motion ===================== */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* split hero headline into words that slide up */
  var h1 = document.querySelector('.hero h1');
  if (h1 && !reduce) {
    var i = 0;
    (function split(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w';
            var s = document.createElement('span'); s.textContent = part; s.style.setProperty('--i', i++);
            w.appendChild(s); frag.appendChild(w);
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1 && c.tagName !== 'BR' && !c.classList.contains('rot')) {
          if (c.tagName === 'EM') {
            var w = document.createElement('span'); w.className = 'w';
            var s = document.createElement('span'); s.style.setProperty('--i', i++);
            while (c.firstChild) s.appendChild(c.firstChild); c.appendChild(w); w.appendChild(s);
          }
          else split(c);
        }
      });
    })(h1);
  }

  /* reveal on scroll, staggered per group */
  var groups = ['.ladder li', '.perk', '.run div', '.opps article', '.tool', '.outs li', '.who li', '.faq details', '.phase', '.shot', '.pho', '.statgrid div', '.band__list li', '.weights li'];
  var singles = ['.eyebrow', '.h2', '.sub', '.ideas', '.cur__bar', '.promise', '.fine', '.final h2', '.final p', '.final .hero__cta', '.band__quote', '.weights', '.marquee', '.hero__card', '.hstats'];
  var els = [];
  groups.forEach(function (sel) {
    var byParent = new Map();
    document.querySelectorAll(sel).forEach(function (el) {
      var arr = byParent.get(el.parentNode) || []; arr.push(el); byParent.set(el.parentNode, arr);
    });
    byParent.forEach(function (arr) { arr.forEach(function (el, k) { el.style.setProperty('--d', Math.min(k, 8) * 70 + 'ms'); els.push(el); }); });
  });
  singles.forEach(function (sel) { document.querySelectorAll(sel).forEach(function (el) { if (els.indexOf(el) < 0) els.push(el); }); });
  els.forEach(function (el) { el.classList.add('rv'); });
  var weights = document.querySelectorAll('.weights li');
  var dMid = document.getElementById('dMid'), dLbl = document.getElementById('dLbl');
  weights.forEach(function (li, k) {
    var seg = document.querySelector('.donut .seg[data-k="' + k + '"]');
    function on(v) {
      li.classList.toggle('hl', v); if (seg) seg.classList.toggle('hl', v);
      if (dMid) { dMid.textContent = v ? li.querySelector('b').textContent : '100%'; dLbl.textContent = v ? li.querySelector('span').textContent : 'Capstone score'; }
    }
    li.addEventListener('pointerenter', function () { on(true); }); li.addEventListener('pointerleave', function () { on(false); });
    if (seg) { seg.addEventListener('pointerenter', function () { on(true); }); seg.addEventListener('pointerleave', function () { on(false); }); }
  });

  function countUp(el) {
    var end = +el.getAttribute('data-count'), suf = el.getAttribute('data-suffix') || '', t0 = null, dur = 1400;
    if (reduce) { el.textContent = end + suf; return; }
    function step(t) {
      if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(end * e) + suf; if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in'); io.unobserve(en.target);
        if (en.target.matches('.weights')) en.target.classList.add('in');
        en.target.querySelectorAll && en.target.querySelectorAll('[data-count]').forEach(countUp);
        if (en.target.matches('[data-count]')) countUp(en.target);
      });
    }, { threshold: .15, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
    document.querySelectorAll('.hstats dt[data-count]').forEach(function (b) { b.textContent = '0'; });
  } else { els.forEach(function (el) { el.classList.add('in'); }); }

  /* cursor spotlight on cards */
  document.querySelectorAll('.perk, .opps article, .run div, .tool, .ladder li').forEach(function (c) {
    c.classList.add('spot');
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* 3D tilt on the hero stat card */
  var card = document.querySelector('.hero__card');
  if (card && !reduce && window.matchMedia('(hover: hover)').matches) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = 'perspective(900px) rotateY(' + (x * 9) + 'deg) rotateX(' + (-y * 9) + 'deg) translateZ(0)';
    });
    card.addEventListener('pointerleave', function () { card.style.transform = ''; });
  }

  /* tool-logo marquee built from the grid */
  var track = document.querySelector('.marquee__track');
  if (track) {
    var pills = '';
    document.querySelectorAll('.stack .tool').forEach(function (t) {
      pills += '<span class="pill">' + t.querySelector('.tool__logo').outerHTML + t.querySelector('b').textContent + '</span>';
    });
    track.innerHTML = pills + pills;
    track.querySelectorAll('img').forEach(function (im) { im.addEventListener('error', function () { im.parentNode.classList.add('mono'); im.remove(); }); });
  }

  /* scroll progress + active nav link + nav shadow */
  var prog = document.getElementById('progress'), nav = document.getElementById('nav');
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__links a'));
  var secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  function scrollFx() {
    var h = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')';
    nav.classList.toggle('stuck', scrollY > 8);
    var cur = -1; secs.forEach(function (s, k) { if (s && s.getBoundingClientRect().top < innerHeight * .4) cur = k; });
    links.forEach(function (a, k) { a.classList.toggle('on', k === cur); });
  }
  window.addEventListener('scroll', scrollFx, { passive: true }); scrollFx();

  /* sticky bar after the hero */
  var sticky = document.getElementById('sticky');
  function onScroll() { sticky.classList.toggle('on', window.scrollY > 640); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
})();
