---
name: system
description: Spis komponentów i tokenów tego interfejsu. Wczytaj ZANIM dodasz cokolwiek widocznego w Index.html: przycisk, kartę, listę, plakietkę, wskaźnik, komunikat, pole. Sprawdź, czy potrzebna rzecz już istnieje, zamiast pisać nową klasę i nowy kolor.
---

# System, nie improwizacja

Zasada, dla której ten skill istnieje: **najpierw sprawdź spis niżej, dopiero
potem pisz nową klasę.** Bez tego każdy element powstaje od nowa, z własnym
odstępem i własnym odcieniem, i interfejs się rozjeżdża, mimo że każdy kawałek
z osobna wygląda znośnie.

Kierunek wizualny opisuje `interfejs`, audyt gotowego ekranu `przeglad-ui`.
Tutaj jest wyłącznie inwentarz i reguły użycia.

## Zanim dodasz element

1. Znajdź go w spisie. Coś podobnego prawie zawsze już jest.
2. Jeśli różnica jest niewielka, dołóż wariant do istniejącej klasy
   (jak `.karta.zwarta`), nie nową klasę od zera.
3. Nową klasę zakładasz tylko wtedy, gdy naprawdę nie ma jej odpowiednika.
   Wtedy **dopisz ją do spisu w tym pliku** w tym samym zapisie.
4. Uruchom `./scripts/sprawdz.sh`. Zatrzyma zaszyte wartości i rozmiary spoza
   skali, więc nie musisz na to uważać z pamięci.

## Tokeny, jedyne dozwolone wartości

Nie wpisuj pikseli, odcieni ani rozmiarów wprost. Wszystko idzie ze zmiennych
z `:root`.

**Odstępy:** `--p1` 4px · `--p2` 8px · `--p3` 12px · `--p4` 16px ·
`--p5` 24px · `--p6` 32px · `--p7` 48px

**Pismo:** `--t1` 0.7rem etykiety wersalikowe · `--t2` 0.8rem podpisy ·
`--t3` 0.9375rem listy · `--t4` 1rem baza · `--t5` 1.25rem tytuły kart ·
`--t6` 1.9rem nagłówek strony

**Grubości:** `--g-tekst` 400 · `--g-etykieta` 600 · `--g-naglowek` 700

**Barwy:** `--granat` belka · `--akcent` przyciski i odnośniki ·
`--tlo` `--karta` `--karta-2` powierzchnie · `--tekst` `--tekst-2` ·
`--ramka` `--ramka-mocna` · `--blad-*` `--uwaga-*` `--sukces-*` komunikaty ·
`--w-terminie` `--blisko` `--po-terminie` stany cyklu

**Pozostałe:** `--zaokraglenie` `--zaokraglenie-male` `--cel-dotyku` 44px

Dokładając parę barw, dopisz ją do `PARY` w `scripts/kontrast.py`, inaczej
nikt nie sprawdzi jej kontrastu.

## Spis komponentów

### Powierzchnie i układ

| Klasa | Do czego |
| --- | --- |
| `.belka` | granatowy pas na całą szerokość okna; w środku `.blankiet` |
| `.blankiet` | zawartość papieru firmowego: logo, tytuł, `.jednostka`, `.teleadres` |
| `.strona` | kontener treści, max 1040 px |
| `.kolumny` | dwie kolumny od 840 px: `main` oraz `.bok` |
| `.bok` | prawa szpalta, przyklejona, z własnym przewijaniem |
| `.karta` | biała powierzchnia robocza z ramką, bez cienia |
| `.karta.zwarta` | wariant dla szpalty: bez ramki, oddzielony kreską u góry |
| `.pas-terminow` | pas stanu wprost na tle strony, bez obudowy |

### Formularz

| Klasa | Do czego |
| --- | --- |
| `.pole` | opakowanie etykiety i kontrolki; odstęp dolny `--p4` |
| `.siatka` | trzy pola w rzędzie od 480 px (data, godzina, czas) |
| `.wskazowka` | zdanie pod polem: skutek wyboru, nie powtórzenie etykiety |
| `.dodatek` | dopisek w etykiecie, np. „opcjonalnie”; bez wersalików |
| `.glowny` | przycisk głównego działania, pełna szerokość |
| `.drugi` | przycisk drugorzędny, obrys |
| `.szeroki` | wariant szerokości dla obu powyższych |
| `details` + `.tresc-zwijana` | sekcja zwijana; `.licznik` po prawej w `summary` |
| `.wymogi` | zwijana sekcja z wymogami Statutu; `.paragraf` na odwołanie |

