# Generator zebrań Koła PZW

Narzędzie do zwoływania zebrań, które odbywają się cyklicznie, ale w
nieregularnych terminach. Podajesz datę — narzędzie zakłada wydarzenie
w Kalendarzu Google, generuje link do Google Meet i składa gotowy tekst
zaproszenia do wklejenia w maila.

Działa jako aplikacja Google Apps Script pod stałym adresem. Nie wymaga
serwera, klucza API, konta w Google Cloud ani żadnych opłat.

## Jak to działa

1. Otwierasz stronę narzędzia i wpisujesz datę zebrania.
2. Narzędzie tworzy wydarzenie razem z konferencją Meet — jednym wywołaniem
   `Calendar.Events.insert` z `conferenceData.createRequest`.
3. Dostajesz link Meet i złożony tekst zaproszenia z przyciskiem „Kopiuj".
4. Wklejasz tekst do maila ze skrzynki Koła i dopisujesz porządek obrad.

Stałe elementy zaproszenia — nazwa Koła, zwrot powitalny, podpis, instrukcja
wejścia na Meet — siedzą w `apps-script/Konfiguracja.gs` i ustawiasz je raz.

### Nieregularne terminy

Zebrania zakładasz pojedynczo, wtedy gdy zapada decyzja o terminie. Reguły
powtarzania (`RRULE`) celowo nie używamy: cała seria dostałaby wtedy jeden
wspólny link Meet, a zmiana pojedynczego terminu wymagałaby grzebania
w wyjątkach serii. Zamiast tego każde zebranie jest osobnym wydarzeniem
z własnym linkiem, a narzędzie pokazuje listę najbliższych — dzięki
znacznikowi `extendedProperties.private.zrodlo`, po którym rozpoznaje
wydarzenia własnego autorstwa.

## Wdrożenie

Jednorazowo, około dziesięciu minut.

### 1. Załóż projekt

Wejdź na [script.google.com](https://script.google.com) i utwórz nowy projekt.
Nazwij go np. „Zebrania Koła PZW".

### 2. Pokaż plik manifestu

Ikona koła zębatego (**Ustawienia projektu**) → zaznacz
**Pokaż plik manifestu „appsscript.json" w edytorze**.

### 3. Wgraj pliki

W edytorze utwórz pliki o nazwach dokładnie takich jak poniżej i wklej
zawartość z tego repozytorium:

| Plik w edytorze     | Typ    | Źródło                            |
| ------------------- | ------ | --------------------------------- |
| `appsscript.json`   | —      | `apps-script/appsscript.json`     |
| `Konfiguracja.gs`   | Skrypt | `apps-script/Konfiguracja.gs`     |
| `Kod.gs`            | Skrypt | `apps-script/Kod.gs`              |
| `Formularz.html`    | HTML   | `apps-script/Formularz.html`      |

Domyślny plik `Code.gs` możesz usunąć.

Manifest włącza usługę Calendar API automatycznie. Gdyby jednak przy
pierwszym uruchomieniu pojawił się błąd „Nie włączono usługi Calendar API",
kliknij **Usługi** (ikona `+` przy liście plików) i dodaj
**Google Calendar API** z identyfikatorem `Calendar`.

### 4. Uzupełnij konfigurację

Otwórz `Konfiguracja.gs` i wpisz nazwę Koła, podpis oraz domyślną godzinę.

### 5. Wdróż jako aplikację internetową

**Wdróż** → **Nowe wdrożenie** → typ **Aplikacja internetowa**:

- **Wykonaj jako:** Ja
- **Kto ma dostęp:** Tylko ja

Przy pierwszym wdrożeniu Google poprosi o autoryzację. Ponieważ skrypt jest
Twój własny i nieopublikowany, zobaczysz ostrzeżenie „Google nie zweryfikowało
tej aplikacji" — kliknij **Zaawansowane**, a potem **Przejdź do
(nazwa projektu)**. To normalne dla prywatnych skryptów.

### 6. Zapisz adres

Skopiuj adres wdrożenia (`.../exec`). Dodaj go do zakładek, a na telefonie
do ekranu głównego — otwiera się jak zwykła aplikacja.

## Późniejsze zmiany

Edycje w `Konfiguracja.gs` działają od razu po zapisaniu. Jeśli zmienisz
`appsscript.json` albo dodasz nowy plik, wykonaj **Wdróż** → **Zarządzaj
wdrożeniami** → ołówek → **Wersja: Nowa wersja**, żeby adres wskazywał
aktualny kod.

## Uwagi praktyczne

**Wejście gości bez konta Google.** Link jest otwarty i można go przekazywać
dalej. Osoba niezalogowana w Google poda swoje imię i kliknie „Poproś
o dołączenie" — i musisz ją wpuścić. Na kontach prywatnych (nie-Workspace)
Google nie pozwala tego wyłączyć, dlatego domyślna instrukcja w zaproszeniu
o tym uprzedza. Warto być w Meet kilka minut przed czasem.

**Kalendarz.** Domyślnie wydarzenia trafiają do kalendarza głównego. Jeśli
wolisz je oddzielić od spraw prywatnych, załóż osobny kalendarz i wpisz jego
identyfikator w `KONFIG.idKalendarza`.

**Limity.** Calendar API daje milion zapytań dziennie, Apps Script — kilkadziesiąt
tysięcy wywołań. Kilkanaście zebrań rocznie nie zbliża się do żadnego progu.

## Struktura repozytorium

```
apps-script/
  appsscript.json    manifest — strefa czasowa, usługa Calendar, uprawnienia
  Konfiguracja.gs    wszystkie ustawienia; jedyny plik do codziennej edycji
  Kod.gs             tworzenie wydarzenia, pobranie linku Meet, szablon tekstu
  Formularz.html     interfejs w przeglądarce
```
