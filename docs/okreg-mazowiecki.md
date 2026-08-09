# Okręg Mazowiecki PZW — fakty

Dane zebrane na sierpień 2026. Trafiają do `KONFIG.okreg` i `KONFIG.kadencja`
w `apps-script/Konfiguracja.gs`.

## Organizacja

**Pełna nazwa:** Okręg Mazowiecki Polskiego Związku Wędkarskiego w Warszawie
**Skrót używany przez koła:** OM PZW / OMPZW
**Siedziba:** ul. Retmańska 75, 05-140 Serock
**Telefony:** 22 620 50 83, 22 654 57 05
**Forma prawna:** stowarzyszenie, KRS 102184; okręg ma odrębną osobowość prawną
(Statut § 63 ust. 3)

**Godziny pracy biura:** poniedziałek 10:00–18:00, wtorek–piątek 7:30–15:30.

## Strony

Okręg utrzymuje **dwie równoległe domeny** i to bywa mylące:

| Adres              | Co to jest                                                     |
| ------------------ | -------------------------------------------------------------- |
| `ompzw.pl`         | własny serwis Okręgu — wykaz wód, przepisy, koła, składki       |
| `om.pzw.pl`        | profil Okręgu w ogólnopolskim CMS-ie PZW (Strefa PZW, uchwały)   |
| `kolo<N>.ompzw.pl` | subdomena koła, np. `kolo4.ompzw.pl`, `kolo131lokator.ompzw.pl` |
| `wedkarz.pzw.pl`   | Centralna Baza Danych PZW                                        |

`ompzw.pl/zarzad` przekierowuje (302) na `om.pzw.pl/strefa-pzw/zarzad-okregu`.

**Uwaga techniczna:** oba serwisy oddają **HTTP 406** na żądania bez
przeglądarkowego `User-Agent`. `WebFetch` się na tym wykłada — pobieraj przez
`curl -sL -A "Mozilla/5.0 …"`.

## Znaki graficzne

| Znak | Adres | Uwagi |
| --- | --- | --- |
| Logo PZW (wektor, biały) | `om.pzw.pl/brepo/panel_repo/2022/12/09/xnpisc/main-logo.svg` | 185×80, ryba + monogram PZW + wordmark, `®` |
| Godło Okręgu Mazowieckiego | `ompzw.pl/photos/logo/sitelogo/1/photo-106.png` | 86×90 PNG, okrągły emblemat |

## Barwy

Trzeba rozróżnić dwa zestawy — mylenie ich kończy się interfejsem, który
nie pasuje do serwisu Okręgu.

**Portal `om.pzw.pl` (wzorzec dla interfejsów)** — odczytane z pikseli zrzutu
strony `strefa-pzw/zarzad-okregu`:

| Barwa | Gdzie |
| --- | --- |
| `#020c3a` | belka nagłówka, płaska, bez gradientu |
| `#012880` | przycisk główny |
| `#084685` | akcent pomocniczy |

Krój w całości bezszeryfowy, zaokrąglenia umiarkowane, karty na bieli.

**Godło Okręgu** ma własny, jaśniejszy błękit **`#4e76b4`** — dominujący odcień
pliku godła (1474 z 7740 widocznych pikseli; średnia partii niebieskiej
`#688bbf`). Używaj go wyłącznie tam, gdzie występuje samo godło.

Czego **nie** brać za identyfikację: `main-13.min.css` archiwalnego `ompzw.pl`
(`#5dcdff`, `#70d22d`, `#ed145b`) to paleta gotowego szablonu. Kolory czytaj
ze zrzutu portalu, nie z arkusza stylów starej strony.

## Kadencja 2026–2030

**VII Okręgowy Zjazd Delegatów OM PZW** — 21 lutego 2026 r., Hotel Trylogia
w Zielonce.

Ustalone składy liczbowe (Statut dopuszcza szersze widełki):

| Organ                       | Uchwalono | Widełki Statutu     |
| --------------------------- | --------- | ------------------- |
| Zarząd Okręgu               | 13 (z Prezesem) | 11–31 (§ 45 ust. 1) |
| Okręgowa Komisja Rewizyjna  | 9         | 5–9 (§ 49)          |
| Okręgowy Sąd Koleżeński     | 9         | 7–9 (§ 51)          |

**Prezes Zarządu Okręgu:** kol. Piotr Kołodziejek (Koło OM PZW nr 13
Legionowo), wybrany ponownie, 139 głosów „za”.

### Skład Zarządu Okręgu

