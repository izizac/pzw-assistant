/**
 * Terminarz — pilnowanie cyklu statutowego i przypomnienia dzień wcześniej.
 *
 * Kod.gs zakłada przypomnienie o kolejnym posiedzeniu w chwili tworzenia
 * bieżącego. To za mało: nikt nie mówi, że termin już minął. Tutaj liczymy
 * stan cyklu z historii — Zarząd Okręgu nie rzadziej niż raz na kwartał
 * (§ 46 ust. 1), Prezydium nie rzadziej niż raz w miesiącu (§ 48 ust. 1),
 * kontrola Zarządu przez OKR nie rzadziej niż raz w roku (§ 50 ust. 2 pkt 3).
 */

/** Na ile dni przed upływem terminu zaczynamy ostrzegać. */
const PROG_OSTRZEZENIA_DNI = 21;

/** Nazwa funkcji, którą wywołuje wyzwalacz czasowy. */
const FUNKCJA_PRZYPOMNIENIA = 'przypomnijOJutrzejszychPosiedzeniach';


// ─────────────────────────────────────────────────────────────────────────────
// Stan cyklu statutowego
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dla każdego organu, który Statut każe zwoływać cyklicznie: kiedy było
 * ostatnio, do kiedy musi się zebrać i czy termin już minął.
 *
 * @return {{rodzaj: string, nazwa: string, cykl: string, stan: string,
 *           zdanie: string, ostatnie: string, termin: string,
 *           zaplanowane: string}[]} od najpilniejszych
 */
function pobierzStanCyklu() {
  const teraz = new Date();
  const wydarzenia = wypiszPosiedzeniaZKalendarza_(
    dodajMiesiace_(teraz, -KONFIG.historiaMiesiecy),
    dodajMiesiace_(teraz, 12)
  );

  const stany = [];

  RODZAJE_POSIEDZEN.forEach(function (rodzaj) {
    if (!rodzaj.cyklMiesiecy) {
      return;
    }

    stany.push(zbadajCyklRodzaju_(rodzaj, wydarzenia, teraz));
  });

  // Najpierw to, co przeterminowane, potem to, co blisko terminu.
  return stany.sort(function (a, b) {
    return WAGA_STANU_[a.stan] - WAGA_STANU_[b.stan] || a.dni - b.dni;
  });
}


/** Kolejność pilności na liście — mniejsza waga trafia wyżej. */
const WAGA_STANU_ = {
  przekroczony: 0,
  brak: 1,
  blisko: 2,
  ok: 3,
};


function zbadajCyklRodzaju_(rodzaj, wydarzenia, teraz) {
  const swoje = wydarzenia.filter(function (wpis) {
    return wpis.rodzaj === rodzaj.id;
  });

  let ostatnie = null;
  let najblizsze = null;

  swoje.forEach(function (wpis) {
    if (wpis.start <= teraz) {
      // Lista jest posortowana rosnąco, więc ostatni pasujący jest najświeższy.
      ostatnie = wpis.start;
    } else if (!najblizsze) {
      najblizsze = wpis.start;
    }
  });

  const stan = {
    rodzaj: rodzaj.id,
    nazwa: rodzaj.nazwa,
    cykl: opiszCykl_(rodzaj.cyklMiesiecy),
    podstawa: rodzaj.podstawa,
    ostatnie: ostatnie ? sformatujDate_(ostatnie) : '',
    zaplanowane: najblizsze ? sformatujDate_(najblizsze) : '',
    termin: '',
    dni: 0,
    stan: 'brak',
    zdanie: '',
  };

  // sformatujDate_ kończy się na „r.”, więc po dacie nigdy nie dokładamy
  // kropki — inaczej wychodzi „9 maja 2026 r..”. Data sama zamyka zdanie.

  if (!ostatnie) {
    stan.zdanie = najblizsze
      ? 'Brak posiedzenia w historii; najbliższe zwołane na ' + stan.zaplanowane
      : 'W kalendarzu nie ma ani jednego takiego posiedzenia, więc nie ma ' +
        'od czego liczyć ' + stan.cykl + '.';
    stan.stan = najblizsze ? 'ok' : 'brak';
    return stan;
  }

  const termin = dodajMiesiace_(ostatnie, rodzaj.cyklMiesiecy);

  stan.termin = sformatujDate_(termin);
  stan.dni = dniDo_(termin);

  // Posiedzenie zwołane w terminie zamyka sprawę, choćby termin był tuż-tuż.
  if (najblizsze && najblizsze <= termin) {
    stan.stan = 'ok';
    stan.zdanie = 'Termin upływa ' + stan.termin +
      ' Kolejne posiedzenie jest już zwołane na ' + stan.zaplanowane;
    return stan;
  }

  // Posiedzenie zwołane po terminie nie ratuje sytuacji — trzeba to powiedzieć
  // wprost, bo w kalendarzu wygląda jak zwykły zaplanowany termin.
  const spoznione = najblizsze
    ? ' Najbliższe zwołane dopiero na ' + stan.zaplanowane + ' — po terminie.'
    : '';

  if (stan.dni < 0) {
    stan.stan = 'przekroczony';
    stan.zdanie = 'Termin z ' + rodzaj.podstawa + ' upłynął ' + stan.termin +
      ' — ' + odmienDni_(Math.abs(stan.dni)) + ' temu. Ostatnie posiedzenie: ' +
      stan.ostatnie + spoznione;
    return stan;
  }

  stan.stan = stan.dni <= PROG_OSTRZEZENIA_DNI ? 'blisko' : 'ok';
  stan.zdanie = 'Ostatnie posiedzenie: ' + stan.ostatnie +
    ' Kolejne musi się odbyć do ' + stan.termin + ' — zostało ' +
    odmienDni_(stan.dni) + '.' + spoznione;

  return stan;
}


