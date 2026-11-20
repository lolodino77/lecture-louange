// Cartes de révision : répétition espacée simple (boîtes de Leitner), données dans localStorage.
(function () {
  'use strict';
  var ALL = window.LL_VOCAB || [];
  var store = {
    get: function (k, d) {
      try {
        var v = localStorage.getItem('ll.' + k);
        return v === null ? d : JSON.parse(v);
      } catch (e) {
        return d;
      }
    },
    set: function (k, v) {
      try {
        localStorage.setItem('ll.' + k, JSON.stringify(v));
      } catch (e) {}
    },
  };
  var DAY = 86400000;
  var INTERVALS = [0, 1, 3, 7, 16, 35, 90]; // jours selon la boîte
  var NEW_PER_SESSION = 15;
  var $ = function (id) {
    return document.getElementById(id);
  };

  function decks() {
    var saved = store.get('cards', []);
    var d = [{ key: 'mes', label: 'Mes mots', items: saved }];
    for (var lv = 1; lv <= 6; lv++) {
      d.push({
        key: 'n' + lv,
        label: 'Niveau ' + lv,
        items: ALL.filter(function (v) {
          return v.lv === lv;
        }),
      });
    }
    d.push({ key: 'tout', label: 'Tout', items: ALL });
    return d;
  }
  var deckKey = store.get('deck', 'n1');
  var srs = store.get('srs', {}); // zh -> {b: boîte, due: timestamp}
  var queue = [];
  var current = null;

  function currentDeck() {
    var ds = decks();
    for (var i = 0; i < ds.length; i++) if (ds[i].key === deckKey) return ds[i];
    return ds[1];
  }
  function renderDecks() {
    var ds = decks();
    var row = $('deck-row');
    row.innerHTML = '';
    ds.forEach(function (d) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'deck-btn';
      b.setAttribute('aria-pressed', String(d.key === deckKey));
      var due = dueCount(d.items);
      b.innerHTML = d.label + ' <span>' + d.items.length + (due ? ' · ' + due + ' à revoir' : '') + '</span>';
      b.addEventListener('click', function () {
        deckKey = d.key;
        store.set('deck', deckKey);
        start();
      });
      row.appendChild(b);
    });
  }
  function dueCount(items) {
    var now = Date.now();
    var n = 0;
    for (var i = 0; i < items.length; i++) {
      var s = srs[items[i].zh];
      if (s && s.due <= now) n++;
    }
    return n;
  }
  function start() {
    var d = currentDeck();
    var now = Date.now();
    var due = [];
    var fresh = [];
    d.items.forEach(function (v) {
      var s = srs[v.zh];
      if (!s) fresh.push(v);
      else if (s.due <= now) due.push(v);
    });
    queue = due.concat(fresh.slice(0, NEW_PER_SESSION));
    var learned = d.items.filter(function (v) {
      return srs[v.zh] && srs[v.zh].b >= 3;
    }).length;
    var seen = d.items.filter(function (v) {
      return srs[v.zh];
    }).length;
    $('deck-stats').textContent =
      d.items.length +
      ' mots · ' + seen + ' déjà vus · ' + learned + ' bien connus · cette séance : ' + due.length + ' à revoir + ' + Math.min(fresh.length, NEW_PER_SESSION) + ' nouveaux';
    renderDecks();
    next();
  }
  function next() {
    current = queue.shift() || null;
    var fc = $('flashcard');
    var done = $('cards-done');
    if (!current) {
      fc.hidden = true;
      done.hidden = false;
      var d = currentDeck();
      done.innerHTML = d.items.length
        ? '<strong>Séance terminée !</strong> Revenez demain pour les prochaines révisions, ou choisissez un autre paquet.'
        : d.key === 'mes'
        ? 'Aucun mot enregistré : dans une conversation, touchez un mot puis « ＋ Carte ».'
        : 'Ce paquet est vide pour l\'instant.';
      return;
    }
    done.hidden = true;
    fc.hidden = false;
    $('fc-hz').textContent = current.zh;
    $('fc-py').textContent = current.py || '';
    $('fc-zy').textContent = current.zy || '';
    $('fc-def').textContent = current.fr || '';
    $('fc-ex').textContent = current.ex || '';
    $('fc-exfr').textContent = current.exfr || '';
    var link = $('fc-link');
    if (current.href) {
      link.href = current.href;
      link.hidden = false;
    } else link.hidden = true;
    $('fc-back').hidden = true;
    $('fc-show').hidden = false;
    ['fc-again', 'fc-good', 'fc-easy'].forEach(function (id) {
      $(id).hidden = true;
    });
  }
  function show() {
    $('fc-back').hidden = false;
    $('fc-show').hidden = true;
    ['fc-again', 'fc-good', 'fc-easy'].forEach(function (id) {
      $(id).hidden = false;
    });
  }
  function grade(g) {
    if (!current) return;
    var s = srs[current.zh] || { b: 0, due: 0 };
    if (g === 0) {
      s.b = 0;
      s.due = Date.now();
      queue.splice(Math.min(3, queue.length), 0, current); // revient bientôt
    } else {
      s.b = Math.min(INTERVALS.length - 1, s.b + g);
      s.due = Date.now() + INTERVALS[s.b] * DAY - 3600000;
    }
    srs[current.zh] = s;
    store.set('srs', srs);
    next();
  }
  $('fc-show').addEventListener('click', show);
  $('fc-again').addEventListener('click', function () {
    grade(0);
  });
  $('fc-good').addEventListener('click', function () {
    grade(1);
  });
  $('fc-easy').addEventListener('click', function () {
    grade(2);
  });
  document.addEventListener('keydown', function (e) {
    if (/INPUT|TEXTAREA/.test(e.target.tagName) || !current) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if ($('fc-back').hidden) show();
      else grade(1);
    } else if (!$('fc-back').hidden && (e.key === '1' || e.key === '2' || e.key === '3')) grade(parseInt(e.key, 10) - 1);
  });

  // audio
  var audio = $('fc-audio');
  if (!('speechSynthesis' in window)) audio.style.display = 'none';
  audio.addEventListener('click', function () {
    if (!current) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(current.zh);
    var vs = window.speechSynthesis.getVoices() || [];
    var v = vs.filter(function (x) {
      return /zh[-_]TW/i.test(x.lang);
    })[0] || vs.filter(function (x) {
      return /^zh/i.test(x.lang);
    })[0];
    if (v) u.voice = v;
    u.lang = v ? v.lang : 'zh-TW';
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  });

  // export Anki et remise à zéro
  $('cards-export').addEventListener('click', function () {
    var d = currentDeck();
    var lines = d.items.map(function (v) {
      return [v.zh, v.py, v.zy, v.fr, v.ex, v.exfr, v.id ? 'n° ' + String(v.id).padStart(3, '0') : '']
        .map(function (x) {
          return String(x || '').replace(/[\t\n]/g, ' ');
        })
        .join('\t');
    });
    var blob = new Blob([lines.join('\n') + '\n'], { type: 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'lecture-louange-' + d.key + '.txt';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 500);
  });
  $('cards-reset').addEventListener('click', function () {
    var d = currentDeck();
    if (!window.confirm('Remettre à zéro la progression du paquet « ' + d.label + ' » ?')) return;
    d.items.forEach(function (v) {
      delete srs[v.zh];
    });
    store.set('srs', srs);
    start();
  });
  start();
})();
