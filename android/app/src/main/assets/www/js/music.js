/* music.js – Dezente Hintergrundmusik, komplett im Code erzeugt (Web Audio).
   EIGENE, neue Stücke im Stil von Latin-/Weltpop (Cumbia-Groove, wie von
   Shakira-Songs inspiriert) – KEINE echten Songs, offline, ohne Dateien.
   Ruhig gehalten, leise, im Eltern-Bereich abschaltbar. */

const Music = (() => {
  let ctx = null, master = null, noiseBuf = null;
  let enabled = true, current = null, timer = null;
  let step = 0, bar = 0, nextTime = 0, track = null;
  const LOOKAHEAD = 0.12, TICK = 25;

  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const CHORD = { maj: [0,4,7], min: [0,3,7], maj7:[0,4,7,11], min7:[0,3,7,10] };

  function ctxHolen() {
    if (ctx) return ctx;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.0001;
      master.connect(ctx.destination);
      // Rauschpuffer für Perkussion (Shaker/Clap)
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { ctx = null; }
    return ctx;
  }

  // ---------- Instrumente ----------
  function pad(t, midis, dur, lvl) {
    midis.forEach(m => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle'; o.frequency.value = mtof(m);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(lvl, t + 0.25);
      g.gain.linearRampToValueAtTime(lvl * 0.7, t + dur * 0.6);
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + dur + 0.05);
    });
  }
  function pluck(t, midi, dur, lvl, type) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'triangle'; o.frequency.value = mtof(midi);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(lvl, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function kick(t, lvl) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(130, t);
    o.frequency.exponentialRampToValueAtTime(48, t + 0.12);
    g.gain.setValueAtTime(lvl, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + 0.18);
  }
  function noiseHit(t, lvl, dur, hp) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp || 5000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(lvl, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t); s.stop(t + dur + 0.02);
  }
  const shaker = (t, lvl) => noiseHit(t, lvl, 0.05, 6500);
  const clap   = (t, lvl) => noiseHit(t, lvl, 0.09, 1500);

  // ---------- Tracks (eigene Stücke, Latin-/Cumbia-Groove) ----------
  // prog: [rootMidi, chordTyp] pro Takt. Muster: 16 Sechzehntel je Takt.
  const P = (s) => s.split('').map(c => c !== '.' && c !== ' ');
  const TRACKS = {
    // Menü: mellow, freundlich, wenig Perkussion
    menu: {
      bpm: 92, level: 0.16, bars: 4, leadOct: 24, padOct: 12, scaleMaj: false,
      prog: [[57,'min'],[50,'min'],[55,'maj'],[48,'maj']],
      kick:   P('x.......x.......'),
      shaker: P('..x...x...x...x.'),
      clap:   P('................'),
      bass:   P('x..x..x..x..x...'),
      lead:   P('x...x.x...x.x...'),
    },
    // Zwischen/Intro: fröhlich, aufmunternd, Montuno-Piano
    intro: {
      bpm: 104, level: 0.19, bars: 4, leadOct: 24, padOct: 12, scaleMaj: true,
      prog: [[48,'maj'],[55,'maj'],[57,'min'],[53,'maj']],
      kick:   P('x...x...x...x...'),
      shaker: P('.x.x.x.x.x.x.x.x'),
      clap:   P('....x.......x...'),
      bass:   P('x.....x.x.....x.'),
      lead:   P('x.xx..x.x.xx..x.'),
    },
    // Im Spiel: sehr leiser, ruhiger Klangteppich (lenkt nicht ab)
    spiel: {
      bpm: 96, level: 0.085, bars: 4, leadOct: 24, padOct: 12, scaleMaj: false,
      prog: [[57,'min7'],[53,'maj7'],[48,'maj7'],[55,'maj']],
      kick:   P('x...............'),
      shaker: P('....x.......x...'),
      clap:   P('................'),
      bass:   P('x.......x.......'),
      lead:   P('x.............x.'),
    },
    // Abschluss: fröhlich, feierlich
    finale: {
      bpm: 108, level: 0.22, bars: 2, leadOct: 24, padOct: 12, scaleMaj: true,
      prog: [[48,'maj'],[53,'maj']],
      kick:   P('x...x...x...x...'),
      shaker: P('xxxxxxxxxxxxxxxx'),
      clap:   P('....x.......x...'),
      bass:   P('x.x.x.x.x.x.x.x.'),
      lead:   P('x.x.x.x.x.x.x.x.'),
    },
  };

  // Arpeggio-Index pro Track für die Melodie (deterministisch, wiederholt sich)
  let leadIdx = 0;

  function playStep(i, b, t) {
    const tr = track, chord = tr.prog[b % tr.prog.length];
    const root = chord[0], tones = CHORD[chord[1]];
    const spb = 60 / tr.bpm / 4;

    // Pad zu Taktbeginn
    if (i === 0) {
      const padMidis = tones.map(x => root + x + tr.padOct);
      pad(t, padMidis, spb * 16, tr.level * 0.5);
    }
    if (tr.kick[i])   kick(t, tr.level * 1.1);
    if (tr.shaker[i]) shaker(t, tr.level * 0.5);
    if (tr.clap[i])   clap(t, tr.level * 0.6);
    if (tr.bass[i]) {
      // Wechsel Grundton/Quinte für Bewegung
      const useFifth = (i % 8) >= 4;
      pluck(t, root - 12 + (useFifth ? 7 : 0), spb * 3, tr.level * 0.9, 'triangle');
    }
    if (tr.lead[i]) {
      const tone = tones[leadIdx % tones.length] + (Math.floor(leadIdx / tones.length) % 2) * 12;
      leadIdx++;
      pluck(t, root + tone + tr.leadOct, spb * 2.2, tr.level * 0.55, 'triangle');
    }
  }

  function scheduler() {
    if (!ctx || !track) return;
    while (nextTime < ctx.currentTime + LOOKAHEAD) {
      playStep(step, bar, nextTime);
      nextTime += 60 / track.bpm / 4;
      step++;
      if (step >= 16) { step = 0; bar = (bar + 1) % track.bars; }
    }
  }

  function starteLoop() {
    if (timer) return;
    step = 0; bar = 0; leadIdx = 0;
    nextTime = ctx.currentTime + 0.06;
    timer = setInterval(scheduler, TICK);
  }

  function rampMaster(to, sek) {
    if (!master) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
    master.gain.linearRampToValueAtTime(Math.max(0.0001, to), now + (sek || 0.4));
  }

  // ---------- Öffentliche API ----------
  function play(name) {
    if (!TRACKS[name]) return;
    if (name === current && timer && ctx && ctx.state === 'running') return; // läuft schon
    current = name;
    if (!enabled) return;
    if (!ctxHolen()) return;
    if (ctx.state === 'suspended') { ctx.resume().catch(() => {}); }
    track = TRACKS[name];
    if (ctx.state === 'running') { starteLoop(); rampMaster(track.level, 0.5); }
  }

  function stop() {
    rampMaster(0.0001, 0.35);
    if (timer) { clearTimeout(timer); clearInterval(timer); timer = null; }
  }

  function setEnabled(v) {
    enabled = !!v;
    if (!enabled) stop();
    else if (current) play(current);
  }

  // Beim ersten Antippen Ton freischalten und aktuelle Musik starten
  document.addEventListener('pointerdown', () => {
    if (!enabled || !current) return;
    if (!ctxHolen()) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    if (!timer && track) { starteLoop(); rampMaster(track.level, 0.5); }
    else if (!track) play(current);
  }, { capture: true });

  return { play, stop, setEnabled, get enabled() { return enabled; } };
})();
