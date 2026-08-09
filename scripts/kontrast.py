#!/usr/bin/env python3
"""Sprawdza kontrast palety w apps-script/Index.html względem WCAG 2.2.

Czyta zmienne CSS z bloku :root (motyw jasny) i z bloku prefers-color-scheme:
dark (motyw ciemny), po czym liczy współczynnik kontrastu dla par, które
faktycznie występują w interfejsie.

Progi: 4.5:1 dla tekstu, 3:1 dla tekstu ≥ 18,66 px pogrubionego oraz dla
elementów interfejsu (ramki pól, pierścień fokusu), czyli WCAG 1.4.3 i 1.4.11.
Rozmiary celów (2.5.8) i przesłonięcie fokusu (2.4.11) sprawdza skill przeglad-ui.

Użycie:  python3 scripts/kontrast.py
Zwraca kod 1, jeśli którakolwiek para nie spełnia progu.
"""

import re
import sys
from pathlib import Path

PLIK = Path(__file__).resolve().parent.parent / 'apps-script' / 'Index.html'

# (zmienna tekstu, zmienna tła, próg, opis)
PARY = [
    ('--tekst',        '--karta',   4.5, 'tekst podstawowy na karcie'),
    ('--tekst',        '--tlo',     4.5, 'tekst podstawowy na tle strony'),
    ('--tekst-2',      '--karta',   4.5, 'tekst drugorzędny, etykiety pól'),
    ('--tekst-2',      '--karta-2', 4.5, 'tekst drugorzędny w sekcji zwijanej'),
    ('--tekst-2',      '--tlo',     4.5, 'stopka'),
    ('--akcent',       '--karta',   4.5, 'odnośniki i aktywna zakładka'),
    ('--akcent',       '--tlo',     4.5, 'nagłówek marki'),
    ('--akcent',       '--karta-2', 4.5, 'odnośnik w sekcji zwijanej'),
    ('--akcent',       '--karta-2', 4.5, 'odwołanie do paragrafu Statutu'),
    ('--blad-tekst',   '--blad-tlo', 4.5, 'komunikat błędu'),
    ('--uwaga-tekst',  '--uwaga-tlo', 4.5, 'komunikat ostrzeżenia'),
    ('--uwaga-tekst',  '--karta',   4.5, 'status „za późno” pod datą'),
    ('--sukces-tekst', '--sukces-tlo', 4.5, 'podsumowanie wyniku'),
    ('--akcent',       '--akcent-tlo', 4.5, 'przycisk drugorzędny po najechaniu'),
    ('--w-terminie',   '--akcent-tlo', 3.0, 'wypełnienie wskaźnika: w terminie'),
    ('--blisko',       '--akcent-tlo', 3.0, 'wypełnienie wskaźnika: termin blisko'),
    ('--po-terminie',  '--akcent-tlo', 3.0, 'wypełnienie wskaźnika: po terminie'),
    ('--po-terminie',  '--karta',   4.5, 'etykieta „po terminie”'),
    ('--blisko',       '--karta',   4.5, 'etykieta „termin blisko”'),
    ('--w-terminie',   '--karta',   4.5, 'etykieta „w terminie”'),
    ('--ramka-mocna',  '--karta',   3.0, 'ramka pola formularza'),
    ('--akcent',       '--karta',   3.0, 'pierścień fokusu'),
]

# Tekst na przycisku głównym: kolor wpisany wprost, nie ze zmiennej.
PRZYCISK = [
    ('#ffffff', '--akcent', 4.5, 'napis na przycisku głównym (jasny)'),
    ('--napis-na-akcencie', '--akcent', 4.5, 'napis na przycisku głównym (ciemny)'),
]

