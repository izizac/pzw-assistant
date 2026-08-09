# CLAUDE.md

Instrukcje dla agenta AI pracującego w tym repozytorium.

## Czym jest ten projekt

Generator posiedzeń **Okręgu Mazowieckiego PZW** w Google Apps Script. Zakłada
wydarzenie w Kalendarzu Google z konferencją Meet i składa gotowe zawiadomienie
do wklejenia w maila, pilnując terminów ze Statutu PZW.

To narzędzie dla **władz okręgu**, nie koła. Jeśli w kodzie albo w tekście
zobaczysz „koło”, „walne zgromadzenie” czy odwołanie do Regulaminu
Organizacyjnego Koła — to pozostałość po wcześniejszej wersji i błąd.
Właściwa podstawa to Statut PZW, rozdział V „Okręgi Związku”.

## Język

**Cały projekt jest po polsku** — nazwy funkcji, zmiennych, komentarze, README,
komunikaty. Nie tłumacz nazw na angielski i nie mieszaj języków. Funkcje
prywatne kończą się podkreśleniem (`zlozZaproszenie_`), zgodnie z konwencją
Apps Script.

Teksty dla ludzi pisz tak, żeby nie brzmiały jak wygenerowane: półpauza „–”
zamiast pauzy „—”, myślnik tylko wtedy, gdy nie pasuje kropka ani przecinek,
bez zwrotów typu „warto zauważyć, że”. Mierzy to `python3 scripts/styl.py`,
szczegóły w skillu `polszczyzna`.

Polska odmiana jest wpisana wprost, nie generowana regułką — patrz
`DNI_W_ZDANIU`, `MIESIACE_DOPELNIACZ` w `Kod.gs` i `nazwaDopelniaczKrotka`
w `Konfiguracja.gs`. Gdy dodajesz tekst, który wymaga odmiany, dopisz gotową
formę zamiast kombinować z końcówkami.

## Pliki

| Plik                         | Rola                                                     |
| ---------------------------- | -------------------------------------------------------- |
| `apps-script/Konfiguracja.gs` | `KONFIG` + `RODZAJE_POSIEDZEN` — jedyny plik do edycji przez użytkownika |
| `apps-script/Kod.gs`          | podgląd i utworzenie wydarzenia, Meet, tekst zawiadomienia, historia |
| `apps-script/Dodatki.gs`      | katalog dodatków i runner: `DODATKI`, `dopnijDodatek()`    |
| `apps-script/Podpisy.gs`      | kto zwołuje, podpis pod pismem, listy adresowe, zwrot powitalny |
| `apps-script/Goscie.gs`       | goście wydarzenia, odpowiedzi RSVP, werdykt o kworum      |
| `apps-script/Uchwaly.gs`      | rejestr uchwał w arkuszu, tryb § 48 ust. 2                |
| `apps-script/Plan.gs`         | plan roczny posiedzeń jako zapowiedzi w kalendarzu        |
| `apps-script/Terminarz.gs`    | cykl statutowy liczony z historii, wyzwalacz przypomnień D-1 |
| `apps-script/Zmiany.gs`       | odwoływanie i przenoszenie zwołanych posiedzeń            |
| `apps-script/Dokumenty.gs`    | szkielet protokołu w Dokumentach Google                   |
| `apps-script/Index.html`      | interfejs (styl + HTML + skrypt klienta w jednym pliku)  |
| `apps-script/appsscript.json` | manifest: strefa czasowa, Calendar API, zakresy OAuth    |
| `docs/`                       | wyciągi ze Statutu, fakty o Okręgu, sprawdzone linki      |
| `scripts/`                    | `sprawdz.sh` (weryfikacja), `kontrast.py` (WCAG), `podglad.py` (zrzuty), `styl.py` (styl tekstu) |
| `.claude/skills/`             | `rodzaj-posiedzenia`, `interfejs`, `przeglad-ui`, `napisy`, `polszczyzna`, `dane-osobowe`, `zrodla-pzw` |

Nazwa pliku HTML musi być `Index` — `doGet()` woła
`HtmlService.createHtmlOutputFromFile('Index')`.

## Weryfikacja zmian

Nie ma testów ani buildu. Apps Script nie da się tu uruchomić, ale kod jest
zwykłym JS-em. Jedna komenda sprawdza wszystko, co da się sprawdzić maszynowo:

