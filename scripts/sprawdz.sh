#!/usr/bin/env bash
# Weryfikacja projektu – składnia, powiązania ARIA, kontrast palety.
# Uruchamiaj z katalogu głównego repozytorium: ./scripts/sprawdz.sh
set -uo pipefail

cd "$(dirname "$0")/.." || exit 1
bledy=0

echo "── Składnia ──────────────────────────────────────────────────────────"

python3 -c "
import re, sys
h = open('apps-script/Index.html', encoding='utf-8').read()
m = re.search(r'<script>(.*)</script>', h, re.S)
if not m:
    sys.exit('Nie znaleziono bloku <script> w Index.html')
open('/tmp/pzw-index.js', 'w', encoding='utf-8').write(m.group(1))
" || exit 1

# Wszystkie pliki .gs, nie tylko te dwa; projekt bywa rozbudowywany.
for zrodlo in apps-script/*.gs; do
  cel="/tmp/pzw-$(basename "$zrodlo" .gs).js"
  cp "$zrodlo" "$cel"
  if node --check "$cel" 2>/dev/null; then
    echo "  ✓ $(basename "$zrodlo")"
  else
    echo "  ✗ $(basename "$zrodlo")"
    node --check "$cel"
    bledy=$((bledy + 1))
  fi
done

if node --check /tmp/pzw-index.js 2>/dev/null; then
  echo "  ✓ Index.html (blok script)"
else
  echo "  ✗ Index.html (blok script)"
  node --check /tmp/pzw-index.js
  bledy=$((bledy + 1))
fi

echo
echo "── Spójność plików .gs ───────────────────────────────────────────────"

python3 - <<'PYEOF' || bledy=$((bledy + 1))
import re, sys, pathlib
from collections import defaultdict

pliki = sorted(pathlib.Path('apps-script').glob('*.gs'))
konf = pathlib.Path('apps-script/Konfiguracja.gs').read_text(encoding='utf-8')
problemy = []

# Każdy KONFIG.klucz użyty w kodzie musi istnieć w Konfiguracja.gs.
klucze = set(re.findall(r'^\s{2,4}([a-zA-Z]\w*):', konf, re.M))
for f in pliki:
    if f.name == 'Konfiguracja.gs':
        continue
    for k in sorted(set(re.findall(r'KONFIG\.(\w+)', f.read_text(encoding='utf-8')))):
        if k not in klucze:
            problemy.append(f'{f.name}: KONFIG.{k} – brak takiego klucza w Konfiguracja.gs')

# Apps Script trzyma wszystkie pliki .gs w jednej przestrzeni nazw,
# więc powtórzona nazwa globalna cicho nadpisuje wcześniejszą.
gdzie = defaultdict(list)
for f in pliki:
    t = f.read_text(encoding='utf-8')
    for nazwa in re.findall(r'^function\s+(\w+)', t, re.M) + re.findall(r'^const\s+(\w+)\s*=', t, re.M):
        gdzie[nazwa].append(f.name)
for nazwa, plikach in gdzie.items():
    if len(plikach) > 1:
        problemy.append(f'nazwa globalna „{nazwa}” powtórzona w: {", ".join(plikach)}')

if problemy:
    print('  ✗ ' + '\n  ✗ '.join(problemy))
    sys.exit(1)

print(f'  ✓ {len(pliki)} plików .gs: klucze KONFIG i nazwy globalne bez kolizji')
PYEOF

echo
echo "── Powiązania w interfejsie ──────────────────────────────────────────"

python3 - <<'PY' || bledy=$((bledy + 1))
import re, sys

h = open('apps-script/Index.html', encoding='utf-8').read()
html = h.split('<script>')[0]
js = re.search(r'<script>(.*)</script>', h, re.S).group(1)

zdefiniowane = set(re.findall(r'\bid="([^"]+)"', html))
problemy = []

for uzyte in sorted(set(re.findall(r"el\('([^']+)'\)", js))):
    if uzyte not in zdefiniowane:
        problemy.append(f'el(\'{uzyte}\') – brak takiego id w HTML')

for atrybut in ('aria-controls', 'aria-labelledby', 'aria-describedby'):
    for wartosc in re.findall(atrybut + r'="([^"]+)"', html):
        for cel in wartosc.split():
            if cel not in zdefiniowane:
                problemy.append(f'{atrybut}="{cel}" – brak celu')

for cel in re.findall(r'<label[^>]*\bfor="([^"]+)"', html):
    if cel not in zdefiniowane:
        problemy.append(f'<label for="{cel}"> – brak pola')

# Każde pole formularza musi mieć etykietę.
etykietowane = set(re.findall(r'<label[^>]*\bfor="([^"]+)"', html))
for pole in re.findall(r'<(?:input|select|textarea)[^>]*\bid="([^"]+)"', html):
    if pole not in etykietowane:
        problemy.append(f'pole #{pole} – brak <label for>')

# Kierunek odwrotny: miejsce na dane, którego żaden skrypt nie wypełnia,
# zostaje na stronie jako wieczny szkielet ładowania.
# Identyfikator bywa przekazywany do funkcji pomocniczej, nie tylko
# wpisywany w el(...) – bierzemy więc wszystkie dosłowne napisy ze skryptu.
napisy_w_js = set(re.findall(r"'([^'\n]+)'", js)) | set(re.findall(r'"([^"\n]+)"', js))
for slot in sorted(zdefiniowane):
    if re.match(r'^(lista|ladowanie|brak|liczba)-', slot) and slot not in napisy_w_js:
        problemy.append(f'#{slot} – miejsce na dane, którego skrypt nigdy nie wypełnia')

if problemy:
    print('  ✗ ' + '\n  ✗ '.join(problemy))
    sys.exit(1)

print('  ✓ id, ARIA i etykiety pól spójne')
PY

echo
echo "── Kontrast ──────────────────────────────────────────────────────────"
python3 scripts/kontrast.py | tail -n 3 || bledy=$((bledy + 1))

echo
if [ "$bledy" -gt 0 ]; then
  echo "✗ Znaleziono problemy: $bledy"
  exit 1
fi

echo "✓ Wszystko przechodzi. Pamiętaj jeszcze przeczytać wygenerowany"
echo "  tekst zawiadomienia – błędów odmiany żaden z tych testów nie wyłapie."
