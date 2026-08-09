#!/usr/bin/env python3
"""Renderuje Index.html lokalnie, z atrapą google.script.run.

Apps Script nie da się uruchomić poza Google, ale sam interfejs to zwykły
HTML. Wystarczy podstawić atrapę serwera i otworzyć plik w przeglądarce.
Skrypt składa podgląd w /tmp i, jeśli w systemie jest Chrome, robi zrzuty
ekranu dla szerokości biurkowej i telefonu.

Użycie:
    python3 scripts/podglad.py            # złóż podgląd i zrób zrzuty
    python3 scripts/podglad.py --otworz   # dodatkowo otwórz w przeglądarce
"""

import re
import shutil
import subprocess
import sys
from pathlib import Path

KORZEN = Path(__file__).resolve().parent.parent
ZRODLO = KORZEN / 'apps-script' / 'Index.html'
PODGLAD = Path('/tmp/pzw-podglad.html')
ZRZUTY = Path('/tmp/pzw-zrzuty')

CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

# Atrapa serwera. Odpowiedzi mają taki kształt, jaki zwraca Kod.gs.
ATRAPA = """
<script>
  window.google = { script: { run: (function () {
    // Dodatki wracają w kilku miejscach naraz, więc stoją w jednym miejscu.
    const DODATKI_PRZYKLAD = [
      { id: 'cykl', etap: 'po', nazwa: 'Przypomnienie o cyklu', domyslnie: true, stan: 'gotowe',
        link: '', opis: 'Całodniowy wpis w dniu, w którym upływa termin ze Statutu' },
      { id: 'obecnosc', etap: 'wtrakcie', nazwa: 'Lista obecności', domyslnie: true, stan: 'gotowe',
        link: '#', opis: 'Dokument do druku z rubrykami na podpisy członków' },
      { id: 'folder', etap: 'przed', nazwa: 'Folder na materiały', domyslnie: false, stan: 'oczekuje',
        link: '', opis: 'Folder na Dysku Google, do którego wrzucisz dokumenty na obrady' },
      { id: 'protokol', etap: 'wtrakcie', nazwa: 'Szkielet protokołu', domyslnie: false, stan: 'oczekuje',
        link: '', opis: 'Dokument z porządkiem obrad, tabelą uchwał i miejscem na podpisy' },
    ];

    const DANE = {
      pobierzDomyslne: {
        okreg: {
          nazwa: 'Okręg Mazowiecki Polskiego Związku Wędkarskiego w Warszawie',
          adres: 'ul. Retmańska 75, 05-140 Serock',
          telefony: ['22 620 50 83', '22 654 57 05'],
        },
        kadencja: '2026–2030',
        godzina: '11:00',
        domyslnyRodzaj: 'zarzad-okregu',
        odstepDrugiegoTerminu: 30,
        mailWlaczony: true,
        liczbaAdresatow: 13,
        rejestrUchwal: true,
        etapy: [
          { id: 'przed', nazwa: 'Przed posiedzeniem', opis: 'Do rozesłania i przygotowania' },
          { id: 'wtrakcie', nazwa: 'Na posiedzenie', opis: 'Weź ze sobą albo miej otwarte' },
          { id: 'po', nazwa: 'Po posiedzeniu', opis: 'Domknięcie sprawy' },
        ],
        preferowanyDzienTygodnia: 4,
        ktoryTydzienMiesiaca: 2,
        przypomnienia: { dostepne: true, zainstalowany: false, godzina: 7 },
        zwolujacy: {
          osoby: [
            { id: 'sobczak', imie: 'Daniel Sobczak', etykieta: 'Daniel Sobczak, Wiceprezes ZO ds. Sportu' },
            { id: 'kolodziejek', imie: 'Piotr Kołodziejek', etykieta: 'Piotr Kołodziejek, Prezes ZO' },
          ],
          domyslny: 'sobczak',
          wlasna: false,
        },
        linki: [
          { nazwa: 'Uchwały Zarządu Okręgu', opis: 'Od tego zacznij punkt „realizacja uchwał”', adres: '#' },
          { nazwa: 'Skład Zarządu i organów', opis: 'Zarząd Okręgu, OKR, OSK, kadencja 2026–2030', adres: '#' },
          { nazwa: 'Statut PZW', opis: 'Tekst jednolity z 15 marca 2017 r. (PDF)', adres: '#' },
          { nazwa: 'Wykaz kół Okręgu', opis: 'Numery, nazwy i strony kół OM PZW', adres: '#' },
          { nazwa: 'Do pobrania: druki dla kół', opis: 'Formularze i wzory dokumentów', adres: '#' },
          { nazwa: 'Zarząd Główny PZW', opis: 'Uchwały i komunikaty szczebla krajowego', adres: '#' },
        ],
        rodzaje: [
          {
            id: 'zarzad-okregu',
            nazwa: 'Posiedzenie Zarządu Okręgu',
            tytul: 'Posiedzenie Zarządu Okręgu Mazowieckiego PZW',
            czasTrwaniaMinut: 180, wyprzedzenieDni: 0, naPismie: false,
            drugiTermin: false, listaObecnosci: true, cyklMiesiecy: 3,
            sklad: 13, niejawne: false, uchwalyPrzedkladane: false,
            liczbaAdresatow: 13,
            zwolujacy: {
              osoby: [
                { id: 'sobczak', imie: 'Daniel Sobczak', etykieta: 'Daniel Sobczak, Wiceprezes ZO ds. Sportu' },
                { id: 'kolodziejek', imie: 'Piotr Kołodziejek', etykieta: 'Piotr Kołodziejek, Prezes ZO' },
              ],
              domyslny: 'sobczak', wlasna: false,
            },
            zwoluje: 'Prezes zarządu okręgu lub upoważniony przez niego członek zarządu (§ 46 ust. 2).',
            czestotliwosc: 'W miarę potrzeb, nie rzadziej niż raz na kwartał (§ 46 ust. 1).',
            podstawa: '§ 46 Statutu PZW',
            porzadek: [
              '1. Otwarcie posiedzenia i stwierdzenie zdolności do podejmowania uchwał.',
              '2. Przyjęcie porządku obrad.',
              '3. Przyjęcie protokołu z poprzedniego posiedzenia Zarządu Okręgu.',
              '4. Uchwały Prezydium podjęte w sprawach z § 47 pkt 3–14, 23–25 i 27.',
              '5. Realizacja uchwał Krajowego Zjazdu Delegatów i Zarządu Głównego PZW.',
              '6. Sprawy finansowe: wykonanie budżetu, roczne sprawozdanie finansowe.',
              '7. Wnioski pokontrolne Okręgowej Komisji Rewizyjnej.',
              '8. Ochrona i zagospodarowanie wód, zarybienia.',
              '9. Sprawy różne i wolne wnioski.',
              '10. Zamknięcie posiedzenia.',
            ],
          },
          {
            id: 'zjazd',
            nazwa: 'Okręgowy Zjazd Delegatów (zwyczajny)',
            tytul: 'Okręgowy Zjazd Delegatów Okręgu Mazowieckiego PZW',
            czasTrwaniaMinut: 480, wyprzedzenieDni: 21, naPismie: true,
            drugiTermin: false, listaObecnosci: true, cyklMiesiecy: 0,
            sklad: 0, niejawne: false, uchwalyPrzedkladane: false,
            liczbaAdresatow: 13,
            zwolujacy: {
              osoby: [
                { id: 'kolodziejek', imie: 'Piotr Kołodziejek', etykieta: 'Piotr Kołodziejek, Prezes ZO' },
              ],
              domyslny: 'kolodziejek', wlasna: false,
            },
            zwoluje: 'Zarząd okręgu, w terminie uzgodnionym z Zarządem Głównym (§ 41 ust. 1).',
            czestotliwosc: 'Co 4 lata (§ 41 ust. 1).',
            podstawa: '§ 41 ust. 2 Statutu PZW',
            porzadek: ['1. Otwarcie Zjazdu.', '2. Wybór Prezydium Zjazdu.'],
          },
        ],
      },
      pobierzNadchodzace: [
        { tytul: 'Posiedzenie Prezydium Zarządu Okręgu', kiedy: '9 września 2026 r., godz. 16:00', termin: false, linkWydarzenia: '#' },
        { tytul: 'Upływa termin: Posiedzenie Zarządu Okręgu', kiedy: '9 września 2026 r.', termin: true, linkWydarzenia: '#' },
        { tytul: 'Posiedzenie Zarządu Okręgu Mazowieckiego PZW', kiedy: '6 października 2026 r., godz. 11:00', termin: false, linkWydarzenia: '#' },
      ],
      pobierzOtoczenieTerminu: function (data) {
        const MIES = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
          'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
        const MIESM = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
          'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'];
        const DNI = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek',
          'piątek', 'sobota'];
        // Skrót atrapy: kilka świąt i jedna przerwa. Prawdziwe reguły siedzą
        // w KalendarzPolski.gs.
        const SWIETA = { '01-01': 'Nowy Rok', '05-01': 'Święto Państwowe',
          '05-03': 'Święto Narodowe Trzeciego Maja', '11-01': 'Wszystkich Świętych',
          '11-11': 'Narodowe Święto Niepodległości',
          '12-24': 'Wigilia Bożego Narodzenia', '12-25': 'Boże Narodzenie',
          '12-26': 'Boże Narodzenie, drugi dzień' };

        const dwa = (n) => (n < 10 ? '0' : '') + n;
        const iso = (d) => d.getFullYear() + '-' + dwa(d.getMonth() + 1) + '-' + dwa(d.getDate());
        const md = (d) => dwa(d.getMonth() + 1) + '-' + dwa(d.getDate());
        const dat = (d) => d.getDate() + ' ' + MIES[d.getMonth()] + ' ' + d.getFullYear() + ' r.';
        const przesun = (d, ile) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + ile);
        const przerwa = (d) => md(d) >= '12-23' && md(d) <= '12-31';

        const czesci = String(data).split('-').map(Number);
        const srodek = new Date(czesci[0], czesci[1] - 1, czesci[2]);

        const pozycje = [];
        for (let i = -10; i <= 10; i++) {
          const d = przesun(srodek, i);
          const swieto = SWIETA[md(d)];
          if (!swieto) { continue; }
          pozycje.push({ data: iso(d), nazwa: swieto, rodzaj: 'wolne', godzina: '',
            odleglosc: i, opis: DNI[d.getDay()] + ', ' + dat(d),
            kiedy: i === 0 ? 'tego samego dnia' : i === -1 ? 'dzień wcześniej'
              : i === 1 ? 'nazajutrz'
              : Math.abs(i) + ' dni ' + (i < 0 ? 'wcześniej' : 'później') });
        }
        if (przerwa(srodek)) {
          pozycje.unshift({ data: iso(srodek), nazwa: 'Zimowa przerwa świąteczna',
            rodzaj: 'szkolne', godzina: '', odleglosc: 0, kiedy: 'tego samego dnia',
            opis: '23 grudnia ' + srodek.getFullYear() + ' r. – 31 grudnia ' +
              srodek.getFullYear() + ' r.' });
        }

        const pierwszy = new Date(srodek.getFullYear(), srodek.getMonth(), 1);
        const ostatni = new Date(srodek.getFullYear(), srodek.getMonth() + 1, 0);
        const od = przesun(pierwszy, -((pierwszy.getDay() + 6) % 7));
        const doDnia = przesun(ostatni, 6 - ((ostatni.getDay() + 6) % 7));

        const tygodnie = [];
        let tydzien = [];
        for (let d = new Date(od); d <= doDnia; d = przesun(d, 1)) {
          const swieto = SWIETA[md(d)] || '';
          tydzien.push({
            dzien: d.getDate(), data: iso(d),
            poza: d.getMonth() !== srodek.getMonth(),
            wybrany: iso(d) === iso(srodek),
            wolne: Boolean(swieto) || d.getDay() === 0,
            swieto: swieto,
            szkolne: !swieto && przerwa(d),
            mostek: false,
            wydarzen: iso(d) === iso(przesun(srodek, 5)) ? 1 : 0,
            opis: DNI[d.getDay()] + ', ' + dat(d) + (swieto ? '. ' + swieto : ''),
          });
          if (tydzien.length === 7) { tygodnie.push(tydzien); tydzien = []; }
        }

        return {
          promien: 10,
          siatka: {
            naglowek: MIESM[srodek.getMonth()] + ' ' + srodek.getFullYear(),
            dni: ['pon', 'wt', 'śr', 'czw', 'pt', 'sob', 'nd'],
            tygodnie: tygodnie,
          },
          pozycje: pozycje,
        };
      },
      pobierzMinione: {
        ostatnie: {
          'zarzad-okregu': { godzina: '10:30', czasTrwania: 210, miejsce: 'Biuro Okręgu, Serock', data: '9 czerwca 2026 r.' },
        },
        lista: [
          { tytul: 'Posiedzenie Zarządu Okręgu', kiedy: '9 czerwca 2026 r., 10:30–14:00', miejsce: 'Biuro Okręgu, Serock', linkWydarzenia: '#' },
          { tytul: 'Posiedzenie Prezydium', kiedy: '14 kwietnia 2026 r., 16:00–18:00', miejsce: 'Warszawa', linkWydarzenia: '#' },
          { tytul: 'Posiedzenie Zarządu Okręgu', kiedy: '10 marca 2026 r., 10:00–13:00', miejsce: 'Serock', linkWydarzenia: '#' },
        ],
      },
      utworzPosiedzenie: {
        idWydarzenia: 'przyklad',
        rodzaj: 'zarzad-okregu',
        tytul: 'Posiedzenie Zarządu Okręgu Mazowieckiego PZW',
        kiedy: 'wtorek, 6 października 2026 r., 11:00–14:00',
        linkMeet: 'https://meet.google.com/abc-defg-hij',
        linkWydarzenia: '#',
        zaproszenie: 'Szanowni Koledzy,\\n\\nzwołuję posiedzenie Zarządu Okręgu Mazowieckiego PZW…',
        tematMaila: 'Zawiadomienie: Posiedzenie Zarządu Okręgu',
        ostrzezenia: ['Nie podano miejsca obrad. Uchwały i wybory wymagają listy obecności z podpisami.'],
        dodatki: DODATKI_PRZYKLAD,
      },
      utworzWersjeRoboczaMaila: { link: '#', liczbaAdresatow: 13 },
      pobierzStanCyklu: [
        { rodzaj: 'prezydium', nazwa: 'Posiedzenie Prezydium Zarządu Okręgu', cykl: 'miesiąc',
          stan: 'przekroczony', zdanie: 'Termin minął 14 maja 2026 r.',
          ostatnie: '14 kwietnia 2026 r.', termin: '14 maja 2026 r.', zaplanowane: '' },
        { rodzaj: 'zarzad-okregu', nazwa: 'Posiedzenie Zarządu Okręgu', cykl: 'kwartał',
          stan: 'blisko', zdanie: 'Termin upływa 9 września 2026 r.',
          ostatnie: '9 czerwca 2026 r.', termin: '9 września 2026 r.', zaplanowane: '' },
        { rodzaj: 'okr', nazwa: 'Posiedzenie Okręgowej Komisji Rewizyjnej', cykl: 'rok',
          stan: 'brak', zdanie: 'Brak posiedzenia w historii.',
          ostatnie: '', termin: '', zaplanowane: '' },
      ],
      stanPrzypomnien: { dostepne: true, zainstalowany: false, godzina: 7 },
      pobierzDoZmiany: [],
      zlozPodglad: {
        tytul: 'Posiedzenie Zarządu Okręgu Mazowieckiego PZW',
        kiedy: 'wtorek, 6 października 2026 r., 11:00–14:00',
        zaproszenie: 'Szanowni Koledzy,\\n\\nzwołuję posiedzenie Zarządu Okręgu Mazowieckiego PZW…',
        tematMaila: 'Zawiadomienie: Posiedzenie Zarządu Okręgu, 6 października 2026 r.',
        ostrzezenia: ['Nie podano miejsca obrad. Uchwały i wybory wymagają listy obecności z podpisami.'],
        dodatki: DODATKI_PRZYKLAD,
      },
      pobierzStanDodatkow: {
        id: 'przyklad',
        tytul: 'Posiedzenie Zarządu Okręgu Mazowieckiego PZW',
        dodatki: DODATKI_PRZYKLAD,
      },
      dopnijDodatek: { id: 'obecnosc', nazwa: 'Lista obecności', stan: 'gotowe',
                       komunikat: 'Rubryk na podpisy: 13', link: '#' },
      sprawdzLinkMeet: { linkMeet: 'https://meet.google.com/abc-defg-hij' },
      pobierzPorzadekObrad: { porzadek: [] },
      zaproponujPlan: {
        rodzaj: 'zarzad-okregu', nazwa: 'Posiedzenie Zarządu Okręgu',
        cykl: 'kwartał', rok: 2027,
        terminy: [
          { data: '2027-01-14', opis: 'czwartek, 14 stycznia 2027 r.', uwaga: '', zajety: false, wybrany: true },
          { data: '2027-04-08', opis: 'czwartek, 8 kwietnia 2027 r.', uwaga: '', zajety: false, wybrany: true },
          { data: '2027-07-08', opis: 'czwartek, 8 lipca 2027 r.', uwaga: '', zajety: false, wybrany: true },
          { data: '2027-10-14', opis: 'czwartek, 14 października 2027 r.', uwaga: '', zajety: false, wybrany: true },
        ],
      },
      utworzPlan: { zalozonych: 4, komunikat: 'Wpisano 4 terminy do kalendarza.' },
      pobierzRejestr: {
        link: '#', doPrzedlozenia: 2,
        pozycje: [
          { numer: 'Uchwała nr 12/2026 Prezydium ZO', organ: 'Prezydium ZO',
            data: '2026-08-13', przedmiot: 'Zatwierdzenie zarybienia jesiennego', czeka: true },
          { numer: 'Uchwała nr 11/2026 Prezydium ZO', organ: 'Prezydium ZO',
            data: '2026-08-13', przedmiot: 'Składki na ochronę i zagospodarowanie wód', czeka: true },
        ],
      },
      zaproponujKalendarzRoku: {
        rok: 2027,
        grupy: [
          { id: 'swieta', nazwa: 'Dni ustawowo wolne od pracy', opis: 'Święta stałe i ruchome',
            wpisy: [
              { grupa: 'swieta', nazwa: 'Boże Ciało', od: '2027-05-27', doDnia: '2027-05-27',
                opis: 'czwartek, 27 maja 2027 r.', uwaga: 'Dzień ustawowo wolny od pracy.', wybrany: true },
              { grupa: 'swieta', nazwa: 'Wszystkich Świętych', od: '2027-11-01', doDnia: '2027-11-01',
                opis: 'poniedziałek, 1 listopada 2027 r.', uwaga: 'Dzień ustawowo wolny od pracy.', wybrany: true },
            ] },
          { id: 'szkolne', nazwa: 'Kalendarz szkolny', opis: 'Przerwy świąteczne i wakacje',
            wpisy: [
              { grupa: 'szkolne', nazwa: 'Wakacje letnie', od: '2027-06-26', doDnia: '2027-08-31',
                opis: '26 czerwca 2027 r. – 31 sierpnia 2027 r.', uwaga: '', wybrany: true },
            ] },
        ],
      },
      utworzKalendarzRoku: { zalozonych: 18, komunikat: 'Wpisano 18 pozycji do kalendarza.' },
      usunKalendarzRoku: { usunietych: 18, komunikat: 'Usunięto 18 pozycji.' },
      zarejestrujUchwale: { numer: 'Uchwała nr 13/2026 Prezydium ZO', link: '#' },
      pobierzFrekwencje: {
        tytul: 'Posiedzenie Zarządu Okręgu Mazowieckiego PZW',
        zaproszonych: 13,
        pozycje: [
          { nazwa: 'potwierdzili', ile: 8 }, { nazwa: 'odmówili', ile: 2 },
          { nazwa: 'być może', ile: 1 }, { nazwa: 'bez odpowiedzi', ile: 2 },
        ],
        werdykt: 'Potwierdziło 8 osób na 13 członków organu. Zwykła większość składu to 7.',
        pilne: false,
      },
    };

    let sukces = null;
    const uchwyt = {
      withSuccessHandler(f) { sukces = f; return uchwyt; },
      withFailureHandler() { return uchwyt; },
    };

    Object.keys(DANE).forEach(function (nazwa) {
      uchwyt[nazwa] = function () {
        const f = sukces;
        // Argumenty muszą dojść do atrapy, inaczej podgląd pokazuje te same
        // dane niezależnie od wybranej daty i kłamie o działaniu narzędzia.
        const argumenty = Array.prototype.slice.call(arguments);
        setTimeout(function () {
          const dane = DANE[nazwa];
          f(typeof dane === 'function' ? dane.apply(null, argumenty) : dane);
        }, 120);
        return uchwyt;
      };
    });

    return uchwyt;
  })() } };

  // #wynik w adresie wypełnia formularz i go wysyła – żeby dało się zrobić
  // zrzut drugiego widoku bez klikania.
  // Przepływ jest dwuetapowy: formularz składa podgląd, dopiero podgląd
  // tworzy wydarzenie. #podglad zatrzymuje się na pierwszym kroku,
  // #wynik przeklikuje do drugiego.
  if (location.hash === '#wynik' || location.hash === '#podglad') {
    window.addEventListener('load', function () {
      setTimeout(function () {
        document.getElementById('data').value = '2026-10-06';
        document.getElementById('formularz')
          .dispatchEvent(new Event('submit', { cancelable: true }));

        if (location.hash === '#wynik') {
          setTimeout(function () {
            document.getElementById('przycisk-zaloz').click();
          }, 400);
        }
      }, 400);
    });
  }
</script>
"""


