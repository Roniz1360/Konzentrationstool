/* geschichten.js – Kurzgeschichten mit Hunden und Katzen + Zeichnungen.
   Jedes Tier wird im Code als Grafik gezeichnet, genau passend zur
   Beschreibung in der Geschichte (Fell, Flecken, Ohren, Augen, Halsband …).
   Schweizer Rechtschreibung: immer «ss». */

const Geschichten = (() => {

  // ---------- Farben ----------
  const FELL = {
    braun: '#a0703f', hellbraun: '#dcae74', dunkelbraun: '#6b462a', schwarz: '#3a3633',
    weiss: '#fbf9f4', grau: '#a3a8ad', orange: '#f0944d', beige: '#ead3aa',
  };
  const DEKO = {
    rot: '#e0524a', blau: '#4a7fe0', gruen: '#46ad66', gelb: '#f2c230',
    rosa: '#f08fb0', lila: '#9b6fd6', gold: '#e8b730',
  };
  const AUGEN = { gruen: '#58b368', blau: '#4f95e8', gelb: '#e5b923', braun: '#7a4f2a' };
  const OUT = '#4a3b30';   // Umrisslinie (Cartoon-Stil, auch weisse Tiere gut sichtbar)
  const SW = 3;

  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.round((n >> 16) * (1 - f)), g = Math.round(((n >> 8) & 255) * (1 - f)), b = Math.round((n & 255) * (1 - f));
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }
  const groesse = (t) => ({ gross: 'translate(0,0) scale(1)', klein: 'translate(24,42) scale(0.76)' }[t.groesse] || 'translate(10,17) scale(0.9)');

  // Wiederverwendbare Teile
  const strichPfad = (d, farbe, breite) =>
    `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="${breite + 6}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${farbe}" stroke-width="${breite}" stroke-linecap="round" stroke-linejoin="round"/>`;

  function hut(cx, top) {
    return `<polygon points="${cx},${top} ${cx - 17},${top + 44} ${cx + 17},${top + 44}" fill="${DEKO.rosa}" stroke="${OUT}" stroke-width="${SW}" stroke-linejoin="round"/>` +
      `<circle cx="${cx - 4}" cy="${top + 22}" r="3" fill="#fff"/><circle cx="${cx + 5}" cy="${top + 32}" r="3" fill="${DEKO.gelb}"/><circle cx="${cx - 7}" cy="${top + 37}" r="2.5" fill="${DEKO.blau}"/>` +
      `<circle cx="${cx}" cy="${top}" r="6" fill="${DEKO.gelb}" stroke="${OUT}" stroke-width="2"/>`;
  }
  function schleife(cx, cy, farbe) {
    return `<polygon points="${cx},${cy} ${cx - 15},${cy - 9} ${cx - 15},${cy + 9}" fill="${farbe}" stroke="${OUT}" stroke-width="2.5" stroke-linejoin="round"/>` +
      `<polygon points="${cx},${cy} ${cx + 15},${cy - 9} ${cx + 15},${cy + 9}" fill="${farbe}" stroke="${OUT}" stroke-width="2.5" stroke-linejoin="round"/>` +
      `<circle cx="${cx}" cy="${cy}" r="4.5" fill="${farbe}" stroke="${OUT}" stroke-width="2.5"/>`;
  }
  function brille(lx, rx, y) {
    return `<circle cx="${lx}" cy="${y}" r="12" fill="rgba(255,255,255,.25)" stroke="#2b2b2b" stroke-width="3.5"/>` +
      `<circle cx="${rx}" cy="${y}" r="12" fill="rgba(255,255,255,.25)" stroke="#2b2b2b" stroke-width="3.5"/>` +
      `<line x1="${lx + 12}" y1="${y}" x2="${rx - 12}" y2="${y}" stroke="#2b2b2b" stroke-width="3.5"/>`;
  }
  function glocke(cx, cy) {
    return `<circle cx="${cx}" cy="${cy}" r="7" fill="${DEKO.gold}" stroke="${OUT}" stroke-width="2.5"/>` +
      `<line x1="${cx - 4}" y1="${cy + 2}" x2="${cx + 4}" y2="${cy + 2}" stroke="${OUT}" stroke-width="2"/>`;
  }
  function halsband(d, farbe) { return strichPfad(d, farbe, 8); }

  // ---------- Hund ----------
  function hund(t, uid) {
    const fell = FELL[t.fell] || FELL.braun;
    const ohr = t.fell === 'weiss' ? '#e6dac8' : t.fell === 'schwarz' ? '#262321' : shade(fell, 0.25);
    const schnauze = t.fell === 'weiss' ? '#ffffff' : '#f5e9d8';
    const pfote = t.pfotenWeiss ? '#ffffff' : fell;
    const s = [];
    s.push(`<defs><clipPath id="kb${uid}"><ellipse cx="100" cy="148" rx="52" ry="32"/></clipPath>` +
           `<clipPath id="kk${uid}"><circle cx="100" cy="84" r="38"/></clipPath></defs>`);
    // Schwanz
    const sp = { lang: 'M146 146 Q 184 132 178 98', kurz: 'M148 146 Q 160 141 163 131',
                 geringelt: 'M146 146 C 178 146 186 110 165 106 C 150 104 149 125 163 123' }[t.schwanz || 'lang'];
    s.push(strichPfad(sp, fell, 10));
    // Beine
    [58, 128, 78, 106].forEach(x => s.push(`<rect x="${x}" y="158" width="17" height="28" rx="8" fill="${pfote}" stroke="${OUT}" stroke-width="${SW}"/>`));
    // Körper
    s.push(`<ellipse cx="100" cy="148" rx="54" ry="34" fill="${fell}" stroke="${OUT}" stroke-width="${SW}"/>`);
    if (t.bauchWeiss) s.push(`<ellipse cx="100" cy="160" rx="28" ry="17" fill="#fff" clip-path="url(#kb${uid})"/>`);
    if (t.flecken) {
      const fc = FELL[t.flecken] || FELL.schwarz;
      s.push(`<g clip-path="url(#kb${uid})" fill="${fc}"><circle cx="72" cy="140" r="10"/><circle cx="120" cy="150" r="12"/><circle cx="96" cy="166" r="7"/><circle cx="140" cy="136" r="8"/><circle cx="84" cy="160" r="5"/></g>`);
    }
    // Spitze Ohren (hinter dem Kopf)
    if (t.ohren === 'spitz') {
      s.push(`<polygon points="64,66 70,26 94,50" fill="${ohr}" stroke="${OUT}" stroke-width="${SW}" stroke-linejoin="round"/>`);
      s.push(`<polygon points="136,66 130,26 106,50" fill="${ohr}" stroke="${OUT}" stroke-width="${SW}" stroke-linejoin="round"/>`);
    }
    // Kopf
    s.push(`<circle cx="100" cy="84" r="40" fill="${fell}" stroke="${OUT}" stroke-width="${SW}"/>`);
    if (t.flecken) {
      const fc = FELL[t.flecken] || FELL.schwarz;
      s.push(`<g clip-path="url(#kk${uid})" fill="${fc}"><circle cx="122" cy="60" r="9"/><circle cx="74" cy="104" r="6"/></g>`);
    }
    // Hängende Ohren (über dem Kopf)
    if (t.ohren !== 'spitz') {
      s.push(`<ellipse cx="63" cy="90" rx="14" ry="29" fill="${ohr}" stroke="${OUT}" stroke-width="${SW}" transform="rotate(18 63 90)"/>`);
      s.push(`<ellipse cx="137" cy="90" rx="14" ry="29" fill="${ohr}" stroke="${OUT}" stroke-width="${SW}" transform="rotate(-18 137 90)"/>`);
    }
    if (t.augenfleck) s.push(`<ellipse cx="83" cy="77" rx="15" ry="13" fill="#2f2b29"/>`);
    // Halstuch / Halsband
    if (t.halstuch) {
      const c = DEKO[t.halstuch];
      s.push(strichPfad('M68 113 Q 100 134 132 113', c, 11));
      s.push(`<polygon points="88,122 112,122 100,148" fill="${c}" stroke="${OUT}" stroke-width="${SW}" stroke-linejoin="round"/>`);
    }
    if (t.halsband) s.push(halsband('M70 113 Q 100 132 130 113', DEKO[t.halsband]));
    // Schnauze, Nase, Mund
    s.push(`<ellipse cx="100" cy="100" rx="22" ry="16" fill="${schnauze}" stroke="${OUT}" stroke-width="2.5"/>`);
    s.push(`<ellipse cx="100" cy="92" rx="8" ry="6" fill="#2b211b"/>`);
    s.push(`<path d="M100 97 Q 95 106 88 102 M100 97 Q 105 106 112 102" fill="none" stroke="#2b211b" stroke-width="2.5" stroke-linecap="round"/>`);
    // Augen
    if (t.augenfleck) s.push(`<circle cx="83" cy="77" r="8" fill="#fff"/>`);
    [[83, 77], [117, 77]].forEach(([x, y]) => {
      s.push(`<circle cx="${x}" cy="${y}" r="6" fill="#2b211b"/><circle cx="${x + 2}" cy="${y - 2}" r="2" fill="#fff"/>`);
    });
    if (t.halsband && t.glocke) s.push(glocke(100, 130));
    if (t.brille) s.push(brille(83, 117, 77));
    if (t.schleife) s.push(schleife(124, 48, DEKO[t.schleife]));
    if (t.hut) s.push(hut(100, 2));
    return `<g transform="${groesse(t)}">${s.join('')}</g>`;
  }

  // ---------- Katze ----------
  function katze(t, uid) {
    const fell = FELL[t.fell] || FELL.grau;
    const dunkel = shade(fell, 0.35);
    const pfote = t.pfotenWeiss ? '#ffffff' : fell;
    const augenFarbe = AUGEN[t.augen] || (t.fell === 'schwarz' ? AUGEN.gelb : t.fell === 'weiss' ? AUGEN.blau : AUGEN.gruen);
    const s = [];
    s.push(`<defs><clipPath id="kb${uid}"><ellipse cx="100" cy="152" rx="44" ry="34"/></clipPath>` +
           `<clipPath id="kk${uid}"><circle cx="100" cy="88" r="36"/></clipPath></defs>`);
    // Schwanz
    const sp = { lang: 'M138 172 Q 184 166 176 116', kurz: 'M140 170 Q 157 168 160 157' }[t.schwanz === 'kurz' ? 'kurz' : 'lang'];
    s.push(strichPfad(sp, fell, 10));
    if (t.streifen) s.push(`<path d="M168 150 l10 -3 M174 132 l10 1" stroke="${dunkel}" stroke-width="4" stroke-linecap="round"/>`);
    // Körper
    s.push(`<ellipse cx="100" cy="152" rx="46" ry="36" fill="${fell}" stroke="${OUT}" stroke-width="${SW}"/>`);
    if (t.bauchWeiss) s.push(`<ellipse cx="100" cy="160" rx="22" ry="26" fill="#fff" clip-path="url(#kb${uid})"/>`);
    if (t.flecken) {
      const fc = FELL[t.flecken] || FELL.schwarz;
      s.push(`<g clip-path="url(#kb${uid})" fill="${fc}"><circle cx="74" cy="142" r="8"/><circle cx="122" cy="148" r="9"/><circle cx="100" cy="170" r="6"/><circle cx="130" cy="168" r="6"/><circle cx="80" cy="166" r="5"/></g>`);
    }
    if (t.streifen) {
      s.push(`<g clip-path="url(#kb${uid})" stroke="${dunkel}" stroke-width="5" stroke-linecap="round" fill="none">` +
             `<path d="M60 140 Q 72 146 66 158"/><path d="M140 140 Q 128 146 134 158"/><path d="M62 166 Q 74 170 70 182"/><path d="M138 166 Q 126 170 130 182"/></g>`);
    }
    // Pfoten
    [84, 116].forEach(x => s.push(`<ellipse cx="${x}" cy="184" rx="12" ry="8" fill="${pfote}" stroke="${OUT}" stroke-width="${SW}"/>`));
    // Ohren (hinter dem Kopf)
    s.push(`<polygon points="66,74 70,30 97,54" fill="${fell}" stroke="${OUT}" stroke-width="${SW}" stroke-linejoin="round"/>`);
    s.push(`<polygon points="134,74 130,30 103,54" fill="${fell}" stroke="${OUT}" stroke-width="${SW}" stroke-linejoin="round"/>`);
    s.push(`<polygon points="73,62 74,41 87,53" fill="#f2a7b8"/><polygon points="127,62 126,41 113,53" fill="#f2a7b8"/>`);
    // Kopf
    s.push(`<circle cx="100" cy="88" r="38" fill="${fell}" stroke="${OUT}" stroke-width="${SW}"/>`);
    if (t.flecken) {
      const fc = FELL[t.flecken] || FELL.schwarz;
      s.push(`<g clip-path="url(#kk${uid})" fill="${fc}"><circle cx="120" cy="66" r="7"/><circle cx="76" cy="108" r="5"/></g>`);
    }
    if (t.streifen) {
      s.push(`<g clip-path="url(#kk${uid})" stroke="${dunkel}" stroke-width="4" stroke-linecap="round" fill="none">` +
             `<path d="M90 54 Q 93 62 89 68"/><path d="M100 52 L100 66"/><path d="M110 54 Q 107 62 111 68"/>` +
             `<path d="M64 88 L74 90"/><path d="M136 88 L126 90"/></g>`);
    }
    if (t.maske) s.push(`<rect x="66" y="74" width="68" height="22" rx="11" fill="#2f2b29"/>`);
    // Halsband
    if (t.halsband) s.push(halsband('M72 116 Q 100 134 128 116', DEKO[t.halsband]));
    // Augen (mandelförmig, farbig)
    [[86, 85], [114, 85]].forEach(([x, y]) => {
      s.push(`<ellipse cx="${x}" cy="${y}" rx="7.5" ry="9" fill="${augenFarbe}" stroke="${OUT}" stroke-width="2"/>`);
      s.push(`<ellipse cx="${x}" cy="${y}" rx="2.4" ry="7" fill="#1e1a17"/><circle cx="${x + 2.5}" cy="${y - 3.5}" r="2" fill="#fff"/>`);
    });
    // Nase, Mund, Schnurrhaare
    s.push(`<path d="M95 99 L105 99 L100 105 Z" fill="#e88aa0" stroke="${OUT}" stroke-width="1.5" stroke-linejoin="round"/>`);
    s.push(`<path d="M100 105 Q 95 111 90 108 M100 105 Q 105 111 110 108" fill="none" stroke="${OUT}" stroke-width="2" stroke-linecap="round"/>`);
    const bart = t.fell === 'schwarz' ? '#d9d4cc' : '#4a3b30';
    s.push(`<g stroke="${bart}" stroke-width="1.8" stroke-linecap="round"><line x1="82" y1="102" x2="56" y2="97"/><line x1="82" y1="106" x2="56" y2="108"/>` +
           `<line x1="118" y1="102" x2="144" y2="97"/><line x1="118" y1="106" x2="144" y2="108"/></g>`);
    if (t.halsband && t.glocke) s.push(glocke(100, 133));
    if (t.brille) s.push(brille(86, 114, 85));
    if (t.schleife) s.push(schleife(124, 58, DEKO[t.schleife]));
    if (t.hut) s.push(hut(100, 6));
    return `<g transform="${groesse(t)}">${s.join('')}</g>`;
  }

  let zaehler = 0;
  function tierSVG(t) {
    const uid = 't' + (++zaehler);
    const inhalt = t.art === 'katze' ? katze(t, uid) : hund(t, uid);
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${t.art === 'katze' ? 'Katze' : 'Hund'}">${inhalt}</svg>`;
  }

  // ---------- Die Geschichten (leicht -> schwer) ----------
  const liste = [
    {
      titel: 'Im Park',
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
      titel: 'Auf dem Dach',
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
      titel: 'Bei Oma',
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
      titel: 'Pauls Geburtstag',
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
      titel: 'Im Tierheim',
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
      titel: 'Der Ausflug',
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
      titel: 'Picknick am See',
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
