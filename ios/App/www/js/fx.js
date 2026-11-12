/* fx.js – Effekte: Funken, Sterne, Konfetti, schwebende Texte, Übergänge.
   Eine einzige Zeichenfläche, die nur läuft, solange Teilchen fliegen
   (schont schwache Geräte). Bei «weniger Bewegung» bleibt alles ruhig. */

const FX = (() => {
  const ruhig = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cv = null, c2 = null, teile = [], laeuft = false, letzte = 0, dpr = 1;

  function flaeche() {
    if (cv) return;
    cv = document.createElement('canvas'); cv.className = 'fx-flaeche';
    document.body.append(cv); c2 = cv.getContext('2d');
    const gr = () => { dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; };
    gr(); addEventListener('resize', gr);
  }

  function stern(x, y, r, rot) {
    c2.beginPath();
    for (let i = 0; i < 10; i++) { const w = rot + i * Math.PI / 5, rad = i % 2 ? r * 0.45 : r; c2[i ? 'lineTo' : 'moveTo'](x + Math.cos(w) * rad, y + Math.sin(w) * rad); }
    c2.closePath(); c2.fill();
  }

  function bild(t) {
    if (!laeuft) return;
    const dt = Math.min(0.05, (t - letzte) / 1000 || 0.016); letzte = t;
    c2.setTransform(dpr, 0, 0, dpr, 0, 0);
    c2.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = teile.length - 1; i >= 0; i--) {
      const p = teile[i];
      p.l -= dt; if (p.l <= 0) { teile.splice(i, 1); continue; }
      p.vy += p.g * dt; p.vx *= 1 - p.br * dt; p.vy *= 1 - p.br * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      const a = Math.min(1, p.l / (p.l0 * 0.4));
      c2.globalAlpha = a; c2.fillStyle = p.f;
      if (p.typ === 'stern') stern(p.x, p.y, p.r, p.rot);
      else if (p.typ === 'papier') { c2.save(); c2.translate(p.x, p.y); c2.rotate(p.rot); c2.scale(1, Math.cos(p.rot * 2)); c2.fillRect(-p.r, -p.r * 0.6, p.r * 2, p.r * 1.2); c2.restore(); }
      else if (p.typ === 'blase') { c2.strokeStyle = p.f; c2.lineWidth = 2; c2.beginPath(); c2.arc(p.x, p.y, p.r, 0, 7); c2.stroke(); }
      else { c2.beginPath(); c2.arc(p.x, p.y, p.r * a, 0, 7); c2.fill(); }
    }
    c2.globalAlpha = 1;
    if (teile.length) requestAnimationFrame(bild); else { laeuft = false; c2.clearRect(0, 0, innerWidth, innerHeight); }
  }
  function los() { if (!laeuft) { laeuft = true; letzte = performance.now(); requestAnimationFrame(bild); } }

  const BUNT = ['#ffd23f', '#ff8fc0', '#7ad7ff', '#8be38b', '#b79cf5', '#ff9a3d', '#ffffff'];
  // Funken-Wolke an einer Stelle. typ: stern | punkt | blase
  function funken(x, y, opt = {}) {
    if (ruhig()) return;
    flaeche();
    const n = opt.n || 14, farben = opt.farben || BUNT, kraft = opt.kraft || 260;
    for (let i = 0; i < n && teile.length < 220; i++) {
      const w = Math.random() * Math.PI * 2, v = kraft * (0.35 + Math.random() * 0.65), l = 0.5 + Math.random() * 0.5;
      teile.push({ x, y, vx: Math.cos(w) * v, vy: Math.sin(w) * v - (opt.hoch || 60), g: opt.g != null ? opt.g : 520, br: 1.6, r: (opt.r || 7) * (0.6 + Math.random() * 0.7),
        rot: Math.random() * 6, vr: (Math.random() - 0.5) * 8, f: farben[i % farben.length], l, l0: l, typ: opt.typ || (i % 3 ? 'stern' : 'punkt') });
    }
    los();
  }
  // Funken an der Mitte eines Elements
  function funkenAn(el, opt) { if (!el) return; const r = el.getBoundingClientRect(); funken(r.left + r.width / 2, r.top + r.height / 2, opt); }

  // Konfetti-Regen über den ganzen Bildschirm
  function konfetti(n = 110) {
    if (ruhig()) return;
    flaeche();
    for (let i = 0; i < n; i++) {
      const l = 2.2 + Math.random() * 1.6;
      teile.push({ x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * 0.5, vx: (Math.random() - 0.5) * 120, vy: 120 + Math.random() * 160, g: 90, br: 0.2,
        r: 5 + Math.random() * 5, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 9, f: BUNT[i % 6], l, l0: l, typ: i % 4 ? 'papier' : 'stern' });
    }
    los();
  }

  // Schwebender Text (z. B. «+10»)
  function text(x, y, t, cls = '') {
    const e = document.createElement('div'); e.className = 'fx-text ' + cls; e.textContent = t;
    e.style.left = x + 'px'; e.style.top = y + 'px';
    document.body.append(e); setTimeout(() => e.remove(), 1100);
  }
  function textAn(el, t, cls) { if (!el) return; const r = el.getBoundingClientRect(); text(r.left + r.width / 2, r.top + r.height * 0.2, t, cls); }

  // Kurze CSS-Animation auf einem Element neu starten
  function anim(el, cls, ms = 600) {
    if (!el) return;
    el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), ms);
  }

  // Szenenwechsel: Blätter-Vorhang zieht kurz zu, dann wieder auf
  let vorhang = null, wechselt = false;
  function wechsel(fn) {
    if (ruhig() || wechselt) { fn(); return; }
    wechselt = true;
    if (!vorhang) { vorhang = document.createElement('div'); vorhang.className = 'fx-vorhang'; document.body.append(vorhang); }
    vorhang.classList.add('zu');
    setTimeout(() => { try { fn(); } finally { requestAnimationFrame(() => { vorhang.classList.remove('zu'); wechselt = false; }); } }, 260);
  }

  return { funken, funkenAn, konfetti, text, textAn, anim, wechsel, ruhig };
})();
