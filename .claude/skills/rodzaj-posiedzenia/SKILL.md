---
name: rodzaj-posiedzenia
description: Dodaje lub zmienia rodzaj posiedzenia w generatorze OM PZW — wpis w RODZAJE_POSIEDZEN wraz z podstawą prawną, porządkiem obrad i weryfikacją. Użyj, gdy pada prośba o nowy typ zebrania, posiedzenia, zjazdu, narady albo o zmianę porządku obrad, terminu zawiadomienia czy kworum.
---

# Dodanie rodzaju posiedzenia

Rodzaje posiedzeń są **danymi**, nie kodem. `Kod.gs` nie zna żadnego `id` —
cała wiedza siedzi w tablicy `RODZAJE_POSIEDZEN` w
`apps-script/Konfiguracja.gs`. Dodanie nowego rodzaju to jeden wpis w tablicy.

## Zanim zaczniesz

Ustal **szczebel**. Narzędzie obsługuje okręg (Statut PZW, rozdz. V, §§ 37–52).
Przepisy o kole (rozdz. VI, §§ 53–62, Regulamin Organizacyjny Koła PZW)
**nie stosują się** — nie przenoś stamtąd kworum ani dwóch terminów.
Szczegóły: `docs/statut-pzw-okreg.md`, sekcja „Czego tu NIE ma”.

Ustal **podstawę prawną**. Każde pole formalne (`wyprzedzenieDni`, `kworum`,
`cyklMiesiecy`, `naPismie`) musi dać się wskazać w Statucie. Jeśli Statut
milczy — wpisz zero albo pusty ciąg i powiedz o tym wprost w polu `kworum`
(„Statut nie określa…”), zamiast zgadywać.

Gdy brakuje Ci przepisu, pobierz Statut:

```bash
curl -sL -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) \
AppleWebKit/537.36 Chrome/126 Safari/537.36" \
  -o /tmp/statut.pdf "https://pzw.org.pl/brepo/panel_repo/2023/03/03/dttmhj/statut-pzw.pdf"
```

Ekstrakcja tekstu z PDF-a: przepis w `docs/kontekst-i-research.md`.

## Wpis w tablicy

Skopiuj `zarzad-okregu` jako punkt wyjścia i wypełnij wszystkie pola —
`Kod.gs` czyta je bez sprawdzania, brakujące pole daje `undefined` w tekście
zawiadomienia.

```js
{
  id: 'kluczTechniczny',            // bez spacji i polskich znaków
  nazwa: 'Etykieta na liście',
  tytul: 'Domyślny tytuł wydarzenia w kalendarzu',
  zdanieZwolania: 'zwołuję posiedzenie X {okregu}, które odbędzie się',
  czasTrwaniaMinut: 120,
  wyprzedzenieDni: 0,               // 0 = Statut nie wymaga
  naPismie: false,                  // true tylko dla zjazdów (§ 41 ust. 2)
  drugiTermin: false,               // na szczeblu okręgu zawsze false
  kworum: '',                       // '' = pomiń akapit w zawiadomieniu
  listaObecnosci: false,            // true → ostrzeżenie przy braku miejsca
  niejawne: false,                  // true → inny dopisek pod linkiem
  cyklMiesiecy: 0,                  // 0 = bez przypomnienia o kolejnym terminie
  zwoluje: 'Kto zwołuje (§ …).',
  czestotliwosc: 'Jak często (§ …).',
  dopiskFormalny: '',               // akapit nad porządkiem obrad
  podstawa: '§ … Statutu PZW',      // trafia do stopki zawiadomienia
  porzadek: [
    '1. Otwarcie posiedzenia.',
    // …
    '9. Zamknięcie posiedzenia.',
  ],
}
```

### Odmiana w `zdanieZwolania`

`{okreg}` → mianownik, `{okregu}` → skrócony dopełniacz („Okręgu Mazowieckiego
PZW”). Zdanie niesie **własny zaimek**, bo rodzaj gramatyczny się zmienia:

- *posiedzenie*, *zebranie* (nijaki) → „**które** odbędzie się”
- *zjazd* (męski) → „**który** odbędzie się”
- *narada* (żeński) → „**która** odbędzie się”

Nie próbuj tego generować regułką — wpisz gotową formę.

### Porządek obrad

Numeruj ręcznie w treści punktu (`'1. Otwarcie…'`) — narzędzie nie numeruje.
Przy punktach wynikających z przepisu dopisz paragraf w nawiasie; to trafia
wprost do maila i pomaga prowadzącemu.

Trzymaj rytuał PZW: otwarcie → wybór prezydium/stwierdzenie prawomocności →
porządek i regulamin → komisje → sprawozdania → dyskusja → uchwały →
wolne wnioski → zamknięcie.

## Weryfikacja

Składnia trzech plików:

```bash
cp apps-script/Konfiguracja.gs /tmp/k.js && cp apps-script/Kod.gs /tmp/kod.js
python3 -c "import re; h=open('apps-script/Index.html',encoding='utf-8').read(); \
  open('/tmp/index-script.js','w',encoding='utf-8').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))"
node --check /tmp/k.js && node --check /tmp/kod.js && node --check /tmp/index-script.js
```

Potem **przeczytaj wygenerowany tekst** — `node --check` nie wyłapie „Zarządu
Koło” ani podwójnej kropki:

```js
global.Utilities = { getUuid: () => 'x', formatDate: (d, tz, f) => {
  const p = n => String(n).padStart(2, '0');
  return f === 'HH:mm' ? p(d.getHours()) + ':' + p(d.getMinutes())
       : f === 'yyyy-MM-dd' ? d.getFullYear() + '-' + p(d.getMonth()+1) + '-' + p(d.getDate()) : '';
}};
const fs = require('fs');
require('vm').runInThisContext(
  fs.readFileSync('/tmp/k.js','utf8') + '\n' + fs.readFileSync('/tmp/kod.js','utf8')
);
const r = znajdzRodzaj_('kluczTechniczny');
console.log(zlozZaproszenie_(r, zbudujDate_('2026-09-15','11:00'), null, 'LINK', 'Serock', r.porzadek));
console.log(zbadajTerminy_(r, zbudujDate_('2026-09-15','11:00'), ''));
```

`const` nie wycieka z `eval` — musi być `vm.runInThisContext`.

## Na koniec

Dopisz wiersz do tabeli rodzajów w `README.md` i — jeśli wpis opiera się na
paragrafie, którego tam jeszcze nie ma — do `docs/statut-pzw-okreg.md`.
