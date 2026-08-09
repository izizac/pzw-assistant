---
name: dane-osobowe
description: Przegląd zmian pod kątem danych osobowych i RODO — adresy członków Zarządu, nazwiska, zakresy OAuth, logi, commity. Użyj przy dotykaniu adresyDoWysylki, wysyłki maili, uprawnień w appsscript.json, dopisywaniu danych do dokumentacji albo gdy pada prośba o przegląd bezpieczeństwa czy zgodności.
---

# Dane osobowe w tym projekcie

Narzędzie przetwarza dane członków władz Okręgu Mazowieckiego PZW —
stowarzyszenia z osobowością prawną, które podlega RODO jako administrator.
Skala jest mała, ale rodzaj danych nie: imiona, nazwiska, adresy e-mail
i przynależność organizacyjna osób pełniących funkcje społeczne.

## Trzy zasady, które już są w kodzie — nie łam ich

**1. Adresy zawsze do UDW.** `utworzWersjeRoboczaMaila` wkłada
`KONFIG.adresyDoWysylki` do `bcc`, a w polu „Do” zostawia skrzynkę Okręgu.
Mail do grupy osób nie może ujawniać pozostałym odbiorcom całej listy
adresowej — to klasyczne, realne naruszenie, nie teoria.

Jeśli dodajesz nowy sposób wysyłki, powtórz ten wzorzec. Nigdy nie wstawiaj
listy członków do `to` ani do `cc`.

**2. Skrypt nie może wysłać maila.** Zakres to `gmail.compose`, nie
`gmail.send`. Wersja robocza wymaga świadomego kliknięcia „Wyślij” przez
człowieka. Nie podmieniaj zakresu na szerszy dla wygody.

**3. W repozytorium nie ma danych konkretnych osób.** `KONFIG.podpis` to
`Imię Nazwisko`, `adresyDoWysylki` to pusta lista. Konfigurację z prawdziwymi
danymi użytkownik trzyma u siebie, w edytorze Apps Script.

## Przy zmianie zakresów OAuth

`appsscript.json` prosi o `calendar`, `gmail.compose`, `userinfo.email`.
Każdy dodatkowy zakres:

- wymusza **ponowną autoryzację** u użytkownika,
- musi trafić do README, do sekcji o wdrożeniu,
- musi mieć uzasadnienie węższe niż „może się przydać”.

Zanim dodasz zakres, sprawdź, czy węższy nie wystarczy — Google publikuje
listę pod adresem <https://developers.google.com/apps-script/concepts/scopes>.

## Przy dopisywaniu danych do dokumentacji

W `docs/` mogą trafiać **dane jawne, publikowane przez sam Związek** —
skład władz z relacji ze zjazdu, adres biura, telefony Okręgu. To informacje,
które PZW sam opublikował na swoich stronach.

Nie dopisuj: prywatnych adresów e-mail, numerów telefonów osób fizycznych,
adresów zamieszkania, danych członków spoza władz. Jeśli trafisz na taki
materiał w źródle, zacytuj sam fakt bez danych kontaktowych.

## Przegląd zmiany — lista kontrolna

Przed zakończeniem pracy, która dotykała maili, uprawnień albo konfiguracji:

```bash
# adresy e-mail wprowadzone do repozytorium
grep -rnE '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' \
  --include='*.gs' --include='*.html' --include='*.json' --include='*.md' . \
  | grep -v 'noreply@\|example\|@Anthropic'

# czy gdzieś nie przeciekła lista adresowa poza UDW
grep -rn 'adresyDoWysylki' apps-script/

# zakresy OAuth
python3 -c "import json; print(json.load(open('apps-script/appsscript.json'))['oauthScopes'])"
```

Sprawdź też, czy:

- [ ] żaden `Logger.log` ani `console.log` nie wypisuje adresów ani nazwisk,
- [ ] komunikaty błędów pokazywane w interfejsie nie zawierają cudzych danych,
- [ ] nowe pole formularza nie trafia do `extendedProperties` wydarzenia,
      jeśli nie musi — kalendarz bywa współdzielony,
- [ ] w `docs/` nie przybyło danych kontaktowych osób fizycznych.

## Czego ten skill nie rozstrzyga

Nie zastępuje analizy prawnej. Jeśli pojawia się pytanie o podstawę
przetwarzania, obowiązek informacyjny albo rejestr czynności — powiedz
wprost, że to decyzja administratora danych (Zarządu Okręgu), i wskaż
[politykę RODO Okręgu](https://om.pzw.pl/strefa-wedkarza/rodo) zamiast
zgadywać.
