---
name: polszczyzna
description: Pisanie tekstów, które nie brzmią jak wygenerowane maszynowo. Użyj przy każdym tekście dla ludzi: treści zawiadomień, komunikatach interfejsu, komentarzach, README i dokumentacji. Wywołaj też, gdy padnie uwaga, że coś brzmi sztucznie, sztampowo albo „jak AI”.
---

# Polszczyzna bez maszynowego posmaku

Zawiadomienia z tego narzędzia trafiają do władz Okręgu. Tekst, który brzmi
jak wygenerowany, podważa powagę pisma, niezależnie od tego, czy treść jest
poprawna.

## Najpierw zmierz

```bash
python3 scripts/styl.py                    # cały projekt
python3 scripts/styl.py README.md          # wybrany plik
python3 scripts/styl.py --szczegoly        # każde trafienie osobno
```

Skrypt liczy to, co da się policzyć: pauzy, zagęszczenie myślników, ich
skupienie w akapicie, zwroty-wytrychy i monotonię rytmu zdań. Nie zgaduj
„na ucho”, sprawdź liczbę.

## Myślniki

Główna rzecz do zapamiętania: **w polskim tekście stawia się półpauzę „–”,
nie pauzę „—”**. Długa pauza to nawyk z angielszczyzny i pierwszy sygnał,
że tekstu nie pisał człowiek.

Podmiana znaku to jednak łatwiejsza połowa roboty. Trudniejsza: większość
tych myślników w ogóle nie powinna tam stać. Pomiary z 2026 r. dają dla
modeli ok. 10,6 myślnika na 1000 słów wobec ludzkiej normy ok. 3,2. Jeden
myślnik w akapicie bywa stylem, pięć jest podpisem maszyny.

Zamiast myślnika najczęściej pasuje kropka, przecinek, dwukropek albo nawias:

```
źle:  Zebranie odbędzie się we wtorek — w sali na parterze — o godzinie 11:00.
lepiej: Zebranie odbędzie się we wtorek o godzinie 11:00, w sali na parterze.

źle:  Statut tego nie określa — reguluje to regulamin obrad.
lepiej: Statut tego nie określa. Reguluje to regulamin obrad.

źle:  Protokół trafia do Zarządu Okręgu — w ciągu 14 dni.
lepiej: Protokół trafia do Zarządu Okręgu w ciągu 14 dni.
```

Półpauza zostaje tam, gdzie naprawdę pracuje: w zakresach bez odstępów
(`11:00–14:00`, `2026–2030`, `§ 47 pkt 3–14`) i przy jednym wtrąceniu na
akapit, jeśli zdanie bez niego traci sens.

## Zwroty, które zdradzają maszynę

Wyrzuć bez żalu: „w dzisiejszym dynamicznym świecie”, „warto zauważyć, że”,
„warto podkreślić”, „należy pamiętać, że”, „kluczową rolę odgrywa”,
„kompleksowe podejście”, „podsumowując”, „reasumując”, „nie tylko…, ale
także…”, „stanowi doskonały przykład”.

Kalki z angielskiego brzmią równie źle: „adresować problem” zamiast „zająć
się problemem”, „dedykowany” zamiast „przeznaczony”, „w oparciu o” zamiast
„na podstawie”, „zaimplementować” zamiast „wdrożyć”.

## Reguła trzech

Modele wyliczają dokładnie trzy rzeczy, nawet gdy istotne są dwie albo pięć.
Zanim zostawisz wyliczenie na trzy pozycje, sprawdź, czy trzecia coś wnosi,
czy tylko domyka rytm. Jeśli domyka, skreśl ją.

## Rytm

Tekst maszynowy ma zdania podobnej długości i akapity podobnej wielkości.
Człowiek pisze nierówno: po zdaniu na trzy linijki wstawia zdanie na pięć
słów. Skrypt mierzy to jako zmienność długości zdań; poniżej 0,40 tekst
brzmi monotonnie.

Praktycznie: przeczytaj akapit i sprawdź, czy któreś zdanie da się przeciąć
na dwa albo skleić z sąsiednim. Zwykle da się i zwykle warto.

## Nienaturalna poprawność

Tekst wygenerowany bywa „do bólu poprawny” i przez to martwy. W dokumentacji
i komentarzach wolno napisać wprost: „tego nie sprawdziłem”, „to się już raz
zepsuło”, „nie wiem, czy Zarząd powołał prezydium”. Konkret i przyznanie się
do luki brzmią po ludzku, a przy okazji są uczciwsze.

## Osobno: tekst zawiadomień

Treść z `RODZAJE_POSIEDZEN` i `zlozZaproszenie_` czytają członkowie władz
Okręgu. Obowiązuje tam dodatkowo:

- **Styl pisma urzędowego, nie marketingowego.** Bez przymiotników
  oceniających, bez zachęt.
- **Odwołania do paragrafów w nawiasie**, na końcu zdania, nie w środku.
- **Formy grzecznościowe wielką literą** w zwrotach do adresata.
- **Odmiana wpisana wprost.** Nie ma reguły, która odmieni „Koło OMPZW nr 13”,
  dlatego dopełniacz siedzi w osobnym polu konfiguracji.

Po każdej zmianie tych tekstów wygeneruj zawiadomienie i **przeczytaj je
w całości** (sposób w skillu `interfejs`). Skrypt nie wyłapie zdania, które
jest poprawne, ale brzmi obco.

## Czego nie robić

- Nie podmieniaj „—” na „–” hurtem bez czytania. Część tych myślników ma
  zniknąć razem ze zdaniem, w którym stoi.
- Nie usuwaj wszystkich myślników do zera. Zero też jest nienaturalne.
- Nie stosuj tych reguł do cytatów ze Statutu ani do nazw własnych.
  Cytat przepisujesz wiernie, choćby brzmiał źle.
