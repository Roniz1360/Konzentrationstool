/* storage.js – Alles bleibt lokal auf dem Gerät (localStorage).
   Mehrere Benutzer-Profile (einfaches Login ohne Server), Punkte & Stufe.
   Keine Cloud, keine personenbezogenen Pflichtdaten. Datensparsam. */

const Store = (() => {
  const KEY = 'nala.waldschule.v1';

  function leeresProfil(name, avatar) {
    return {
      id: 'p' + Date.now() + Math.floor(Math.random() * 1000),
      name: (name || 'Kind').slice(0, 20),
      avatar: avatar || '🐿️',
      erstellt: Date.now(),
      level: {},                 // pro Spiel ein Schwierigkeitslevel
      punkte: 0,                 // gesammelte Punkte
      abzeichen: [],             // gesammelte Sticker
      sessions: [],              // Verlauf
      statsProBereich: { aufmerksamkeit: 0, gedaechtnis: 0, rechnen: 0, lesen: 0 },
    };
  }

  const standard = {
    version: 2,
    pin: '1234',            // Eltern-PIN
    tonAn: true, spracheAn: true, musikAn: true,
    stimmeName: '',         // vom Elternteil gewählte Vorlese-Stimme (Name)
    aktiv: null,            // ID des aktiven Profils
    profile: [],            // Liste aller Profile
  };

  function laden() {
    let d;
    try {
      const roh = localStorage.getItem(KEY);
      d = roh ? JSON.parse(roh) : null;
    } catch (e) { d = null; }
    if (!d) return { ...standard };

    // Migration alter Daten (v1 ohne Profile) -> ein Profil "Kind"
    if (!d.version || d.version < 2 || !Array.isArray(d.profile)) {
      const p = leeresProfil(d.spitzname || 'Kind', '🐿️');
      p.level = d.level || {};
      p.abzeichen = d.abzeichen || [];
      p.sessions = d.sessions || [];
      p.statsProBereich = d.statsProBereich || p.statsProBereich;
      d = {
        ...standard,
        pin: d.pin || '1234',
        tonAn: d.tonAn !== false, spracheAn: d.spracheAn !== false, musikAn: d.musikAn !== false,
        profile: [p], aktiv: p.id,
      };
    }
    return { ...standard, ...d };
  }

  let daten = laden();

  function speichern() {
    try { localStorage.setItem(KEY, JSON.stringify(daten)); } catch (e) {}
  }

  function get() { return daten; }
  function profile() { return daten.profile; }
  function aktivId() { return daten.aktiv; }
  function P() { return daten.profile.find(x => x.id === daten.aktiv) || null; }

  function profilErstellen(name, avatar) {
    const p = leeresProfil(name, avatar);
    daten.profile.push(p);
    daten.aktiv = p.id;
    speichern();
    return p;
  }
  function profilWaehlen(id) {
    if (daten.profile.some(x => x.id === id)) { daten.aktiv = id; speichern(); }
  }
  function profilLoeschen(id) {
    daten.profile = daten.profile.filter(x => x.id !== id);
    if (daten.aktiv === id) daten.aktiv = daten.profile[0] ? daten.profile[0].id : null;
    speichern();
  }

  // ---- Schwierigkeit ----
  function setLevel(spielId, level) { const p = P(); if (!p) return; p.level[spielId] = Math.max(1, level); speichern(); }
  function getLevel(spielId) { const p = P(); return (p && p.level[spielId]) || 1; }
  // Stufe steigt mit den Punkten -> das Spiel wird mit der Zeit schwerer & komplexer
  function rangAus(punkte) { return 1 + Math.floor((punkte || 0) / 200); }
  function rang() { const p = P(); return rangAus(p ? p.punkte : 0); }
  function schwierigkeitsBoden() { return Math.min(6, rang()); } // Untergrenze der Schwierigkeit
  // Startlevel eines Spiels: nie leichter als der aktuelle Fortschritts-Boden
  function startLevel(spielId) { return Math.max(getLevel(spielId), schwierigkeitsBoden()); }

  // ---- Punkte ----
  function punkteGeben(n) {
    const p = P(); if (!p) return { punkte: 0, rang: 1, aufgestiegen: false };
    const vorher = rangAus(p.punkte);
    p.punkte = Math.max(0, (p.punkte || 0) + n);
    const nachher = rangAus(p.punkte);
    speichern();
    return { punkte: p.punkte, rang: nachher, aufgestiegen: nachher > vorher };
  }
  function getPunkte() { const p = P(); return p ? p.punkte : 0; }

  function sessionSpeichern(sekunden, spiele, bereichspunkte) {
    const p = P(); if (!p) return;
    p.sessions.push({ datum: Date.now(), sekunden, spiele });
    if (p.sessions.length > 200) p.sessions.shift();
    for (const b in bereichspunkte) p.statsProBereich[b] = (p.statsProBereich[b] || 0) + bereichspunkte[b];
    speichern();
  }

  const STICKER = ['🌰','🍄','🌸','🦋','🌟','🐢','🍀','🐿️','🌼','🐝','🦔','🍁','🌈','🐞','🌻','🦉'];
  function abzeichenGeben() {
    const p = P(); if (!p) return '🌟';
    const s = STICKER[p.abzeichen.length % STICKER.length];
    p.abzeichen.push(s); speichern(); return s;
  }

  // Avatare zur Auswahl bei der Profil-Erstellung
  const AVATARE = ['🐿️','🦊','🐻','🐼','🐰','🦔','🦉','🐸','🐱','🐶','🦁','🐨','🐯','🦄','🐢','🐝'];

  return {
    get, speichern, profile, aktivId, aktivesProfil: P,
    profilErstellen, profilWaehlen, profilLoeschen,
    setLevel, getLevel, startLevel, rang, schwierigkeitsBoden,
    punkteGeben, getPunkte,
    sessionSpeichern, abzeichenGeben, STICKER, AVATARE,
  };
})();
