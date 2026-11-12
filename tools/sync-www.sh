#!/usr/bin/env bash
# Kopiert die Web-App in die Android- und iOS-Hülle (beide laden sie aus «www»).
# Nach jeder Änderung an index.html, css/, js/, fonts/ oder icons/ ausführen.
set -euo pipefail
cd "$(dirname "$0")/.."
for ziel in android/app/src/main/assets/www ios/App/www; do
  rm -rf "$ziel"
  mkdir -p "$ziel"
  cp -r index.html manifest.webmanifest css js fonts icons "$ziel/"
done
echo "www-Kopien aktualisiert."