### Komunikaty i stany

| Klasa | Do czego |
| --- | --- |
| `.komunikat.blad` | błąd, `role="alert"` |
| `.komunikat.uwaga` | uwagi po utworzeniu, `role="status"` |
| `.status` + `.znak` + `.tresc` | linijka pod datą; znak `✓` albo `⚠` obok koloru |
| `.podsumowanie` | nagłówek wyniku z tytułem i terminem |
| `.pusto` | stan pusty listy; pełne zdanie, nie „brak danych” |
| `.szkielet` `.szkielet.krotki` | placeholder na czas wczytywania |
| `.plakietka` | krótka etykieta stanu przy pozycji listy |

### Listy i wskaźniki

| Klasa | Do czego |
| --- | --- |
| `.lista` | lista pozycji rozdzielonych kreską; buduje ją `pozycjaListy()` |
| `.lista .opis` | druga linijka pozycji; cyfry o stałej szerokości |
| `.tytul-boczny` + `.liczba` | nagłówek sekcji w szpalcie z licznikiem |
| `.wskazniki` | wiersze pasa terminów |
| `.tor` + `.wypelnienie` | wskaźnik udziału cyklu; barwa ze stanu na `li[data-stan]` |
| `.wiersz` + `.organ` + `.etykieta` | pierwsza linia wskaźnika: nazwa i stan |
| `.daty` | trzecia linia wskaźnika: cykl z lewej, termin z prawej |
| `.wskazniki li.klikalny` | wiersz, z którego da się zwołać to gremium |
| `.nawigacja-miesiaca` + `.drugi.krok` | przeskok miesięcy w kalendarzu |

### Pomocnicze

| Klasa | Do czego |
| --- | --- |
| `.tylko-czytnik` | treść wyłącznie dla czytników ekranu |
| `.pomin` | odnośnik pomijający, pierwszy w kolejności tabulacji |
| `.pasek` | nagłówek z przyciskiem po prawej |
| `.link-meet` | adres konferencji krojem maszynowym |

## Wzorce, które już rozstrzygnięto

Nie rozstrzygaj ich po raz drugi:

- **Pozycję listy buduje jedna z pięciu fabryk**, zależnie od kształtu wiersza.
  Zanim napiszesz własne `createElement('li')`, sprawdź, czy któraś pasuje:

  | Fabryka | Kształt wiersza |
  | --- | --- |
  | `pozycjaListy(tytul, opis, adres, plakietka)` | odnośnik i podpis pod nim |
  | `pozycjaStanu(stan)` | wiersz wskaźnika cyklu |
  | `pozycjaKalendarza(wpis)` | propozycja z polem wyboru |
  | `pozycjaDodatku(dodatek)` | dodatek do posiedzenia |
  | `naglowekEtapu(etap)` | śródtytuł grupujący pozycje |

  Trzy miejsca (`wypiszOtoczenie`, `wypiszUwagi`, `wypiszPlan`) budują wiersz
  na miejscu. To znany dług; dokładając tam coś, rozważ wyciągnięcie fabryki.

- Nie sklejaj `innerHTML` z danych z serwera.
- **Ukrywanie przez atrybut `hidden`**, nie przez klasę.
- **Wywołania serwera przez `serwer('nazwa', dane)`**, z `try`/`catch`
  i przywróceniem stanu przycisku w `finally`.
- **Każda lista ma cztery stany:** wczytywanie, pusto, błąd, treść.
- **Barwa nigdy sama.** Obok stoi znak albo etykieta słowna.
- **Bez cieni.** Głębię niesie powierzchnia i hierarchia.
- **Bez bibliotek i czcionek z sieci.** Sprawdzone doświadczalnie: komponenty
  webowe działają w sandboxie Apps Script (`allow-scripts` razem
  z `allow-same-origin`, zasoby po HTTPS), ale świadomie z nich nie
  korzystamy, żeby narzędzie nie zależało od cudzego serwisu. Jeśli ta
  decyzja się zmieni, zmieni się tutaj.

## Skille warte zainstalowania

`frontend-design` z marketplace `claude-plugins-official` (polecenie
`/plugin`) daje metodę pracy nad kierunkiem: najpierw plan tokenów, potem
krytyka planu, dopiero na końcu kod. Nie zna jednak tego projektu.
**Ten spis go zna**, więc przy dokładaniu elementów pierwszeństwo ma plik,
który właśnie czytasz.
