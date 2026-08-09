---
name: interfejs
description: Zmiany w Index.html — układ, style, dostępność, nowe pola i stany interfejsu. Użyj, gdy pada prośba o zmianę wyglądu, UX, UI, kolorów, responsywności, dostępności, WCAG, motywu ciemnego albo o dodanie kontrolki do formularza generatora posiedzeń.
---

# Interfejs generatora posiedzeń

Cały interfejs to jeden plik: `apps-script/Index.html` — styl, HTML i skrypt
klienta razem, bo Apps Script nie serwuje osobnych plików statycznych.

## Najpierw uruchom weryfikację

```bash
./scripts/sprawdz.sh
```

Sprawdza składnię trzech plików, spójność `id` / ARIA / etykiet pól oraz
kontrast palety względem WCAG. **Uruchom przed zmianą i po niej** — inaczej
nie odróżnisz swojego błędu od zastanego.

Sam kontrast: `python3 scripts/kontrast.py`. Skrypt czyta zmienne CSS wprost
z pliku, więc po podmianie koloru od razu wie, czy paleta nadal przechodzi.
Kolory dobieraj **obliczeniowo**, nie na oko — tak wyszło, że ramki pól miały
1,64:1 przy wymaganych 3:1.

## Potem obejrzyj efekt

```bash
python3 scripts/podglad.py            # zrzuty w /tmp/pzw-zrzuty
python3 scripts/podglad.py --otworz   # dodatkowo otwiera w przeglądarce
```

Skrypt podstawia atrapę `google.script.run` z przykładowymi danymi i renderuje
pięć ujęć: `biurko` (1200), `tablet` (820), `telefon` (390 w ramce), `wynik`
(drugi widok, wywoływany fragmentem `#wynik`) i `ciemny` (motyw ciemny —
zapytanie medialne zamieniane na `@media all`, bo Chrome nie ma flagi
przełączającej `prefers-color-scheme`). **Przeczytaj zrzuty** —
sklejone odstępy i zawinięty tekst widać dopiero na obrazku, żaden test ich
nie złapie.

Headless Chrome nie schodzi z oknem poniżej 500 px, dlatego wąskie ujęcie idzie
przez `<iframe>`. Nie „naprawiaj" układu na podstawie zrzutu zrobionego bez tej
sztuczki — pokaże przycięcie, którego w przeglądarce nie ma.

Dokładając pole do formularza, dopisz je też do atrapy w `scripts/podglad.py`,
inaczej podgląd przestanie odzwierciedlać rzeczywistość.

## Kierunek wizualny

Strona jest **blankietem**, nie panelem aplikacji — bo produkuje pismo urzędowe.
Stąd granatowa belka z oficjalnym godłem PZW, nazwą jednostki i teleadresem
wersalikami, jak na papierze firmowym Okręgu. Wynik narzędzia czyta się wtedy
jako ciąg dalszy tego samego dokumentu.

Belka jest **płaska**, bez gradientu — tak samo jak nagłówek `om.pzw.pl`.
Pierwsza wersja miała gradient i kroje szeryfowe; jedno i drugie okazało się
pomysłem projektanta, a nie identyfikacją Okręgu, i zostało wycofane po
porównaniu ze zrzutem ich serwisu.

Dwa elementy niosą tę myśl i tylko one mają prawo się wyróżniać:

1. **Blankiet** (`.blankiet`) — płaski granat, wklejone wektorowo logo PZW.
2. **Blok terminów statutowych** w panelu bocznym — pełny granat, jak wycinek
   blankietu. Dostaje jedyne mocne potraktowanie, bo jako jedyny niesie coś,
   czego użytkownik sam nie wie: czy cykl narzucony Statutem właśnie upływa.

### Pas terminów statutowych

Pod blankietem, na pełną szerokość, jeden wiersz na organ: nazwa, wskaźnik
i stan słowem. Wskaźnik pokazuje, jaka część cyklu upłynęła, liczona
w przeglądarce z dat `ostatnie` i `termin` (parser polskich dat w
`zeSformatowanej`). **Bez kompletu dat wskaźnik się nie pojawia** — zmyślony
pasek byłby gorszy niż jego brak.

