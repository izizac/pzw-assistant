#!/usr/bin/env python3
"""Generuje paletę tonalną w układzie ról Material Design 3 z barwy PZW.

Material 3 nie jest tu biblioteką, tylko systemem nazw i stopni. Bierzemy
z niego dwie rzeczy:

1. **Stopnie tonalne** 0–100 dla każdej rodziny barw (główna, neutralna,
   neutralna wariantowa, błędu).
2. **Role** typu primary / on-primary / primary-container / surface / outline,
   dzięki którym element dostaje barwę z nazwy zadania, a nie z widzimisię.

Ziarnem jest #012880, czyli przycisk główny z serwisu Okręgu. Cała paleta
wychodzi z tej jednej barwy, więc tożsamość PZW zostaje.

Zastrzeżenie: Material liczy tony w przestrzeni HCT (na bazie CAM16).
Tutaj używamy OKLCh, która jest znacznie prostsza, a dla tonalnych ramp daje
bardzo zbliżony rozkład jasności. To przybliżenie, nie wierna implementacja,
dlatego każdą wynikową parę i tak sprawdza scripts/kontrast.py.

Użycie:
    python3 scripts/tony.py            # wypisz blok CSS ze zmiennymi
    python3 scripts/tony.py --tabela   # wypisz same stopnie do wglądu
"""

import math
import sys

ZIARNO = '#012880'

# Nasycenie rodzin, w skali OKLCh. Material używa chromy HCT 48 dla głównej,
# 4 dla neutralnej i 8 dla wariantowej; poniżej odpowiedniki w OKLCh.
CHROMA = {
    'glowna': 0.13,
    'neutralna': 0.006,
    'wariantowa': 0.016,
    'bledu': 0.16,
}

# Barwa czerwieni błędu jest w Material stała, niezależna od ziarna.
ODCIEN_BLEDU = 25.0

STOPNIE = [0, 4, 6, 10, 12, 17, 20, 22, 24, 30, 40, 50, 60, 70, 80, 87, 90,
           92, 94, 95, 96, 98, 99, 100]


# ── Konwersje barw ───────────────────────────────────────────────────────────

def na_liniowe(k: float) -> float:
    return k / 12.92 if k <= 0.04045 else ((k + 0.055) / 1.055) ** 2.4


def na_gamma(k: float) -> float:
    return 12.92 * k if k <= 0.0031308 else 1.055 * (k ** (1 / 2.4)) - 0.055


def hex_na_oklch(barwa: str):
    barwa = barwa.lstrip('#')
    r, g, b = (na_liniowe(int(barwa[i:i + 2], 16) / 255) for i in (0, 2, 4))

    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l, m, s = (x ** (1 / 3) if x > 0 else -((-x) ** (1 / 3)) for x in (l, m, s))

    jasnosc = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s
    a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s
    b_ = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s

    return jasnosc, math.hypot(a, b_), math.degrees(math.atan2(b_, a)) % 360


def oklch_na_hex(jasnosc: float, chroma: float, odcien: float) -> str:
    a = chroma * math.cos(math.radians(odcien))
    b_ = chroma * math.sin(math.radians(odcien))

    l = (jasnosc + 0.3963377774 * a + 0.2158037573 * b_) ** 3
    m = (jasnosc - 0.1055613458 * a - 0.0638541728 * b_) ** 3
    s = (jasnosc - 0.0894841775 * a - 1.2914855480 * b_) ** 3

    r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    b = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s

    return '#' + ''.join(
        f'{max(0, min(255, round(na_gamma(max(0.0, min(1.0, k))) * 255))):02x}'
        for k in (r, g, b)
    )


def ton(rodzina: str, stopien: int, odcien: float) -> str:
    """Stopień 0 to czerń, 100 to biel; pomiędzy rośnie jasność."""
    jasnosc = stopien / 100
    chroma = CHROMA[rodzina] * math.sin(math.pi * jasnosc) if 0 < stopien < 100 else 0
    return oklch_na_hex(jasnosc, chroma, odcien)


# ── Role Material 3 ──────────────────────────────────────────────────────────

def role(odcien: float, ciemny: bool) -> dict:
    g, n, w, b = 'glowna', 'neutralna', 'wariantowa', 'bledu'
    t = lambda rodzina, stopien: ton(rodzina, stopien,
                                     ODCIEN_BLEDU if rodzina == b else odcien)

    if not ciemny:
        return {
            'primary': t(g, 40), 'on-primary': t(g, 100),
            'primary-container': t(g, 90), 'on-primary-container': t(g, 10),
            'surface': t(n, 98), 'on-surface': t(n, 10),
            'surface-container-low': t(n, 96),
            'surface-container': t(n, 94),
            'surface-container-high': t(n, 92),
            'surface-variant': t(w, 90), 'on-surface-variant': t(w, 30),
            'outline': t(w, 50), 'outline-variant': t(w, 80),
            'inverse-surface': t(n, 20), 'inverse-on-surface': t(n, 95),
            'error': t(b, 40), 'on-error': t(b, 100),
            'error-container': t(b, 90), 'on-error-container': t(b, 10),
        }

    return {
        'primary': t(g, 80), 'on-primary': t(g, 20),
        'primary-container': t(g, 30), 'on-primary-container': t(g, 90),
        'surface': t(n, 6), 'on-surface': t(n, 90),
        'surface-container-low': t(n, 10),
        'surface-container': t(n, 12),
        'surface-container-high': t(n, 17),
        'surface-variant': t(w, 30), 'on-surface-variant': t(w, 80),
        'outline': t(w, 60), 'outline-variant': t(w, 30),
        'inverse-surface': t(n, 90), 'inverse-on-surface': t(n, 20),
        'error': t(b, 80), 'on-error': t(b, 20),
        'error-container': t(b, 30), 'on-error-container': t(b, 90),
    }


def main() -> int:
    jasnosc, chroma, odcien = hex_na_oklch(ZIARNO)
    print(f'/* Ziarno {ZIARNO}: OKLCh L={jasnosc:.3f} C={chroma:.3f} '
          f'H={odcien:.1f}° */', file=sys.stderr)

    if '--tabela' in sys.argv:
        print(f'{"stopień":>8s}  ' + '  '.join(f'{r:>11s}' for r in CHROMA))
        for stopien in STOPNIE:
            barwy = [ton(r, stopien, ODCIEN_BLEDU if r == 'bledu' else odcien)
                     for r in CHROMA]
            print(f'{stopien:>8d}  ' + '  '.join(f'{b:>11s}' for b in barwy))
        return 0

    for etykieta, ciemny in [('jasny', False), ('ciemny', True)]:
        print(f'\n  /* Material 3, motyw {etykieta} */')
        for nazwa, barwa in role(odcien, ciemny).items():
            print(f'    --m3-{nazwa}: {barwa};')

    return 0


if __name__ == '__main__':
    sys.exit(main())
