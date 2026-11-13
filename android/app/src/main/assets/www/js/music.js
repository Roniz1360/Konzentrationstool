/* music.js – Hintergrundmusik und Naturstimmung, komplett im Code erzeugt.
   Musik: eigene, ruhige Stücke (Marimba, weiche Fläche, sanfter Bass) –
          keine echten Songs, keine Dateien.
   Natur: Wellen, Möwen, Luftblasen, Walgesang, Delfine, Wassertropfen –
          passend zum Ort und zur Tageszeit.
   Beides leise gehalten und im Eltern-Bereich abschaltbar. */

const Music = (() => {
  let enabled = true, current = null, timer = null, aus = null;
  let step = 0, bar = 0, nextTime = 0, track = null, P = null;
  const LOOKAHEAD = 0.14, TICK = 30;

  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const SKALA = [60, 62, 64, 67, 69, 72, 74, 76, 79, 81];          // C-Dur-Pentatonik
  const AKKORD = { C: [48, 55, 60, 64], a: [45, 52, 57, 60], F: [41, 48, 53, 57], G: [43, 50, 55, 59], d: [38, 45, 50, 53], e: [40, 47, 52, 55] };

  // Melodien: je Takt 8 Achtel. Ziffer = Ton der Skala, Punkt = Pause.
  const TRACKS = {
    menu:   { bpm: 86,  laut: 0.5,  akk: ['C', 'a', 'F', 'G', 'C', 'e', 'F', 'G'], bass: [0, 4], schlag: 0,
              mel: ['2.3.5.3.', '4.3.2...', '5.4.3.2.', '3...1...', '2.3.5.7.', '6.5.4...', '3.4.5.3.', '2...0...'] },
    intro:  { bpm: 104, laut: 0.55, akk: ['C', 'G', 'a', 'F'], bass: [0, 3, 6], schlag: 1,
              mel: ['5.57.5.3', '4.45.4.2', '3.35.7.8', '7.6.5...'] },
    spiel:  { bpm: 76,  laut: 0.3,  akk: ['a', 'F', 'C', 'G'], bass: [0], schlag: 0,
              mel: ['2.......', '....4...', '3.......', '....1...'] },
    finale: { bpm: 116, laut: 0.6,  akk: ['C', 'F', 'G', 'C'], bass: [0, 2, 4, 6], schlag: 2,
              mel: ['5.7.8.7.', '9.8.7.5.', '5.7.8.9.', '8...8...'] },
  };

  // ---------- Instrumente ----------
  function stimme(t, freq, dauer, laut, typ, an = 0.01) {
    const c = P.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = typ; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(laut, t + an);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
    o.connect(g); g.connect(aus);
    o.start(t); o.stop(t + dauer + 0.05);
  }
  const marimba = (t, m, laut) => { const f = mtof(m); stimme(t, f, 0.7, laut, 'sine'); stimme(t, f * 4, 0.12, laut * 0.2, 'sine'); stimme(t, f * 2, 0.3, laut * 0.15, 'triangle'); };
  const flaeche = (t, midis, dauer, laut) => midis.forEach((m) => {
    const c = P.ctx, o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    o.type = 'triangle'; o.frequency.value = mtof(m + 12); f.type = 'lowpass'; f.frequency.value = 900;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(laut, t + dauer * 0.35); g.gain.linearRampToValueAtTime(0.0001, t + dauer);
    o.connect(f); f.connect(g); g.connect(aus); o.start(t); o.stop(t + dauer + 0.05);
  });
  function zisch(t, laut) {
    const c = P.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = P.rausch; f.type = 'highpass'; f.frequency.value = 6000;
    g.gain.setValueAtTime(laut, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    s.connect(f); f.connect(g); g.connect(aus); s.start(t, Math.random()); s.stop(t + 0.08);
  }

  function playStep(i, b, t) {
    const tr = track, n = tr.akk.length, akk = AKKORD[tr.akk[b % n]], spb = 60 / tr.bpm / 2;
    if (i === 0) flaeche(t, akk.slice(1), spb * 8.4, 0.045);
    if (tr.bass.includes(i)) stimme(t, mtof(akk[i === 0 ? 0 : 1] ), spb * 2.4, 0.16, 'sine', 0.02);
    const ch = tr.mel[b % tr.mel.length][i];
    if (ch !== '.') marimba(t, SKALA[+ch], 0.13);
    if (tr.schlag && i % 2 === 1) zisch(t, 0.02 * tr.schlag);
    if (tr.schlag === 2 && i % 4 === 0) stimme(t, 110, 0.14, 0.2, 'sine', 0.004);
  }

  function scheduler() {
    if (!P || !track || P.ctx.state !== 'running') return;
    if (nextTime < P.ctx.currentTime - 0.3) nextTime = P.ctx.currentTime + 0.05;   // nach Pause neu ansetzen
    while (nextTime < P.ctx.currentTime + LOOKAHEAD) {
      playStep(step, bar, nextTime);
      nextTime += 60 / track.bpm / 2;
      if (++step >= 8) { step = 0; bar++; }
    }
  }

  function blende(zu, sek) {
    if (!aus) return;
    const now = P.ctx.currentTime;
    aus.gain.cancelScheduledValues(now);
    aus.gain.setValueAtTime(Math.max(0.0001, aus.gain.value), now);
    aus.gain.linearRampToValueAtTime(Math.max(0.0001, zu), now + sek);
  }

  function play(name) {
    if (!TRACKS[name]) return;
    const neu = name !== current;
    current = name;
    if (!enabled) return;
    P = Audio.mischpult(); if (!P) return;
    if (!aus) { aus = P.ctx.createGain(); aus.gain.value = 0.0001; aus.connect(P.musik); }
    if (neu || !track) { track = TRACKS[name]; step = 0; bar = 0; nextTime = P.ctx.currentTime + 0.08; }
    blende(track.laut, 0.6);
    if (!timer) timer = setInterval(scheduler, TICK);
  }
  function stop() {
    if (aus) blende(0.0001, 0.4);
    if (timer) { clearInterval(timer); timer = null; }
    track = null;
  }
  function setEnabled(v) { enabled = !!v; if (!enabled) stop(); else if (current) play(current); }

  return { play, stop, setEnabled, get enabled() { return enabled; } };
})();

// ================================================================
// NATURSTIMMUNG
// ================================================================
const Natur = (() => {
  let enabled = true, name = null, P = null, aus = null;
  let schichten = {}, uhren = [];
  const zuf = (a, b) => a + Math.random() * (b - a);

  // Was an welchem Ort zu hören ist (Lautstärke bzw. Häufigkeit)
  const ORTE = {
    // An der Wasseroberfläche (Karte, Titel) – je nach Tageszeit
    morgen:  { wellen: 0.05, moewen: 1.2, blasen: 0.5 },
    tag:     { wellen: 0.05, moewen: 0.8, blasen: 0.5 },
    abend:   { wellen: 0.05, moewen: 0.3, blasen: 0.5 },
    nacht:   { wellen: 0.04, blasen: 0.5, wal: 0.5 },
    // Unter Wasser
    riff:    { tief: 0.07, blasen: 1, delfin: 0.6 },
    seegras: { tief: 0.07, blasen: 0.8, wasser: 0.02 },
    wasser:  { tief: 0.1, blasen: 1.2 },
    tiefsee: { tief: 0.12, blasen: 0.4, wal: 1 },
    grotte:  { tief: 0.08, tropfen: 1, wal: 0.4 },
  };

  function klang(freq, dauer, laut, opt = {}) {
    const c = P.ctx, t = c.currentTime + (opt.wann || 0), o = c.createOscillator(), g = c.createGain();
    o.type = opt.typ || 'sine'; o.frequency.setValueAtTime(freq, t);
    if (opt.zu) o.frequency.exponentialRampToValueAtTime(opt.zu, t + dauer);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(laut, t + Math.min(0.02, dauer * 0.3)); g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
    let ziel = aus;
    if (opt.pan != null && c.createStereoPanner) { const pn = c.createStereoPanner(); pn.pan.value = opt.pan; pn.connect(aus); ziel = pn; }
    o.connect(g); g.connect(ziel); o.start(t); o.stop(t + dauer + 0.05);
  }
  // Dauerschicht: Rauschen durch Filter, sanft schwankend
  function schicht(typ, freq, q, laut) {
    const c = P.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
    s.buffer = P.rausch; s.loop = true; f.type = typ; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(0.0001, c.currentTime); g.gain.linearRampToValueAtTime(laut, c.currentTime + 1.5);
    lfo.frequency.value = zuf(0.07, 0.16); lg.gain.value = laut * 0.5; lfo.connect(lg); lg.connect(g.gain);
    s.connect(f); f.connect(g); g.connect(aus); s.start(0, Math.random()); lfo.start();
    return { stopp() { try { g.gain.cancelScheduledValues(c.currentTime); g.gain.setValueAtTime(g.gain.value, c.currentTime); g.gain.linearRampToValueAtTime(0.0001, c.currentTime + 0.8); s.stop(c.currentTime + 0.9); lfo.stop(c.currentTime + 0.9); } catch (e) {} } };
  }

  // ---------- Einzelne Naturklänge ----------
  const EREIGNIS = {
    voegel() {
      const pan = zuf(-0.8, 0.8), art = Math.floor(zuf(0, 3)), basis = zuf(2200, 3800), n = Math.floor(zuf(2, 6));
      for (let i = 0; i < n; i++) {
        const w = i * zuf(0.09, 0.16);
        if (art === 0) klang(basis, 0.08, 0.022, { zu: basis * 1.35, wann: w, pan });              // Zwitschern aufwärts
        else if (art === 1) klang(basis * 1.3, 0.1, 0.02, { zu: basis * 0.8, wann: w, pan });      // «tjü»
        else { klang(basis, 0.05, 0.018, { wann: w, pan }); klang(basis * 1.2, 0.05, 0.018, { wann: w + 0.05, pan }); }  // Triller
      }
      return zuf(1.4, 5.5);
    },
    kuckuck() { klang(659, 0.22, 0.02, { pan: -0.5 }); klang(523, 0.3, 0.02, { wann: 0.3, pan: -0.5 }); return zuf(9, 20); },
    grillen() { const f = zuf(4000, 4600), pan = zuf(-0.9, 0.9); for (let i = 0; i < 3; i++) klang(f, 0.035, 0.008, { wann: i * 0.055, pan }); return zuf(0.35, 1.3); },
    eule() { klang(392, 0.28, 0.022, { zu: 370, pan: 0.5 }); klang(349, 0.6, 0.026, { zu: 320, wann: 0.42, pan: 0.5 }); return zuf(11, 24); },
    tropfen() { const f = zuf(900, 1700); klang(f, 0.12, 0.03, { zu: f * 0.55, pan: zuf(-0.7, 0.7) }); return zuf(1.2, 4.5); },
    blasen() { const f = zuf(300, 600), n = Math.floor(zuf(1, 4)); for (let i = 0; i < n; i++) klang(f * (1 + i * 0.15), 0.09, 0.022, { zu: f * 2.2, wann: i * 0.1, pan: zuf(-0.6, 0.6) }); return zuf(1, 3.5); },
    moewen() { const pan = zuf(-0.8, 0.8), n = Math.floor(zuf(2, 5)); for (let i = 0; i < n; i++) klang(zuf(1500, 1800), 0.22, 0.014, { zu: 1000, wann: i * 0.3, pan }); return zuf(6, 15); },
    wal() { const f = zuf(150, 230), pan = zuf(-0.6, 0.6); klang(f, 1.6, 0.05, { zu: f * 1.7, pan }); klang(f * 1.7, 1.8, 0.04, { zu: f * 1.1, wann: 1.4, pan }); klang(f * 3, 1.2, 0.008, { zu: f * 4.4, wann: 0.2, pan }); return zuf(9, 20); },
    delfin() { const pan = zuf(-0.8, 0.8), n = Math.floor(zuf(4, 9)); for (let i = 0; i < n; i++) klang(zuf(3200, 5200), 0.02, 0.012, { wann: i * 0.05, pan }); klang(2400, 0.25, 0.012, { zu: 4200, wann: n * 0.05, pan }); return zuf(7, 16); },
    knistern() { const n = Math.floor(zuf(1, 4)); for (let i = 0; i < n; i++) klang(zuf(1500, 5000), 0.012, 0.03, { typ: 'square', wann: i * zuf(0.02, 0.09) }); return zuf(0.12, 0.7); },
  };

  function uhr(art, dichte) {
    const mein = name;
    const lauf = () => {
      if (name !== mein || !enabled) return;
      let pause = 2;
      if (P.ctx.state === 'running') pause = EREIGNIS[art]() / dichte;
      uhren.push(setTimeout(lauf, pause * 1000));
    };
    uhren.push(setTimeout(lauf, zuf(0.3, 2.5) * 1000));
  }

  function leeren() {
    uhren.forEach(clearTimeout); uhren = [];
    Object.values(schichten).forEach((s) => s.stopp()); schichten = {};
  }

  function set(neu) {
    if (neu === name && (Object.keys(schichten).length || uhren.length)) return;
    leeren(); name = neu;
    if (!enabled || !neu || !ORTE[neu]) return;
    P = Audio.mischpult(); if (!P) return;
    if (!aus) { aus = P.ctx.createGain(); aus.gain.value = 1; aus.connect(P.natur); }
    const o = ORTE[neu];
    if (o.wind) schichten.wind = schicht('lowpass', 480, 0.4, o.wind);
    if (o.wellen) { schichten.wellen = schicht('lowpass', 700, 0.3, o.wellen); schichten.gischt = schicht('bandpass', 2600, 0.4, o.wellen * 0.3); }
    if (o.wasser) { schichten.wasser = schicht('bandpass', 1500, 0.5, o.wasser); schichten.w2 = schicht('highpass', 3200, 0.3, o.wasser * 0.25); }
    if (o.tief) schichten.tief = schicht('lowpass', 210, 0.6, o.tief);
    if (o.feuer) { schichten.feuer = schicht('lowpass', 800, 0.3, o.feuer); uhr('knistern', 1); }
    ['voegel', 'kuckuck', 'grillen', 'eule', 'tropfen', 'blasen', 'moewen', 'wal', 'delfin'].forEach((a) => { if (o[a]) uhr(a, o[a]); });
  }
  function setEnabled(v) { enabled = !!v; const n = name; if (!enabled) { leeren(); } else if (n) { name = null; set(n); } }

  return { set, setEnabled, get enabled() { return enabled; } };
})();
