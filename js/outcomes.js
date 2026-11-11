/* ==========================================================================
   "Why Trafy Cohort '26" outcomes bento
   - Cards rise in one after another the first time the section is in view
   - Each card's chart plays (25 dots, placement rings, 7 startup pins,
     grant odometer, photo settle) and its number counts up
   - Hovering a card replays its chart
   Without JS, or with reduced motion, every card shows its finished state.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.getElementById('outcomeBento');
  if (!root || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var cells = Array.prototype.slice.call(root.querySelectorAll('.bx__cell'));
  root.classList.add('bx--js');

  function countUp(el) {
    var target = +el.dataset.count;
    if (!target) return;
    var dec = +(el.dataset.decimals || 0);
    var pre = el.dataset.prefix || '';
    var suf = el.dataset.suffix || '';
    var start = null;
    var dur = 1500;
    function step(now) {
      if (start === null) start = now;
      var t = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t, 4);
      el.textContent = pre + (target * eased).toFixed(dec) + suf;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Restart a card's CSS chart animations
  function play(cell) {
    cell.classList.remove('is-play');
    void cell.offsetWidth; // reflow so the animations start again
    cell.classList.add('is-play');
  }

  function reveal() {
    cells.forEach(function (cell, i) {
      setTimeout(function () {
        cell.classList.add('is-in');
        play(cell);
        var num = cell.querySelector('.bx__num');
        if (num) countUp(num);
      }, i * 110);
    });
  }

  var io = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) { io.disconnect(); reveal(); }
  }, { threshold: 0.25 });
  io.observe(root);

  // Replay on hover (mouse) once the card has entered
  cells.forEach(function (cell) {
    var last = 0;
    cell.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse' || !cell.classList.contains('is-in')) return;
      var now = Date.now();
      if (now - last < 1600) return; // let the previous run finish
      last = now;
      play(cell);
    });
  });
})();