function opiszCykl_(miesiace) {
  if (miesiace === 1) { return 'miesiąc'; }
  if (miesiace === 3) { return 'kwartał'; }
  if (miesiace === 12) { return 'rok'; }
  return miesiace + ' mies.';
}


// ─────────────────────────────────────────────────────────────────────────────
// Dni ustawowo wolne
// ─────────────────────────────────────────────────────────────────────────────

/** Święta stałe: 'MM-DD' → nazwa. */
const SWIETA_STALE = {
  '01-01': 'Nowy Rok',
  '01-06': 'Święto Trzech Króli',
  '05-01': 'Święto Państwowe',
  '05-03': 'Święto Narodowe Trzeciego Maja',
  '08-15': 'Wniebowzięcie Najświętszej Maryi Panny',
  '11-01': 'Wszystkich Świętych',
  '11-11': 'Narodowe Święto Niepodległości',
  /**
   * Wigilia jest dniem ustawowo wolnym od pracy od 2025 r., na mocy ustawy
   * z 6 grudnia 2024 r. o zmianie ustawy o dniach wolnych od pracy.
   * Wcześniej była zwykłym dniem roboczym, więc starsze kalendarze jej tu
   * nie mają.
   */
  '12-24': 'Wigilia Bożego Narodzenia',
  '12-25': 'Boże Narodzenie',
  '12-26': 'Boże Narodzenie, drugi dzień',
};

/** Policzone kalendarze świąt, rocznik po roczniku. */
const SWIETA_ROKU_ = {};


/**
 * Zdanie o tym, że termin wypada źle, albo pusty ciąg.
 * Sprawdzamy dzień ustawowo wolny, niedzielę i dzień mostkowy między świętem
 * a weekendem. Nic nie blokuje, tylko ostrzega.
 */
function opiszDzienWolny_(data) {
  if (!KONFIG.ostrzegajOSwietach) {
    return '';
  }

  const swieta = swietaRoku_(data.getFullYear());
  const swieto = swieta[kluczDnia_(data)];

  if (swieto) {
    return sformatujDate_(data) + ' to dzień ustawowo wolny od pracy (' +
      swieto + '). Rozważ inny termin.';
  }

  if (data.getDay() === 0) {
    return 'Termin wypada w niedzielę.';
  }

  const mostek = opiszMostek_(data, swieta);

  if (mostek) {
    return mostek;
  }

  // Przerwy i wakacje nie są dniami wolnymi od pracy, ale wtedy wyjeżdża się
  // z rodziną i frekwencja siada. To informacja, nie zarzut.
  return opiszOkresSzkolny_(data);
}


/**
 * Dzień roboczy wciśnięty między święto a weekend. Piątek po czwartkowym
 * Bożym Ciele albo poniedziałek przed świętem we wtorek: formalnie zwykły
 * dzień pracy, w praktyce połowa osób bierze wolne.
 */
function opiszMostek_(data, swieta) {
  const dzien = data.getDay();

  if (dzien === 5 && swieta[kluczDnia_(dodajDni_(data, -1))]) {
    return 'Piątek między świętem a weekendem. Wielu członków bierze wtedy wolne.';
  }

  if (dzien === 1 && swieta[kluczDnia_(dodajDni_(data, 1))]) {
    return 'Poniedziałek między weekendem a świętem. Wielu członków bierze wtedy wolne.';
  }

  return '';
}


