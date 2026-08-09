# Kontekst, potrzeby i przebieg researchu

Zapis tego, czego trzeba było się dowiedzieć, żeby napisać to narzędzie —
i dlaczego wygląda tak, a nie inaczej. Dla agenta AI, który wróci do projektu
za pół roku, albo dla kolejnej osoby, która go przejmie.

## Jak działa PZW — model organizacyjny w trzech zdaniach

Polski Związek Wędkarski to stowarzyszenie o **trzech szczeblach**: Zarząd
Główny → okręgi → koła. Okręg ma **własną osobowość prawną** (Statut § 63
ust. 3), koło jej nie ma i działa na pełnomocnictwach okręgu. Każdy szczebel ma
komplet organów: władzę uchwałodawczą (zjazd/walne zgromadzenie), zarząd,
komisję rewizyjną i sąd koleżeński.

To rozróżnienie jest **głównym źródłem pomyłek**. Pierwsza wersja narzędzia
powstała dla koła i została w całości przepisana, kiedy okazało się, że chodzi
o Zarząd Okręgu. Przepisy nie są przenośne między szczeblami — patrz sekcja
„Czego tu NIE ma” w [`statut-pzw-okreg.md`](statut-pzw-okreg.md).

## Dwie różne podstawy prawne

| Szczebel | Dokument                                                    | Charakter                        |
| -------- | ----------------------------------------------------------- | -------------------------------- |
| Okręg    | **Statut PZW** (tekst jednolity 15.03.2017), rozdz. V §§ 37–52 | uchwalany przez Krajowy Zjazd Delegatów |
| Koło     | **Regulamin Organizacyjny Koła PZW** (uchwała 205/XII/2019 ZG PZW, od 1.01.2020) + Statut rozdz. VI §§ 53–62 | uchwalany przez Zarząd Główny |

Statut jest **oszczędny** — dla okręgu podaje częstotliwość posiedzeń, kto
zwołuje i 21-dniowy termin dla zjazdu, ale milczy o kworum zwykłych posiedzeń,
o formie protokołu i o terminach jego przekazania. Regulamin Koła jest
**znacznie bardziej szczegółowy** (lista obecności, dwa terminy, protokół
w 14 dni do okręgu). Kusi, żeby przenieść te szczegóły w górę — nie wolno.

Gdzie Statut milczy, decyduje **regulamin obrad** uchwalany przez samo gremium
(zjazd: § 43 pkt 1). Dlatego w konfiguracji rodzaje zjazdowe mają w polu
`kworum` uczciwe „Statut nie określa…”, a nie zmyśloną regułę.

## Rytm pracy okręgu — co narzędzie ma obsłużyć

Statut narzuca **cykl**, nie kalendarz:

- **Prezydium** — nie rzadziej niż raz w miesiącu (§ 48 ust. 1)
- **Zarząd Okręgu** — nie rzadziej niż raz na kwartał (§ 46 ust. 1)
- **OKR** — kontrola zarządu i informacja dla niego raz w roku (§ 50 ust. 2)
- **Zjazd** — co 4 lata (§ 41 ust. 1)

Terminy są **ruchome i nieregularne**: „nie rzadziej niż raz na kwartał” nie
znaczy „pierwszy wtorek marca”. Data zapada na bieżąco, zwykle na poprzednim
posiedzeniu. To dokładnie ten przypadek, w którym seria cykliczna w kalendarzu
(`RRULE`) przeszkadza, a ręczne zakładanie wydarzeń męczy — stąd całe narzędzie.

Nikt nie pilnuje, czy kwartał nie upłynął. Stąd **całodniowe przypomnienie**
zakładane automatycznie na dzień, w którym cykl się domyka.

## Podział pracy: Prezydium a Zarząd

To sedno mechaniki okręgu i najciekawszy fragment Statutu. Prezydium prowadzi
sprawy **na bieżąco**, ale jego uchwały w sprawach z § 47 pkt 3–14, 23–25 i 27
(budżet, sprawozdania finansowe, składki, powoływanie kół, umowy majątkowe,
spółki, kadry biura, pełnomocnictwa) **muszą trafić na najbliższe posiedzenie
Zarządu Okręgu**, który może je uchylić bądź zmienić (§ 48 ust. 2).

Konsekwencje w narzędziu:

- zawiadomienie o posiedzeniu Prezydium zawsze niesie ten akapit
  (`dopiskFormalny`),
- porządek obrad Zarządu Okręgu ma osobny punkt na przyjęcie uchwał Prezydium,
- porządek obrad Prezydium ma punkt „uchwały wymagające przedłożenia”.

