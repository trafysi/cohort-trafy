/*
  Vanilla port of Magic UI's "Marquee" (vertical, dual-column, pause-on-hover)
  testimonial layout. The original is a React component wrapping a CSS
  keyframe animation with content duplicated once for a seamless loop; here
  that's just two plain DOM columns with duplicated markup and the same
  keyframes, so no React/Tailwind/shadcn dependency is needed. Two changes
  from the source: real Cohort '25 photos/quotes (already used elsewhere on
  this page) instead of placeholder avatar.vercel.sh images, and
  prefers-reduced-motion pauses the loop instead of leaving it running.
*/
(function () {
  'use strict';

  var col1 = document.getElementById('alumniMarqueeCol1');
  var col2 = document.getElementById('alumniMarqueeCol2');
  if (!col1 || !col2) return;

  var DATA = [
    {
      name: 'Ananya Singh',
      role: 'Product Designer',
      quote: 'This cohort pushed us out of our comfort zones in the best way possible, from understanding real business problems to shipping AI-powered solutions.',
      avatar: '/cohort/assets/img/alumni/review-1.webp',
      location: ''
    },
    {
      name: 'Rohan Verma',
      role: 'Developer',
      quote: 'From ideating in late-night sessions to building, breaking and building again, every step pushed me to think bigger and ship faster.',
      avatar: '/cohort/assets/img/alumni/review-2.webp',
      location: ''
    },
    {
      name: 'Aditya Kulkarni',
      role: 'AI Enthusiast',
      quote: 'This cohort gave me clarity, direction and a community that pushes you to do better every day. I learned to think like a builder, not just a coder.',
      avatar: '',
      location: ''
    },
    {
      name: 'Karan Bansal',
      role: 'AI/ML Enthusiast',
      quote: "Today's session on building AI-powered products and evaluating real-world problems was incredible. Grateful for the mentors and the discussions.",
      avatar: '/cohort/assets/img/alumni/review-4.webp',
      location: ''
    },
    {
      name: 'Sarthak Jain',
      role: 'Software Developer',
      quote: 'Every week was a new challenge and a new learning. Grateful for the mentors, the feedback, and the amazing community.',
      avatar: '/cohort/assets/img/alumni/review-5.webp',
      location: ''
    }
  ];

  var firstRow = DATA.slice(0, 2);
  var secondRow = DATA.slice(2);

  var TONES = ['pink', 'teal', 'butter', 'mint'];

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function initials(name) {
    return name.split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase();
  }

  // location is only shown when it is known for that alumnus
  function cardHTML(d, i) {
    var avatar = d.avatar
      ? '<img class="alumni-marquee__card-avatar" src="' + esc(d.avatar) + '" alt="Portrait of ' + esc(d.name) + '" loading="lazy" decoding="async">'
      : '<span class="alumni-marquee__card-avatar alumni-marquee__card-avatar--initials" aria-hidden="true">' + esc(initials(d.name)) + '</span>';
    return (
      '<figure class="alumni-marquee__card alumni-marquee__card--' + TONES[i % TONES.length] + '">' +
        '<span class="alumni-marquee__card-mark" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M9.6 6C6.5 7.3 4.5 10 4.5 13.4V18h6v-6h-3c0-2 1.2-3.6 3-4.4L9.6 6zm9 0c-3.1 1.3-5.1 4-5.1 7.4V18h6v-6h-3c0-2 1.2-3.6 3-4.4L18.6 6z"/></svg>' +
        '</span>' +
        '<span class="alumni-marquee__card-tag">Cohort &apos;25</span>' +
        '<blockquote class="alumni-marquee__card-quote">' + esc(d.quote) + '</blockquote>' +
        '<figcaption class="alumni-marquee__card-foot">' +
          avatar +
          '<span class="alumni-marquee__card-who">' +
            '<strong class="alumni-marquee__card-name">' + esc(d.name) + '</strong>' +
            '<span class="alumni-marquee__card-role">' + esc(d.role) + '</span>' +
            (d.location ? '<span class="alumni-marquee__card-loc">' + esc(d.location) + '</span>' : '') +
          '</span>' +
        '</figcaption>' +
      '</figure>'
    );
  }

  function buildTrack(container, items, offset) {
    var track = document.createElement('div');
    track.className = 'alumni-marquee__track';
    var html = '';
    items.concat(items).forEach(function (d, i) { html += cardHTML(d, i + offset); });
    track.innerHTML = html;
    container.appendChild(track);
  }

  buildTrack(col1, firstRow, 0);
  buildTrack(col2, secondRow, 1);

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    document.getElementById('alumniMarquee').classList.add('is-paused');
  }
})();
