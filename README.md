# Generator posiedzeń — Okręg Mazowiecki PZW

Narzędzie do zwoływania posiedzeń władz i organów Okręgu, które odbywają się
cyklicznie, ale w nieregularnych terminach. Wybierasz rodzaj posiedzenia
i datę — narzędzie zakłada wydarzenie w Kalendarzu Google, generuje link do
Google Meet i składa gotowe zawiadomienie do wklejenia w maila, razem
z porządkiem obrad zgodnym ze Statutem PZW.

Działa jako aplikacja Google Apps Script pod stałym adresem. Nie wymaga
serwera, klucza API, konta w Google Cloud ani żadnych opłat.

## Jak to działa

1. Otwierasz stronę narzędzia, wybierasz rodzaj posiedzenia, datę i osobę,
   która zwołuje.
2. Nad formularzem widzisz, czego dla tego rodzaju wymaga Statut: częstotliwość,
   kto zwołuje, wyprzedzenie zawiadomienia, podstawę prawną.
3. **Dostajesz gotowe zawiadomienie do przeczytania i poprawek — zanim
   cokolwiek trafi do kalendarza.** Z tego widoku można wrócić bez śladu.
4. Dopiero gdy tekst się zgadza, narzędzie tworzy wydarzenie razem
   z konferencją Meet — jednym wywołaniem `Calendar.Events.insert`
   z `conferenceData.createRequest` — i wstawia adres konferencji w miejsce
   oznaczone w tekście.
5. Wklejasz tekst do maila ze skrzynki Okręgu — albo pozwalasz narzędziu
   utworzyć wersję roboczą w Gmailu z adresami w UDW.

Kolejność jest celowa. Zawiadomienie ogląda się przed założeniem wydarzenia,
a nie po nim: poprawka literówki nie zostawia wtedy w kalendarzu odwołanego
posiedzenia ani drugiego linku Meet.

Stałe elementy zawiadomienia — dane Okręgu, zwrot powitalny, skład Zarządu,
instrukcja wejścia na Meet — siedzą w `apps-script/Konfiguracja.gs`
i ustawiasz je raz.

## Podstawa merytoryczna

Rodzaje posiedzeń i wymogi formalne odwzorowują **Statut Polskiego Związku
Wędkarskiego** (tekst jednolity z 15 marca 2017 r.), rozdział V „Okręgi
Związku”.

| Rodzaj posiedzenia                        | Cykl statutowy | Wyprzedzenie | Podstawa      |
| ----------------------------------------- | -------------- | ------------ | ------------- |
| Posiedzenie Zarządu Okręgu                | raz na kwartał | —            | § 46          |
| Posiedzenie Prezydium Zarządu Okręgu      | raz w miesiącu | —            | § 48          |
| Okręgowy Zjazd Delegatów (zwyczajny)      | co 4 lata      | 21 dni, na piśmie | § 41 ust. 2 |
| Nadzwyczajny Okręgowy Zjazd Delegatów     | doraźnie       | 21 dni, na piśmie | § 44     |
| Posiedzenie Okręgowej Komisji Rewizyjnej  | kontrola ZO raz w roku | —    | § 49–50       |
| Posiedzenie Okręgowego Sądu Koleżeńskiego | doraźnie       | —            | § 51–52       |
| Posiedzenie komisji problemowej ZO        | wg regulaminu  | —            | § 47 pkt 12   |
| Narada z prezesami kół                    | doraźnie       | —            | § 47 pkt 29   |

Reguły, których narzędzie pilnuje w tle:

- **§ 46 ust. 1** — Zarząd Okręgu obraduje w miarę potrzeb, jednak **nie
  rzadziej niż raz na kwartał**. Posiedzenia zwołuje prezes zarządu okręgu
  lub upoważniony przez niego członek zarządu (§ 46 ust. 2).
- **§ 48 ust. 1** — Prezydium Zarządu Okręgu obraduje **nie rzadziej niż raz
  w miesiącu**; zwołuje je prezes lub upoważniony wiceprezes (§ 48 ust. 4).
