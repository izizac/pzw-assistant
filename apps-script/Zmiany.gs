/**
 * Odwoływanie i przenoszenie zwołanych już posiedzeń.
 *
 * Zwołanie posiedzenia było dotąd operacją jednokierunkową: jak termin się
 * przesuwał, trzeba było poprawić wydarzenie ręcznie w Kalendarzu i napisać
 * maila od zera. Tutaj wydarzenie zmienia się w miejscu — link Google Meet
 * zostaje ten sam, więc rozesłany wcześniej adres nie przestaje działać —
 * a narzędzie składa tekst zawiadomienia o zmianie.
 */

/**
 * Nadchodzące posiedzenia, które da się jeszcze odwołać albo przenieść.
 * Przypomnienia o cyklu pomijamy — to wpisy pomocnicze, nie obrady.
 */
function pobierzDoZmiany() {
  const odpowiedz = Calendar.Events.list(KONFIG.idKalendarza, {
    timeMin: new Date().toISOString(),
    privateExtendedProperty: 'zrodlo=' + ZNACZNIK_NARZEDZIA,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 25,
  });

  return (odpowiedz.items || [])
    .filter(function (wydarzenie) {
      const wlasciwosci = (wydarzenie.extendedProperties || {}).private || {};
      return wlasciwosci.typ === 'posiedzenie' && wydarzenie.start.dateTime;
    })
    .map(function (wydarzenie) {
      const wlasciwosci = (wydarzenie.extendedProperties || {}).private || {};
      const start = new Date(wydarzenie.start.dateTime);
      const koniec = new Date(wydarzenie.end.dateTime);

      return {
        id: wydarzenie.id,
        tytul: wydarzenie.summary,
        rodzaj: wlasciwosci.rodzaj || '',
        kiedy: opiszTermin_(start, koniec, null),
        data: naFormatDaty_(start),
        godzina: sformatujGodzine_(start),
        czasTrwania: Math.round((koniec.getTime() - start.getTime()) / 60000),
        miejsce: wydarzenie.location || '',
      };
    });
}


/**
 * Przenosi posiedzenie na nowy termin i składa zawiadomienie o zmianie.
 *
 * @param {{id: string, data: string, godzina: string, czasTrwania: number,
 *          powod: string, zwolujacy: string}} dane
 */
function przeniesPosiedzenie(dane) {
  const wydarzenie = pobierzPosiedzenie_(dane.id);
  const rodzaj = znajdzRodzajLubNic_(rodzajWydarzenia_(wydarzenie));

  const staryStart = new Date(wydarzenie.start.dateTime);
  const staryKoniec = new Date(wydarzenie.end.dateTime);
  const staryCzas = Math.round((staryKoniec.getTime() - staryStart.getTime()) / 60000);

  const nowyStart = zbudujDate_(dane.data, dane.godzina);
  const minuty = Number(dane.czasTrwania) || staryCzas;
  const nowyKoniec = new Date(nowyStart.getTime() + minuty * 60 * 1000);

  if (nowyStart.getTime() === staryStart.getTime() && minuty === staryCzas) {
    throw new Error('Nowy termin jest taki sam jak dotychczasowy — nie ma czego przenosić.');
  }

  const zmiana = {
    start: { dateTime: naFormatLokalny_(nowyStart), timeZone: KONFIG.strefaCzasowa },
    end: { dateTime: naFormatLokalny_(nowyKoniec), timeZone: KONFIG.strefaCzasowa },
  };

  const zmienione = Calendar.Events.patch(
    zmiana, KONFIG.idKalendarza, wydarzenie.id, parametryPowiadomien_(wydarzenie)
  );

  const linkMeet = wyciagnijLink_(zmienione) || wyciagnijLink_(wydarzenie);
  const miejsce = wydarzenie.location || '';

  const ostrzezenia = rodzaj
    ? zbadajTerminy_(rodzaj, nowyStart, miejsce)
    : [];

  if (rodzaj && rodzaj.cyklMiesiecy) {
    ostrzezenia.push(
      'Przypomnienie o kolejnym terminie w cyklu zostało założone przy ' +
      'pierwotnej dacie i nie przeliczyło się samo. Sprawdź wpis „Upływa ' +
      'termin: ' + rodzaj.nazwa + '” w kalendarzu.'
    );
  }

  const tekst = zlozPrzeniesienie_(
    rodzaj, wydarzenie.summary, staryStart, nowyStart, nowyKoniec,
    linkMeet, miejsce, dane.powod, dane.zwolujacy
  );

  return {
    idWydarzenia: wydarzenie.id,
    tytul: wydarzenie.summary,
    kiedy: opiszTermin_(nowyStart, nowyKoniec, null),
    poprzedniTermin: opiszTermin_(staryStart, staryKoniec, null),
    linkMeet: linkMeet,
    linkWydarzenia: zmienione.htmlLink || wydarzenie.htmlLink,
    tekst: tekst,
    temat: 'Zmiana terminu: ' + wydarzenie.summary + ' — ' + sformatujDate_(nowyStart),
    ostrzezenia: ostrzezenia,
  };
}