```bash
./scripts/sprawdz.sh
```

Składnia wszystkich plików `.gs`, spójność `id` / ARIA / etykiet pól
w interfejsie i kontrast palety względem WCAG. Uruchom **przed** zmianą
i po niej, żeby odróżnić swój błąd od zastanego.

Funkcje czysto tekstowe (`zlozPodglad`, `zlozZaproszenie_`, `zlozOdwolanie_`,
`zbadajCyklRodzaju_`) uruchamiaj z atrapami globali. `const` na najwyższym
poziomie nie wycieka z `eval`, więc użyj `vm.runInThisContext`. Wczytaj
**wszystkie** pliki `.gs` — funkcje wołają się między nimi (`zlozZaproszenie_`
z `Kod.gs` sięga po `zlozPodpis_` z `Podpisy.gs`):

```js
global.Utilities = { getUuid: () => 'x', formatDate: (d, tz, f) => { /* … */ } };
const fs = require('fs');
['Konfiguracja', 'Kod', 'Podpisy', 'Terminarz', 'Zmiany', 'Dokumenty']
  .forEach((f) => require('vm').runInThisContext(
    fs.readFileSync(`apps-script/${f}.gs`, 'utf8')
  ));
console.log(zlozPodglad({ rodzaj: 'prezydium', data: '2026-09-17', /* … */ }));
```

**Zawsze przeczytaj wygenerowany tekst zawiadomienia.** Przez `node --check`
przechodzą bez szemrania trzy pułapki, z których każda już raz tu wystąpiła:

- **Podwójna kropka** — `sformatujDate_` kończy się na „r.”, więc po dacie
  nigdy nie dokładaj kropki. Data sama zamyka zdanie („…do 11 września 2026 r.
  — zostało 33 dni.”).
- **Podwójny przyimek** — `DNI_W_ZDANIU` niesie własny przyimek („we wtorek”).
  Po „zwołane na” użyj `dzienBezPrzyimka_`, inaczej wychodzi „zwołane na
  we wtorek”.
- **Podwójna nazwa** — `rodzaj.nazwa` już zawiera „Zarządu Okręgu”. Doklejenie
  `nazwaDopelniaczKrotka` daje „Zarządu Okręgu Okręgu Mazowieckiego PZW”;
  w środku zdania używaj `nazwaWZdaniu_`, które bierze tytuł wydarzenia.

Dla `pobierzMinione()` podstaw atrapę `global.Calendar.Events.list`.

Kolory dobieraj obliczeniowo — `python3 scripts/kontrast.py` czyta zmienne CSS
wprost z `Index.html` i mówi, czy paleta spełnia progi WCAG. Tak wyszło, że
ramki pól miały 1,64:1 przy wymaganych 3:1.

**Interfejs obejrzysz bez wdrażania.** `python3 scripts/podglad.py` podstawia
atrapę `google.script.run`, składa stronę w `/tmp` i robi pięć zrzutów: biurko,
tablet, telefon, widok wyniku i motyw ciemny. Po zmianie w `Index.html` **zobacz
zrzuty** — odstępy i zawijanie tekstu wychodzą dopiero na obrazku.

Uwaga na pułapkę: headless Chrome nie schodzi z oknem poniżej 500 px, więc
zrzut „telefonu" idzie przez `<iframe>` o zadanej szerokości. Bez tego wąski
układ wygląda na zepsuty, choć jest poprawny.

## Zasady projektowe

**Bez `RRULE`.** Każde posiedzenie to osobne wydarzenie. Seria dzieliłaby jeden
link Meet, a przesunięcie terminu wymagałoby wyjątków serii. Wydarzenia
rozpoznajemy po `extendedProperties.private.zrodlo`.

**Podstawa prawna przy każdym twierdzeniu.** Wymogi formalne noszą numer
paragrafu (`§ 46 ust. 1`). Nie dopisuj reguły, której nie potwierdzisz
w `docs/statut-pzw-okreg.md` albo w źródle. Zmyślony paragraf w zawiadomieniu
rozsyłanym do władz okręgu to realna szkoda.

**Ostrzeżenia nie blokują.** `zbadajTerminy_` zwraca listę zdań; wydarzenie
i tak powstaje. Decyzja należy do zwołującego.