Za [wykazem Okręgu](https://om.pzw.pl/strefa-pzw/zarzad-okregu/sklad-zarzadu-organy/zarzad),
sprawdzonym w sierpniu 2026. To źródło dla `KONFIG.zwolujacy`.

| Lp. | Imię i nazwisko      | Funkcja                                          |
| --- | -------------------- | ------------------------------------------------ |
| 1   | Piotr Kołodziejek    | Prezes Zarządu Okręgu                            |
| 2   | Waldemar Pastusiak   | Sekretarz Zarządu Okręgu                         |
| 3   | Radosław Czajkowski  | Skarbnik Zarządu Okręgu                          |
| 4   | Edward Dygudaj       | Wiceprezes ds. Gospodarczych                     |
| 5   | Dariusz Ferens       | Wiceprezes ds. Zagospodarowania i Ochrony Wód    |
| 6   | Daniel Sobczak       | Wiceprezes ds. Sportu                            |
| 7   | Grzegorz Pacuszka    | Wiceprezes ds. Młodzieży i Promocji              |
| 8   | Grzegorz Gomułka     | Członek Zarządu Okręgu                           |
| 9   | Adam Kryszczak       | Członek Zarządu Okręgu                           |
| 10  | Dariusz Molendowski  | Członek Zarządu Okręgu                           |
| 11  | Artur Niewiadomski   | Członek Zarządu Okręgu                           |
| 12  | Roman Pierzchanowski | Członek Zarządu Okręgu                           |
| 13  | Maciej Sławiński     | Członek Zarządu Okręgu                           |

**Zarząd jest w całości męski** — stąd męskoosobowy zwrot powitalny
w `KONFIG.zwrotPowitalny`. Zjazd delegatów i narada z prezesami kół mają
własny, włączający zwrot: to gremia o szerszym składzie.

Posiedzenia najczęściej zwołuje **Daniel Sobczak**; § 48 ust. 4 wprost
przewiduje zwołanie przez upoważnionego wiceprezesa, więc podpis wiceprezesa
pod zawiadomieniem jest zgodny ze Statutem.

Dwie uwagi o zapisie nazwisk: wykaz Zarządu podaje **Dygudaj**, a relacja
z VII Zjazdu — **Dygadaj**; pierwszeństwo ma wykaz. Przy pozycji 13 wykaz ma
literówkę „Zarządu Okregu”.

**Prezydium Zjazdu:** przewodniczący Edward Dygadaj (K-134 Starówka), zastępca
Roman Pierzchanowski (K-13 Legionowo), sekretarze Tomasz Młynarczyk (K-39
Białołęka) i Waldemar Pastusiak (K-90 Gocław).

Zjazd wybrał 13 delegatów i 5 zastępców na Krajowy Zjazd Delegatów.
Ustępującemu Zarządowi udzielono absolutorium jednogłośnie, na wniosek OKR.

**Czy powołano prezydium Zarządu Okręgu** — relacja ze Zjazdu tego nie
przesądza. Statut zostawia to zarządowi (§ 45 ust. 2, „dopuszcza się”),
a pierwsze posiedzenie miało się odbyć do **3 marca 2026 r.** (10 dni od
wyborów). Zweryfikuj przed użyciem rodzaju `prezydium`.

**Zarząd Główny PZW:** prezes Beata Olejarz, sekretarz Dariusz Dziemianowicz
(stan na luty 2026).

## Koła

Numeracja kół OM PZW sięga co najmniej **134** i nie jest ciągła. Lista
„1–19” publikowana pod `ompzw.pl/kola-wedkarskie` jest niepełna — w relacji
ze Zjazdu występują m.in. K-24, K-39, K-49, K-56, K-58, K-60, K-67, K-68,
K-70, K-73, K-79, K-88, K-90, K-114, K-131, K-134.

Koła warszawskie 1–8 układają się dzielnicowo:

| Nr | Koło                    | Nr | Koło                  |
| -- | ----------------------- | -- | --------------------- |
| 1  | Warszawa Śródmieście    | 5  | Warszawa Praga Północ |
| 2  | Warszawa Żoliborz       | 6  | Warszawa Wola         |
| 3  | Warszawa Mokotów        | 7  | Warszawa Ochota       |
| 4  | Warszawa Praga Południe | 8  | Wilanów               |

Dalej podwarszawskie: 9 Błonie, 10 Góra Kalwaria, 11 Grodzisk Mazowiecki,
12 Konstancin-Jeziorna, 13 Legionowo, 14 Marki, 15 Nowy Dwór Mazowiecki,
16 Otwock, 17 Piaseczno, 18 Pruszków, 19 Radzymin. Osobno działa Klub Seniora
(Rada Klubu Seniora wymieniana w sprawozdaniach Zarządu).

Koła podpisują się wzorem **„Koło OMPZW nr 13 Legionowo”** albo
**„Koło OM PZW nr 13”** — obie formy występują w materiałach Okręgu.

## Źródła

- Okręg Mazowiecki PZW — <https://ompzw.pl/>
- Zarząd Okręgu (Strefa PZW) — <https://om.pzw.pl/strefa-pzw/zarzad-okregu>
- Wykaz kół — <https://om.pzw.pl/strefa-pzw/wykaz-kol>
- Relacja z VII Okręgowego Zjazdu Delegatów OM PZW —
  <https://pzw.pl/szczegoly-artykulu/vii-okregowy-zjazd-delegatow-okregu-mazowieckiego-pzw_RitdNc5Zs6kn8SlCHG1m>
- Statut PZW (tekst jednolity 2017) —
  <https://pzw.org.pl/brepo/panel_repo/2023/03/03/dttmhj/statut-pzw.pdf>
- Regulamin Organizacyjny Koła PZW (dotyczy **kół**, nie okręgu) —
  <https://pzw.org.pl/brepo/panel_repo/2023/10/01/fyd1od/regulamin-organizacyjny-kola-pzw-od-1012020.pdf>
