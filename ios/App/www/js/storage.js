/* storage.js – Alles bleibt lokal auf dem Gerät (localStorage).
   Mehrere Benutzer-Profile (einfaches Login ohne Server), Punkte & Stufe.
   Keine Cloud, keine personenbezogenen Pflichtdaten. Datensparsam. */

const Store = (() => {
  const KEY = 'nala.waldschule.v1';

  function leeresProfil(name, avatar) {
    return {
      id: 'p' + Date.now() + Math.floor(Math.random() * 1000),
      name: (name || 'Kind').slice(0, 20),
      avatar: avatar || 'nala',
      erstellt: Date.now(),
      level: {},                 // pro Spiel ein Schwierigkeitslevel
      punkte: 0,                 // gesammelte Punkte
      abzeichen: [],             // gesammelte Sticker
      sessions: [],              // Verlauf
      statsProBereich: { aufmerksamkeit: 0, gedaechtnis: 0, rechnen: 0, lesen: 0 },
      sterne: {},                // beste Sterne (1–3) pro Spiel
      aquarium: [],              // gekaufte Tiere und Deko
      ausgegeben: 0,             // für das Aquarium ausgegebene Perlen
      orteBekannt: [],           // bereits gefeierte, freigeschaltete Orte
    };
  }

  const standard = {
    version: 2,
    pin: '1234',            // Eltern-PIN
    tonAn: true, spracheAn: true, musikAn: true, naturAn: true,
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
  // Perlen zum Ausgeben (die Stufe zählt weiter alle je gesammelten Perlen)
  function perlen() { const p = P(); return p ? Math.max(0, (p.punkte || 0) - (p.ausgegeben || 0)) : 0; }
  function aquarium() { const p = P(); return (p && p.aquarium) || []; }
  function kaufen(id, preis) {
    const p = P(); if (!p || perlen() < preis) return false;
    if (!p.aquarium) p.aquarium = [];
    if (p.aquarium.includes(id)) return false;
    p.aquarium.push(id); p.ausgegeben = (p.ausgegeben || 0) + preis; speichern(); return true;
  }
  function orteBekannt() { const p = P(); return (p && p.orteBekannt) || []; }
  function ortBekannt(id) { const p = P(); if (!p) return; if (!p.orteBekannt) p.orteBekannt = []; if (!p.orteBekannt.includes(id)) { p.orteBekannt.push(id); speichern(); } }

  function sessionSpeichern(sekunden, spiele, bereichspunkte) {
    const p = P(); if (!p) return;
    p.sessions.push({ datum: Date.now(), sekunden, spiele });
    if (p.sessions.length > 200) p.sessions.shift();
    for (const b in bereichspunkte) p.statsProBereich[b] = (p.statsProBereich[b] || 0) + bereichspunkte[b];
    speichern();
  }

  // ---- Sterne pro Spiel (Lob für Dranbleiben: mindestens 1 Stern gibt es immer) ----
  function sterneFuer(correct, total) { const q = total ? correct / total : 0; return q >= 0.85 ? 3 : q >= 0.6 ? 2 : 1; }
  function sterneSetzen(spielId, n) {
    const p = P(); if (!p) return n;
    if (!p.sterne) p.sterne = {};
    p.sterne[spielId] = Math.max(p.sterne[spielId] || 0, n); speichern(); return p.sterne[spielId];
  }
  function getSterne(spielId) { const p = P(); return (p && p.sterne && p.sterne[spielId]) || 0; }
  function sterneGesamt() { const p = P(); return p && p.sterne ? Object.values(p.sterne).reduce((a, b) => a + b, 0) : 0; }

  const STICKER = ['muschel','seestern','fisch','qualle','schildkroete','uboot','wal','oktopus','kugelfisch','zierfisch','truhe','krabbe','perle','nala','stern','herz',
                   'sonne','mond','regenbogen','fuchs','panda','hase','eule','katze','hund','loewe','koala','tiger','frosch','baer','maus','igel'];
  function abzeichenGeben() {
    const p = P(); if (!p) return 'stern';
    const s = STICKER[p.abzeichen.length % STICKER.length];
    p.abzeichen.push(s); speichern(); return s;
  }

  // Avatare zur Auswahl bei der Profil-Erstellung
  const AVATARE = ['nala','fuchs','baer','panda','hase','igel','eule','frosch','katze','hund','loewe','koala','tiger','maus','kuh','schaf'];

  return {
    get, speichern, profile, aktivId, aktivesProfil: P,
    profilErstellen, profilWaehlen, profilLoeschen,
    setLevel, getLevel, startLevel, rang, schwierigkeitsBoden,
    punkteGeben, getPunkte, perlen, aquarium, kaufen, orteBekannt, ortBekannt, sterneFuer, sterneSetzen, getSterne, sterneGesamt,
    sessionSpeichern, abzeichenGeben, STICKER, AVATARE,
  };
})();