Barwy wypełnień przeszły `scripts/validate_palette.js` ze skilla `dataviz`:
`#1f5aa8` w terminie, `#94700a` blisko, `#9c1330` po terminie. ΔE 20,2 przy
zwykłym widzeniu, 12,3 przy deuteranopii, każda powyżej 3:1 wobec toru.
Pierwsze dwa podejścia odpadły, bo bursztyn i czerwień siadały na ΔE 12.
**Nie dobieraj tych barw na oko, przepuść je przez walidator.**

Barwa nigdy nie niesie znaczenia sama: obok stoi etykieta słowna
(PO TERMINIE / TERMIN BLISKO / BRAK DANYCH), a tor ma `aria-label`
z procentem.

Reszta ma być cicha. Panel boczny **nie jest stosem kart**: pozostałe sekcje
to zwykłe listy na tle strony, rozdzielone kreską (`.bok .karta.zwarta`).
Projekt nie używa cieni; głębię niesie tło i hierarchia.

Stała pułapka: reguła `.bok .karta.zwarta` ma trzy klasy, więc bije selektor
atrybutowy. Blok terminów celuje w `.bok .karta.zwarta[aria-labelledby="…"]`.
Przy dokładaniu wariantów sprawdzaj specyficzność, bo dwa selektory potrafią
się cicho znieść.

**Logo** siedzi wklejone w `Index.html` jako SVG (~6 KB), nie jako odnośnik —
strona ma działać, gdy `ompzw.pl` nie odpowiada. Źródło:
`om.pzw.pl/brepo/panel_repo/2022/12/09/xnpisc/main-logo.svg`, wariant biały,
przeznaczony na ciemne tło. Godło Okręgu (okrągły emblemat) idzie osobno jako
favikona przez `KONFIG.okreg.godlo`.

Przy większych zmianach kierunku warto sięgnąć po oficjalny skill
`frontend-design` (marketplace `claude-plugins-official`) — to z niego pochodzi
metoda: najpierw plan tokenów i krytyka planu, dopiero potem kod.
Po zmianach uruchom przegląd: skill `przeglad-ui`.

## Układ

Dwie kolumny od 840 px: `main` z formularzem albo wynikiem, `aside.bok`
z panelem odniesienia (najbliższe, ostatnie, przydatne linki). Próg dobrany
tak, żeby na główną kolumnę zostało ~530 px — niżej formularz robi się ciasny
i lepiej wypada jedna kolumna.

Panel boczny jest `sticky` z własnym przewijaniem (`max-height: calc(100vh -
var(--p7))`), żeby długa lista linków nie uciekała poza ekran. Karty w nim mają
klasę `zwarta` — ciaśniejsze odstępy i drobniejszy tekst niż w kolumnie głównej.

## Skala i zmienne

Odstępy: `--p1`…`--p7` (4, 8, 12, 16, 24, 32, 48 px). Nie wpisuj pikseli
wprost — jeśli brakuje kroku, dołóż zmienną.

Kolory: wszystko przez zmienne z `:root`. Motyw ciemny podmienia **wyłącznie
wartości** w `@media (prefers-color-scheme: dark)` — nigdy nie dubluj reguł
dla ciemnego motywu.

| Zmienna | Do czego | Skąd |
| --- | --- | --- |
| `--granat`, `--granat-2` | belka blankietu | `#020c3a` — belka nagłówka om.pzw.pl |
| `--akcent`, `--akcent-ciemny`, `--akcent-tlo` | przyciski, odnośniki | `#012880` — przycisk główny om.pzw.pl |
| `--blekit` | krechy i znaki graficzne | `#084685` — akcent pomocniczy portalu |
| `--tlo`, `--karta`, `--karta-2` | tła: strona, karta, sekcja zwijana | |
| `--tekst`, `--tekst-2` | tekst podstawowy i drugorzędny | |
| `--ramka`, `--ramka-mocna` | linie rozdzielające, ramki pól | |
| `--blad-*`, `--uwaga-*`, `--sukces-*` | komunikaty | |

Barwy nie są dobrane „na oko" ani wzięte z arkuszy stylów — **odczytane
z pikseli zrzutu `om.pzw.pl`**. Serwis Okręgu przenosi się na ten portal,
więc to on jest wzorcem, nie archiwalne `ompzw.pl`.

Osobna sprawa: godło Okręgu ma własny, jaśniejszy błękit **`#4e76b4`**
(policzony z pliku godła). Używamy go **tylko tam, gdzie występuje samo
godło** — czyli w favikonie. Nie wprowadzaj go do interfejsu; obok granatu
portalu wygląda na pomyłkę.

