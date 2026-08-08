/**
 * Generator zebrań Koła PZW.
 *
 * Tworzy wydarzenie w Kalendarzu Google razem z linkiem Google Meet
 * i składa gotowy tekst zaproszenia do wklejenia w maila.
 *
 * Ustawienia znajdziesz w pliku Konfiguracja.gs.
 */

/** Znacznik, po którym poznajemy wydarzenia utworzone tym narzędziem. */
const ZNACZNIK_NARZEDZIA = 'pzw-zebranie';

/** Mianownik — do etykiet typu „wtorek, 15 września”. */
const DNI_TYGODNIA = [
  'niedziela', 'poniedziałek', 'wtorek', 'środa',
  'czwartek', 'piątek', 'sobota',
];

/**
 * Formy z przyimkiem — do zdania „odbędzie się we wtorek”.
 * Osobna tablica, bo polszczyzna zmienia i przyimek („w” / „we”),
 * i przypadek („środa” → „środę”).
 */
const DNI_W_ZDANIU = [
  'w niedzielę', 'w poniedziałek', 'we wtorek', 'w środę',
  'w czwartek', 'w piątek', 'w sobotę',
];

const MIESIACE_DOPELNIACZ = [
  'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
  'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia',
];


// ─────────────────────────────────────────────────────────────────────────────
// Punkt wejścia aplikacji internetowej
// ─────────────────────────────────────────────────────────────────────────────

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Formularz')
    .setTitle('Zebrania Koła PZW')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}


/**
 * Wartości, którymi formularz wypełnia się po otwarciu.
 * Wywoływane z przeglądarki przez google.script.run.
 */
