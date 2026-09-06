/* audio.js – Sprachausgabe (Vorlesen) und ruhige Klänge.
   Alles offline, ohne externe Dateien. Fehlerfreundlich: nie ein Strafton. */

const Audio = (() => {
  let tonAn = true;
  let spracheAn = true;
  let ctx = null;

  function ctxHolen() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { ctx = null; }
    }
    return ctx;
  }

  // Kurzer, weicher Ton (kein harter Strafton bei Fehlern)
  function ton(freq, dauer = 0.18, typ = 'sine', laut = 0.15) {
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

  // Freundliche Melodie bei richtig
  function richtig() { ton(660, 0.12); setTimeout(() => ton(880, 0.16), 90); }
  // Sanftes, tiefes "hm" bei falsch – kein Drama
  function falsch() { ton(300, 0.22, 'sine', 0.10); }
  function tipp()   { ton(520, 0.08, 'triangle', 0.08); }
  function jubel()  { [523,659,784,1046].forEach((f,i)=>setTimeout(()=>ton(f,0.18),i*120)); }

  // Anweisungen vorlesen (Deutsch)
  function sprich(text) {
    if (!spracheAn || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'de-CH';
      u.rate = 0.95;
      u.pitch = 1.05;
      const stimmen = window.speechSynthesis.getVoices();
      const de = stimmen.find(v => v.lang && v.lang.startsWith('de'));
      if (de) u.voice = de;
      window.speechSynthesis.speak(u);
    } catch (e) { /* still */ }
  }

  function stopp() { try { window.speechSynthesis.cancel(); } catch (e) {} }

  return {
    richtig, falsch, tipp, jubel, sprich, stopp, ton,
    get tonAn() { return tonAn; },
    get spracheAn() { return spracheAn; },
    setTon(v) { tonAn = v; },
    setSprache(v) { spracheAn = v; if (!v) stopp(); },
  };
})();
