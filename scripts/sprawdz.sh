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

# Reguła CSS bywa zabierana razem z sąsiednim blokiem przy cięciach.
# Klasa bez reguły renderuje się stylem domyślnym i układ cicho się rozjeżdża.
css = re.search(r'<style>(.*?)</style>', h, re.S).group(1)

zmienne_zdef = set(re.findall(r'(--[\w-]+)\s*:', css))
for zmienna in sorted(set(re.findall(r'var\((--[\w-]+)', css)) - zmienne_zdef):
    problemy.append(f'{zmienna} — użyta w CSS, nigdzie nie zdefiniowana')

klasy_uzyte = set()
for wartosc in re.findall(r'class="([^"]+)"', html):
    klasy_uzyte |= set(wartosc.split())
for wartosc in re.findall(r"className = '([^']+)'", js):
    klasy_uzyte |= set(wartosc.split())
for wartosc in re.findall(r"classList\.(?:add|toggle)\('([^']+)'", js):
    klasy_uzyte.add(wartosc)

# Klasy będące wyłącznie uchwytem dla skryptu nie muszą mieć stylu.
UCHWYTY = {'tresc', 'znak'}
klasy_css = set(re.findall(r'\.([a-zA-Z][\w-]*)', css))
for klasa in sorted(klasy_uzyte - klasy_css - UCHWYTY):
    problemy.append(f'.{klasa} — klasa bez reguły w CSS')

# Wartości zaszyte wprost zamiast tokenów. To one sprawiają, że każdy nowy
# element ma własny odstęp i własny odcień, a całość się rozjeżdża.
korzen_koniec = css.find('* { box-sizing')
poza_korzeniem = css[korzen_koniec:]

WYJATKI_BARW = {'#fff', '#ffffff'}
zaszyte = sorted({b for b in re.findall(r'#[0-9a-fA-F]{3,6}\b', poza_korzeniem)
                  if b.lower() not in WYJATKI_BARW})
if zaszyte:
    problemy.append('barwy zaszyte poza :root (użyj zmiennej): ' + ', '.join(zaszyte))

# Odstępy mają iść ze skali. Szerokości, wysokości, punkty łamania
# i przesunięcia optyczne to osobna sprawa i ich nie ruszamy.
DOZWOLONE_PX = {'0', '1px', '2px', '-1px'}
zle_px = set()
for wlasciwosc, wartosc in re.findall(
        r'\b(padding|margin|gap|row-gap|column-gap)(?:-(?:top|right|bottom|left|inline|block))?'
        r'\s*:\s*([^;]+);', poza_korzeniem):
    for piksele in re.findall(r'(-?\d+px)', wartosc):
        if piksele not in DOZWOLONE_PX:
            zle_px.add(piksele)
if zle_px:
    problemy.append('odstępy w pikselach zamiast --p1…--p7: ' + ', '.join(sorted(zle_px)))

# Skala typograficzna: rozmiar spoza niej rozjeżdża hierarchię i jest jednym
# z sygnałów, po których poznaje się układ złożony automatem.
poza_skala = sorted(set(re.findall(r'font-size:\s*([\d.]+rem)', css)))
if poza_skala:
    problemy.append('rozmiary pisma poza skalą --t1…--t6: ' + ', '.join(poza_skala))

grubosci = sorted(set(re.findall(r'font-weight:\s*(\d+)', css)))
if grubosci:
    problemy.append('grubości poza zmiennymi --g-*: ' + ', '.join(grubosci))

if css.count('{') != css.count('}'):
    problemy.append(f'nawiasy CSS: {css.count("{")} otwierających, {css.count("}")} zamykających')

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
echo "── Skille kontra kod ─────────────────────────────────────────────────"

python3 - <<'PYEOF' || bledy=$((bledy + 1))
import re, sys, pathlib

# Skill, który opisuje nieistniejącą klasę albo funkcję, myli bardziej,
# niż pomaga. Ta kontrola pilnuje, żeby dokumentacja nadążała za kodem.
index = pathlib.Path('apps-script/Index.html').read_text(encoding='utf-8')
css = re.search(r'<style>(.*?)</style>', index, re.S).group(1)
gs = [p.read_text(encoding='utf-8') for p in pathlib.Path('apps-script').glob('*.gs')]

# Rozszerzenia plików wyglądają jak klasy CSS, więc je pomijamy.
ROZSZERZENIA = {'doc', 'docx', 'pdf', 'html', 'md', 'gs', 'json', 'py', 'sh', 'js', 'css', 'png', 'svg'}
problemy = []

for skill in sorted(pathlib.Path('.claude/skills').glob('*/SKILL.md')):
    tresc = skill.read_text(encoding='utf-8')
    nazwa = skill.parent.name

    for klasa in sorted(set(re.findall(r'`\.([a-z][\w-]*)`', tresc))):
        if klasa not in ROZSZERZENIA and f'.{klasa}' not in css:
            problemy.append(f'{nazwa}: opisuje klasę .{klasa}, której nie ma w CSS')

    for zmienna in sorted(set(re.findall(r'`(--[\w-]+)`', tresc))):
        if f'{zmienna}:' not in css:
            problemy.append(f'{nazwa}: opisuje zmienną {zmienna}, której nie ma')

    for fn in sorted(set(re.findall(r'`(pobierz\w+|utworz\w+|zloz\w+)`', tresc))):
        if not any(f'function {fn}(' in t for t in gs):
            problemy.append(f'{nazwa}: wskazuje funkcję {fn}(), której nie ma')

    for skrypt in sorted(set(re.findall(r'`?scripts/([\w.]+)', tresc))):
        if not pathlib.Path('scripts', skrypt).exists():
            problemy.append(f'{nazwa}: odsyła do scripts/{skrypt}, którego nie ma')

if problemy:
    print('  ✗ ' + '\n  ✗ '.join(problemy))
    sys.exit(1)

print('  ✓ skille zgodne z kodem')
PYEOF

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
