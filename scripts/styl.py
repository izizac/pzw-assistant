#!/usr/bin/env python3
"""Szuka w tekstach projektu śladów pisania maszynowego.

Mierzy to, co da się policzyć, zamiast oceniać „na ucho”:

1. Pauza (długi myślnik) w polskim tekście. Polska typografia stosuje
   półpauzę z odstępami
   z odstępami; długa pauza to nawyk przeniesiony z angielszczyzny.
2. Zagęszczenie myślników. Badania z 2026 r. podają dla modeli ok. 10,6
   na 1000 słów wobec ludzkiej normy ok. 3,2. Próg ostrzeżenia: 6.
3. Skupienie myślników w jednym akapicie. Jeden bywa stylem, pięć jest
   podpisem maszyny.
4. Zwroty-wytrychy, polskie i angielskie.
5. Monotonia rytmu: gdy wszystkie zdania mają zbliżoną długość, tekst
   czyta się jak wygenerowany.

Użycie:
    python3 scripts/styl.py                # cały projekt
    python3 scripts/styl.py README.md      # wybrane pliki
    python3 scripts/styl.py --szczegoly    # wypisz każde trafienie

Kod wyjścia 1, gdy któryś próg został przekroczony.
"""

import re
import sys
from pathlib import Path

KORZEN = Path(__file__).resolve().parent.parent

# Znaki trzymamy w stałych, żeby własny tekst skryptu nie zawierał tego,
# czego skrypt szuka. Hurtowa podmiana raz już ten detektor rozbroiła.
PAUZA = chr(0x2014)        # długi myślnik, nawyk z angielszczyzny
POLPAUZA = r'(?<=\s)' + chr(0x2013) + r'(?=\s)'

# Progi. Zagęszczenia liczone na 1000 słów.
PROG_PAUZ_NA_1000 = 6.0
PROG_W_AKAPICIE = 3
PROG_ZMIENNOSC_ZDAN = 0.40

WYTRYCHY = [
    # polskie
    r'\bw dzisiejszym (?:dynamicznym )?świecie\b',
    r'\bwarto zauważyć,? że\b',
    r'\bwarto podkreślić,? że\b',
    r'\bnależy pamiętać,? że\b',
    r'\bw tym (?:artykule|rozdziale) przyjrzymy się\b',
    r'\bkluczow[ay] (?:rol|znaczeni)\w*\b',
    r'\bnie tylko\b[^.\n]{0,60}\bale (?:także|również)\b',
    r'\bstanowi (?:doskonał|świetn)\w+ (?:przykład|rozwiązanie)\b',
    r'\bpodsumowując,\s',
    r'\breasumując,\s',
    r'\bzanurzmy się\b',
    r'\bkompleksow[eay] (?:podejści|rozwiązani)\w*\b',
    # angielskie kalki i klasyki
    r'\bdelve\b', r'\btapestry\b', r'\bcrucial\b',
    r'\bit\'?s not just\b', r'\bin today\'?s fast-paced\b',
    r'\bseamless(?:ly)?\b', r'\brobust solution\b',
]

POMIJANE_KATALOGI = {'.git', 'node_modules', '.idea', '.claude'}
ROZSZERZENIA = {'.md', '.gs', '.html', '.py', '.sh'}


def teksty_z_pliku(sciezka: Path) -> str:
    """Z kodu bierzemy komentarze i napisy. Reszta to nie proza."""
    tresc = sciezka.read_text(encoding='utf-8')

    if sciezka.suffix in {'.md'}:
        # Bloki kodu nie są prozą.
        return re.sub(r'```.*?```', ' ', tresc, flags=re.S)

    if sciezka.suffix in {'.gs', '.html'}:
        fragmenty = re.findall(r'/\*.*?\*/|//[^\n]*', tresc, re.S)
        fragmenty += re.findall(r"'([^'\n]{12,})'", tresc)
        fragmenty += re.findall(r'<!--(.*?)-->', tresc, re.S)
        # Widoczny tekst z HTML, bez znaczników i skryptu.
        if sciezka.suffix == '.html':
            body = re.sub(r'(?s)<style.*?</style>|<script.*?</script>', ' ', tresc)
            fragmenty.append(re.sub(r'<[^>]+>', ' ', body))
        # Pusty wiersz między fragmentami, inaczej wszystkie komentarze
        # zlewają się w jeden akapit i miara skupienia traci sens.
        return '\n\n'.join(fragmenty)

    if sciezka.suffix in {'.py', '.sh'}:
        fragmenty = re.findall(r'"""(.*?)"""', tresc, re.S)
        fragmenty += re.findall(r'^\s*#[^\n]*', tresc, re.M)
        return '\n\n'.join(fragmenty)

    return tresc


def zdania(tekst: str):
    czesci = re.split(r'(?<=[.!?])\s+', tekst)
    return [c for c in czesci if len(c.split()) >= 4]


