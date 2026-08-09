# Google Apps Script — notatki techniczne

Wszystko, na czym można się w tym projekcie przejechać.

## Architektura

Aplikacja internetowa Apps Script (`doGet` → `HtmlService`). Brak buildu,
brak zależności, brak serwera. Klient woła serwer przez `google.script.run`,
który jest **asynchroniczny i nie zwraca Promise** — obsługę wyniku wpina się
przez `.withSuccessHandler()` / `.withFailureHandler()`.

Funkcje wywoływane z przeglądarki: `pobierzDomyslne`, `utworzPosiedzenie`,
`pobierzNadchodzace`, `pobierzMinione`, `utworzWersjeRoboczaMaila`.
Reszta ma sufiks `_`, który w Apps Script oznacza funkcję prywatną —
**niedostępną dla `google.script.run`**. Zmiana nazwy funkcji publicznej
wymaga poprawki w `Index.html`.

Nazwa pliku HTML musi być `Index` — inaczej `createHtmlOutputFromFile('Index')`
rzuci wyjątkiem.

## Kalendarz i Meet

Link Meet powstaje **jednym wywołaniem** `Calendar.Events.insert`
z `conferenceData.createRequest` i parametrem `conferenceDataVersion: 1`.
Bez tego parametru konferencja się nie utworzy, a błędu nie będzie.

`requestId` musi być unikalny — stąd `Utilities.getUuid()`.

**Link bywa dopisywany z opóźnieniem.** Odpowiedź na `insert` często nie
zawiera jeszcze `hangoutLink`. `pobierzLinkMeet_` odpytuje do 5 razy
co 1,5 s. Link czytamy z `hangoutLink` albo z `conferenceData.entryPoints[]`
o `entryPointType === 'video'`.

**Usługa zaawansowana `Calendar`** musi być włączona. Robi to manifest
(`dependencies.enabledAdvancedServices`), ale przy ręcznym zakładaniu projektu
łatwo o tym zapomnieć — `wstawWydarzenie_` łapie `Calendar is not defined`
i tłumaczy, co kliknąć.

### Znakowanie i wyszukiwanie wydarzeń

Wydarzenia znakujemy `extendedProperties.private`:

| Klucz    | Wartości                        |
| -------- | ------------------------------- |
| `zrodlo` | `pzw-posiedzenie` (`ZNACZNIK_NARZEDZIA`) |
| `typ`    | `posiedzenie` \| `termin`       |
| `rodzaj` | id z `RODZAJE_POSIEDZEN`        |

Filtr `privateExtendedProperty: 'zrodlo=pzw-posiedzenie'` przyjmuje też tablicę
(parametr powtarzalny), ale filtrowanie po `typ` robimy po stronie skryptu —
łatwiej odróżnić posiedzenia od całodniowych przypomnień.

**Nie zmieniaj `ZNACZNIK_NARZEDZIA`** — wydarzenia założone starszą wersją
staną się niewidoczne dla narzędzia.

`Calendar.Events.list` sortuje wyłącznie **rosnąco** (`orderBy: 'startTime'`,
wymaga `singleEvents: true`). Historia jest więc pobierana chronologicznie
i odwracana w skrypcie; przy okazji ostatni wpis danego rodzaju naturalnie
nadpisuje wcześniejsze w mapie `ostatnie`.

Wydarzenia całodniowe mają `start.date`, nie `start.dateTime` — oba miejsca,
które czytają daty, muszą to sprawdzać.

## Daty i strefy czasowe

`new Date('2026-09-15T18:00')` w Apps Script bywa interpretowane jako **UTC**,
co przy zmianie czasu przesuwa termin o godzinę. Dlatego `zbudujDate_` składa
datę z części:

```js
new Date(rok, miesiac - 1, dzien, godzina, minuta, 0)
```

