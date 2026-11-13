/* games.js – Die 8 Minispiele der Tauchfahrt.
   Jedes Spiel: spielen(feld, level, fertig, hud).
   fertig({ correct, total, bereich, newLevel }) wird am Ende aufgerufen.
   hud.schritt(i, n) zeigt den Fortschritt, hud.nala('froh'|'ups') lässt Nala reagieren.
   Adaptiv: richtig -> etwas schwerer, falsch -> etwas leichter.
   Fehlerfreundlich: nie ein Strafton, sanftes Feedback, die Lösung wird gezeigt. */

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

  // Spiel-Lauf: Wird ein Spiel verlassen, laufen seine Zeitgeber ins Leere.
  let lauf = 0;
  const spaeter = (fn, ms) => { const tk = lauf; return setTimeout(() => { if (tk === lauf) fn(); }, ms); };
  const warte = (ms) => new Promise(r => spaeter(r, ms));
  function abbrechen() { lauf++; }

  function knopf(text, icon, cls) {
    const b = el('button', 'knopf ' + (cls || ''));
    b.innerHTML = (icon ? Art.icon(icon) : '') + '<span></span>';
    b.querySelector('span').textContent = text;
    return b;
  }
  // Anweisungs-Schild oben im Spiel
  function ansage(text) { return el('div', 'ansage', text); }

  // Rückmeldung: Funken + Klang bei richtig, sanftes Wackeln bei falsch
  function feedback(gut, ziel, hud) {
    if (gut) {
      Audio.richtig(); FX.funkenAn(ziel); FX.anim(ziel, 'huepf', 500);
      if (hud) hud.nala('froh');
    } else {
      Audio.falsch(); FX.anim(ziel, 'wackel', 500);
      if (hud) hud.nala('ups');
    }
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
  // 1) PERLEN-STOPP  (Go/No-Go – Impulskontrolle)
  // ================================================================
  function pilzStopp(feld, level, fertig, hud) {
    Audio.sprich('Tippe die Muscheln mit Perle an. Die Krabbe lässt du in Ruhe!');
    feld.innerHTML = '';
    const info = el('div', 'ansage legende');
    info.innerHTML = `<span class="leg ja">${Art.roh(Art.muschel())}<i>antippen</i></span><span class="leg nein">${Art.roh(Art.krabbe())}<i>in Ruhe lassen</i></span>`;
    const buehne = el('div', 'buehne');
    const korb = el('div', 'korb'); korb.innerHTML = Art.bild('truhe') + '<b>0</b>';
    buehne.append(korb);
    feld.append(info, buehne);

    const HUETE = ['#ff8fb8', '#b79cf5', '#7ad7ff', '#ffb86b'];
    const runden = 12;
    const fenster = Math.max(750, 1600 - level * 130); // Reaktionszeit sinkt mit Level
    const kaeferAnteil = Math.min(0.5, 0.25 + level * 0.03);
    let i = 0, correct = 0, getippt = false, timer = null, geerntet = 0;

    function naechste() {
      buehne.querySelectorAll('.ploppi').forEach(p => p.remove());
      if (i >= runden) { ende(); return; }
      hud.schritt(i, runden);
      i++;
      getippt = false;
      const kaefer = Math.random() < kaeferAnteil;
      const item = el('button', 'ploppi ' + (kaefer ? 'ist-kaefer' : 'ist-pilz'));
      item.innerHTML = Art.roh(kaefer ? Art.krabbe() : Art.muschel(HUETE[zufall(0, 3)]));
      item.style.left = zufall(4, 68) + '%';
      item.style.top = zufall(16, 66) + '%';
      buehne.appendChild(item);
      Audio.blubb();

      item.addEventListener('pointerdown', () => {
        if (getippt) return;
        getippt = true;
        clearTimeout(timer);
        if (!kaefer) {
          correct++; geerntet++;
          Audio.richtig(); FX.funkenAn(item); hud.nala('froh');
          item.classList.add('geerntet');
          korb.querySelector('b').textContent = geerntet; FX.anim(korb, 'huepf', 500);
        } else { feedback(false, item, hud); }   // Käfer getippt = Fehler
        spaeter(naechste, 420);
      });

      timer = spaeter(() => {
        if (getippt) return;
        getippt = true;
        if (kaefer) {                        // Käfer richtig in Ruhe gelassen
          correct++; item.classList.add('krabbelt'); Audio.tipp(1.5);
          FX.textAn(item, 'Gut gewartet!');
        } else { item.classList.add('sinkt'); Audio.falsch(); }   // guten Pilz verpasst
        spaeter(naechste, 380);
      }, fenster);
    }

    function ende() {
      hud.schritt(runden, runden);
      fertig({ correct, total: runden, bereich: 'aufmerksamkeit',
               newLevel: neuesLevel(level, correct, runden, 8) });
    }
    naechste();
  }

  // ================================================================
  // 2) ECHO  (Corsi – visuell-räumliches Arbeitsgedächtnis)
  // ================================================================
  function echo(feld, level, fertig, hud) {
    Audio.sprich('Schau gut zu, welche Quallen leuchten. Tippe sie dann in der gleichen Reihenfolge.');
    feld.innerHTML = '';
    const info = ansage('Merke dir die Reihenfolge');
    const punkte = el('div', 'folge-punkte'); // zeigt, wie viele Kristalle schon getippt sind
    const wrap = el('div', 'buehne mitte');
    const raster = el('div', 'kristall-raster');
    wrap.appendChild(raster);
    const nochmal = knopf('Nochmal zeigen', 'nochmal', 'zweit klein');
    feld.append(info, punkte, wrap, nochmal);

    const FARBEN = ['#7ad7ff', '#ff8fc0', '#ffe066', '#8be38b', '#b79cf5', '#ff9a6b', '#6fe3d0', '#f58fe0', '#9fb8ff'];
    const zellen = [];
    for (let k = 0; k < 9; k++) {
      const z = el('button', 'kristall-zelle');
      z.innerHTML = Art.roh(Art.qualle(FARBEN[k]));
      z.style.setProperty('--glut', FARBEN[k]);
      zellen.push(z); raster.appendChild(z);
    }

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
      raster.classList.add('gesperrt');
      nochmal.disabled = true;
      info.textContent = 'Schau gut zu …';
      pos = 0; punkteZeichnen();
      await warte(600);
      for (let i = 0; i < folge.length; i++) {
        const z = zellen[folge[i]];
        z.classList.add('leuchtet'); Audio.kristall(folge[i]);
        await warte(600);
        z.classList.remove('leuchtet');
        await warte(220);
      }
      info.textContent = 'Jetzt du!';
      raster.classList.remove('gesperrt');
      nochmal.disabled = false;
      zeigtGerade = false; busy = false;
    }

    function tippe(idx, z) {
      if (busy || zeigtGerade) return;
      if (idx === folge[pos]) {
        Audio.kristall(idx); FX.anim(z, 'leuchtet', 300); FX.funkenAn(z, { n: 6, farben: [FARBEN[idx], '#fff'], kraft: 150 });
        pos++; punkteZeichnen();
        if (pos === folge.length) {          // Folge komplett richtig
          busy = true; correct++;
          spaeter(() => { feedback(true, raster, hud); zellen.forEach((c, k) => spaeter(() => FX.anim(c, 'leuchtet', 300), k * 40)); }, 250);
          spaeter(() => { laenge = Math.min(maxLen, laenge + 1); naechsteRunde(); }, 1200);
        }
      } else {                                // falscher Kristall – sanft, ohne Drama
        busy = true; feedback(false, z, hud);
        spaeter(() => { laenge = Math.max(2, laenge - 1); naechsteRunde(); }, 900);
      }
    }

    zellen.forEach((z, idx) => z.addEventListener('pointerdown', () => tippe(idx, z)));
    nochmal.addEventListener('pointerdown', () => { if (!zeigtGerade && !busy) { Audio.tipp(); zeigen(); } });

    function naechsteRunde() {
      hud.schritt(runde, runden);
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
  function gleichAnders(feld, level, fertig, hud) {
    const tiere = ['fisch','krabbe','qualle','oktopus','schildkroete','seestern','wal','kugelfisch','muschel','zierfisch'];
    const nBack = level >= 5 ? 2 : 1;
    const frageText = nBack === 1 ? 'Gleich wie das Tier vorher?' : 'Gleich wie 2 Tiere vorher?';
    Audio.sprich(nBack === 1 ? 'Wer schwimmt am Bullauge vorbei? Ist es das gleiche Tier wie vorher?' : 'Ist es das gleiche Tier wie zwei Tiere vorher?');
    feld.innerHTML = '';
    const info = ansage('Merke dir das Tier!');
    const wrap = el('div', 'buehne mitte');
    const loch = el('div', 'guckloch');
    const tier = el('div', 'guck-tier'); loch.appendChild(tier); wrap.appendChild(loch);
    const auswahl = el('div', 'auswahl zwei');
    const bGleich = el('button', 'wahl gleich'); bGleich.innerHTML = '<b class="zeichen">=</b><span>Gleich</span>';
    const bAnders = el('button', 'wahl anders'); bAnders.innerHTML = '<b class="zeichen">≠</b><span>Anders</span>';
    auswahl.append(bGleich, bAnders);
    feld.append(info, wrap, auswahl);
    auswahl.classList.add('wartet');

    const runden = 11;
    let i = 0, correct = 0, total = 0, busy = false;
    const verlauf = [];

    function antwort(gesagt, b) {
      if (busy || i <= nBack) return; // erst antworten, wenn genug Bilder gezeigt wurden
      busy = true;
      const gleich = verlauf[i-1] === verlauf[i-1-nBack];
      total++;
      if (gesagt === gleich) { correct++; b.classList.add('richtig'); feedback(true, loch, hud); }
      else { b.classList.add('falsch'); (gleich ? bGleich : bAnders).classList.add('richtig'); feedback(false, loch, hud); }
      spaeter(zeige, 800);
    }
    bGleich.addEventListener('pointerdown', () => antwort(true, bGleich));
    bAnders.addEventListener('pointerdown', () => antwort(false, bAnders));

    function zeige() {
      [bGleich, bAnders].forEach(b => b.classList.remove('richtig', 'falsch'));
      hud.schritt(Math.max(0, i - nBack), runden - nBack);
      if (i >= runden) {
        fertig({ correct, total: Math.max(1,total), bereich: 'gedaechtnis',
                 newLevel: neuesLevel(level, correct, Math.max(1,total), 8) });
        return;
      }
      // ab und zu absichtlich wiederholen, damit "gleich" vorkommt
      let t;
      if (i >= nBack && Math.random() < 0.4) t = verlauf[i-nBack];
      else t = tiere[zufall(0, tiere.length-1)];
      verlauf.push(t); i++;
      tier.innerHTML = Art.bild(t); FX.anim(tier, 'guckt', 450); Audio.blubb();
      busy = false;
      if (i <= nBack) spaeter(zeige, 1300); // Startbilder nur zeigen
      else { info.textContent = frageText; auswahl.classList.remove('wartet'); }
    }
    zeige();
  }

  // ================================================================
  // 4) SORTIER-WIRBEL  (DCCS – kognitive Flexibilität)
  // ================================================================
  function sortierWirbel(feld, level, fertig, hud) {
    Audio.sprich('Sortiere den Edelstein. Achte auf die Regel oben, sie wechselt manchmal!');
    const farben = [['Rot','#e8504a'], ['Blau','#4a8fe8']];
    const formen = [['Kreis','kreis'], ['Stern','stern']];
    feld.innerHTML = '';
    const regelZeile = el('div', 'ansage regel');
    const wrap = el('div', 'buehne mitte');
    const karte = el('div', 'zauberstein');
    wrap.appendChild(karte);
    const auswahl = el('div', 'auswahl zwei');
    const b1 = el('button', 'wahl topf'); const b2 = el('button', 'wahl topf');
    auswahl.append(b1, b2);
    feld.append(regelZeile, wrap, auswahl);

    const runden = 12;
    let i = 0, correct = 0, busy = false;
    let nachFarbe = true, regelAlt = null;
    const wechselChance = Math.min(0.7, 0.25 + level * 0.06);
    let aktFarbe, aktForm;

    function neu() {
      hud.schritt(i, runden);
      if (i >= runden) {
        fertig({ correct, total: runden, bereich: 'aufmerksamkeit',
                 newLevel: neuesLevel(level, correct, runden, 8) });
        return;
      }
      i++; busy = false;
      [b1, b2].forEach(b => b.classList.remove('richtig', 'falsch'));
      if (i > 1 && Math.random() < wechselChance) nachFarbe = !nachFarbe;
      aktFarbe = zufall(0,1); aktForm = zufall(0,1);
      karte.innerHTML = Art.roh(Art.stein(formen[aktForm][1], farben[aktFarbe][1]));
      karte.getAnimations().forEach(a => a.cancel());
      FX.anim(karte, 'guckt', 400);
      if (nachFarbe !== regelAlt) {          // Regel neu oder gewechselt: deutlich zeigen
        regelZeile.innerHTML = nachFarbe ? 'Sortiere nach <b>FARBE</b>' : 'Sortiere nach <b>FORM</b>';
        const t = (k) => nachFarbe ? `<span class="klecks" style="background:${farben[k][1]}"></span><span>${farben[k][0]}</span>`
                                   : Art.roh(Art.stein(formen[k][1], '#b8bfc9')) + `<span>${formen[k][0]}</span>`;
        b1.innerHTML = t(0); b2.innerHTML = t(1);
        if (regelAlt !== null) { Audio.regel(); FX.anim(regelZeile, 'dreh', 600); FX.anim(auswahl, 'dreh', 600); Audio.sprich(nachFarbe ? 'Jetzt nach Farbe!' : 'Jetzt nach Form!'); }
        regelAlt = nachFarbe;
      }
    }
    function tipp(zielIdx, b) {
      if (busy) return; busy = true;
      const wert = nachFarbe ? aktFarbe : aktForm;
      const gut = zielIdx === wert;
      if (gut) correct++;
      // Stein fliegt in den gewählten Topf
      const von = karte.getBoundingClientRect(), zu = b.getBoundingClientRect();
      Audio.wusch();
      if (karte.animate && !FX.ruhig()) karte.animate([{ transform: 'translate(0,0) scale(1)' },
        { transform: `translate(${zu.left + zu.width/2 - von.left - von.width/2}px, ${zu.top + zu.height/2 - von.top - von.height/2}px) scale(.25)`, opacity: .2 }],
        { duration: 300, easing: 'cubic-bezier(.5,0,.8,.4)', fill: 'forwards' });
      spaeter(() => {
        b.classList.add(gut ? 'richtig' : 'falsch');
        if (!gut) (wert === 0 ? b1 : b2).classList.add('richtig');
        feedback(gut, b, hud);
      }, 280);
      spaeter(neu, gut ? 800 : 1200);
    }
    b1.addEventListener('pointerdown', () => tipp(0, b1));
    b2.addEventListener('pointerdown', () => tipp(1, b2));
    neu();
  }

  // ================================================================
  // 5) ZAHLEN-FISCHEN  (Rechnen bis 100 – Lehrplan 21, 2. Klasse)
  // ================================================================
  function zahlenFischen(feld, level, fertig, hud) {
    Audio.sprich('Löse die Rechnung. Tippe den Fisch mit der richtigen Zahl.');
    feld.innerHTML = '';
    const frage = el('div', 'ansage rechnung');
    const teich = el('div', 'buehne teich');
    feld.append(frage, teich);
    const FISCHE = ['#ff9a3d', '#ff7eb6', '#ffd23f', '#8be38b', '#b79cf5', '#ff7a6b'];

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
      frage.innerHTML = `<span>${a}</span><span class="op">${op}</span><span>${b}</span><span class="op">=</span><span class="loesung">?</span>`;
      const loesung = frage.querySelector('.loesung');
      FX.anim(frage, 'guckt', 400);
      Audio.sprich(`${a} ${op === '+' ? 'plus' : 'minus'} ${b}`);

      const optionen = new Set([res]);
      while (optionen.size < 3) {
        const d = res + zufall(-9, 9);
        if (d >= 0 && d !== res) optionen.add(d);
      }
      teich.innerHTML = '';
      const farben = misch(FISCHE);
      const knoepfe = misch([...optionen]).map((z, k) => {
        const f = el('button', 'fisch-knopf f' + k);
        f.innerHTML = `<span class="schwimm">${Art.roh(Art.fisch(farben[k]))}<b class="zahl">${z}</b></span>`;
        f.dataset.z = z;
        f.addEventListener('pointerdown', () => {
          if (busy) return; busy = true;
          loesung.textContent = res; loesung.classList.add('da');
          if (z === res) {
            f.classList.add('richtig'); correct++; Audio.platsch(); feedback(true, f, hud);
            FX.funkenAn(f, { typ: 'blase', n: 10, farben: ['#fff', '#d8f6ff'], g: -260, kraft: 160 });
          } else {
            f.classList.add('falsch'); feedback(false, f, hud);
            knoepfe.find(x => +x.dataset.z === res).classList.add('richtig');
          }
          spaeter(next, z === res ? 950 : 1500);
        });
        teich.appendChild(f);
        return f;
      });
    }
    function next() {
      hud.schritt(i, runden);
      i++;
      if (i > runden) { fertig({ correct, total: runden, bereich: 'rechnen', newLevel: neuesLevel(level, correct, runden, 4) }); return; }
      aufgabe();
    }
    next();
  }

  // ================================================================
  // 6) WÖRTER-ANGEL  (Lesen – Sichtwortschatz, Schweizer «ss»)
  // ================================================================
  function woerterAngel(feld, level, fertig, hud) {
    Audio.sprich('Lies das Wort. Tippe das passende Bild.');
    const paare = [
      ['Hund','hund'],['Katze','katze'],['Maus','maus'],['Fisch','fisch'],['Baum','baum'],
      ['Haus','haus'],['Ball','ball'],['Apfel','apfel'],['Blume','blume'],['Auto','auto'],
      ['Sonne','sonne'],['Mond','mond'],['Stern','stern'],['Herz','herz'],['Kuh','kuh'],
      ['Nuss','nuss'],['Schloss','schloss'],['Hut','hut'],['Brot','brot'],['Vogel','vogel'],
      ['Biene','biene'],['Frosch','frosch'],['Igel','igel'],['Pilz','pilz'],['Schaf','schaf'],
    ];
    feld.innerHTML = '';
    const wortBox = el('div', 'buehne mitte');
    const schild = el('div', 'wort-schild');
    const wort = el('div', 'wort', ''); schild.appendChild(wort); wortBox.appendChild(schild);
    const auswahl = el('div', 'auswahl bilder');
    feld.append(wortBox, auswahl);

    const runden = 10;
    const anzahlBilder = level >= 3 ? 4 : 3; // mehr Ablenker mit Level
    let i = 0, correct = 0, busy = false, letztes = null;

    function next() {
      hud.schritt(i, runden);
      i++;
      if (i > runden) { fertig({ correct, total: runden, bereich: 'lesen', newLevel: neuesLevel(level, correct, runden, 6) }); return; }
      busy = false;
      let ziel;
      do { ziel = paare[zufall(0, paare.length-1)]; } while (ziel === letztes);
      letztes = ziel;
      wort.textContent = ziel[0];
      FX.anim(schild, 'schaukel', 900);
      Audio.sprich(ziel[0]);
      const optionen = new Set([ziel]);
      while (optionen.size < anzahlBilder) optionen.add(paare[zufall(0, paare.length-1)]);
      auswahl.className = 'auswahl bilder ' + (anzahlBilder >= 4 ? 'vier' : 'drei');
      auswahl.innerHTML = '';
      const knoepfe = misch([...optionen]).map((p, k) => {
        const b = el('button', 'wahl bild'); b.innerHTML = Art.bild(p[1]);
        b.style.animationDelay = (k * 70) + 'ms';
        b.addEventListener('pointerdown', () => {
          if (busy) return; busy = true;
          if (p[0] === ziel[0]) { b.classList.add('richtig'); correct++; feedback(true, b, hud); }
          else { b.classList.add('falsch'); feedback(false, b, hud); knoepfe.find(x => x.dataset.w === ziel[0]).classList.add('richtig'); }
          spaeter(next, p[0] === ziel[0] ? 900 : 1500);
        });
        b.dataset.w = p[0];
        auswahl.appendChild(b);
        return b;
      });
    }
    next();
  }

  // ================================================================
  // 7) FINDE-MICH  (visuelles Suchen – selektive Aufmerksamkeit)
  // ================================================================
  function findeMich(feld, level, fertig, hud) {
    Audio.sprich('Finde den Fisch, der genau so aussieht, und tippe ihn an.');
    // Zierfische unterscheiden sich in Körperfarbe, Musterfarbe und Muster.
    // Höheres Level = ähnlichere Ablenker.
    const FL = ['#ff7eb6', '#7ad7ff', '#ffd23f', '#8be38b', '#b79cf5', '#ff9a3d'];
    const PK = ['#ffffff', '#1b2f5e', '#ff5a5a', '#3f6fd9'];
    const zeichne = (s) => Art.roh(Art.zierfisch(FL[s[0]], PK[s[1]], s[2]));
    const gleich = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

    feld.innerHTML = '';
    const kopf = el('div', 'ansage finde');
    kopf.innerHTML = '<span>Finde:</span><span class="ziel-bild"></span>';
    const zielBild = kopf.querySelector('.ziel-bild');
    const wrap = el('div', 'buehne mitte');
    const raster = el('div', 'finde-raster');
    wrap.appendChild(raster);
    feld.append(kopf, wrap);

    const runden = 8;
    let i = 0, correct = 0, busy = false;

    function ablenker(ziel) {
      let s;
      do {
        const nah = level >= 5 ? true : level >= 3 ? Math.random() < 0.5 : false;
        s = nah ? [ziel[0], zufall(0, PK.length - 1), zufall(0, 2)] : [zufall(0, FL.length - 1), zufall(0, PK.length - 1), zufall(0, 2)];
        if (!nah && level < 3 && s[0] === ziel[0]) continue;   // leicht: immer andere Flügelfarbe
      } while (gleich(s, ziel) || (level < 3 && s[0] === ziel[0]));
      return s;
    }

    function next() {
      hud.schritt(i, runden);
      i++;
      if (i > runden) { fertig({ correct, total: runden, bereich: 'aufmerksamkeit', newLevel: neuesLevel(level, correct, runden, 8) }); return; }
      busy = false;
      const spalten = Math.min(5, 3 + Math.floor(level/2));
      const anzahl = spalten * (spalten - (spalten>4?1:0));
      raster.style.gridTemplateColumns = `repeat(${spalten},1fr)`;
      raster.classList.toggle('viele', anzahl > 16);
      const ziel = [zufall(0, FL.length - 1), zufall(0, PK.length - 1), zufall(0, 2)];
      zielBild.innerHTML = zeichne(ziel); FX.anim(zielBild, 'guckt', 400);
      raster.innerHTML = '';
      const zielPos = zufall(0, anzahl - 1);
      const zellen = [];
      for (let k = 0; k < anzahl; k++) {
        const z = el('button', 'falter');
        z.innerHTML = zeichne(k === zielPos ? ziel : ablenker(ziel));
        z.style.animationDelay = (-Math.random() * 2).toFixed(2) + 's';
        z.addEventListener('pointerdown', () => {
          if (busy) return; busy = true;
          if (k === zielPos) { correct++; z.classList.add('richtig'); feedback(true, z, hud); }
          else { z.classList.add('falsch'); zellen[zielPos].classList.add('richtig'); feedback(false, z, hud); }
          spaeter(next, k === zielPos ? 750 : 1400);
        });
        zellen.push(z); raster.appendChild(z);
      }
    }
    next();
  }

  // ================================================================
  // 8) TIER-GESCHICHTEN  (Zuhören + Merken + genau Hinschauen)
  //    Wie in der Schule: Bilder ansehen, Geschichte hören,
  //    dann jedem Tier den richtigen Namen geben.
  // ================================================================
  function tierGeschichten(feld, level, fertig, hud) {
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
      k.innerHTML = Geschichten.tierSVG(t, auswahl[runde].szene);   // Hintergrund passend zur Geschichte
      if (mitSlot) k.append(el('div', 'slot', '?'));
      return k;
    }

    // ---- Phase 1: Bilder ansehen + Geschichte hören ----
    function hoerPhase() {
      const g = auswahl[runde];
      Music.stop();                           // Musik aus, damit man gut zuhören kann
      feld.innerHTML = '';
      hud.schritt(runde * 2, runden * 2);
      feld.append(el('div', 'ansage', g.titel));
      feld.append(el('p', 'hinweis-hell', 'Schau dir die Tiere an und hör gut zu. Merke dir, wie jedes Tier heisst!'));

      // Bilder zuerst – wie der Zettel, der beim Zuhören vor dem Kind liegt
      const raster = el('div', 'tier-raster kompakt');
      misch(g.tiere.map((t, i) => i)).forEach(i => raster.append(karte(g.tiere[i], i, false)));
      feld.append(raster);

      const text = el('div', 'geschichte-text', g.text);
      if (!textSichtbar) text.hidden = true;

      const knoepfe = el('div', 'reihe mitte');
      const nochmal = knopf('Nochmal hören', 'ohr', 'zweit klein');
      nochmal.addEventListener('pointerdown', () => Audio.sprich(g.text));
      knoepfe.append(nochmal);
      if (!textSichtbar) {
        const zeig = knopf('Text zeigen', null, 'zweit klein');
        zeig.addEventListener('pointerdown', () => { text.hidden = !text.hidden; });
        knoepfe.append(zeig);
      }
      feld.append(knoepfe, text);

      const weiter = knopf('Ich habe zugehört', 'play', 'gross');
      weiter.addEventListener('pointerdown', () => { Audio.stopp(); Audio.tipp(); zuordnen(); });
      feld.append(weiter);

      Audio.sprich(`${g.titel}. ${g.text}`);
    }

    // ---- Phase 2: Namen zuordnen (wie das Prüfungsblatt) ----
    function zuordnen() {
      const g = auswahl[runde];
      Music.play('spiel');
      feld.innerHTML = '';
      hud.schritt(runde * 2 + 1, runden * 2);
      feld.append(el('div', 'ansage', 'Wie heissen die Tiere?'));
      Audio.sprich('Wie heissen die Tiere? Tippe einen Namen und dann das passende Tier.');

      const chips = el('div', 'namen-chips');
      const raster = el('div', 'tier-raster');
      const pruefen = knopf('Prüfen', 'haken', 'gross');
      pruefen.disabled = true;
      feld.append(el('p', 'hinweis-hell', 'Tippe einen Namen und dann das passende Tier.'));
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
          else k.querySelector('.slot').textContent = g.tiere[i].name;   // richtige Lösung zeigen
        });
        correct += richtig; total += g.tiere.length;
        if (richtig === g.tiere.length) { Audio.jubel(); FX.konfetti(50); hud.nala('froh'); } else Audio.richtig();
        karten.forEach(k => { if (k.classList.contains('richtig')) FX.funkenAn(k, { n: 8 }); });
        const lob = richtig === g.tiere.length ? 'Alle richtig – super zugehört!'
                  : richtig >= g.tiere.length / 2 ? 'Gut gemacht! Schau dir die gelben Karten nochmal an.'
                  : 'Das war schwierig. Beim nächsten Mal klappt es besser!';
        chips.innerHTML = '';
        chips.append(el('div', 'ansage', `${richtig} von ${g.tiere.length} richtig`));
        Audio.sprich(`${richtig} von ${g.tiere.length} richtig. ${lob}`);
        pruefen.querySelector('span').textContent = runde + 1 < runden ? 'Nächste Geschichte' : 'Fertig';
        pruefen.disabled = false;
        pruefen.addEventListener('pointerdown', () => {
          Audio.tipp(); runde++;
          if (runde < runden) hoerPhase();
          else fertig({ correct, total, bereich: 'gedaechtnis', newLevel: neuesLevel(level, correct, total, 6) });
        }, { once: true });
        feld.insertBefore(el('p', 'hinweis-hell', lob), pruefen);
      });

      zeichne();
    }

    hoerPhase();
  }

  // ---------- Katalog: jedes Spiel ist ein Ort im Zauberwald ----------
  const katalog = [
    { id:'pilz',   name:'Perlen-Stopp',       ort:'Muschelriff',     bild:'muschel',  szene:'riff',     natur:'riff',    farbe:'#ff8fb8', bereich:'aufmerksamkeit', kurz:'Schnell tippen – aber nur die Muscheln!', spielen:pilzStopp },
    { id:'echo',   name:'Quallen-Echo',       ort:'Quallengarten',   bild:'qualle',   szene:'tiefsee',  natur:'tiefsee', farbe:'#b79cf5', bereich:'gedaechtnis',    kurz:'Merke dir, welche Quallen leuchten.', spielen:echo },
    { id:'gleich', name:'Gleich oder anders', ort:'Bullauge',        bild:'oktopus',  szene:'seegras',  natur:'seegras', farbe:'#a57be8', bereich:'gedaechtnis',    kurz:'Wer schwimmt vorbei? Gleich wie vorher?', spielen:gleichAnders },
    { id:'sort',   name:'Sortier-Wirbel',     ort:'Schatzbucht',     bild:'truhe',    szene:'schatz',   natur:'riff',    farbe:'#ffd23f', bereich:'aufmerksamkeit', kurz:'Sortiere nach Farbe oder Form – pass auf die Regel auf!', spielen:sortierWirbel },
    { id:'zahlen', name:'Zahlen-Fischen',     ort:'Fischschwarm',    bild:'fisch',    szene:'wasser',   natur:'wasser',  farbe:'#ff9a3d', bereich:'rechnen',        kurz:'Rechne und fange den richtigen Fisch.', spielen:zahlenFischen },
    { id:'woerter',name:'Wörter-Angel',       ort:'Korallengarten',  bild:'buch',     szene:'korallen', natur:'riff',    farbe:'#ff7e9a', bereich:'lesen',          kurz:'Lies das Wort und finde das Bild.', spielen:woerterAngel },
    { id:'finde',  name:'Finde-mich',         ort:'Lagune',          bild:'zierfisch',szene:'lagune',   natur:'seegras', farbe:'#19b8a6', bereich:'aufmerksamkeit', kurz:'Finde den gleichen Fisch.', spielen:findeMich },
    { id:'geschichte', name:'Tier-Geschichten', ort:'Erzähl-Grotte', bild:'wal',      szene:'grotte',   natur:'grotte',  farbe:'#4f8fe8', bereich:'gedaechtnis',    kurz:'Hör die Geschichte und merke dir die Namen.', spielen:tierGeschichten },
  ];

  function byId(id) { return katalog.find(g => g.id === id); }

  return { katalog, byId, abbrechen };
})();
