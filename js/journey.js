/* ==========================================================================
   Program timeline journey
   Scroll progress through the section drives three stages:
     --row  : the Week 1 rail fills across the four common steps
     --fork : the line splits towards the two paths
     --trk  : a runner flows down each path, lighting stations as it passes
   Scrolling back up rewinds it. The switch / clicking a path highlights it
   (on phones it chooses which path is shown).
   ========================================================================== */
(function () {
  'use strict';

  var root = document.getElementById('journey');
  if (!root) return;

  var stops = Array.prototype.slice.call(root.querySelectorAll('.journey__stop'));
  var tracks = Array.prototype.slice.call(root.querySelectorAll('.journey__track'));
  var tabs = Array.prototype.slice.call(root.querySelectorAll('.journey__tab'));

  // ---- path focus (switch + click on a path)
  function focusTrack(name, fromUser) {
    tracks.forEach(function (t) { t.classList.toggle('is-focus', t.dataset.track === name); });
    tabs.forEach(function (b) {
      var on = b.dataset.track === name;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    if (fromUser) root.classList.add('has-focus');
  }
  tabs.forEach(function (b) { b.addEventListener('click', function () { focusTrack(b.dataset.track, true); }); });
  tracks.forEach(function (t) {
    t.addEventListener('click', function (e) {
      if (e.target.closest('a')) return; // let the "Learn more" link work normally
      focusTrack(t.dataset.track, true);
    });
  });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    stops.forEach(function (s) { s.classList.add('is-lit'); });
    root.querySelectorAll('.journey__station').forEach(function (s) { s.classList.add('is-lit'); });
    return;
  }

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  var rowEl = root.querySelector('.journey__row');
  var forkEl = root.querySelector('.journey__fork');

  // Each stage follows its own element, so the motion tracks what is on screen:
  // the Week 1 rail fills as its row crosses the lower half of the viewport,
  // and each path's runner sits about two-thirds of the way down the screen.
  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight;

    var rr = rowEl.getBoundingClientRect();
    var row = clamp((vh * 0.85 - rr.top) / (vh * 0.3 + rr.height));
    root.style.setProperty('--row', row.toFixed(4));
    stops.forEach(function (s, i) {
      s.classList.toggle('is-lit', row > 0.001 && row >= i / (stops.length - 1) - 0.001);
    });

    var fr = forkEl.getBoundingClientRect();
    var fork = fr.height ? clamp((vh * 0.72 - fr.top) / (fr.height + vh * 0.06)) : row;
    root.style.setProperty('--fork', fork.toFixed(4));

    tracks.forEach(function (t) {
      var line = t.querySelector('.journey__line');
      var lr = line.getBoundingClientRect();
      if (!lr.height) return; // path hidden (phones show one at a time)

      // The line runs from the first station's pin to the last one (the goal
      // pill is taller, so its pin is not at the bottom edge).
      var pins = t.querySelectorAll('.journey__pin');
      var centres = Array.prototype.map.call(pins, function (pin) {
        var pr = pin.getBoundingClientRect();
        return pr.top + pr.height / 2 - lr.top;
      });
      var y0 = centres[0];
      var len = centres[centres.length - 1] - y0;
      line.style.setProperty('--y0', y0.toFixed(1) + 'px');
      line.style.setProperty('--len', len.toFixed(1) + 'px');

      var trk = clamp((vh * 0.65 - (lr.top + y0)) / len);
      t.style.setProperty('--trk', trk.toFixed(4));
      t.style.setProperty('--run', trk > 0.001 ? 1 : 0);
      var st = t.querySelectorAll('.journey__station');
      st.forEach(function (s, i) {
        s.classList.toggle('is-lit', trk > 0.001 && trk * len >= centres[i] - y0 - 1);
      });
    });
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