# Blankiet ma własne, jasne barwy tekstu na granacie, też wpisane wprost.
BLANKIET = [
    ('#ffffff', '--granat',   4.5, 'tytuł w blankiecie'),
    ('--na-granacie', '--granat',   4.5, 'nazwa jednostki w blankiecie'),
    ('--na-granacie-slaby', '--granat',   4.5, 'teleadres w blankiecie'),
    ('#93a6cf', '--granat',   4.5, 'nagłówek i opisy w bloku terminów'),
    ('#cddcf5', '--granat',   4.5, 'odnośniki w bloku terminów'),
    ('#dfe7f6', '--granat',   4.5, 'licznik zaległości'),
    ('#eef3fc', '--granat',   4.5, 'nazwa gremium w bloku terminów'),
]


def zmienne(css: str, blok: str) -> dict:
    """Wyciąga pary --nazwa: wartość i rozwija odwołania var(--…).

    Nazwy semantyczne wskazują na role Material 3, więc bez rozwinięcia
    aliasów walidator nie zobaczyłby żadnej barwy.
    """
    pary = dict(re.findall(r'(--[\w-]+):\s*(#[0-9a-fA-F]{3,8})\s*;', blok))
    aliasy = dict(re.findall(r'(--[\w-]+):\s*var\((--[\w-]+)\)\s*;', blok))

    for _ in range(5):
        for nazwa, cel in aliasy.items():
            if nazwa not in pary and cel in pary:
                pary[nazwa] = pary[cel]

    return pary


def podziel(css: str):
    """Motyw jasny to pierwszy :root, ciemny nadpisuje go w media query."""
    ciemny_start = css.find('@media (prefers-color-scheme: dark)')
    jasny = zmienne(css, css[:ciemny_start])
    ciemny = dict(jasny)
    ciemny.update(zmienne(css, css[ciemny_start:css.find('* { box-sizing')]))
    return jasny, ciemny


def na_rgb(barwa: str):
    barwa = barwa.lstrip('#')
    if len(barwa) == 3:
        barwa = ''.join(z * 2 for z in barwa)
    return tuple(int(barwa[i:i + 2], 16) for i in (0, 2, 4))


def luminancja(rgb) -> float:
    def kanal(wartosc):
        s = wartosc / 255
        return s / 12.92 if s <= 0.03928 else ((s + 0.055) / 1.055) ** 2.4

    r, g, b = (kanal(k) for k in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def kontrast(a: str, b: str) -> float:
    la, lb = luminancja(na_rgb(a)), luminancja(na_rgb(b))
    jasniej, ciemniej = max(la, lb), min(la, lb)
    return (jasniej + 0.05) / (ciemniej + 0.05)


def sprawdz(nazwa_motywu: str, paleta: dict, pary) -> list:
    bledy = []
    print(f'\n  {nazwa_motywu}')

    for przod, tyl, prog, opis in pary:
        a = przod if przod.startswith('#') else paleta.get(przod)
        b = tyl if tyl.startswith('#') else paleta.get(tyl)

        if not a or not b:
            print(f'    ?    {opis:44s} brak zmiennej {przod if not a else tyl}')
            bledy.append(opis)
            continue

        wynik = kontrast(a, b)
        ok = wynik >= prog
        print(f'    {"✓" if ok else "✗"}  {opis:44s} {wynik:5.2f}:1  (próg {prog})')
        if not ok:
            bledy.append(f'{nazwa_motywu}: {opis} – {wynik:.2f}:1, wymagane {prog}')

    return bledy


def main() -> int:
    css = PLIK.read_text(encoding='utf-8')
    jasny, ciemny = podziel(css)

    print('Kontrast palety – WCAG 2.2 (1.4.3 tekst, 1.4.11 elementy interfejsu)')

    bledy = sprawdz('Motyw jasny', jasny, PARY + [PRZYCISK[0]] + BLANKIET)
    bledy += sprawdz('Motyw ciemny', ciemny, PARY + [PRZYCISK[1]] + BLANKIET)

    if bledy:
        print(f'\n✗ Nie spełnia progu: {len(bledy)}')
        for blad in bledy:
            print(f'  · {blad}')
        return 1

    print('\n✓ Wszystkie pary spełniają progi WCAG.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
