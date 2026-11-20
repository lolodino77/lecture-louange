// Commun à toutes les pages : « Reprendre », conversations lues, progression, recherche,
// filtre du vocabulaire, pinyin de la page de grammaire.
(function () {
  'use strict';
  function get(k, d) {
    try {
      var v = localStorage.getItem('ll.' + k);
      return v === null ? d : JSON.parse(v);
    } catch (e) {
      return d;
    }
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  var cta = document.getElementById('cta-continue');
  var root = cta ? cta.getAttribute('data-root') || '' : '';
  var last = get('last', null);
  if (cta && last && last.href) {
    cta.href = root + last.href;
    cta.textContent = 'Reprendre · n° ' + String(last.id).padStart(3, '0');
  }

  // conversations lues + progression
  var read = get('read', []);
  var links = document.querySelectorAll('.story-list a[data-id]');
  for (var i = 0; i < links.length; i++) {
    if (read.indexOf(parseInt(links[i].getAttribute('data-id'), 10)) >= 0) {
      links[i].classList.add('read');
      links[i].title = 'Déjà lue';
    }
  }
  var prog = document.getElementById('progress');
  if (prog) {
    var total = parseInt(prog.getAttribute('data-total'), 10) || 300;
    var n = read.length;
    prog.innerHTML =
      '<span class="prog-bar"><span style="width:' + Math.round((100 * n) / total) + '%"></span></span>' +
      '<span class="prog-txt">' + (n ? 'Vous avez lu <strong>' + n + '</strong> conversation' + (n > 1 ? 's' : '') + ' sur ' + total + '.' : 'Aucune conversation lue pour l\'instant : commencez par la n° 1 !') + '</span>';
  }

  // filtre du vocabulaire
  var strip = function (s) {
    return s.normalize ? s.normalize('NFD').replace(/[̀-ͯ]/g, '') : s;
  };
  var filter = document.getElementById('vocab-filter');
  if (filter) {
    var rows = document.querySelectorAll('.vocab-table tbody tr');
    filter.addEventListener('input', function () {
      var q = filter.value.trim().toLowerCase();
      var qn = strip(q).replace(/\s+/g, '');
      for (var i = 0; i < rows.length; i++) {
        var s = rows[i].getAttribute('data-search');
        rows[i].style.display = !q || s.indexOf(q) >= 0 || strip(s).replace(/\s+/g, '').indexOf(qn) >= 0 ? '' : 'none';
      }
    });
  }

  // pinyin sur la page de grammaire
  var gpy = document.getElementById('gram-py');
  if (gpy) {
    var gl = document.querySelector('.gram-list');
    gpy.addEventListener('change', function () {
      gl.classList.toggle('no-py', !gpy.checked);
    });
  }

  // ---------- recherche ----------
  var openBtn = document.getElementById('search-open');
  var layer = document.getElementById('search-layer');
  if (!openBtn || !layer) return;
  var input = document.getElementById('search-input');
  var results = document.getElementById('search-results');
  var loaded = false;
  function load(cb) {
    if (loaded || window.LL_SEARCH) {
      loaded = true;
      return cb();
    }
    var s = document.createElement('script');
    s.src = root + 'assets/search-index.js';
    s.onload = function () {
      loaded = true;
      cb();
    };
    s.onerror = function () {
      results.innerHTML = '<p class="sr-empty">Index de recherche introuvable.</p>';
    };
    document.head.appendChild(s);
  }
  function open() {
    layer.hidden = false;
    document.body.classList.add('search-open');
    input.focus();
    load(run);
  }
  function close() {
    layer.hidden = true;
    document.body.classList.remove('search-open');
  }
  openBtn.addEventListener('click', open);
  document.getElementById('search-close').addEventListener('click', close);
  layer.addEventListener('click', function (e) {
    if (e.target === layer) close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !layer.hidden) close();
    if (e.key === '/' && layer.hidden && !/INPUT|TEXTAREA/.test(e.target.tagName)) {
      e.preventDefault();
      open();
    }
  });
  function run() {
    var idx = window.LL_SEARCH;
    if (!idx) return;
    var q = input.value.trim().toLowerCase();
    if (!q) {
      results.innerHTML = '<p class="sr-empty">Tapez un titre, un mot chinois (恩典), du pinyin sans tons (en dian), un chant ou un mot français (grâce).</p>';
      return;
    }
    var qn = strip(q);
    var qp = qn.replace(/[^a-z]/g, '');
    var out = [];
    for (var i = 0; i < idx.s.length; i++) {
      var s = idx.s[i];
      var score = 0;
      if (strip(s.t.toLowerCase()).indexOf(qn) >= 0 || s.z.indexOf(q) >= 0) score += 10;
      if (s.so.indexOf(q) >= 0) score += 6;
      if (strip(s.g.toLowerCase()).indexOf(qn) >= 0 || strip(s.se.toLowerCase()).indexOf(qn) >= 0) score += 4;
      if (s.x.indexOf(q) >= 0) score += 3;
      if (qp.length >= 3 && /^[a-z ]+$/.test(qn) && s.p.replace(/ /g, '').indexOf(qp) >= 0) score += 2;
      if (score) out.push({ s: s, score: score });
    }
    out.sort(function (a, b) {
      return b.score - a.score || a.s.id - b.s.id;
    });
    var voc = [];
    for (var j = 0; j < idx.v.length && voc.length < 12; j++) {
      var v = idx.v[j];
      if (v.zh.indexOf(q) >= 0 || strip(v.fr.toLowerCase()).indexOf(qn) >= 0 || (qp.length >= 2 && strip(v.py).replace(/[^a-z]/g, '') === qp)) voc.push(v);
    }
    var html = '';
    if (voc.length) {
      html += '<h3>Mots clés</h3><ul class="sr-vocab">';
      for (var k = 0; k < voc.length; k++)
        html += '<li><a href="' + root + voc[k].h + '"><span class="sv-zh" lang="zh-Hant">' + esc(voc[k].zh) + '</span> <span class="sv-py">' + esc(voc[k].py) + '</span> <span class="sv-fr">' + esc(voc[k].fr) + '</span> <span class="sv-n">n° ' + String(voc[k].id).padStart(3, '0') + '</span></a></li>';
      html += '</ul>';
    }
    html += '<h3>Conversations <span class="sr-count">' + out.length + '</span></h3>';
    if (!out.length) html += '<p class="sr-empty">Aucune conversation trouvée.</p>';
    else {
      html += '<ul class="sr-stories">';
      for (var m = 0; m < Math.min(out.length, 40); m++) {
        var st = out[m].s;
        html += '<li><a href="' + root + st.h + '"><span class="ss-t">' + esc(st.t) + ' <span lang="zh-Hant" class="ss-z">' + esc(st.z) + '</span></span><span class="ss-g">n° ' + String(st.id).padStart(3, '0') + ' · niveau ' + st.lv + ' · 《' + esc(st.so) + '》</span></a></li>';
      }
      html += '</ul>';
    }
    results.innerHTML = html;
  }
  var timer = null;
  input.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      load(run);
    }, 120);
  });
})();
