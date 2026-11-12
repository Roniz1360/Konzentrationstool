/* app.js – Bildschirme und Ablauf.
   Rahmen: «Nalas Zauberwald» – eine Wanderung über die Weltkarte, jedes
   Minispiel ist ein Ort im Wald. Ruhig, klares Ende, ohne Streaks,
   Zeitdruck-Alarm oder Push. Alles bleibt lokal auf dem Gerät. */

(() => {
  const app = document.getElementById('app');
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const html = (tag, cls, inner) => { const e = el(tag, cls); e.innerHTML = inner; return e; };
  const daten = () => Store.get();

  // Tippen: erst kurz nach dem Bildschirmwechsel aktiv (verhindert versehentliche Doppel-Tipper)
  let schirmZeit = 0;
  function tap(e, fn) {
    e.addEventListener('click', (ev) => { if (performance.now() - schirmZeit < 320) return; Audio.tipp(); fn(ev); });
    return e;
  }
  function knopf(text, icon, cls, fn) {
    const b = el('button', 'knopf ' + (cls || ''));
    b.innerHTML = (icon ? Art.icon(icon) : '') + '<span></span>';
    b.querySelector('span').textContent = text;
    if (fn) tap(b, fn);
    return b;
  }

  // Audio-Einstellungen aus Speicher laden
  Audio.setTon(daten().tonAn);
  Audio.setSprache(daten().spracheAn);
  Audio.setStimme(daten().stimmeName);
  Music.setEnabled(daten().musikAn);
  Natur.setEnabled(daten().naturAn !== false);

  function leeren() {
    Games.abbrechen(); Audio.stopp();
    app.innerHTML = '';
    document.querySelectorAll('.dialog-huelle, .sticker-flieger').forEach((x) => x.remove());
    schirmZeit = performance.now();
  }
  // Neuer Bildschirm mit Hintergrund-Szene
  function schirm(cls, szene) {
    leeren();
    const s = el('div', 'screen ' + (cls || ''));
    if (szene) s.append(html('div', 'szene', Art.szene(szene)), ambiente(szene));
    app.append(s);
    return s;
  }
  // Lebendige Stimmung über der Szene: Glühwürmchen, Wolken, Blasen (wenige, leichte Ebenen)
  function ambiente(szene) {
    const a = el('div', 'ambiente');
    const z = (min, max) => min + Math.random() * (max - min);
    const neu = (cls, n, fn) => { for (let i = 0; i < n; i++) { const e = el('i', cls); fn(e, i); a.append(e); } };
    const hell = szene === 'wiese' || szene === 'blumen' || szene === 'bach';
    if (hell) {
      neu('wo', 2, (e, i) => { e.style.top = (4 + i * 9) + '%'; e.style.setProperty('--gr', (1.3 + i * 0.6).toFixed(1)); e.style.animationDuration = (70 + i * 30) + 's'; e.style.animationDelay = (-20 - i * 45) + 's'; });
      neu('po', 5, (e) => { e.style.left = z(5, 95) + '%'; e.style.top = z(45, 95) + '%'; e.style.animationDelay = -z(0, 9) + 's'; });
    } else if (szene === 'wasser') {
      neu('bl', 6, (e) => { e.style.left = z(5, 95) + '%'; e.style.animationDelay = -z(0, 9) + 's'; e.style.animationDuration = z(7, 12) + 's'; });
    } else {
      neu('gl', 8, (e) => { e.style.left = z(4, 96) + '%'; e.style.top = z(28, 92) + '%'; e.style.animationDelay = -z(0, 7) + 's'; e.style.animationDuration = z(5, 9) + 's'; });
    }
    return a;
  }
  const zeitSzene = () => ({ morgen: 'wiese', tag: 'wiese', abend: 'abend', nacht: 'feuer' })[Art.tageszeit()];

  // Nala mit Sprechblase – freundlich, liest den Text auch vor
  function nalaSagt(text, vorlesen = true, cls = '') {
    const box = el('div', 'nala-sagt ' + cls);
    box.append(el('div', 'sprechblase', text));
    box.append(html('div', 'nala-figur', Art.nala()));
    if (vorlesen) Audio.sprich(text);
    return box;
  }
  const sterneReihe = (n, cls = '') => html('div', 'sterne ' + cls, [0, 1, 2].map((i) => Art.sternSVG(i < n)).join(''));
  const funkenZahl = (n) => html('span', 'funken-zahl', Art.bild('funke') + `<b>${n}</b>`);

  // Ruhiger Dialog im Spiel-Stil (statt System-Fenster)
  function dialog(text, jaText, neinText, onJa) {
    const h = el('div', 'dialog-huelle');
    const d = el('div', 'dialog');
    d.append(html('div', 'dialog-nala', Art.nala()), el('p', null, text));
    const r = el('div', 'reihe');
    r.append(knopf(neinText, null, '', () => h.remove()), knopf(jaText, null, 'zweit', () => { h.remove(); onJa(); }));
    d.append(r); h.append(d); document.body.append(h);
  }

  // ============================================================
  // TITEL
  // ============================================================
  function titel() {
    const s = schirm('titel-screen', zeitSzene());
    Music.play('menu'); Natur.set(Art.tageszeit());
    s.append(html('h1', 'logo', '<span>Nalas</span><b>Zauberwald</b>'));
    s.append(html('div', 'titel-nala winkt', Art.nala()));
    s.append(knopf('Spielen', 'play', 'gross sonne puls', () => FX.wechsel(() => (Store.aktivesProfil() && Store.profile().length === 1 ? start() : loginScreen()))));
    s.append(el('div', 'titel-fuss', 'Konzentration · Rechnen · Lesen'));
  }

  // ============================================================
  // LOGIN / PROFILE (einfach, lokal, ohne Server)
  // ============================================================
  function loginScreen() {
    if (Store.profile().length === 0) { profilErstellenScreen(); return; }
    const s = schirm('menue-screen', zeitSzene());
    Music.play('menu'); Natur.set(Art.tageszeit());
    s.append(el('h1', 'titel-zeile', 'Wer spielt heute?'));
    const grid = el('div', 'profil-liste');
    Store.profile().forEach((p, i) => {
      const k = el('button', 'profil-karte');
      k.style.animationDelay = i * 70 + 'ms';
      k.append(html('span', 'avatar', Art.avatar(p.avatar)));
      const t = el('span', 'profil-info');
      t.append(el('b', null, p.name));
      t.append(html('span', 'mini', `Stufe ${1 + Math.floor(p.punkte / 200)} · ${p.punkte} Lichtfunken`));
      k.append(t);
      tap(k, () => { Store.profilWaehlen(p.id); FX.wechsel(start); });
      grid.append(k);
    });
    s.append(grid);
    s.append(knopf('Neues Kind', 'plus', 'zweit', profilErstellenScreen));
  }

  function profilErstellenScreen() {
    const s = schirm('menue-screen', zeitSzene());
    Music.play('menu'); Natur.set(Art.tageszeit());
    s.append(el('h1', 'titel-zeile', 'Wer bist du?'));
    const karte = el('div', 'tafel');
    const nameInput = el('input', 'eingabe');
    nameInput.type = 'text'; nameInput.placeholder = 'Dein Name'; nameInput.maxLength = 20;
    nameInput.setAttribute('aria-label', 'Dein Name');
    karte.append(nameInput);
    karte.append(el('p', 'label', 'Wähle dein Tier'));

    let gewaehlt = Store.AVATARE[0];
    const grid = el('div', 'avatar-wahl');
    Store.AVATARE.forEach((av, i) => {
      const a = html('button', 'avatar-knopf' + (i === 0 ? ' aktiv' : ''), Art.avatar(av));
      a.addEventListener('pointerdown', () => {
        Audio.plopp(1 + i * 0.04); gewaehlt = av;
        grid.querySelectorAll('.aktiv').forEach((z) => z.classList.remove('aktiv'));
        a.classList.add('aktiv');
      });
      grid.append(a);
    });
    karte.append(grid);
    s.append(karte);
    s.append(knopf('Los geht’s!', 'play', 'gross sonne', () => {
      Store.profilErstellen(nameInput.value.trim() || 'Kind', gewaehlt);
      FX.wechsel(start);
    }));
    if (Store.profile().length > 0) s.append(knopf('Zurück', null, 'zweit klein', loginScreen));
  }

  // Avatar mit Fortschrittsring zur nächsten Stufe + Stufen-Abzeichen
  function avatarRing(p) {
    const punkte = p ? p.punkte : 0;
    const prog = (punkte % 200) / 200;
    const R = 34, C = 2 * Math.PI * R;
    const wrap = html('div', 'avatar-ring',
      `<svg class="ring" viewBox="0 0 76 76"><circle cx="38" cy="38" r="${R}" fill="#fff8e6" stroke="rgba(74,53,38,.18)" stroke-width="6"/>
       <circle cx="38" cy="38" r="${R}" fill="none" stroke="#ffb52e" stroke-width="6" stroke-linecap="round" transform="rotate(-90 38 38)"
               stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - prog)).toFixed(1)}"/></svg>`);
    wrap.append(html('div', 'gesicht', Art.avatar(p ? p.avatar : 'nala')));
    wrap.append(el('div', 'stufe-badge', String(1 + Math.floor(punkte / 200))));
    return wrap;
  }

  // Untere Navigation (Daumenzone)
  function tabbar(active) {
    const bar = el('div', 'tabbar');
    const mk = (id, icon, label, fn) => {
      const b = html('button', 'tabbtn' + (active === id ? ' aktiv' : ''), Art.icon(icon) + `<span>${label}</span>`);
      tap(b, fn);
      return b;
    };
    bar.append(mk('karte', 'karte', 'Wald', () => start()), mk('album', 'album', 'Album', () => albumZeigen()), mk('eltern', 'eltern', 'Eltern', () => pinAbfrage()));
    return bar;
  }

  // ============================================================
  // WELTKARTE (Home)
  // ============================================================
  const ORTE = { pilz: [105, 385], echo: [314, 468], gleich: [110, 590], sort: [300, 690], zahlen: [120, 800], woerter: [300, 905], finde: [110, 1010], geschichte: [270, 1130] };
  let kartePos = null;   // gemerkte Scroll-Position

  function start() {
    const p = Store.aktivesProfil();
    if (!p) { loginScreen(); return; }
    const zeit = Art.tageszeit();
    const s = schirm('karte-screen zeit-' + zeit);
    Music.play('menu'); Natur.set(zeit);

    const scroll = el('div', 'karte-scroll');
    const karte = el('div', 'karte');
    const orte = Games.katalog.map((g) => ({ g, x: ORTE[g.id][0], y: ORTE[g.id][1] }));
    karte.innerHTML = Art.karte(zeit, orte);
    const H = Art.KARTE_H;

    // Nala wartet beim nächsten Ort ohne Sterne (sonst beim Baumhaus)
    const ziel = orte.find((o) => !Store.getSterne(o.g.id));
    orte.forEach((o, i) => {
      const n = Store.getSterne(o.g.id);
      const b = el('button', 'ort' + (n ? ' besucht' : '') + (ziel === o ? ' ziel' : ''));
      b.style.left = (o.x / 400 * 100) + '%'; b.style.top = (o.y / H * 100) + '%';
      b.style.setProperty('--farbe', o.g.farbe); b.style.animationDelay = (-i * 0.45) + 's';
      b.append(html('span', 'ort-bild', Art.bild(o.g.bild)), sterneReihe(n, 'ort-sterne'), el('span', 'ort-name', o.g.ort));
      b.setAttribute('aria-label', o.g.ort + ': ' + o.g.name);
      tap(b, () => ortKarte(o.g));
      karte.append(b);
    });
    const nx = ziel ? ziel.x + (ziel.x < 200 ? 78 : -78) : 262, ny = ziel ? ziel.y - 6 : 236;
    const nala = html('div', 'karte-nala', Art.nala());
    nala.style.left = (nx / 400 * 100) + '%'; nala.style.top = (ny / H * 100) + '%';
    if (ziel && ziel.x > 200) nala.classList.add('schaut-rechts');
    karte.append(nala);
    const amb = ambiente(zeit === 'nacht' || zeit === 'abend' ? 'wald' : 'wiese');
    amb.classList.add('karte-amb');
    karte.append(amb);
    scroll.append(karte);
    s.append(scroll);

    // Kopf: Profil, Lichtfunken, Sterne
    const kopf = el('div', 'kopf-hud');
    const prof = el('button', 'kopf-profil');
    prof.append(avatarRing(p));
    const info = el('span', 'kopf-info');
    info.append(el('b', null, p.name), el('span', 'mini', `Noch ${200 - (p.punkte % 200)} bis Stufe ${Store.rang() + 1}`));
    prof.append(info);
    prof.setAttribute('aria-label', 'Profil wechseln');
    tap(prof, loginScreen);
    kopf.append(prof);
    const zahlen = el('div', 'kopf-zahlen');
    zahlen.append(funkenZahl(p.punkte), html('span', 'funken-zahl', Art.sternSVG(true) + `<b>${Store.sterneGesamt()}</b>`));
    kopf.append(zahlen);
    s.append(kopf);

    // Fuss: Abenteuer starten + Navigation
    const fuss = el('div', 'fuss');
    fuss.append(knopf('Abenteuer starten', 'play', 'gross sonne puls', () => FX.wechsel(sessionStarten)));
    fuss.append(tabbar('karte'));
    s.append(fuss);

    // Zur richtigen Stelle scrollen
    requestAnimationFrame(() => {
      const k = karte.getBoundingClientRect().height;
      scroll.scrollTop = kartePos != null ? kartePos : Math.max(0, (ny / H) * k - scroll.clientHeight * 0.55);
    });
    scroll.addEventListener('scroll', () => { kartePos = scroll.scrollTop; }, { passive: true });
  }

  const BEREICH = { aufmerksamkeit: 'Aufmerksamkeit', gedaechtnis: 'Gedächtnis', rechnen: 'Rechnen', lesen: 'Lesen' };
  // Karte eines Ortes: was man dort spielt
  function ortKarte(g) {
    const h = el('div', 'dialog-huelle');
    const d = el('div', 'dialog ort-dialog');
    d.style.setProperty('--farbe', g.farbe);
    d.append(html('div', 'ort-gross', Art.bild(g.bild)));
    d.append(el('div', 'ort-ueber', g.ort), el('h2', null, g.name), el('p', null, g.kurz));
    const chips = el('div', 'reihe mitte');
    chips.append(el('span', 'marke', BEREICH[g.bereich]), el('span', 'marke', 'Stufe ' + Store.startLevel(g.id)));
    d.append(chips, sterneReihe(Store.getSterne(g.id), 'gross'));
    d.append(knopf('Spielen', 'play', 'gross sonne', () => { h.remove(); FX.wechsel(() => einzelspiel(g.id)); }));
    const zu = html('button', 'rund-knopf zu', Art.icon('x')); zu.setAttribute('aria-label', 'Schliessen');
    tap(zu, () => h.remove());
    d.append(zu); h.append(d);
    h.addEventListener('click', (e) => { if (e.target === h) h.remove(); });
    document.body.append(h);
    Audio.sprich(g.ort + '. ' + g.kurz);
  }

  // ============================================================
  // SPIEL-RAHMEN: Szene + Kopfleiste + Spielfeld
  // ============================================================
  function spielRahmen(g, beimVerlassen) {
    const s = schirm('spiel-screen sz-' + g.szene, g.szene);
    Music.play('spiel'); Natur.set(g.natur); Audio.serieNeu();
    const kopf = el('div', 'hud');
    const raus = html('button', 'rund-knopf', Art.icon('x')); raus.setAttribute('aria-label', 'Spiel verlassen');
    tap(raus, () => dialog('Möchtest du aufhören?', 'Aufhören', 'Weiterspielen', () => FX.wechsel(beimVerlassen)));
    const mitte = el('div', 'hud-mitte');
    mitte.append(el('div', 'hud-titel', g.name));
    const balken = html('div', 'hud-balken', '<span></span>' + Art.sternSVG(true));
    mitte.append(balken);
    const mini = html('div', 'hud-nala', Art.nala());
    kopf.append(raus, mitte, mini);
    const feld = el('div', 'feld');
    s.append(kopf, feld);
    const hud = {
      schritt(i, n) { balken.firstChild.style.transform = `scaleX(${Math.max(0.02, Math.min(1, i / n))})`; },
      nala(stimmung) { FX.anim(mini, stimmung, 700); },
    };
    hud.schritt(0, 1);
    return { feld, hud, s };
  }

  // Ergebnis nach einem Spiel: Sterne, Lichtfunken, Lob
  function ergebnis(g, erg, gained, pr, knopfText, weiter) {
    const n = Store.sterneFuer(erg.correct || 0, erg.total || 1);
    Store.sterneSetzen(g.id, n);
    const s = schirm('ergebnis-screen sz-' + g.szene, g.szene);
    Music.play('intro'); Natur.set(g.natur);
    const lob = pr.aufgestiegen ? `Wow, du bist jetzt auf Stufe ${pr.rang}!` : Audio.lob();
    s.append(el('div', 'spacer'));
    s.append(el('h1', 'titel-zeile', 'Geschafft!'));
    const st = sterneReihe(0, 'riesig'); s.append(st);
    s.append(nalaSagt(lob, true, 'jubelt'));
    const plus = html('div', 'plus-funken', Art.bild('funke') + `<b>+${gained}</b><span>Lichtfunken</span>`);
    s.append(plus);
    const k = knopf(knopfText, 'play', 'gross sonne', weiter);
    s.append(k, el('div', 'spacer'));
    // Sterne ploppen nacheinander auf
    for (let i = 0; i < n; i++) setTimeout(() => {
      if (!st.isConnected) return;
      st.children[i].outerHTML = Art.sternSVG(true);
      st.children[i].classList.add('plopp'); Audio.sternKlang(i); FX.funkenAn(st.children[i], { n: 10 });
    }, 350 + i * 420);
    if (pr.aufgestiegen) setTimeout(() => { if (st.isConnected) FX.konfetti(70); }, 400);
  }

  // ============================================================
  // ABENTEUER: 3–4 Orte nacheinander (10–15 Min.)
  // ============================================================
  function tagesAuswahl() {
    // Mischung: 1 Aufmerksamkeit + 1 Schulstoff + 1 Gedächtnis (+ optional)
    const auf = ['pilz', 'sort', 'finde'];
    const schule = ['zahlen', 'woerter'];
    const ged = ['echo', 'gleich', 'geschichte'];
    const wahl = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const liste = [wahl(auf), wahl(schule), wahl(ged)];
    const rest = auf.concat(schule, ged).filter((id) => !liste.includes(id));
    liste.push(wahl(rest));
    return liste;
  }

  function sessionStarten() {
    const spiele = tagesAuswahl();
    const startZeit = Date.now();
    const bereichspunkte = {};
    let idx = 0;
    let punkteSession = 0;

    // Begrüssung durch Nala: der Weg von heute
    const s = schirm('menue-screen', zeitSzene());
    Music.play('intro'); Natur.set(Art.tageszeit());
    s.append(el('div', 'spacer'));
    s.append(nalaSagt(`Schön, dass du da bist! Heute besuchen wir ${spiele.length} Orte im Zauberwald.`));
    const weg = el('div', 'weg');
    spiele.forEach((id, i) => { const g = Games.byId(id); const o = html('div', 'weg-ort', Art.bild(g.bild)); o.style.animationDelay = (300 + i * 160) + 'ms'; weg.append(o); });
    s.append(weg);
    s.append(knopf('Los geht’s!', 'play', 'gross sonne puls', () => FX.wechsel(naechstesSpiel)));
    s.append(knopf('Zurück', null, 'zweit klein', () => FX.wechsel(start)));
    s.append(el('div', 'spacer'));

    function naechstesSpiel() {
      if (idx >= spiele.length) { abschluss(); return; }
      const g = Games.byId(spiele[idx]);
      const { feld, hud } = spielRahmen(g, start);
      const level = Store.startLevel(g.id); // Progression: nie leichter als der Fortschritts-Boden
      g.spielen(feld, level, (erg) => {
        Store.setLevel(g.id, erg.newLevel);
        bereichspunkte[erg.bereich] = (bereichspunkte[erg.bereich] || 0) + (erg.correct || 0);
        const gained = (erg.correct || 0) * 10;
        punkteSession += gained;
        const pr = Store.punkteGeben(gained);
        idx++;
        const letztes = idx >= spiele.length;
        FX.wechsel(() => ergebnis(g, erg, gained, pr, letztes ? 'Zur Belohnung' : 'Weiter zum nächsten Ort', () => FX.wechsel(naechstesSpiel)));
      }, hud);
    }

    function abschluss() {
      const sek = Math.round((Date.now() - startZeit) / 1000);
      Store.sessionSpeichern(sek, spiele, bereichspunkte);
      const sticker = Store.abzeichenGeben();
      const bonus = 50; punkteSession += bonus;
      const pr = Store.punkteGeben(bonus); // enthält evtl. Stufenaufstieg

      const e = schirm('ergebnis-screen', zeitSzene());
      Music.play('finale'); Natur.set(Art.tageszeit());
      Audio.jubel(); FX.konfetti();
      e.append(el('div', 'spacer'));
      e.append(el('h1', 'titel-zeile', 'Abenteuer geschafft!'));
      e.append(nalaSagt(pr.aufgestiegen ? `Wow, neue Stufe ${pr.rang}! Ich bin stolz auf dich!`
                                        : 'Du hast heute toll geübt. Ich bin stolz auf dich!', true, 'jubelt'));
      const card = el('div', 'tafel zentriert');
      const stEl = html('div', 'sticker-gross', Art.avatar(sticker));
      card.append(el('div', 'label', 'Dein neuer Sticker'), stEl);
      card.append(html('div', 'plus-funken', Art.bild('funke') + `<b>+${punkteSession}</b><span>Lichtfunken</span>`));
      const linie = el('div', 'fortschritt-linie'); const sp = el('span'); sp.style.width = Math.round(((pr.punkte % 200) / 200) * 100) + '%'; linie.append(sp);
      card.append(linie, el('div', 'mini', `Stufe ${pr.rang} · noch ${200 - (pr.punkte % 200)} Lichtfunken bis Stufe ${pr.rang + 1}`));
      e.append(card);
      // Sticker selber ins Album kleben – er fliegt von hier an seinen Platz
      const neuIndex = (Store.aktivesProfil() || { abzeichen: [1] }).abzeichen.length - 1;
      const zumAlbum = () => albumZeigen({ neuIndex, von: stEl.getBoundingClientRect() });
      e.append(knopf('Ins Album kleben', 'album', 'gross sonne puls', zumAlbum));
      tap(stEl, zumAlbum);
      e.append(el('div', 'spacer'));
    }
  }

  // Einzelnes Spiel von der Karte
  function einzelspiel(id) {
    const g = Games.byId(id);
    const { feld, hud } = spielRahmen(g, start);
    const level = Store.startLevel(id);
    g.spielen(feld, level, (erg) => {
      Store.setLevel(id, erg.newLevel);
      Store.sessionSpeichern(0, [id], { [erg.bereich]: erg.correct || 0 });
      const gained = (erg.correct || 0) * 10;
      const pr = Store.punkteGeben(gained);
      FX.wechsel(() => { ergebnis(g, erg, gained, pr, 'Zurück zum Wald', () => FX.wechsel(start)); Audio.jubel(); });
    }, hud);
  }

  // ============================================================
  // ALBUM
  // ============================================================
  function albumZeigen(opt = {}) {
    const s = schirm('album-screen', zeitSzene());
    Music.play('menu'); Natur.set(Art.tageszeit());
    const neu = Number.isInteger(opt.neuIndex) ? opt.neuIndex : -1;
    const prof = Store.aktivesProfil() || { abzeichen: [] };
    const scroll = el('div', 'album-scroll');
    scroll.append(el('h1', 'titel-zeile', 'Mein Album'));
    const buch = el('div', 'tafel buch');
    buch.append(el('div', 'label', prof.abzeichen.length === 1 ? '1 Sticker gesammelt' : `${prof.abzeichen.length} Sticker gesammelt`));
    const grid = el('div', 'album');
    const total = Math.max(12, Math.ceil((prof.abzeichen.length + 1) / 4) * 4);
    let ziel = null;
    for (let i = 0; i < total; i++) {
      const a = el('div', 'abzeichen');
      a.style.setProperty('--dreh', [-4, 3, -2, 5, -5, 2, 4, -3][i % 8] + 'deg');  // leicht schief geklebt
      if (prof.abzeichen[i] && i !== neu) a.innerHTML = Art.avatar(prof.abzeichen[i]);
      else if (i === neu) { a.classList.add('leer', 'ziel'); ziel = a; }
      else a.classList.add('leer');
      grid.append(a);
    }
    buch.append(grid);
    if (!prof.abzeichen.length) buch.append(el('p', 'mini zentriert', 'Für jedes geschaffte Abenteuer bekommst du einen Sticker.'));
    scroll.append(buch);
    s.append(scroll);
    const fuss = el('div', 'fuss'); fuss.append(tabbar('album')); s.append(fuss);
    if (ziel) stickerFliegt(prof.abzeichen[neu], ziel, opt.von);
  }

  // Neuer Sticker fliegt in einem Bogen an seinen Platz im Album und «klebt» dort fest.
  function stickerFliegt(sticker, ziel, von) {
    const fertig = () => {
      if (!ziel.isConnected) return;
      ziel.classList.remove('leer', 'ziel');
      ziel.classList.add('neu');
      ziel.innerHTML = Art.avatar(sticker);
      Audio.klebt();
      FX.funkenAn(ziel, { n: 18 });
      setTimeout(() => { if (ziel.isConnected) Audio.sprich('Dein neuer Sticker klebt jetzt in deinem Album!'); }, 500);
    };
    ziel.scrollIntoView({ block: 'center', behavior: FX.ruhig() ? 'auto' : 'smooth' });
    if (FX.ruhig() || !Element.prototype.animate) { setTimeout(fertig, 300); return; }

    setTimeout(() => {
      if (!ziel.isConnected) return;
      const z = ziel.getBoundingClientRect();
      const st = von && von.width ? von : { left: innerWidth / 2 - 50, top: innerHeight / 2 - 50, width: 100, height: 100 };
      const sx = st.left + st.width / 2, sy = st.top + st.height / 2;
      const dx = z.left + z.width / 2 - sx, dy = z.top + z.height / 2 - sy;
      const flieger = html('div', 'sticker-flieger', Art.avatar(sticker));
      flieger.style.left = sx + 'px'; flieger.style.top = sy + 'px';
      document.body.append(flieger);
      const bogen = -Math.max(90, Math.abs(dx) * 0.4 + 60);   // Bogen nach oben
      const klein = (z.width * 0.84) / 110;                    // Endgrösse = Sticker im Album
      Audio.flug();
      const anim = flieger.animate([
        { transform: 'translate(-50%,-50%) scale(1.1) rotate(0deg)', offset: 0 },
        { transform: 'translate(-50%,-50%) scale(1.5) rotate(-12deg)', offset: 0.15 },
        { transform: `translate(calc(-50% + ${dx * 0.5}px), calc(-50% + ${dy * 0.5 + bogen}px)) scale(1.2) rotate(200deg)`, offset: 0.55 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${klein * 1.25}) rotate(350deg)`, offset: 0.88 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${klein}) rotate(360deg)`, offset: 1 },
      ], { duration: 1300, easing: 'cubic-bezier(.45,.05,.35,1)', fill: 'forwards' });
      // Glitzerspur hinter dem Sticker
      const spur = setInterval(() => {
        const t = anim.currentTime / 1300 || 0, k = Math.min(1, t);
        FX.funken(sx + dx * k, sy + dy * k + bogen * Math.sin(Math.PI * k), { n: 2, kraft: 60, r: 5, g: 120 });
      }, 60);
      anim.onfinish = () => { clearInterval(spur); flieger.remove(); fertig(); };
    }, 450);
  }

  // ============================================================
  // ELTERN-BEREICH (PIN-geschützt)
  // ============================================================
  function pinAbfrage() {
    const s = schirm('menue-screen', zeitSzene());
    s.append(el('div', 'spacer'));
    const t = el('div', 'tafel zentriert');
    t.append(el('h2', null, 'Eltern-Bereich'), el('p', 'mini', 'Bitte PIN eingeben.'));
    const anzeige = el('div', 'pin-feld', ''); t.append(anzeige);
    let eingabe = '';
    const tasten = el('div', 'pin-tasten');
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '←', '0', 'OK'].forEach((z) => {
      const b = el('button', 'knopf zweit', z);
      b.addEventListener('pointerdown', () => {
        Audio.tipp();
        if (z === '←') eingabe = eingabe.slice(0, -1);
        else if (z === 'OK') { if (eingabe === daten().pin) { elternBereich(); return; } anzeige.textContent = 'Falsch'; FX.anim(anzeige, 'wackel', 500); eingabe = ''; return; }
        else if (eingabe.length < 4) eingabe += z;
        anzeige.textContent = '•'.repeat(eingabe.length);
      });
      tasten.append(b);
    });
    t.append(tasten);
    s.append(t, knopf('Zurück', null, 'zweit klein', start), el('div', 'spacer'));
  }

  function elternBereich() {
    const d = daten();
    const p = Store.aktivesProfil() || { name: '-', sessions: [], statsProBereich: { aufmerksamkeit: 0, gedaechtnis: 0, rechnen: 0, lesen: 0 }, punkte: 0 };
    const s = schirm('eltern-screen');
    const kopf = el('div', 'eltern-kopf');
    kopf.append(el('h2', null, 'Eltern-Bereich'));
    const raus = html('button', 'rund-knopf', Art.icon('x')); raus.setAttribute('aria-label', 'Schliessen');
    tap(raus, start);
    kopf.append(raus); s.append(kopf);

    s.append(el('p', 'mini', `Aktives Profil: ${p.name} · ${p.punkte} Lichtfunken · Stufe ${Store.rang()} · ${Store.sterneGesamt()} Sterne`));

    // Trainingszeit
    const heute0 = new Date(); heute0.setHours(0, 0, 0, 0);
    const heuteSek = p.sessions.filter((x) => x.datum >= heute0.getTime()).reduce((a, b) => a + (b.sekunden || 0), 0);
    const wocheSek = p.sessions.filter((x) => x.datum >= Date.now() - 7 * 864e5).reduce((a, b) => a + (b.sekunden || 0), 0);
    const info = el('div', 'karte-e');
    info.append(el('h3', null, 'Trainingszeit'));
    info.append(zeile('Heute', minText(heuteSek)));
    info.append(zeile('Diese Woche', minText(wocheSek)));
    info.append(zeile('Sessions gesamt', String(p.sessions.length)));
    s.append(info);
    s.append(el('p', 'mini', 'Richtwert (Pro Juventute): max. 60 Min./Tag Bildschirmzeit für 6–9 Jahre. Empfehlung: 10–15 Min., 3–4× pro Woche.'));

    // Fortschritt je Bereich
    const fort = el('div', 'karte-e');
    fort.append(el('h3', null, 'Geübt je Bereich'));
    const max = Math.max(1, ...Object.values(p.statsProBereich));
    for (const b in BEREICH) {
      fort.append(el('p', 'mini', BEREICH[b]));
      const bal = el('div', 'balken'); const sp = el('span'); sp.style.width = Math.round(((p.statsProBereich[b] || 0) / max) * 100) + '%'; bal.append(sp); fort.append(bal);
    }
    fort.append(el('p', 'mini', 'Lichtfunken, Sterne und Stufe motivieren – bewusst ohne Vergleich mit anderen Kindern.'));
    s.append(fort);

    // Profile verwalten
    const prof = el('div', 'karte-e');
    prof.append(el('h3', null, 'Profile'));
    Store.profile().forEach((pr) => {
      const z = el('div', 'zeile');
      const links = html('span', 'profil-zeile', Art.avatar(pr.avatar));
      links.append(el('span', null, pr.name + (pr.id === Store.aktivId() ? '  (aktiv)' : '')));
      const rechts = el('div', 'reihe');
      rechts.append(knopf('Wählen', null, 'zweit klein', () => { Store.profilWaehlen(pr.id); elternBereich(); }));
      rechts.append(knopf('Löschen', null, 'zweit klein', () => dialog(`Profil «${pr.name}» mit allen Fortschritten löschen?`, 'Löschen', 'Abbrechen', () => {
        Store.profilLoeschen(pr.id); if (!Store.aktivesProfil()) loginScreen(); else elternBereich();
      })));
      z.append(links, rechts); prof.append(z);
    });
    prof.append(knopf('Neues Kind', 'plus', 'zweit klein', profilErstellenScreen));
    s.append(prof);

    // Schwierigkeitsstufen (Transparenz)
    const lvl = el('div', 'karte-e');
    lvl.append(el('h3', null, 'Aktuelle Stufen'));
    Games.katalog.forEach((g) => lvl.append(zeile(g.name, `Stufe ${Store.getLevel(g.id)} · ${Store.getSterne(g.id)}/3 Sterne`)));
    s.append(lvl);

    // Einstellungen
    const set = el('div', 'karte-e');
    set.append(el('h3', null, 'Einstellungen'));
    const nameRow = el('div', 'reihe mitte');
    const nameInput = el('input', 'eingabe klein'); nameInput.type = 'text'; nameInput.placeholder = 'Name des Kindes'; nameInput.value = p.name || '';
    nameInput.setAttribute('aria-label', 'Name des Kindes');
    const nameBtn = knopf('Speichern', null, 'zweit klein', () => { if (Store.aktivesProfil()) { Store.aktivesProfil().name = nameInput.value.trim().slice(0, 20) || 'Kind'; Store.speichern(); nameBtn.querySelector('span').textContent = 'Gespeichert'; } });
    nameRow.append(nameInput, nameBtn); set.append(nameRow);
    set.append(schalter('Spielklänge', d.tonAn, (v) => { d.tonAn = v; Audio.setTon(v); Store.speichern(); }));
    set.append(schalter('Vorlesen', d.spracheAn, (v) => { d.spracheAn = v; Audio.setSprache(v); Store.speichern(); }));
    set.append(schalter('Musik', d.musikAn, (v) => { d.musikAn = v; Music.setEnabled(v); Store.speichern(); }));
    set.append(schalter('Naturklänge (Vögel, Wind, Wasser)', d.naturAn !== false, (v) => { d.naturAn = v; Natur.setEnabled(v); Store.speichern(); }));
    // Stimme fürs Vorlesen wählen (falls Gerätestimmen abrufbar sind)
    const stimmenListe = Audio.stimmen ? Audio.stimmen() : [];
    if (stimmenListe.length) {
      const row = el('div', 'stimme-wahl');
      row.append(el('div', 'mini', 'Stimme fürs Vorlesen'));
      const sel = el('select', 'eingabe klein');
      sel.setAttribute('aria-label', 'Stimme fürs Vorlesen');
      const auto = el('option'); auto.value = ''; auto.textContent = 'Automatisch (beste Stimme)'; sel.append(auto);
      stimmenListe.forEach((v) => { const o = el('option'); o.value = v.name; o.textContent = v.name + (v.lokal ? '' : ' (online)'); if (v.name === d.stimmeName) o.selected = true; sel.append(o); });
      sel.addEventListener('change', () => { d.stimmeName = sel.value; Audio.setStimme(sel.value); Store.speichern(); Audio.sprich('Hallo, ich bin Nala. Wollen wir zusammen üben?'); });
      row.append(sel);
      row.append(knopf('Stimme testen', 'play', 'zweit klein', () => Audio.sprich('Hallo, ich bin Nala. Freust du dich auf den Zauberwald?')));
      row.append(el('div', 'mini', 'Tipp: Für eine natürliche Stimme auf dem Gerät «Google Sprachausgabe» (Android) installieren bzw. am iPhone unter Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen eine «Premium/Enhanced»-Stimme laden.'));
      set.append(row);
    }
    // PIN ändern
    const pinRow = el('div', 'reihe mitte');
    const pinInput = el('input', 'eingabe klein'); pinInput.type = 'tel'; pinInput.maxLength = 4; pinInput.placeholder = 'Neue PIN (4 Ziffern)';
    pinInput.setAttribute('aria-label', 'Neue PIN');
    const pinBtn = knopf('PIN setzen', null, 'zweit klein', () => {
      const t = pinBtn.querySelector('span');
      if (/^\d{4}$/.test(pinInput.value)) { d.pin = pinInput.value; Store.speichern(); t.textContent = 'Gespeichert'; pinInput.value = ''; } else t.textContent = '4 Ziffern!';
    });
    pinRow.append(pinInput, pinBtn); set.append(pinRow);
    // Alle Daten löschen (alle Profile)
    set.append(knopf('Alle Profile & Daten löschen', null, 'zweit klein', () => dialog('Wirklich ALLE Profile und Fortschritte löschen?', 'Alles löschen', 'Abbrechen', () => {
      Store.profile().slice().forEach((pr) => Store.profilLoeschen(pr.id));
      loginScreen();
    })));
    s.append(set);

    s.append(el('p', 'mini', 'Alle Daten bleiben nur auf diesem Gerät. Keine Cloud, keine Konten, keine Werbung.'));

    function zeile(l, r) { const z = el('div', 'zeile'); z.append(el('span', null, l), el('strong', null, r)); return z; }
    function minText(sek) { const m = Math.floor(sek / 60), s2 = sek % 60; return m > 0 ? `${m} Min ${s2} Sek` : `${s2} Sek`; }
    function schalter(label, an, cb) {
      const row = el('div', 'zeile');
      row.append(el('span', null, label));
      const b = el('button', 'schalter' + (an ? ' an' : ''));
      b.setAttribute('role', 'switch'); b.setAttribute('aria-checked', String(an)); b.setAttribute('aria-label', label);
      b.addEventListener('click', () => { an = !an; b.classList.toggle('an', an); b.setAttribute('aria-checked', String(an)); cb(an); Audio.tipp(); });
      row.append(b); return row;
    }
  }

  // Stimmen für Sprachausgabe evtl. verzögert laden
  if ('speechSynthesis' in window) window.speechSynthesis.getVoices();

  // Start immer mit dem Titelbild (der erste Tipp schaltet auch den Ton frei)
  titel();
})();
