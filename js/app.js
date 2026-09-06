/* app.js – Bildschirme und Session-Ablauf.
   Ruhig, klares Ende, ohne Streaks/Zeitdruck/Push. Alles lokal. */

(() => {
  const app = document.getElementById('app');
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const daten = () => Store.get();

  // Audio-Einstellungen aus Speicher laden
  Audio.setTon(daten().tonAn);
  Audio.setSprache(daten().spracheAn);

  function leeren() { app.innerHTML = ''; Audio.stopp(); }

  // ============================================================
  // STARTBILDSCHIRM
  // ============================================================
  function start() {
    leeren();
    const s = el('div', 'screen');
    const kopf = el('div', 'zentriert');
    kopf.append(el('div', 'nala', '🐿️'));
    kopf.append(el('h1', null, 'Nalas Waldschule'));
    const gruss = daten().spitzname ? `Hallo ${daten().spitzname}!` : 'Schön, dass du da bist!';
    kopf.append(el('p', 'gross', gruss));
    s.append(kopf);

    const losKnopf = el('button', 'knopf gross', '▶  Heute üben');
    losKnopf.addEventListener('pointerdown', () => { Audio.tipp(); sessionStarten(); });
    s.append(losKnopf);

    // Freie Spielwahl (optional, ohne Druck)
    s.append(el('p', 'hinweis zentriert', 'Oder ein einzelnes Spiel wählen:'));
    const kacheln = el('div', 'kacheln');
    Games.katalog.forEach(g => {
      const k = el('div', 'kachel');
      k.append(el('span', 'emoji', g.emoji));
      k.append(document.createTextNode(g.name));
      k.addEventListener('pointerdown', () => { Audio.tipp(); einzelspiel(g.id); });
      kacheln.append(k);
    });
    s.append(kacheln);

    s.append(el('div', 'spacer'));
    const fuss = el('div', 'reihe mitte');
    const album = el('button', 'knopf zweit klein', '🎖️ Album');
    album.addEventListener('pointerdown', () => { Audio.tipp(); albumZeigen(); });
    const eltern = el('button', 'knopf zweit klein', '👪 Eltern');
    eltern.addEventListener('pointerdown', () => { Audio.tipp(); pinAbfrage(); });
    fuss.append(album, eltern);
    s.append(fuss);

    app.append(s);
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

    // Begrüssung durch Nala
    leeren();
    const intro = el('div', 'screen zentriert');
    intro.append(el('div', 'nala', '🐿️'));
    intro.append(el('h2', null, 'Bereit? Los geht\'s!'));
    intro.append(el('p', 'gross', `Heute üben wir ${spiele.length} Spiele.`));
    app.append(intro);
    Audio.sprich('Bereit? Los geht\'s!');

    setTimeout(naechstesSpiel, 1600);

    function naechstesSpiel() {
      if (idx >= spiele.length) { abschluss(); return; }
      const g = Games.byId(spiele[idx]);
      leeren();
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

      const level = Store.getLevel(g.id);
      g.spielen(feld, level, (ergebnis) => {
        Store.setLevel(g.id, ergebnis.newLevel);
        bereichspunkte[ergebnis.bereich] = (bereichspunkte[ergebnis.bereich] || 0) + (ergebnis.correct || 0);
        idx++;
        zwischenLob(naechstesSpiel);
      });
    }

    function zwischenLob(weiter) {
      if (idx >= spiele.length) { weiter(); return; }
      leeren();
      const s = el('div', 'screen zentriert');
      s.append(el('div', 'spacer'));
      s.append(el('div', 'nala', '🐿️'));
      s.append(el('h2', null, 'Super gemacht!'));
      s.append(el('p', 'gross', 'Weiter zum nächsten Spiel.'));
      const k = el('button', 'knopf gross', 'Weiter ▶');
      k.addEventListener('pointerdown', () => { Audio.tipp(); weiter(); });
      s.append(k);
      s.append(el('div', 'spacer'));
      app.append(s);
      Audio.sprich('Super gemacht!');
    }

    function abschluss() {
      const sek = Math.round((Date.now() - startZeit) / 1000);
      Store.sessionSpeichern(sek, spiele, bereichspunkte);
      const sticker = Store.abzeichenGeben();
      Audio.jubel();
      Audio.sprich('Du hast heute geübt. Das war toll!');

      leeren();
      const s = el('div', 'screen zentriert');
      s.append(el('div', 'spacer'));
      s.append(el('div', 'nala', '🎉'));
      s.append(el('h1', null, 'Fertig für heute!'));
      s.append(el('p', 'gross', 'Du hast drangeblieben – super!'));
      const card = el('div', 'karte zentriert');
      card.append(el('p', 'hinweis', 'Dein neues Abzeichen:'));
      const st = el('div', null, sticker); st.style.fontSize = '4rem';
      card.append(st);
      s.append(card);
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

    const level = Store.getLevel(id);
    g.spielen(feld, level, (ergebnis) => {
      Store.setLevel(id, ergebnis.newLevel);
      Store.sessionSpeichern(0, [id], { [ergebnis.bereich]: ergebnis.correct || 0 });
      Audio.jubel();
      leeren();
      const e = el('div', 'screen zentriert');
      e.append(el('div', 'spacer'));
      e.append(el('div', 'nala', '🐿️'));
      e.append(el('h2', null, 'Gut geübt!'));
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
    const s = el('div', 'screen');
    const kopf = el('div', 'spiel-kopf');
    kopf.append(el('h2', null, '🎖️ Mein Album'));
    const raus = el('button', 'knopf zweit klein', '✕');
    raus.addEventListener('pointerdown', () => { Audio.tipp(); start(); });
    kopf.append(raus); s.append(kopf);

    s.append(el('p', 'hinweis', `Du hast ${daten().abzeichen.length} Abzeichen gesammelt.`));
    const grid = el('div', 'album');
    const total = Math.max(16, Math.ceil(daten().abzeichen.length / 8) * 8);
    for (let i = 0; i < total; i++) {
      const a = el('div', 'abzeichen');
      if (daten().abzeichen[i]) a.textContent = daten().abzeichen[i];
      else { a.classList.add('leer'); a.textContent = '·'; }
      grid.append(a);
    }
    s.append(grid);
    app.append(s);
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
    const s = el('div', 'screen');
    const kopf = el('div', 'spiel-kopf');
    kopf.append(el('h2', null, '👪 Eltern-Bereich'));
    const raus = el('button', 'knopf zweit klein', '✕');
    raus.addEventListener('pointerdown', () => { Audio.tipp(); start(); });
    kopf.append(raus); s.append(kopf);

    // Trainingszeit
    const heute0 = new Date(); heute0.setHours(0,0,0,0);
    const heuteSek = d.sessions.filter(x => x.datum >= heute0.getTime()).reduce((a,b)=>a+(b.sekunden||0),0);
    const wocheSek = d.sessions.filter(x => x.datum >= Date.now()-7*864e5).reduce((a,b)=>a+(b.sekunden||0),0);
    const info = el('div', 'karte');
    info.append(el('h3', null, '⏱️ Trainingszeit'));
    info.append(zeile('Heute', minText(heuteSek)));
    info.append(zeile('Diese Woche', minText(wocheSek)));
    info.append(zeile('Sessions gesamt', String(d.sessions.length)));
    s.append(info);
    s.append(el('p', 'mini', 'Richtwert (Pro Juventute): max. 60 Min./Tag Bildschirmzeit für 6–9 Jahre. Empfehlung: 10–15 Min., 3–4× pro Woche.'));

    // Fortschritt je Bereich
    const fort = el('div', 'karte');
    fort.append(el('h3', null, '📈 Geübt je Bereich'));
    const bez = { aufmerksamkeit:'Aufmerksamkeit', gedaechtnis:'Gedächtnis', rechnen:'Rechnen', lesen:'Lesen' };
    const max = Math.max(1, ...Object.values(d.statsProBereich));
    for (const b in bez) {
      fort.append(el('p', 'mini', bez[b]));
      const bal = el('div', 'balken'); const sp = el('span'); sp.style.width = Math.round((d.statsProBereich[b]/max)*100)+'%'; bal.append(sp); fort.append(bal);
    }
    fort.append(el('p', 'mini', 'Bewusst ohne Ranking und ohne Vergleich mit anderen Kindern.'));
    s.append(fort);

    // Schwierigkeitsstufen (Transparenz)
    const lvl = el('div', 'karte');
    lvl.append(el('h3', null, '🎚️ Aktuelle Stufen'));
    Games.katalog.forEach(g => lvl.append(zeile(`${g.emoji} ${g.name}`, 'Stufe ' + Store.getLevel(g.id))));
    s.append(lvl);

    // Einstellungen
    const set = el('div', 'karte');
    set.append(el('h3', null, '⚙️ Einstellungen'));
    // Spitzname
    const nameRow = el('div', 'reihe mitte');
    const nameInput = el('input'); nameInput.type='text'; nameInput.placeholder='Spitzname (freiwillig)'; nameInput.value = d.spitzname;
    nameInput.style.cssText='flex:1;min-height:52px;font-size:1.1rem;padding:8px 12px;border-radius:12px;border:2px solid var(--sand-tief);';
    const nameBtn = el('button','knopf zweit klein','Speichern');
    nameBtn.addEventListener('pointerdown', () => { d.spitzname = nameInput.value.trim().slice(0,20); Store.speichern(); nameBtn.textContent='✓'; });
    nameRow.append(nameInput, nameBtn); set.append(nameRow);
    // Ton / Sprache
    set.append(schalter('🔊 Töne', d.tonAn, (v)=>{ d.tonAn=v; Audio.setTon(v); Store.speichern(); }));
    set.append(schalter('🗣️ Vorlesen', d.spracheAn, (v)=>{ d.spracheAn=v; Audio.setSprache(v); Store.speichern(); }));
    // PIN ändern
    const pinRow = el('div','reihe mitte');
    const pinInput = el('input'); pinInput.type='tel'; pinInput.maxLength=4; pinInput.placeholder='Neue PIN (4 Ziffern)';
    pinInput.style.cssText='flex:1;min-height:52px;font-size:1.1rem;padding:8px 12px;border-radius:12px;border:2px solid var(--sand-tief);';
    const pinBtn = el('button','knopf zweit klein','PIN setzen');
    pinBtn.addEventListener('pointerdown', () => { if(/^\d{4}$/.test(pinInput.value)){ d.pin=pinInput.value; Store.speichern(); pinBtn.textContent='✓'; pinInput.value=''; } else pinBtn.textContent='4 Ziffern!'; });
    pinRow.append(pinInput, pinBtn); set.append(pinRow);
    // Reset
    const resetBtn = el('button','knopf zweit klein','🗑️ Alle Daten löschen');
    resetBtn.addEventListener('pointerdown', () => { if(window.confirm('Wirklich alle Fortschritte löschen?')){ Store.reset(); start(); } });
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

  start();
})();
