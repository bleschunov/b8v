/*
 * Live status line for b8v.dev: API latency, last deploy, commit.
 *
 *   <script src="/status.js" defer></script>
 *
 * Renders into #status if the page has one, otherwise appends a footer.
 * build.json is written by CI on every website deploy (see .github/workflows/tf.yml).
 */
(function () {
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
    @media (max-width: 400px) { .b8v-status { font-size: 11px; gap: 4px 7px; } }
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

  function ping() {
    var t0 = performance.now();
    return fetch(API, { cache: 'no-store' })
      .then(function (r) { return { ok: r.ok, ms: Math.round(performance.now() - t0) }; })
      .catch(function () { return { ok: false }; });
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

    var dot = el('span', { class: 'dot', 'aria-hidden': 'true' });
    var api = el('span', {}, 'api …');
    box.append(dot, api);

    Promise.all([ping(), build()]).then(function (res) {
      var p = res[0], b = res[1];
      dot.className = 'dot ' + (p.ok ? 'ok' : 'fail');
      api.textContent = p.ok ? 'api ' + p.ms + ' ms' : 'api unreachable';

      if (!b || !b.commit) {
        box.append(el('span', { class: 'sep' }, '·'), el('span', {}, 'local build'));
        return;
      }
      var deployed = el('a', { href: b.run_url || REPO + '/actions', target: '_blank', rel: 'noopener', title: b.deployed_at }, 'deployed ' + ago(b.deployed_at));
      var commit = el('a', { href: REPO + '/commit/' + b.commit, target: '_blank', rel: 'noopener', title: 'Commit on GitHub' }, b.commit.slice(0, 7));
      box.append(el('span', { class: 'sep' }, '·'), deployed, el('span', { class: 'sep' }, '·'), commit);
      setInterval(function () { deployed.textContent = 'deployed ' + ago(b.deployed_at); }, 60000);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
