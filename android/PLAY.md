# Nalas Waldschule bei Google Play veröffentlichen

Die App ist **Play-fertig vorbereitet**: signiertes App-Bundle (**AAB**), `targetSdk 35`
(Play-Pflicht), eigener **Upload-Schlüssel**. Was nur du im Google-Play-Konto machen
kannst, steht unten als Checkliste.

## Was ich geliefert habe

| Datei | Wofür |
|------|------|
| `NalasWaldschule-1.0-release.aab` | **Das lädst du bei Play hoch.** |
| `NalasWaldschule-1.0-release.apk` | Signierte Testversion fürs eigene Handy. |
| `upload-keystore.jks` + Passwort | Dein **Signatur-Schlüssel**. Unbedingt sicher aufbewahren. |

> ⚠️ **Schlüssel niemals verlieren und niemals ins Internet stellen.** Ohne ihn (bzw.
> ohne Play App Signing als Rettungsanker) kannst du keine Updates mehr veröffentlichen.
> Er liegt bewusst **nicht** im Repo. Sichere `upload-keystore.jks` + Passwort an einem
> geschützten Ort (Passwort-Manager, Backup).

## Voraussetzungen (einmalig)

1. **Google-Play-Entwicklerkonto**: einmalig **25 USD**, unter
   <https://play.google.com/console>. Für Privatpersonen ist eine Identitätsprüfung nötig.
2. Weil die App für **Kinder** ist, gilt zusätzlich die **Play-Families-Richtlinie**
   (siehe Checkliste). Das ist der aufwendigste Teil – rechne mit sorgfältigem Ausfüllen.

## Checkliste im Play Console

1. **App erstellen** → Name „Nalas Waldschule", Sprache Deutsch, Typ „App", kostenlos.
2. **Play App Signing** aktiviert lassen (Standard). Du lädst mit dem **Upload-Schlüssel**
   hoch; Google verwaltet den finalen App-Schlüssel. → Beim ersten Upload das AAB nehmen.
3. **Release erstellen**: Testing → *Internal testing* (schnellster Weg zum Ausprobieren)
   → AAB `NalasWaldschule-1.0-release.aab` hochladen → Freigeben.
4. **Store-Eintrag** ausfüllen: Kurzbeschreibung, Beschreibung, **App-Icon 512×512**,
   **Feature-Grafik 1024×500**, mindestens **2 Screenshots** (Telefon). (Icon/Screenshots
   kann ich dir erzeugen – sag Bescheid.)
5. **Inhaltseinstufung** (Fragebogen) → als Lern-/Kinderspiel, keine Gewalt/Werbung.
6. **Zielgruppe & Inhalte**: Zielalter **unter 13** wählen → App fällt unter **Designed
   for Families**. Bestätigen: keine Werbung, keine In-App-Käufe, kein Tracking.
7. **Datenschutz**: **Datenschutzerklärung-URL** ist Pflicht (auch wenn keine Daten
   gesammelt werden). Text kann ich dir schreiben; hosten z. B. als GitHub Page.
   **Data-Safety-Formular**: „Es werden keine Daten erhoben/geteilt" (stimmt hier).
8. **Prüfen & veröffentlichen**. Erstprüfung durch Google dauert bei Kinder-Apps
   oft einige Tage.

## Version erhöhen (für jedes Update)

In `app/build.gradle` `versionCode` um 1 erhöhen und `versionName` anpassen, dann neu
bauen. Play akzeptiert jeden `versionCode` nur einmal.

```bash
cd android
./gradlew bundleRelease   # -> app/build/outputs/bundle/release/app-release.aab
```

## Lokaler Release-Build (Voraussetzung: keystore.properties vorhanden)

```bash
cd android
cp keystore.properties.example keystore.properties   # Werte eintragen
# upload-keystore.jks nach android/keystore/ legen
./gradlew bundleRelease assembleRelease
```

## Ehrliche Einordnung

- **Technisch** ist die App Play-tauglich (signiertes AAB, targetSdk 35, offline,
  keine Datensammlung – das erleichtert die Kinder-Richtlinie enorm).
- **Der Aufwand liegt im Konto/Formular-Teil**: Entwicklerkonto (25 USD), Families-
  Richtlinie, Datenschutz-URL, Store-Grafiken, Content-Rating.
- Für rein privaten Gebrauch (nur dein Kind) ist **Sideloading der APK** weiterhin der
  schnellste Weg – Play lohnt sich, wenn andere die App auch bekommen sollen.