/** Święta stałe i ruchome danego roku: 'MM-DD' → nazwa. */
function swietaRoku_(rok) {
  if (SWIETA_ROKU_[rok]) {
    return SWIETA_ROKU_[rok];
  }

  const kalendarz = {};

  Object.keys(SWIETA_STALE).forEach(function (klucz) {
    kalendarz[klucz] = SWIETA_STALE[klucz];
  });

  const wielkanoc = wielkanoc_(rok);

  kalendarz[kluczDnia_(wielkanoc)] = 'Wielkanoc';
  kalendarz[kluczDnia_(dodajDni_(wielkanoc, 1))] = 'Poniedziałek Wielkanocny';
  kalendarz[kluczDnia_(dodajDni_(wielkanoc, 49))] = 'Zielone Świątki';
  kalendarz[kluczDnia_(dodajDni_(wielkanoc, 60))] = 'Boże Ciało';

  SWIETA_ROKU_[rok] = kalendarz;
  return kalendarz;
}


/**
 * Niedziela wielkanocna według algorytmu Meeusa dla kalendarza gregoriańskiego.
 * Od niej liczą się wszystkie polskie święta ruchome.
 */
function wielkanoc_(rok) {
  const a = rok % 19;
  const b = Math.floor(rok / 100);
  const c = rok % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const miesiac = Math.floor((h + l - 7 * m + 114) / 31);
  const dzien = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(rok, miesiac - 1, dzien);
}


function kluczDnia_(data) {
  const miesiac = String(data.getMonth() + 1);
  const dzien = String(data.getDate());

  return (miesiac.length === 1 ? '0' + miesiac : miesiac) + '-' +
    (dzien.length === 1 ? '0' + dzien : dzien);
}


// ─────────────────────────────────────────────────────────────────────────────
// Przypomnienie dzień wcześniej
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Czy wyzwalacz czasowy jest zainstalowany i o której się budzi.
 * Odczyt wyzwalaczy wymaga osobnego uprawnienia, a wołamy to przy każdym
 * otwarciu narzędzia — dlatego brak zgody ma schować przycisk, a nie
 * wywalić całą stronę.
 */
function stanPrzypomnien() {
  const stan = {
    dostepne: Boolean(KONFIG.przypomnienieDzienWczesniej),
    zainstalowany: false,
    godzina: KONFIG.godzinaPrzypomnienia,
  };

  if (!stan.dostepne) {
    return stan;
  }

  try {
    stan.zainstalowany = znajdzWyzwalacz_() !== null;
  } catch (blad) {
    stan.dostepne = false;
  }

  return stan;
}


/**
 * Zakłada wyzwalacz czasowy. Raz na dobę narzędzie sprawdza, czy jutro jest
 * posiedzenie, i przygotowuje w Gmailu wersję roboczą przypomnienia.
 * Nic nie wychodzi samo — wysyłasz ręcznie, tak jak samo zawiadomienie.
 */
function zainstalujPrzypomnienia() {
  if (znajdzWyzwalacz_()) {
    return stanPrzypomnien();
  }

  ScriptApp.newTrigger(FUNKCJA_PRZYPOMNIENIA)
    .timeBased()
    .atHour(KONFIG.godzinaPrzypomnienia)
    .everyDays(1)
    .inTimezone(KONFIG.strefaCzasowa)
    .create();

  return stanPrzypomnien();
}


function usunPrzypomnienia() {
  const wyzwalacz = znajdzWyzwalacz_();

  if (wyzwalacz) {
    ScriptApp.deleteTrigger(wyzwalacz);
  }

  return stanPrzypomnien();
}


function znajdzWyzwalacz_() {
  const wyzwalacze = ScriptApp.getProjectTriggers();

  for (let i = 0; i < wyzwalacze.length; i++) {
    if (wyzwalacze[i].getHandlerFunction() === FUNKCJA_PRZYPOMNIENIA) {
      return wyzwalacze[i];
    }
  }

  return null;
}


/**
 * Wywoływane przez wyzwalacz czasowy — nie uruchamiaj ręcznie bez potrzeby.
 * Dla każdego jutrzejszego posiedzenia zakłada wersję roboczą przypomnienia
 * i znaczy wydarzenie, żeby przy kolejnym przebiegu nie powielić maila.
 */