**Najpierw tekst, potem kalendarz.** `zlozPodglad()` składa zawiadomienie
bez dotykania kalendarza; wydarzenie powstaje dopiero w `utworzPosiedzenie()`,
z treścią przekazaną w `dane.tresc`. Nie odwracaj tej kolejności — poprawka
literówki nie może zostawiać w kalendarzu odwołanego posiedzenia i drugiego
linku Meet. Link Meet wchodzi w `MIEJSCE_NA_LINK` dopiero przy zapisie.

**Ścieżka krytyczna to trzy rzeczy: wydarzenie, link Meet, tekst.** Tyle robi
`utworzPosiedzenie()`. Folder na Dysku, protokół, lista obecności, pismo do
druku, goście i przypomnienie o cyklu to **dodatki** z `Dodatki.gs`: osobne
wywołania z przeglądarki, każde może paść bez szkody dla pozostałych i dla
samego posiedzenia. Nie wciągaj niczego z powrotem do głównego wywołania,
bo posiedzenie ma dać się zwołać bez tego wszystkiego.

Dodatek musi spełniać trzy warunki: nigdy nie rzuca wyjątkiem (błąd wraca jako
stan `blad`), zostawia znacznik `d.<id>` we właściwościach prywatnych
wydarzenia, żeby dopięcie było idempotentne, i jest opisany wyłącznie w tablicy
`DODATKI` — kod nie zna żadnego dodatku z nazwy. Zapis znacznika idzie pod
`LockService`, bo równoległe łatki na `extendedProperties` potrafią się
nadpisać.

**Po utworzeniu wydarzenia nie rzucaj wyjątkiem.** Od `Calendar.Events.insert`
w dół wszystko, co pójdzie nie tak, dopisuje się do `ostrzezenia` — patrz
`wstawLinkWTresc_`. Wyjątek zostawiłby w kalendarzu sierotę, a zwołujący
kliknąłby drugi raz i miałby dwa posiedzenia z dwoma linkami.

**Podpis idzie za organem i za osobą.** Posiedzenie zwołuje prezes albo
upoważniony członek zarządu, odpowiednio wiceprezes (§ 46 ust. 2, § 48 ust. 4),
więc podpis jest wybierany z `KONFIG.zwolujacy` przy każdym zawiadomieniu —
nie wpisuj go na stałe w tekst.

**Dane statutowe siedzą w `RODZAJE_POSIEDZEN`, nie w logice.** Nowy rodzaj
posiedzenia to nowy wpis w tablicy — `Kod.gs` nie powinien znać żadnego `id`.

## Uprawnienia

`appsscript.json` prosi o `calendar`, `gmail.compose`, `userinfo.email`,
`documents` (protokół, lista obecności, pismo), `spreadsheets` (rejestr uchwał),
`drive` (folder na materiały) i `script.scriptapp` (wyzwalacz przypomnień D-1).
Rozszerzenie zakresów wymusza ponowną autoryzację u użytkownika — nie dodawaj
ich bez potrzeby i odnotuj zmianę w README. `gmail.compose` pozwala tylko
zapisać wersję roboczą, nie wysłać maila; to celowe i dotyczy również
przypomnień D-1, które tylko przygotowują wersję roboczą.

Odczyt wyzwalaczy (`stanPrzypomnien`) leci przy każdym otwarciu narzędzia,
więc brak zgody na `script.scriptapp` ma chować przycisk, a nie wywalać stronę.

Adresy członków idą do **UDW (BCC)** — mail do grupy osób nie może ujawniać
całej listy adresowej pozostałym odbiorcom.

## Czego nie robić

- Nie commituj bez wyraźnej prośby.
- Nie wpisuj do konfiguracji **adresów** konkretnych osób — `adresyDoWysylki`
  i `adresy` zostają puste, uzupełnia je użytkownik.
- Nazwiska są wyjątkiem: `KONFIG.zwolujacy` zawiera imienny skład Zarządu
  za oficjalnym wykazem Okręgu, bo bez niego nie da się wybrać, kto podpisuje.
  Nie dopisuj tam nikogo „z głowy” — funkcję potwierdź w wykazie
  (`docs/linki.md` → Skład Zarządu) i odnotuj datę sprawdzenia.
- Nie zmieniaj `ZNACZNIK_NARZEDZIA` — po nim narzędzie znajduje wcześniej
  utworzone wydarzenia w kalendarzu użytkownika.
