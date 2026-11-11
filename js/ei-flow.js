/* ==========================================================================
   Employability Index calculation flow
   - Plays the flow (stages, inputs, engine checks, bars, score ring) when the
     diagram scrolls into view
   - Sliders let a visitor try their own component scores; the index is the
     weighted sum (MCQ 25%, DSA 25%, Portfolio 15%, LinkedIn 10%,
     GitHub/LeetCode 25%) and updates live
   - Hovering / focusing an input highlights its wire, its scoring row and the engine
   ========================================================================== */
(function () {
  'use strict';

  var root = document.getElementById('eiFlow');
  if (!root) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rows = Array.prototype.slice.call(root.querySelectorAll('.eif-row'));
  var inputs = Array.prototype.slice.call(root.querySelectorAll('.eif-input'));
  var engine = root.querySelector('.eif-engine');
  var numEl = root.querySelector('.eif-gauge__num strong');
  var verdictEl = root.querySelector('.eif-verdict');
  var readyEl = root.querySelector('.eif-ready__text');
  var shown = 0;

  function score() {
    var total = 0;
    rows.forEach(function (r) {
      total += (+r.dataset.w) * (+r.querySelector('input').value) / 100;
    });
    return Math.round(total);
  }

  function verdict(v) {
    if (v >= 80) return ['Highly Employable', 'You are job-ready'];
    if (v >= 60) return ['Employable', 'Almost there, keep building'];
    return ['Developing', 'Build projects and keep practising'];
  }

  function countTo(target) {
    if (reduceMotion) { shown = target; numEl.textContent = target; return; }
    var from = shown;
    var start = null;
    var dur = 700;
    function step(now) {
      if (start === null) start = now;
      var t = Math.min((now - start) / dur, 1);
      shown = Math.round(from + (target - from) * (1 - Math.pow(1 - t, 3)));
      numEl.textContent = shown;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function update(animateNumber) {
    var v = score();
    root.style.setProperty('--v', v);
    var vd = verdict(v);
    verdictEl.textContent = vd[0];
    readyEl.textContent = vd[1];
    if (animateNumber) countTo(v); else { shown = v; numEl.textContent = v; }
  }

  // ---- highlight an input's path
  function highlight(k, on) {
    root.querySelectorAll('[data-k="' + k + '"]').forEach(function (el) { el.classList.toggle('is-hot', on); });
    engine.classList.toggle('is-pulse', on);
  }
  inputs.forEach(function (b) {
    var k = b.dataset.k;
    b.addEventListener('pointerenter', function () { highlight(k, true); });
    b.addEventListener('pointerleave', function () { highlight(k, false); });
    b.addEventListener('focus', function () { highlight(k, true); });
    b.addEventListener('blur', function () { highlight(k, false); });
    // clicking an input jumps to its slider
    b.addEventListener('click', function () {
      var range = root.querySelector('.eif-row[data-k="' + k + '"] input');
      if (range) range.focus();
    });
  });

  // ---- sliders
  rows.forEach(function (r) {
    var range = r.querySelector('input');
    var out = r.querySelector('output');
    var bar = r.querySelector('.eif-bar i');
    var k = r.dataset.k;
    range.addEventListener('input', function () {
      out.textContent = range.value;
      bar.style.setProperty('--s', range.value);
      update(true);
    });
    range.addEventListener('focus', function () { highlight(k, true); });
    range.addEventListener('blur', function () { highlight(k, false); });
  });

  update(false);
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  // ---- play the flow once when it comes into view
  root.classList.add('eif--js');
  numEl.textContent = '0';
  shown = 0;
  var io = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    root.classList.add('is-in');
    setTimeout(function () { countTo(score()); }, 1800);
    setTimeout(function () { root.classList.add('is-settled'); }, 3400);
  }, { threshold: 0.2 });
  io.observe(root);
})();