def zloz() -> Path:
    html = ZRODLO.read_text(encoding='utf-8')
    strona = (
        '<!doctype html><html lang="pl"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width, initial-scale=1">'
        '<title>Podgląd – generator posiedzeń</title></head><body>'
        + ATRAPA + html + '</body></html>'
    )
    PODGLAD.write_text(strona, encoding='utf-8')
    return PODGLAD


def wersja_ciemna(plik: Path) -> Path:
    """Wymusza motyw ciemny, zamieniając zapytanie medialne na bezwarunkowe.

    Headless Chrome nie ma flagi przełączającej prefers-color-scheme, a bez
    podglądu ciemna paleta bywa sprawdzana tylko na papierze.
    """
    cel = Path('/tmp/pzw-podglad-ciemny.html')
    cel.write_text(
        plik.read_text(encoding='utf-8')
            .replace('@media (prefers-color-scheme: dark) {', '@media all {'),
        encoding='utf-8',
    )
    return cel


def wersja_duzy_tekst(plik: Path) -> Path:
    """Podnosi bazowy stopień pisma do 125%, jak przy powiększeniu w systemie.

    Apple nazywa to Dynamic Type i wymaga, żeby układ to zniósł. Tutaj sprawdza
    to samo: czy odstępy i cele dotykowe rosną razem z tekstem, czy zostają
    w miejscu i rozjeżdżają układ.
    """
    cel = Path('/tmp/pzw-podglad-duzy.html')
    cel.write_text(
        plik.read_text(encoding='utf-8').replace(
            '<style>', '<style>\n  html { font-size: 125%; }\n', 1),
        encoding='utf-8',
    )
    return cel