function przypomnijOJutrzejszychPosiedzeniach() {
  const jutro = dodajDni_(dzisiaj_(), 1);
  const pojutrze = dodajDni_(jutro, 1);

  const posiedzenia = wypiszPosiedzeniaZKalendarza_(jutro, pojutrze);
  const adresy = (KONFIG.adresyDoWysylki || []).filter(String);

  let zalozone = 0;

  posiedzenia.forEach(function (wpis) {
    const wlasciwosci = (wpis.wydarzenie.extendedProperties || {}).private || {};

    if (wlasciwosci.przypomnienie) {
      return;
    }

    const rodzaj = znajdzRodzajLubNic_(wpis.rodzaj);

    // Posiedzenie niejawne rozsyła się ręcznie do składu orzekającego —
    // globalna lista Zarządu Okręgu nie ma prawa go zobaczyć.
    if (!adresy.length || (rodzaj && rodzaj.niejawne)) {
      return;
    }

    GmailApp.createDraft(
      KONFIG.adresNadawcyWDo || Session.getActiveUser().getEmail(),
      'Przypomnienie: jutro ' + wpis.wydarzenie.summary,
      zlozPrzypomnienie_(wpis, rodzaj),
      { bcc: adresy.join(',') }
    );

    oznaczPrzypomnienie_(wpis.wydarzenie, wlasciwosci);
    zalozone++;
  });

  return zalozone;
}


function zlozPrzypomnienie_(wpis, rodzaj) {
  const start = wpis.start;
  const koniec = new Date(wpis.wydarzenie.end.dateTime || wpis.wydarzenie.end.date);
  const wiersze = [];

  wiersze.push(zwrotPowitalnyRodzaju_(rodzaj));
  wiersze.push('');
  wiersze.push(
    'przypominam, że jutro, ' + DNI_W_ZDANIU[start.getDay()] + ', ' +
    sformatujDate_(start) + ', o godzinie ' + sformatujGodzine_(start) +
    ' odbywa się ' + nazwaWZdaniu_(rodzaj, wpis.wydarzenie.summary) + '.'
  );

  wiersze.push('');
  wiersze.push('Planowane zakończenie: ' + sformatujGodzine_(koniec) + '.');

  if (wpis.wydarzenie.location) {
    wiersze.push('Miejsce obrad: ' + wpis.wydarzenie.location);
  }

  const link = wyciagnijLink_(wpis.wydarzenie);

  if (link) {
    wiersze.push('');
    wiersze.push('Link do Google Meet:');
    wiersze.push(link);
  }

  // Przypomnienie idzie z wyzwalacza, więc nie ma wyboru zwołującego —
  // podpisuje osoba domyślna z konfiguracji.
  wiersze.push('');
  zlozPodpis_('', rodzaj).forEach(function (linia) {
    wiersze.push(linia);
  });

  return wiersze.join('\n');
}


/**
 * Znak, że przypomnienie o tym posiedzeniu już powstało. Nadpisujemy cały
 * zestaw właściwości prywatnych, bo częściowa łatka potrafi wyczyścić resztę.
 */
function oznaczPrzypomnienie_(wydarzenie, wlasciwosci) {
  const nowe = {};

  Object.keys(wlasciwosci).forEach(function (klucz) {
    nowe[klucz] = wlasciwosci[klucz];
  });

  nowe.przypomnienie = naFormatDaty_(dzisiaj_());

  Calendar.Events.patch(
    { extendedProperties: { private: nowe } },
    KONFIG.idKalendarza,
    wydarzenie.id
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Wspólne
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Posiedzenia założone tym narzędziem w podanym przedziale, rosnąco.
 * Terminy i wpisy pomocnicze pomijamy — liczy się to, co faktycznie obradowało.
 *
 * @return {{wydarzenie: Object, start: Date, rodzaj: string}[]}
 */
function wypiszPosiedzeniaZKalendarza_(od, do_) {
  const odpowiedz = Calendar.Events.list(KONFIG.idKalendarza, {
    timeMin: od.toISOString(),
    timeMax: do_.toISOString(),
    privateExtendedProperty: 'zrodlo=' + ZNACZNIK_NARZEDZIA,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 250,
  });

  return (odpowiedz.items || [])
    .filter(function (wydarzenie) {
      const wlasciwosci = (wydarzenie.extendedProperties || {}).private || {};
      return wlasciwosci.typ === 'posiedzenie' && wydarzenie.start.dateTime;
    })
    .map(function (wydarzenie) {
      const wlasciwosci = (wydarzenie.extendedProperties || {}).private || {};

      return {
        wydarzenie: wydarzenie,
        start: new Date(wydarzenie.start.dateTime),
        rodzaj: wlasciwosci.rodzaj || '',
      };
    });
}


/** Rodzaj po identyfikatorze albo null — wydarzenie mogło przeżyć zmianę konfiguracji. */
function znajdzRodzajLubNic_(id) {
  for (let i = 0; i < RODZAJE_POSIEDZEN.length; i++) {
    if (RODZAJE_POSIEDZEN[i].id === id) {
      return RODZAJE_POSIEDZEN[i];
    }
  }

  return null;
}
