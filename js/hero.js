(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* rotating word in the headline */
  var rotEl = document.getElementById('rot');
  if (rotEl && !reduce) {
    var words = rotEl.children, wi = 0;
    setInterval(function () {
      if (document.hidden) return;
      var cur = words[wi]; wi = (wi + 1) % words.length; var nxt = words[wi];
      cur.classList.remove('is-on'); cur.classList.add('is-out');
      nxt.classList.remove('is-out'); nxt.classList.add('is-on');
      setTimeout(function () { cur.classList.remove('is-out'); }, 800);
    }, 2600);
  }

  /* code -> chat -> deploy sequence, loops */
  var lines = document.querySelectorAll('#code .ln'), bMe = document.getElementById('bMe'),
      bAi = document.getElementById('bAi'), dep = document.getElementById('deploy');
  var seq = [];
  function later(fn, ms) { seq.push(setTimeout(fn, ms)); }
  function play() {
    seq.forEach(clearTimeout); seq = [];
    lines.forEach(function (l) { l.classList.remove('on'); });
    [bMe, bAi].forEach(function (b) { b.classList.remove('on', 'done'); });
    dep.classList.remove('on');
    var t = 500;
    lines.forEach(function (l) { later(function () { l.classList.add('on'); }, t); t += 330; });
    later(function () { bMe.classList.add('on'); }, t + 200);
    later(function () { bAi.classList.add('on'); }, t + 900);
    later(function () { bAi.classList.add('done'); }, t + 2300);
    later(function () { dep.classList.add('on'); }, t + 3000);
    later(play, t + 8200);
  }
  if (lines.length) {
    if (reduce) {
      lines.forEach(function (l) { l.classList.add('on'); });
      [bMe, bAi].forEach(function (b) { b.classList.add('on', 'done'); }); dep.classList.add('on');
    } else {
      play();
      document.addEventListener('visibilitychange', function () { if (!document.hidden) play(); });
    }
  }

  /* spring parallax: depth layers ease toward the pointer */
  var hero = document.getElementById('hero'), layers = document.querySelectorAll('#hero [data-depth]');
  if (hero && !reduce && window.matchMedia('(hover: hover)').matches) {
    var tx = 0, ty = 0, cx = 0, cy = 0, running = false;
    var kick = function () { if (!running) { running = true; requestAnimationFrame(tick); } };
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - .5; ty = (e.clientY - r.top) / r.height - .5; kick();
    });
    hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; kick(); });
    var tick = function () {
      cx += (tx - cx) * .075; cy += (ty - cy) * .075;
      layers.forEach(function (el) {
        var d = +el.getAttribute('data-depth');
        el.style.transform = 'translate3d(' + (cx * d * 34).toFixed(2) + 'px,' + (cy * d * 34).toFixed(2) + 'px,0)';
      });
      if (Math.abs(tx - cx) > .0005 || Math.abs(ty - cy) > .0005) requestAnimationFrame(tick); else running = false;
    };
  }

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.translate = ((e.clientX - r.left - r.width / 2) * .22).toFixed(1) + 'px ' + ((e.clientY - r.top - r.height / 2) * .3).toFixed(1) + 'px';
      });
      b.addEventListener('pointerleave', function () { b.style.translate = ''; });
    });
  }
})();