def w_ramce(plik: Path, szerokosc: int, wysokosc: int) -> Path:
    """Opakowuje podgląd w <iframe> zadanej szerokości.

    Headless Chrome nie schodzi z oknem poniżej 500 px. Przy mniejszej
    wartości i tak rozkłada stronę na 500 px i przycina zrzut, przez co
    wąski układ wygląda na zepsuty, choć jest poprawny. Ramka ma własny
    viewport, więc pokazuje prawdziwy układ mobilny.
    """
    cel = Path(f'/tmp/pzw-ramka-{szerokosc}.html')
    cel.write_text(
        '<!doctype html><meta charset="utf-8">'
        '<body style="margin:0;background:#8a938d">'
        f'<iframe src="file://{plik}" style="width:{szerokosc}px;'
        f'height:{wysokosc}px;border:0;display:block"></iframe>',
        encoding='utf-8',
    )
    return cel


def zrzut(zrodlo: Path, nazwa: str, szerokosc: int, wysokosc: int) -> None:
    cel = ZRZUTY / f'{nazwa}.png'
    subprocess.run([
        CHROME, '--headless', '--disable-gpu', '--hide-scrollbars',
        f'--screenshot={cel}',
        f'--window-size={szerokosc},{wysokosc}',
        '--virtual-time-budget=2500',
        f'file://{zrodlo}',
    ], check=False, capture_output=True)
    print(f'  {nazwa:10s} {szerokosc}×{wysokosc}  →  {cel}')