def zmiennosc(dlugosci):
    """Współczynnik zmienności. Zero znaczy, że wszystkie zdania są równe."""
    if len(dlugosci) < 5:
        return None
    srednia = sum(dlugosci) / len(dlugosci)
    if srednia == 0:
        return None
    wariancja = sum((d - srednia) ** 2 for d in dlugosci) / len(dlugosci)
    return (wariancja ** 0.5) / srednia


def zbadaj(sciezka: Path, szczegoly: bool):
    tekst = teksty_z_pliku(sciezka)
    slowa = len(tekst.split())
    if slowa < 120:
        return []

    uwagi = []

    # 1. Pauza zamiast półpauzy.
    pauzy = tekst.count(PAUZA)
    if pauzy:
        uwagi.append((
            'pauza',
            f'{pauzy}× długi myślnik; w polskim tekście stosuje się '
            f'półpauzę z odstępami',
        ))

    # 2. Zagęszczenie wszystkich myślników.
    myslniki = pauzy + len(re.findall(POLPAUZA, tekst))
    na_tysiac = myslniki * 1000 / slowa
    if na_tysiac > PROG_PAUZ_NA_1000:
        uwagi.append((
            'zagęszczenie',
            f'{na_tysiac:.1f} myślnika na 1000 słów '
            f'(norma ludzka ok. 3,2; próg {PROG_PAUZ_NA_1000})',
        ))

    # 3. Skupienie w jednym akapicie.
    for numer, akapit in enumerate(re.split(r'\n\s*\n', tekst), 1):
        ile = akapit.count(PAUZA) + len(re.findall(POLPAUZA, akapit))
        if ile > PROG_W_AKAPICIE:
            uwagi.append((
                'skupienie',
                f'akapit {numer}: {ile} myślników w jednym akapicie',
            ))

    # 4. Zwroty-wytrychy.
    for wzorzec in WYTRYCHY:
        for trafienie in re.finditer(wzorzec, tekst, re.I):
            uwagi.append(('wytrych', f'„{trafienie.group(0).strip()}”'))

    # 5. Rytm zdań.
    dl = [len(z.split()) for z in zdania(tekst)]
    wsp = zmiennosc(dl)
    if wsp is not None and wsp < PROG_ZMIENNOSC_ZDAN:
        uwagi.append((
            'rytm',
            f'zmienność długości zdań {wsp:.2f} '
            f'(poniżej {PROG_ZMIENNOSC_ZDAN} tekst brzmi monotonnie)',
        ))

    if not szczegoly:
        # Powtórzone rodzaje uwag zwijamy do jednej pozycji z licznikiem.
        zwiniete, licznik = [], {}
        for rodzaj, opis in uwagi:
            licznik.setdefault(rodzaj, []).append(opis)
        for rodzaj, opisy in licznik.items():
            zwiniete.append((rodzaj, opisy[0] if len(opisy) == 1
                             else f'{opisy[0]} (+{len(opisy) - 1} podobnych)'))
        return zwiniete

    return uwagi


def pliki(argumenty):
    if argumenty:
        # Katalog w argumencie rozwijamy; wcześniej skrypt się na tym wywracał.
        wskazane = []
        for arg in argumenty:
            sciezka = Path(arg)
            if sciezka.is_dir():
                wskazane += sorted(x for x in sciezka.rglob('*')
                                   if x.is_file() and x.suffix in ROZSZERZENIA)
            else:
                wskazane.append(sciezka)
        return wskazane

    znalezione = []
    for sciezka in KORZEN.rglob('*'):
        if any(cz in POMIJANE_KATALOGI for cz in sciezka.parts):
            continue
        if sciezka.is_file() and sciezka.suffix in ROZSZERZENIA:
            znalezione.append(sciezka)
    return sorted(znalezione)


def main() -> int:
    argumenty = [a for a in sys.argv[1:] if not a.startswith('--')]
    szczegoly = '--szczegoly' in sys.argv

    print('Ślady pisania maszynowego\n')
    razem = 0

    for sciezka in pliki(argumenty):
        uwagi = zbadaj(sciezka, szczegoly)
        if not uwagi:
            continue

        razem += len(uwagi)
        # Ścieżka spoza repozytorium nie da się skrócić, wtedy zostaje pełna.
        try:
            wzgledna = sciezka.relative_to(KORZEN)
        except ValueError:
            wzgledna = sciezka
        print(f'  {wzgledna}')
        for rodzaj, opis in uwagi:
            print(f'    [{rodzaj}] {opis}')
        print()

    if razem:
        print(f'Znaleziono {razem} uwag. Zacznij od „pauza” i „skupienie”; '
              f'te widać najbardziej.')
        return 1

    print('Bez zastrzeżeń.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
