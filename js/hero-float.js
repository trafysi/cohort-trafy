/* Hero floating highlights: each [data-depth] element drifts with the cursor
   (deeper = moves more), giving a light parallax around the video card. */
(function () {
  'use strict';

  var hero = document.getElementById('hero');
  if (!hero) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var items = Array.prototype.slice.call(hero.querySelectorAll('[data-depth]'));
  if (!items.length) return;

  var frame = 0;
  var nx = 0;
  var ny = 0;

  function apply() {
    frame = 0;
    items.forEach(function (el) {
      var d = +el.dataset.depth || 0;
      el.style.setProperty('--px', (nx * d).toFixed(1) + 'px');
      el.style.setProperty('--py', (ny * d).toFixed(1) + 'px');
    });
  }

  hero.addEventListener('pointermove', function (e) {
    var r = hero.getBoundingClientRect();
    nx = ((e.clientX - r.left) / r.width - 0.5) * 2;   // -1 .. 1
    ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
    if (!frame) frame = requestAnimationFrame(apply);
  });
  hero.addEventListener('pointerleave', function () {
    nx = 0; ny = 0;
    if (!frame) frame = requestAnimationFrame(apply);
  });
})();