def zrzuty(plik: Path) -> None:
    if not Path(CHROME).exists():
        print('  Chrome nie znaleziony – pomijam zrzuty.')
        return

    if ZRZUTY.exists():
        shutil.rmtree(ZRZUTY)
    ZRZUTY.mkdir(parents=True)

    # Biurko i tablet mieszczą się w oknie; telefon idzie przez ramkę.
    zrzut(plik, 'biurko', 1200, 1000)
    zrzut(plik, 'caly', 1200, 2300)
    zrzut(plik, 'tablet', 820, 1100)
    zrzut(w_ramce(plik, 390, 1400), 'telefon', 520, 1400)

    zrzut(Path(str(plik) + '#podglad'), 'podglad', 1200, 1100)
    zrzut(Path(str(plik) + '#wynik'), 'wynik', 1200, 1100)
    zrzut(wersja_ciemna(plik), 'ciemny', 1200, 1000)
    zrzut(wersja_duzy_tekst(plik), 'duzy-tekst', 1200, 1300)


def main() -> int:
    plik = zloz()
    print(f'Podgląd: file://{plik}')
    zrzuty(plik)

    if '--otworz' in sys.argv:
        subprocess.run(['open', str(plik)], check=False)

    return 0


if __name__ == '__main__':
    sys.exit(main())