- **§ 48 ust. 2** — uchwały Prezydium podjęte w sprawach z § 47 pkt 3–14,
  23–25 i 27 **podlegają przedłożeniu na najbliższym posiedzeniu Zarządu
  Okręgu**, który może je uchylić bądź zmienić. Ten akapit trafia do każdego
  zawiadomienia o posiedzeniu Prezydium, a odpowiedni punkt — do porządku
  obrad Zarządu.
- **§ 41 ust. 2** — o okręgowym zjeździe delegatów zarząd okręgu zawiadamia
  delegatów i zarządy kół **na piśmie, co najmniej na 21 dni** wcześniej,
  załączając sprawozdanie z działalności oraz pozostałe dokumenty i wnioski.
- **§ 44 ust. 3** — nadzwyczajny zjazd podejmuje uchwały wyłącznie w sprawach,
  dla rozpatrzenia których został zwołany.
- **§ 47 pkt 14** — uchwały o jednostkach gospodarczych i spółkach prawa
  handlowego wymagają **2/3 głosów przy obecności co najmniej 2/3 członków**
  Zarządu Okręgu. To jedyne kworum kwalifikowane na tym szczeblu; przy
  13-osobowym Zarządzie oznacza 9 obecnych.

Po każdym posiedzeniu Zarządu Okręgu lub Prezydium narzędzie zakłada
całodniowe przypomnienie na dzień, w którym upływa cykl statutowy — kwartał
albo miesiąc. Statut nie wyznacza nikogo, kto by tego pilnował.

### Historia i podpowiedzi

Narzędzie pokazuje listę ostatnich posiedzeń i bierze z nich **godzinę, czas
trwania i miejsce** dla kolejnego posiedzenia tego samego rodzaju. Prezydium
zbierające się o 16:00 na dwie godziny dostanie te wartości wpisane z góry;
Zarząd Okręgu — swoje. Pod polem daty widać, z którego posiedzenia pochodzą.

Zasięg historii ustawia `KONFIG.historiaMiesiecy` (domyślnie 24), długość listy
`KONFIG.liczbaHistorii` (10). Przy pierwszym uruchomieniu, gdy historii nie ma,
narzędzie używa wartości domyślnych z `RODZAJE_POSIEDZEN`.

### Wygląd

Strona jest zbudowana jak **blankiet Okręgu**: granatowa belka z oficjalnym
godłem PZW, nazwą jednostki i teleadresem, a pod nią obszar roboczy. Skoro
narzędzie produkuje pismo urzędowe, jego interfejs zaczyna się tak samo jak
to pismo.

Kolorystyka nie jest dobrana dowolnie — granat `#020c3a`, przycisk `#012880`
i akcent `#084685` zostały **odczytane z pikseli portalu `om.pzw.pl`**, na który
Okręg przenosi swoje strony. Belka jest płaska i bezszeryfowa, tak jak tam.
Ostrzeżenia mają odcień pieczęci zamiast typowej żółci.

Godło Okręgu ma osobny, jaśniejszy błękit `#4e76b4` — trafia wyłącznie
na favikonę, żeby nie kłócić się z granatem portalu.

Logo PZW jest wklejone wektorowo w `Index.html`, więc aplikacja wygląda tak
samo także wtedy, gdy `ompzw.pl` nie odpowiada. Godło Okręgu służy za ikonę
karty przeglądarki (`KONFIG.okreg.godlo`). Oba znaki pochodzą z serwisów
Związku i są tu użyte na potrzeby jego własnej jednostki.

### Terminy statutowe na widoku

Pod nagłówkiem biegnie pas z jednym wierszem na organ, który ma cykl narzucony
Statutem: Prezydium co miesiąc, Zarząd Okręgu co kwartał, kontrola OKR raz
w roku. Wskaźnik pokazuje, ile z cyklu upłynęło, a obok stoi stan słowem.
To jedyna rzecz, której użytkownik sam nie wie, więc dostaje najwięcej miejsca.

### Układ i przydatne linki

