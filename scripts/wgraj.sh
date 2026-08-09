#!/usr/bin/env bash
# Wgrywa projekt do Apps Script. Najpierw sprawdza, potem wysyła.
#
#   ./scripts/wgraj.sh            wgraj pliki (bez nowej wersji wdrożenia)
#   ./scripts/wgraj.sh --wersja   wgraj i wypuść nową wersję pod adresem /exec
#
# Jednorazowa konfiguracja opisana w README, sekcja „Wgrywanie z komputera”.
set -uo pipefail

cd "$(dirname "$0")/.." || exit 1

CLASP="npx --yes @google/clasp@3.3.0"

if [ ! -f .clasp.json ]; then
  cat <<'KONIEC'
Brak pliku .clasp.json, więc nie wiadomo, do którego projektu wgrywać.

Zrób to raz:
  npx --yes @google/clasp@3.3.0 login
  npx --yes @google/clasp@3.3.0 clone <IDENTYFIKATOR_SKRYPTU> --rootDir apps-script

Identyfikator znajdziesz w edytorze Apps Script:
Ustawienia projektu → Identyfikatory → Identyfikator skryptu.

Trzeba też włączyć Apps Script API:
https://script.google.com/home/usersettings
KONIEC
  exit 1
fi

echo "── Sprawdzenie przed wysyłką ─────────────────────────────────────────"
if ! ./scripts/sprawdz.sh; then
  echo
  echo "✗ Sprawdzenie nie przeszło. Nic nie wysłano."
  exit 1
fi

echo
echo "── Wysyłka ───────────────────────────────────────────────────────────"
echo "  Uwaga: push nadpisuje projekt online. Zmiany zrobione w edytorze"
echo "  przeglądarkowym i niepobrane wcześniej przepadną."
echo

# --force pomija pytanie; sprawdzenie wyżej jest naszą bramką.
if ! $CLASP push --force; then
  echo "✗ Wysyłka nie powiodła się."
  exit 1
fi

if [ "${1:-}" = "--wersja" ]; then
  opis="$(git log -1 --pretty=%s 2>/dev/null || echo 'wdrożenie ręczne')"
  echo
  echo "── Nowa wersja wdrożenia ─────────────────────────────────────────────"
  $CLASP deploy --description "$opis" || {
    echo "✗ Nie udało się wypuścić wersji."
    exit 1
  }
  echo
  echo "✓ Wgrane i wypuszczone. Adres /exec pokazuje już nowy kod."
else
  echo
  echo "✓ Wgrane. Adres /exec nadal pokazuje poprzednią wersję;"
  echo "  żeby go odświeżyć, uruchom: ./scripts/wgraj.sh --wersja"
fi
