/* app.js – Bildschirme und Session-Ablauf.
   Ruhig, klares Ende, ohne Streaks/Zeitdruck/Push. Alles lokal. */

(() => {
  const app = document.getElementById('app');
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const daten = () => Store.get();

  // Nala mit Sprechblase – freundlich, liest den Text auch vor
  function nalaSagt(text, emoji = '🐿️', vorlesen = true) {
    const box = el('div', 'zentriert');
    box.style.display = 'flex'; box.style.flexDirection = 'column'; box.style.gap = '14px'; box.style.alignItems = 'center';
    box.append(el('div', 'nala', emoji));
    box.append(el('div', 'sprechblase', text));
    if (vorlesen) Audio.sprich(text);
    return box;
  }

  // Audio-Einstellungen aus Speicher laden
  Audio.setTon(daten().tonAn);
  Audio.setSprache(daten().spracheAn);
  Audio.setStimme(daten().stimmeName);
  Music.setEnabled(daten().musikAn);

  function leeren() { app.innerHTML = ''; Audio.stopp(); }

  // ============================================================
  // LOGIN / PROFILE (einfach, lokal, ohne Server)
  // ============================================================
  function loginScreen() {
    leeren();
    Music.play('menu');
    if (Store.profile().length === 0) { profilErstellenScreen(); return; }
    const s = el('div', 'screen');
    s.append(el('h1', 'zentriert', 'Nalas Waldschule'));
    s.append(el('div', 'sprechblase', 'Wer möchte heute üben?'));
    const grid = el('div', 'kacheln');
    Store.profile().forEach(p => {
      const k = el('div', 'kachel');
      k.append(el('span', 'emoji', p.avatar));
      const t = el('div');
      t.append(el('div', 'kachel-name', p.name));
      t.append(el('div', 'mini', `⭐ ${p.punkte} · Stufe ${1 + Math.floor(p.punkte/200)}`));
      k.append(t);
      k.addEventListener('pointerdown', () => { Audio.tipp(); Store.profilWaehlen(p.id); start(); });
      grid.append(k);
    });
    s.append(grid);
    const neu = el('button', 'knopf zweit', '➕ Neues Kind');
    neu.addEventListener('pointerdown', () => { Audio.tipp(); profilErstellenScreen(); });
    s.append(neu);
    app.append(s);
  }

  function profilErstellenScreen() {
    leeren();
    Music.play('menu');
    const s = el('div', 'screen');
    s.append(el('h1', 'zentriert', 'Neues Kind'));
    s.append(nalaSagt('Wie heisst du? Wähle ein Tier für dich.', '🐿️', false));

    const nameInput = el('input');
    nameInput.type = 'text'; nameInput.placeholder = 'Dein Name'; nameInput.maxLength = 20;
    nameInput.style.cssText = 'width:100%;min-height:60px;font-size:1.3rem;text-align:center;padding:10px 14px;border-radius:18px;border:3px solid #e6efe9;font-family:var(--font-titel);';
    s.append(nameInput);

    let gewaehlt = Store.AVATARE[0];
    const grid = el('div', 'album');
    const zellen = [];
    Store.AVATARE.forEach((av, i) => {
      const a = el('div', 'abzeichen', av);
      a.style.cursor = 'pointer';
      if (i === 0) a.style.outline = '4px solid var(--blatt)';
      a.addEventListener('pointerdown', () => {
        Audio.tipp(); gewaehlt = av;
        zellen.forEach(z => z.style.outline = 'none');
        a.style.outline = '4px solid var(--blatt)';
      });
      zellen.push(a); grid.append(a);
    });
    s.append(grid);

    const los = el('button', 'knopf gross', 'Los! ▶');
    los.addEventListener('pointerdown', () => {
      Audio.tipp();
      const name = nameInput.value.trim() || 'Kind';
      Store.profilErstellen(name, gewaehlt);
      start();
    });
    s.append(los);

    if (Store.profile().length > 0) {
      const zurueck = el('button', 'knopf zweit klein', '✕ Zurück');
      zurueck.addEventListener('pointerdown', () => { Audio.tipp(); loginScreen(); });
      s.append(zurueck);
    }
    app.append(s);
  }

  // Kopfzeile mit Profil, Punkten und Stufe
  function profilKopf() {
    const p = Store.aktivesProfil();
    const box = el('div', 'karte');
    box.style.cssText = 'display:flex;align-items:center;gap:14px;padding:14px 18px;';
    const av = el('div', null, p ? p.avatar : '🐿️'); av.style.fontSize = '2.4rem';
    const mitte = el('div'); mitte.style.flex = '1';
    mitte.append(el('div', null, p ? p.name : 'Gast'));
    mitte.append(el('div', 'mini', `⭐ ${Store.getPunkte()} Punkte · 🌟 Stufe ${Store.rang()}`));
    const wechseln = el('button', 'knopf zweit klein', '🔄');
    wechseln.title = 'Profil wechseln';
    wechseln.addEventListener('pointerdown', () => { Audio.tipp(); loginScreen(); });
    box.append(av, mitte, wechseln);
    return box;
  }

  // Avatar mit Fortschrittsring zur nächsten Stufe + Stufen-Abzeichen
  let ringId = 0;
  function avatarRing(p) {
    const punkte = p ? p.punkte : 0;
    const rang = 1 + Math.floor(punkte / 200);
    const prog = (punkte % 200) / 200;
    const wrap = el('div', 'avatar-ring');
    const R = 34, C = 2 * Math.PI * R, gid = 'ring' + (++ringId);
    wrap.innerHTML =
      `<svg width="76" height="76" viewBox="0 0 76 76">
         <circle cx="38" cy="38" r="${R}" fill="none" stroke="rgba(63,138,95,.12)" stroke-width="6"/>
         <circle cx="38" cy="38" r="${R}" fill="none" stroke="url(#${gid})" stroke-width="6" stroke-linecap="round"
                 stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C*(1-prog)).toFixed(1)}"/>
         <defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0" stop-color="#3f8a5f"/><stop offset="1" stop-color="#f7c948"/></linearGradient></defs>
       </svg>`;
    wrap.append(el('div', 'gesicht', p ? p.avatar : '🐿️'));
    wrap.append(el('div', 'stufe-badge', String(rang)));
    return wrap;
  }

  // Untere Navigation (Daumenzone)
  function tabbar(active) {
    const bar = el('div', 'tabbar');
    const mk = (id, icon, label, fn) => {
      const b = el('button', 'tabbtn' + (active === id ? ' aktiv' : ''));
      b.innerHTML = `<span class="ti">${icon}</span>`;
      b.append(document.createTextNode(label));
      b.addEventListener('pointerdown', () => { Audio.tipp(); fn(); });
      return b;
    };
    bar.append(
      mk('ueben', '🏡', 'Start', () => start()),
      mk('album', '🎖️', 'Album', () => albumZeigen()),
      mk('eltern', '👪', 'Eltern', () => pinAbfrage()),
    );
    return bar;
  }

  // Konfetti für Erfolgsmomente (Peak)
  function konfetti() {
    const farben = ['#3f8a5f', '#f7c948', '#e0894a', '#7c6cd8', '#4a7fe0'];
    const box = el('div', 'konfetti');
    for (let i = 0; i < 30; i++) {
      const s = el('i');
      s.style.left = Math.random() * 100 + '%';
      s.style.background = farben[i % farben.length];
      s.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
      s.style.animationDelay = (Math.random() * 0.3) + 's';
      box.append(s);
    }
    document.body.append(box);
    setTimeout(() => box.remove(), 3400);
  }

  // ============================================================
  // STARTBILDSCHIRM (Home)
  // ============================================================
  function start() {
    leeren();
    Music.play('menu');
    const p = Store.aktivesProfil();
    const punkte = Store.getPunkte();
    const s = el('div', 'screen hat-tabbar');

    // Hero-Kopf: Profil, Punkte (Wert betont), Fortschritt zur nächsten Stufe
    const hero = el('div', 'hero karte');
    hero.append(avatarRing(p));
    const info = el('div', 'info');
    info.append(el('div', 'name', p ? p.name : 'Gast'));
    const stat = el('div', 'punkte-stat');
    stat.append(el('span', 'punkte-num', String(punkte)));
    stat.append(el('span', 'punkte-lab', 'Punkte'));
    info.append(stat);
    const linie = el('div', 'fortschritt-linie'); const sp = el('span');
    sp.style.width = Math.round(((punkte % 200) / 200) * 100) + '%'; linie.append(sp); info.append(linie);
    info.append(el('div', 'mini', `Noch ${200 - (punkte % 200)} bis Stufe ${Store.rang() + 1}`));
    hero.append(info);
    const wechseln = el('button', 'icon-knopf', '🔄');
    wechseln.setAttribute('aria-label', 'Profil wechseln');
    wechseln.addEventListener('pointerdown', () => { Audio.tipp(); loginScreen(); });
    hero.append(wechseln);
    s.append(hero);

    // Primärer CTA
    const losKnopf = el('button', 'knopf gross', '▶  Heute üben');
    losKnopf.addEventListener('pointerdown', () => { Audio.tipp(); sessionStarten(); });
    s.append(losKnopf);

    // Einzelne Spiele – kategoriefarbig
    s.append(el('div', 'label', 'Einzelne Spiele'));
    const kacheln = el('div', 'kacheln');
    Games.katalog.forEach(g => {
      const k = el('div', 'kachel k-' + g.bereich);
      k.append(el('span', 'emoji', g.emoji));
      k.append(el('span', 'kachel-name', g.name));
      k.addEventListener('pointerdown', () => { Audio.tipp(); einzelspiel(g.id); });
      kacheln.append(k);
    });
    s.append(kacheln);

    app.append(s);
    app.append(tabbar('ueben'));
  }

  // ============================================================
  // SESSION: 3–4 Spiele nacheinander (10–15 Min.)
  // ============================================================
  function tagesAuswahl() {
    // Mischung: 1 Aufmerksamkeit + 1 Schulstoff + 1 Gedächtnis (+ optional)
    const auf = ['pilz','sort','finde'];
    const schule = ['zahlen','woerter'];
    const ged = ['echo','gleich'];
    const wahl = (arr) => arr[Math.floor(Math.random()*arr.length)];
    const liste = [wahl(auf), wahl(schule), wahl(ged), wahl(auf.concat(schule,ged))];
    // Duplikate direkt hintereinander vermeiden
    return liste.filter((id, i) => i === 0 || id !== liste[i-1]).slice(0, 4);
  }

  function sessionStarten() {
    const spiele = tagesAuswahl();
    const startZeit = Date.now();
    const bereichspunkte = {};
    let idx = 0;
    let punkteSession = 0;

    // Begrüssung durch Nala
    leeren();
    Music.play('intro');
    const intro = el('div', 'screen zentriert');
    intro.append(el('div', 'spacer'));
    intro.append(nalaSagt(`Schön, dass du übst! Heute spielen wir ${spiele.length} Spiele zusammen.`, '🐿️'));
    intro.append(el('div', 'spacer'));
    app.append(intro);

    setTimeout(naechstesSpiel, 2200);

    function naechstesSpiel() {
      if (idx >= spiele.length) { abschluss(); return; }
      const g = Games.byId(spiele[idx]);
      leeren();
      Music.play('spiel');
      const s = el('div', 'screen');

      const kopf = el('div', 'spiel-kopf');
      const titel = el('h2', null, `${g.emoji} ${g.name}`);
      const raus = el('button', 'knopf zweit klein', '✕');
      raus.addEventListener('pointerdown', () => { Audio.tipp(); if (confirmRuhig()) start(); });
      kopf.append(titel, raus);
      s.append(kopf);

      const dots = el('div', 'fortschritt');
      spiele.forEach((_, i) => {
        const p = el('div', 'punkt');
        if (i < idx) p.classList.add('fertig');
        if (i === idx) p.classList.add('aktiv');
        dots.append(p);
      });
      s.append(dots);

      const feld = el('div', 'karte'); feld.style.flex = '1'; feld.style.display = 'flex'; feld.style.flexDirection = 'column'; feld.style.gap = '14px';
      s.append(feld);
      app.append(s);

      const level = Store.startLevel(g.id); // Progression: nie leichter als der Fortschritts-Boden
      g.spielen(feld, level, (ergebnis) => {
        Store.setLevel(g.id, ergebnis.newLevel);
        bereichspunkte[ergebnis.bereich] = (bereichspunkte[ergebnis.bereich] || 0) + (ergebnis.correct || 0);
        const gained = (ergebnis.correct || 0) * 10;
        punkteSession += gained;
        Store.punkteGeben(gained);
        idx++;
        zwischenLob(naechstesSpiel, gained);
      });
    }

    function zwischenLob(weiter, gained) {
      if (idx >= spiele.length) { weiter(); return; }
      leeren();
      Music.play('intro');
      const s = el('div', 'screen zentriert');
      s.append(el('div', 'spacer'));
      s.append(nalaSagt(Audio.lob() + ' Kommst du mit zum nächsten Spiel?', '🐿️'));
      if (gained) s.append(el('div', 'punkte-plus', `+${gained} ⭐`));
      const k = el('button', 'knopf gross sonne', 'Weiter ▶');
      k.addEventListener('pointerdown', () => { Audio.tipp(); weiter(); });
      s.append(k);
      s.append(el('div', 'spacer'));
      app.append(s);
    }

    function abschluss() {
      const sek = Math.round((Date.now() - startZeit) / 1000);
      Store.sessionSpeichern(sek, spiele, bereichspunkte);
      const sticker = Store.abzeichenGeben();
      const bonus = 50; punkteSession += bonus;
      const pr = Store.punkteGeben(bonus); // enthält evtl. Stufenaufstieg
      Audio.jubel();
      Music.play('finale');

      leeren();
      konfetti();
      const s = el('div', 'screen zentriert');
      s.append(el('div', 'spacer'));
      s.append(nalaSagt(pr.aufgestiegen ? `Wow, neue Stufe ${pr.rang}! Ich bin stolz auf dich! 💛`
                                        : 'Du hast heute toll geübt. Ich bin stolz auf dich! 💛', '🎉'));
      const card = el('div', 'karte zentriert');
      card.style.display = 'flex'; card.style.flexDirection = 'column'; card.style.gap = 'var(--s3)'; card.style.alignItems = 'center';
      card.append(el('div', 'sticker-gross', sticker));
      card.append(el('div', 'label', 'Heute gesammelt'));
      card.append(el('div', 'punkte-plus', `+${punkteSession} ⭐`));
      // Fortschritt zur nächsten Stufe
      const linie = el('div', 'fortschritt-linie'); linie.style.width = '100%';
      const sp = el('span'); sp.style.width = Math.round(((pr.punkte % 200) / 200) * 100) + '%'; linie.append(sp);
      card.append(linie);
      card.append(el('div', 'mini', `Insgesamt ${pr.punkte} Punkte · Stufe ${pr.rang} · noch ${200 - (pr.punkte % 200)} bis Stufe ${pr.rang + 1}`));
      s.append(card);
      if (pr.aufgestiegen) Audio.sprich('Super! Du hast eine neue Stufe erreicht!');
      const fertig = el('button', 'knopf gross', '🏡 Zum Start');
      fertig.addEventListener('pointerdown', () => { Audio.tipp(); start(); });
      s.append(fertig);
      s.append(el('div', 'spacer'));
      app.append(s);
    }
  }

  // Ruhige Abbruch-Frage ohne Druck
  function confirmRuhig() { return window.confirm('Möchtest du aufhören?'); }

  // Einzelnes Spiel aus der Kachelwahl
  function einzelspiel(id) {
    const g = Games.byId(id);
    leeren();
    Music.play('spiel');
    const s = el('div', 'screen');
    const kopf = el('div', 'spiel-kopf');
    kopf.append(el('h2', null, `${g.emoji} ${g.name}`));
    const raus = el('button', 'knopf zweit klein', '✕');
    raus.addEventListener('pointerdown', () => { Audio.tipp(); start(); });
    kopf.append(raus);
    s.append(kopf);
    const feld = el('div', 'karte'); feld.style.flex = '1'; feld.style.display='flex'; feld.style.flexDirection='column'; feld.style.gap='14px';
    s.append(feld);
    app.append(s);

    const level = Store.startLevel(id);
    g.spielen(feld, level, (ergebnis) => {
      Store.setLevel(id, ergebnis.newLevel);
      Store.sessionSpeichern(0, [id], { [ergebnis.bereich]: ergebnis.correct || 0 });
      const gained = (ergebnis.correct || 0) * 10;
      const pr = Store.punkteGeben(gained);
      Audio.jubel();
      Music.play('finale');
      if (pr.aufgestiegen) konfetti();
      leeren();
      const e = el('div', 'screen zentriert');
      e.append(el('div', 'spacer'));
      e.append(nalaSagt(pr.aufgestiegen ? `Wow, neue Stufe ${pr.rang}!` : Audio.lob(), '🐿️'));
      const card = el('div', 'karte zentriert');
      card.style.display='flex'; card.style.flexDirection='column'; card.style.gap='var(--s2)'; card.style.alignItems='center';
      card.append(el('div', 'punkte-plus', `+${gained} ⭐`));
      card.append(el('p', 'mini', `Insgesamt ${pr.punkte} Punkte · Stufe ${pr.rang}`));
      e.append(card);
      const k = el('button', 'knopf gross', '🏡 Zum Start');
      k.addEventListener('pointerdown', () => { Audio.tipp(); start(); });
      e.append(k); e.append(el('div','spacer'));
      app.append(e);
    });
  }

  // ============================================================
  // ALBUM
  // ============================================================
  function albumZeigen() {
    leeren();
    Music.play('menu');
    const s = el('div', 'screen hat-tabbar');
    s.append(el('h1', null, 'Mein Album'));

    const prof = Store.aktivesProfil() || { abzeichen: [] };
    const stat = el('div', 'hero karte');
    stat.append(avatarRing(Store.aktivesProfil()));
    const info = el('div', 'info');
    info.append(el('div', 'name', `${prof.abzeichen.length} Abzeichen`));
    info.append(el('div', 'mini', `⭐ ${Store.getPunkte()} Punkte · Stufe ${Store.rang()}`));
    stat.append(info);
    s.append(stat);

    const grid = el('div', 'album');
    const total = Math.max(16, Math.ceil(prof.abzeichen.length / 8) * 8);
    for (let i = 0; i < total; i++) {
      const a = el('div', 'abzeichen');
      if (prof.abzeichen[i]) a.textContent = prof.abzeichen[i];
      else { a.classList.add('leer'); a.textContent = '·'; }
      grid.append(a);
    }
    s.append(grid);
    app.append(s);
    app.append(tabbar('album'));
  }

  // ============================================================
  // ELTERN-BEREICH (PIN-geschützt)
  // ============================================================
  function pinAbfrage() {
    leeren();
    const s = el('div', 'screen zentriert');
    s.append(el('div', 'spacer'));
    s.append(el('h2', null, '👪 Eltern-Bereich'));
    s.append(el('p', 'hinweis', 'Bitte PIN eingeben.'));
    const anzeige = el('div', 'pin-feld', ''); s.append(anzeige);
    let eingabe = '';
    const tasten = el('div', 'pin-tasten');
    ['1','2','3','4','5','6','7','8','9','←','0','OK'].forEach(t => {
      const b = el('button', 'knopf zweit', t);
      b.addEventListener('pointerdown', () => {
        Audio.tipp();
        if (t === '←') eingabe = eingabe.slice(0, -1);
        else if (t === 'OK') { if (eingabe === daten().pin) elternBereich(); else { anzeige.textContent = 'Falsch'; eingabe=''; return; } }
        else if (eingabe.length < 4) eingabe += t;
        anzeige.textContent = '•'.repeat(eingabe.length);
      });
      tasten.append(b);
    });
    s.append(tasten);
    const zurueck = el('button', 'knopf zweit klein', '✕ Zurück');
    zurueck.addEventListener('pointerdown', () => { Audio.tipp(); start(); });
    s.append(zurueck);
    s.append(el('div', 'spacer'));
    app.append(s);
  }

  function elternBereich() {
    leeren();
    const d = daten();
    const p = Store.aktivesProfil() || { name:'-', sessions:[], statsProBereich:{aufmerksamkeit:0,gedaechtnis:0,rechnen:0,lesen:0}, punkte:0 };
    const s = el('div', 'screen');
    const kopf = el('div', 'spiel-kopf');
    kopf.append(el('h2', null, '👪 Eltern-Bereich'));
    const raus = el('button', 'knopf zweit klein', '✕');
    raus.addEventListener('pointerdown', () => { Audio.tipp(); start(); });
    kopf.append(raus); s.append(kopf);

    s.append(el('p', 'mini', `Aktives Profil: ${p.avatar || ''} ${p.name} · ⭐ ${p.punkte} Punkte · Stufe ${Store.rang()}`));

    // Trainingszeit
    const heute0 = new Date(); heute0.setHours(0,0,0,0);
    const heuteSek = p.sessions.filter(x => x.datum >= heute0.getTime()).reduce((a,b)=>a+(b.sekunden||0),0);
    const wocheSek = p.sessions.filter(x => x.datum >= Date.now()-7*864e5).reduce((a,b)=>a+(b.sekunden||0),0);
    const info = el('div', 'karte');
    info.append(el('h3', null, '⏱️ Trainingszeit'));
    info.append(zeile('Heute', minText(heuteSek)));
    info.append(zeile('Diese Woche', minText(wocheSek)));
    info.append(zeile('Sessions gesamt', String(p.sessions.length)));
    s.append(info);
    s.append(el('p', 'mini', 'Richtwert (Pro Juventute): max. 60 Min./Tag Bildschirmzeit für 6–9 Jahre. Empfehlung: 10–15 Min., 3–4× pro Woche.'));

    // Fortschritt je Bereich
    const fort = el('div', 'karte');
    fort.append(el('h3', null, '📈 Geübt je Bereich'));
    const bez = { aufmerksamkeit:'Aufmerksamkeit', gedaechtnis:'Gedächtnis', rechnen:'Rechnen', lesen:'Lesen' };
    const max = Math.max(1, ...Object.values(p.statsProBereich));
    for (const b in bez) {
      fort.append(el('p', 'mini', bez[b]));
      const bal = el('div', 'balken'); const sp = el('span'); sp.style.width = Math.round((p.statsProBereich[b]/max)*100)+'%'; bal.append(sp); fort.append(bal);
    }
    fort.append(el('p', 'mini', 'Punkte und Stufe motivieren – bewusst ohne Vergleich mit anderen Kindern.'));
    s.append(fort);

    // Profile verwalten
    const prof = el('div', 'karte');
    prof.append(el('h3', null, '👧 Profile'));
    Store.profile().forEach(pr => {
      const z = el('div', 'zeile');
      const links = el('span', null, `${pr.avatar} ${pr.name}` + (pr.id === Store.aktivId() ? '  (aktiv)' : ''));
      const rechts = el('div', 'reihe');
      const w = el('button','knopf zweit klein','Wählen');
      w.addEventListener('pointerdown', ()=>{ Store.profilWaehlen(pr.id); elternBereich(); });
      const l = el('button','knopf zweit klein','🗑️');
      l.addEventListener('pointerdown', ()=>{ if(window.confirm(`Profil "${pr.name}" mit allen Fortschritten löschen?`)){ Store.profilLoeschen(pr.id); if(!Store.aktivesProfil()){ loginScreen(); } else elternBereich(); } });
      rechts.append(w, l); z.append(links, rechts); prof.append(z);
    });
    const neu = el('button','knopf zweit klein','➕ Neues Kind');
    neu.addEventListener('pointerdown', ()=>{ Audio.tipp(); profilErstellenScreen(); });
    prof.append(neu);
    s.append(prof);

    // Schwierigkeitsstufen (Transparenz)
    const lvl = el('div', 'karte');
    lvl.append(el('h3', null, '🎚️ Aktuelle Stufen'));
    Games.katalog.forEach(g => lvl.append(zeile(`${g.emoji} ${g.name}`, 'Stufe ' + Store.getLevel(g.id))));
    s.append(lvl);

    // Einstellungen
    const set = el('div', 'karte');
    set.append(el('h3', null, '⚙️ Einstellungen'));
    // Name des aktiven Profils ändern
    const nameRow = el('div', 'reihe mitte');
    const nameInput = el('input'); nameInput.type='text'; nameInput.placeholder='Name des Kindes'; nameInput.value = p.name || '';
    nameInput.style.cssText='flex:1;min-height:52px;font-size:1.1rem;padding:8px 12px;border-radius:12px;border:2px solid #e6efe9;';
    const nameBtn = el('button','knopf zweit klein','Speichern');
    nameBtn.addEventListener('pointerdown', () => { if (Store.aktivesProfil()) { Store.aktivesProfil().name = nameInput.value.trim().slice(0,20) || 'Kind'; Store.speichern(); nameBtn.textContent='✓'; } });
    nameRow.append(nameInput, nameBtn); set.append(nameRow);
    // Ton / Sprache
    set.append(schalter('🔊 Töne', d.tonAn, (v)=>{ d.tonAn=v; Audio.setTon(v); Store.speichern(); }));
    set.append(schalter('🗣️ Vorlesen', d.spracheAn, (v)=>{ d.spracheAn=v; Audio.setSprache(v); Store.speichern(); }));
    set.append(schalter('🎵 Musik', d.musikAn, (v)=>{ d.musikAn=v; Music.setEnabled(v); Store.speichern(); }));
    // Stimme fürs Vorlesen wählen (falls Gerätestimmen abrufbar sind)
    const stimmenListe = Audio.stimmen ? Audio.stimmen() : [];
    if (stimmenListe.length) {
      const row = el('div'); row.style.margin = '12px 0 4px';
      row.append(el('div', 'mini', '🎙️ Stimme fürs Vorlesen'));
      const sel = el('select');
      sel.style.cssText = 'width:100%;min-height:52px;font-size:1rem;margin-top:6px;padding:8px 12px;border-radius:14px;border:2px solid var(--accent-08);background:var(--card);color:var(--ink);';
      const auto = el('option'); auto.value = ''; auto.textContent = 'Automatisch (beste Stimme)'; sel.append(auto);
      stimmenListe.forEach(v => { const o = el('option'); o.value = v.name; o.textContent = v.name + (v.lokal ? '' : ' ☁️'); if (v.name === d.stimmeName) o.selected = true; sel.append(o); });
      sel.addEventListener('change', () => { d.stimmeName = sel.value; Audio.setStimme(sel.value); Store.speichern(); Audio.sprich('Hallo, ich bin Nala. Wollen wir zusammen üben?'); });
      row.append(sel);
      const test = el('button', 'knopf zweit klein', '▶ Stimme testen'); test.style.marginTop = '8px';
      test.addEventListener('pointerdown', () => { Audio.sprich('Hallo, ich bin Nala. Freust du dich aufs Üben?'); });
      row.append(test);
      row.append(el('div', 'mini', 'Tipp: Für eine natürliche Stimme auf dem Gerät „Google Sprachausgabe" (Android) installieren bzw. am iPhone unter Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen eine „Premium/Enhanced"-Stimme laden.'));
      set.append(row);
    }
    // PIN ändern
    const pinRow = el('div','reihe mitte');
    const pinInput = el('input'); pinInput.type='tel'; pinInput.maxLength=4; pinInput.placeholder='Neue PIN (4 Ziffern)';
    pinInput.style.cssText='flex:1;min-height:52px;font-size:1.1rem;padding:8px 12px;border-radius:12px;border:2px solid var(--sand-tief);';
    const pinBtn = el('button','knopf zweit klein','PIN setzen');
    pinBtn.addEventListener('pointerdown', () => { if(/^\d{4}$/.test(pinInput.value)){ d.pin=pinInput.value; Store.speichern(); pinBtn.textContent='✓'; pinInput.value=''; } else pinBtn.textContent='4 Ziffern!'; });
    pinRow.append(pinInput, pinBtn); set.append(pinRow);
    // Alle Daten löschen (alle Profile)
    const resetBtn = el('button','knopf zweit klein','🗑️ Alle Profile & Daten löschen');
    resetBtn.addEventListener('pointerdown', () => {
      if(window.confirm('Wirklich ALLE Profile und Fortschritte löschen?')){
        Store.profile().slice().forEach(pr => Store.profilLoeschen(pr.id));
        loginScreen();
      }
    });
    set.append(resetBtn);
    s.append(set);

    s.append(el('p','mini','Alle Daten bleiben nur auf diesem Gerät. Keine Cloud, keine Konten, keine Werbung.'));
    app.append(s);

    function zeile(l, r){ const z=el('div','zeile'); z.append(el('span',null,l), el('strong',null,r)); return z; }
    function minText(sek){ const m=Math.floor(sek/60), s2=sek%60; return m>0?`${m} Min ${s2} Sek`:`${s2} Sek`; }
    function schalter(label, an, cb){
      const row=el('div','reihe mitte'); row.style.justifyContent='space-between';
      row.append(el('span',null,label));
      const b=el('button','knopf zweit klein', an?'An ✓':'Aus');
      b.addEventListener('pointerdown', ()=>{ an=!an; b.textContent=an?'An ✓':'Aus'; cb(an); });
      row.append(b); return row;
    }
  }

  // Stimmen für Sprachausgabe evtl. verzögert laden
  if ('speechSynthesis' in window) window.speechSynthesis.getVoices();

  // Beim Start: Profil wählen/erstellen (einfaches Login), sonst direkt starten
  if (Store.aktivesProfil()) start(); else loginScreen();
})();