function pobierzDomyslne() {
  return {
    tytul: KONFIG.domyslnyTytul,
    godzina: KONFIG.domyslnaGodzina,
    czasTrwania: KONFIG.domyslnyCzasTrwaniaMinut,
    nazwaKola: KONFIG.nazwaKola,
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// Główna operacja
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tworzy wydarzenie z linkiem Meet i zwraca dane do wyświetlenia.
 *
 * @param {{data: string, godzina: string, czasTrwania: number,
 *          tytul: string, miejsce: string}} dane z formularza
 * @return {{tytul: string, kiedy: string, linkMeet: string,
 *           linkWydarzenia: string, zaproszenie: string}}
 */
function utworzZebranie(dane) {
  const start = zbudujDate_(dane.data, dane.godzina);
  const minuty = Number(dane.czasTrwania) || KONFIG.domyslnyCzasTrwaniaMinut;
  const koniec = new Date(start.getTime() + minuty * 60 * 1000);

  const tytul = (dane.tytul || KONFIG.domyslnyTytul).trim();
  const miejsce = (dane.miejsce || '').trim();

  const wydarzenie = wstawWydarzenie_(tytul, start, koniec, miejsce);
  const linkMeet = pobierzLinkMeet_(wydarzenie);

  if (!linkMeet) {
    throw new Error(
      'Wydarzenie powstało w kalendarzu, ale Google nie zdążyło wygenerować ' +
      'linku Meet. Otwórz wydarzenie w Kalendarzu Google — link powinien już tam być.'
    );
  }

  const zaproszenie = zlozZaproszenie_(start, linkMeet, miejsce);

  if (KONFIG.opisWydarzeniaZZaproszenia) {
    wydarzenie.description = zaproszenie;
    Calendar.Events.patch(
      { description: zaproszenie },
      KONFIG.idKalendarza,
      wydarzenie.id
    );
  }

  return {
    tytul: tytul,
    kiedy: opiszTermin_(start, koniec),
    linkMeet: linkMeet,
    linkWydarzenia: wydarzenie.htmlLink,
    zaproszenie: zaproszenie,
  };
}


/**
 * Nadchodzące zebrania utworzone tym narzędziem — żeby widzieć całą serię,
 * mimo że każde spotkanie zakładasz osobno.
 */
function pobierzNadchodzace() {
  const teraz = new Date();
  const odpowiedz = Calendar.Events.list(KONFIG.idKalendarza, {
    timeMin: teraz.toISOString(),
    privateExtendedProperty: 'zrodlo=' + ZNACZNIK_NARZEDZIA,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 10,
  });

  return (odpowiedz.items || []).map(function (wydarzenie) {
    const start = new Date(wydarzenie.start.dateTime || wydarzenie.start.date);
    return {
      tytul: wydarzenie.summary,
      kiedy: sformatujDate_(start) + ', godz. ' + sformatujGodzine_(start),
      linkWydarzenia: wydarzenie.htmlLink,
    };
  });
}


// ─────────────────────────────────────────────────────────────────────────────
// Kalendarz
// ─────────────────────────────────────────────────────────────────────────────

function wstawWydarzenie_(tytul, start, koniec, miejsce) {
  const zasob = {
    summary: tytul,
    start: {
      dateTime: naFormatLokalny_(start),
      timeZone: KONFIG.strefaCzasowa,
    },
    end: {
      dateTime: naFormatLokalny_(koniec),
      timeZone: KONFIG.strefaCzasowa,
    },
    conferenceData: {
      createRequest: {
        requestId: Utilities.getUuid(),
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
    extendedProperties: {
      private: { zrodlo: ZNACZNIK_NARZEDZIA },
    },
  };

  if (miejsce) {
    zasob.location = miejsce;
  }

  try {
    return Calendar.Events.insert(zasob, KONFIG.idKalendarza, {
      conferenceDataVersion: 1,
    });
  } catch (blad) {
    if (String(blad).indexOf('Calendar is not defined') !== -1) {
      throw new Error(
        'Nie włączono usługi Calendar API. W edytorze Apps Script kliknij ' +
        '„Usługi” (ikona +) i dodaj „Google Calendar API”.'
      );
    }
    throw blad;
  }
}


/**
 * Link Meet bywa dopisywany chwilę po utworzeniu wydarzenia,
 * więc jeśli go jeszcze nie ma — dopytujemy kilka razy.
 */
function pobierzLinkMeet_(wydarzenie) {
  let link = wyciagnijLink_(wydarzenie);

  for (let proba = 0; !link && proba < 5; proba++) {
    Utilities.sleep(1500);
    const swieze = Calendar.Events.get(KONFIG.idKalendarza, wydarzenie.id);
    link = wyciagnijLink_(swieze);
  }

  return link;
}


function wyciagnijLink_(wydarzenie) {
  if (wydarzenie.hangoutLink) {
    return wydarzenie.hangoutLink;
  }

  const punkty = (wydarzenie.conferenceData || {}).entryPoints || [];
  for (let i = 0; i < punkty.length; i++) {
    if (punkty[i].entryPointType === 'video' && punkty[i].uri) {
      return punkty[i].uri;
    }
  }

  return '';
}


// ─────────────────────────────────────────────────────────────────────────────
// Tekst zaproszenia
// ─────────────────────────────────────────────────────────────────────────────

function zlozZaproszenie_(start, linkMeet, miejsce) {
  const wiersze = [];

  wiersze.push(KONFIG.zwrotPowitalny);
  wiersze.push('');
  wiersze.push(
    'uprzejmie zapraszam na zebranie ' + KONFIG.nazwaKola + ', które odbędzie się ' +
    DNI_W_ZDANIU[start.getDay()] + ', ' + sformatujDate_(start) +
    ', o godzinie ' + sformatujGodzine_(start) + '.'
  );

  wiersze.push('');

  if (miejsce) {
    wiersze.push('Zebranie ma formułę hybrydową.');
    wiersze.push('Na miejscu: ' + miejsce);
    wiersze.push('Zdalnie, przez Google Meet:');
  } else {
    wiersze.push('Zebranie poprowadzimy online w Google Meet:');
  }

  wiersze.push(linkMeet);

  if (KONFIG.dopiskiPodLinkiem) {
    wiersze.push(KONFIG.dopiskiPodLinkiem);
  }

  if (KONFIG.szkicPorzadku && KONFIG.szkicPorzadku.length) {
    wiersze.push('');
    wiersze.push(KONFIG.naglowekPorzadku);
    KONFIG.szkicPorzadku.forEach(function (punkt) {
      wiersze.push(punkt);
    });
  }

  if (KONFIG.instrukcjaWejscia && KONFIG.instrukcjaWejscia.length) {
    wiersze.push('');
    wiersze.push(KONFIG.naglowekInstrukcji + ':');
    KONFIG.instrukcjaWejscia.forEach(function (punkt) {
      wiersze.push('— ' + punkt);
    });
  }

  wiersze.push('');
  KONFIG.podpis.forEach(function (linia) {
    wiersze.push(linia);
  });

  return wiersze.join('\n');
}


// ─────────────────────────────────────────────────────────────────────────────
// Daty
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Składa datę z pól formularza ('2026-09-15' + '18:00').
 * Budujemy z części, żeby czas był traktowany jako lokalny,
 * a nie jako UTC — inaczej wrzesień i styczeń rozjechałyby się o godzinę.
 */
function zbudujDate_(data, godzina) {
  if (!data) {
    throw new Error('Podaj datę zebrania.');
  }

  const d = String(data).split('-').map(Number);
  const g = String(godzina || KONFIG.domyslnaGodzina).split(':').map(Number);

  return new Date(d[0], d[1] - 1, d[2], g[0] || 0, g[1] || 0, 0);
}


/** '2026-09-15T18:00:00' — bez przesunięcia, strefę podajemy osobno. */
function naFormatLokalny_(data) {
  return Utilities.formatDate(
    data, KONFIG.strefaCzasowa, "yyyy-MM-dd'T'HH:mm:ss"
  );
}


/** '15 września 2026' */
function sformatujDate_(data) {
  return data.getDate() + ' ' +
    MIESIACE_DOPELNIACZ[data.getMonth()] + ' ' +
    data.getFullYear() + ' r.';
}


/** '18:00' */
function sformatujGodzine_(data) {
  return Utilities.formatDate(data, KONFIG.strefaCzasowa, 'HH:mm');
}


/** 'wtorek, 15 września 2026 r., 18:00–20:00' */
function opiszTermin_(start, koniec) {
  return DNI_TYGODNIA[start.getDay()] + ', ' +
    sformatujDate_(start) + ', ' +
    sformatujGodzine_(start) + '–' + sformatujGodzine_(koniec);
}