Kroje w dwóch rolach: `--krój-tekstowy` (wszystko) i `--krój-maszynowy`
(paragrafy Statutu, link Meet, treść pisma). **Bez szeryfów** — serwis Okręgu
jest w całości bezszeryfowy, różnicę w nagłówkach niesie grubość (700–800)
i ciaśniejszy trakt. Żadnych czcionek z sieci.

Dokładając parę kolorów, dopisz ją do listy `PARY` w `scripts/kontrast.py`.

## Reguły dostępności obowiązujące w tym pliku

- **Cel dotykowy 44 px** (`--cel-dotyku`) na przyciskach, polach i `summary`.
- **`:focus-visible`** ma jeden globalny pierścień. Nie usuwaj `outline`.
- **Znak obok koloru.** Status wyprzedzenia niesie `✓` / `⚠`, bo sam kolor
  nie działa przy zaburzeniach widzenia barw.
- **`hidden`, nie klasa.** Ukrywanie przez atrybut `hidden` (`[hidden]`
  ma `display: none !important`) — znika też dla czytników ekranu.
- **Role komunikatów.** Błąd → `role="alert"` (przerywa). Status i uwagi →
  `role="status"` (czyta po kolei). Nie odwracaj.
- **Fokus po akcji.** Po utworzeniu posiedzenia fokus idzie na `#wynik-tytul`
  (`tabindex="-1"`), po powrocie na `#rodzaj`.
- **`prefers-reduced-motion`** wyłącza wszystkie animacje i przejścia.
- **Etykieta dla każdego pola.** Gdy wizualnie zbędna, użyj klasy
  `tylko-czytnik`. Skrypt weryfikacyjny tego pilnuje.

## Karty panelu bocznego

Każda karta w `aside.bok` to `<section class="karta zwarta">` z nagłówkiem
`h2.tytul-boczny` i opcjonalnym licznikiem w `span.liczba` (ustawia go
`ustawLiczbe()`, zero chowa). Pozycje list buduje `pozycjaListy(tytul, opis,
adres, plakietka)` — nie powielaj tej logiki.

Wcześniej panel był zestawem zakładek WAI-ARIA. Zastąpił je układ dwukolumnowy,
bo trzy listy naraz są czytelniejsze niż przełączanie, a na wąskim ekranie i tak
układają się jedna pod drugą. Nie wracaj do zakładek bez powodu.

## Wywołania serwera

Nie używaj `google.script.run` bezpośrednio — jest opakowane w `serwer()`,
które zwraca Promise:

```js
const wynik = await serwer('utworzPosiedzenie', dane);
```

Funkcje dostępne z klienta: `pobierzDomyslne`, `utworzPosiedzenie`,
`pobierzNadchodzace`, `pobierzMinione`, `utworzWersjeRoboczaMaila`.
Funkcje z podkreśleniem na końcu są w Apps Script prywatne i **nie da się ich
wywołać z przeglądarki**.

Każde wywołanie owiń w `try`/`catch` z `pokazBlad()` i przywróć stan przycisku
w `finally` — inaczej po błędzie zostanie zablokowany.

## Stany, o których łatwo zapomnieć

Dokładając listę albo sekcję, obsłuż wszystkie cztery:

1. **wczytywanie** — `.szkielet` (z `aria-hidden="true"`),
2. **pusto** — zdanie w `.pusto`, nie pusty obszar,
3. **błąd** — `pokazBlad()`,
4. **treść**.

Pierwsze wypełnienie formularza przychodzi **dwoma niezależnymi wywołaniami**
(`pobierzDomyslne` i `pobierzMinione`). To drugie może dobiec później,
dlatego ponownie woła `zastosujRodzaj()` — ale tylko gdy pole daty jest puste,
żeby nie nadpisać tego, co użytkownik zdążył wpisać. Utrzymaj ten warunek.

## Czego nie robić

- Nie dodawaj bibliotek ani czcionek z CDN — narzędzie ma działać bez sieci
  poza Google i bez zgód na zewnętrzne zasoby.
- Nie wstawiaj `innerHTML` z danymi z serwera. Buduj elementy przez
  `createElement` i `textContent`; jest do tego `pozycjaListy()`.
- Nie zmieniaj nazwy pliku — `doGet()` woła `createHtmlOutputFromFile('Index')`.
