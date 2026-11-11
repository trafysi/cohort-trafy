/* ==========================================================================
   Startup incubation: interactive flowchart
   - Draws the dashed path through every step (two rows on desktop, a vertical
     timeline on phones) and plays it when it scrolls into view: the runner
     travels the path and each step lights up in turn
   - Click a step, or use the arrows, to see what happens there
   - "Idea passed?" is a live Yes / No switch: No shows the "not a fit yet"
     card and dims the rest of the journey
   ========================================================================== */
(function () {
  'use strict';

  var root = document.getElementById('tsFlow');
  if (!root) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var board = root.querySelector('.tsf__board');
  var svg = root.querySelector('.tsf__wire');
  var base = root.querySelector('.tsf__wire-base');
  var live = root.querySelector('.tsf__wire-live');
  var runner = root.querySelector('.tsf__runner');
  var items = Array.prototype.slice.call(root.querySelectorAll('.tsf-node, .tsf-gate'));
  var gate = root.querySelector('.tsf-gate');
  var gateIndex = items.indexOf(gate);
  var chips = Array.prototype.slice.call(root.querySelectorAll('.tsf-chip'));
  var panel = root.querySelector('.tsf__panel');
  var metaEl = root.querySelector('.tsf__panel-meta');
  var titleEl = root.querySelector('.tsf__panel-title');
  var descEl = root.querySelector('.tsf__panel-desc');
  var getsEl = root.querySelector('.tsf__panel-gets');
  var playBtn = root.querySelector('[data-nav="play"]');

  var active = -1;
  var passed = true;
  var lengths = [];
  var total = 0;
  var runnerAt = 0;
  var timer = null;
  var started = false;

  root.classList.add('tsf--js');

  // ---- geometry -----------------------------------------------------------
  function anchor(el) {
    var target = el.querySelector('.tsf-node__btn, .tsf-gate__box');
    var b = board.getBoundingClientRect();
    var r = target.getBoundingClientRect();
    var li = el.getBoundingClientRect();
    return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2, bottom: li.bottom - b.top, top: li.top - b.top, right: li.right - b.left };
  }

  // Orthogonal route: straight along a row; between rows, drop into the gap,
  // cross, then drop into the next step. Corners are slightly rounded.
  function route(points) {
    var pts = [points[0]];
    for (var i = 1; i < points.length; i++) {
      var a = points[i - 1];
      var c = points[i];
      if (Math.abs(a.y - c.y) < 12) { pts.push({ x: c.x, y: a.y }); continue; }
      var mid = (a.bottom + c.top) / 2;
      if (Math.abs(a.x - c.x) < 4) { pts.push({ x: a.x, y: c.y }); continue; }
      // Leave to the right of the step so the line never crosses its text.
      var side = Math.min(a.right + 18, board.clientWidth - 2);
      pts.push({ x: side, y: a.y }, { x: side, y: mid }, { x: c.x, y: mid }, { x: c.x, y: c.y });
    }
    return pts;
  }

  function toPath(pts) {
    var r = 14;
    var d = 'M' + pts[0].x + ' ' + pts[0].y;
    for (var i = 1; i < pts.length; i++) {
      var p = pts[i];
      var prev = pts[i - 1];
      var next = pts[i + 1];
      if (!next) { d += ' L' + p.x + ' ' + p.y; break; }
      var inLen = Math.hypot(p.x - prev.x, p.y - prev.y);
      var outLen = Math.hypot(next.x - p.x, next.y - p.y);
      var k = Math.min(r, inLen / 2, outLen / 2);
      if (k < 1 || (prev.x === p.x && p.x === next.x) || (prev.y === p.y && p.y === next.y)) { d += ' L' + p.x + ' ' + p.y; continue; }
      var x1 = p.x - (p.x - prev.x) / inLen * k;
      var y1 = p.y - (p.y - prev.y) / inLen * k;
      var x2 = p.x + (next.x - p.x) / outLen * k;
      var y2 = p.y + (next.y - p.y) / outLen * k;
      d += ' L' + x1 + ' ' + y1 + ' Q' + p.x + ' ' + p.y + ' ' + x2 + ' ' + y2;
    }
    return d;
  }

  function layout() {
    var points = items.map(anchor);
    // Vertical timeline (phones): keep the line straight through the icon
    // column; the wider "Idea passed?" box simply sits on top of it.
    if (Math.abs(points[0].x - points[1].x) < 4) {
      points[gateIndex] = { x: points[0].x, y: points[gateIndex].y, top: points[gateIndex].top, bottom: points[gateIndex].bottom };
    } else {
      // Two-row layout: run the line at icon height, straight behind the box.
      points[gateIndex] = { x: points[gateIndex].x, y: points[gateIndex - 1].y, top: points[gateIndex].top, bottom: points[gateIndex].bottom };
    }
    // Length of the path up to each step, measured on partial paths.
    lengths = points.map(function (_, i) {
      if (i === 0) return 0;
      base.setAttribute('d', toPath(route(points.slice(0, i + 1))));
      return base.getTotalLength();
    });
    base.setAttribute('d', toPath(route(points)));
    live.setAttribute('d', base.getAttribute('d'));
    total = base.getTotalLength();
    live.style.strokeDasharray = total + ' ' + total;
    live.style.transition = 'none';
    paintPath(false);
    void live.getBoundingClientRect();
    live.style.transition = '';
    placeRunner(lengths[Math.max(active, 0)] || 0);
  }

  function reach() {
    // How far the journey goes: past the gate only when the idea passed.
    var last = passed ? items.length - 1 : gateIndex;
    return Math.min(Math.max(active, 0), last);
  }

  function paintPath() {
    var upto = active < 0 ? 0 : lengths[reach()];
    live.style.strokeDashoffset = String(total - upto);
  }

  function placeRunner(len) {
    var p = live.getPointAtLength(Math.max(0, Math.min(len, total)));
    runner.setAttribute('cx', p.x);
    runner.setAttribute('cy', p.y);
    runnerAt = len;
  }

  function moveRunner(to) {
    if (reduceMotion) { placeRunner(to); return; }
    var from = runnerAt;
    var start = null;
    var dur = 850;
    function step(now) {
      if (start === null) start = now;
      var t = Math.min((now - start) / dur, 1);
      var e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      placeRunner(from + (to - from) * e);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ---- state ----------------------------------------------------------------
  function select(i, opts) {
    var last = passed ? items.length - 1 : gateIndex;
    i = Math.max(0, Math.min(i, last));
    active = i;
    items.forEach(function (el, k) {
      el.classList.toggle('is-done', k <= i);
      el.classList.toggle('is-active', k === i);
      el.classList.toggle('is-dim', !passed && k > gateIndex);
    });
    paintPath();
    moveRunner(lengths[i] || 0);
    showPanel(items[i]);
    var phase = items[i].className.match(/tsf-node--(\w+)/);
    chips.forEach(function (c) { c.classList.toggle('is-on', Boolean(phase) && c.dataset.phase === phase[1]); });
    // Any click by the visitor wins over the automatic play-through.
    if (!(opts && opts.auto)) { stop(); started = true; }
  }

  function showPanel(el) {
    panel.classList.remove('is-swap');
    void panel.offsetWidth;
    panel.classList.add('is-swap');
    getsEl.innerHTML = '';
    if (el === gate) {
      metaEl.textContent = 'Checkpoint';
      titleEl.textContent = 'Idea passed?';
      descEl.textContent = passed
        ? 'Ideas that pass the evaluation move straight into Phase 2 with a C-suite mentor.'
        : 'Not a fit yet. We share feedback and resources, and you can reapply anytime.';
      return;
    }
    var n = el.dataset.step;
    var more = el.querySelector('.tsf-node__more');
    metaEl.textContent = 'Step ' + n + ' of 9 · ' + more.querySelector('.tsf-node__phase').textContent;
    titleEl.textContent = el.querySelector('.tsf-node__title').textContent;
    descEl.textContent = el.querySelector('.tsf-node__desc').textContent;
    Array.prototype.forEach.call(more.querySelectorAll('li'), function (li) {
      var x = document.createElement('li');
      x.textContent = li.textContent;
      getsEl.appendChild(x);
    });
  }

  function setPassed(yes) {
    passed = yes;
    gate.classList.toggle('is-no', !yes);
    Array.prototype.forEach.call(gate.querySelectorAll('[data-answer]'), function (b) {
      var on = (b.dataset.answer === 'yes') === yes;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    select(gateIndex);
  }

  // ---- autoplay -------------------------------------------------------------
  function stop() {
    if (timer) { clearTimeout(timer); timer = null; }
    playBtn.textContent = 'Replay';
  }

  function play() {
    stop();
    if (!passed) setPassed(true);
    playBtn.textContent = 'Playing…';
    var i = 0;
    (function tick() {
      select(i, { auto: true });
      if (i >= items.length - 1) { stop(); return; }
      i += 1;
      timer = setTimeout(tick, 1150);
    })();
  }

  // ---- wiring ---------------------------------------------------------------
  items.forEach(function (el, i) {
    var btn = el.querySelector('.tsf-node__btn');
    if (btn) btn.addEventListener('click', function () { select(i); });
  });
  Array.prototype.forEach.call(gate.querySelectorAll('[data-answer]'), function (b) {
    b.addEventListener('click', function () { stop(); setPassed(b.dataset.answer === 'yes'); });
  });
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var first = items.findIndex(function (el) { return el.classList.contains('tsf-node--' + c.dataset.phase); });
      if (!passed && first > gateIndex) setPassed(true);
      select(first);
    });
  });
  root.querySelector('[data-nav="prev"]').addEventListener('click', function () { select(active - 1); });
  root.querySelector('[data-nav="next"]').addEventListener('click', function () { select(active + 1); });
  playBtn.addEventListener('click', function () { if (timer) stop(); else play(); });
  board.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); select(active + 1); focusActive(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); select(active - 1); focusActive(); }
  });
  function focusActive() {
    var b = items[active].querySelector('.tsf-node__btn, [data-answer].is-on');
    if (b) b.focus();
  }

  var raf = null;
  function relayout() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(layout);
  }
  if ('ResizeObserver' in window) new ResizeObserver(relayout).observe(board);
  else window.addEventListener('resize', relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);

  layout();
  select(0, { auto: true });

  // Play once when the chart scrolls into view.
  if (reduceMotion || !('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (entries) {
    if (!started && entries.some(function (e) { return e.isIntersecting; })) {
      started = true;
      io.disconnect();
      play();
    }
  }, { threshold: 0.35 });
  io.observe(root);
})();
