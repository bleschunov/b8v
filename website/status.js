/*
 * Live status line for b8v.dev: API latency, last deploy, commit.
 *
 *   <script src="/status.js" defer></script>                   (deploy + commit)
 *   <script src="/status.js" defer data-api="posts"></script>  (+ API latency)
 *
 * The script never calls the API itself. With data-api="posts" it reads the
 * timing of the page's own request for posts (Resource Timing), so pages that
 * don't show posts make no API requests at all.
 *
 * Renders into #status if the page has one, otherwise appends a footer.
 * build.json is written by CI on every website deploy (see .github/workflows/tf.yml).
 */
(function () {
  var script = document.currentScript;
  var WATCH_API = !!(script && script.dataset.api === 'posts');
  var REPO = 'https://github.com/bleschunov/b8v';
  var API = 'https://api.b8v.dev/posts';

  var css = `
    .b8v-status {
      display: flex; align-items: center; flex-wrap: wrap; gap: 6px 10px;
      font-family: 'Roboto Mono', 'Courier New', monospace;
      font-size: 12px; line-height: 1.4; color: #8a8f98;
    }
    .b8v-status--page { padding: 8px var(--pad, 20px) 28px; }
    .b8v-status a { color: inherit; text-decoration: none; border-bottom: 1px dotted currentColor; }
    .b8v-status a:hover, .b8v-status a:focus-visible { color: #f97316; outline: none; }
    .b8v-status .sep { opacity: 0.6; }
    .b8v-status .dot {
      width: 7px; height: 7px; border-radius: 50%; background: #c4c8ce; flex-shrink: 0;
    }
    .b8v-status .dot.ok { background: #22a06b; box-shadow: 0 0 0 0 rgba(34, 160, 107, 0.5); animation: b8v-pulse 2.4s ease-out infinite; }
    .b8v-status .dot.fail { background: #e5484d; }
    @keyframes b8v-pulse { 70% { box-shadow: 0 0 0 6px rgba(34, 160, 107, 0); } 100% { box-shadow: 0 0 0 0 rgba(34, 160, 107, 0); } }
    @media (prefers-reduced-motion: reduce) { .b8v-status .dot.ok { animation: none; } }
    @media (max-width: 480px) { .b8v-status { font-size: 11px; gap: 4px 6px; } }
    @media print { .b8v-status { display: none !important; } }
  `;

  function ago(iso) {
    var s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return 'just now';
    var m = Math.floor(s / 60); if (m < 60) return m + ' min ago';
    var h = Math.floor(m / 60); if (h < 24) return h + ' h ago';
    var d = Math.floor(h / 24); return d + (d === 1 ? ' day ago' : ' days ago');
  }

  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }

  // Timing of the first request the page itself made to the posts API.
  function apiTiming() {
    return new Promise(function (resolve) {
      if (!('PerformanceObserver' in window)) return resolve(null);
      var done = false;
      function pick(list) {
        if (done) return;
        for (var i = 0; i < list.length; i++) {
          var e = list[i];
          if (e.name.indexOf(API) !== 0) continue;
          done = true;
          obs.disconnect();
          var status = e.responseStatus;           // not in every browser
          resolve({ ok: !status || status < 400, ms: Math.round(e.duration) });
          return;
        }
      }
      var obs = new PerformanceObserver(function (l) { pick(l.getEntries()); });
      try { obs.observe({ type: 'resource', buffered: true }); } catch (err) { return resolve(null); }
      pick(performance.getEntriesByType('resource'));
      setTimeout(function () { if (!done) { done = true; obs.disconnect(); resolve(null); } }, 10000);
    });
  }

  function build() {
    return fetch('/build.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }

  function mount() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var box = document.getElementById('status');
    if (!box) {
      box = el('footer', {});
      box.className = 'b8v-status--page';
      document.body.appendChild(box);
    }
    box.classList.add('b8v-status');
    box.setAttribute('aria-label', 'Site status');

    var parts = [];
    function add(node) {
      if (parts.length) box.append(el('span', { class: 'sep' }, '·'));
      box.append(node);
      parts.push(node);
    }

    // deploy info first, API latency (blog only) appended when its request finishes
    build().then(function (b) {
      if (!b || !b.commit) { add(el('span', {}, 'local build')); return; }
      var deployed = el('a', { href: b.run_url || REPO + '/actions', target: '_blank', rel: 'noopener', title: b.deployed_at }, 'deployed ' + ago(b.deployed_at));
      var commit = el('a', { href: REPO + '/commit/' + b.commit, target: '_blank', rel: 'noopener', title: 'Commit on GitHub' }, b.commit.slice(0, 7));
      add(deployed);
      add(commit);
      setInterval(function () { deployed.textContent = 'deployed ' + ago(b.deployed_at); }, 60000);
    }).then(function () {
      if (!WATCH_API) return;
      return apiTiming().then(function (t) {
        if (!t) return;
        var dot = el('span', { class: 'dot ' + (t.ok ? 'ok' : 'fail'), 'aria-hidden': 'true' });
        box.prepend(dot);
        add(el('span', {}, t.ok ? 'api ' + t.ms + ' ms' : 'api error'));
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