Od 840 px szerokości strona rozkłada się na dwie kolumny: po lewej formularz
albo gotowe zawiadomienie, po prawej panel odniesienia — najbliższe posiedzenia,
ostatnie oraz **przydatne linki**. Panel jest przyklejony przy przewijaniu,
więc uchwały Zarządu i Statut masz pod ręką przez cały czas układania porządku
obrad. Na węższych ekranach wszystko składa się do jednej kolumny.

Listę linków ustawia `KONFIG.przydatneLinki`; pusta lista chowa całą kartę.
Pełniejszy zestaw adresów, razem z aktami prawnymi i dokumentacją Apps Script,
jest w [`docs/linki.md`](docs/linki.md).

### Zjazd a spotkanie online

Wybory władz Okręgu i uchwały zjazdowe wymagają listy obecności z podpisami
oraz głosowania tajnego. Meet tego nie zastąpi. Jeśli dla zjazdu nie podasz
miejsca obrad, narzędzie ostrzeże — link traktuj jako uzupełnienie obrad na
miejscu, nie ich zamiennik. Podobnie mail nie wyczerpuje wymogu formy pisemnej
z § 41 ust. 2.

### Dane Okręgu i kadencja

Domyślna konfiguracja zawiera dane Okręgu Mazowieckiego PZW: siedziba przy
ul. Retmańskiej 75 w Serocku (05-140), telefony 22 620 50 83 i 22 654 57 05,
strona [ompzw.pl](https://ompzw.pl). Trafiają do stopki zawiadomienia.

**VII Okręgowy Zjazd Delegatów OM PZW** odbył się 21 lutego 2026 r. w Zielonce
i wybrał władze na kadencję **2026–2030**. Ustalone składy liczbowe:

- Zarząd Okręgu — **13 osób wraz z Prezesem** (Statut dopuszcza 11–31, § 45 ust. 1)
- Okręgowa Komisja Rewizyjna — **9 osób** (Statut: 5–9, § 49)
- Okręgowy Sąd Koleżeński — **9 osób** (Statut: 7–9, § 51)

Prezesem Zarządu Okręgu został ponownie wybrany kol. Piotr Kołodziejek.
Zjazd wybrał także 13 delegatów i 5 zastępców na Krajowy Zjazd Delegatów.

Liczebność Zarządu siedzi w `KONFIG.liczbaCzlonkowZarzadu` — po zmianie składu
zaktualizuj ją razem z `KONFIG.kadencja`.

**Prezydium.** Statut mówi, że na pierwszym posiedzeniu zarządu — nie później
niż 10 dni od wyborów — *dopuszcza się* wybór prezydium, a jego liczebność nie
może przekraczać połowy składu zarządu (§ 45 ust. 2–3). Jeśli Zarząd Okręgu nie
powołał prezydium, po prostu nie używaj tego rodzaju posiedzenia.

### Nieregularne terminy

Posiedzenia zakładasz pojedynczo, wtedy gdy zapada decyzja o terminie. Reguły
powtarzania (`RRULE`) celowo nie używamy: cała seria dostałaby wtedy jeden
wspólny link Meet, a zmiana pojedynczego terminu wymagałaby grzebania
w wyjątkach serii. Zamiast tego każde posiedzenie jest osobnym wydarzeniem
z własnym linkiem, a narzędzie pokazuje listę najbliższych — dzięki
znacznikowi `extendedProperties.private.zrodlo`, po którym rozpoznaje
wydarzenia własnego autorstwa.

### Kto zwołuje i jak się podpisuje

Posiedzenie Zarządu Okręgu zwołuje prezes albo upoważniony przez niego członek
zarządu (§ 46 ust. 2), a posiedzenie Prezydium — prezes albo upoważniony
wiceprezes (§ 48 ust. 4). Podpis nie może więc być wpisany na stałe: przy każdym
zawiadomieniu wybierasz osobę z listy `KONFIG.zwolujacy`, która zawiera cały
trzynastoosobowy skład Zarządu kadencji 2026–2030.

Zwrot powitalny jest męskoosobowy („Szanowni Koledzy"), bo w Zarządzie Okręgu
i w Prezydium nie ma kobiet. Okręgowy Zjazd Delegatów i narada z prezesami kół
mają własny, włączający zwrot przy swoim wpisie w `RODZAJE_POSIEDZEN` —
to gremia o składzie szerszym niż Zarząd.

### Terminy statutowe liczone z historii

Karta „Terminy statutowe" porównuje datę ostatniego posiedzenia każdego gremium
z cyklem, który narzuca Statut, i mówi wprost, gdy termin minął — na przykład
„Termin z § 48 Statutu PZW upłynął 9 maja 2026 r. — 92 dni temu". Posiedzenie
zwołane po terminie nie zamyka sprawy i narzędzie to zaznacza; przypomnienie
zakładane w kalendarzu przy tworzeniu posiedzenia nie wystarcza, bo nikt nie
sprawdza, czy termin już nie przepadł.

### Odwołanie i przeniesienie

Zwołane posiedzenie da się przenieść albo odwołać z karty „Zmiana terminu”.
Przy przeniesieniu wydarzenie zmienia się w miejscu, więc **link Meet zostaje
ten sam** — rozesłany wcześniej adres dalej działa. Odwołane posiedzenie
dostaje status `cancelled`, a nie znika: w kalendarzu zostaje ślad, że było
zwołane. W obu wypadkach narzędzie składa gotowy tekst zawiadomienia o zmianie.

### Dodatki, czyli reszta robi się osobno

Zwołanie posiedzenia to trzy rzeczy: wydarzenie w kalendarzu, link Meet i tekst
zawiadomienia. Tyle dzieje się po naciśnięciu przycisku i tyle wystarczy,
żeby posiedzenie było zwołane.

Wszystko inne to **dodatek**: folder na materiały, protokół, lista obecności,
pisemne zawiadomienie, zaproszenia w kalendarzu, przypomnienie o cyklu. Każdy
jest osobnym wywołaniem, lecą równolegle i każdy może się nie udać bez szkody
dla pozostałych ani dla samego posiedzenia. Nieudany folder na Dysku nie
odwołuje obrad.

Lista dodatków jest podzielona na trzy etapy, bo nie wszystko przydaje się
w tej samej chwili:

| Etap | Co tam trafia |
| --- | --- |
| **Przed posiedzeniem** | folder na materiały, zawiadomienie do druku, zaproszenia w kalendarzu |
| **Na posiedzenie** | lista obecności, szkielet protokołu |
| **Po posiedzeniu** | przypomnienie o kolejnym terminie w cyklu |

Stan dodatku siedzi na wydarzeniu, nie w przeglądarce. Zamknięcie karty
w połowie niczego nie psuje: przy każdym posiedzeniu na liście najbliższych
jest przycisk **Dokończ**, który pokazuje, czego brakuje, i pozwala dopiąć to
choćby za tydzień. Co ma się dziać od razu, ustawia `KONFIG.dodatki`.

### Protokół

Po utworzeniu posiedzenia jednym przyciskiem zakładasz szkielet protokołu
w Dokumentach Google: nagłówek, miejsce na obecnych, punkty porządku obrad
wzięte z **rozesłanego** zawiadomienia, tabelę uchwał i podpisy. Odnośnik
trafia do opisu wydarzenia. Punkt „przyjęcie protokołu z poprzedniego
posiedzenia" stoi w porządku obrad każdego organu, więc protokół i tak musi
powstać.

### Tło kalendarza

Terminy posiedzeń układa się wokół tego, kiedy ludzie są dostępni. Narzędzie
wpisuje więc do kalendarza **dni ustawowo wolne od pracy** (święta stałe
i ruchome, te drugie liczone z daty Wielkanocy algorytmem Meeusa), **dni
mostkowe** oraz **kalendarz szkolny**: obie przerwy świąteczne, wakacje,
rozpoczęcie i zakończenie zajęć. Wpisy są przezroczyste, więc niczego nie
blokują. Własne wydarzenia Okręgu dopisujesz w `KONFIG.wlasneWydarzenia`.

**Ferii zimowych narzędzie nie wpisuje.** MEN ogłasza je co roku osobno dla
każdego województwa i nie ma reguły, z której dałoby się je wyliczyć; wpisanie
zmyślonych dat do kalendarza władz Okręgu byłoby gorsze niż ich brak. Daty
z kalendarza szkolnego wynikają z reguł rozporządzenia o organizacji roku
szkolnego, a wiążący kalendarz publikuje
[MEN](https://www.gov.pl/web/edukacja/kalendarz-roku-szkolnego).

### Przypomnienie dzień wcześniej

Wyzwalacz czasowy raz na dobę sprawdza, czy jutro jest posiedzenie,
i przygotowuje w Gmailu **wersję roboczą** przypomnienia. Nic nie wychodzi
samo — wysyłasz ręcznie, tak jak samo zawiadomienie. Posiedzenia niejawne
są pomijane, bo globalna lista adresowa Zarządu ich nie dotyczy. Wyzwalacz
włączasz i wyłączasz przyciskiem w karcie „Terminy statutowe".

## Wdrożenie

Jednorazowo, około dziesięciu minut.

### 1. Załóż projekt

Wejdź na [script.google.com](https://script.google.com) i utwórz nowy projekt.
Nazwij go np. „Posiedzenia OM PZW”.

### 2. Pokaż plik manifestu

Ikona koła zębatego (**Ustawienia projektu**) → zaznacz
**Pokaż plik manifestu „appsscript.json" w edytorze**.

### 3. Wgraj pliki

Masz dwie drogi. **Z komputera** jest szybsza i nie gubi plików przy
kopiowaniu; **ręcznie** działa bez instalowania czegokolwiek.

#### Z komputera (zalecane)

Jednorazowo:

```bash
npx --yes @google/clasp@3.3.0 login
npx --yes @google/clasp@3.3.0 clone <IDENTYFIKATOR_SKRYPTU> --rootDir apps-script
```

Identyfikator: w edytorze Apps Script **Ustawienia projektu → Identyfikatory →
Identyfikator skryptu**. Trzeba też raz włączyć Apps Script API pod adresem
<https://script.google.com/home/usersettings>.

Potem każda wysyłka to jedna komenda:

```bash
./scripts/wgraj.sh            # wgraj pliki
./scripts/wgraj.sh --wersja   # wgraj i odśwież adres /exec
```

Skrypt **najpierw uruchamia `sprawdz.sh`** i wysyła tylko wtedy, gdy wszystko
przechodzi. Dwie rzeczy warto wiedzieć: `push` **nadpisuje projekt online**,
więc zmiany zrobione w edytorze przeglądarkowym i niepobrane wcześniej
przepadną; a sam `push` nie zmienia tego, co widzą użytkownicy pod adresem
`/exec` — do tego służy `--wersja`.

`.clasp.json` powstaje lokalnie i nie trafia do repozytorium, bo wskazuje
na konkretny projekt.

#### Ręcznie

W edytorze utwórz pliki o nazwach dokładnie takich jak poniżej i wklej
zawartość z tego repozytorium:

| Plik w edytorze     | Typ    | Źródło                            |
| ------------------- | ------ | --------------------------------- |
| `appsscript.json`   | —      | `apps-script/appsscript.json`     |
| `Konfiguracja.gs`   | Skrypt | `apps-script/Konfiguracja.gs`     |
| `Kod.gs`            | Skrypt | `apps-script/Kod.gs`              |
| `Dodatki.gs`        | Skrypt | `apps-script/Dodatki.gs`          |
| `Podpisy.gs`        | Skrypt | `apps-script/Podpisy.gs`          |
| `Terminarz.gs`      | Skrypt | `apps-script/Terminarz.gs`        |
| `Zmiany.gs`         | Skrypt | `apps-script/Zmiany.gs`           |
| `Dokumenty.gs`      | Skrypt | `apps-script/Dokumenty.gs`        |
| `Goscie.gs`         | Skrypt | `apps-script/Goscie.gs`           |
| `Uchwaly.gs`        | Skrypt | `apps-script/Uchwaly.gs`          |
| `Plan.gs`           | Skrypt | `apps-script/Plan.gs`             |
| `Index.html`        | HTML   | `apps-script/Index.html`          |

Domyślny plik `Code.gs` możesz usunąć.

Manifest włącza usługę Calendar API automatycznie. Gdyby jednak przy
pierwszym uruchomieniu pojawił się błąd „Nie włączono usługi Calendar API",
kliknij **Usługi** (ikona `+` przy liście plików) i dodaj
**Google Calendar API** z identyfikatorem `Calendar`.

### 4. Uzupełnij konfigurację

Otwórz `Konfiguracja.gs` i wpisz domyślną godzinę oraz — jeśli chcesz korzystać
z wersji roboczych w Gmailu — listę adresów członków Zarządu w `adresyDoWysylki`.
Dane Okręgu, kadencja i skład Zarządu są już wypełnione.

Sprawdź `domyslnyZwolujacy` — narzędzie podpowiada tę osobę przy każdym
zawiadomieniu. Domyślnie jest to Daniel Sobczak, Wiceprezes ds. Sportu.

Rodzaje posiedzeń i ich wymogi formalne siedzą w tablicy `RODZAJE_POSIEDZEN`
w tym samym pliku. Podstawy prawne każdego wpisu opisuje
[`docs/statut-pzw-okreg.md`](docs/statut-pzw-okreg.md).

### 5. Wdróż jako aplikację internetową

**Wdróż** → **Nowe wdrożenie** → typ **Aplikacja internetowa**:

- **Wykonaj jako:** Ja
- **Kto ma dostęp:** Tylko ja

Przy pierwszym wdrożeniu Google poprosi o autoryzację. Narzędzie prosi
o pięć uprawnień:

| Zakres            | Do czego                                                    |
| ----------------- | ----------------------------------------------------------- |
| `calendar`        | wydarzenie, link Meet, przenoszenie i odwoływanie posiedzeń  |
| `gmail.compose`   | wersja robocza zawiadomienia — **skrypt nie może nic wysłać**|
| `userinfo.email`  | adres nadawcy w polu „Do”, gdy nie podasz skrzynki Okręgu    |
| `documents`       | protokół, lista obecności, pisemne zawiadomienie              |
| `spreadsheets`    | rejestr uchwał                                               |
| `drive`           | folder na materiały i odkładanie do niego dokumentów          |
| `script.scriptapp`| wyzwalacz przypomnień D-1                                    |

Ponieważ skrypt jest Twój własny
i nieopublikowany, zobaczysz ostrzeżenie „Google nie zweryfikowało tej
aplikacji" — kliknij **Zaawansowane**, a potem **Przejdź do (nazwa projektu)**.
To normalne dla prywatnych skryptów.

### 6. Zapisz adres

Skopiuj adres wdrożenia (`.../exec`). Dodaj go do zakładek, a na telefonie
do ekranu głównego — otwiera się jak zwykła aplikacja.

## Późniejsze zmiany

Edycje w `Konfiguracja.gs` działają od razu po zapisaniu. Jeśli zmienisz
`appsscript.json` albo dodasz nowy plik, wykonaj **Wdróż** → **Zarządzaj
wdrożeniami** → ołówek → **Wersja: Nowa wersja**, żeby adres wskazywał
aktualny kod.

## Uwagi praktyczne

**Adresy członków a RODO.** Wersja robocza w Gmailu wkłada wszystkie adresy
do UDW (BCC), a w polu „Do” zostawia skrzynkę Okręgu. Przy mailu do grupy osób
nie wolno ujawniać pozostałym adresatom całej listy adresowej.

**Posiedzenia niejawne.** Dla Okręgowego Sądu Koleżeńskiego narzędzie podmienia
dopisek pod linkiem na prośbę o nieprzekazywanie go poza skład orzekający
i osoby wezwane.

**Wejście gości bez konta Google.** Osoba niezalogowana w Google poda swoje imię
i kliknie „Poproś o dołączenie" — i musisz ją wpuścić. Na kontach prywatnych
(nie-Workspace) Google nie pozwala tego wyłączyć, dlatego domyślna instrukcja
w zawiadomieniu o tym uprzedza. Warto być w Meet kilka minut przed czasem.

**Kalendarz.** Domyślnie wydarzenia trafiają do kalendarza głównego. Jeśli
wolisz je oddzielić od spraw prywatnych, załóż osobny kalendarz i wpisz jego
identyfikator w `KONFIG.idKalendarza`.

**Limity.** Calendar API daje milion zapytań dziennie, Apps Script — kilkadziesiąt
tysięcy wywołań. Kilkadziesiąt posiedzeń rocznie nie zbliża się do żadnego progu.

## Struktura repozytorium

```
apps-script/
  appsscript.json    manifest — strefa czasowa, usługa Calendar, uprawnienia
  Konfiguracja.gs    dane Okręgu, skład Zarządu, rodzaje posiedzeń
  Kod.gs             podgląd i utworzenie wydarzenia, link Meet, tekst zawiadomienia
  Podpisy.gs         kto zwołuje, jak się podpisuje, zwrot powitalny
  Terminarz.gs       cykl statutowy liczony z historii, przypomnienia D-1
  Zmiany.gs          odwoływanie i przenoszenie zwołanych posiedzeń
  Dokumenty.gs       szkielet protokołu w Dokumentach Google
  Index.html         interfejs w przeglądarce
docs/
  statut-pzw-okreg.md      wyciąg ze Statutu — §§ 37–52, źródło prawdy
  okreg-mazowiecki.md      dane Okręgu, kadencja 2026–2030, wykaz kół
  kontekst-i-research.md   dlaczego kod wygląda tak, jak wygląda
  apps-script.md           notatki techniczne i pułapki środowiska
  linki.md                 sprawdzone adresy — Okręg, akty prawne, Apps Script
scripts/
  wgraj.sh                 sprawdzenie i wysyłka do Apps Script przez clasp
  sprawdz.sh               składnia + powiązania ARIA + kontrast, jedną komendą
  tony.py                  paleta tonalna Material 3 z ziarna #012880
  kontrast.py              kontrast palety względem WCAG 2.2
  podglad.py               render interfejsu z atrapą serwera + zrzuty ekranu
  styl.py                  ślady pisania maszynowego w tekstach projektu
CLAUDE.md            instrukcje dla agenta AI
.claude/skills/
  system/                  spis komponentów i tokenów; czytany przed każdą zmianą wyglądu
  rodzaj-posiedzenia/      dodanie nowego rodzaju posiedzenia
  interfejs/               kierunek wizualny, układ, dostępność
  przeglad-ui/             audyt gotowego interfejsu na zrzutach, WCAG 2.2
  napisy/                  napisy w interfejsie: przyciski, błędy, stany puste
  polszczyzna/             teksty, które nie brzmią jak wygenerowane
  dane-osobowe/            RODO, adresy członków, zakresy OAuth
  zrodla-pzw/              pobieranie i cytowanie dokumentów PZW
```

## Źródła

- [Statut Polskiego Związku Wędkarskiego](https://pzw.org.pl/brepo/panel_repo/2023/03/03/dttmhj/statut-pzw.pdf)
  — tekst jednolity z 15 marca 2017 r., rozdział V „Okręgi Związku”
- [Okręg Mazowiecki PZW w Warszawie](https://ompzw.pl/) — dane teleadresowe, wykaz kół
- [VII Okręgowy Zjazd Delegatów OM PZW](https://pzw.pl/szczegoly-artykulu/vii-okregowy-zjazd-delegatow-okregu-mazowieckiego-pzw_RitdNc5Zs6kn8SlCHG1m)
  — 21 lutego 2026 r., składy władz na kadencję 2026–2030
