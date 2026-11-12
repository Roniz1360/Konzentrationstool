/* audio.js – Sprachausgabe (Vorlesen) und Spielklänge.
   Alles wird im Code erzeugt (Web Audio): offline, ohne Dateien.
   Ein gemeinsames Mischpult für Klänge, Musik und Naturstimmung, mit
   weichem Hall. Fehlerfreundlich: nie ein Strafton. */

const Audio = (() => {
  let tonAn = true;
  let spracheAn = true;
  let ctx = null, pult = null;
  let besteStimme = null;
  let stimmeName = null;   // vom Elternteil gewählte Stimme (Name)

  // ---------- Mischpult ----------
  function mischpult() {
    if (pult) return pult;
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { ctx = null; return null; }
    const master = ctx.createGain(); master.gain.value = 0.9;
    const komp = ctx.createDynamicsCompressor();
    komp.threshold.value = -14; komp.ratio.value = 4;
    master.connect(komp); komp.connect(ctx.destination);
    // Hall: kurzer, weicher Raum aus Rauschen berechnet
    const hall = ctx.createConvolver();
    const len = Math.floor(ctx.sampleRate * 1.7), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let k = 0; k < 2; k++) { const d = ir.getChannelData(k); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    hall.buffer = ir;
    const hallAus = ctx.createGain(); hallAus.gain.value = 0.5;
    hall.connect(hallAus); hallAus.connect(master);
    const bus = (laut, hallAnteil) => {
      const g = ctx.createGain(); g.gain.value = laut; g.connect(master);
      const s = ctx.createGain(); s.gain.value = hallAnteil; g.connect(s); s.connect(hall);
      return g;
    };
    // Rauschen für Wind, Wasser, Wusch
    const rausch = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const rd = rausch.getChannelData(0); let b = 0;
    for (let i = 0; i < rd.length; i++) { const w = Math.random() * 2 - 1; b = 0.97 * b + 0.03 * w; rd[i] = w * 0.5 + b * 4; }
    pult = { ctx, master, klang: bus(1, 0.22), musik: bus(1, 0.3), natur: bus(1, 0.25), rausch };
    return pult;
  }
  function wecken() { const p = mischpult(); if (p && p.ctx.state === 'suspended') p.ctx.resume().catch(() => {}); return p; }
  document.addEventListener('pointerdown', wecken, { capture: true });
  // App im Hintergrund -> alles still
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) { ctx.suspend().catch(() => {}); stopp(); } else ctx.resume().catch(() => {});
  });

  // ---------- Bausteine ----------
  // Weicher Ton mit Hüllkurve. opt: typ, laut, an (Einschwingen), zu (Frequenz-Ziel), wann (Verzögerung in s)
  function ton(freq, dauer = 0.18, typ = 'sine', laut = 0.14, opt = {}) {
    if (!tonAn) return;
    const p = wecken(); if (!p) return;
    const c = p.ctx, t = c.currentTime + (opt.wann || 0);
    const osc = c.createOscillator(), g = c.createGain();
    osc.type = typ; osc.frequency.setValueAtTime(freq, t);
    if (opt.zu) osc.frequency.exponentialRampToValueAtTime(opt.zu, t + dauer);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(laut, t + (opt.an || 0.012));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
    osc.connect(g); g.connect(p.klang);
    osc.start(t); osc.stop(t + dauer + 0.03);
  }
  // Marimba-/Glockenton: Grundton + heller Oberton, der schnell verklingt
  function glocke(freq, dauer = 0.5, laut = 0.16, wann = 0) {
    ton(freq, dauer, 'sine', laut, { wann });
    ton(freq * 4, dauer * 0.25, 'sine', laut * 0.22, { wann });
    ton(freq * 2, dauer * 0.5, 'triangle', laut * 0.18, { wann });
  }
  // Rauschen durch Filter (Wusch, Platsch)
  function rauschen(dauer, f1, f2, laut = 0.1, q = 1, wann = 0) {
    if (!tonAn) return;
    const p = wecken(); if (!p) return;
    const c = p.ctx, t = c.currentTime + wann;
    const s = c.createBufferSource(); s.buffer = p.rausch;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = q;
    f.frequency.setValueAtTime(f1, t); f.frequency.exponentialRampToValueAtTime(f2, t + dauer);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(laut, t + dauer * 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
    s.connect(f); f.connect(g); g.connect(p.klang);
    s.start(t, Math.random()); s.stop(t + dauer + 0.05);
  }

  // ---------- Spielklänge ----------
  const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.5];   // C-Dur-Pentatonik
  let serie = 0;   // steigt bei richtigen Antworten in Folge -> Melodie klettert (kein Druck, nur Freude)
  function richtig() {
    const i = Math.min(serie, 5); serie++;
    glocke(PENTA[i], 0.35, 0.15); glocke(PENTA[i + 2], 0.5, 0.15, 0.09);
    ton(PENTA[i + 2] * 2, 0.3, 'sine', 0.04, { wann: 0.16 });
  }
  // Sanftes, tiefes «hm» bei falsch – kein Drama, kein Strafton
  function falsch() { serie = 0; ton(300, 0.26, 'sine', 0.1, { zu: 240, an: 0.03 }); ton(150, 0.26, 'triangle', 0.05, { an: 0.03 }); }
  function tipp(pitch = 1) { ton(620 * pitch, 0.07, 'sine', 0.09, { zu: 420 * pitch }); ton(1240 * pitch, 0.03, 'triangle', 0.03); }
  function plopp(pitch = 1) { ton(260 * pitch, 0.12, 'sine', 0.16, { zu: 720 * pitch }); }
  function wusch() { rauschen(0.32, 500, 3200, 0.1, 0.8); }
  function platsch() { rauschen(0.4, 2400, 500, 0.14, 0.7); ton(420, 0.16, 'sine', 0.08, { zu: 160 }); }
  function blubb() { ton(380, 0.1, 'sine', 0.09, { zu: 940 }); }
  function funkeln() { [2093, 2637, 3136, 2637, 3520].forEach((f, i) => ton(f, 0.16, 'sine', 0.035, { wann: i * 0.055 })); }
  function kristall(i) { glocke(PENTA[i % PENTA.length] * (i >= 8 ? 2 : 1), 0.7, 0.16); }
  function sternKlang(n = 0) { glocke(PENTA[2 + n * 2] || 1568, 0.6, 0.17); funkeln(); }
  function regel() { wusch(); glocke(784, 0.3, 0.1, 0.12); glocke(1046.5, 0.4, 0.1, 0.24); }
  // Sticker fliegt ins Album: aufsteigendes «Wuusch», dann ein weiches «Plopp» mit Glitzer
  function flug() { wusch(); [392, 494, 587, 698, 784, 880].forEach((f, i) => ton(f, 0.1, 'triangle', 0.05, { wann: i * 0.07 })); }
  function klebt() { plopp(0.8); setTimeout(funkeln, 90); }
  function jubel() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => glocke(f, 0.5, 0.14, i * 0.11));
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f) => glocke(f, 1.2, 0.07, 0.5));
    setTimeout(funkeln, 560);
  }
  function serieNeu() { serie = 0; }

  // ---------- Stimme ----------
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
    richtig, falsch, tipp, jubel, flug, klebt, sprich, stopp, ton, glocke, lob, stimmen,
    plopp, wusch, platsch, blubb, funkeln, kristall, sternKlang, regel, serieNeu,
    mischpult, wecken,
    get tonAn() { return tonAn; },
    get spracheAn() { return spracheAn; },
    get stimme() { return stimmeName; },
    setTon(v) { tonAn = v; },
    setSprache(v) { spracheAn = v; if (!v) stopp(); },
    setStimme(name) { stimmeName = name || null; besteStimme = stimmeWaehlen(); },
  };
})();
