/* audio.js – Sprachausgabe (Vorlesen) und ruhige Klänge.
   Alles offline, ohne externe Dateien. Fehlerfreundlich: nie ein Strafton.
   Warme, freundliche Stimme + weiche Melodien. */

const Audio = (() => {
  let tonAn = true;
  let spracheAn = true;
  let ctx = null;
  let besteStimme = null;
  let stimmeName = null;   // vom Elternteil gewählte Stimme (Name)

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
  // Bewertet, wie natürlich/freundlich eine Stimme klingt (höher = besser).
  function stimmScore(v) {
    const n = (v.name || '').toLowerCase();
    const lang = (v.lang || '').toLowerCase();
    let s = 0;
    if (/(neural|natural|enhanced|premium|wavenet|siri)/.test(n)) s += 8; // hochwertige Stimmen
    if (/google/.test(n)) s += 5;                                          // Google-Netzstimmen klingen natürlich
    if (/(anna|helena|petra|marlene|katja|vicki|klara|milena|sandy|amira|female|weiblich)/.test(n)) s += 3;
    if (!v.localService) s += 2;                                           // Netzstimmen sind oft natürlicher
    if (lang === 'de-de') s += 2; else if (lang === 'de-ch' || lang === 'de-at') s += 1;
    if (/(espeak|compact|eloquence|robot|pico)/.test(n)) s -= 8;           // typische Roboterstimmen
    return s;
  }

  function stimmeWaehlen() {
    if (!('speechSynthesis' in window)) return null;
    const alle = window.speechSynthesis.getVoices();
    if (!alle.length) return null;
    // Vom Elternteil gewählte Stimme hat Vorrang
    if (stimmeName) {
      const gewaehlt = alle.find(v => v.name === stimmeName);
      if (gewaehlt) return gewaehlt;
    }
    const de = alle.filter(v => v.lang && v.lang.toLowerCase().startsWith('de'));
    const pool = de.length ? de : alle;
    return pool.slice().sort((a, b) => stimmScore(b) - stimmScore(a))[0];
  }

  // Liste deutscher Stimmen für die Auswahl im Eltern-Bereich (beste zuerst)
  function stimmen() {
    if (!('speechSynthesis' in window)) return [];
    const alle = window.speechSynthesis.getVoices();
    const de = alle.filter(v => v.lang && v.lang.toLowerCase().startsWith('de'));
    return (de.length ? de : alle).slice()
      .sort((a, b) => stimmScore(b) - stimmScore(a))
      .map(v => ({ name: v.name, lang: v.lang, lokal: v.localService }));
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
      u.rate = 0.95;   // ruhig, aber nicht schleppend
      u.pitch = 1.15;  // leicht höher = wärmer/kindgerechter (nicht schrill)
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
    richtig, falsch, tipp, jubel, sprich, stopp, ton, lob, stimmen,
    get tonAn() { return tonAn; },
    get spracheAn() { return spracheAn; },
    get stimme() { return stimmeName; },
    setTon(v) { tonAn = v; },
    setSprache(v) { spracheAn = v; if (!v) stopp(); },
    setStimme(name) { stimmeName = name || null; besteStimme = stimmeWaehlen(); },
  };
})();
