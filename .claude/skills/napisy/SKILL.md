---
name: napisy
description: Napisy w interfejsie, żeby były zrozumiałe: etykiety przycisków, komunikaty błędów, stany puste, podpowiedzi pod polami. Użyj przy dodawaniu lub zmianie dowolnego tekstu widocznego w Index.html, a także gdy padnie uwaga, że nie wiadomo, co dany przycisk zrobi.
---

# Napisy w interfejsie

Odbiorcą jest prezes albo sekretarz Okręgu, nie programista. Sięga po
narzędzie kilka razy na kwartał, zwykle w pośpiechu przed wysłaniem
zawiadomienia. Jeśli musi zgadywać, co się stanie po kliknięciu, napis jest zły.

Styl prozy (myślniki, zwroty-wytrychy, rytm) to osobny skill: `polszczyzna`.
Tutaj chodzi o krótkie teksty sterujące.

## Przycisk mówi, co się stanie

Zaczynaj od czasownika i nazwij skutek, nie czynność w środku systemu.
Kliknięcie ma dać dokładnie to, co obiecuje napis.

| Źle | Dlaczego | Lepiej |
| --- | --- | --- |
| „Złóż zawiadomienie do sprawdzenia” | nie wiadomo, komu składa i co powstaje | „Pokaż zawiadomienie” |
| „Załóż szkielet protokołu” | „szkielet” to metafora z kodu | „Utwórz dokument protokołu” |
| „Utwórz posiedzenie i wstaw link Meet” | dwie czynności, druga niejasna gdzie | „Utwórz wydarzenie w kalendarzu” |
| „Zatwierdź” | co się zatwierdza i co potem | nazwa skutku |
| „OK” | nic nie znaczy | nazwa skutku |

Jeśli przycisk **niczego nie zmienia**, powiedz to wprost pod nim. W tym
projekcie krok pierwszy tylko układa tekst, więc pod przyciskiem stoi:
„W kalendarzu nic jeszcze nie powstanie”. Bez tego użytkownik boi się kliknąć.

Nazwa akcji nie zmienia się w trakcie. „Utwórz wydarzenie” prowadzi do
komunikatu o utworzonym wydarzeniu, nie o „zapisanym rekordzie”.

## Stan przejściowy

Napis w trakcie pracy opisuje to samo działanie w toku, krócej:
„Utwórz wydarzenie w kalendarzu” → „Tworzę wydarzenie…”. Nie zmieniaj przy tym
tematu na inny.

## Błąd mówi, co się stało i co zrobić

Trzy rzeczy w tej kolejności: co się nie udało, dlaczego, co teraz. Bez
przepraszania i bez ogólników.

```
źle:    Wystąpił błąd. Spróbuj ponownie.
lepiej: Nie włączono usługi Calendar API. W edytorze Apps Script kliknij
        „Usługi” i dodaj „Google Calendar API”.
```

Nie pokazuj użytkownikowi komunikatu z wnętrza systemu. `stany.filter is not
a function` nic mu nie mówi; to ma trafić do dziennika, nie na ekran.

## Stan pusty zaprasza do działania

Puste miejsce ma powiedzieć, czego brakuje i skąd się to bierze.
„Brak wcześniejszych posiedzeń” jest w porządku. „Brak danych” nie.

## Żargon

Skróty i słowa z wnętrza organizacji albo z kodu tłumacz na ludzki:

| Żargon | Po ludzku |
| --- | --- |
| „UDW: 13” | „13 osób, adresy w ukrytej kopii” |
| „gremium” | „organ” albo nazwa wprost: Zarząd, Prezydium, Komisja |
| „rekord”, „obiekt”, „szkielet” | nazwa rzeczy, którą użytkownik widzi |
| „wygeneruj” | „ułóż”, „przygotuj”, „utwórz” |

Zostają za to słowa, których odbiorca używa na co dzień i które są nazwami
własnymi: posiedzenie, prezydium, porządek obrad, zawiadomienie, protokół,
kworum, § i numer paragrafu. Upraszczanie ich zaszkodziłoby.

## Etykiety pól

Nazwij to, co użytkownik wpisuje, nie pole w bazie. Dopisek „opcjonalnie”
przy polu, bez którego da się przejść dalej. Podpowiedź pod polem tłumaczy
skutek wyboru, nie powtarza etykiety.

```
źle:    Miejsce obrad
        Wpisz miejsce obrad.
lepiej: Miejsce obrad — opcjonalnie
        Zostaw puste, jeśli posiedzenie jest wyłącznie online.
```

## Nagłówki sekcji

Sam przymiotnik nie wystarczy. „Najbliższe” zmieniło się na „Najbliższe
posiedzenia”, bo w panelu obok stoi „Ostatnie” i „Terminy statutowe”,
a wszystkie trzy dotyczą czegoś innego.

## Sprawdzenie

Po zmianie napisów wypisz same przyciski i przeczytaj je z rzędu:

```bash
python3 - <<'EOF'
import re
from pathlib import Path
html = Path('apps-script/Index.html').read_text(encoding='utf-8').split('<script>')[0]
for m in re.finditer(r'<button[^>]*id="([^"]*)"[^>]*>(.*?)</button>', html, re.S):
    print(f'{m.group(1):24s} „{" ".join(m.group(2).split())}”')
EOF
```

Przy każdym zadaj jedno pytanie: **czy z samego napisu wiem, co się stanie
po kliknięciu?** Jeśli musisz zajrzeć do kodu, napis jest zły.

Potem zrób zrzuty (`python3 scripts/podglad.py`) i przeczytaj napisy
w kontekście. Etykieta bywa jasna w kodzie, a myląca obok sąsiedniej.

## Gotowe skille do rozważenia

Dojrzalsze zestawy reguł, gdyby ten przestał wystarczać: `ux-writing`
(Anthropic, marketplace `knowledge-work-plugins`) oraz społecznościowe
`content-designer/ux-writing-skill`. Oba stoją na tych samych pięciu
zasadach: jasno, zwięźle, spójnie, użytecznie, po ludzku.
