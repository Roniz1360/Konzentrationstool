/* games.js – Die 7 Minispiele.
   Jedes Spiel: metadaten + spielen(feld, level, fertig).
   fertig({ correct, total, bereich, newLevel }) wird am Ende aufgerufen.
   Adaptiv: richtig -> etwas schwerer, falsch -> etwas leichter.
   Fehlerfreundlich: nie ein Strafton, sanftes Feedback. */

const Games = (() => {

  // ---------- kleine Helfer ----------
  const el = (tag, cls, txt) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  };
  const zufall = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const misch = (arr) => { const a = arr.slice(); for (let i=a.length-1;i>0;i--){const j=zufall(0,i);[a[i],a[j]]=[a[j],a[i]];} return a; };
  const warte = (ms) => new Promise(r => setTimeout(r, ms));

  function feedback(feld, gut) {
    const f = el('div', 'feedback zeig', gut ? '✅' : '💛');
    feld.appendChild(f);
    if (gut) Audio.richtig(); else Audio.falsch();
    setTimeout(() => f.remove(), 600);
  }

  // Adaptiv-Regel: Level steigt, wenn deutlich mehr richtig als falsch.
  function neuesLevel(level, correct, total, maxLevel) {
    const quote = total ? correct / total : 0;
    let l = level;
    if (quote >= 0.8) l = Math.min(maxLevel, level + 1);
    else if (quote < 0.5) l = Math.max(1, level - 1);
    return l;
  }

  // ================================================================
  // 1) PILZ-STOPP  (Go/No-Go – Impulskontrolle)
  // ================================================================
  function pilzStopp(feld, level, fertig) {
    Audio.sprich('Tippe die guten Pilze. Tippe den Käfer nicht an.');
    feld.innerHTML = '';
    const info = el('p', 'frage', '🍄 antippen · 🪲 nicht antippen');
    const buehne = el('div', 'spielfeld');
    feld.append(info, buehne);

    const runden = 12;
    const fenster = Math.max(750, 1600 - level * 130); // Reaktionszeit sinkt mit Level
    const kaeferAnteil = Math.min(0.5, 0.25 + level * 0.03);
    let i = 0, correct = 0, getippt = false, timer = null;

    function naechste() {
      buehne.querySelectorAll('.pilz').forEach(p => p.remove());
      if (i >= runden) { ende(); return; }
      i++;
      getippt = false;
      const kaefer = Math.random() < kaeferAnteil;
      const item = el('div', 'pilz', kaefer ? '🪲' : '🍄');
      item.style.left = zufall(8, 78) + '%';
      item.style.top = zufall(10, 70) + '%';
      buehne.appendChild(item);

      item.addEventListener('pointerdown', () => {
        if (getippt) return;
        getippt = true;
        clearTimeout(timer);
        if (!kaefer) { correct++; feedback(buehne, true); }
        else { feedback(buehne, false); }   // Käfer getippt = Fehler
        setTimeout(naechste, 350);
      });

      timer = setTimeout(() => {
        if (getippt) return;
        if (kaefer) { correct++; }          // Käfer richtig stehen gelassen
        else { feedback(buehne, false); }   // guten Pilz verpasst
        naechste();
      }, fenster);
    }

    function ende() {
      fertig({ correct, total: runden, bereich: 'aufmerksamkeit',
               newLevel: neuesLevel(level, correct, runden, 8) });
    }
    naechste();
  }

  // ================================================================
  // 2) ECHO  (Corsi – visuell-räumliches Arbeitsgedächtnis)
  // ================================================================
  function echo(feld, level, fertig) {
    Audio.sprich('Schau gut zu. Tippe die Felder dann in der gleichen Reihenfolge.');
    feld.innerHTML = '';
    const info = el('p', 'frage', 'Merke dir die Reihenfolge 👀');
    const punkte = el('div', 'fortschritt'); // zeigt, wie viele Felder schon getippt sind
    const wrap = el('div', 'spielfeld');
    const raster = el('div', 'raster'); raster.style.gridTemplateColumns = 'repeat(3,1fr)';
    wrap.appendChild(raster);
    const nochmal = el('button', 'knopf zweit klein', '🔁 Nochmal zeigen');
    feld.append(info, punkte, wrap, nochmal);

    const zellen = [];
    for (let k = 0; k < 9; k++) { const z = el('div', 'zelle'); zellen.push(z); raster.appendChild(z); }

    const runden = 5;
    const maxLen = 7;                       // passt auf das 3x3-Raster (max 9 Felder)
    let runde = 0, correct = 0;
    let laenge = 2 + Math.floor(level / 2); // Folge wird länger mit Level
    let folge = [], pos = 0, busy = false, zeigtGerade = false;

    // Eindeutige Felder (kein Feld doppelt) – klar und nicht verwirrend
    function neueFolge(n) { return misch([0,1,2,3,4,5,6,7,8]).slice(0, Math.min(n, 9)); }

    function punkteZeichnen() {
      punkte.innerHTML = '';
      folge.forEach((_, i) => {
        const p = el('div', 'punkt');
        if (i < pos) p.classList.add('fertig');
        punkte.appendChild(p);
      });
    }

    async function zeigen() {
      zeigtGerade = true;
      raster.style.pointerEvents = 'none';
      nochmal.disabled = true; nochmal.style.opacity = '.4';
      info.textContent = 'Schau gut zu …';
      pos = 0; punkteZeichnen();
      await warte(500);
      for (let i = 0; i < folge.length; i++) {
        const z = zellen[folge[i]];
        z.classList.add('leuchtet'); Audio.tipp(1 + i * 0.08); // Tonhöhe steigt Schritt für Schritt
        await warte(560);
        z.classList.remove('leuchtet');
        await warte(220);
      }
      info.textContent = 'Jetzt du! 👆';
      raster.style.pointerEvents = 'auto';
      nochmal.disabled = false; nochmal.style.opacity = '1';
      zeigtGerade = false; busy = false;
    }

    function tippe(idx, z) {
      if (busy || zeigtGerade) return;
      if (idx === folge[pos]) {
        z.classList.add('getippt'); Audio.tipp(1 + pos * 0.08);
        setTimeout(() => z.classList.remove('getippt'), 260);
        pos++; punkteZeichnen();
        if (pos === folge.length) {          // Folge komplett richtig
          busy = true; correct++; feedback(wrap, true);
          setTimeout(() => { laenge = Math.min(maxLen, laenge + 1); naechsteRunde(); }, 800);
        }
      } else {                                // falsches Feld – sanft, ohne Drama
        busy = true; feedback(wrap, false);
        setTimeout(() => { laenge = Math.max(2, laenge - 1); naechsteRunde(); }, 800);
      }
    }

    zellen.forEach((z, idx) => z.addEventListener('pointerdown', () => tippe(idx, z)));
    nochmal.addEventListener('pointerdown', () => { if (!zeigtGerade) zeigen(); });

    function naechsteRunde() {
      if (runde >= runden) {
        fertig({ correct, total: runden, bereich: 'gedaechtnis',
                 newLevel: neuesLevel(level, correct, runden, 8) });
        return;
      }
      runde++;
      folge = neueFolge(laenge);
      pos = 0; busy = true;
      zeigen();
    }
    naechsteRunde();
  }

  // ================================================================
  // 3) GLEICH ODER ANDERS  (1-back – Arbeitsgedächtnis)
  // ================================================================
  function gleichAnders(feld, level, fertig) {
    Audio.sprich('Ist das Tier gleich wie das Tier vorher?');
    const tiere = ['🐶','🐱','🐭','🐰','🦊','🐻','🐼','🐸','🐵','🦁'];
    const nBack = level >= 5 ? 2 : 1;
    feld.innerHTML = '';
    const info = el('p', 'frage', nBack === 1 ? 'Gleich wie das Bild vorher?' : 'Gleich wie 2 Bilder vorher?');
    const wrap = el('div', 'spielfeld'); wrap.style.fontSize = '6rem';
    const tier = el('div', '', '❔'); wrap.appendChild(tier);
    const auswahl = el('div', 'auswahl zwei');
    const bGleich = el('button', 'wahl', 'Gleich 👍');
    const bAnders = el('button', 'wahl', 'Anders 👉');
    auswahl.append(bGleich, bAnders);
    feld.append(info, wrap, auswahl);

    const runden = 11;
    let i = 0, correct = 0, total = 0, busy = false;
    const verlauf = [];

    function antwort(gesagt) {
      if (busy || i <= nBack) return; // erst antworten, wenn genug Bilder gezeigt wurden
      busy = true;
      const gleich = verlauf[i-1] === verlauf[i-1-nBack];
      total++;
      if (gesagt === gleich) { correct++; feedback(wrap, true); } else { feedback(wrap, false); }
      setTimeout(zeige, 650);
    }
    bGleich.addEventListener('pointerdown', () => antwort(true));
    bAnders.addEventListener('pointerdown', () => antwort(false));

    function zeige() {
      if (i >= runden) {
        fertig({ correct, total: Math.max(1,total), bereich: 'gedaechtnis',
                 newLevel: neuesLevel(level, correct, Math.max(1,total), 8) });
        return;
      }
      // ab und zu absichtlich wiederholen, damit "gleich" vorkommt
      let t;
      if (i >= nBack && Math.random() < 0.4) t = verlauf[i-nBack];
      else t = tiere[zufall(0, tiere.length-1)];
      verlauf.push(t); tier.textContent = t; i++;
      busy = false;
      if (i <= nBack) setTimeout(zeige, 900); // Startbilder nur zeigen
    }
    zeige();
  }

  // ================================================================
  // 4) SORTIER-WIRBEL  (DCCS – kognitive Flexibilität)
  // ================================================================
  function sortierWirbel(feld, level, fertig) {
    Audio.sprich('Sortiere die Karte. Achte auf die Regel oben.');
    const farben = [['Rot','#e05a4a'], ['Blau','#4a7fe0']];
    const formen = [['Kreis','⬤'], ['Stern','★']];
    feld.innerHTML = '';
    const regelZeile = el('p', 'frage', '');
    const wrap = el('div', 'spielfeld');
    const karte = el('div', '', '★'); karte.style.fontSize = '6rem';
    wrap.appendChild(karte);
    const auswahl = el('div', 'auswahl zwei');
    const b1 = el('button', 'wahl', ''); const b2 = el('button', 'wahl', '');
    auswahl.append(b1, b2);
    feld.append(regelZeile, wrap, auswahl);

    const runden = 12;
    let i = 0, correct = 0, busy = false;
    let nachFarbe = true;
    const wechselChance = Math.min(0.7, 0.25 + level * 0.06);
    let aktFarbe, aktForm;

    function neu() {
      if (i >= runden) {
        fertig({ correct, total: runden, bereich: 'aufmerksamkeit',
                 newLevel: neuesLevel(level, correct, runden, 8) });
        return;
      }
      i++; busy = false;
      if (i > 1 && Math.random() < wechselChance) nachFarbe = !nachFarbe;
      aktFarbe = zufall(0,1); aktForm = zufall(0,1);
      karte.textContent = formen[aktForm][1];
      karte.style.color = farben[aktFarbe][1];
      if (nachFarbe) {
        regelZeile.textContent = '🎨 Sortiere nach FARBE';
        b1.textContent = farben[0][0]; b1.style.color = farben[0][1];
        b2.textContent = farben[1][0]; b2.style.color = farben[1][1];
        b1.dataset.ziel = 0; b2.dataset.ziel = 1; b1.dataset.wert = aktFarbe; b2.dataset.wert = aktFarbe;
      } else {
        regelZeile.textContent = '⬤ Sortiere nach FORM';
        b1.textContent = formen[0][1] + ' ' + formen[0][0]; b1.style.color = '#333';
        b2.textContent = formen[1][1] + ' ' + formen[1][0]; b2.style.color = '#333';
        b1.dataset.ziel = 0; b2.dataset.ziel = 1; b1.dataset.wert = aktForm; b2.dataset.wert = aktForm;
      }
    }
    function tipp(zielIdx) {
      if (busy) return; busy = true;
      const wert = nachFarbe ? aktFarbe : aktForm;
      if (zielIdx === wert) { correct++; feedback(wrap, true); } else { feedback(wrap, false); }
      setTimeout(neu, 600);
    }
    b1.addEventListener('pointerdown', () => tipp(0));
    b2.addEventListener('pointerdown', () => tipp(1));
    neu();
  }

  // ================================================================
  // 5) ZAHLEN-FISCHEN  (Rechnen bis 100 – Lehrplan 21, 2. Klasse)
  // ================================================================
  function zahlenFischen(feld, level, fertig) {
    Audio.sprich('Löse die Rechnung. Tippe den richtigen Fisch.');
    feld.innerHTML = '';
    const frage = el('p', 'frage', '');
    const wrap = el('div', 'spielfeld'); wrap.style.minHeight = '160px';
    frage.style.fontSize = '2.6rem';
    const auswahl = el('div', 'auswahl drei');
    feld.append(frage, wrap, auswahl);

    const runden = 10;
    let i = 0, correct = 0, busy = false;

    function aufgabe() {
      busy = false;
      let a, b, op, res;
      if (level <= 1) {            // bis 20, Plus, meist ohne Zehnerübergang
        a = zufall(2, 9); b = zufall(1, Math.min(9, 18 - a)); op = '+'; res = a + b;
      } else if (level === 2) {    // bis 20, Plus/Minus mit Zehnerübergang
        if (Math.random() < 0.5) { a = zufall(6, 14); b = zufall(3, 9); op = '+'; res = a + b; }
        else { a = zufall(11, 20); b = zufall(3, 9); op = '−'; res = a - b; }
      } else if (level === 3) {    // bis 100, nur Zehner (ohne Zehnerübergang)
        if (Math.random() < 0.5) { a = zufall(2, 6)*10 + zufall(0,9); b = zufall(1,3)*10; op='+'; res=a+b; if(res>99){b-=10;res-=10;} }
        else { a = zufall(5, 9)*10 + zufall(0,9); b = zufall(1,3)*10; op='−'; res=a-b; }
      } else {                     // bis 100 mit Zehnerübergang
        if (Math.random() < 0.5) { a = zufall(15, 79); b = zufall(6, 20); op='+'; res=a+b; if(res>99){a=zufall(15,60);res=a+b;} }
        else { a = zufall(25, 99); b = zufall(6, 20); op='−'; res=a-b; }
      }
      frage.textContent = `${a} ${op} ${b} = ?`;
      Audio.sprich(`${a} ${op === '+' ? 'plus' : 'minus'} ${b}`);
      wrap.textContent = '🎣';

      const optionen = new Set([res]);
      while (optionen.size < 3) {
        const d = res + zufall(-9, 9);
        if (d >= 0 && d !== res) optionen.add(d);
      }
      auswahl.innerHTML = '';
      misch([...optionen]).forEach(z => {
        const b = el('button', 'wahl', '🐟 ' + z);
        b.addEventListener('pointerdown', () => {
          if (busy) return; busy = true;
          if (z === res) { b.classList.add('richtig'); correct++; feedback(wrap, true); }
          else { b.classList.add('falsch'); feedback(wrap, false); }
          setTimeout(next, 800);
        });
        auswahl.appendChild(b);
      });
    }
    function next() {
      i++;
      if (i > runden) { fertig({ correct, total: runden, bereich: 'rechnen', newLevel: neuesLevel(level, correct, runden, 4) }); return; }
      aufgabe();
    }
    next();
  }

  // ================================================================
  // 6) WÖRTER-ANGEL  (Lesen – Sichtwortschatz, Schweizer «ss»)
  // ================================================================
  function woerterAngel(feld, level, fertig) {
    Audio.sprich('Lies das Wort. Tippe das passende Bild.');
    const paare = [
      ['Hund','🐶'],['Katze','🐱'],['Maus','🐭'],['Fisch','🐟'],['Baum','🌳'],
      ['Haus','🏠'],['Ball','⚽'],['Apfel','🍎'],['Blume','🌸'],['Auto','🚗'],
      ['Sonne','☀️'],['Mond','🌙'],['Stern','⭐'],['Herz','❤️'],['Kuh','🐮'],
      ['Nuss','🌰'],['Schloss','🏰'],['Hut','🎩'],['Brot','🍞'],['Vogel','🐦'],
      ['Biene','🐝'],['Frosch','🐸'],['Igel','🦔'],['Pilz','🍄'],['Schaf','🐑'],
    ];
    feld.innerHTML = '';
    const wortBox = el('div', 'spielfeld'); wortBox.style.minHeight = '140px';
    const wort = el('div', 'frage', ''); wort.style.fontSize = '2.8rem'; wortBox.appendChild(wort);
    const auswahl = el('div', 'auswahl drei');
    feld.append(wortBox, auswahl);

    const runden = 10;
    const anzahlBilder = level >= 3 ? 4 : 3; // mehr Ablenker mit Level
    let i = 0, correct = 0, busy = false;

    function next() {
      i++;
      if (i > runden) { fertig({ correct, total: runden, bereich: 'lesen', newLevel: neuesLevel(level, correct, runden, 6) }); return; }
      busy = false;
      const ziel = paare[zufall(0, paare.length-1)];
      wort.textContent = ziel[0];
      Audio.sprich(ziel[0]);
      const optionen = new Set([ziel]);
      while (optionen.size < anzahlBilder) optionen.add(paare[zufall(0, paare.length-1)]);
      auswahl.className = 'auswahl ' + (anzahlBilder >= 4 ? 'zwei' : 'drei');
      auswahl.innerHTML = '';
      misch([...optionen]).forEach(p => {
        const b = el('button', 'wahl', p[1]); b.style.fontSize = '3rem';
        b.addEventListener('pointerdown', () => {
          if (busy) return; busy = true;
          if (p[0] === ziel[0]) { b.classList.add('richtig'); correct++; feedback(wortBox, true); }
          else { b.classList.add('falsch'); feedback(wortBox, false); }
          setTimeout(next, 800);
        });
        auswahl.appendChild(b);
      });
    }
    next();
  }

  // ================================================================
  // 7) FINDE-MICH  (visuelles Suchen – selektive Aufmerksamkeit)
  // ================================================================
  function findeMich(feld, level, fertig) {
    Audio.sprich('Finde dieses Bild und tippe es an.');
    // Gruppen ähnlicher Symbole – höheres Level = ähnlichere Ablenker
    const gruppen = [
      ['🍎','🍏','🍐','🍅','🍒'],
      ['🐶','🐱','🐰','🐭','🐹'],
      ['⭐','🌟','✨','❄️','🔆'],
      ['🚗','🚙','🚕','🚓','🚐'],
      ['🌸','🌺','🌷','🌹','💐'],
    ];
    feld.innerHTML = '';
    const kopf = el('p', 'frage', 'Finde:  ');
    const zielSpan = el('span', '', ''); zielSpan.style.fontSize = '2.4rem'; kopf.appendChild(zielSpan);
    const wrap = el('div', 'spielfeld');
    const raster = el('div', 'raster');
    wrap.appendChild(raster);
    feld.append(kopf, wrap);

    const runden = 8;
    let i = 0, correct = 0, busy = false;

    function next() {
      i++;
      if (i > runden) { fertig({ correct, total: runden, bereich: 'aufmerksamkeit', newLevel: neuesLevel(level, correct, runden, 8) }); return; }
      busy = false;
      const spalten = Math.min(5, 3 + Math.floor(level/2));
      const anzahl = spalten * (spalten - (spalten>4?1:0));
      raster.style.gridTemplateColumns = `repeat(${spalten},1fr)`;
      const gruppe = gruppen[zufall(0, gruppen.length-1)];
      const ziel = gruppe[0];
      zielSpan.textContent = ziel;
      const ablenkerPool = level >= 4 ? gruppe.slice(1) : ['🍋','🐢','🌙','🧩','🎈','🍀'];
      raster.innerHTML = '';
      const zielPos = zufall(0, anzahl - 1);
      for (let k = 0; k < anzahl; k++) {
        const z = el('div', 'zelle', k === zielPos ? ziel : ablenkerPool[zufall(0, ablenkerPool.length-1)]);
        z.addEventListener('pointerdown', () => {
          if (busy) return; busy = true;
          if (k === zielPos) { correct++; feedback(wrap, true); } else { feedback(wrap, false); }
          setTimeout(next, 550);
        });
        raster.appendChild(z);
      }
    }
    next();
  }

  // ================================================================
  // 8) TIER-GESCHICHTEN  (Zuhören + Merken + genau Hinschauen)
  //    Wie in der Schule: Bilder ansehen, Geschichte hören,
  //    dann jedem Tier den richtigen Namen geben.
  // ================================================================
  function tierGeschichten(feld, level, fertig) {
    const pool = Geschichten.liste;
    // Schwierigkeit: mehr Tiere pro Geschichte mit steigender Stufe
    const erlaubt = level <= 2 ? [3] : level <= 4 ? [3, 4] : [4, 5];
    let kandidaten = pool.filter(g => erlaubt.includes(g.tiere.length));
    if (!kandidaten.length) kandidaten = pool;
    const runden = 2;
    const auswahl = misch(kandidaten).slice(0, runden);
    while (auswahl.length < runden) auswahl.push(pool[zufall(0, pool.length - 1)]);
    const textSichtbar = level <= 3;   // ab Stufe 4 nur zuhören (Text auf Wunsch)

    let runde = 0, correct = 0, total = 0;

    function karte(t, i, mitSlot) {
      const k = el('div', 'tier-karte');
      k.dataset.i = i;
      k.innerHTML = Geschichten.tierSVG(t);
      if (mitSlot) k.append(el('div', 'slot', '?'));
      return k;
    }

    // ---- Phase 1: Bilder ansehen + Geschichte hören ----
    function hoerPhase() {
      const g = auswahl[runde];
      if (window.Music) Music.stop();         // Musik aus, damit man gut zuhören kann
      feld.innerHTML = '';
      feld.append(el('p', 'frage', `👂 ${g.titel}`));
      feld.append(el('p', 'mini zentriert', 'Schau dir die Tiere an und hör gut zu. Merke dir, wie jedes Tier heisst!'));

      // Bilder zuerst – wie der Zettel, der beim Zuhören vor dem Kind liegt
      const raster = el('div', 'tier-raster kompakt');
      misch(g.tiere.map((t, i) => i)).forEach(i => raster.append(karte(g.tiere[i], i, false)));
      feld.append(raster);

      const text = el('div', 'geschichte-text', g.text);
      if (!textSichtbar) text.hidden = true;

      const knoepfe = el('div', 'reihe mitte');
      const nochmal = el('button', 'knopf zweit klein', '🔊 Nochmal hören');
      nochmal.addEventListener('pointerdown', () => Audio.sprich(g.text));
      knoepfe.append(nochmal);
      if (!textSichtbar) {
        const zeig = el('button', 'knopf zweit klein', '📖 Text zeigen');
        zeig.addEventListener('pointerdown', () => { text.hidden = !text.hidden; });
        knoepfe.append(zeig);
      }
      feld.append(knoepfe, text);

      const weiter = el('button', 'knopf gross', 'Ich habe zugehört ▶');
      weiter.addEventListener('pointerdown', () => { Audio.stopp(); zuordnen(); });
      feld.append(weiter);

      Audio.sprich(`${g.titel}. ${g.text}`);
    }

    // ---- Phase 2: Namen zuordnen (wie das Prüfungsblatt) ----
    function zuordnen() {
      const g = auswahl[runde];
      if (window.Music) Music.play('spiel');
      feld.innerHTML = '';
      feld.append(el('p', 'frage', 'Wie heissen die Tiere?'));
      Audio.sprich('Wie heissen die Tiere? Tippe einen Namen und dann das passende Tier.');

      const chips = el('div', 'namen-chips');
      const raster = el('div', 'tier-raster');
      const pruefen = el('button', 'knopf gross', 'Prüfen ✓');
      pruefen.disabled = true;
      feld.append(el('p', 'mini zentriert', 'Tippe einen Namen und dann das passende Tier.'));
      feld.append(chips, raster, pruefen);

      const namen = misch(g.tiere.map(t => t.name));
      const zuw = new Map();          // Kartenindex -> Name
      let selName = null, selKarte = null, fertigGeprueft = false;

      const karten = misch(g.tiere.map((t, i) => i)).map(i => {
        const k = karte(g.tiere[i], i, true);
        k.addEventListener('pointerdown', () => tippeKarte(i));
        raster.append(k);
        return k;
      });
      const chipEls = namen.map(n => {
        const c = el('button', 'chip', n);
        c.addEventListener('pointerdown', () => tippeName(n));
        chips.append(c);
        return c;
      });

      function zuweisen(i, name) {
        for (const [k, v] of zuw) if (v === name) zuw.delete(k);   // Name nur einmal vergeben
        zuw.set(i, name);
        selName = null; selKarte = null;
        Audio.tipp();
        zeichne();
      }
      function tippeName(name) {
        if (fertigGeprueft) return;
        if (selKarte !== null) { zuweisen(selKarte, name); return; }
        selName = selName === name ? null : name;
        Audio.tipp(); zeichne();
      }
      function tippeKarte(i) {
        if (fertigGeprueft) return;
        if (selName) { zuweisen(i, selName); return; }
        if (zuw.has(i)) { zuw.delete(i); selKarte = i; }        // Namen wieder wegnehmen
        else selKarte = selKarte === i ? null : i;
        Audio.tipp(); zeichne();
      }
      function zeichne() {
        karten.forEach(k => {
          const i = +k.dataset.i, slot = k.querySelector('.slot');
          slot.textContent = zuw.get(i) || '?';
          slot.classList.toggle('voll', zuw.has(i));
          k.classList.toggle('gewaehlt', selKarte === i);
        });
        const benutzt = new Set(zuw.values());
        chipEls.forEach(c => {
          c.classList.toggle('aktiv', selName === c.textContent);
          c.classList.toggle('benutzt', benutzt.has(c.textContent));
        });
        pruefen.disabled = zuw.size !== g.tiere.length;
      }

      pruefen.addEventListener('pointerdown', () => {
        if (pruefen.disabled || fertigGeprueft) return;
        fertigGeprueft = true;
        let richtig = 0;
        karten.forEach(k => {
          const i = +k.dataset.i, ok = zuw.get(i) === g.tiere[i].name;
          k.classList.add(ok ? 'richtig' : 'falsch');
          if (ok) richtig++;
          else k.querySelector('.slot').textContent = `💛 ${g.tiere[i].name}`;   // richtige Lösung zeigen
        });
        correct += richtig; total += g.tiere.length;
        if (richtig === g.tiere.length) Audio.jubel(); else Audio.richtig();
        const lob = richtig === g.tiere.length ? 'Alle richtig – super zugehört!'
                  : richtig >= g.tiere.length / 2 ? 'Gut gemacht! Schau dir die gelben Karten nochmal an.'
                  : 'Das war schwierig. Beim nächsten Mal klappt es besser!';
        chips.innerHTML = '';
        chips.append(el('div', 'frage', `${richtig} von ${g.tiere.length} richtig`));
        Audio.sprich(`${richtig} von ${g.tiere.length} richtig. ${lob}`);
        pruefen.textContent = runde + 1 < runden ? 'Nächste Geschichte ▶' : 'Fertig ▶';
        pruefen.disabled = false;
        pruefen.addEventListener('pointerdown', () => {
          runde++;
          if (runde < runden) hoerPhase();
          else fertig({ correct, total, bereich: 'gedaechtnis', newLevel: neuesLevel(level, correct, total, 6) });
        }, { once: true });
        feld.insertBefore(el('p', 'mini zentriert', lob), pruefen);
      });

      zeichne();
    }

    hoerPhase();
  }

  // ---------- Katalog ----------
  const katalog = [
    { id:'pilz',   name:'Pilz-Stopp',        emoji:'🍄', bereich:'aufmerksamkeit', spielen:pilzStopp },
    { id:'echo',   name:'Echo',              emoji:'🔊', bereich:'gedaechtnis',    spielen:echo },
    { id:'gleich', name:'Gleich oder anders',emoji:'🐻', bereich:'gedaechtnis',    spielen:gleichAnders },
    { id:'sort',   name:'Sortier-Wirbel',    emoji:'🌀', bereich:'aufmerksamkeit', spielen:sortierWirbel },
    { id:'zahlen', name:'Zahlen-Fischen',    emoji:'🎣', bereich:'rechnen',        spielen:zahlenFischen },
    { id:'woerter',name:'Wörter-Angel',      emoji:'📖', bereich:'lesen',          spielen:woerterAngel },
    { id:'finde',  name:'Finde-mich',        emoji:'🔍', bereich:'aufmerksamkeit', spielen:findeMich },
    { id:'geschichte', name:'Tier-Geschichten', emoji:'🐾', bereich:'gedaechtnis', spielen:tierGeschichten },
  ];

  function byId(id) { return katalog.find(g => g.id === id); }

  return { katalog, byId };
})();
