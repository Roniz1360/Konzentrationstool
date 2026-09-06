# 🐿️ Nalas Waldschule

Eine ruhige Konzentrations- und Übungs-App für ein Kind in der **2. Klasse (Deutschschweiz)**.
Gebaut als **PWA** (Progressive Web App = eine installierbare Webseite). Läuft offline,
speichert alles **nur lokal** auf dem Gerät – keine Werbung, keine Konten, keine Cloud.

## Was die App macht

Eine tägliche Übung = **3–4 kurze Minispiele** (ca. 10–15 Minuten). Sie mischt
Konzentrations-Training mit **echtem Schulstoff** (Rechnen bis 100, Lesen).
Nala das Eichhörnchen begleitet das Kind; am Ende gibt es **ein** Abzeichen fürs Album.

### Die 7 Minispiele

| Spiel | Trainiert |
|------|-----------|
| 🍄 Pilz-Stopp | Impulskontrolle (Go/No-Go) |
| 🔊 Echo | Merken einer Reihenfolge (Corsi) |
| 🐻 Gleich oder anders | Arbeitsgedächtnis (1-back / 2-back) |
| 🌀 Sortier-Wirbel | Umdenken / Regelwechsel (DCCS) |
| 🎣 Zahlen-Fischen | **Rechnen bis 100** (Plus/Minus) |
| 📖 Wörter-Angel | **Lesen** (Sichtwortschatz) |
| 🔍 Finde-mich | Selektive Aufmerksamkeit |

Alle Spiele haben **adaptive Schwierigkeit**: richtig → etwas schwerer, falsch → etwas leichter.

### Gesundes Design (bewusst OHNE Suchtmechaniken)
- Keine Streaks, kein Zeitdruck-Alarm, keine Push-Nachrichten, keine Lootboxen.
- Klares Ende der Session. Lob für **Anstrengung**, nicht für Highscore.
- Fehlerfreundlich: ein Fehler gibt einen **sanften** Ton, nie einen Strafton.
- Grosse Buttons, wenig Text, Anweisungen werden **vorgelesen**.
- Schweizer Rechtschreibung: immer **«ss»**, nie «ß».

### Eltern-Bereich (PIN)
Standard-PIN: **1234** (im Eltern-Bereich änderbar). Zeigt Trainingszeit, geübte
Bereiche und Schwierigkeitsstufen – **ohne Ranking**, ohne Vergleich mit anderen Kindern.
Dort lassen sich Spitzname, Töne, Vorlesen und PIN einstellen.

## Auf das Handy / Tablet bringen (ohne App-Store)

1. Dateien auf einen kleinen Webspace legen **oder** lokal einen Server starten:
   ```bash
   cd Konzentrationstool
   python3 -m http.server 8000
   ```
2. Im **Chrome** auf dem Gerät die Adresse öffnen (z. B. `http://<PC-IP>:8000`).
3. Menü → **«Zum Startbildschirm hinzufügen»**. Fertig – die App startet wie eine normale App
   und funktioniert danach auch offline.

> Hinweis: PWA braucht für die Installation normalerweise `https` oder `localhost`.
> Für den reinen Familiengebrauch reicht das Öffnen im Browser auch ohne Installation.

## Ehrliche Einordnung (wichtig)

- **Belegt:** Man wird in der geübten Aufgabe besser (near transfer).
- **Nicht belegt:** dass abstraktes «Gehirnjogging» allgemein klüger macht oder die
  Schulnoten verbessert (far transfer). Darum übt diese App **direkt Schulstoff**.
- Am wirksamsten sind ohnehin **Bewegung, Musik, Brettspiele und Vorlesen**.
  Die App ist ein kleiner, motivierender Baustein – kein Ersatz.
- Richtwert (Pro Juventute): max. **60 Min./Tag** Bildschirmzeit für 6–9-Jährige.

## Technik

Reines HTML/CSS/JavaScript, keine externen Bibliotheken. Struktur:

```
index.html            – Einstieg
css/style.css         – Aussehen
js/audio.js           – Vorlesen + sanfte Klänge
js/storage.js         – lokale Speicherung
js/games.js           – die 7 Minispiele
js/app.js             – Bildschirme + Session-Ablauf
manifest.webmanifest  – App-Installation
sw.js                 – Offline-Betrieb
icons/                – App-Symbole
```

Alle Daten bleiben auf dem Gerät (`localStorage`). Datensparsam nach revDSG.
