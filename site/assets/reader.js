// Lecteur : interrupteurs pinyin / traduction / 简繁, définitions au toucher, synthèse vocale.
(function () {
  'use strict';
  var reader = document.getElementById('smart-reader');
  if (!reader) return;

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

  var pyToggle = document.getElementById('pinyin-toggle');
  var trToggle = document.getElementById('trans-toggle');
  var btnSimp = document.getElementById('script-simp');
  var btnTrad = document.getElementById('script-trad');
  var script = store.get('script', 'trad');
  pyToggle.checked = !!store.get('pinyin', false);
  trToggle.checked = !!store.get('trans', false);

  function applyScript() {
    var els = document.querySelectorAll('.hz, .punct');
    for (var i = 0; i < els.length; i++) {
      var t = els[i].getAttribute('data-' + script);
      if (t !== null) els[i].textContent = t;
    }
    btnSimp.setAttribute('aria-pressed', String(script === 'simp'));
    btnTrad.setAttribute('aria-pressed', String(script === 'trad'));
    reader.setAttribute('lang', script === 'simp' ? 'zh-Hans' : 'zh-Hant');
  }
  function apply() {
    reader.classList.toggle('show-pinyin', pyToggle.checked);
    reader.classList.toggle('show-trans', trToggle.checked);
  }
  pyToggle.addEventListener('change', function () {
    store.set('pinyin', pyToggle.checked);
    apply();
  });
  trToggle.addEventListener('change', function () {
    store.set('trans', trToggle.checked);
    apply();
  });
  btnSimp.addEventListener('click', function () {
    script = 'simp';
    store.set('script', script);
    applyScript();
  });
  btnTrad.addEventListener('click', function () {
    script = 'trad';
    store.set('script', script);
    applyScript();
  });
  apply();
  if (script !== 'trad') applyScript();

  // ---------- pinyin ou zhuyin ----------
  var btnPy = document.getElementById('phon-py');
  var btnZy = document.getElementById('phon-zy');
  var phon = store.get('phon', 'py');
  function applyPhon() {
    var chars = reader.querySelectorAll('.char');
    var attr = phon === 'zy' ? 'data-zhuyin' : 'data-pinyin';
    for (var i = 0; i < chars.length; i++) {
      var rt = chars[i].querySelector('rt');
      if (rt) rt.textContent = chars[i].getAttribute(attr) || '';
    }
    reader.classList.toggle('phon-zy', phon === 'zy');
    if (btnPy) btnPy.setAttribute('aria-pressed', String(phon === 'py'));
    if (btnZy) btnZy.setAttribute('aria-pressed', String(phon === 'zy'));
  }
  if (btnPy && btnZy) {
    btnPy.addEventListener('click', function () {
      phon = 'py';
      store.set('phon', phon);
      applyPhon();
      if (!pyToggle.checked) pyToggle.click();
    });
    btnZy.addEventListener('click', function () {
      phon = 'zy';
      store.set('phon', phon);
      applyPhon();
      if (!pyToggle.checked) pyToggle.click();
    });
  }
  if (phon !== 'py') applyPhon();

  // ---------- synthèse vocale (voix chinoise du système, Taïwan de préférence) ----------
  var hasTTS = 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  if (!hasTTS) document.body.classList.add('no-tts');
  function pickVoice() {
    var vs = window.speechSynthesis.getVoices() || [];
    var pref = [/zh[-_]TW/i, /zh[-_]HK/i, /cmn/i, /^zh/i];
    for (var p = 0; p < pref.length; p++)
      for (var i = 0; i < vs.length; i++) if (pref[p].test(vs[i].lang)) return vs[i];
    return null;
  }
  function speak(text, btn) {
    if (!hasTTS || !text) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    var v = pickVoice();
    if (v) u.voice = v;
    u.lang = v ? v.lang : 'zh-TW';
    u.rate = 0.8;
    if (btn) btn.classList.add('playing');
    u.onend = u.onerror = function () {
      if (btn) btn.classList.remove('playing');
    };
    window.speechSynthesis.speak(u);
  }
  if (hasTTS) window.speechSynthesis.getVoices();

  // ---------- boîte de définition ----------
  var box = document.getElementById('definition-box');
  var dHanzi = box.querySelector('.def-hanzi');
  var dPinyin = box.querySelector('.def-pinyin');
  var dMeaning = box.querySelector('.def-meaning');
  var dTrans = box.querySelector('.def-trans-text');
  var dZhuyin = box.querySelector('.def-zhuyin');
  var btnSave = box.querySelector('.def-save');
  var btnWord = box.querySelector('.def-audio:not([data-what])');
  var btnSentence = box.querySelector('.def-audio[data-what="sentence"]');
  var active = null;
  var activeSentence = null;
  var storyId = parseInt(reader.getAttribute('data-story'), 10);

  // cartes enregistrées
  function savedCards() {
    return store.get('cards', []);
  }
  function isSaved(zh) {
    var c = savedCards();
    for (var i = 0; i < c.length; i++) if (c[i].zh === zh) return true;
    return false;
  }
  function refreshSave() {
    if (!btnSave || !active) return;
    var zh = active.querySelector('.hz').getAttribute('data-trad');
    var on = isSaved(zh);
    btnSave.setAttribute('aria-pressed', String(on));
    btnSave.textContent = on ? '✓ Carte' : '＋ Carte';
  }
  if (btnSave)
    btnSave.addEventListener('click', function () {
      if (!active) return;
      var hz = active.querySelector('.hz');
      var zh = hz.getAttribute('data-trad');
      var c = savedCards();
      var idx = -1;
      for (var i = 0; i < c.length; i++) if (c[i].zh === zh) idx = i;
      if (idx >= 0) c.splice(idx, 1);
      else
        c.push({
          zh: zh,
          s: hz.getAttribute('data-simp'),
          py: active.getAttribute('data-pinyin'),
          zy: active.getAttribute('data-zhuyin'),
          fr: active.getAttribute('data-def') || '',
          id: storyId,
          href: location.pathname.split('/').slice(-2).join('/'),
          ex: activeSentence ? sentenceText(activeSentence) : '',
          exfr: activeSentence ? activeSentence.getAttribute('data-trans') : '',
        });
      store.set('cards', c);
      refreshSave();
    });

  function sentenceText(sentence) {
    var parts = sentence.querySelectorAll('.zh .hz, .zh .punct');
    var s = '';
    for (var i = 0; i < parts.length; i++) s += parts[i].textContent;
    return s;
  }
  function open(ch) {
    if (active) active.classList.remove('active');
    active = ch;
    ch.classList.add('active');
    activeSentence = ch.closest('.sentence');
    var hz = ch.querySelector('.hz');
    dHanzi.textContent = hz ? hz.textContent : '';
    dHanzi.setAttribute('lang', script === 'simp' ? 'zh-Hans' : 'zh-Hant');
    dPinyin.textContent = ch.getAttribute('data-pinyin') || '';
    if (dZhuyin) dZhuyin.textContent = ch.getAttribute('data-zhuyin') || '';
    var def = ch.getAttribute('data-def');
    dMeaning.textContent = def || 'Pas de définition pour ce mot.';
    dMeaning.classList.toggle('empty', !def);
    dTrans.textContent = activeSentence ? activeSentence.getAttribute('data-trans') : '';
    box.classList.add('visible');
    refreshSave();
  }
  function close() {
    if (active) active.classList.remove('active');
    active = null;
    box.classList.remove('visible');
    if (hasTTS) window.speechSynthesis.cancel();
  }
  reader.addEventListener('click', function (e) {
    var ch = e.target.closest('.char');
    if (!ch) return;
    if (ch === active) {
      close();
      return;
    }
    open(ch);
  });
  document.addEventListener('click', function (e) {
    if (!active) return;
    if (box.contains(e.target) || e.target.closest('.char')) return;
    close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      close();
      stopListening();
      return;
    }
    var tag = (e.target && e.target.tagName) || '';
    if (/INPUT|TEXTAREA|SELECT/.test(tag) || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      var a = document.querySelector(e.key === 'ArrowLeft' ? '.story-nav .nav-prev' : '.story-nav .nav-next');
      if (a) location.href = a.href;
    } else if (e.key === 'p' || e.key === 'P') pyToggle.click();
    else if (e.key === 't' || e.key === 'T') trToggle.click();
  });

  // ---------- lecture à voix haute de toute la conversation ----------
  var listenBtn = document.getElementById('listen-all');
  var listening = false;
  var sentences = reader.querySelectorAll('.sentence');
  function clearSpeaking() {
    var s = reader.querySelectorAll('.sentence.speaking');
    for (var i = 0; i < s.length; i++) s[i].classList.remove('speaking');
  }
  function stopListening() {
    if (!listening) return;
    listening = false;
    if (hasTTS) window.speechSynthesis.cancel();
    clearSpeaking();
    if (listenBtn) {
      listenBtn.setAttribute('aria-pressed', 'false');
      listenBtn.textContent = '🔊 Écouter';
    }
  }
  function playFrom(i) {
    if (!listening || i >= sentences.length) {
      stopListening();
      return;
    }
    clearSpeaking();
    var sen = sentences[i];
    sen.classList.add('speaking');
    sen.scrollIntoView({ block: 'center', behavior: 'smooth' });
    var u = new SpeechSynthesisUtterance(sentenceText(sen));
    var v = pickVoice();
    if (v) u.voice = v;
    u.lang = v ? v.lang : 'zh-TW';
    u.rate = 0.8;
    u.onend = function () {
      setTimeout(function () {
        playFrom(i + 1);
      }, 250);
    };
    u.onerror = function () {
      stopListening();
    };
    window.speechSynthesis.speak(u);
  }
  if (listenBtn) {
    if (!hasTTS) listenBtn.parentNode.style.display = 'none';
    listenBtn.addEventListener('click', function () {
      if (listening) {
        stopListening();
        return;
      }
      listening = true;
      listenBtn.setAttribute('aria-pressed', 'true');
      listenBtn.textContent = '■ Arrêter';
      window.speechSynthesis.cancel();
      playFrom(0);
    });
  }
  box.querySelector('.def-close').addEventListener('click', close);
  btnWord.addEventListener('click', function () {
    speak(dHanzi.textContent, btnWord);
  });
  btnSentence.addEventListener('click', function () {
    if (activeSentence) speak(sentenceText(activeSentence), btnSentence);
  });

  // ---------- progression : dernière conversation ouverte, conversations lues ----------
  var id = parseInt(reader.getAttribute('data-story'), 10);
  var here = location.pathname.split('/').slice(-2).join('/');
  store.set('last', { id: id, href: here });
  var nav = document.querySelector('.story-nav');
  function markRead() {
    var read = store.get('read', []);
    if (read.indexOf(id) < 0) {
      read.push(id);
      store.set('read', read);
    }
  }
  if (nav && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        markRead();
        io.disconnect();
      }
    });
    io.observe(nav);
  }
})();