Do API idzie `dateTime` **bez przesunięcia**, a strefa osobno w `timeZone` —
to robi `naFormatLokalny_`. Formatowanie zawsze przez
`Utilities.formatDate(data, KONFIG.strefaCzasowa, wzorzec)`, nigdy przez
`toLocaleString`.

`dodajMiesiace_` przycina dzień do długości miesiąca docelowego: 31 stycznia
+ 1 miesiąc daje 28 lutego, nie 3 marca. Naiwne `setMonth(m + 1)` przeskoczyłoby
miesiąc — a przypomnienia o cyklu kwartalnym są liczone właśnie tak.

## Gmail

`GmailApp.createDraft(do, temat, tresc, { bcc })` tworzy tylko wersję roboczą.
Zakres `gmail.compose` **nie pozwala wysłać maila** — to celowe zabezpieczenie
przy narzędziu rozsyłającym zawiadomienia do władz okręgu.

Odnośnik do wersji roboczej składamy z `wersja.getMessageId()`:
`https://mail.google.com/mail/u/0/#drafts?compose=<id>`. Adres zakłada
konto `u/0` — przy kilku zalogowanych kontach Google może otworzyć niewłaściwe.

`Session.getActiveUser().getEmail()` wymaga zakresu `userinfo.email`
i zwraca pusty ciąg, gdy skrypt działa jako inny użytkownik.

## Uprawnienia i wdrożenie

`appsscript.json` prosi o `calendar`, `gmail.compose`, `userinfo.email`.
**Każde rozszerzenie zakresów wymusza ponowną autoryzację** — użytkownik
zobaczy ekran zgody i ostrzeżenie „Google nie zweryfikowało tej aplikacji”
(normalne dla prywatnych skryptów: Zaawansowane → Przejdź do…).

Wdrożenie: **Wykonaj jako: Ja**, **Kto ma dostęp: Tylko ja**.

Zmiany w `.gs` i `.html` działają od razu po zapisaniu **tylko w testowym
wdrożeniu**. Adres produkcyjny (`/exec`) pokazuje wersję zamrożoną — po zmianie
manifestu albo dodaniu pliku trzeba zrobić **Zarządzaj wdrożeniami → ołówek →
Wersja: Nowa wersja**.

## Ograniczenia środowiska

- Runtime **V8**, ale bez modułów: brak `import`/`export`, brak `require`.
  Wszystkie pliki `.gs` dzielą jedną globalną przestrzeń nazw — stąd `KONFIG`
  i `RODZAJE_POSIEDZEN` widoczne z `Kod.gs` bez żadnego wiązania.
- **Kolejność plików ma znaczenie tylko dla kodu wykonywanego na starcie.**
  Deklaracje `const` na poziomie pliku są dostępne w funkcjach niezależnie
  od kolejności.
- Limit czasu wykonania: **6 minut**. `pobierzLinkMeet_` w najgorszym razie
  czeka 7,5 s — bezpiecznie.
- `Utilities.sleep()` blokuje wątek; nie ma `setTimeout` po stronie serwera.
- Limity: Calendar API ~1 mln zapytań dziennie, Apps Script kilkadziesiąt
  tysięcy wywołań. Kilkadziesiąt posiedzeń rocznie tego nie dotyka.

## Interfejs

`Index.html` trzyma styl, HTML i skrypt klienta w jednym pliku — Apps Script
nie serwuje osobnych plików statycznych. Motyw jasny i ciemny przez zmienne
CSS i `prefers-color-scheme`.

**Schowek bywa zablokowany**, bo aplikacja działa w ramce. `navigator.clipboard`
ma fallback: zaznaczenie tekstu w polu i komunikat „skopiuj przez Ctrl+C”.

Dane z historii i konfiguracji przychodzą **dwoma niezależnymi wywołaniami**.
`odswiezMinione()` może dobiec po `pobierzDomyslne()`, dlatego ponownie wywołuje
`zastosujRodzaj()` — ale tylko gdy pole daty jest puste, żeby nie nadpisać tego,
co użytkownik zdążył wpisać.
