/*
 * Seasonal winter decor for b8v.dev — active Nov 1 – Jan 30, every year.
 * Fir garland, hanging baubles, falling snow (and a snow cap on the card).
 *
 * Include in <head> on every page:
 *   <script src="/winter.js" data-mode="card"></script>      (business card page)
 *   <script src="/winter.js" data-mode="header"></script>    (pages with a header: baubles touch the
 *                                                             header but never cover its logo or icons)
 *
 * Fir branch: based on "Fir branch with cones" (cones removed) by OlKu,
 * Openclipart, public domain (CC0).
 */
(function () {
  var now = new Date(), m = now.getMonth(), day = now.getDate();
  if (!(m === 10 || m === 11 || (m === 0 && day <= 30))) return;

  var script = document.currentScript;
  var MODE = (script && script.dataset.mode) || 'header';
  var root = document.documentElement;
  root.classList.add('winter', 'winter-' + MODE);

  /* ---------- styles ---------- */
  var css = `
    html.winter header { border-top: 0 !important; }
    html.winter-card body { border-top: 0 !important; padding-top: 130px !important; }
    html.winter-header body { padding-top: 92px; }
    @media (max-width: 640px) {
      html.winter-card body { padding-top: 110px !important; }
      html.winter-header body { padding-top: 76px; }
    }

    .xmas { position: absolute; top: 0; left: 0; right: 0; height: 170px; pointer-events: none; z-index: 20; }
    .xmas svg { position: absolute; top: 0; left: 0; overflow: visible; }
    .xmas .branches { position: absolute; inset: 0; overflow: hidden; height: 140px; }
    .xmas .branches img { position: absolute; filter: drop-shadow(0 3px 3px rgba(19, 31, 45, 0.22)); user-select: none; }

    .xmas .ornament {
      transform-box: view-box;
      animation: b8v-sway var(--dur, 5s) ease-in-out infinite alternate;
      animation-delay: var(--delay, 0s);
    }
    @keyframes b8v-sway {
      from { transform: rotate(calc(var(--amp, 4deg) * -1)); }
      to   { transform: rotate(var(--amp, 4deg)); }
    }

    #b8v-snow { position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 15; }

    .b8v-drift {
      position: absolute; top: -8px; left: -3px; width: calc(100% + 6px); height: 13px;
      pointer-events: none; filter: drop-shadow(0 -1px 1px rgba(143, 166, 191, 0.55));
    }

    @media (prefers-reduced-motion: reduce) { .xmas .ornament { animation: none; } }
    @media print { .xmas, #b8v-snow, .b8v-drift { display: none !important; } }
  `;
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ---------- helpers ---------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FIR = script ? new URL('fir-branch.svg', script.src).href : '/fir-branch.svg';

  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  var compact = false; // every page uses the full-size garland and baubles
  function stemY(x) { return (compact ? 14 : 22) + Math.sin(x / 95) * (compact ? 3 : 4); }

  /* ---------- fir garland ---------- */
  function drawGarland(box, W) {
    var r = rng(5);
    var mobile = W < 640;
    var w = compact ? (mobile ? 170 : 210) : (mobile ? 230 : 300);
    var step = compact ? (mobile ? 100 : 125) : (mobile ? 135 : 175);
    var baseTop = compact ? (mobile ? 46 : 54) : (mobile ? 58 : 74);
    box.innerHTML = '';
    for (var x = -w * 0.45, i = 0; x < W; x += step * (0.85 + r() * 0.3), i++) {
      var img = new Image();
      img.src = FIR;
      img.alt = '';
      img.width = w;
      var flip = i % 2 ? -1 : 1;
      var top = -baseTop - r() * (compact ? 8 : 12);
      img.style.cssText = 'left:' + x.toFixed(0) + 'px;top:' + top.toFixed(0) + 'px;transform:scaleX(' + flip +
        ') rotate(' + (r() * 10 - 5).toFixed(1) + 'deg);z-index:' + (1 + (i % 3));
      box.appendChild(img);
    }
  }

  /* ---------- baubles ---------- */
  // On header pages baubles may dip into the header, but never over its content
  // (logo, icons): above those, strings get shorter or the bauble is skipped.
  function obstacles() {
    if (MODE !== 'header') return [];
    var header = document.querySelector('header');
    if (!header) return [];
    return Array.prototype.map.call(header.children, function (el) {
      var b = el.getBoundingClientRect();
      return { l: b.left - 16, r: b.right + 16, top: b.top + window.scrollY - 6 };
    });
  }

  function drawBaubles(svg, W) {
    var mobile = W < 640;
    var k = mobile ? (compact ? 0.75 : 0.7) : 1;
    if (compact) k *= 0.85;
    svg.setAttribute('width', W);
    svg.setAttribute('viewBox', '0 0 ' + W + ' 170');
    var out = '<defs>' +
      '<radialGradient id="g-orange" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#ffb47a"/><stop offset=".45" stop-color="#f97316"/><stop offset="1" stop-color="#b44a06"/></radialGradient>' +
      '<radialGradient id="g-navy" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#4b6a8c"/><stop offset=".45" stop-color="#1f3249"/><stop offset="1" stop-color="#0a1119"/></radialGradient>' +
      '<radialGradient id="g-silver" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#dfe4ea"/><stop offset="1" stop-color="#9aa3ae"/></radialGradient>' +
      '</defs>';
    var r = rng(21);
    var colors = ['orange', 'navy', 'silver'];
    var gap = mobile ? 34 : 52;
    var obs = obstacles();
    var prev = -1, i = 0;
    for (var x = 16 + r() * 10; x < W - 10; x += gap * (0.75 + r() * 0.5), i++) {
      var c;
      do { c = colors[Math.floor(r() * 3)]; } while (c === prev);
      prev = c;
      var L0 = compact ? 14 + r() * 30 : 30 + r() * 44;
      var rad0 = 8 + r() * 6;
      var stripe = c === 'navy' && r() < 0.5;
      var xi = Math.round(x);
      var y0 = stemY(xi) + 3;
      var L = L0 * k, rad = rad0 * k;
      var limit = Infinity;
      obs.forEach(function (o) { if (xi + rad > o.l && xi - rad < o.r) limit = Math.min(limit, o.top); });
      if (y0 + L + 5 + 2 * rad > limit) {
        L = limit - y0 - 5 - 2 * rad - 2;   // shorten the string above the logo/icons
        if (L < 10) continue;               // no room: skip this bauble
      }
      var cy = y0 + L + 5 + rad;
      var dur = (4 + (i % 3) * 1.1).toFixed(1);
      var amp = (6 - Math.min(L, 80) / 25).toFixed(1);
      out += '<g class="ornament" style="transform-origin:' + xi + 'px ' + y0 + 'px;--dur:' + dur + 's;--delay:-' + (i * 0.7).toFixed(1) + 's;--amp:' + amp + 'deg">' +
        '<line x1="' + xi + '" y1="' + y0 + '" x2="' + xi + '" y2="' + (y0 + L + 1) + '" stroke="#8a8f98" stroke-width="1"/>' +
        '<rect x="' + (xi - 3.5 * k) + '" y="' + (y0 + L) + '" width="' + (7 * k) + '" height="' + (6 * k) + '" rx="1" fill="#b9bec6"/>' +
        '<circle cx="' + xi + '" cy="' + cy + '" r="' + rad + '" fill="url(#g-' + c + ')"/>' +
        (stripe ? '<path d="M' + (xi - rad) + ' ' + cy + ' Q' + xi + ' ' + (cy + rad * 0.35) + ' ' + (xi + rad) + ' ' + cy + '" stroke="#f97316" stroke-width="' + (2.2 * k) + '" fill="none"/>' : '') +
        '<ellipse cx="' + (xi - rad * 0.35) + '" cy="' + (cy - rad * 0.4) + '" rx="' + (rad * 0.22) + '" ry="' + (rad * 0.13) + '" fill="#fff" opacity=".7" transform="rotate(-30 ' + (xi - rad * 0.35) + ' ' + (cy - rad * 0.4) + ')"/>' +
        '</g>';
    }
    svg.innerHTML = out;
  }

  /* ---------- snow ---------- */
  function startSnow(cv) {
    var ctx = cv.getContext('2d');
    var flakes = [], W = 0, H = 0;
    var density = compact ? 13000 : 9000;

    function flake(anywhere) {
      var z = Math.random();
      return {
        x: Math.random() * W, y: anywhere ? Math.random() * H : -20, z: z,
        glyph: Math.random() < 0.3, size: 1 + z * 2.4, vy: 0.25 + z * 0.9,
        amp: 0.3 + Math.random() * 0.8, ph: Math.random() * Math.PI * 2, a: 0.35 + z * 0.5
      };
    }
    function draw(move) {
      ctx.clearRect(0, 0, W, H);
      for (var j = 0; j < flakes.length; j++) {
        var f = flakes[j];
        if (move) {
          f.y += f.vy; f.ph += 0.012; f.x += Math.sin(f.ph) * f.amp * 0.4;
          if (f.y > H + 20) flakes[j] = f = flake(false);
        }
        ctx.fillStyle = 'rgba(143, 166, 191, ' + f.a + ')';
        if (f.glyph) {
          ctx.font = '700 ' + Math.round(8 + f.z * 9) + 'px "Roboto Mono", monospace';
          ctx.fillText('*', f.x, f.y);
        } else {
          ctx.beginPath(); ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      flakes = [];
      for (var n = Math.round(W * H / density); n > 0; n--) flakes.push(flake(true));
      if (reduce) draw(false);
    }
    resize();
    if (!reduce) (function loop() { draw(true); requestAnimationFrame(loop); })();
    return resize;
  }

  /* ---------- mount ---------- */
  function mount() {
    var xmas = document.createElement('div');
    xmas.className = 'xmas';
    xmas.setAttribute('aria-hidden', 'true');
    xmas.innerHTML = '<svg class="ornaments" height="170"></svg><div class="branches"></div>';
    document.body.prepend(xmas);

    var cv = document.createElement('canvas');
    cv.id = 'b8v-snow';
    cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv);

    Array.prototype.forEach.call(document.querySelectorAll('.card'), function (card) {
      card.insertAdjacentHTML('afterbegin',
        '<svg class="b8v-drift" viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden="true">' +
        '<path fill="#fff" d="M0 10 L0 6 C6 2 14 2 20 5 C28 1 40 1 48 5 C56 2 66 3 72 6 C80 2 92 0 102 4 C112 1 122 2 130 5 C138 2 150 1 160 5 C168 2 178 3 186 5 C192 3 198 4 200 6 L200 10 Z"/></svg>');
    });

    var svg = xmas.querySelector('.ornaments');
    var box = xmas.querySelector('.branches');
    var resizeSnow = startSnow(cv);

    function layout() {
      var W = document.documentElement.clientWidth;
      drawGarland(box, W);
      drawBaubles(svg, W);
    }
    layout();
    // fonts shift header content; re-check blocked zones once they load
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(function () { layout(); resizeSnow(); }, 120);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
