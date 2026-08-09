---
name: zrodla-pzw
description: Pobiera i cytuje dokumenty PZW — Statut, regulaminy, strony Okręgu Mazowieckiego. Użyj, gdy trzeba sprawdzić paragraf, skład władz, wykaz kół albo cokolwiek na stronach pzw.pl, pzw.org.pl, ompzw.pl, om.pzw.pl (WebFetch dostaje tam 406).
---

# Źródła PZW — jak je pobrać i czytać

## Serwisy PZW oddają HTTP 406

`pzw.pl`, `pzw.org.pl`, `om.pzw.pl` i `ompzw.pl` odrzucają żądania bez
przeglądarkowego `User-Agent`. **`WebFetch` się na tym wykłada.** Pobieraj
przez `curl`:

```bash
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36"
curl -sL -A "$UA" "$URL"
```

Do czytania HTML-a — odsiej znaczniki:

```bash
curl -sL -A "$UA" "$URL" | python3 -c "
import sys, re, html
t = sys.stdin.read()
t = re.sub(r'(?is)<(script|style|nav|footer|head).*?</\1>', ' ', t)
t = re.sub(r'(?s)<[^>]+>', '\n', t)
print('\n'.join(l.strip() for l in html.unescape(t).split('\n') if l.strip()))
"
```

`ompzw.pl/zarzad` przekierowuje (302) na `om.pzw.pl/strefa-pzw/zarzad-okregu`,
a ta strona renderuje skład JavaScriptem — przez `curl` widać samo menu.
Po składy władz sięgaj do **relacji ze zjazdu** na `pzw.pl`.

## Dokumenty są w PDF, a `pdftotext` nie ma w systemie

```bash
curl -sL -A "$UA" -o /tmp/statut.pdf \
  "https://pzw.org.pl/brepo/panel_repo/2023/03/03/dttmhj/statut-pzw.pdf"
```

Ekstrakcja przez dekompresję strumieni:

```python
import re, zlib
d = open('/tmp/statut.pdf', 'rb').read()
out = []
for m in re.finditer(rb'stream\r?\n(.*?)endstream', d, re.S):
    try: out.append(zlib.decompress(m.group(1)))
    except Exception: pass
txt = b'\n'.join(out)
parts = re.findall(rb'\((?:[^()\\]|\\.)*\)', txt)
t = b''.join(re.sub(rb'\\([()\\])', rb'\1', p[1:-1]) for p in parts).decode('latin-1')
# przybliżone mapowanie — kody zależą od podstawionej czcionki w danym PDF-ie
for k, v in {'\x01':'ą','\n':'ł','\x02':'ę','\x03':'ć','\x04':'ń',
             '\x05':'ś','\x06':'ź','\x07':'ż'}.items():
    t = t.replace(k, v)
open('/tmp/statut.txt', 'w').write(t)
```

**Diakrytyki wychodzą zawodnie** — mapowanie różni się między plikami.
Tekst nadaje się do **wyszukiwania paragrafów i czytania ze zrozumieniem**,
ale **nie do cytowania dosłownego**. Numery paragrafów, ustępów i liczby
przechodzą czysto, więc do weryfikacji „§ 46 ust. 1 — raz na kwartał”
wystarcza w zupełności. Jeśli potrzebny jest dosłowny cytat, przeczytaj PDF
w czytniku i przepisz ręcznie.

Wyszukiwanie w wyniku:

```python
t = open('/tmp/statut.txt').read()
i = t.find('§ 46')
print(t[i:i+1200])
```

## Stałe adresy

Pełna, sprawdzona lista: [`docs/linki.md`](../../../docs/linki.md).
Najczęściej potrzebne:

| Dokument / strona                      | URL |
| -------------------------------------- | --- |
| Statut PZW (tekst jednolity 2017)      | `https://pzw.org.pl/brepo/panel_repo/2023/03/03/dttmhj/statut-pzw.pdf` |
| Regulamin Organizacyjny Koła PZW       | `https://pzw.org.pl/brepo/panel_repo/2023/10/01/fyd1od/regulamin-organizacyjny-kola-pzw-od-1012020.pdf` |
| Wzorcowy regulamin obrad walnego (.doc) | `https://pzw.org.pl/pliki/prezentacje/55/wiadomosci/15056/pliki/wzorcowy_regulamin.doc` |
| Okręg Mazowiecki — serwis własny       | `https://ompzw.pl/` |
| Okręg Mazowiecki — Strefa PZW          | `https://om.pzw.pl/strefa-pzw/zarzad-okregu` |
| Wykaz kół                              | `https://om.pzw.pl/strefa-pzw/wykaz-kol` |
| VII Okręgowy Zjazd Delegatów OM PZW    | `https://pzw.pl/szczegoly-artykulu/vii-okregowy-zjazd-delegatow-okregu-mazowieckiego-pzw_RitdNc5Zs6kn8SlCHG1m` |

Pliki `.doc` czytaj przez `textutil -convert txt -encoding UTF-8` (macOS).

## Zanim zacytujesz

Sprawdź **szczebel**. Statut rozdz. V (§§ 37–52) dotyczy okręgu, rozdz. VI
(§§ 53–62) i cały Regulamin Organizacyjny Koła — koła. To najczęstsza pomyłka
w tym projekcie; opis w `docs/statut-pzw-okreg.md`.

Wyniki, które mają zostać w projekcie, dopisz do `docs/` z linkiem do źródła
i datą — a nie tylko do odpowiedzi w czacie.
