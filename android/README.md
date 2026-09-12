# Nalas Waldschule – Android-App

Eine schlanke **WebView-App**, die die Spiel-Dateien (aus `../index.html`, `../css`,
`../js`, `../icons`) **im APK bündelt**. Sie läuft **komplett offline**, ohne Werbung,
ohne Konto, ohne Internet-Berechtigung. Fürs Vorlesen nutzt sie die **native
deutsche Stimme** des Geräts (Android TextToSpeech), die meist natürlicher klingt
als die Browser-Stimme.

## Fertige App installieren (Sideloading)

1. Die Datei `NalasWaldschule-1.0.apk` aufs Android-Gerät kopieren (USB, Cloud, Chat).
2. Datei antippen. Beim ersten Mal fragt Android nach der Erlaubnis
   **„Aus dieser Quelle installieren"** – erlauben.
3. Installieren, fertig. Die App heisst **Nalas Waldschule**.

> Es ist eine **Debug-Signatur** (für den privaten Familiengebrauch völlig ausreichend).
> Für eine Veröffentlichung im Play Store bräuchte es eine eigene Release-Signatur.

## Selbst bauen

**Variante A – automatisch über GitHub Actions (kein Setup nötig):**
Im Repo unter **Actions → „Android-APK bauen" → Run workflow**. Nach dem Lauf die
APK unter „Artifacts → NalasWaldschule-debug-apk" herunterladen.

**Variante B – lokal:**
Voraussetzungen: JDK 17 und Android SDK (z. B. via Android Studio).

```bash
cd android
echo "sdk.dir=/pfad/zum/Android/Sdk" > local.properties
./gradlew assembleDebug
# Ergebnis: app/build/outputs/apk/debug/app-debug.apk
```

## Aufbau

```
android/
  app/src/main/
    assets/www/           – die gebündelte Web-App (Kopie der Projekt-Dateien)
    java/ch/waldschule/nala/MainActivity.java – WebView + native Vorlese-Stimme
    res/mipmap-*/         – App-Icons
    AndroidManifest.xml   – keine Internet-Berechtigung (offline)
  build.gradle, settings.gradle, app/build.gradle
```

### Web-Dateien aktualisieren
Die App im APK ist eine **Kopie** unter `app/src/main/assets/www/`. Nach Änderungen
an den Projekt-Dateien die Kopie auffrischen (Service-Worker wird nicht gebraucht):

```bash
cd android/app/src/main/assets/www
cp -r ../../../../../../index.html ../../../../../../css ../../../../../../js ../../../../../../icons .
# Die Schrift-Einbindung in dieser index.html auf fonts/fonts.css lassen (offline),
# nicht den Google-Fonts-Link der Web-Version übernehmen.
```
