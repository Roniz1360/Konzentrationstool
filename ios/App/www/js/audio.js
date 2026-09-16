/* audio.js – Sprachausgabe (Vorlesen) und ruhige Klänge.
   Alles offline, ohne externe Dateien. Fehlerfreundlich: nie ein Strafton.
   Warme, freundliche Stimme + weiche Melodien. */

const Audio = (() => {
  let tonAn = true;
  let spracheAn = true;
  let ctx = null;
  let besteStimme = null;

  function ctxHolen() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { ctx = null; }
    }
    return ctx;
  }

  // Kurzer, weicher Ton (kein harter Strafton bei Fehlern)
  function ton(freq, dauer = 0.18, typ = 'sine', laut = 0.14) {
    if (!tonAn) return;
    const c = ctxHolen();
    if (!c) return;
    if (c.state === 'suspended') c.resume();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = typ;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(laut, c.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dauer);
    osc.connect(g); g.connect(c.destination);
    osc.start(); osc.stop(c.currentTime + dauer);
  }

  // Freundliche kleine Melodie bei richtig (weich, ansteigend)
  function richtig() { ton(660, 0.12, 'sine'); setTimeout(() => ton(880, 0.16, 'sine'), 90); }
  // Sanftes, tiefes „hm" bei falsch – kein Drama, kein Strafton
  function falsch() { ton(330, 0.20, 'sine', 0.09); }
  function tipp(pitch = 1) { ton(500 * pitch, 0.08, 'triangle', 0.07); }
  function jubel() { [523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => ton(f, 0.20, 'sine'), i * 110)); }

  // Eine freundliche, warm klingende Stimme auswählen (weiblich/kindgerecht bevorzugt)
  function stimmeWaehlen() {
    if (!('speechSynthesis' in window)) return null;
    const alle = window.speechSynthesis.getVoices();
    if (!alle.length) return null;
    const de = alle.filter(v => v.lang && v.lang.toLowerCase().startsWith('de'));
    const pool = de.length ? de : alle;
    // Bekannte, freundlich klingende (meist weibliche) deutsche Stimmen zuerst
    const wunsch = ['petra','anna','marlene','vicki','katja','helena','sandy','klara',
                    'google deutsch','markus','yannick'];
    for (const name of wunsch) {
      const f = pool.find(v => v.name.toLowerCase().includes(name));
      if (f) return f;
    }
    // sonst lokale Stimme bevorzugen (klingt oft natürlicher)
    return pool.find(v => v.localService) || pool[0];
  }

  // Anweisungen/Lob vorlesen – warm, ruhig, nicht hektisch
  function sprich(text) {
    if (!spracheAn) return;
    // In der Android-App: native deutsche Stimme (klingt natürlicher als im WebView)
    if (window.AndroidTTS && typeof window.AndroidTTS.speak === 'function') {
      try { window.AndroidTTS.speak(text); } catch (e) {}
      return;
    }
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (!besteStimme) besteStimme = stimmeWaehlen();
      if (besteStimme) { u.voice = besteStimme; u.lang = besteStimme.lang; }
      else u.lang = 'de-DE';
      u.rate = 0.9;    // etwas langsamer = freundlicher, besser verständlich
      u.pitch = 1.2;   // etwas höher = wärmer, kindgerechter
      u.volume = 1;
      window.speechSynthesis.speak(u);
    } catch (e) { /* still */ }
  }

  function stopp() {
    if (window.AndroidTTS && typeof window.AndroidTTS.stop === 'function') { try { window.AndroidTTS.stop(); } catch (e) {} }
    try { window.speechSynthesis.cancel(); } catch (e) {}
  }

  // Warme, abwechslungsreiche Lob-Sätze (nie über Tempo/Highscore)
  const LOB = [
    'Toll gemacht!', 'Das hast du prima gemacht!', 'Super, ich bin stolz auf dich!',
    'Klasse, weiter so!', 'Wunderbar!', 'Du machst das richtig gut!', 'Schön dranbleiben!'
  ];
  function lob() { return LOB[Math.floor(Math.random() * LOB.length)]; }

  // Stimmenliste kann verzögert laden
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => { besteStimme = stimmeWaehlen(); };
    window.speechSynthesis.getVoices();
  }

  return {
    richtig, falsch, tipp, jubel, sprich, stopp, ton, lob,
    get tonAn() { return tonAn; },
    get spracheAn() { return spracheAn; },
    setTon(v) { tonAn = v; },
    setSprache(v) { spracheAn = v; if (!v) stopp(); },
  };
})();
