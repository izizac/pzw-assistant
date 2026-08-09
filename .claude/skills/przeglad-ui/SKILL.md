---
name: przeglad-ui
description: Audyt gotowego interfejsu na zrzutach — hierarchia, odstępy, stany, klawiatura, WCAG 2.2, zgodność z serwisem Okręgu. Użyj po zmianach w Index.html, gdy pada prośba o przegląd wyglądu, dopracowanie, sprawdzenie dostępności albo pytanie „czy to dobrze wygląda”.
---

# Przegląd interfejsu

Ten skill **nie projektuje** — sprawdza to, co już jest, i zwraca listę usterek
z wagą. Kierunek wizualny i nowe elementy: skill `interfejs`.

## Krok 1 — uruchom narzędzia

```bash
./scripts/sprawdz.sh          # składnia, spójność .gs, ARIA, kontrast
python3 scripts/podglad.py    # 5 zrzutów w /tmp/pzw-zrzuty
```

Dopiero potem **przeczytaj zrzuty**. Nie oceniaj układu z kodu — sklejone
odstępy, ucięty tekst i rozjechane kolumny widać wyłącznie na obrazku.

## Krok 2 — przejdź listę na każdym zrzucie

**biurko (1200)** — czy prawa kolumna nie przytłacza formularza; czy główna
kolumna nie jest szersza niż ~660 px w miejscach, gdzie czyta się zdania.

**tablet (820)** — układ jednokolumnowy; czy formularz nie rozciąga się na
całą szerokość tak, że etykieta i pole tracą związek.

**telefon (390 w ramce)** — pola jedno pod drugim, nic nie wystaje poza kartę,
przyciski pełnej szerokości, teleadres łamie się po członach.

**wynik** — czy uwagi są nad treścią, a nie pod; czy przyciski kopiowania
stoją przy tym, co kopiują.

**ciemny** — czy któraś barwa nie została z poprzedniej palety (to się już
zdarzyło: napis na przycisku był zielony po przejściu na granat).

## Krok 3 — waga usterek

Zgłaszaj z wagą, nie hurtem. Kolejność naprawiania wynika z wagi:

| Waga | Co to jest | Przykład |
| --- | --- | --- |
| **Blokada** | łamie WCAG albo uniemożliwia zadanie | kontrast poniżej progu, pole bez etykiety, fokus niewidoczny |
| **Wysoka** | działa, ale myli albo boli | ucięty tekst, sklejone grupy pól, brak stanu pustego |
| **Średnia** | niespójność w obrębie strony | dwa różne promienie zaokrągleń, odstęp spoza skali |
| **Niska** | dopracowanie | mikrotypografia, cień, drobne przesunięcie |

Przy każdej usterce podaj **zrzut i miejsce**, nie samo „poprawić odstępy”.

## Krok 4 — klawiatura i czytnik

Czego zrzut nie pokaże, a trzeba sprawdzić w kodzie:

- kolejność tabulacji idzie z góry na dół, bez skoków do panelu bocznego
  w środku formularza,
- `:focus-visible` widoczny na każdym elemencie interaktywnym,
- po utworzeniu posiedzenia fokus ląduje na `#wynik-tytul`,
- błąd ma `role="alert"`, statusy `role="status"`,
- `Enter` w polu wysyła formularz (jest `type="submit"`),
- animacje znikają przy `prefers-reduced-motion`.

## WCAG 2.2 — co doszło ponad 2.1

`scripts/kontrast.py` pokrywa 1.4.3 i 1.4.11. Ręcznie sprawdź:

- **2.5.8 Target Size (Minimum)** — 24×24 px. Projekt trzyma 44 px
  (`--cel-dotyku`), więc przechodzi z zapasem; pilnuj przy nowych kontrolkach.
- **2.4.11 Focus Not Obscured** — element z fokusem nie może chować się pod
  przyklejonym panelem. Panel boczny jest obok treści, nie nad nią, ale gdyby
  pojawił się przyklejony pasek u dołu, ten punkt trzeba przeliczyć od nowa.
- **3.3.7 Redundant Entry** — nie każ wpisywać drugi raz tego, co już podano.
  Stąd podpowiadanie godziny i miejsca z poprzedniego posiedzenia.

## Znaki interfejsu generowanego maszynowo

Osobna lista, bo te rzeczy przechodzą przez wszystkie testy techniczne
i widać je dopiero, gdy ktoś zapyta „czemu to wygląda jak z generatora”.
Sprawdź każdą pozycję na zrzucie:

| Wzorzec | Dlaczego zdradza |
| --- | --- |
| **Kolorowy pasek 3–4 px z lewej strony bloku** | wskazywany jako najpewniejszy pojedynczy znak; był tu przy sekcji ze Statutem i wypadł |
| Jednakowy delikatny cień na każdej powierzchni | głębię ma nieść hierarchia, nie rozmycie; projekt jest płaski |
| Stos jednakowych kart, zwłaszcza trzech | powtórzony komponent zamiast hierarchii informacji |
| Ten sam promień zaokrągleń na wszystkim | |
| Gradient w nagłówku, szczególnie fioletowo-granatowy | belka Okręgu jest płaska |
| Wyśrodkowany hero z podtytułem i dwoma przyciskami | |
| Emoji zamiast ikon, ikony cienkokreskowe u góry każdej karty | |
| Wszystkie sekcje o tej samej wadze wizualnej | |

Zasada, która to porządkuje: **mocne potraktowanie należy się jednemu
elementowi**, temu, który niesie coś, czego użytkownik sam nie wie. Tutaj jest
to blok terminów statutowych. Reszta panelu bocznego to zwykłe listy na tle
strony, rozdzielone kreską, bez ramek i cieni.

Zanim uznasz, że wyróżnienie „coś znaczy”, sprawdź, czy nie jest po prostu
popularnym wzorcem. Krecha przy paragrafach wydawała się uzasadniona treścią,
a była kliszą.

## Zgodność z serwisem Okręgu

Interfejs ma wyglądać jak przedłużenie `om.pzw.pl`, nie jak osobny produkt.
Barwy odczytane z pikseli ich portalu: belka `#020c3a`, przycisk `#012880`,
akcent `#084685`. Krój bezszeryfowy, zaokrąglenia umiarkowane, belka płaska
bez gradientu.

Jeśli masz wątpliwość, czy coś pasuje — zrób zrzut ich strony i porównaj obok:

```bash
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CH" --headless --disable-gpu --hide-scrollbars \
  --screenshot=/tmp/site-om.png --window-size=1200,900 --virtual-time-budget=6000 \
  "https://om.pzw.pl/strefa-pzw/zarzad-okregu"
```

To rozstrzyga szybciej niż dyskusja. Tak wyszło, że pierwsza wersja miała
gradient i szeryfy, których w ich serwisie nie ma.

## Czego nie robić

- Nie zgłaszaj usterki bez zrzutu albo bez odwołania do konkretnego wymogu.
- Nie „poprawiaj” układu na podstawie zrzutu telefonu zrobionego bez ramki —
  headless Chrome nie schodzi poniżej 500 px i pokaże przycięcie, którego
  w przeglądarce nie ma.
- Nie mieszaj przeglądu z przeprojektowaniem. Najpierw lista usterek,
  decyzja o kierunku osobno.
