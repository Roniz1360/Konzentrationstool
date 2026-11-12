/* art.js – Alle Grafiken des Spiels, direkt im Code gezeichnet (SVG).
   Keine Emojis, keine externen Bilder: sieht auf jedem Gerät gleich aus
   und funktioniert offline. Stil: Bilderbuch – runde Formen, warme Farben,
   weiche Umrisslinie. */

const Art = (() => {
  const O = '#4a3526';                       // Umrisslinie
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
    const F = '#e07d3c', F2 = '#c9652a', C = '#fde9cc';
    return svg(
      `<ellipse cx="100" cy="212" rx="56" ry="7" fill="#000" opacity=".14"/>` +
      // Schwanz
      `<g class="n-schwanz"><path d="M118 196 C172 206 204 160 192 110 C184 72 152 52 134 68 C120 80 130 100 146 98 C160 96 162 114 154 132 C146 152 132 164 118 172 Z" fill="${F2}" ${st(4)}/>` +
      `<path d="M134 186 C168 184 186 154 180 116 C176 92 160 76 148 80" fill="none" stroke="${hell(F, .25)}" stroke-width="9" stroke-linecap="round" opacity=".75"/></g>` +
      // Körper
      `<g class="n-koerper"><ellipse cx="78" cy="204" rx="17" ry="9" fill="${F2}" ${st(4)}/><ellipse cx="122" cy="204" rx="17" ry="9" fill="${F2}" ${st(4)}/>` +
      `<path d="M62 150 C58 186 74 206 100 206 C126 206 142 186 138 150 C134 122 66 122 62 150Z" fill="${F}" ${st(4)}/>` +
      `<ellipse cx="100" cy="168" rx="23" ry="30" fill="${C}"/>` +
      // Arme
      `<ellipse class="n-arm-l" cx="68" cy="156" rx="9" ry="16" transform="rotate(24 68 156)" fill="${F}" ${st(4)}/>` +
      `<g class="n-arm-r"><ellipse cx="132" cy="156" rx="9" ry="16" transform="rotate(-24 132 156)" fill="${F}" ${st(4)}/></g></g>` +
      // Kopf
      `<g class="n-kopf">` +
      `<path d="M62 54 L54 14 L88 36 Z" fill="${F}" ${st(4)}/><path d="M138 54 L146 14 L112 36 Z" fill="${F}" ${st(4)}/>` +
      `<path d="M65 44 L61 24 L78 36 Z" fill="#f7b0a0"/><path d="M135 44 L139 24 L122 36 Z" fill="#f7b0a0"/>` +
      `<ellipse cx="100" cy="84" rx="50" ry="45" fill="${F}" ${st(4)}/>` +
      `<path d="M58 96 C60 122 80 128 100 128 C120 128 140 122 142 96 C132 84 116 90 100 96 C84 90 68 84 58 96Z" fill="${C}"/>` +
      `<g class="n-augen"><ellipse cx="80" cy="80" rx="9" ry="12" fill="#2e211a"/><circle cx="77" cy="75" r="4" fill="#fff"/><circle cx="83" cy="85" r="1.8" fill="#fff"/>` +
      `<ellipse cx="120" cy="80" rx="9" ry="12" fill="#2e211a"/><circle cx="117" cy="75" r="4" fill="#fff"/><circle cx="123" cy="85" r="1.8" fill="#fff"/></g>` +
      wange(66, 100, 8) + wange(134, 100, 8) +
      `<path d="M93 96 Q100 92 107 96 Q104 104 100 104 Q96 104 93 96Z" fill="#7a3f24"/>` +
      `<path class="n-mund" d="M88 108 Q100 120 112 108" fill="none" ${st(3.5)}/>` +
      `<rect x="95.5" y="110" width="9" height="8" rx="2" fill="#fff" ${st(2)}/>` +
      `</g>`, '0 0 220 222', 'art nala ' + cls);
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
    eichhorn: null,
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
  // SZENEN – Hintergründe mit Stimmung
  // ============================================================
  const HIMMEL = {
    morgen: ['#ffd9b0', '#ffeacb', '#cfeeff'],
    tag:    ['#69c3ff', '#a8e0ff', '#e3f7ff'],
    abend:  ['#5b4b9e', '#f08a6b', '#ffd18a'],
    nacht:  ['#141a45', '#27327a', '#4b56a8'],
  };
  function tageszeit() {
    const h = new Date().getHours();
    return h < 6 ? 'nacht' : h < 9 ? 'morgen' : h < 18 ? 'tag' : h < 21 ? 'abend' : 'nacht';
  }
  const grad = (id, farben, x2 = 0, y2 = 1) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">` +
    farben.map((c, i) => `<stop offset="${(i / (farben.length - 1)).toFixed(2)}" stop-color="${c}"/>`).join('') + '</linearGradient>';
  const wolke = (x, y, s, kl = '', op = 0.92) =>
    `<g class="s-wolke ${kl}" opacity="${op}"><g transform="translate(${x} ${y}) scale(${s})"><path d="M0 30 Q-2 14 16 14 Q22 -4 42 4 Q58 -6 68 10 Q88 8 88 26 Q88 38 74 38 L12 38 Q0 38 0 30Z" fill="#fff"/></g></g>`;
  const sterne = (n, w, h, seed = 3) => {
    let s = '', r = seed;
    const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < n; i++) s += `<circle class="s-stern s${i % 4}" cx="${(rnd() * w).toFixed(0)}" cy="${(rnd() * h).toFixed(0)}" r="${(0.8 + rnd() * 1.6).toFixed(1)}" fill="#fff"/>`;
    return s;
  };
  const tanne = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-5" y="-8" width="10" height="14" fill="#6b4324"/><path d="M0 -92 L26 -52 L14 -52 L34 -22 L18 -22 L40 -4 L-40 -4 L-18 -22 L-34 -22 L-14 -52 L-26 -52Z" fill="${c}"/></g>`;
  const laubbaum = (x, y, s, c, stamm = '#7a5232') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-7 0 L-5 -50 L5 -50 L7 0Z" fill="${stamm}"/><circle cx="-20" cy="-62" r="24" fill="${dunkel(c, .08)}"/><circle cx="20" cy="-62" r="24" fill="${dunkel(c, .08)}"/><circle cx="0" cy="-84" r="28" fill="${c}"/><circle cx="0" cy="-58" r="22" fill="${c}"/></g>`;
  const gras = (x, y, c) => `<path d="M${x} ${y} q-6 -16 -10 -18 q6 6 6 18 q2 -18 6 -24 q0 12 2 24 q4 -14 10 -16 q-6 8 -6 16Z" fill="${c}"/>`;
  const blume = (x, y, c) => `<path d="M${x} ${y} l0 -12" stroke="#3f9b4f" stroke-width="2"/><circle cx="${x}" cy="${y - 14}" r="5" fill="${c}"/><circle cx="${x}" cy="${y - 14}" r="2" fill="#ffe066"/>`;
  const gluehen = (n, w, y0, h, seed = 9) => {
    let s = '', r = seed;
    const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < n; i++) s += `<circle class="s-glueh g${i % 5}" cx="${(rnd() * w).toFixed(0)}" cy="${(y0 + rnd() * h).toFixed(0)}" r="3" fill="#fff59a"/>`;
    return s;
  };

  function szene(name) {
    const id = 'sz' + (++uid);
    let s = '';
    if (name === 'wiese' || name === 'blumen' || name === 'bach') {
      const fr = name === 'blumen';
      s = `<defs>${grad(id + 'h', fr ? ['#8fd6ff', '#d5f3ff', '#fdf6d8'] : HIMMEL.tag)}${grad(id + 'g', fr ? ['#a6e07a', '#7fcf63'] : ['#86d46a', '#4fae5b'])}</defs>` +
        `<rect width="400" height="800" fill="url(#${id}h)"/>` +
        `<circle cx="330" cy="90" r="46" fill="#fff3a8" opacity=".5"/><circle cx="330" cy="90" r="32" fill="#ffe066"/>` +
        wolke(30, 70, 1, 'w1') + wolke(220, 150, .7, 'w2', .8) + wolke(-60, 210, .8, 'w3', .7) +
        `<path d="M0 330 Q90 250 190 310 Q290 250 400 320 L400 800 L0 800Z" fill="${fr ? '#b9e89a' : '#a5dc8a'}"/>` +
        laubbaum(40, 330, .8, '#5fbf6a') + laubbaum(350, 322, 1, '#58b765') + tanne(300, 330, .6, '#3f9b63') + tanne(96, 320, .5, '#3f9b63') +
        `<path d="M0 380 Q120 330 240 372 Q330 340 400 368 L400 800 L0 800Z" fill="url(#${id}g)"/>`;
      if (name === 'bach') s += `<path d="M-10 640 Q100 590 210 650 Q310 700 410 640 L410 740 Q300 790 200 740 Q100 690 -10 740Z" fill="#7fd1f5"/><path class="s-welle" d="M20 680 q20 -10 40 0 M150 690 q20 -10 40 0 M270 720 q20 -10 40 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>`;
      for (let i = 0; i < 12; i++) s += gras(18 + i * 34, 396 + (i * 53) % 380, '#3f9b4f');
      const fb = ['#ff8fc0', '#ffe066', '#fff', '#b79cf5', '#ff9a6b'];
      for (let i = 0; i < (fr ? 16 : 8); i++) s += blume(26 + (i * 97) % 360, 420 + (i * 131) % 350, fb[i % 5]);
    } else if (name === 'wald') {
      s = `<defs>${grad(id + 'h', ['#1f6b4f', '#3f9b63', '#8fd47a'])}${grad(id + 'l', ['#fffbd0', '#fffbd000'])}</defs>` +
        `<rect width="400" height="800" fill="url(#${id}h)"/>` +
        [40, 120, 210, 300, 370].map((x, i) => tanne(x, 300 + (i % 2) * 20, 1.5 + (i % 3) * .3, '#2a7d57')).join('') +
        `<path class="s-strahl" d="M250 0 L330 0 L190 560 L70 560Z" fill="url(#${id}l)" opacity=".28"/><path class="s-strahl r2" d="M120 0 L160 0 L60 460 L0 460Z" fill="url(#${id}l)" opacity=".2"/>` +
        `<path d="M0 420 Q100 380 200 410 Q300 380 400 420 L400 800 L0 800Z" fill="#2f8a52"/>` +
        `<path d="M-30 800 L-10 120 Q10 60 40 120 L70 800Z" fill="#6b4324"/><path d="M330 800 L352 80 Q372 30 396 90 L430 800Z" fill="#5d3a1f"/>` +
        `<circle cx="20" cy="110" r="70" fill="#2a7d57"/><circle cx="380" cy="70" r="80" fill="#256f4d"/>` +
        `<path d="M0 560 Q200 510 400 560 L400 800 L0 800Z" fill="#3f9b5c"/>` +
        [30, 110, 290, 372].map((x, i) => gras(x, 600 + i * 40, '#2a7d57')).join('') + gluehen(8, 400, 180, 420);
    } else if (name === 'hoehle') {
      s = `<defs>${grad(id + 'h', ['#1d1640', '#3a2b78', '#5a3f9e'])}<radialGradient id="${id}r" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="#8f7cf0" stop-opacity=".55"/><stop offset="1" stop-color="#8f7cf0" stop-opacity="0"/></radialGradient></defs>` +
        `<rect width="400" height="800" fill="url(#${id}h)"/><rect width="400" height="800" fill="url(#${id}r)"/>` +
        `<path d="M0 0 L400 0 L400 60 L370 130 L340 50 L300 170 L262 60 L226 110 L190 40 L150 150 L112 56 L70 120 L40 50 L0 100Z" fill="#150f30"/>` +
        `<path d="M0 800 L0 640 Q40 600 70 660 Q100 620 130 700 L130 800Z M400 800 L400 620 Q360 590 330 660 Q300 640 280 720 L280 800Z" fill="#150f30"/>` +
        `<g opacity=".9"><path d="M22 660 L38 610 L52 662Z" fill="#7ad7ff"/><path d="M48 668 L66 630 L78 670Z" fill="#b79cf5"/><path d="M340 664 L356 606 L372 666Z" fill="#ff8fc0"/><path d="M312 676 L326 640 L340 678Z" fill="#7ad7ff"/></g>` +
        gluehen(10, 400, 160, 560, 5);
    } else if (name === 'wasser') {
      s = `<defs>${grad(id + 'h', ['#7fe3f0', '#3fb3e0', '#1c63b0', '#123f7d'])}${grad(id + 'l', ['#ffffff', '#ffffff00'])}</defs>` +
        `<rect width="400" height="800" fill="url(#${id}h)"/>` +
        `<path class="s-strahl" d="M60 0 L130 0 L250 620 L120 620Z" fill="url(#${id}l)" opacity=".22"/><path class="s-strahl r2" d="M240 0 L290 0 L380 520 L300 520Z" fill="url(#${id}l)" opacity=".16"/>` +
        `<path d="M0 690 Q80 650 170 690 Q270 730 400 670 L400 800 L0 800Z" fill="#e8cf8f"/><path d="M0 730 Q120 700 240 740 Q330 760 400 730 L400 800 L0 800Z" fill="#d9b96e"/>` +
        `<g class="s-alge"><path d="M40 720 Q20 640 44 580 Q60 640 52 720Z" fill="#2fae7a"/></g><g class="s-alge a2"><path d="M70 730 Q90 660 66 610 Q54 670 60 730Z" fill="#3fc48c"/></g>` +
        `<g class="s-alge a2"><path d="M350 720 Q372 630 346 560 Q330 640 340 720Z" fill="#2fae7a"/></g><g class="s-alge"><path d="M320 730 Q300 670 322 630 Q334 680 330 730Z" fill="#3fc48c"/></g>` +
        `<ellipse cx="200" cy="750" rx="34" ry="16" fill="#b9a27a"/><ellipse cx="250" cy="762" rx="20" ry="10" fill="#a8916b"/><path d="${sternPfad(120, 752, 16, 7)}" fill="#ff8f6b"/>` +
        [50, 140, 260, 340, 200, 90].map((x, i) => `<circle class="s-blase b${i % 3}" cx="${x}" cy="${760 - i * 20}" r="${4 + i % 3 * 2}" fill="none" stroke="#fff" stroke-width="2" opacity=".6"/>`).join('');
    } else if (name === 'abend') {
      s = `<defs>${grad(id + 'h', HIMMEL.abend)}</defs><rect width="400" height="800" fill="url(#${id}h)"/>` +
        `<circle cx="200" cy="330" r="70" fill="#ffe9a3" opacity=".5"/><circle cx="200" cy="330" r="50" fill="#fff0b8"/>` + wolke(20, 120, .9, 'w1', .5) + wolke(250, 200, .7, 'w2', .4) +
        `<path d="M0 350 Q100 290 200 340 Q300 290 400 345 L400 800 L0 800Z" fill="#7a5aa8"/>` +
        tanne(50, 352, .9, '#4a3a80') + tanne(110, 346, .6, '#4a3a80') + tanne(340, 350, 1, '#4a3a80') + tanne(286, 344, .55, '#4a3a80') +
        `<path d="M0 400 Q130 350 250 392 Q330 370 400 390 L400 800 L0 800Z" fill="#4f8a6a"/><path d="M0 520 Q200 470 400 520 L400 800 L0 800Z" fill="#3f7a5c"/>` +
        [20, 100, 180, 260, 340].map((x, i) => gras(x + 10, 470 + (i * 67) % 300, '#2f6a4c')).join('') + gluehen(12, 400, 300, 440, 21);
    } else {  // feuer / nacht
      s = `<defs>${grad(id + 'h', HIMMEL.nacht)}<radialGradient id="${id}r" cx=".5" cy="1" r=".7"><stop offset="0" stop-color="#ffb24d" stop-opacity=".55"/><stop offset="1" stop-color="#ffb24d" stop-opacity="0"/></radialGradient></defs>` +
        `<rect width="400" height="800" fill="url(#${id}h)"/>` + sterne(40, 400, 330) +
        `<circle cx="320" cy="100" r="34" fill="#fff6c9"/><circle cx="308" cy="92" r="30" fill="#141a45" opacity=".0"/>` +
        `<path d="M0 360 Q100 300 200 350 Q300 300 400 355 L400 800 L0 800Z" fill="#1d2a5e"/>` +
        tanne(40, 372, 1.3, '#131d47') + tanne(120, 360, .8, '#131d47') + tanne(350, 370, 1.4, '#131d47') + tanne(280, 358, .8, '#131d47') +
        `<path d="M0 420 Q200 370 400 420 L400 800 L0 800Z" fill="#234a4a"/><rect y="300" width="400" height="500" fill="url(#${id}r)"/>` + gluehen(10, 400, 300, 380, 13);
    }
    return `<svg class="szene-svg" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${s}</svg>`;
  }

  // ============================================================
  // WELTKARTE – der Weg durch den Zauberwald (hochformatig, scrollt)
  // ============================================================
  const KARTE_H = 1240;
  function karte(zeit, orte) {
    const id = 'k' + (++uid), H = KARTE_H;
    const nacht = zeit === 'nacht', abend = zeit === 'abend';
    let s = `<defs>${grad(id + 'h', HIMMEL[zeit] || HIMMEL.tag)}${grad(id + 'g', ['#a5dc8a', '#7fcf63', '#4fae5b', '#3f9b63', '#2f8a6a', '#2b6a78', '#27407a'])}</defs>` +
      `<rect width="400" height="${H}" fill="url(#${id}g)"/><rect width="400" height="250" fill="url(#${id}h)"/>`;
    if (nacht) s += sterne(34, 400, 170) + `<circle cx="318" cy="70" r="28" fill="#fff6c9"/><circle cx="318" cy="70" r="40" fill="#fff6c9" opacity=".25"/>`;
    else s += `<circle cx="${abend ? 200 : 318}" cy="${abend ? 150 : 70}" r="48" fill="#fff3a8" opacity=".5"/><circle cx="${abend ? 200 : 318}" cy="${abend ? 150 : 70}" r="32" fill="${abend ? '#fff0b8' : '#ffe066'}"/>` +
      wolke(20, 40, .9, 'w1', nacht ? .3 : .9) + wolke(210, 110, .6, 'w2', .7);
    // Hügel-Horizont
    s += `<path d="M0 190 Q90 130 190 178 Q300 120 400 180 L400 290 L0 290Z" fill="${abend ? '#8f7ab8' : nacht ? '#2a3a7a' : '#bfe8a0'}"/>` +
      tanne(60, 196, .5, '#3f9b63') + tanne(330, 190, .6, '#3f9b63') + laubbaum(376, 204, .5, '#58b765') +
      `<path d="M0 230 Q110 180 220 222 Q320 190 400 216 L400 300 L0 300Z" fill="#a5dc8a"/>`;
    // Zonen: Höhle, See, Lagerfeuer-Lichtung
    s += `<path d="M236 470 Q250 372 318 372 Q384 372 400 450 L400 500 L236 500Z" fill="#8b8fa8"/><path d="M262 500 Q266 426 314 426 Q360 426 366 500Z" fill="#3a2b78"/>` +
      `<path d="M300 392 l8 -18 l8 18Z M344 398 l7 -16 l7 16Z" fill="#7ad7ff"/>`;
    s += `<ellipse cx="120" cy="800" rx="128" ry="74" fill="#3fa9dc"/><ellipse cx="120" cy="794" rx="112" ry="60" fill="#6fd0f2"/>` +
      `<path class="s-welle" d="M50 780 q14 -8 28 0 M130 820 q14 -8 28 0 M160 770 q14 -8 28 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>`;
    s += `<ellipse cx="270" cy="1150" rx="120" ry="52" fill="#ffb24d" opacity=".22"/>`;
    // Weg
    const p = orte.map((o) => [o.x, o.y]);
    let d = `M200 262 Q${p[0][0]} 270 ${p[0][0]} ${p[0][1]}`;
    for (let i = 1; i < p.length; i++) { const my = (p[i - 1][1] + p[i][1]) / 2; d += ` C${p[i - 1][0]} ${my} ${p[i][0]} ${my} ${p[i][0]} ${p[i][1]}`; }
    s += `<path d="${d}" fill="none" stroke="#b98a50" stroke-width="30" stroke-linecap="round" opacity=".5"/>` +
      `<path d="${d}" fill="none" stroke="#f3dcae" stroke-width="22" stroke-linecap="round"/>` +
      `<path d="${d}" fill="none" stroke="#fff6dd" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 18"/>`;
    // Deko: Bäume, Blumen, Gras, Pilze
    const deko = [[30, 380, 'l', .9], [200, 420, 't', .7], [20, 560, 't', .9], [372, 640, 'l', .9], [200, 560, 'l', .6], [380, 780, 't', 1], [300, 760, 't', .6],
      [20, 950, 't', 1], [380, 960, 'l', .8], [210, 900, 't', .7], [30, 1120, 't', 1.2], [120, 1180, 't', .8], [384, 1090, 't', 1.1], [200, 690, 'l', .5]];
    deko.forEach(([x, y, typ, sc]) => { const tief = y / H; s += typ === 'l' ? laubbaum(x, y, sc, mix('#5fbf6a', '#2f7a5a', tief)) : tanne(x, y, sc, mix('#3f9b63', '#1f4f5a', tief)); });
    const fb = ['#ff8fc0', '#ffe066', '#fff', '#b79cf5'];
    for (let i = 0; i < 26; i++) { const x = 14 + (i * 149) % 372, y = 320 + (i * 211) % 860; s += i % 3 ? blume(x, y, fb[i % 4]) : gras(x, y, mix('#3f9b4f', '#1f5f5a', y / H)); }
    s += `<g transform="translate(206 318) scale(.22)">${pilz()}</g><g transform="translate(36 300) scale(.2)">${pilz('#ff9a3d')}</g><g transform="translate(330 560) scale(.2)">${pilz('#b79cf5')}</g>`;
    // Nalas Baumhaus oben
    s += `<g transform="translate(200 250)"><path d="M-16 20 L-12 -70 L12 -70 L16 20Z" fill="#8a5a33" ${st()}/><circle cx="-42" cy="-92" r="38" fill="#4fae5b" ${st()}/><circle cx="42" cy="-92" r="38" fill="#4fae5b" ${st()}/><circle cx="0" cy="-126" r="46" fill="#5fc16a" ${st()}/>` +
      `<circle cx="0" cy="-92" r="40" fill="#5fc16a"/><rect x="-26" y="-98" width="52" height="38" rx="4" fill="#ffe9c4" ${st()}/><path d="M-34 -96 L0 -124 L34 -96Z" fill="#e8504a" ${st()}/>` +
      `<circle cx="0" cy="-78" r="9" fill="${nacht || abend ? '#ffe066' : '#8fd3ff'}" ${st(2.5)}/><path d="M-10 -60 L-10 18 M10 -60 L10 18 M-10 -44 L10 -44 M-10 -28 L10 -28 M-10 -12 L10 -12 M-10 4 L10 4" stroke="#6b4324" stroke-width="3"/></g>`;
    if (nacht || abend) s += `<rect width="400" height="${H}" fill="${nacht ? '#0b1238' : '#3a1f5a'}" opacity="${nacht ? .42 : .2}"/>` + gluehen(26, 400, 260, H - 300, 31);
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
    stern: '<path d="' + sternPfad(50, 53, 44, 20) + '" fill="currentColor" stroke="currentColor" stroke-width="6" stroke-linejoin="round"/>',
  };
  const icon = (name, cls = '') => svg(ICON[name] || '', '0 0 100 100', 'icon ' + cls);
  const sternSVG = (voll) => svg(`<path d="${sternPfad(50, 53, 44, 20)}" fill="${voll ? '#ffd23f' : 'rgba(255,255,255,.28)'}" stroke="${voll ? '#b9770e' : 'rgba(0,0,0,.25)'}" stroke-width="6" stroke-linejoin="round"/>` + (voll ? glanz(40, 40, 7, 4) : ''), '0 0 100 100', 'art st' + (voll ? ' voll' : ''));

  return { nala, kopf, bild, avatar, roh, hat, szene, karte, KARTE_H, tageszeit, icon, sternSVG,
    pilz, kaefer, fisch, schmetterling, kristall, stein, TIERE: Object.keys(TIERE), hell, dunkel };
})();
