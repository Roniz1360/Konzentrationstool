/* storage.js – Alles bleibt lokal auf dem Gerät (localStorage).
   Keine Konten, keine Cloud, keine personenbezogenen Daten. Datensparsam. */

const Store = (() => {
  const KEY = 'nala.waldschule.v1';

  const standard = {
    spitzname: '',
    pin: '1234',            // Eltern-PIN (Standard, im Eltern-Bereich änderbar)
    tonAn: true,
    spracheAn: true,
    musikAn: true,
    level: {},              // pro Spiel-ID ein Schwierigkeitslevel (1..N)
    abzeichen: [],          // gesammelte Sticker (Emoji)
    sessions: [],           // Verlauf: {datum, sekunden, spiele:[id...]}
    statsProBereich: {      // grobe Fortschrittspunkte je Bereich
      aufmerksamkeit: 0, gedaechtnis: 0, rechnen: 0, lesen: 0
    },
  };

  function laden() {
    try {
      const roh = localStorage.getItem(KEY);
      if (!roh) return { ...standard };
      return { ...standard, ...JSON.parse(roh) };
    } catch (e) { return { ...standard }; }
  }

  let daten = laden();

  function speichern() {
    try { localStorage.setItem(KEY, JSON.stringify(daten)); }
    catch (e) { /* z.B. privater Modus – App läuft trotzdem */ }
  }

  function get() { return daten; }

  function setLevel(spielId, level) {
    daten.level[spielId] = Math.max(1, level);
    speichern();
  }
  function getLevel(spielId) { return daten.level[spielId] || 1; }

  function sessionSpeichern(sekunden, spiele, bereichspunkte) {
    daten.sessions.push({ datum: Date.now(), sekunden, spiele });
    if (daten.sessions.length > 200) daten.sessions.shift();
    for (const b in bereichspunkte) {
      daten.statsProBereich[b] = (daten.statsProBereich[b] || 0) + bereichspunkte[b];
    }
    speichern();
  }

  // Ein Abzeichen pro abgeschlossener Session – ruhig, ohne Verlustdruck
  const STICKER = ['🌰','🍄','🌸','🦋','🌟','🐢','🍀','🐿️','🌼','🐝','🦔','🍁','🌈','🐞','🌻','🦉'];
  function abzeichenGeben() {
    const s = STICKER[daten.abzeichen.length % STICKER.length];
    daten.abzeichen.push(s);
    speichern();
    return s;
  }

  function reset() { daten = { ...standard, level:{}, abzeichen:[], sessions:[], statsProBereich:{aufmerksamkeit:0,gedaechtnis:0,rechnen:0,lesen:0} }; speichern(); }

  return {
    get, speichern, setLevel, getLevel, sessionSpeichern,
    abzeichenGeben, reset, STICKER,
  };
})();
