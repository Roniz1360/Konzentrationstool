# Nalas Waldschule – iOS-App

Eine schlanke **WKWebView-App**, die die Spiel-Dateien (aus `App/www/`, einer Kopie
der Web-App) **im App-Bundle bündelt**. Läuft **komplett offline**, ohne Werbung,
ohne Konto, ohne Datensammlung. Vorlesen nutzt die Web-Speech-Funktion von WebKit.

> ⚠️ **Wichtig:** Eine iOS-App lässt sich **nicht** wie eine Android-APK per Link
> installieren. Apple erlaubt kein freies Sideloading. Zum Bauen braucht es einen
> **Mac mit Xcode**, zum Verteilen den **App Store / TestFlight** (Apple Developer
> Program, 99 USD/Jahr). Diese Datei ist das fertige Projektgerüst dafür.

## Ohne Mac sofort nutzen (empfohlen für den Privatgebrauch)

Die Web-App ist auf dem iPhone/iPad **ohne Xcode** installierbar:
1. Den Web-Link **in Safari** öffnen.
2. **Teilen → „Zum Home-Bildschirm"**.
Fertig – App-Icon, Vollbild, lokale Speicherung.

## Auf dem Mac bauen

Voraussetzungen: **Xcode** und **XcodeGen** (`brew install xcodegen`).

```bash
cd ios
xcodegen generate            # erzeugt NalasWaldschule.xcodeproj
open NalasWaldschule.xcodeproj
```

In Xcode:
1. Target **NalasWaldschule** → **Signing & Capabilities** → dein **Team** wählen
   (oder in `project.yml` `DEVELOPMENT_TEAM` eintragen).
2. **Auf dem eigenen iPhone testen:** Gerät anstecken, oben auswählen, ▶︎ Run.
   Mit einem *kostenlosen* Apple-Account läuft die App 7 Tage, dann neu bauen.
3. **Über TestFlight/App Store verteilen:** Product → **Archive** →
   **Distribute App** → App Store Connect. Dafür ist das kostenpflichtige
   Developer-Programm nötig.

## Automatischer Prüfbuild (GitHub Actions)

Der Workflow **„iOS-App bauen (Prüfbuild)"** (Tab **Actions**) baut die App auf
einem macOS-Runner ohne Signatur (Simulator) und zeigt, ob alles kompiliert.
Einen installierbaren Geräte-Build (`.ipa`) kann er ohne deine Signatur-Zertifikate
nicht erzeugen.

## Für die App-Store-Freigabe (wie bei Android, aber Apple)

- Apple Developer Program (99 USD/Jahr), App in **App Store Connect** anlegen.
- Weil es eine **Kinder-App** ist: **Alterskategorie „Kids"** wählen → Apples
  strenge Kinder-Richtlinien (keine Werbung, kein Tracking, keine externen Links –
  erfüllt die App bereits). **Datenschutzerklärung-URL** ist Pflicht.
- Screenshots und App-Vorschau je Gerätegrösse.

## Aufbau

```
ios/
  project.yml                 – XcodeGen-Beschreibung (erzeugt das .xcodeproj)
  App/
    AppDelegate.swift         – App-Start (Fenster)
    ViewController.swift       – WKWebView, lädt App/www/index.html
    Info.plist                – Name, Version, Hochformat
    Assets.xcassets/          – App-Icon (1024×1024)
    www/                      – gebündelte Web-App (Kopie der Projekt-Dateien)
```

### Web-Dateien aktualisieren
`App/www/` ist eine **Kopie**. Nach Änderungen an den Projekt-Dateien auffrischen
(die Offline-Variante der `index.html` mit `fonts/fonts.css` behalten):

```bash
cp -r android/app/src/main/assets/www/* ios/App/www/
```
