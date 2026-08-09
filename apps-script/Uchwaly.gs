/**
 * Rejestr uchwał i tryb § 48 ust. 2.
 *
 * Uchwały Prezydium podjęte w sprawach z § 47 pkt 3–14, 23–25 i 27 podlegają
 * przedłożeniu na najbliższym posiedzeniu Zarządu Okręgu, który może je uchylić
 * bądź zmienić. Dziś odpowiada za to jeden statyczny punkt w porządku obrad –
 * tutaj zamyka się pętla: uchwała trafia do rejestru, a przy składaniu
 * porządku obrad Zarządu sama się pod ten punkt podwiesza.
 *
 * Rejestr to arkusz Google zakładany przy pierwszej uchwale. Numeracja jest
 * narastająca w obrębie organu i roku, więc zapis idzie pod blokadą –
 * dwa równoległe zapisy potrafiłyby nadać ten sam numer.
 */

/** Klucz, pod którym pamiętamy założony arkusz. */
const KLUCZ_REJESTRU = 'idArkuszaRejestru';

const NAZWA_ARKUSZA = 'Uchwały';

const NAGLOWKI_REJESTRU = [
  'Numer',
  'Organ',
  'Data posiedzenia',
  'Przedmiot uchwały',
  'Podlega przedłożeniu ZO',
  'Przedłożona na posiedzeniu',
  'Uwagi',
];

/** Numery kolumn, liczone od 1 – żeby nie zgadywać ich w kodzie. */
const KOL = {
  numer: 1,
  organ: 2,
  data: 3,
  przedmiot: 4,
  podlega: 5,
  przedlozona: 6,
  uwagi: 7,
};


// ─────────────────────────────────────────────────────────────────────────────
// Wywołania z przeglądarki
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dopisuje uchwałę i nadaje jej kolejny numer w obrębie organu i roku.
 *
 * @param {{rodzaj: string, data: string, przedmiot: string,
 *          podlega: boolean, uwagi: string}} dane
 * @return {{numer: string, link: string}}
 */
function zarejestrujUchwale(dane) {
  const rodzaj = znajdzRodzaj_(dane.rodzaj);
  const przedmiot = String(dane.przedmiot || '').trim();

  if (!przedmiot) {
    throw new Error('Podaj przedmiot uchwały.');
  }

  if (!dane.data) {
    throw new Error('Podaj datę posiedzenia, na którym uchwałę podjęto.');
  }

  const blokada = LockService.getUserLock();
  blokada.waitLock(20000);

  try {
    const arkusz = otworzRejestr_();
    const data = zbudujDate_(dane.data, '00:00');
    const numer = kolejnyNumer_(arkusz, rodzaj, data.getFullYear());

    arkusz.appendRow([
      numer,
      rodzaj.nazwaOrganu || rodzaj.nazwa,
      naFormatDaty_(data),
      przedmiot,
      dane.podlega ? 'tak' : 'nie',
      '',
      String(dane.uwagi || '').trim(),
    ]);

    return {
      numer: numer,
      link: arkusz.getParent().getUrl(),
    };
  } finally {
    blokada.releaseLock();
  }
}


/** Zawartość rejestru do podglądu w interfejsie. */
function pobierzRejestr() {
  const arkusz = otworzRejestrLubNic_();

  if (!arkusz) {
    return { link: '', pozycje: [], doPrzedlozenia: 0 };
  }

  const wiersze = wczytajWiersze_(arkusz);

  return {
    link: arkusz.getParent().getUrl(),
    doPrzedlozenia: wiersze.filter(czekaNaPrzedlozenie_).length,
    pozycje: wiersze.slice(-KONFIG.liczbaHistorii).reverse().map(function (w) {
      return {
        numer: w.numer,
        organ: w.organ,
        data: w.data,
        przedmiot: w.przedmiot,
        czeka: czekaNaPrzedlozenie_(w),
      };
    }),
  };
}


/**
 * Oznacza uchwały jako skierowane na posiedzenie Zarządu Okręgu.
 * Wołane po utworzeniu posiedzenia, które je przejmuje.
 */
