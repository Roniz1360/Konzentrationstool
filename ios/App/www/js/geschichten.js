/* geschichten.js – Kurzgeschichten mit Hunden und Katzen + Zeichnungen.
   Jedes Tier wird im Code als Grafik gezeichnet, genau passend zur
   Beschreibung in der Geschichte (Fell, Flecken, Ohren, Augen, Halsband …).
   Dazu kommt pro Geschichte ein passender Hintergrund (Park, Dach, See …)
   und kleine neutrale Details (Kopfneigung, Zunge, Ball …), damit die Bilder
   lebendiger sind – ohne die beschriebenen Merkmale zu verändern.
   Schweizer Rechtschreibung: immer «ss». */

const Geschichten = (() => {

  // ---------- Farben ----------
  const FELL = {
    braun: '#a8743f', hellbraun: '#e0b47c', dunkelbraun: '#6b462a', schwarz: '#3a3633',
    weiss: '#fbf9f4', grau: '#a3a9b0', orange: '#f29550', beige: '#ead3aa',
  };
  const DEKO = {
    rot: '#e0524a', blau: '#4a7fe0', gruen: '#46ad66', gelb: '#f2c230',
    rosa: '#f08fb0', lila: '#9b6fd6', gold: '#e8b730',
  };
  const AUGEN = { gruen: '#5cbf6a', blau: '#4f9cf0', gelb: '#f2c62a', braun: '#c08a3e' };
  const OUT = '#3b2c22';   // Umrisslinie (Cartoon-Stil, auch weisse Tiere gut sichtbar)

  // ---------- Farb-Helfer ----------
  function mix(a, b, f) {
    const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const A = p(a), B = p(b);
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * f).toString(16).padStart(2, '0')).join('');
  }
  const hell = (c, f = 0.35) => mix(c, '#ffffff', f);
  const dunkel = (c, f = 0.25) => mix(c, '#000000', f);
  const istDunkel = (c) => { const n = parseInt(c.slice(1), 16); return ((n >> 16) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11) < 90; };

  // Feste «Zufallszahl» aus dem Namen -> jedes Tier sieht immer gleich aus.
  const hash = (s) => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

  // ---------- SVG-Helfer ----------
  const radial = (id, c, cx, cy, r) =>
    `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${r}">` +
    `<stop offset="0" stop-color="${hell(c, 0.32)}"/><stop offset=".55" stop-color="${c}"/>` +
    `<stop offset="1" stop-color="${dunkel(c, 0.2)}"/></radialGradient>`;
  const linear = (id, stops, x2 = 0, y2 = 1) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">` +
    stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('') + '</linearGradient>';

  // Mehrere Formen zu einer Silhouette verschmelzen: zuerst alle mit dicker
  // Umrisslinie, dann alle gefüllt darüber -> nur der Aussenrand bleibt sichtbar.
  const union = (formen, fill, sw = 5.5) =>
    `<g fill="${OUT}" stroke="${OUT}" stroke-width="${sw}" stroke-linejoin="round">${formen}</g>` +
    `<g fill="${fill}">${formen}</g>`;
  const umriss = (form, fill, sw = 2.6) =>
    form.replace(/^<(\w+)/, `<$1 fill="${fill}" stroke="${OUT}" stroke-width="${sw}" stroke-linejoin="round"`);
  const strich = (d, farbe, b) =>
    `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="${b + 5.5}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${farbe}" stroke-width="${b}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const spiegel = (s) => `<g transform="matrix(-1 0 0 1 200 0)">${s}</g>`;

  // ---------- Zubehör ----------
  function halsband(d, farbe, mitMarke, mx, my) {
    return `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="12" stroke-linecap="round"/>` +
      `<path d="${d}" fill="none" stroke="${farbe}" stroke-width="7" stroke-linecap="round"/>` +
      `<path d="${d}" fill="none" stroke="${hell(farbe, 0.45)}" stroke-width="2" stroke-linecap="round" transform="translate(0 -1.6)" opacity=".8"/>` +
      (mitMarke ? `<circle cx="${mx}" cy="${my}" r="4.5" fill="#d7dde3" stroke="${OUT}" stroke-width="2"/>` +
        `<circle cx="${mx - 1.3}" cy="${my - 1.3}" r="1.3" fill="#fff"/>` : '');
  }
  function glocke(cx, cy, u) {
    return `<defs>${radial(u + '-gold', DEKO.gold, cx - 3, cy - 3, 10)}</defs>` +
      `<circle cx="${cx}" cy="${cy - 7}" r="2.6" fill="none" stroke="${OUT}" stroke-width="2"/>` +
      `<circle cx="${cx}" cy="${cy}" r="7.5" fill="url(#${u}-gold)" stroke="${OUT}" stroke-width="2.2"/>` +
      `<path d="M${cx - 5} ${cy + 1} H${cx + 5}" stroke="${OUT}" stroke-width="1.6"/>` +
      `<circle cx="${cx}" cy="${cy + 4}" r="1.6" fill="${OUT}"/>` +
      `<circle cx="${cx - 2.6}" cy="${cy - 3}" r="1.8" fill="#fff" opacity=".85"/>`;
  }
  function schleife(cx, cy, farbe) {
    const d = dunkel(farbe, 0.2);
    const schlaufe = `<path d="M${cx} ${cy} C ${cx - 6} ${cy - 15} ${cx - 23} ${cy - 13} ${cx - 20} ${cy} C ${cx - 23} ${cy + 13} ${cx - 6} ${cy + 14} ${cx} ${cy} Z"/>`;
    return `<g stroke="${OUT}" stroke-width="2.2" stroke-linejoin="round">` +
      `<path d="M${cx - 2} ${cy} L${cx - 9} ${cy + 15} L${cx - 3} ${cy + 13} Z" fill="${d}"/>` +
      `<path d="M${cx + 2} ${cy} L${cx + 9} ${cy + 15} L${cx + 3} ${cy + 13} Z" fill="${d}"/>` +
      `<g fill="${farbe}">${schlaufe}<g transform="matrix(-1 0 0 1 ${2 * cx} 0)">${schlaufe}</g></g>` +
      `<circle cx="${cx}" cy="${cy}" r="5" fill="${d}"/></g>` +
      `<path d="M${cx - 15} ${cy - 5} Q ${cx - 12} ${cy - 9} ${cx - 7} ${cy - 7}" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>` +
      `<path d="M${cx + 8} ${cy - 7} Q ${cx + 12} ${cy - 9} ${cx + 15} ${cy - 5}" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>`;
  }
  function hut(cx, basis, u) {
    const top = basis - 40;
    const kegel = `<path d="M${cx} ${top} L${cx - 18} ${basis} Q ${cx} ${basis + 6} ${cx + 18} ${basis} Z"/>`;
    return `<g transform="rotate(-10 ${cx} ${basis})">` +
      `<defs><clipPath id="${u}-hut">${kegel}</clipPath></defs>` +
      umriss(kegel, DEKO.rosa, 2.8) +
      `<g clip-path="url(#${u}-hut)" stroke-width="5" fill="none">` +
      `<path d="M${cx - 22} ${basis - 10} L${cx + 22} ${basis - 22}" stroke="${DEKO.gelb}"/>` +
      `<path d="M${cx - 22} ${basis - 26} L${cx + 22} ${basis - 38}" stroke="${DEKO.blau}"/></g>` +
      `<path d="${kegel.match(/d="([^"]+)"/)[1]}" fill="none" stroke="${OUT}" stroke-width="2.8" stroke-linejoin="round"/>` +
      `<circle cx="${cx}" cy="${top}" r="6.5" fill="${DEKO.gelb}" stroke="${OUT}" stroke-width="2.2"/>` +
      `<circle cx="${cx - 2}" cy="${top - 2}" r="2" fill="#fff" opacity=".8"/>` +
      `<path d="M${cx - 6} ${basis - 30} L${cx - 11} ${basis - 12}" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".55"/></g>`;
  }
  function brille(y) {
    return `<g fill="#ffffff" fill-opacity=".28" stroke="#33303f" stroke-width="3.2">` +
      `<circle cx="84" cy="${y}" r="12.5"/><circle cx="116" cy="${y}" r="12.5"/></g>` +
      `<path d="M96 ${y - 1} Q 100 ${y - 5} 104 ${y - 1} M71.5 ${y - 2} L62 ${y - 6} M128.5 ${y - 2} L138 ${y - 6}" fill="none" stroke="#33303f" stroke-width="3" stroke-linecap="round"/>` +
      `<path d="M77 ${y - 6} Q 80 ${y - 9} 84 ${y - 9} M109 ${y - 6} Q 112 ${y - 9} 116 ${y - 9}" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".9"/>`;
  }
  function halstuch(farbe) {
    const d = 'M74 116 Q 100 132 126 116 L 104 154 Q 100 159 96 154 Z';
    return `<path d="${d}" fill="${farbe}" stroke="${OUT}" stroke-width="2.6" stroke-linejoin="round"/>` +
      `<g fill="#fff" opacity=".85"><circle cx="88" cy="126" r="2.4"/><circle cx="100" cy="132" r="2.4"/><circle cx="112" cy="126" r="2.4"/>` +
      `<circle cx="94" cy="140" r="2.2"/><circle cx="106" cy="140" r="2.2"/><circle cx="100" cy="149" r="2"/></g>` +
      `<path d="M78 118 Q 100 131 122 118" fill="none" stroke="${dunkel(farbe, 0.2)}" stroke-width="2"/>`;
  }

  // Flecken (in der Silhouette abgeschnitten)
  const FLECK_KOERPER = [[76, 146, 11, 9, -20], [121, 164, 13, 10, 15], [125, 134, 8, 7, 0], [82, 175, 8, 6, 10], [106, 120, 6, 5, 0], [66, 166, 6, 5, 0]];
  const FLECK_KOPF = [[121, 62, 11, 10, 20], [76, 60, 7, 6, -10], [104, 46, 5, 4, 0]];
  const flecken = (liste, farbe) =>
    liste.map(([x, y, rx, ry, r]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${r} ${x} ${y})" fill="${farbe}"/>`).join('');

  // Augen
  function hundeAuge(x, y, iris) {
    return `<ellipse cx="${x}" cy="${y}" rx="8.6" ry="9.6" fill="#fff" stroke="${OUT}" stroke-width="2.2"/>` +
      `<ellipse cx="${x + 0.6}" cy="${y + 1.2}" rx="6.4" ry="7.4" fill="${iris}"/>` +
      `<circle cx="${x + 0.8}" cy="${y + 1.6}" r="4" fill="#1e1612"/>` +
      `<circle cx="${x - 1.8}" cy="${y - 2}" r="2.6" fill="#fff"/><circle cx="${x + 3}" cy="${y + 4}" r="1.2" fill="#fff"/>`;
  }
  function katzenAuge(x, y, iris, u) {
    return `<defs><radialGradient id="${u}" cx=".5" cy=".62" r=".6"><stop offset="0" stop-color="${hell(iris, 0.5)}"/>` +
      `<stop offset=".6" stop-color="${iris}"/><stop offset="1" stop-color="${dunkel(iris, 0.3)}"/></radialGradient></defs>` +
      `<ellipse cx="${x}" cy="${y}" rx="9" ry="9.6" fill="url(#${u})" stroke="${OUT}" stroke-width="2.4"/>` +
      `<ellipse cx="${x}" cy="${y + 0.5}" rx="2.6" ry="7" fill="#1e1612"/>` +
      `<circle cx="${x - 3}" cy="${y - 3.4}" r="2.5" fill="#fff"/><circle cx="${x + 3}" cy="${y + 4}" r="1.1" fill="#fff"/>`;
  }

  // Kleine Gegenstände vorne links (neutral, gehören zu keiner Beschreibung)
  function spielzeug(art, h) {
    if (h % 3 === 0) return '';
    if (art === 'katze') {
      return `<g transform="translate(24 180)"><path d="M8 4 Q 20 10 26 4" fill="none" stroke="#5f8fb8" stroke-width="1.6"/>` +
        `<circle r="9" fill="#8bbbe0" stroke="${OUT}" stroke-width="2.2"/>` +
        `<path d="M-7 -4 Q 0 2 7 -5 M-8 2 Q 0 7 8 1 M-4 -8 Q 2 0 -2 8" fill="none" stroke="#5f8fb8" stroke-width="1.5"/>` +
        `<circle cx="-3" cy="-4" r="2" fill="#fff" opacity=".7"/></g>`;
    }
    if (h % 2) {
      return `<g transform="translate(24 180)"><circle r="9" fill="#ef6f5e" stroke="${OUT}" stroke-width="2.2"/>` +
        `<path d="M-8.4 -3 Q 0 3 8.4 -3 L 8.6 2 Q 0 8 -8.6 2 Z" fill="#fff"/>` +
        `<circle r="9" fill="none" stroke="${OUT}" stroke-width="2.2"/><circle cx="-3" cy="-4" r="2.2" fill="#fff" opacity=".8"/></g>`;
    }
    return `<g transform="translate(24 182) rotate(-15)">` +
      `<path d="M-9 -3 H9 A4 4 0 1 1 11 -7 A4 4 0 1 1 13 0 A4 4 0 1 1 11 7 A4 4 0 1 1 9 3 H-9 A4 4 0 1 1 -11 7 A4 4 0 1 1 -13 0 A4 4 0 1 1 -11 -7 A4 4 0 1 1 -9 -3 Z" fill="#fbf3e2" stroke="${OUT}" stroke-width="2" stroke-linejoin="round"/></g>`;
  }

  // ---------- Hund ----------
  function hund(t, u) {
    const c = FELL[t.fell] || FELL.braun;
    const h = hash(t.name);
    const neigung = [-6, -3, 0, 3, 6][h % 5];
    const zunge = h % 2 === 0;
    const brauen = (h >> 3) % 2 === 0;
    const fl = t.flecken ? FELL[t.flecken] : null;
    const pfote = t.pfotenWeiss ? '#ffffff' : hell(c, 0.18);

    const koerper = '<path d="M74 106 C 54 132 50 168 62 184 L 138 184 C 150 168 146 132 126 106 Z"/>' +
      '<ellipse cx="66" cy="170" rx="17" ry="15"/><ellipse cx="134" cy="170" rx="17" ry="15"/>';
    const kopf = '<circle cx="100" cy="78" r="36"/><ellipse cx="80" cy="96" rx="19" ry="13"/><ellipse cx="120" cy="96" rx="19" ry="13"/>';

    let s = `<defs>${radial(u + '-kb', c, 84, 126, 80)}${radial(u + '-kk', c, 86, 58, 60)}` +
      linear(u + '-bein', [[0, hell(c, 0.16)], [0.55, c], [1, dunkel(c, 0.14)]], 1, 0) +
      linear(u + '-ohr', [[0, dunkel(fl || c, 0.04)], [1, dunkel(fl || c, 0.26)]]) +
      `<clipPath id="${u}-ck">${koerper}</clipPath><clipPath id="${u}-cp">${kopf}</clipPath></defs>`;

    // Schwanz (hinter dem Körper)
    const schwanz = {
      kurz: 'M136 170 C 148 166 153 158 151 148',
      geringelt: 'M134 168 C 172 168 178 126 154 122 C 134 120 134 148 152 147',
    }[t.schwanz] || 'M136 170 C 158 164 166 142 160 116';
    s += strich(schwanz, c, 10);
    s += `<path d="${schwanz}" fill="none" stroke="${hell(c, 0.3)}" stroke-width="3" stroke-linecap="round" transform="translate(-1.5 -1.5)" opacity=".6"/>`;

    // Körper
    s += union(koerper, `url(#${u}-kb)`);
    s += `<g clip-path="url(#${u}-ck)"><ellipse cx="100" cy="140" rx="21" ry="26" fill="${hell(c, 0.42)}" opacity=".9"/>` +
      (fl ? flecken(FLECK_KOERPER, fl) : '') + '</g>';
    // Hinterpfoten
    s += umriss(`<ellipse cx="54" cy="185" rx="14" ry="6.5"/>`, pfote) + umriss(`<ellipse cx="146" cy="185" rx="14" ry="6.5"/>`, pfote);
    // Vorderbeine + Pfoten mit Zehen
    [82, 101].forEach((x, i) => {
      s += umriss(`<rect x="${x}" y="134" width="17" height="52" rx="8"/>`, `url(#${u}-bein)`);
      if (t.pfotenWeiss) s += `<rect x="${x + 1.4}" y="166" width="14.2" height="18" rx="6" fill="#fff"/>`;
      if (fl && i === 1) s += `<ellipse cx="${x + 9}" cy="158" rx="5" ry="7" fill="${fl}"/>`;
      const px = x + 8.5;
      s += umriss(`<ellipse cx="${px}" cy="186" rx="11.5" ry="7"/>`, pfote, 2.4) +
        `<path d="M${px - 3.5} 182.5 V187 M${px + 3.5} 182.5 V187" stroke="${OUT}" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`;
    });
    if (t.halstuch) s += halstuch(DEKO[t.halstuch]);

    // Kopf (leicht geneigt)
    let k = '';
    if (t.ohren === 'spitz') {
      // Hundeohr: breiter mit runder Spitze (Katzenohren sind schmal und spitz)
      const ohr = '<path d="M72 66 C 60 52 54 30 60 18 C 64 11 73 12 80 20 C 88 29 94 37 99 46 Z"/>';
      const innen = `<path d="M74 54 C 66 44 63 31 66 24 C 72 25 80 34 88 44 Z" fill="${mix(c, '#f2a0a8', istDunkel(c) ? 0.35 : 0.55)}"/>`;
      k += umriss(ohr, `url(#${u}-kk)`, 5) + innen + spiegel(umriss(ohr, `url(#${u}-kk)`, 5) + innen);
    }
    k += union(kopf, `url(#${u}-kk)`);
    k += `<g clip-path="url(#${u}-cp)">` +
      (fl ? flecken(FLECK_KOPF, fl) : '') +
      (t.augenfleck ? `<ellipse cx="84" cy="77" rx="15" ry="14" transform="rotate(-12 84 77)" fill="${['weiss', 'grau'].includes(t.fell) ? FELL.schwarz : FELL.dunkelbraun}"/>` : '') +
      `<ellipse cx="100" cy="101" rx="23" ry="16" fill="${hell(c, 0.5)}"/>` +
      `<path d="M100 104 V 112" stroke="${dunkel(c, 0.25)}" stroke-width="1.4" opacity=".4"/></g>`;
    // Glanzlicht auf der Stirn
    k += `<ellipse cx="86" cy="56" rx="12" ry="6" transform="rotate(-20 86 56)" fill="#fff" opacity=".18"/>`;
    // Bäckchen
    k += `<ellipse cx="72" cy="98" rx="6.5" ry="3.8" fill="#f28b8b" opacity=".45"/><ellipse cx="128" cy="98" rx="6.5" ry="3.8" fill="#f28b8b" opacity=".45"/>`;
    if (brauen) {
      const b = istDunkel(c) ? hell(c, 0.45) : dunkel(c, 0.4);
      k += `<path d="M76 64 Q 83 59 91 63 M109 63 Q 117 59 124 64" fill="none" stroke="${b}" stroke-width="3" stroke-linecap="round"/>`;
    }
    k += hundeAuge(84, 78, AUGEN[t.augen] || '#7a4f2a') + hundeAuge(116, 78, AUGEN[t.augen] || '#7a4f2a');
    // Nase + Maul
    k += `<path d="M90 90 Q 100 84 110 90 Q 107 100 100 101 Q 93 100 90 90 Z" fill="#2a1f1b" stroke="${OUT}" stroke-width="1.5"/>` +
      `<ellipse cx="96" cy="89.5" rx="4" ry="2" fill="#fff" opacity=".55"/>`;
    if (zunge) k += `<path d="M94 108 Q 93 121 100 121 Q 107 121 106 108 Z" fill="#f27a8c" stroke="${OUT}" stroke-width="2"/><path d="M100 110 V 117" stroke="#d65a6e" stroke-width="1.5"/>`;
    k += `<path d="M100 101 V 106 M100 106 Q 93 113 86 107 M100 106 Q 107 113 114 107" fill="none" stroke="${OUT}" stroke-width="2.4" stroke-linecap="round"/>`;
    if (t.ohren !== 'spitz') {
      const ohr = '<path d="M72 48 C 53 44 40 70 45 96 C 47 111 60 115 67 104 C 73 92 77 68 72 48 Z"/>';
      const glanz = '<path d="M60 58 C 52 68 50 84 52 96" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".25"/>';
      k += umriss(ohr, `url(#${u}-ohr)`, 2.8) + glanz;
      const ohrR = umriss(ohr, `url(#${u}-ohr)`, 2.8) + glanz;
      // Bei Flecken-Hunden: nur ein Ohr in Fleckenfarbe (sieht natürlicher aus)
      k += fl ? spiegel(ohrR.replace(`url(#${u}-ohr)`, `url(#${u}-ohr2)`)) : spiegel(ohrR);
      if (fl) s = s.replace('</defs>', linear(u + '-ohr2', [[0, dunkel(c, 0.04)], [1, dunkel(c, 0.2)]]) + '</defs>');
    }
    if (t.schleife) k += schleife(126, 46, DEKO[t.schleife]);
    if (t.hut) k += hut(100, 46, u);
    if (t.brille) k += brille(78);
    s += `<g transform="rotate(${neigung} 100 112)">${k}</g>`;

    if (t.halsband) s += halsband('M70 116 Q 100 134 130 116', DEKO[t.halsband], !t.glocke, 100, 130);
    if (t.glocke) s += glocke(100, 132, u);
    return s;
  }

  // ---------- Katze ----------
  function katze(t, u) {
    const c = FELL[t.fell] || FELL.grau;
    const h = hash(t.name);
    const neigung = [-6, -3, 0, 3, 6][h % 5];
    const fl = t.flecken ? FELL[t.flecken] : null;
    const streifenFarbe = dunkel(c, 0.32);
    const pfote = t.pfotenWeiss ? '#ffffff' : hell(c, 0.15);
    const iris = AUGEN[t.augen] || '#d39a3c';

    const koerper = '<path d="M78 104 C 58 130 54 168 64 186 L 136 186 C 146 168 142 130 122 104 Z"/>' +
      '<ellipse cx="70" cy="172" rx="16" ry="14"/><ellipse cx="130" cy="172" rx="16" ry="14"/>';
    const kopf = '<circle cx="100" cy="84" r="35"/><ellipse cx="78" cy="101" rx="18" ry="12"/><ellipse cx="122" cy="101" rx="18" ry="12"/>' +
      '<polygon points="64,92 50,99 63,106"/><polygon points="136,92 150,99 137,106"/>';

    let s = `<defs>${radial(u + '-kb', c, 84, 126, 80)}${radial(u + '-kk', c, 86, 64, 58)}` +
      linear(u + '-bein', [[0, hell(c, 0.16)], [0.55, c], [1, dunkel(c, 0.14)]], 1, 0) +
      `<clipPath id="${u}-ck">${koerper}</clipPath><clipPath id="${u}-cp">${kopf}</clipPath></defs>`;

    // Schwanz
    const schwanz = {
      kurz: 'M134 182 C 152 182 160 172 158 160',
      geringelt: 'M134 182 C 172 186 176 148 154 146 C 140 146 142 166 156 162',
    }[t.schwanz] || 'M134 182 C 172 188 188 150 172 120 C 166 108 152 110 157 123';
    s += strich(schwanz, c, 11);
    if (t.streifen) s += `<path d="${schwanz}" fill="none" stroke="${streifenFarbe}" stroke-width="11" stroke-dasharray="5 9"/>`;
    s += `<path d="${schwanz}" fill="none" stroke="${hell(c, 0.3)}" stroke-width="3" stroke-linecap="round" transform="translate(-1.5 -1.5)" opacity=".5"/>`;

    // Körper
    s += union(koerper, `url(#${u}-kb)`);
    s += `<g clip-path="url(#${u}-ck)">`;
    if (t.bauchWeiss) s += `<ellipse cx="100" cy="148" rx="31" ry="38" fill="#fff"/><ellipse cx="100" cy="150" rx="31" ry="38" fill="none" stroke="#e8e2da" stroke-width="3"/>`;
    else s += `<path d="M86 108 Q 100 156 114 108 Z" fill="${hell(c, 0.4)}" opacity=".9"/>`;
    if (t.streifen) {
      s += [128, 146, 164].map((y) => `<path d="M54 ${y} Q 68 ${y + 7} 80 ${y - 2}" fill="none" stroke="${streifenFarbe}" stroke-width="5" stroke-linecap="round"/>` +
        `<path d="M146 ${y} Q 132 ${y + 7} 120 ${y - 2}" fill="none" stroke="${streifenFarbe}" stroke-width="5" stroke-linecap="round"/>`).join('');
    }
    if (fl) s += flecken(FLECK_KOERPER, fl);
    s += '</g>';
    // Hinterpfoten
    s += umriss(`<ellipse cx="60" cy="187" rx="13" ry="5.5"/>`, pfote) + umriss(`<ellipse cx="140" cy="187" rx="13" ry="5.5"/>`, pfote);
    // Vorderbeine
    [84, 101].forEach((x, i) => {
      s += umriss(`<rect x="${x}" y="136" width="15" height="50" rx="7"/>`, t.bauchWeiss ? '#fff' : `url(#${u}-bein)`);
      if (t.streifen) s += [150, 160].map((y) => `<path d="M${x + 2} ${y} H${x + 13}" stroke="${streifenFarbe}" stroke-width="3.5" stroke-linecap="round"/>`).join('');
      if (t.pfotenWeiss) s += `<rect x="${x + 1.4}" y="166" width="12.2" height="18" rx="5" fill="#fff"/>`;
      if (fl && i === 0) s += `<ellipse cx="${x + 7.5}" cy="156" rx="4.5" ry="6" fill="${fl}"/>`;
      const px = x + 7.5;
      s += umriss(`<ellipse cx="${px}" cy="187" rx="10.5" ry="6"/>`, t.bauchWeiss ? '#fff' : pfote, 2.4) +
        `<path d="M${px - 3} 184 V188 M${px + 3} 184 V188" stroke="${OUT}" stroke-width="1.5" stroke-linecap="round" opacity=".7"/>`;
    });

    // Kopf
    let k = '';
    const ohr = '<path d="M71 72 L65 32 Q 66 25 73 28 L 97 52 Z"/>';
    const innen = `<path d="M75 62 L71 39 L 89 54 Z" fill="${mix('#f4a3b4', c, 0.15)}"/>` +
      `<path d="M74 50 L80 54 M73 44 L79 50" stroke="${istDunkel(c) ? '#bbb' : '#fff'}" stroke-width="1.5" stroke-linecap="round"/>`;
    k += umriss(ohr, `url(#${u}-kk)`, 5) + innen + spiegel(umriss(ohr, `url(#${u}-kk)`, 5) + innen);
    k += union(kopf, `url(#${u}-kk)`);
    k += `<g clip-path="url(#${u}-cp)">`;
    if (fl) k += flecken(FLECK_KOPF, fl);
    if (t.streifen) {
      k += `<path d="M92 52 L94 64 M100 50 V63 M108 52 L106 64" stroke="${streifenFarbe}" stroke-width="4" stroke-linecap="round"/>` +
        `<path d="M62 92 H72 M60 100 H70 M138 92 H128 M140 100 H130" stroke="${streifenFarbe}" stroke-width="3.5" stroke-linecap="round"/>`;
    }
    if (t.maske) k += `<path d="M58 77 Q 100 63 142 77 L 142 96 Q 100 84 58 96 Z" fill="#2f2a28"/>`;
    k += `<ellipse cx="100" cy="106" rx="20" ry="12" fill="${t.bauchWeiss ? '#fff' : hell(c, 0.45)}"/></g>`;
    if (t.maske) {
      k += `<path d="M136 82 L153 75 L150 89 Z M136 88 L152 94 L145 101 Z" fill="#2f2a28" stroke="${OUT}" stroke-width="2" stroke-linejoin="round"/>`;
    }
    k += `<ellipse cx="86" cy="62" rx="11" ry="5.5" transform="rotate(-20 86 62)" fill="#fff" opacity=".18"/>`;
    k += `<ellipse cx="72" cy="104" rx="6" ry="3.5" fill="#f28b8b" opacity=".45"/><ellipse cx="128" cy="104" rx="6" ry="3.5" fill="#f28b8b" opacity=".45"/>`;
    k += katzenAuge(86, 86, iris, u + '-a1') + katzenAuge(114, 86, iris, u + '-a2');
    // Schnauze
    k += `<path d="M95 99 Q 100 96.5 105 99 L 100 105 Z" fill="#f0899c" stroke="${OUT}" stroke-width="1.8" stroke-linejoin="round"/>` +
      `<path d="M100 105 Q 95 112 89 107 M100 105 Q 105 112 111 107" fill="none" stroke="${OUT}" stroke-width="2.2" stroke-linecap="round"/>`;
    const bart = istDunkel(c) || t.maske ? '#f4f0ea' : OUT;
    k += `<g stroke="${bart}" stroke-width="1.5" stroke-linecap="round" opacity=".8">` +
      `<path d="M84 104 L58 99 M84 108 L58 110 M116 104 L142 99 M116 108 L142 110"/></g>`;
    if ((h >> 2) % 3 === 0) k += `<path d="M78 70 Q 86 66 93 69" fill="none" stroke="${istDunkel(c) ? hell(c, 0.45) : dunkel(c, 0.35)}" stroke-width="2.4" stroke-linecap="round"/>`;
    if (t.schleife) k += schleife(126, 54, DEKO[t.schleife]);
    if (t.hut) k += hut(100, 52, u);
    if (t.brille) k += brille(86);
    s += `<g transform="rotate(${neigung} 100 116)">${k}</g>`;

    if (t.halsband) s += halsband('M72 120 Q 100 138 128 120', DEKO[t.halsband], false);
    if (t.glocke) s += glocke(100, 137, u);
    return s;
  }

  // ---------- Hintergründe (passend zur Geschichte) ----------
  const wolke = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity=".92"><circle cx="-12" cy="2" r="8"/><circle cx="0" cy="-3" r="11"/><circle cx="13" cy="2" r="8"/><rect x="-20" y="2" width="41" height="8" rx="4"/></g>`;
  const blume = (x, y, c) =>
    `<g transform="translate(${x} ${y})" fill="${c}">${[0, 72, 144, 216, 288].map((w) => `<circle cx="${(3.2 * Math.cos(w * Math.PI / 180)).toFixed(1)}" cy="${(3.2 * Math.sin(w * Math.PI / 180)).toFixed(1)}" r="2.6"/>`).join('')}<circle r="2" fill="#f7c948"/></g>`;
  const halm = (x, y, c) => `<path d="M${x} ${y} l2 -8 l2 8 l2 -6 l2 6" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  const himmel = (u, a, b) => `<defs>${linear(u + '-h', [[0, a], [1, b]])}</defs><rect width="200" height="200" fill="url(#${u}-h)"/>`;

  const SZENEN = {
    park: (u) => himmel(u, '#c9e6f8', '#eff8fd') +
      `<circle cx="166" cy="34" r="24" fill="#fff3c4" opacity=".7"/><circle cx="166" cy="34" r="14" fill="#ffd96b"/>` +
      wolke(48, 34) + wolke(120, 22, 0.7) +
      `<ellipse cx="150" cy="148" rx="120" ry="40" fill="#c8e6b0"/>` +
      `<rect x="17" y="94" width="10" height="52" rx="3" fill="#9a6b45"/>` +
      `<circle cx="22" cy="84" r="21" fill="#88c271"/><circle cx="9" cy="100" r="14" fill="#7ab563"/><circle cx="36" cy="98" r="15" fill="#7ab563"/>` +
      `<circle cx="16" cy="78" r="6" fill="#a2d48b" opacity=".8"/>` +
      `<defs>${linear(u + '-g', [[0, '#b8e09b'], [1, '#90c878']])}</defs>` +
      `<path d="M0 142 Q 100 128 200 142 V200 H0 Z" fill="url(#${u}-g)"/>` +
      halm(14, 166, '#6fae5a') + halm(178, 192, '#6fae5a') + halm(160, 152, '#6fae5a') +
      blume(176, 162, '#f59fb5') + blume(190, 176, '#fff') + blume(12, 152, '#fff') + blume(186, 148, '#ffd45c'),

    dach: (u) => himmel(u, '#ffd6ad', '#fff4e6') +
      `<circle cx="42" cy="40" r="26" fill="#ffe9b0" opacity=".7"/><circle cx="42" cy="40" r="16" fill="#ffc45a"/>` +
      wolke(150, 32) + wolke(96, 18, 0.6) +
      `<path d="M0 122 L28 98 L56 122 Z M66 124 L92 104 L118 124 Z" fill="#f2c9ab"/><rect x="0" y="120" width="200" height="16" fill="#f2c9ab"/>` +
      `<rect x="154" y="88" width="22" height="48" fill="#cc735b" stroke="#a9563f" stroke-width="2"/>` +
      `<rect x="150" y="84" width="30" height="8" rx="2" fill="#a9563f"/>` +
      `<path d="M154 102 H176 M154 116 H176 M165 92 V102 M160 102 V116 M171 102 V116 M165 116 V130" stroke="#a9563f" stroke-width="1.5"/>` +
      `<circle cx="168" cy="74" r="5" fill="#fff" opacity=".7"/><circle cx="174" cy="62" r="7" fill="#fff" opacity=".55"/>` +
      `<rect x="0" y="132" width="200" height="68" fill="#d4735a"/><rect x="0" y="130" width="200" height="7" rx="3" fill="#b5573f"/>` +
      [146, 162, 178, 194].map((y, i) => `<path d="M${i % 2 ? -10 : 0} ${y}${' a10 10 0 0 0 20 0'.repeat(11)}" fill="none" stroke="#b5573f" stroke-width="2"/>`).join(''),

    zuhause: (u) =>
      `<defs><pattern id="${u}-tap" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#f8eedb"/>` +
      `<circle cx="5" cy="5" r="2" fill="#eedcbc"/><path d="M16 12 l2.5 3.5 l-2.5 3.5 l-2.5 -3.5 z" fill="#f1cdbd"/></pattern></defs>` +
      `<rect width="200" height="200" fill="url(#${u}-tap)"/>` +
      `<rect x="20" y="30" width="46" height="36" rx="3" fill="#bfe3f3" stroke="#b98a5e" stroke-width="5"/>` +
      `<path d="M23 63 L36 46 L46 56 L52 50 L63 63 Z" fill="#8cc47a"/><circle cx="54" cy="40" r="4" fill="#ffd45c"/>` +
      `<rect x="148" y="78" width="40" height="5" rx="2" fill="#b98a5e"/>` +
      `<path d="M160 78 L158 64 H174 L172 78 Z" fill="#e7896b"/><path d="M166 64 C 160 52 156 50 152 52 M166 64 C 170 50 176 48 180 50 M166 64 V48" stroke="#5f9e55" stroke-width="3" fill="none" stroke-linecap="round"/>` +
      `<rect x="0" y="140" width="200" height="8" fill="#ead7b6"/>` +
      `<rect x="0" y="148" width="200" height="52" fill="#d9ae7e"/>` +
      `<path d="M0 162 H200 M0 177 H200 M0 192 H200 M40 148 V162 M120 148 V162 M80 162 V177 M170 162 V177 M30 177 V192 M140 177 V192" stroke="#c4966a" stroke-width="1.5"/>` +
      `<ellipse cx="100" cy="187" rx="88" ry="13" fill="#e8a29b"/><ellipse cx="100" cy="187" rx="76" ry="9" fill="none" stroke="#f7d9d2" stroke-width="2" stroke-dasharray="5 4"/>`,

    party: (u) => {
      let s = himmel(u, '#fde0ec', '#fff4f8');
      const farben = ['#f28fb0', '#ffd166', '#7fc8f8', '#8fd694', '#c9a3f0'];
      s += `<path d="M-5 16 Q 100 52 205 16" fill="none" stroke="#c98aa0" stroke-width="1.6"/>`;
      for (let i = 0; i < 9; i++) {
        const t = (i + 0.5) / 9, x = (1 - t) ** 2 * -5 + 2 * (1 - t) * t * 100 + t * t * 205, y = (1 - t) ** 2 * 16 + 2 * (1 - t) * t * 52 + t * t * 16;
        s += `<path d="M${(x - 7).toFixed(1)} ${(y - 1).toFixed(1)} L${(x + 7).toFixed(1)} ${(y - 1).toFixed(1)} L${x.toFixed(1)} ${(y + 13).toFixed(1)} Z" fill="${farben[i % 5]}"/>`;
      }
      [[30, 60, 20], [168, 64, -30], [52, 108, 45], [150, 110, 10], [16, 128, -20], [186, 128, 30], [70, 74, 0], [132, 80, 60]].forEach(([x, y, r], i) => {
        s += `<rect x="${x}" y="${y}" width="6" height="3" rx="1" transform="rotate(${r} ${x} ${y})" fill="${farben[i % 5]}"/>`;
      });
      s += `<path d="M24 87 Q 20 110 26 140" fill="none" stroke="#b9a3b0" stroke-width="1.2"/><ellipse cx="24" cy="74" rx="12" ry="14" fill="#8fc3f0"/><ellipse cx="20" cy="69" rx="3" ry="5" fill="#fff" opacity=".6"/>` +
        `<path d="M176 92 Q 180 114 174 140" fill="none" stroke="#b9a3b0" stroke-width="1.2"/><ellipse cx="176" cy="80" rx="11" ry="13" fill="#ffd166"/><ellipse cx="172" cy="75" rx="3" ry="4.5" fill="#fff" opacity=".6"/>` +
        `<rect x="0" y="146" width="200" height="54" fill="#f6d3b5"/><rect x="0" y="144" width="200" height="4" fill="#ecbf9e"/>` +
        `<rect x="174" y="170" width="20" height="18" rx="2" fill="#7fc8f8" stroke="#5aa6d6" stroke-width="1.5"/><rect x="182" y="170" width="4" height="18" fill="#f28fb0"/>` +
        `<path d="M184 170 C 176 162 178 160 184 168 C 190 160 192 162 184 170" fill="#f28fb0"/>`;
      return s;
    },

    tierheim: (u) => himmel(u, '#dbe8f5', '#eef4fa') +
      `<rect x="128" y="28" width="54" height="46" rx="4" fill="#c4e6f8" stroke="#fff" stroke-width="5"/>` +
      `<path d="M155 28 V74 M128 51 H182" stroke="#fff" stroke-width="4"/>` + wolke(145, 44, 0.45) +
      `<rect x="124" y="74" width="62" height="5" rx="2" fill="#c9d6e4"/>` +
      `<rect x="20" y="32" width="38" height="34" rx="4" fill="#fff" stroke="#c9d6e4" stroke-width="3"/>` +
      `<path d="M39 58 C 26 49 28 40 34 40 C 37 40 39 43 39 45 C 39 43 41 40 44 40 C 50 40 52 49 39 58 Z" fill="#f5a3b5"/>` +
      `<rect x="0" y="140" width="200" height="8" fill="#c3d1e0"/><rect x="0" y="148" width="200" height="52" fill="#d3deea"/>` +
      `<ellipse cx="100" cy="188" rx="80" ry="13" fill="#f0b39f" stroke="#d99682" stroke-width="2"/><ellipse cx="100" cy="186" rx="64" ry="8" fill="#f7cdbd"/>` +
      `<path d="M172 182 H194 L190 192 H176 Z" fill="#e8685a" stroke="#c4503f" stroke-width="1.5"/><circle cx="178" cy="181" r="2" fill="#a0703f"/><circle cx="183" cy="180" r="2" fill="#a0703f"/><circle cx="188" cy="181" r="2" fill="#a0703f"/>`,

    wald: (u) => {
      let s = himmel(u, '#d9efdc', '#f2faf3');
      [[12, 120, 34], [40, 126, 28], [150, 122, 30], [186, 118, 36]].forEach(([x, y, hh]) => {
        s += `<path d="M${x} ${y - hh * 2} L${x - hh * 0.6} ${y} H${x + hh * 0.6} Z" fill="#b2d6ae"/>`;
      });
      s += `<rect x="168" y="66" width="12" height="80" rx="3" fill="#8b6142"/>` +
        `<circle cx="174" cy="60" r="22" fill="#7db36d"/><circle cx="158" cy="76" r="14" fill="#6fa862"/><circle cx="190" cy="76" r="14" fill="#6fa862"/>` +
        `<rect x="18" y="80" width="9" height="64" rx="3" fill="#8b6142"/><circle cx="22" cy="74" r="17" fill="#86bb75"/>` +
        `<defs>${linear(u + '-g', [[0, '#bcd99d'], [1, '#9fc483']])}</defs>` +
        `<path d="M0 144 Q 100 132 200 144 V200 H0 Z" fill="url(#${u}-g)"/>` +
        `<rect x="181" y="176" width="7" height="12" rx="2" fill="#fbf3e2" stroke="#d9ccb4"/>` +
        `<path d="M174 178 Q 184 162 196 178 Z" fill="#e5594b"/><circle cx="181" cy="172" r="1.8" fill="#fff"/><circle cx="188" cy="170" r="1.6" fill="#fff"/><circle cx="191" cy="175" r="1.4" fill="#fff"/>`;
      [[150, 160, 30, '#f0a04b'], [60, 196, -20, '#e6c14a'], [176, 196, 50, '#e07a4a'], [12, 160, 10, '#e6c14a']].forEach(([x, y, r, c]) => {
        s += `<ellipse cx="${x}" cy="${y}" rx="5" ry="2.6" transform="rotate(${r} ${x} ${y})" fill="${c}"/>`;
      });
      return s + halm(42, 160, '#7aa85f') + halm(160, 184, '#7aa85f');
    },

    see: (u) => himmel(u, '#cfe9fa', '#f0f8fd') +
      `<circle cx="38" cy="30" r="13" fill="#ffd96b"/><circle cx="38" cy="30" r="22" fill="#fff3c4" opacity=".5"/>` + wolke(140, 30, 0.8) +
      `<ellipse cx="40" cy="122" rx="74" ry="24" fill="#bfe0b0"/><ellipse cx="172" cy="124" rx="60" ry="18" fill="#cbe6bb"/>` +
      `<defs>${linear(u + '-w', [[0, '#a6dbf0'], [1, '#7cc2e2']])}<pattern id="${u}-k" width="16" height="16" patternUnits="userSpaceOnUse">` +
      `<rect width="16" height="16" fill="#fff"/><rect width="8" height="8" fill="#ef7f7a"/><rect x="8" y="8" width="8" height="8" fill="#ef7f7a"/></pattern></defs>` +
      `<rect x="0" y="118" width="200" height="34" fill="url(#${u}-w)"/>` +
      `<path d="M14 128 h14 M60 136 h18 M120 126 h12 M150 140 h16 M30 144 h10" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".75"/>` +
      `<g transform="translate(160 126)"><ellipse cx="0" cy="3" rx="9" ry="5" fill="#ffd45c"/><circle cx="7" cy="-3" r="4.5" fill="#ffd45c"/><path d="M11 -3 l4 1 l-4 1.5 z" fill="#f08a3c"/><circle cx="8" cy="-4" r="0.9" fill="#333"/></g>` +
      `<path d="M0 150 Q 100 140 200 150 V200 H0 Z" fill="#b4dc95"/>` +
      `<path d="M30 170 H170 L192 199 H8 Z" fill="url(#${u}-k)" opacity=".9"/>` +
      `<path d="M188 168 V136 M193 168 V142 M183 168 V144" stroke="#6a9a4f" stroke-width="2"/>` +
      `<rect x="186" y="130" width="4" height="12" rx="2" fill="#8b5a35"/><rect x="191" y="137" width="4" height="10" rx="2" fill="#8b5a35"/>`,
  };

  // ---------- Bild für ein Tier ----------
  let zaehler = 0;
  function tierSVG(t, szene) {
    const u = 'tg' + (++zaehler);
    const s = { gross: 1, klein: 0.74 }[t.groesse] || 0.88;
    const bg = (SZENEN[szene] || ((id) => himmel(id, '#fbf3e6', '#f6ead6') + `<ellipse cx="100" cy="190" rx="90" ry="14" fill="#eadbc2"/>`))(u + 'b');
    const tier = t.art === 'katze' ? katze(t, u) : hund(t, u);
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${t.art === 'katze' ? 'Katze' : 'Hund'}">` +
      bg +
      `<ellipse cx="100" cy="190" rx="${66 * s}" ry="7" fill="#2b2118" opacity=".16"/>` +
      `<g transform="translate(100 192) scale(${s}) translate(-100 -192)">${tier}</g>` +
      spielzeug(t.art, hash(t.name)) +
      '</svg>';
  }

  // ---------- Die Geschichten (leicht -> schwer) ----------
  const liste = [
    {
      titel: 'Im Park', szene: 'park',
      text: 'Heute gehen drei Hunde in den Park. Bello ist gross und braun. Er hat lange Ohren, die herunterhängen. ' +
            'Fipsi ist klein und weiss. Sie hat schwarze Flecken. Rocky ist ganz schwarz. Er trägt ein rotes Halsband ' +
            'und hat spitze Ohren. Zusammen spielen sie mit einem Ball.',
      tiere: [
        { name: 'Bello', art: 'hund', fell: 'braun', groesse: 'gross', ohren: 'haengend' },
        { name: 'Fipsi', art: 'hund', fell: 'weiss', groesse: 'klein', flecken: 'schwarz', ohren: 'haengend' },
        { name: 'Rocky', art: 'hund', fell: 'schwarz', halsband: 'rot', ohren: 'spitz' },
      ],
    },
    {
      titel: 'Auf dem Dach', szene: 'dach',
      text: 'Auf dem Dach sitzen drei Katzen in der Sonne. Minka ist orange und hat Streifen wie ein Tiger. ' +
            'Ihre Augen sind grün. Luna ist ganz schwarz. Sie hat gelbe Augen. Schneeball ist weiss wie Schnee. ' +
            'Sie trägt eine rosa Schleife und hat blaue Augen.',
      tiere: [
        { name: 'Minka', art: 'katze', fell: 'orange', streifen: true, augen: 'gruen' },
        { name: 'Luna', art: 'katze', fell: 'schwarz', augen: 'gelb' },
        { name: 'Schneeball', art: 'katze', fell: 'weiss', augen: 'blau', schleife: 'rosa' },
      ],
    },
    {
      titel: 'Bei Oma', szene: 'zuhause',
      text: 'Bei Oma wohnen zwei Hunde und zwei Katzen. Der Hund Max ist braun und trägt ein blaues Halsband. ' +
            'Der Hund Tobi ist weiss. Er hat einen schwarzen Fleck um ein Auge. Die Katze Susi ist grau. ' +
            'Ihre Pfoten sind weiss, wie kleine Socken. Die Katze Mimi ist orange. An ihrem roten Halsband ' +
            'hängt ein goldenes Glöckchen.',
      tiere: [
        { name: 'Max', art: 'hund', fell: 'braun', halsband: 'blau', ohren: 'haengend' },
        { name: 'Tobi', art: 'hund', fell: 'weiss', augenfleck: true, ohren: 'haengend' },
        { name: 'Susi', art: 'katze', fell: 'grau', pfotenWeiss: true },
        { name: 'Mimi', art: 'katze', fell: 'orange', halsband: 'rot', glocke: true },
      ],
    },
    {
      titel: 'Pauls Geburtstag', szene: 'party',
      text: 'Heute hat Paul Geburtstag! Paul ist ein kleiner brauner Hund. Er trägt einen bunten Partyhut. ' +
            'Seine Freundin Lotta ist weiss und trägt eine runde Brille. Kira ist schwarz. Sie hat ein gelbes ' +
            'Halstuch um den Hals. Bruno ist der grösste Hund. Er ist grau und sein Schwanz ist geringelt wie ein Schneckenhaus.',
      tiere: [
        { name: 'Paul', art: 'hund', fell: 'braun', groesse: 'klein', hut: true, ohren: 'haengend' },
        { name: 'Lotta', art: 'hund', fell: 'weiss', brille: true, ohren: 'haengend' },
        { name: 'Kira', art: 'hund', fell: 'schwarz', halstuch: 'gelb', ohren: 'spitz' },
        { name: 'Bruno', art: 'hund', fell: 'grau', groesse: 'gross', schwanz: 'geringelt', ohren: 'spitz' },
      ],
    },
    {
      titel: 'Im Tierheim', szene: 'tierheim',
      text: 'Im Tierheim warten vier Katzen auf ein neues Zuhause. Felix ist schwarz, aber sein Bauch ist weiss. ' +
            'Zorro ist weiss. Um seine Augen trägt er eine schwarze Maske, wie ein Held. Pünktchen ist hellbraun ' +
            'und hat viele dunkle Punkte. Kiki ist orange. Sie trägt ein grünes Halsband.',
      tiere: [
        { name: 'Felix', art: 'katze', fell: 'schwarz', bauchWeiss: true },
        { name: 'Zorro', art: 'katze', fell: 'weiss', maske: true, augen: 'gelb' },
        { name: 'Pünktchen', art: 'katze', fell: 'hellbraun', flecken: 'dunkelbraun' },
        { name: 'Kiki', art: 'katze', fell: 'orange', halsband: 'gruen' },
      ],
    },
    {
      titel: 'Der Ausflug', szene: 'wald',
      text: 'Vier Freunde machen einen Ausflug in den Wald. Der Hund Lucky ist hellbraun. Um sein Auge hat er ' +
            'einen dunklen Fleck. Die Katze Tiger ist orange mit Streifen und trägt ein blaues Halsband. ' +
            'Die Katze Momo ist weiss mit schwarzen Flecken. Der Hund Rex ist grau, hat spitze Ohren und ein grünes Halsband.',
      tiere: [
        { name: 'Lucky', art: 'hund', fell: 'hellbraun', augenfleck: true, ohren: 'haengend' },
        { name: 'Tiger', art: 'katze', fell: 'orange', streifen: true, halsband: 'blau' },
        { name: 'Momo', art: 'katze', fell: 'weiss', flecken: 'schwarz', augen: 'gruen' },
        { name: 'Rex', art: 'hund', fell: 'grau', ohren: 'spitz', halsband: 'gruen' },
      ],
    },
    {
      titel: 'Picknick am See', szene: 'see',
      text: 'Am See machen fünf Tiere ein Picknick. Fido ist ein grosser schwarzer Hund mit spitzen Ohren. ' +
            'Wuschel ist ein kleiner hellbrauner Hund. Er trägt eine blaue Schleife. Sammy ist ein weisser Hund ' +
            'mit braunen Flecken und einem roten Halsband. Die Katze Bella ist grau, hat Streifen und blaue Augen. ' +
            'Die Katze Coco ist dunkelbraun. An ihrem Halsband klingelt ein Glöckchen.',
      tiere: [
        { name: 'Fido', art: 'hund', fell: 'schwarz', groesse: 'gross', ohren: 'spitz' },
        { name: 'Wuschel', art: 'hund', fell: 'hellbraun', groesse: 'klein', schleife: 'blau', ohren: 'haengend' },
        { name: 'Sammy', art: 'hund', fell: 'weiss', flecken: 'braun', halsband: 'rot', ohren: 'haengend' },
        { name: 'Bella', art: 'katze', fell: 'grau', streifen: true, augen: 'blau' },
        { name: 'Coco', art: 'katze', fell: 'dunkelbraun', halsband: 'lila', glocke: true, augen: 'gelb' },
      ],
    },
  ];

  return { liste, tierSVG };
})();