/**
 * Odwołuje posiedzenie i składa zawiadomienie o odwołaniu.
 * Wydarzenie dostaje status „cancelled”, a nie znika — w kalendarzu zostaje
 * ślad, że posiedzenie było zwołane i zostało odwołane.
 *
 * @param {{id: string, powod: string, zwolujacy: string}} dane
 */
function odwolajPosiedzenie(dane) {
  const wydarzenie = pobierzPosiedzenie_(dane.id);
  const rodzaj = znajdzRodzajLubNic_(rodzajWydarzenia_(wydarzenie));

  const start = new Date(wydarzenie.start.dateTime);
  const koniec = new Date(wydarzenie.end.dateTime);

  Calendar.Events.patch(
    { status: 'cancelled' },
    KONFIG.idKalendarza,
    wydarzenie.id,
    parametryPowiadomien_(wydarzenie)
  );

  const tekst = zlozOdwolanie_(
    rodzaj, wydarzenie.summary, start, dane.powod, dane.zwolujacy
  );

  return {
    tytul: wydarzenie.summary,
    kiedy: opiszTermin_(start, koniec, null),
    tekst: tekst,
    temat: 'Odwołanie: ' + wydarzenie.summary + ' — ' + sformatujDate_(start),
    ostrzezenia: [],
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// Teksty
// ─────────────────────────────────────────────────────────────────────────────

function zlozPrzeniesienie_(rodzaj, tytul, staryStart, nowyStart, nowyKoniec,
                            linkMeet, miejsce, powod, idZwolujacego) {
  const wiersze = [];

  wiersze.push(zwrotPowitalnyRodzaju_(rodzaj));
  wiersze.push('');
  wiersze.push(
    'zawiadamiam, że ' + nazwaWZdaniu_(rodzaj, tytul) + ', zwołane na ' +
    dzienBezPrzyimka_(staryStart) + ', ' + sformatujDate_(staryStart) +
    ', na godzinę ' + sformatujGodzine_(staryStart) +
    ', zostaje przeniesione na inny termin.'
  );

  wiersze.push('');
  wiersze.push(
    'Nowy termin: ' + dzienBezPrzyimka_(nowyStart) + ', ' +
    sformatujDate_(nowyStart) + ', godzina ' + sformatujGodzine_(nowyStart) +
    '. Planowane zakończenie o godzinie ' + sformatujGodzine_(nowyKoniec) + '.'
  );

  if (powod && powod.trim()) {
    wiersze.push('');
    wiersze.push('Przyczyna zmiany: ' + powod.trim());
  }

  wiersze.push('');

  if (miejsce) {
    wiersze.push('Miejsce obrad pozostaje bez zmian: ' + miejsce);
  }

  if (linkMeet) {
    wiersze.push('Link do Google Meet pozostaje ten sam:');
    wiersze.push(linkMeet);
  }

  wiersze.push('');
  wiersze.push('Porządek obrad i pozostałe ustalenia pozostają bez zmian.');

  wiersze.push('');
  zlozPodpis_(idZwolujacego, rodzaj).forEach(function (linia) {
    wiersze.push(linia);
  });

  return wiersze.join('\n') + stopkaPisma_(rodzaj);
}


function zlozOdwolanie_(rodzaj, tytul, start, powod, idZwolujacego) {
  const wiersze = [];

  wiersze.push(zwrotPowitalnyRodzaju_(rodzaj));
  wiersze.push('');
  wiersze.push(
    'zawiadamiam, że ' + nazwaWZdaniu_(rodzaj, tytul) + ', zwołane na ' +
    dzienBezPrzyimka_(start) + ', ' + sformatujDate_(start) +
    ', na godzinę ' + sformatujGodzine_(start) + ', zostaje odwołane.'
  );

  if (powod && powod.trim()) {
    wiersze.push('');
    wiersze.push('Przyczyna odwołania: ' + powod.trim());
  }

  wiersze.push('');
  wiersze.push('O nowym terminie zawiadomię odrębnym pismem.');
  wiersze.push('Dotychczasowy link do Google Meet przestaje być aktualny.');

  wiersze.push('');
  zlozPodpis_(idZwolujacego, rodzaj).forEach(function (linia) {
    wiersze.push(linia);
  });

  return wiersze.join('\n') + stopkaPisma_(rodzaj);
}


/**
 * Nazwa posiedzenia w środku zdania — z małej litery, bo zdanie zaczyna się
 * wcześniej. Bierzemy tytuł wydarzenia, bo on już niesie nazwę Okręgu;
 * doklejanie jej do nazwy rodzaju dawało „Zarządu Okręgu Okręgu Mazowieckiego”.
 */
function nazwaWZdaniu_(rodzaj, tytul) {
  const nazwa = tytul || (rodzaj ? rodzaj.tytul : '');
  return nazwa.charAt(0).toLowerCase() + nazwa.slice(1);
}


/**
 * Dzień tygodnia w bierniku, bez przyimka — po „zwołane na” przyimek jest
 * już w zdaniu, a DNI_W_ZDANIU nosi własny („we wtorek”), co dawało
 * „zwołane na we wtorek”. Sam przypadek jest ten sam, więc wystarczy
 * odciąć początek.
 */
function dzienBezPrzyimka_(data) {
  return DNI_W_ZDANIU[data.getDay()].replace(/^we? /, '');
}


function stopkaPisma_(rodzaj) {
  if (!KONFIG.stopkaZDanymiOkregu) {
    return '';
  }

  const wiersze = [
    '',
    '',
    '—',
    KONFIG.okreg.nazwa + ' · kadencja ' + KONFIG.kadencja,
    KONFIG.okreg.adres + ' · ' + KONFIG.okreg.telefony.join(', ') + ' · ' +
      KONFIG.okreg.strona,
  ];

  if (rodzaj) {
    wiersze.push(
      'Podstawa zwołania: ' + rodzaj.podstawa +
      ' (tekst jednolity z dnia 15 marca 2017 r.).'
    );
  }

  return wiersze.join('\n');
}


// ─────────────────────────────────────────────────────────────────────────────
// Kalendarz
// ─────────────────────────────────────────────────────────────────────────────

function pobierzPosiedzenie_(id) {
  if (!id) {
    throw new Error('Wskaż posiedzenie, które chcesz zmienić.');
  }

  const wydarzenie = Calendar.Events.get(KONFIG.idKalendarza, id);

  // Wspólne także dla protokołu (Dokumenty.gs), więc komunikat nie mówi
  // o konkretnej operacji.
  if (!wydarzenie || !wydarzenie.start || !wydarzenie.start.dateTime) {
    throw new Error(
      'Ten wpis w kalendarzu nie jest posiedzeniem z godziną rozpoczęcia — ' +
      'przypomnienia o terminie nie da się ani przenieść, ani oprotokołować.'
    );
  }

  if (wydarzenie.status === 'cancelled') {
    throw new Error('To posiedzenie zostało już odwołane.');
  }

  return wydarzenie;
}


function rodzajWydarzenia_(wydarzenie) {
  return ((wydarzenie.extendedProperties || {}).private || {}).rodzaj || '';
}


/** Google powiadamia gości tylko wtedy, gdy wydarzenie w ogóle ich ma. */
function parametryPowiadomien_(wydarzenie) {
  return (wydarzenie.attendees || []).length
    ? { sendUpdates: 'all' }
    : {};
}