function oznaczPrzedlozone_(numery, data) {
  if (!numery.length) {
    return 0;
  }

  const arkusz = otworzRejestrLubNic_();

  if (!arkusz) {
    return 0;
  }

  const blokada = LockService.getUserLock();
  blokada.waitLock(20000);

  try {
    const szukane = {};
    numery.forEach(function (numer) { szukane[numer] = true; });

    let oznaczonych = 0;

    wczytajWiersze_(arkusz).forEach(function (wiersz) {
      if (szukane[wiersz.numer] && !wiersz.przedlozona) {
        arkusz.getRange(wiersz.wiersz, KOL.przedlozona).setValue(naFormatDaty_(data));
        oznaczonych++;
      }
    });

    return oznaczonych;
  } finally {
    blokada.releaseLock();
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// Porządek obrad w trybie § 48 ust. 2
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Porządek obrad z podwieszonymi uchwałami czekającymi na przedłożenie.
 * Gdy rejestru nie ma albo arkusz jest niedostępny, wraca sam szkic –
 * brak rejestru nie może zepsuć składania zawiadomienia.
 */
function zlozPorzadekZUchwalami_(rodzaj) {
  const szkic = rodzaj.porzadek || [];

  if (!KONFIG.rejestrUchwal || !rodzaj.wstawUchwalyPoPunkcie) {
    return szkic;
  }

  let czekajace = [];

  try {
    czekajace = uchwalyDoPrzedlozenia_();
  } catch (blad) {
    return szkic;
  }

  if (!czekajace.length) {
    return szkic;
  }

  const przedrostek = String(rodzaj.wstawUchwalyPoPunkcie) + '.';
  const wynik = [];

  szkic.forEach(function (punkt) {
    wynik.push(punkt);

    if (punkt.indexOf(przedrostek) === 0) {
      czekajace.forEach(function (uchwala) {
        wynik.push('   – ' + uchwala.numer + ' z ' + uchwala.data + ' – ' +
          uchwala.przedmiot);
      });
    }
  });

  return wynik;
}


/** Numery uchwał czekających na przedłożenie – do oznaczenia po utworzeniu. */
function numeryDoPrzedlozenia_() {
  try {
    return uchwalyDoPrzedlozenia_().map(function (uchwala) {
      return uchwala.numer;
    });
  } catch (blad) {
    return [];
  }
}


function uchwalyDoPrzedlozenia_() {
  const arkusz = otworzRejestrLubNic_();

  return arkusz ? wczytajWiersze_(arkusz).filter(czekaNaPrzedlozenie_) : [];
}


function czekaNaPrzedlozenie_(wiersz) {
  return wiersz.podlega && !wiersz.przedlozona;
}


// ─────────────────────────────────────────────────────────────────────────────
// Arkusz
// ─────────────────────────────────────────────────────────────────────────────

/** Rejestr, zakładany przy pierwszym użyciu. */
function otworzRejestr_() {
  const istniejacy = otworzRejestrLubNic_();

  if (istniejacy) {
    return istniejacy;
  }

  const skoroszyt = SpreadsheetApp.create(
    'Rejestr uchwał – ' + KONFIG.okreg.skrot + ' – kadencja ' + KONFIG.kadencja
  );

  const arkusz = skoroszyt.getActiveSheet();
  arkusz.setName(NAZWA_ARKUSZA);
  arkusz.appendRow(NAGLOWKI_REJESTRU);
  arkusz.getRange(1, 1, 1, NAGLOWKI_REJESTRU.length).setFontWeight('bold');
  arkusz.setFrozenRows(1);

  PropertiesService.getUserProperties()
    .setProperty(KLUCZ_REJESTRU, skoroszyt.getId());

  return arkusz;
}


/**
 * Rejestr, jeśli już istnieje. Identyfikator bierzemy z konfiguracji albo
 * z tego, co narzędzie samo zapamiętało przy zakładaniu.
 */
function otworzRejestrLubNic_() {
  const id = KONFIG.idArkuszaRejestru ||
    PropertiesService.getUserProperties().getProperty(KLUCZ_REJESTRU);

  if (!id) {
    return null;
  }

  try {
    const skoroszyt = SpreadsheetApp.openById(id);
    return skoroszyt.getSheetByName(NAZWA_ARKUSZA) || skoroszyt.getActiveSheet();
  } catch (blad) {
    // Arkusz mógł zostać skasowany albo identyfikator w konfiguracji jest zły.
    return null;
  }
}


/** Wiersze rejestru jako obiekty, z numerem wiersza do późniejszego zapisu. */
function wczytajWiersze_(arkusz) {
  const ostatni = arkusz.getLastRow();

  if (ostatni < 2) {
    return [];
  }

  const dane = arkusz
    .getRange(2, 1, ostatni - 1, NAGLOWKI_REJESTRU.length)
    .getDisplayValues();

  return dane.map(function (wiersz, numer) {
    return {
      wiersz: numer + 2,
      numer: wiersz[KOL.numer - 1],
      organ: wiersz[KOL.organ - 1],
      data: wiersz[KOL.data - 1],
      przedmiot: wiersz[KOL.przedmiot - 1],
      podlega: String(wiersz[KOL.podlega - 1]).toLowerCase() === 'tak',
      przedlozona: wiersz[KOL.przedlozona - 1],
    };
  });
}


/**
 * „Uchwała nr 12/2026 Prezydium Zarządu Okręgu Mazowieckiego PZW” –
 * numeracja narastająca osobno dla każdego organu i każdego roku.
 */
function kolejnyNumer_(arkusz, rodzaj, rok) {
  const organ = rodzaj.nazwaOrganu || rodzaj.nazwa;
  const koncowka = '/' + rok;

  const uzyte = wczytajWiersze_(arkusz)
    .filter(function (wiersz) {
      return wiersz.organ === organ && String(wiersz.numer).indexOf(koncowka) !== -1;
    })
    .map(function (wiersz) {
      const liczba = /nr\s+(\d+)\//.exec(String(wiersz.numer));
      return liczba ? Number(liczba[1]) : 0;
    });

  const kolejny = uzyte.length ? Math.max.apply(null, uzyte) + 1 : 1;

  return 'Uchwała nr ' + kolejny + koncowka + ' ' + organ;
}