Jeśli ktoś tego nie dopilnuje, uchwały Prezydium wiszą w próżni proceduralnej.

## Czego narzędzie świadomie nie załatwia

**Formy pisemnej.** § 41 ust. 2 żąda zawiadomienia o zjeździe **na piśmie**,
do delegatów **i do zarządów kół**, z załączonym sprawozdaniem z działalności.
Mail tego nie zastępuje. Narzędzie generuje treść i ostrzega — wysyłka listowna
zostaje po stronie biura.

**Ważności obrad online.** Wybory władz okręgu wymagają listy obecności
z podpisami i głosowania tajnego. Meet jest **uzupełnieniem** obrad
stacjonarnych, nie ich zamiennikiem. Przy zjeździe bez podanego miejsca
narzędzie o tym mówi wprost.

**Protokołów.** Statut nie nakłada na okręg terminu przekazania protokołu
(inaczej niż na koło — 14 dni do zarządu okręgu). Nie ma czego pilnować.

## Jak wygląda realne zawiadomienie w PZW

Wzorzec zebrany z materiałów kół OM PZW i wzorcowego regulaminu obrad ZG PZW:

- zwrot „Szanowne Koleżanki, Szanowni Koledzy” albo „Koleżanki i Koledzy”,
- formuła zwołania z **podstawą prawną** i pełną nazwą jednostki,
- termin (przy kole: dwa terminy tego samego dnia, np. 09:15 i 09:45),
- miejsce,
- **numerowany porządek obrad** — realne walne w kole miewa 21 punktów,
  zjazd okręgowy podobnie,
- podpis funkcyjny („ZARZĄD KOŁA”, „Prezes Zarządu Okręgu”),
- zwrot pożegnalny „Z wędkarskim pozdrowieniem”.

Porządek obrad jest **rytualny i powtarzalny** — otwarcie, wybór prezydium,
regulamin, komisje, sprawozdania, dyskusja, uchwały, wolne wnioski, zamknięcie.
Dlatego szkice w `RODZAJE_POSIEDZEN` są tak rozbudowane: 90% treści jest
przewidywalne, a przepisywanie tego ręcznie co kwartał to czysta strata.

## Pułapki techniczne napotkane przy researchu

**HTTP 406 na serwisach PZW.** `pzw.org.pl`, `pzw.pl`, `om.pzw.pl` i
`ompzw.pl` odrzucają żądania bez przeglądarkowego `User-Agent`. `WebFetch`
dostaje 406. Obejście:

```bash
curl -sL -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) \
AppleWebKit/537.36 Chrome/126 Safari/537.36" "$URL"
```

**Statut i regulaminy są tylko w PDF.** Bez `pdftotext` (brak w systemie)
tekst wyciągnąłem dekompresując strumienie PDF-a i sklejając stringi operatorów
tekstowych:

```python
import re, zlib
d = open('statut.pdf','rb').read()
out = []
for m in re.finditer(rb'stream\r?\n(.*?)endstream', d, re.S):
    try: out.append(zlib.decompress(m.group(1)))
    except Exception: pass
txt = b'\n'.join(out)
parts = re.findall(rb'\((?:[^()\\]|\\.)*\)', txt)
t = b''.join(p[1:-1] for p in parts).decode('latin-1')
```

Polskie znaki wychodzą jako kody sterujące podstawionej czcionki (`\x01` → ą,
`\n` → ł, `\x02` → ę). Mapowanie jest **przybliżone i różne dla każdego PDF-a** —
tekst nadaje się do czytania i wyszukiwania paragrafów, ale **nie do cytowania
dosłownego**. Numery paragrafów i liczby przechodzą czysto, więc do weryfikacji
`§ 46 ust. 1` w zupełności wystarcza.

**Relacja ze Zjazdu okazała się lepszym źródłem niż strona „Zarząd Okręgu”.**
Ta druga renderuje skład JavaScriptem i przez `curl` widać samo menu. Artykuł
na `pzw.pl` podał składy liczbowe, nazwiska i datę — wszystko, czego trzeba.

## Kolejność, w jakiej warto to czytać

1. [`statut-pzw-okreg.md`](statut-pzw-okreg.md) — co mówi prawo
2. [`okreg-mazowiecki.md`](okreg-mazowiecki.md) — kto i gdzie, stan na 2026
3. ten plik — dlaczego kod wygląda tak, jak wygląda
4. [`apps-script.md`](apps-script.md) — jak to działa technicznie
