/* art.js – Alle Grafiken des Spiels, direkt im Code gezeichnet (SVG).
   Welt: Unterwasser – Nala taucht mit ihrem gelben U-Boot.
   Keine Emojis, keine externen Bilder: sieht auf jedem Gerät gleich aus
   und funktioniert offline. Stil: Sticker – runde Formen, kräftige Farben,
   dunkelblaue Umrisslinie. */

const Art = (() => {
  const O = '#1b2f5e';                       // Umrisslinie (Tiefsee-Blau)
  const st = (w = 3) => `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  let uid = 0;
  const svg = (inner, vb = '0 0 100 100', cls = 'art') =>
    `<svg class="${cls}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;

  // ---------- Farb-Helfer ----------
  function mix(a, b, f) {
    const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const A = p(a), B = p(b);
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * f).toString(16).padStart(2, '0')).join('');
  }
  const hell = (c, f = 0.3) => mix(c, '#ffffff', f);
  const dunkel = (c, f = 0.2) => mix(c, '#000000', f);

  function sternPfad(cx, cy, R, r, n = 5) {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const w = -Math.PI / 2 + i * Math.PI / n, rad = i % 2 ? r : R;
      d += (i ? 'L' : 'M') + (cx + Math.cos(w) * rad).toFixed(1) + ' ' + (cy + Math.sin(w) * rad).toFixed(1);
    }
    return d + 'Z';
  }
  const auge = (x, y, r = 5) =>
    `<g class="a-auge"><circle cx="${x}" cy="${y}" r="${r}" fill="#2e211a"/>` +
    `<circle cx="${x - r * 0.3}" cy="${y - r * 0.35}" r="${r * 0.38}" fill="#fff"/></g>`;
  const wange = (x, y, r = 5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ff8f8f" opacity=".45"/>`;

  // ============================================================
  // NALA – das Eichhörnchen (Begleiterin)
  // ============================================================
  function nala(cls = '') {
    const F = '#f28a3c', F2 = '#d96a2a', C = '#fde9cc', A = '#19b8a6', A2 = '#0f8f86', G = '#ffd23f';
    return svg(
      // Schwanz
      `<g class="n-schwanz"><path d="M118 196 C172 206 204 160 192 110 C184 72 152 52 134 68 C120 80 130 100 146 98 C160 96 162 114 154 132 C146 152 132 164 118 172 Z" fill="${F2}" ${st(4)}/>` +
      `<path d="M134 186 C168 184 186 154 180 116 C176 92 160 76 148 80" fill="none" stroke="${hell(F, .25)}" stroke-width="9" stroke-linecap="round" opacity=".75"/></g>` +
      // Luftflasche + Taucheranzug + Flossen
      `<rect x="44" y="132" width="22" height="50" rx="10" fill="#c9d6e6" ${st(4)}/><rect x="49" y="124" width="12" height="10" rx="3" fill="#8fa3bd" ${st(3)}/>` +
      `<g class="n-koerper"><path d="M52 206 Q62 188 84 200 Q92 214 70 216 Q54 216 52 206Z" fill="${G}" ${st(4)}/><path d="M148 206 Q138 188 116 200 Q108 214 130 216 Q146 216 148 206Z" fill="${G}" ${st(4)}/>` +
      `<path d="M62 150 C58 186 74 206 100 206 C126 206 142 186 138 150 C134 122 66 122 62 150Z" fill="${A}" ${st(4)}/>` +
      `<path d="M64 172 Q100 184 136 172 L134 184 Q100 196 66 184Z" fill="${G}"/><circle cx="100" cy="182" r="7" fill="#fff" ${st(3)}/>` +
      `<path d="M78 138 Q100 150 122 138" fill="none" stroke="${A2}" stroke-width="4" stroke-linecap="round"/>` +
      // Arme
      `<g class="n-arm-l"><ellipse cx="68" cy="156" rx="9" ry="16" transform="rotate(24 68 156)" fill="${A}" ${st(4)}/><circle cx="62" cy="168" r="7" fill="${F}" ${st(3)}/></g>` +
      `<g class="n-arm-r"><ellipse cx="132" cy="156" rx="9" ry="16" transform="rotate(-24 132 156)" fill="${A}" ${st(4)}/><circle cx="138" cy="168" r="7" fill="${F}" ${st(3)}/></g></g>` +
      // Kopf
      `<g class="n-kopf">` +
      `<path d="M62 54 L54 14 L88 36 Z" fill="${F}" ${st(4)}/><path d="M138 54 L146 14 L112 36 Z" fill="${F}" ${st(4)}/>` +
      `<path d="M65 44 L61 24 L78 36 Z" fill="#f7b0a0"/><path d="M135 44 L139 24 L122 36 Z" fill="#f7b0a0"/>` +
      `<ellipse cx="100" cy="84" rx="50" ry="45" fill="${F}" ${st(4)}/>` +
      `<path d="M58 96 C60 122 80 128 100 128 C120 128 140 122 142 96 C132 84 116 90 100 96 C84 90 68 84 58 96Z" fill="${C}"/>` +
      `<g class="n-augen"><ellipse cx="80" cy="80" rx="9" ry="12" fill="#1b2140"/><circle cx="77" cy="75" r="4" fill="#fff"/><circle cx="83" cy="85" r="1.8" fill="#fff"/>` +
      `<ellipse cx="120" cy="80" rx="9" ry="12" fill="#1b2140"/><circle cx="117" cy="75" r="4" fill="#fff"/><circle cx="123" cy="85" r="1.8" fill="#fff"/></g>` +
      wange(66, 100, 8) + wange(134, 100, 8) +
      `<path d="M93 96 Q100 92 107 96 Q104 104 100 104 Q96 104 93 96Z" fill="#7a3f24"/>` +
      `<path class="n-mund" d="M88 108 Q100 120 112 108" fill="none" ${st(3.5)}/>` +
      `<rect x="95.5" y="110" width="9" height="8" rx="2" fill="#fff" ${st(2)}/>` +
      // Taucherhelm aus Glas
      `<circle cx="100" cy="74" r="70" fill="#bfeeff" fill-opacity=".22" stroke="#fff" stroke-width="6"/><circle cx="100" cy="74" r="73.5" fill="none" ${st(3)}/>` +
      `<path d="M50 44 Q62 20 88 12" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".85"/><circle cx="46" cy="58" r="4" fill="#fff" opacity=".85"/>` +
      `<path d="M62 134 Q100 150 138 134" fill="none" stroke="${G}" stroke-width="9" stroke-linecap="round"/>` +
      `</g>`, '0 -6 220 228', 'art nala ' + cls);
  }

  // ============================================================
  // TIER-KÖPFE (parametrisch) – für Avatare, Spiele und Sticker
  // ============================================================
  const TIERE = {
    fuchs:  { f: '#f08a3c', m: '#fff6e8', ohr: 'spitz', in: '#3a2a22' },
    katze:  { f: '#9aa3ad', m: '#f4f1ec', ohr: 'spitz', in: '#f7b0a0', schnurr: 1 },
    tiger:  { f: '#f5a13a', m: '#fff6e8', ohr: 'rund', in: '#3a2a22', streifen: 1 },
    baer:   { f: '#a8703f', m: '#e9c79c', ohr: 'rund', in: '#7c4f2a' },
    panda:  { f: '#fbf9f4', m: '#fbf9f4', ohr: 'rund', in: '#2e2a28', ohrF: '#2e2a28', panda: 1 },
    koala:  { f: '#a6adb6', m: '#d9dde2', ohr: 'gross', in: '#f1d6d6', nase: 'gross' },
    maus:   { f: '#b9b4b0', m: '#efe9e4', ohr: 'gross', in: '#f7b0a0', schnurr: 1 },
    hase:   { f: '#f1e4d3', m: '#fffaf2', ohr: 'lang', in: '#f7b0a0' },
    hund:   { f: '#e3b77e', m: '#fff3df', ohr: 'haeng', ohrF: '#8a5a33', fleck: '#8a5a33', zunge: 1 },
    loewe:  { f: '#f2b54a', m: '#fff0cf', ohr: 'rund', in: '#c97b2b', maehne: '#c9712a' },
    kuh:    { f: '#fbf9f4', m: '#f6b9b3', ohr: 'haeng', ohrF: '#fbf9f4', kuh: 1 },
    schaf:  { f: '#5d5049', m: '#75675f', ohr: 'haeng', ohrF: '#5d5049', wolle: 1 },
    frosch: { f: '#6cc04a', m: '#b8e986', ohr: 'frosch' },
    eule:   { f: '#9b6b43', m: '#f3dfbd', ohr: 'spitz', in: '#7a5232', eule: 1 },
    igel:   { f: '#f0d2a8', m: '#f7e3c5', ohr: 'rund', in: '#d9a878', igel: 1 },
  };

  function kopf(name, cls = '') {
    const t = TIERE[name] || TIERE.baer;
    const F = t.f, M = t.m, OF = t.ohrF || F;
    let s = '';
    if (t.maehne) {
      for (let i = 0; i < 12; i++) {
        const w = i / 12 * Math.PI * 2;
        s += `<circle cx="${(50 + Math.cos(w) * 34).toFixed(1)}" cy="${(52 + Math.sin(w) * 33).toFixed(1)}" r="13" fill="${t.maehne}" ${st(3)}/>`;
      }
      s += `<circle cx="50" cy="52" r="36" fill="${t.maehne}"/>`;
    }
    if (t.igel) s += `<path d="${sternPfad(50, 48, 47, 36, 13)}" fill="#7a5232" ${st(3)}/>`;
    if (t.wolle) {
      [[26, 30], [42, 20], [60, 20], [76, 30], [18, 46], [84, 46]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="13" fill="#fbf9f4" ${st(3)}/>`; });
    }
    // Ohren
    if (t.ohr === 'spitz') {
      s += `<path d="M20 44 L16 8 L46 24 Z" fill="${OF}" ${st()}/><path d="M80 44 L84 8 L54 24 Z" fill="${OF}" ${st()}/>` +
           `<path d="M23 34 L21 16 L36 25 Z" fill="${t.in}"/><path d="M77 34 L79 16 L64 25 Z" fill="${t.in}"/>`;
    } else if (t.ohr === 'rund') {
      s += `<circle cx="23" cy="24" r="13" fill="${OF}" ${st()}/><circle cx="77" cy="24" r="13" fill="${OF}" ${st()}/>` +
           `<circle cx="23" cy="25" r="6.5" fill="${t.in}"/><circle cx="77" cy="25" r="6.5" fill="${t.in}"/>`;
    } else if (t.ohr === 'gross') {
      s += `<circle cx="18" cy="28" r="19" fill="${OF}" ${st()}/><circle cx="82" cy="28" r="19" fill="${OF}" ${st()}/>` +
           `<circle cx="18" cy="29" r="11" fill="${t.in}"/><circle cx="82" cy="29" r="11" fill="${t.in}"/>`;
    } else if (t.ohr === 'lang') {
      s += `<ellipse cx="34" cy="20" rx="10" ry="24" transform="rotate(-10 34 20)" fill="${OF}" ${st()}/><ellipse cx="66" cy="20" rx="10" ry="24" transform="rotate(10 66 20)" fill="${OF}" ${st()}/>` +
           `<ellipse cx="34" cy="21" rx="4.5" ry="16" transform="rotate(-10 34 21)" fill="${t.in}"/><ellipse cx="66" cy="21" rx="4.5" ry="16" transform="rotate(10 66 21)" fill="${t.in}"/>`;
    } else if (t.ohr === 'haeng') {
      s += `<ellipse cx="15" cy="48" rx="10" ry="20" transform="rotate(16 15 48)" fill="${OF}" ${st()}/><ellipse cx="85" cy="48" rx="10" ry="20" transform="rotate(-16 85 48)" fill="${OF}" ${st()}/>`;
    } else if (t.ohr === 'frosch') {
      s += `<circle cx="30" cy="26" r="15" fill="${F}" ${st()}/><circle cx="70" cy="26" r="15" fill="${F}" ${st()}/>`;
    }
    if (t.kuh) s += `<path d="M30 24 Q22 8 30 6 Q34 16 40 22Z" fill="#efe2c4" ${st(2.5)}/><path d="M70 24 Q78 8 70 6 Q66 16 60 22Z" fill="#efe2c4" ${st(2.5)}/>`;
    // Kopf
    const ry = t.ohr === 'frosch' ? 28 : 31, cy = t.ohr === 'frosch' ? 58 : 54;
    s += `<ellipse cx="50" cy="${cy}" rx="35" ry="${ry}" fill="${F}" ${st()}/>`;
    if (t.fleck) s += `<ellipse cx="34" cy="48" rx="13" ry="14" fill="${t.fleck}"/>`;
    if (t.kuh) s += `<path d="M62 26 Q84 30 82 52 Q66 50 60 38Z" fill="#3a3330"/><path d="M18 52 Q20 36 32 30 Q36 44 28 54Z" fill="#3a3330"/>`;
    if (t.streifen) s += `<path d="M50 24 L46 36 L54 36Z M34 28 L36 38 L41 30Z M66 28 L64 38 L59 30Z M16 52 L26 54 L17 60Z M84 52 L74 54 L83 60Z" fill="#3a2a22"/>`;
    if (t.panda) s += `<ellipse cx="35" cy="52" rx="10" ry="12" transform="rotate(-18 35 52)" fill="#2e2a28"/><ellipse cx="65" cy="52" rx="10" ry="12" transform="rotate(18 65 52)" fill="#2e2a28"/>`;
    if (name === 'fuchs') s += `<path d="M16 60 Q30 62 50 78 Q70 62 84 60 Q80 84 50 85 Q20 84 16 60Z" fill="${M}"/>`;
    if (t.eule) {
      s += `<circle cx="35" cy="50" r="15" fill="${M}" ${st(2.5)}/><circle cx="65" cy="50" r="15" fill="${M}" ${st(2.5)}/>` +
           auge(35, 50, 7) + auge(65, 50, 7) +
           `<path d="M44 62 L56 62 L50 74Z" fill="#f2a23a" ${st(2.5)}/>` +
           `<path d="M34 76 q4 4 8 0 M46 80 q4 4 8 0 M58 76 q4 4 8 0" fill="none" stroke="${dunkel(F, .25)}" stroke-width="2.5" stroke-linecap="round"/>`;
      return svg(s, '0 0 100 100', 'art kopf ' + cls);
    }
    if (t.ohr === 'frosch') {
      s += `<circle cx="30" cy="26" r="9" fill="#fff"/><circle cx="70" cy="26" r="9" fill="#fff"/>` + auge(31, 27, 5) + auge(69, 27, 5) +
           `<ellipse cx="50" cy="68" rx="24" ry="13" fill="${M}"/>` +
           `<path d="M28 62 Q50 82 72 62" fill="none" ${st(3)}/>` + wange(24, 60, 5) + wange(76, 60, 5) +
           `<circle cx="46" cy="50" r="1.6" fill="${O}"/><circle cx="54" cy="50" r="1.6" fill="${O}"/>`;
      return svg(s, '0 0 100 100', 'art kopf ' + cls);
    }
    // Schnauze, Augen, Nase, Mund
    const gross = t.nase === 'gross';
    s += `<ellipse cx="50" cy="${t.kuh ? 70 : 67}" rx="${t.kuh ? 22 : 16}" ry="${t.kuh ? 13 : 12}" fill="${M}"${t.kuh ? ' ' + st(2.5) : ''}/>`;
    s += auge(36, 51, t.panda ? 4.5 : 5.2) + auge(64, 51, t.panda ? 4.5 : 5.2);
    s += wange(24, 64, 5.5) + wange(76, 64, 5.5);
    if (t.kuh) s += `<ellipse cx="43" cy="70" rx="2.6" ry="3.6" fill="#b96a66"/><ellipse cx="57" cy="70" rx="2.6" ry="3.6" fill="#b96a66"/>`;
    else {
      s += gross ? `<ellipse cx="50" cy="62" rx="8" ry="10" fill="#3a3330"/>`
                 : `<path d="M44 60 Q50 56 56 60 Q54 67 50 67 Q46 67 44 60Z" fill="#3a2a22"/>`;
      s += `<path d="M43 ${gross ? 76 : 71} Q50 ${gross ? 81 : 77} 57 ${gross ? 76 : 71}" fill="none" ${st(2.6)}/>`;
      if (t.zunge) s += `<path d="M46 74 Q50 86 54 74Z" fill="#f2828a" ${st(2)}/>`;
    }
    if (t.schnurr) s += `<path d="M30 66 L12 62 M30 70 L13 73 M70 66 L88 62 M70 70 L87 73" fill="none" stroke="${O}" stroke-width="1.6" stroke-linecap="round" opacity=".6"/>`;
    return svg(s, '0 0 100 100', 'art kopf ' + cls);
  }

  // ============================================================
  // DINGE (Gegenstände, Natur)
  // ============================================================
  const glanz = (x, y, rx = 7, ry = 4, rot = -30) =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" fill="#fff" opacity=".55"/>`;

  function pilz(hut = '#e8504a', gesicht = true) {
    return `<path d="M37 56 Q32 88 40 92 Q50 96 60 92 Q68 88 63 56 Z" fill="#fff3dc" ${st()}/>` +
      `<path d="M8 58 Q8 14 50 12 Q92 14 92 58 Q72 66 50 64 Q28 66 8 58 Z" fill="${hut}" ${st()}/>` +
      `<circle cx="30" cy="40" r="8" fill="#fff"/><circle cx="56" cy="28" r="9" fill="#fff"/><circle cx="76" cy="46" r="6.5" fill="#fff"/><circle cx="16" cy="54" r="3.5" fill="#fff"/>` +
      (gesicht ? auge(44, 74, 3) + auge(56, 74, 3) + `<path d="M45 81 Q50 86 55 81" fill="none" ${st(2.2)}/>` + wange(39, 80, 3) + wange(61, 80, 3) : '');
  }
  function kaefer() {
    const B = '#5a4fc4';
    return `<path d="M22 44 L8 36 M18 60 L4 60 M22 76 L10 86 M78 44 L92 36 M82 60 L96 60 M78 76 L90 86 M42 18 Q38 6 30 6 M58 18 Q62 6 70 6" fill="none" ${st(3.5)}/>` +
      `<circle cx="50" cy="28" r="15" fill="#342c78" ${st()}/>` +
      `<ellipse cx="50" cy="62" rx="31" ry="30" fill="${B}" ${st()}/>` +
      `<path d="M50 33 L50 92" ${st(2.5)} fill="none"/>` +
      `<circle cx="36" cy="56" r="6" fill="${hell(B, .45)}"/><circle cx="64" cy="56" r="6" fill="${hell(B, .45)}"/><circle cx="40" cy="76" r="4.5" fill="${hell(B, .45)}"/><circle cx="60" cy="76" r="4.5" fill="${hell(B, .45)}"/>` +
      `<circle cx="44" cy="27" r="5" fill="#fff"/><circle cx="56" cy="27" r="5" fill="#fff"/><circle cx="44.5" cy="28" r="2.4" fill="#2e211a"/><circle cx="55.5" cy="28" r="2.4" fill="#2e211a"/>` +
      `<path d="M38 20 L48 23 M62 20 L52 23" fill="none" ${st(2.4)}/>` + glanz(34, 44, 8, 4);
  }
  function fisch(f = '#ff9a3d') {
    return `<path d="M72 50 L97 28 Q92 50 97 72 Z" fill="${dunkel(f, .12)}" ${st()}/>` +
      `<path d="M34 30 Q46 12 62 30Z" fill="${dunkel(f, .12)}" ${st()}/>` +
      `<ellipse cx="44" cy="52" rx="36" ry="25" fill="${f}" ${st()}/>` +
      `<path d="M12 60 Q40 78 76 62 Q60 76 44 77 Q24 76 12 60Z" fill="${hell(f, .45)}"/>` +
      `<circle cx="24" cy="46" r="8" fill="#fff" ${st(2)}/><circle cx="22.5" cy="46.5" r="3.6" fill="#2e211a"/>` +
      `<path d="M9 58 Q14 62 19 59" fill="none" ${st(2.4)}/>` + wange(28, 60, 4) + glanz(46, 36, 12, 4, -8);
  }
  function schmetterling(fl = '#ff7eb6', pk = '#ffe066', muster = 0) {
    const fleck = (x, y, r) => muster === 1
      ? `<path d="M${x - r} ${y} L${x + r} ${y}" stroke="${pk}" stroke-width="${r * 0.9}" stroke-linecap="round"/>`
      : muster === 2 ? `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${pk}" stroke-width="${r * 0.55}"/>`
      : `<circle cx="${x}" cy="${y}" r="${r}" fill="${pk}"/>`;
    return `<g class="a-fluegel-l"><path d="M48 46 C30 4 2 14 8 40 C10 52 28 54 48 50Z" fill="${fl}" ${st()}/>` +
      `<path d="M48 54 C24 54 10 66 18 82 C26 94 44 80 48 60Z" fill="${dunkel(fl, .12)}" ${st()}/>` + fleck(24, 32, 7) + fleck(28, 70, 5) + `</g>` +
      `<g class="a-fluegel-r"><path d="M52 46 C70 4 98 14 92 40 C90 52 72 54 52 50Z" fill="${fl}" ${st()}/>` +
      `<path d="M52 54 C76 54 90 66 82 82 C74 94 56 80 52 60Z" fill="${dunkel(fl, .12)}" ${st()}/>` + fleck(76, 32, 7) + fleck(72, 70, 5) + `</g>` +
      `<path d="M46 26 Q42 12 36 12 M54 26 Q58 12 64 12" fill="none" ${st(2.4)}/>` +
      `<ellipse cx="50" cy="52" rx="6" ry="24" fill="#5b4636" ${st(2.5)}/><circle cx="50" cy="28" r="7" fill="#5b4636" ${st(2.5)}/>` +
      `<circle cx="47.5" cy="27" r="1.6" fill="#fff"/><circle cx="52.5" cy="27" r="1.6" fill="#fff"/>`;
  }
  function kristall(f = '#7ad7ff') {
    return `<path d="M50 6 L80 34 L64 94 L36 94 L20 34 Z" fill="${f}" ${st()}/>` +
      `<path d="M50 6 L50 94 M20 34 L50 44 L80 34 M50 44 L36 94 M50 44 L64 94" fill="none" stroke="${dunkel(f, .25)}" stroke-width="2" stroke-linejoin="round"/>` +
      `<path d="M50 6 L20 34 L50 44Z" fill="#fff" opacity=".45"/><path d="M50 44 L64 94 L80 34Z" fill="#000" opacity=".1"/>`;
  }
  // Zauberstein fürs Sortieren: Form × Farbe
  function stein(form, f) {
    const d = form === 'stern' ? sternPfad(50, 52, 44, 21) : null;
    return (d ? `<path d="${d}" fill="${f}" ${st(3.5)}/>` + `<path d="${sternPfad(50, 52, 26, 12)}" fill="${hell(f, .3)}"/>`
              : `<circle cx="50" cy="50" r="40" fill="${f}" ${st(3.5)}/><circle cx="50" cy="50" r="27" fill="${hell(f, .3)}"/>`) +
      glanz(38, 34, 9, 5);
  }

  // Nalas gelbes U-Boot (gross, für Titel und Karte)
  function uboot(cls = '') {
    const id = 'ub' + (++uid), F = '#f28a3c';
    return svg(
      `<path d="M196 70 L228 50 L228 130 L196 110Z" fill="#ff7a66" ${st(4)}/><rect x="224" y="76" width="12" height="28" rx="6" fill="#c9d6e6" ${st(3.5)}/>` +
      `<path d="M98 34 L98 12 L72 12" fill="none" stroke="${O}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/><path d="M98 34 L98 12 L72 12" fill="none" stroke="#c9d6e6" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="M68 48 Q70 26 100 26 Q130 26 132 48Z" fill="#ffb52e" ${st(4)}/>` +
      `<path d="M10 92 Q10 44 70 44 L150 44 Q206 44 206 92 Q206 140 150 140 L70 140 Q10 140 10 92Z" fill="#ffd23f" ${st(4)}/>` +
      `<path d="M14 106 Q70 128 202 106 Q194 140 150 140 L70 140 Q22 140 14 106Z" fill="#ffb52e"/>` +
      `<path d="M30 70 Q44 52 76 50" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".6"/>` +
      `<circle cx="20" cy="100" r="8" fill="#fff6a8" ${st(3)}/>` +
      `<circle cx="80" cy="92" r="40" fill="#fff" ${st(4)}/><circle cx="80" cy="92" r="32" fill="#bfeeff" ${st(3)}/>` +
      `<clipPath id="${id}"><circle cx="80" cy="92" r="30.5"/></clipPath><g clip-path="url(#${id})">` +
      `<path d="M58 88 L54 64 L72 78Z" fill="${F}" ${st(3)}/><path d="M102 88 L106 64 L88 78Z" fill="${F}" ${st(3)}/><path d="M60 82 L58 70 L67 77Z" fill="#f7b0a0"/><path d="M100 82 L102 70 L93 77Z" fill="#f7b0a0"/>` +
      `<ellipse cx="80" cy="102" rx="27" ry="24" fill="${F}" ${st(3)}/><path d="M57 108 Q60 126 80 126 Q100 126 103 108 Q92 102 80 108 Q68 102 57 108Z" fill="#fde9cc"/>` +
      `<ellipse cx="70" cy="98" rx="4.5" ry="6" fill="#1b2140"/><circle cx="68.6" cy="95.6" r="1.9" fill="#fff"/><ellipse cx="90" cy="98" rx="4.5" ry="6" fill="#1b2140"/><circle cx="88.6" cy="95.6" r="1.9" fill="#fff"/>` +
      wange(62, 108, 4.5) + wange(98, 108, 4.5) + `<path d="M76.5 106 Q80 104 83.5 106 Q82 110 80 110 Q78 110 76.5 106Z" fill="#7a3f24"/><path d="M74 113 Q80 119 86 113" fill="none" ${st(2.4)}/></g>` +
      `<path d="M58 76 Q64 66 76 63" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>` +
      `<circle cx="144" cy="88" r="15" fill="#fff" ${st(3.5)}/><circle cx="144" cy="88" r="10" fill="#bfeeff" ${st(2.5)}/><circle cx="180" cy="92" r="11" fill="#fff" ${st(3.5)}/><circle cx="180" cy="92" r="7" fill="#bfeeff" ${st(2.5)}/>` +
      `<circle cx="120" cy="124" r="3" fill="${O}" opacity=".35"/><circle cx="160" cy="122" r="3" fill="${O}" opacity=".35"/><circle cx="46" cy="126" r="3" fill="${O}" opacity=".35"/>`,
      '0 0 240 150', 'art uboot ' + cls);
  }

  // ---------- Meeres-Figuren mit Varianten ----------
  function muschel(f = '#ff8fb8') {
    return `<path d="M10 58 Q8 16 50 12 Q92 16 90 58 Q50 42 10 58Z" fill="${f}" ${st()}/>` +
      `<path d="M50 14 L50 46 M32 18 L38 48 M68 18 L62 48 M18 30 L27 52 M82 30 L73 52" fill="none" stroke="${dunkel(f, .18)}" stroke-width="2.6" stroke-linecap="round"/>` +
      `<path d="M10 58 Q50 42 90 58 Q50 78 10 58Z" fill="#7a2f55" ${st()}/>` +
      `<circle cx="50" cy="58" r="11" fill="#fff" ${st(2.5)}/><circle cx="46" cy="54" r="3.5" fill="#d8f4ff"/>` +
      `<path d="M10 58 Q12 92 50 94 Q88 92 90 58 Q50 78 10 58Z" fill="${hell(f, .2)}" ${st()}/>` +
      auge(41, 80, 3) + auge(59, 80, 3) + `<path d="M46 86 Q50 90 54 86" fill="none" ${st(2.2)}/>` + wange(34, 84, 3) + wange(66, 84, 3);
  }
  function krabbe() {
    const R = '#f0553f';
    return `<path d="M26 66 L8 74 M28 74 L12 88 M74 66 L92 74 M72 74 L88 88 M24 56 Q10 50 14 34 M76 56 Q90 50 86 34" fill="none" ${st(4.5)}/>` +
      `<path d="M14 36 Q0 30 6 16 Q12 22 14 14 Q26 22 14 36Z" fill="${R}" ${st()}/><path d="M86 36 Q100 30 94 16 Q88 22 86 14 Q74 22 86 36Z" fill="${R}" ${st()}/>` +
      `<path d="M40 44 L38 28 M60 44 L62 28" fill="none" ${st(3.5)}/><circle cx="38" cy="24" r="8" fill="#fff" ${st(2.5)}/><circle cx="62" cy="24" r="8" fill="#fff" ${st(2.5)}/>` +
      `<circle cx="39" cy="25" r="3.4" fill="#1b2140"/><circle cx="61" cy="25" r="3.4" fill="#1b2140"/><path d="M30 15 L44 19 M70 15 L56 19" fill="none" ${st(2.6)}/>` +
      `<ellipse cx="50" cy="62" rx="32" ry="23" fill="${R}" ${st()}/><path d="M24 70 Q50 86 76 70 Q68 84 50 85 Q32 84 24 70Z" fill="${hell(R, .35)}"/>` +
      `<path d="M42 68 Q50 62 58 68" fill="none" ${st(2.6)}/>` + glanz(36, 48, 9, 4);
  }
  function qualle(f = '#b79cf5', gesicht = true) {
    return `<path d="M26 54 Q20 68 28 78 Q32 86 26 94 M42 56 Q38 70 44 80 Q48 88 44 96 M58 56 Q62 70 56 80 Q52 88 56 96 M74 54 Q80 68 72 78 Q68 86 74 94" fill="none" stroke="${dunkel(f, .1)}" stroke-width="5" stroke-linecap="round"/>` +
      `<path d="M12 52 Q10 8 50 8 Q90 8 88 52 Q78 60 69 52 Q60 60 50 52 Q40 60 31 52 Q22 60 12 52Z" fill="${f}" ${st()}/>` +
      `<path d="M22 44 Q22 18 46 14" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"/>` +
      (gesicht ? auge(40, 36, 4) + auge(60, 36, 4) + `<path d="M45 44 Q50 48 55 44" fill="none" ${st(2.2)}/>` + wange(32, 42, 4) + wange(68, 42, 4) : '');
  }
  // Zierfisch für «Finde-mich»: Körperfarbe × Musterfarbe × Muster
  function zierfisch(fl = '#ffd23f', pk = '#1b2f5e', muster = 0) {
    const m = muster === 1 ? `<circle cx="44" cy="40" r="6" fill="${pk}"/><circle cx="58" cy="54" r="6" fill="${pk}"/><circle cx="42" cy="62" r="5" fill="${pk}"/>`
      : muster === 2 ? `<path d="M30 58 Q48 70 68 56" fill="none" stroke="${pk}" stroke-width="8" stroke-linecap="round"/>`
      : `<path d="M40 27 Q33 50 40 73 M57 31 Q50 50 57 69" fill="none" stroke="${pk}" stroke-width="7" stroke-linecap="round"/>`;
    return `<path d="M70 50 L96 28 Q90 50 96 72Z" fill="${dunkel(fl, .14)}" ${st()}/><path d="M34 26 Q46 2 62 30Z" fill="${dunkel(fl, .14)}" ${st()}/><path d="M36 74 Q48 96 60 70Z" fill="${dunkel(fl, .14)}" ${st()}/>` +
      `<path d="M8 50 Q34 14 62 28 Q78 38 78 50 Q78 62 62 72 Q34 86 8 50Z" fill="${fl}" ${st()}/>` + m +
      `<circle cx="24" cy="46" r="6.5" fill="#fff" ${st(2)}/><circle cx="23" cy="46.5" r="3" fill="#1b2140"/><path d="M11 54 Q15 57 19 55" fill="none" ${st(2.2)}/>`;
  }

  const DINGE = {
    pilz: () => pilz(),
    kaefer,
    fisch: () => fisch(),
    schmetterling: () => schmetterling(),
    kristall: () => kristall(),
    baum: () => `<path d="M43 58 L41 92 L59 92 L57 58Z" fill="#9b6b43" ${st()}/>` +
      `<circle cx="30" cy="48" r="20" fill="#4fae5b" ${st()}/><circle cx="70" cy="48" r="20" fill="#4fae5b" ${st()}/><circle cx="50" cy="30" r="24" fill="#5fc16a" ${st()}/>` +
      `<circle cx="50" cy="48" r="18" fill="#5fc16a"/><circle cx="30" cy="48" r="17" fill="#4fae5b"/><circle cx="70" cy="48" r="17" fill="#4fae5b"/><circle cx="50" cy="32" r="21" fill="#5fc16a"/>` + glanz(42, 22, 9, 5),
    haus: () => `<rect x="62" y="16" width="10" height="20" fill="#b9543f" ${st()}/><rect x="22" y="46" width="56" height="44" rx="3" fill="#ffe9c4" ${st()}/>` +
      `<path d="M10 50 L50 14 L90 50 Z" fill="#e8504a" ${st()}/><path d="M44 90 L44 68 Q51 60 58 68 L58 90Z" fill="#9b6b43" ${st()}/>` +
      `<rect x="28" y="56" width="12" height="12" rx="2" fill="#8fd3ff" ${st(2.5)}/><rect x="62" y="56" width="12" height="12" rx="2" fill="#8fd3ff" ${st(2.5)}/><circle cx="54.5" cy="79" r="1.6" fill="${O}"/>`,
    ball: () => `<circle cx="50" cy="50" r="38" fill="#fff" ${st()}/>` +
      `<path d="M50 50 L50 12 A38 38 0 0 1 82.9 31 Z" fill="#e8504a"/><path d="M50 50 L82.9 69 A38 38 0 0 1 50 88 Z" fill="#4a8fe8"/><path d="M50 50 L17.1 69 A38 38 0 0 1 17.1 31 Z" fill="#ffd23f"/>` +
      `<circle cx="50" cy="50" r="38" fill="none" ${st()}/><circle cx="50" cy="50" r="7" fill="#fff" ${st(2.5)}/>` + glanz(34, 28, 8, 4),
    apfel: () => `<path d="M50 30 Q50 16 58 10" fill="none" ${st(4)}/><path d="M56 18 Q70 8 78 18 Q68 28 56 18Z" fill="#5fc16a" ${st(2.5)}/>` +
      `<path d="M50 32 C30 16 8 34 14 60 C18 82 38 94 50 86 C62 94 82 82 86 60 C92 34 70 16 50 32 Z" fill="#e8504a" ${st()}/>` + glanz(30, 44, 9, 5),
    blume: () => `<path d="M50 60 Q46 78 50 94" fill="none" stroke="#3f9b4f" stroke-width="5" stroke-linecap="round"/><path d="M50 82 Q32 74 30 86 Q42 92 50 82Z" fill="#5fc16a" ${st(2.5)}/>` +
      [0, 1, 2, 3, 4, 5].map((i) => { const w = i / 6 * Math.PI * 2; return `<circle cx="${(50 + Math.cos(w) * 19).toFixed(1)}" cy="${(40 + Math.sin(w) * 19).toFixed(1)}" r="14" fill="#ff8fc0" ${st()}/>`; }).join('') +
      `<circle cx="50" cy="40" r="13" fill="#ffd23f" ${st()}/>` + glanz(46, 36, 4, 2.5),
    auto: () => `<path d="M8 66 Q8 52 22 50 L32 32 Q36 26 44 26 L64 26 Q72 26 76 33 L84 50 Q94 52 94 66 Q94 76 84 76 L16 76 Q8 76 8 66Z" fill="#e8504a" ${st()}/>` +
      `<path d="M36 34 L30 50 L48 50 L48 33Z M54 33 L54 50 L78 50 L71 34Z" fill="#bfe6ff" ${st(2.5)}/>` +
      `<circle cx="28" cy="76" r="11" fill="#3a3330" ${st()}/><circle cx="28" cy="76" r="4.5" fill="#cfd6dd"/><circle cx="72" cy="76" r="11" fill="#3a3330" ${st()}/><circle cx="72" cy="76" r="4.5" fill="#cfd6dd"/>` +
      `<circle cx="88" cy="60" r="3.5" fill="#ffe066"/>`,
    sonne: () => [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M50 4 L57 20 L43 20Z" transform="rotate(${i * 45} 50 50)" fill="#ffb52e" ${st(2.5)}/>`).join('') +
      `<circle cx="50" cy="50" r="27" fill="#ffd23f" ${st()}/>` + auge(41, 46, 3.4) + auge(59, 46, 3.4) + `<path d="M40 56 Q50 66 60 56" fill="none" ${st(2.6)}/>` + wange(34, 56, 4) + wange(66, 56, 4),
    mond: () => `<path d="M62 8 A42 42 0 1 0 92 66 A32 32 0 1 1 62 8 Z" fill="#ffe9a3" ${st()}/><path d="M34 44 q5 -5 10 0" fill="none" ${st(2.4)}/><path d="M36 60 Q42 66 50 62" fill="none" ${st(2.4)}/>` + wange(32, 56, 4),
    stern: () => `<path d="${sternPfad(50, 54, 44, 20)}" fill="#ffd23f" ${st(3.5)}/>` + glanz(40, 40, 7, 4),
    herz: () => `<path d="M50 88 C8 58 6 28 28 20 C40 16 48 24 50 34 C52 24 60 16 72 20 C94 28 92 58 50 88 Z" fill="#f0506e" ${st()}/>` + glanz(30, 34, 8, 5),
    nuss: () => `<path d="M24 44 Q24 86 50 96 Q76 86 76 44 Z" fill="#d9a35b" ${st()}/><path d="M50 22 Q50 12 56 8" fill="none" ${st(4)}/>` +
      `<path d="M18 46 Q18 22 50 20 Q82 22 82 46 Q50 56 18 46 Z" fill="#8a5a33" ${st()}/><path d="M30 30 L40 44 M46 26 L56 46 M62 26 L70 42" fill="none" stroke="#6b4324" stroke-width="2.4" stroke-linecap="round"/>` + glanz(38, 66, 6, 10, 10),
    schloss: () => `<path d="M82 18 L82 6 L94 11 L82 15" fill="#e8504a" ${st(2.5)}/><rect x="28" y="50" width="44" height="42" fill="#d9dde6" ${st()}/>` +
      `<path d="M10 92 L10 34 L14 34 L14 28 L20 28 L20 34 L26 34 L26 28 L32 28 L32 34 L36 34 L36 92Z" fill="#eef1f6" ${st()}/><path d="M64 92 L64 34 L68 34 L68 28 L74 28 L74 34 L80 34 L80 28 L86 28 L86 34 L90 34 L90 92Z" fill="#eef1f6" ${st()}/>` +
      `<path d="M42 92 L42 74 Q50 62 58 74 L58 92Z" fill="#8a5a33" ${st()}/><rect x="19" y="46" width="8" height="12" rx="4" fill="#5b6b8a"/><rect x="73" y="46" width="8" height="12" rx="4" fill="#5b6b8a"/>`,
    hut: () => `<ellipse cx="50" cy="76" rx="42" ry="11" fill="#3d3a6b" ${st()}/><path d="M26 74 L30 22 Q50 14 70 22 L74 74 Q50 82 26 74Z" fill="#4a4785" ${st()}/><path d="M27.5 60 Q50 68 72.5 60 L73.5 72 Q50 80 26.5 72Z" fill="#e8504a"/>` + glanz(40, 32, 5, 10, 8),
    brot: () => `<path d="M10 62 Q6 36 30 32 Q50 24 70 32 Q94 36 90 62 Q90 78 78 78 L22 78 Q10 78 10 62Z" fill="#e0a04e" ${st()}/><path d="M30 40 Q36 50 32 60 M50 36 Q56 48 52 60 M70 40 Q76 50 72 60" fill="none" stroke="#fbe3b5" stroke-width="5" stroke-linecap="round"/>`,
    biene: () => `<ellipse cx="46" cy="30" rx="13" ry="19" transform="rotate(-24 46 30)" fill="#d8f1ff" ${st(2.5)}/><ellipse cx="66" cy="30" rx="13" ry="19" transform="rotate(20 66 30)" fill="#d8f1ff" ${st(2.5)}/>` +
      `<path d="M84 60 L96 58 L86 66Z" fill="${O}"/><ellipse cx="58" cy="60" rx="28" ry="21" fill="#ffd23f" ${st()}/>` +
      `<path d="M54 40 Q48 60 54 80 L62 81 Q56 60 62 39Z M70 42 Q66 60 70 78 L77 75 Q73 60 77 45Z" fill="#3a3330"/>` +
      `<circle cx="28" cy="56" r="15" fill="#ffd23f" ${st()}/>` + auge(24, 54, 3.4) + `<path d="M20 62 Q25 66 30 62" fill="none" ${st(2.2)}/><path d="M22 42 Q18 30 12 30 M32 42 Q34 30 40 28" fill="none" ${st(2.4)}/>`,
    vogel: () => `<path d="M70 56 L96 44 L92 62 L78 68Z" fill="#3b78c9" ${st()}/><path d="M40 86 L40 94 M52 86 L52 94" ${st(3)} fill="none"/>` +
      `<ellipse cx="48" cy="56" rx="32" ry="30" fill="#5aa9f0" ${st()}/><ellipse cx="42" cy="68" rx="18" ry="16" fill="#e6f4ff"/>` +
      `<path d="M50 52 Q70 46 76 62 Q62 72 50 62Z" fill="#3b78c9" ${st(2.5)}/><path d="M18 48 L2 54 L18 60Z" fill="#ffb52e" ${st(2.5)}/>` + auge(32, 44, 4.5) + wange(28, 56, 4) +
      `<path d="M44 26 Q46 14 54 14 Q52 22 54 28" fill="#5aa9f0" ${st(2.5)}/>`,
    blatt: () => `<path d="M50 6 C88 24 90 70 50 96 C10 70 12 24 50 6Z" fill="#5fc16a" ${st()}/><path d="M50 16 L50 90 M50 40 L32 30 M50 56 L30 50 M50 40 L68 30 M50 56 L70 50 M50 72 L36 68 M50 72 L64 68" fill="none" stroke="#2f7d3d" stroke-width="2.4" stroke-linecap="round"/>`,
    regenbogen: () => ['#e8504a', '#ffb52e', '#ffe066', '#5fc16a', '#4a8fe8'].map((c, i) => `<path d="M${12 + i * 7} 72 A${38 - i * 7} ${38 - i * 7} 0 0 1 ${88 - i * 7} 72" fill="none" stroke="${c}" stroke-width="7.5"/>`).join('') +
      `<g fill="#fff" ${st(2.5)}><path d="M4 78 Q4 66 14 68 Q20 60 28 68 Q36 68 34 78 Q34 84 28 84 L10 84 Q4 84 4 78Z"/><path d="M66 78 Q66 66 76 68 Q82 60 90 68 Q98 68 96 78 Q96 84 90 84 L72 84 Q66 84 66 78Z"/></g>`,
    funke: () => `<circle cx="50" cy="50" r="46" fill="#fff6a8" opacity=".35"/><circle cx="50" cy="50" r="32" fill="#fff6a8" opacity=".5"/>` +
      `<path d="${sternPfad(50, 50, 30, 11, 4)}" fill="#ffe14d" ${st(3)}/><circle cx="50" cy="50" r="7" fill="#fff"/>`,
    korb: () => `<path d="M18 46 Q50 0 82 46" fill="none" ${st(5)}/><path d="M10 46 L90 46 L80 90 Q50 96 20 90Z" fill="#d9a35b" ${st()}/><path d="M14 60 L86 60 M17 74 L83 74 M34 46 L38 92 M50 46 L50 93 M66 46 L62 92" fill="none" stroke="#a8743f" stroke-width="2.6"/>`,
    buch: () => `<path d="M10 24 Q30 14 50 24 Q70 14 90 24 L90 82 Q70 72 50 82 Q30 72 10 82Z" fill="#fff8e6" ${st()}/><path d="M50 24 L50 82" ${st(2.5)} fill="none"/>` +
      `<path d="M20 38 Q30 34 40 38 M20 50 Q30 46 40 50 M20 62 Q30 58 40 62 M60 38 Q70 34 80 38 M60 50 Q70 46 80 50" fill="none" stroke="#b9a78a" stroke-width="2.4" stroke-linecap="round"/><path d="M62 58 l14 0 l0 14 l-7 -5 l-7 5Z" fill="#e8504a"/>`,
    lupe: () => `<path d="M62 62 L90 90" fill="none" stroke="${O}" stroke-width="13" stroke-linecap="round"/><path d="M64 64 L88 88" fill="none" stroke="#e0a04e" stroke-width="7" stroke-linecap="round"/>` +
      `<circle cx="42" cy="42" r="30" fill="#c9ecff" ${st(5)}/>` + glanz(32, 30, 10, 5),
    feuer: () => `<path d="M20 86 L80 94 M20 94 L80 86" stroke="#8a5a33" stroke-width="9" stroke-linecap="round"/><path class="a-flamme" d="M50 8 C62 30 82 40 76 64 C72 82 60 88 50 88 C40 88 28 82 24 64 C20 46 36 44 38 28 C44 34 46 22 50 8Z" fill="#ff9a2e" ${st()}/>` +
      `<path class="a-flamme" d="M50 42 C56 54 64 58 62 70 C60 80 56 84 50 84 C44 84 40 80 38 70 C36 60 46 56 50 42Z" fill="#ffe066"/>`,
    wirbel: () => `<circle cx="50" cy="50" r="42" fill="#b79cf5" ${st()}/><path d="M50 50 m0 -6 a6 6 0 1 1 -6 6 a14 14 0 1 1 14 14 a22 22 0 1 1 22 -22 a30 30 0 0 0 -30 -30" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`,
    perle: () => `<circle cx="50" cy="50" r="46" fill="#fff" opacity=".3"/><circle cx="50" cy="50" r="34" fill="#fff5fb" ${st(3.5)}/><path d="M28 60 Q50 82 74 58 Q66 80 50 82 Q34 80 28 60Z" fill="#ffc4dc"/>` + glanz(38, 36, 10, 6) + `<circle cx="62" cy="62" r="3" fill="#fff"/>`,
    // ---------- Neue Meerestiere (Aquarium, Spiele) ----------
    seepferdchen: () => { const c = '#ffb52e';
      return `<path d="M48 66 Q52 92 34 90 Q22 86 28 76 Q34 70 40 78" fill="none" stroke="${O}" stroke-width="13" stroke-linecap="round"/><path d="M48 66 Q52 92 34 90 Q22 86 28 76 Q34 70 40 78" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/>` +
        `<path d="M34 46 Q18 50 26 64 Q32 58 38 58Z" fill="#ff8fb8" ${st(2.5)}/>` +
        `<ellipse cx="48" cy="54" rx="15" ry="20" transform="rotate(-12 48 54)" fill="${c}" ${st()}/><path d="M40 46 L54 44 M38 54 L54 52 M40 62 L54 60" fill="none" stroke="${dunkel(c, .2)}" stroke-width="2.4" stroke-linecap="round"/>` +
        `<path d="M50 18 L54 6 L58 16 L64 8 L64 20Z" fill="${dunkel(c, .1)}" ${st(2.5)}/>` +
        `<path d="M64 22 L88 20 Q92 26 88 31 L64 33Z" fill="${c}" ${st()}/><circle cx="56" cy="27" r="15" fill="${c}" ${st()}/>` + auge(56, 25, 4.2) + wange(62, 33, 3.5); },
    delfin: () => `<path d="M50 34 Q56 12 68 18 Q62 26 64 36Z" fill="#3f7fd8" ${st()}/>` +
      `<path d="M6 56 Q4 50 16 48 Q30 30 58 32 Q80 34 88 48 L98 40 Q100 54 94 62 Q100 70 98 78 L86 66 Q70 76 44 72 Q24 70 16 62 Q6 62 6 56Z" fill="#5aa0f0" ${st()}/>` +
      `<path d="M16 60 Q40 72 82 64 Q66 74 44 72 Q26 70 16 62Z" fill="#e3f1ff"/><path d="M44 64 Q40 82 52 84 Q52 72 58 66Z" fill="#3f7fd8" ${st(2.5)}/>` +
      auge(28, 47, 4.2) + `<path d="M8 56 Q14 60 22 58" fill="none" ${st(2.4)}/>` + wange(32, 56, 4) + glanz(50, 38, 12, 3.5, -6),
    rochen: () => `<path d="M50 72 Q54 90 70 96" fill="none" stroke="${O}" stroke-width="7" stroke-linecap="round"/><path d="M50 72 Q54 90 70 96" fill="none" stroke="#7f8fd8" stroke-width="3" stroke-linecap="round"/>` +
      `<path d="M50 20 Q72 28 97 52 Q74 60 58 72 Q50 78 42 72 Q26 60 3 52 Q28 28 50 20Z" fill="#7f8fd8" ${st()}/>` +
      `<path d="M50 30 Q64 36 80 50 Q66 54 56 62 Q50 66 44 62 Q34 54 20 50 Q36 36 50 30Z" fill="#a9b6f0"/>` +
      `<circle cx="30" cy="48" r="3" fill="#5a67b8"/><circle cx="70" cy="48" r="3" fill="#5a67b8"/><circle cx="24" cy="54" r="2.4" fill="#5a67b8"/><circle cx="76" cy="54" r="2.4" fill="#5a67b8"/>` +
      auge(43, 44, 3.6) + auge(57, 44, 3.6) + `<path d="M45 53 Q50 57 55 53" fill="none" ${st(2.3)}/>`,
    hai: () => `<path d="M46 36 Q54 12 68 18 Q62 26 64 38Z" fill="#7d93b0" ${st()}/>` +
      `<path d="M4 58 Q10 36 46 34 Q78 36 86 48 L98 34 Q96 52 98 72 L86 60 Q76 74 46 74 Q12 74 4 58Z" fill="#9fb4cc" ${st()}/>` +
      `<path d="M8 62 Q30 74 72 66 Q62 74 46 74 Q16 74 8 62Z" fill="#f4f8fc"/><path d="M48 66 Q44 82 56 84 Q56 74 62 68Z" fill="#7d93b0" ${st(2.5)}/>` +
      `<path d="M38 50 Q36 56 38 62 M44 50 Q42 56 44 62" fill="none" stroke="#6d829e" stroke-width="2.4" stroke-linecap="round"/>` +
      auge(24, 50, 4.4) + `<path d="M9 62 Q18 68 28 64" fill="none" ${st(2.4)}/><path d="M14 64 L16 68 L18 65Z M20 65 L22 69 L24 65Z" fill="#fff"/>` + wange(30, 58, 4),
    koralle: () => { const d = 'M50 96 L50 52 M50 76 Q32 70 32 48 M50 66 Q66 62 68 38 M32 60 Q20 58 20 44 M68 48 Q80 46 80 32';
      return `<path d="${d}" fill="none" stroke="${O}" stroke-width="15" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#ff7e9a" stroke-width="9" stroke-linecap="round"/>` +
        `<path d="M44 58 L44 54 M56 42 L56 38" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>`; },
    riff: () => [[30, 70, 20, '#ff9a4d'], [70, 68, 22, '#ffb24d'], [50, 52, 24, '#ffa24d']].map(([x, y, r, c]) =>
      `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" ${st()}/>`).join('') + `<circle cx="42" cy="44" r="3.5" fill="#fff" opacity=".6"/><circle cx="58" cy="56" r="3" fill="#fff" opacity=".6"/><circle cx="26" cy="66" r="3" fill="#fff" opacity=".6"/><circle cx="74" cy="62" r="3" fill="#fff" opacity=".6"/>`,
    tang: () => tang(54, 98, 92, '#2fae7a') + tang(38, 98, 70, '#3fc48c', -1) + tang(68, 98, 56, '#27967a'),
    anker: () => { const d = 'M50 26 L50 86 M30 40 L70 40 M16 64 Q20 88 50 88 Q80 88 84 64';
      return `<path d="${d}" fill="none" stroke="${O}" stroke-width="14" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#a9b8cc" stroke-width="8" stroke-linecap="round"/>` +
        `<circle cx="50" cy="16" r="10" fill="none" stroke="${O}" stroke-width="12"/><circle cx="50" cy="16" r="10" fill="none" stroke="#a9b8cc" stroke-width="6"/>` +
        `<path d="M10 58 L16 64 L24 58 M90 58 L84 64 L76 58" fill="none" stroke="${O}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`; },
    // ---------- Meerestiere ----------
    muschel: () => muschel(),
    krabbe,
    qualle: () => qualle(),
    zierfisch: () => zierfisch(),
    oktopus: () => { const f = '#a57be8'; return [[-34, 20, -40, 44], [-20, 30, -22, 54], [-6, 34, -4, 58], [8, 34, 10, 58], [22, 30, 28, 52], [34, 20, 42, 42]].map(([a, b, c, d]) =>
        `<path d="M${50 + a * .6} 52 Q${50 + a} ${52 + b} ${50 + c} ${42 + d}" fill="none" stroke="${O}" stroke-width="13" stroke-linecap="round"/><path d="M${50 + a * .6} 52 Q${50 + a} ${52 + b} ${50 + c} ${42 + d}" fill="none" stroke="${f}" stroke-width="7.5" stroke-linecap="round"/>`).join('') +
      `<ellipse cx="50" cy="38" rx="30" ry="29" fill="${f}" ${st()}/>` + auge(39, 40, 5) + auge(61, 40, 5) + `<path d="M43 51 Q50 57 57 51" fill="none" ${st(2.6)}/>` + wange(30, 49, 5) + wange(70, 49, 5) + glanz(38, 20, 9, 5); },
    schildkroete: () => `<ellipse cx="24" cy="70" rx="13" ry="8" transform="rotate(-30 24 70)" fill="#7fd38a" ${st()}/><ellipse cx="62" cy="76" rx="13" ry="8" transform="rotate(30 62 76)" fill="#7fd38a" ${st()}/>` +
      `<ellipse cx="22" cy="40" rx="13" ry="8" transform="rotate(30 22 40)" fill="#7fd38a" ${st()}/><path d="M8 58 L2 62 L10 64Z" fill="#7fd38a" ${st(2.5)}/>` +
      `<circle cx="82" cy="46" r="14" fill="#9be3a0" ${st()}/><ellipse cx="44" cy="56" rx="34" ry="27" fill="#3fae6a" ${st()}/>` +
      `<path d="M44 38 L58 46 L58 62 L44 72 L30 62 L30 46Z" fill="#6fd08a" ${st(2.5)}/><path d="M44 38 L44 30 M58 46 L72 40 M58 62 L70 72 M44 72 L44 82 M30 62 L18 70 M30 46 L16 40" fill="none" ${st(2.5)}/>` +
      auge(86, 43, 3.6) + `<path d="M82 52 Q87 55 91 51" fill="none" ${st(2.2)}/>` + wange(79, 51, 3),
    seestern: () => `<path d="${sternPfad(50, 54, 44, 22)}" fill="#ff9a4d" stroke="${O}" stroke-width="9" stroke-linejoin="round"/><path d="${sternPfad(50, 54, 44, 22)}" fill="#ff9a4d" stroke="#ff9a4d" stroke-width="3" stroke-linejoin="round"/>` +
      auge(42, 50, 4) + auge(58, 50, 4) + `<path d="M44 60 Q50 66 56 60" fill="none" ${st(2.5)}/>` + wange(35, 58, 4) + wange(65, 58, 4) +
      `<circle cx="50" cy="24" r="3" fill="#ffd9a8"/><circle cx="22" cy="46" r="3" fill="#ffd9a8"/><circle cx="78" cy="46" r="3" fill="#ffd9a8"/><circle cx="32" cy="80" r="3" fill="#ffd9a8"/><circle cx="68" cy="80" r="3" fill="#ffd9a8"/>`,
    wal: () => `<path d="M24 20 Q20 8 12 10 M28 20 Q30 6 38 8" fill="none" stroke="#bfeeff" stroke-width="5" stroke-linecap="round"/>` +
      `<path d="M6 58 Q8 30 42 30 Q72 30 82 52 L97 38 Q100 54 93 64 Q86 62 81 64 Q66 82 40 82 Q8 82 6 58Z" fill="#4f8fe8" ${st()}/>` +
      `<path d="M8 64 Q30 74 60 70 Q52 82 38 82 Q14 82 8 64Z" fill="#d8ecff"/>` + auge(26, 54, 4.6) + `<path d="M10 64 Q20 70 30 66" fill="none" ${st(2.4)}/>` + wange(34, 62, 4) +
      `<path d="M50 62 Q58 72 68 64" fill="#3b76cf" ${st(2.5)}/>` + glanz(44, 38, 12, 4, -8),
    kugelfisch: () => `<path d="${sternPfad(50, 52, 44, 35, 14)}" fill="#ffd23f" ${st()}/><circle cx="50" cy="52" r="34" fill="#ffd23f"/><path d="M22 62 Q50 84 78 62 Q70 82 50 84 Q30 82 22 62Z" fill="#fff3c4"/>` +
      `<circle cx="37" cy="44" r="8" fill="#fff" ${st(2)}/><circle cx="63" cy="44" r="8" fill="#fff" ${st(2)}/><circle cx="38" cy="45" r="3.6" fill="#1b2140"/><circle cx="62" cy="45" r="3.6" fill="#1b2140"/>` +
      `<ellipse cx="50" cy="62" rx="6" ry="4.5" fill="#ff7a6b" ${st(2.2)}/>` + wange(28, 56, 4) + wange(72, 56, 4),
    truhe: () => `<path d="M12 46 Q12 18 50 18 Q88 18 88 46Z" fill="#b9743a" ${st()}/><rect x="12" y="46" width="76" height="40" rx="4" fill="#a8652e" ${st()}/>` +
      `<path d="M28 20 L28 86 M72 20 L72 86 M12 46 L88 46" fill="none" stroke="#ffd23f" stroke-width="6"/><path d="M28 20 L28 86 M72 20 L72 86" fill="none" ${st(1.5)} opacity=".4"/>` +
      `<rect x="42" y="40" width="16" height="18" rx="4" fill="#ffd23f" ${st(2.5)}/><circle cx="50" cy="48" r="3" fill="${O}"/>` + glanz(40, 28, 8, 4),
    uboot: () => `<g transform="translate(2 20) scale(.4)">${uboot().replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>`,
  };

  const hat = (name) => !!(TIERE[name] || DINGE[name] || name === 'nala');
  // Bild zu einem Namen: Tierkopf oder Ding
  function bild(name, cls = '') {
    if (name === 'nala') return nala(cls);
    if (TIERE[name]) return kopf(name, cls);
    if (DINGE[name]) return svg(DINGE[name](), '0 0 100 100', 'art ' + cls);
    return `<span class="art-emoji ${cls}">${name}</span>`;      // alte gespeicherte Emojis
  }
  const roh = (inner, cls = '', vb) => svg(inner, vb, 'art ' + cls);

  // Alte Emoji-Avatare/Sticker auf neue Grafiken abbilden
  const EMOJI = { '🐿️': 'nala', '🦊': 'fuchs', '🐻': 'baer', '🐼': 'panda', '🐰': 'hase', '🦔': 'igel', '🦉': 'eule', '🐸': 'frosch',
    '🐱': 'katze', '🐶': 'hund', '🦁': 'loewe', '🐨': 'koala', '🐯': 'tiger', '🐝': 'biene', '🌰': 'nuss', '🍄': 'pilz', '🌸': 'blume',
    '🦋': 'schmetterling', '🌟': 'stern', '🍀': 'blatt', '🌼': 'blume', '🍁': 'blatt', '🌈': 'regenbogen', '🌻': 'sonne' };
  const avatar = (v, cls = '') => bild(EMOJI[v] || v, cls);

  // ============================================================
  // SZENEN – Unterwasser-Hintergründe mit Stimmung
  // ============================================================
  const HIMMEL = {
    morgen: ['#ffc9a0', '#ffe6c4'],
    tag:    ['#58b8ff', '#c9efff'],
    abend:  ['#6a4fb0', '#ff9a7a'],
    nacht:  ['#0e1440', '#2a3580'],
  };
  function tageszeit() {
    const h = new Date().getHours();
    return h < 6 ? 'nacht' : h < 9 ? 'morgen' : h < 18 ? 'tag' : h < 21 ? 'abend' : 'nacht';
  }
  const grad = (id, farben, x2 = 0, y2 = 1) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">` +
    farben.map((c, i) => `<stop offset="${(i / (farben.length - 1)).toFixed(2)}" stop-color="${c}"/>`).join('') + '</linearGradient>';
  const zufallsFolge = (seed) => { let r = seed; return () => (r = (r * 16807) % 2147483647) / 2147483647; };
  const punkte = (n, w, y0, h, seed, farbe = '#fff', rMax = 2.4, op = 0.7) => {
    const rnd = zufallsFolge(seed); let s = '';
    for (let i = 0; i < n; i++) s += `<circle cx="${(rnd() * w).toFixed(0)}" cy="${(y0 + rnd() * h).toFixed(0)}" r="${(0.8 + rnd() * rMax).toFixed(1)}" fill="${farbe}" opacity="${(op * (0.4 + rnd() * 0.6)).toFixed(2)}"/>`;
    return s;
  };
  // Bausteine des Meeresbodens
  const astKoralle = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${c}" stroke-width="10" stroke-linecap="round"><path d="M0 0 L0 -44 M0 -18 Q-18 -24 -18 -46 M0 -28 Q16 -32 18 -56 M-18 -34 Q-30 -36 -30 -50 M18 -42 Q30 -44 30 -58"/></g>`;
  const kugelKoralle = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="-16" cy="-12" r="16" fill="${dunkel(c, .1)}"/><circle cx="14" cy="-14" r="18" fill="${dunkel(c, .05)}"/><circle cx="0" cy="-26" r="19" fill="${c}"/>` +
    `<circle cx="-6" cy="-30" r="3" fill="#fff" opacity=".5"/><circle cx="8" cy="-22" r="3" fill="#fff" opacity=".5"/><circle cx="-16" cy="-14" r="2.5" fill="#fff" opacity=".5"/></g>`;
  const tang = (x, y, h, c, neig = 1) => `<path d="M${x} ${y} Q${x - 22 * neig} ${y - h * .35} ${x + 6 * neig} ${y - h * .6} Q${x + 24 * neig} ${y - h * .85} ${x - 2 * neig} ${y - h} Q${x + 12 * neig} ${y - h * .8} ${x - 8 * neig} ${y - h * .55} Q${x - 30 * neig} ${y - h * .3} ${x + 12} ${y}Z" fill="${c}"/>`;
  const fels = (x, y, w, h, c) => `<path d="M${x} ${y} Q${x + w * .05} ${y - h} ${x + w * .4} ${y - h * .9} Q${x + w * .8} ${y - h * 1.1} ${x + w} ${y}Z" fill="${c}"/>`;
  const strahlen = (id, op) => `<path d="M40 0 L120 0 L260 640 L120 640Z" fill="url(#${id}l)" opacity="${op}"/><path d="M230 0 L290 0 L390 540 L300 540Z" fill="url(#${id}l)" opacity="${op * .7}"/><path d="M150 0 L176 0 L210 460 L170 460Z" fill="url(#${id}l)" opacity="${op * .5}"/>`;
  const sandboden = (c1, c2) => `<path d="M0 690 Q80 650 170 690 Q270 730 400 670 L400 800 L0 800Z" fill="${c1}"/><path d="M0 735 Q120 705 240 742 Q330 762 400 732 L400 800 L0 800Z" fill="${c2}"/>`;

  const SZENEN = {
    vulkan: () => [['#3a1f5a', '#2a2a7a', '#1a1c4a'], .06, ['#4a3a5a', '#3a2c4a'],
      `<path d="M120 760 L170 600 Q200 580 230 600 L280 760Z" fill="#2a1830"/><path d="M178 604 Q200 590 222 604 L214 620 Q200 612 186 620Z" fill="#ff8a3d"/>` +
      `<ellipse cx="200" cy="600" rx="70" ry="30" fill="#ffb24d" opacity=".25"/>` + fels(-30, 780, 160, 210, '#1a1028') + fels(290, 780, 150, 240, '#1a1028') +
      astKoralle(330, 720, 1, '#ff8a3d') + punkte(30, 400, 60, 520, 41, '#ffd9a0', 2.2, .7)],
    graben: () => [['#071030', '#0c1a50', '#14246a'], .04, null,
      fels(-40, 800, 170, 420, '#040a22') + fels(280, 800, 170, 460, '#040a22') + astKoralle(60, 760, 1.3, '#4dffd2') + astKoralle(352, 740, 1.2, '#ff6fe0') +
      kugelKoralle(110, 780, .9, '#7af0ff') + punkte(70, 400, 20, 760, 53, '#7af0ff', 2.4, .9)],
    wrack: () => [['#5fd0c8', '#2a8a9a', '#16506a'], .18, ['#d9c58f', '#c2ab72'],
      `<path d="M60 720 L110 600 L330 600 L360 700 L300 740Z" fill="#5a3a24"/><path d="M110 600 L330 600 L320 624 L118 624Z" fill="#7a5232"/>` +
      `<path d="M210 600 L210 440 M210 470 L290 500 L210 530" fill="none" stroke="#6b4324" stroke-width="9"/><circle cx="150" cy="660" r="16" fill="#163a4a"/><circle cx="220" cy="664" r="16" fill="#163a4a"/><circle cx="290" cy="666" r="14" fill="#163a4a"/>` +
      tang(30, 730, 200, '#2a9a7a') + tang(380, 724, 160, '#2fae7a', -1)],
    perlgrund: () => [['#ffd8f0', '#c8a0f0', '#6a5ac8'], .22, ['#f6e2f0', '#e6c4dc'],
      `<g transform="translate(-24 600) scale(.9)">${muschel('#ffb8d8')}</g><g transform="translate(334 620) scale(.8)">${muschel('#c8b0ff')}</g>` +
      kugelKoralle(200, 770, .8, '#ff9ad0') + punkte(18, 400, 80, 500, 61, '#fff', 3, .8)],
    // name: [Wasserfarben, Lichtstrahlen, Sand, Deko]
    riff: () => [['#9af3ea', '#3fc8d8', '#1f8fc4'], .26, ['#f3dfa8', '#e6c784'],
      astKoralle(34, 712, 1.2, '#ff7e9a') + kugelKoralle(84, 730, 1, '#ffa24d') + astKoralle(372, 700, 1.4, '#ff9a4d') + kugelKoralle(322, 726, 1.1, '#ff7eb6') +
      tang(14, 720, 150, '#2fae7a') + tang(388, 716, 190, '#3fc48c', -1) + `<path d="${sternPfad(210, 760, 15, 7)}" fill="#ff8f6b"/>`],
    tiefsee: () => [['#0a1038', '#1a1c66', '#3b2a8c'], .08, null,
      punkte(46, 400, 40, 720, 5, '#bfe8ff', 2, .8) + fels(-30, 800, 190, 150, '#0a0d2c') + fels(250, 800, 190, 190, '#0a0d2c') +
      astKoralle(60, 700, 1, '#7ad7ff') + astKoralle(340, 660, 1.1, '#f58fe0') + kugelKoralle(110, 724, .8, '#8f7cf0')],
    seegras: () => [['#8fe8c8', '#2fa890', '#126a72'], .2, ['#cdd9a0', '#aebd7c'],
      [20, 70, 120, 290, 340, 384].map((x, i) => tang(x, 730 - i % 2 * 14, 300 + (i * 67) % 220, i % 2 ? '#1f8f6a' : '#2aa67a', i % 2 ? 1 : -1)).join('') + fels(150, 760, 110, 50, '#7a8f6a')],
    schatz: () => [['#6fd8f5', '#2a8fd0', '#1a4f9a'], .22, ['#f0d68f', '#dcb866'],
      fels(-20, 730, 150, 120, '#3b6fa8') + fels(290, 720, 140, 150, '#33639a') +
      `<path d="M252 690 L340 640 L352 700 L290 730Z" fill="#6b4324"/><path d="M300 664 L300 560 M300 574 L340 590 L300 606" fill="#8a5a33" stroke="#6b4324" stroke-width="6"/>` +
      `<circle cx="70" cy="744" r="8" fill="#ffd23f"/><circle cx="92" cy="752" r="6" fill="#ffd23f"/><circle cx="180" cy="760" r="7" fill="#ffd23f"/>` + astKoralle(24, 716, 1, '#ff7e9a')],
    wasser: () => [['#7fe3f0', '#3fb3e0', '#1c63b0', '#123f7d'], .22, ['#e8cf8f', '#d9b96e'],
      tang(40, 724, 150, '#2fae7a') + tang(70, 734, 120, '#3fc48c', -1) + tang(350, 724, 170, '#2fae7a', -1) + tang(322, 734, 100, '#3fc48c') +
      `<ellipse cx="200" cy="752" rx="34" ry="16" fill="#b9a27a"/><path d="${sternPfad(120, 754, 16, 7)}" fill="#ff8f6b"/>`],
    korallen: () => [['#ffc4d0', '#d98fd8', '#6a58c0'], .2, ['#f6d9c0', '#e6b9a8'],
      kugelKoralle(40, 730, 1.5, '#ff7e9a') + astKoralle(104, 716, 1.3, '#ffb24d') + kugelKoralle(360, 726, 1.6, '#ffa24d') + astKoralle(296, 712, 1.5, '#ff6f91') + astKoralle(200, 760, .8, '#fff')],
    lagune: () => [['#e2fff6', '#9aeee4', '#52c4dc'], .3, ['#fff0c4', '#f1dc9c'],
      kugelKoralle(30, 736, 1, '#ffb24d') + tang(380, 720, 130, '#4fd0a0', -1) + `<path d="${sternPfad(330, 758, 14, 6)}" fill="#ff8f6b"/>` + punkte(14, 400, 100, 500, 11, '#fff', 3, .7)],
    grotte: () => [['#052430', '#0e4756', '#1f6c70'], .16, ['#2a5560', '#1f4450'],
      `<path d="M0 0 L400 0 L400 90 L370 170 L338 80 L300 210 L262 90 L226 140 L190 60 L150 190 L112 80 L70 150 L40 70 L0 130Z" fill="#031820"/>` +
      fels(-40, 800, 180, 260, '#031820') + fels(270, 800, 190, 300, '#031820') + punkte(40, 400, 120, 600, 23, '#9affe0', 2.2, .9)],
  };

  function szene(name) {
    const id = 'sz' + (++uid);
    const [farben, licht, sand, deko] = (SZENEN[name] || SZENEN.riff)();
    const s = `<defs>${grad(id + 'h', farben)}${grad(id + 'l', ['#ffffff', '#ffffff00'])}</defs>` +
      `<rect width="400" height="800" fill="url(#${id}h)"/>` + strahlen(id, licht) +
      (sand ? sandboden(sand[0], sand[1]) : '') + deko;
    return `<svg class="szene-svg" viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${s}</svg>`;
  }

  // ============================================================
  // TAUCHKARTE – von der Wasseroberfläche hinab in die Tiefsee
  // ============================================================
  const KARTE_H = 1780;
  function karte(zeit, orte) {
    const id = 'k' + (++uid), H = KARTE_H;
    const nacht = zeit === 'nacht', abend = zeit === 'abend';
    let s = `<defs>${grad(id + 'h', HIMMEL[zeit] || HIMMEL.tag)}${grad(id + 'g', ['#7fe9e6', '#3fc0dc', '#2590cc', '#1c63b0', '#1a3f8f', '#1b2a70', '#141a50', '#0a1036', '#060a26'])}${grad(id + 'l', ['#ffffff', '#ffffff00'])}</defs>` +
      `<rect width="400" height="${H}" fill="url(#${id}g)"/><rect width="400" height="232" fill="url(#${id}h)"/>`;
    // Himmel über dem Wasser
    if (nacht) s += punkte(26, 400, 0, 190, 3, '#fff', 1.4, 1) + `<circle cx="320" cy="76" r="26" fill="#fff6c9"/><circle cx="320" cy="76" r="38" fill="#fff6c9" opacity=".25"/>`;
    else s += `<circle cx="${abend ? 300 : 322}" cy="${abend ? 150 : 74}" r="46" fill="#fff3a8" opacity=".5"/><circle cx="${abend ? 300 : 322}" cy="${abend ? 150 : 74}" r="31" fill="${abend ? '#ffd9a0' : '#ffe066'}"/>` +
      `<path d="M30 70 Q28 54 46 54 Q52 36 72 44 Q88 34 98 50 Q118 48 118 66 Q118 78 104 78 L42 78 Q30 78 30 70Z" fill="#fff" opacity=".9"/>`;
    // Kleine Insel mit Palme, dann die Wasserlinie
    s += `<path d="M20 232 Q70 176 130 232Z" fill="#f3dfa8"/><path d="M74 204 Q70 160 82 134" fill="none" stroke="#8a5a33" stroke-width="7" stroke-linecap="round"/>` +
      `<path d="M82 134 Q56 120 40 136 Q62 130 82 134 Q104 112 126 124 Q104 124 82 134 Q88 106 70 94 Q76 116 82 134 Q110 132 120 150 Q102 138 82 134" fill="#3fae5a"/>` +
      `<path d="M0 232 Q25 218 50 232 T100 232 T150 232 T200 232 T250 232 T300 232 T350 232 T400 232 L400 262 L0 262Z" fill="#7fe9e6"/>` +
      `<path d="M0 232 Q25 218 50 232 T100 232 T150 232 T200 232 T250 232 T300 232 T350 232 T400 232" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".9"/>`;
    // Licht von oben
    s += `<path d="M60 240 L130 240 L250 900 L130 900Z" fill="url(#${id}l)" opacity=".2"/><path d="M250 240 L300 240 L390 780 L300 780Z" fill="url(#${id}l)" opacity=".14"/>`;
    // Ferne Bewohner als Schatten
    s += `<g opacity=".16" fill="#0b1f5a"><path d="M250 600 Q252 572 286 572 Q316 572 326 594 L341 580 Q344 596 337 606 Q324 624 284 624 Q252 624 250 600Z"/><g transform="translate(40 880) scale(.8)"><path d="M12 52 Q10 8 50 8 Q90 8 88 52Z"/><path d="M26 54 Q20 68 28 90 M50 56 L50 96 M74 54 Q80 68 72 90" stroke="#0b1f5a" stroke-width="5" fill="none"/></g></g>`;
    // Felsen und Riffe an den Rändern, je tiefer desto dunkler
    [[-30, 470, 110, 120], [330, 560, 110, 150], [-40, 760, 120, 170], [320, 860, 120, 160], [-30, 1010, 130, 190], [310, 1090, 130, 170]].forEach(([x, y, w, h], i) => { s += fels(x, y, w, h, mix('#2f86b8', '#10184a', y / H)); });
    s += astKoralle(24, 470, 1, '#ff7e9a') + kugelKoralle(372, 560, 1, '#ffa24d') + tang(16, 760, 150, '#2fae7a') + tang(388, 860, 170, '#27967a', -1) + astKoralle(30, 1010, 1.1, '#b79cf5') + kugelKoralle(366, 1090, 1.1, '#7ad7ff') +
      tang(200, 420, 90, '#3fc48c') + tang(206, 660, 70, '#2fae7a', -1);
    // Tiefsee-Graben: dunkler, mit leuchtenden Korallen und Plankton
    s += `<path d="M0 1222 Q100 1200 200 1218 Q300 1236 400 1212" fill="none" stroke="#9affe0" stroke-width="3" stroke-dasharray="2 12" stroke-linecap="round" opacity=".6"/>` +
      `<text x="200" y="1250" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="19" letter-spacing="3" fill="#9affe0" opacity=".75">TIEFSEE-GRABEN</text>`;
    [[-40, 1330, 140, 230], [300, 1440, 140, 250], [-50, 1580, 150, 260], [300, 1700, 150, 240]].forEach(([x, y, w, h]) => { s += fels(x, y, w, h, '#070c2c'); });
    s += astKoralle(26, 1330, 1.1, '#4dffd2') + astKoralle(374, 1440, 1.1, '#ff6fe0') + kugelKoralle(30, 1580, 1, '#7af0ff') + astKoralle(370, 1700, 1.2, '#ffd23f');
    s += `<g opacity=".22" fill="#9affe0"><circle cx="230" cy="1350" r="5"/><path d="M230 1350 Q250 1330 270 1340" stroke="#9affe0" stroke-width="3" fill="none"/><path d="M250 1356 Q260 1340 300 1350 Q310 1366 290 1376 Q262 1380 250 1366Z"/></g>`;
    // Meeresgrund mit Schatzleuchten
    s += `<ellipse cx="270" cy="${H - 70}" rx="130" ry="56" fill="#ffd66b" opacity=".18"/><path d="M0 ${H - 40} Q100 ${H - 70} 200 ${H - 42} Q300 ${H - 16} 400 ${H - 50} L400 ${H} L0 ${H}Z" fill="#1a2458"/>` +
      punkte(36, 400, 760, 440, 31, '#9affe0', 2.2, .8) + punkte(60, 400, 1240, 520, 37, '#9affe0', 2.4, .9);
    // Tauchroute als Blasenspur
    const p = orte.map((o) => [o.x, o.y]);
    let d = `M200 262 Q${p[0][0]} 280 ${p[0][0]} ${p[0][1]}`;
    for (let i = 1; i < p.length; i++) { const my = (p[i - 1][1] + p[i][1]) / 2; d += ` C${p[i - 1][0]} ${my} ${p[i][0]} ${my} ${p[i][0]} ${p[i][1]}`; }
    s += `<path d="${d}" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round" opacity=".14"/>` +
      `<path d="${d}" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-dasharray="1 22" opacity=".9"/>`;
    if (nacht || abend) s += `<rect width="400" height="${H}" fill="${nacht ? '#060b30' : '#3a1f6a'}" opacity="${nacht ? .34 : .16}"/>`;
    return `<svg class="karte-svg" viewBox="0 0 400 ${H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${s}</svg>`;
  }

  // Kleine Symbole für Knöpfe
  const ICON = {
    x: '<path d="M26 26 L74 74 M74 26 L26 74" fill="none" stroke="currentColor" stroke-width="13" stroke-linecap="round"/>',
    play: '<path d="M34 20 L82 50 L34 80Z" fill="currentColor" stroke="currentColor" stroke-width="8" stroke-linejoin="round"/>',
    karte: '<path d="M10 24 L36 14 L64 24 L90 14 L90 76 L64 86 L36 76 L10 86Z M36 14 L36 76 M64 24 L64 86" fill="none" stroke="currentColor" stroke-width="8" stroke-linejoin="round"/>',
    album: '<rect x="16" y="12" width="68" height="76" rx="8" fill="none" stroke="currentColor" stroke-width="8"/><path d="' + sternPfad(50, 50, 20, 9) + '" fill="currentColor"/>',
    eltern: '<circle cx="34" cy="30" r="13" fill="currentColor"/><circle cx="70" cy="38" r="10" fill="currentColor"/><path d="M10 84 Q10 52 34 52 Q58 52 58 84Z M56 84 Q56 58 72 58 Q90 58 90 84Z" fill="currentColor"/>',
    wechsel: '<path d="M22 40 A30 30 0 0 1 78 36 M78 60 A30 30 0 0 1 22 64" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round"/><path d="M82 16 L80 40 L58 34Z M18 84 L20 60 L42 66Z" fill="currentColor"/>',
    ohr: '<path d="M30 62 Q20 20 52 16 Q80 16 78 44 Q76 60 62 66 Q56 70 56 78 Q54 90 42 88 Q34 86 34 78" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round"/>',
    nochmal: '<path d="M78 50 A28 28 0 1 1 64 26" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round"/><path d="M58 8 L84 22 L60 40Z" fill="currentColor"/>',
    haken: '<path d="M18 54 L40 76 L84 26" fill="none" stroke="currentColor" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>',
    plus: '<path d="M50 18 L50 82 M18 50 L82 50" fill="none" stroke="currentColor" stroke-width="13" stroke-linecap="round"/>',
    zu: '<rect x="20" y="44" width="60" height="44" rx="9" fill="currentColor"/><path d="M33 46 V32 Q33 13 50 13 Q67 13 67 32 V46" fill="none" stroke="currentColor" stroke-width="10"/>',
    aquarium: '<path d="M10 50 Q32 20 62 32 L88 16 L82 50 L88 84 L62 68 Q32 80 10 50Z" fill="none" stroke="currentColor" stroke-width="8" stroke-linejoin="round"/><circle cx="30" cy="46" r="6" fill="currentColor"/>',
    stern: '<path d="' + sternPfad(50, 53, 44, 20) + '" fill="currentColor" stroke="currentColor" stroke-width="6" stroke-linejoin="round"/>',
  };
  const icon = (name, cls = '') => svg(ICON[name] || '', '0 0 100 100', 'icon ' + cls);
  const sternSVG = (voll) => svg(`<path d="${sternPfad(50, 53, 44, 20)}" fill="${voll ? '#ffd23f' : 'rgba(255,255,255,.28)'}" stroke="${voll ? '#b9770e' : 'rgba(0,0,0,.25)'}" stroke-width="6" stroke-linejoin="round"/>` + (voll ? glanz(40, 40, 7, 4) : ''), '0 0 100 100', 'art st' + (voll ? ' voll' : ''));

  return { nala, uboot, kopf, bild, avatar, roh, hat, szene, karte, KARTE_H, tageszeit, icon, sternSVG,
    pilz, kaefer, fisch, schmetterling, kristall, stein, muschel, krabbe, qualle, zierfisch, TIERE: Object.keys(TIERE), hell, dunkel };
})();
