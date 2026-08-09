/**
 * Generator posiedzeń Okręgu Mazowieckiego PZW.
 *
 * Tworzy wydarzenie w Kalendarzu Google razem z linkiem Google Meet
 * i składa gotowe zawiadomienie do wklejenia w maila. Pilnuje przy tym
 * terminów ze Statutu PZW: Zarząd Okręgu obraduje nie rzadziej niż raz
 * na kwartał (§ 46 ust. 1), Prezydium nie rzadziej niż raz w miesiącu
 * (§ 48 ust. 1), a o okręgowym zjeździe delegatów zawiadamia się na piśmie
 * co najmniej 21 dni wcześniej (§ 41 ust. 2).
 *
 * Ustawienia znajdziesz w pliku Konfiguracja.gs.
 */

/** Znacznik, po którym poznajemy wydarzenia utworzone tym narzędziem. */
const ZNACZNIK_NARZEDZIA = 'pzw-posiedzenie';

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

/** Mianownik, do nagłówków planu rocznego („Wrzesień”). */
const MIESIACE_MIANOWNIK = [
  'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
  'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień',
];

/**
 * Zawiadomienie składa się i pokazuje do poprawek, zanim powstanie wydarzenie
 * — a link Meet istnieje dopiero po jego utworzeniu. W podglądzie w tym
 * miejscu stoi ten znacznik, a przy zakładaniu wydarzenia podmienia się
 * na prawdziwy adres. Jeśli skasujesz go z treści, narzędzie o tym powie
 * i poda link osobno.
 */
const MIEJSCE_NA_LINK = '[tutaj wejdzie link do Google Meet]';


// ─────────────────────────────────────────────────────────────────────────────
// Punkt wejścia aplikacji internetowej
// ─────────────────────────────────────────────────────────────────────────────

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Posiedzenia Okręgu Mazowieckiego PZW')
    .setFaviconUrl(KONFIG.okreg.godlo)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}


/**
 * Dane, którymi formularz wypełnia się po otwarciu: dane Okręgu i lista
 * rodzajów posiedzeń wraz z wymogami Statutu i szkicami porządku obrad.
 * Wywoływane z przeglądarki przez google.script.run.
 */
function pobierzDomyslne() {
  return {
    okreg: KONFIG.okreg,
    kadencja: KONFIG.kadencja,
    linki: KONFIG.przydatneLinki || [],
    godzina: KONFIG.domyslnaGodzina,
    domyslnyRodzaj: KONFIG.domyslnyRodzaj,
    odstepDrugiegoTerminu: KONFIG.odstepDrugiegoTerminuMinut,
    mailWlaczony: Boolean(KONFIG.adresyDoWysylki && KONFIG.adresyDoWysylki.length),
    liczbaAdresatow: (KONFIG.adresyDoWysylki || []).length,
    zwolujacy: pobierzZwolujacych(),
    rejestrUchwal: Boolean(KONFIG.rejestrUchwal),
    etapy: pobierzEtapy(),
    preferowanyDzienTygodnia: KONFIG.preferowanyDzienTygodnia,
    ktoryTydzienMiesiaca: KONFIG.ktoryTydzienMiesiaca,
    przypomnienia: stanPrzypomnien(),
    rodzaje: RODZAJE_POSIEDZEN.map(function (rodzaj) {
      return {
        id: rodzaj.id,
        nazwa: rodzaj.nazwa,
        tytul: rodzaj.tytul,
        czasTrwaniaMinut: rodzaj.czasTrwaniaMinut,
        wyprzedzenieDni: rodzaj.wyprzedzenieDni,
        naPismie: rodzaj.naPismie,
        drugiTermin: rodzaj.drugiTermin,
        listaObecnosci: rodzaj.listaObecnosci,
        cyklMiesiecy: rodzaj.cyklMiesiecy,
        zwoluje: rodzaj.zwoluje,
        czestotliwosc: rodzaj.czestotliwosc,
        podstawa: rodzaj.podstawa,
        porzadek: rodzaj.porzadek,
        sklad: rodzaj.sklad || 0,
        niejawne: Boolean(rodzaj.niejawne),
        uchwalyPrzedkladane: Boolean(rodzaj.uchwalyPrzedkladane),
        liczbaAdresatow: adresyRodzaju_(rodzaj).length,
        zwolujacy: pobierzZwolujacych(rodzaj.id),
      };
    }),
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// Główna operacja
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Składa zawiadomienie bez dotykania kalendarza — do przeczytania i poprawek,
 * zanim cokolwiek powstanie. W kalendarzu nie zostaje po tym żaden ślad, więc
 * podgląd można wywoływać do skutku.
 *
 * W miejscu linku Meet stoi MIEJSCE_NA_LINK; prawdziwy adres wchodzi tam
 * dopiero w utworzPosiedzenie(), bo konferencja rodzi się razem z wydarzeniem.
 *
 * @param {{rodzaj: string, data: string, godzina: string, czasTrwania: number,
 *          tytul: string, miejsce: string, porzadek: string,
 *          zwolujacy: string}} dane z formularza
 * @return {{tytul: string, kiedy: string, zaproszenie: string,
 *           tematMaila: string, ostrzezenia: string[]}}
 */
function zlozPodglad(dane) {
  const rodzaj = znajdzRodzaj_(dane.rodzaj);
  const termin = ustalTermin_(dane, rodzaj);

  const tytul = (dane.tytul || rodzaj.tytul).trim();
  const miejsce = (dane.miejsce || '').trim();
  const porzadek = rozbijNaWiersze_(dane.porzadek, zlozPorzadekZUchwalami_(rodzaj));

  return {
    tytul: tytul,
    kiedy: opiszTermin_(termin.start, termin.koniec, termin.drugiStart),
    zaproszenie: zlozZaproszenie_(
      rodzaj, termin.start, termin.drugiStart, MIEJSCE_NA_LINK,
      miejsce, porzadek, dane.zwolujacy
    ),
    tematMaila: zlozTematMaila_(tytul, termin.start),
    ostrzezenia: zbadajTerminy_(rodzaj, termin.start, miejsce),
    dodatki: opiszDodatki_(rodzaj, {}),
  };
}


/**
 * Porządek obrad dla wybranego rodzaju, z uchwałami czekającymi na przedłożenie
 * już wpisanymi pod właściwym punktem (§ 48 ust. 2). Formularz woła to przy
 * każdej zmianie rodzaju posiedzenia.
 */
function pobierzPorzadekObrad(idRodzaju) {
  return { porzadek: zlozPorzadekZUchwalami_(znajdzRodzaj_(idRodzaju)) };
}


/** Początek, koniec i ewentualny drugi termin — wspólne dla podglądu i zapisu. */
function ustalTermin_(dane, rodzaj) {
  const start = zbudujDate_(dane.data, dane.godzina);
  const minuty = Number(dane.czasTrwania) || rodzaj.czasTrwaniaMinut;

  return {
    start: start,
    koniec: new Date(start.getTime() + minuty * 60 * 1000),
    drugiStart: rodzaj.drugiTermin
      ? new Date(start.getTime() + KONFIG.odstepDrugiegoTerminuMinut * 60 * 1000)
      : null,
  };
}


/**
 * Tworzy wydarzenie z linkiem Meet i zwraca dane do wyświetlenia.
 *
 * Treść bierzemy z `dane.tresc` — czyli z tego, co widziałeś i poprawiłeś
 * w podglądzie. Pusta treść znaczy, że formularz poszedł na skróty, więc
 * składamy zawiadomienie od nowa.
 *
 * @param {{rodzaj: string, data: string, godzina: string, czasTrwania: number,
 *          tytul: string, miejsce: string, porzadek: string, tresc: string,
 *          zwolujacy: string}} dane z formularza
 * @return {{idWydarzenia: string, tytul: string, kiedy: string,
 *           linkMeet: string, linkWydarzenia: string, zaproszenie: string,
 *           ostrzezenia: string[], nastepnyTermin: string}}
 */
function utworzPosiedzenie(dane) {
  const rodzaj = znajdzRodzaj_(dane.rodzaj);
  const termin = ustalTermin_(dane, rodzaj);
  const start = termin.start;

  const tytul = (dane.tytul || rodzaj.tytul).trim();
  const miejsce = (dane.miejsce || '').trim();
  const porzadek = rozbijNaWiersze_(dane.porzadek, zlozPorzadekZUchwalami_(rodzaj));

  const ostrzezenia = zbadajTerminy_(rodzaj, start, miejsce);

  const wydarzenie = wstawWydarzenie_(tytul, start, termin.koniec, miejsce, rodzaj);
  const linkMeet = pobierzLinkMeet_(wydarzenie);

  const tresc = String(dane.tresc || '').trim() || zlozZaproszenie_(
    rodzaj, start, termin.drugiStart, MIEJSCE_NA_LINK, miejsce, porzadek,
    dane.zwolujacy
  );

  const zaproszenie = wstawLinkWTresc_(tresc, linkMeet, ostrzezenia);

  if (KONFIG.opisWydarzeniaZZaproszenia) {
    Calendar.Events.patch(
      { description: zaproszenie },
      KONFIG.idKalendarza,
      wydarzenie.id
    );
  }

  // Zapowiedź z planu rocznego przestaje mieć sens, skoro posiedzenie
  // faktycznie zostało zwołane na ten dzień.
  usunWpisPlanu_(rodzaj, start);

  const przedlozone = odnotujPrzedlozenie_(rodzaj, start, ostrzezenia);

  return {
    idWydarzenia: wydarzenie.id,
    rodzaj: rodzaj.id,
    tytul: tytul,
    kiedy: opiszTermin_(start, termin.koniec, termin.drugiStart),
    linkMeet: linkMeet,
    linkWydarzenia: wydarzenie.htmlLink,
    zaproszenie: zaproszenie,
    tematMaila: zlozTematMaila_(tytul, start),
    ostrzezenia: ostrzezenia,
    przedlozoneUchwaly: przedlozone,
    dodatki: opiszDodatki_(rodzaj, {}),
  };
}


/**
 * Uchwały Prezydium wciągnięte do porządku obrad przestają czekać: w rejestrze
 * dostają datę posiedzenia, na które je skierowano (§ 48 ust. 2).
 * Rejestru może nie być i to nie jest powód, żeby cokolwiek przerywać.
 */
function odnotujPrzedlozenie_(rodzaj, start, ostrzezenia) {
  if (!KONFIG.rejestrUchwal || !rodzaj.wstawUchwalyPoPunkcie) {
    return 0;
  }

  try {
    const oznaczonych = oznaczPrzedlozone_(numeryDoPrzedlozenia_(), start);

    if (oznaczonych) {
      ostrzezenia.push(
        'W rejestrze oznaczono ' + oznaczonych + ' uchwał jako skierowane ' +
        'na to posiedzenie (§ 48 ust. 2).'
      );
    }

    return oznaczonych;
  } catch (blad) {
    return 0;
  }
}


/**
 * Dopytanie o link Meet z przeglądarki. Konferencja bywa dopisywana chwilę
 * po utworzeniu wydarzenia, a czekanie na nią w głównym wywołaniu kazałoby
 * patrzeć na zablokowany przycisk.
 */
function sprawdzLinkMeet(idWydarzenia) {
  const wydarzenie = Calendar.Events.get(KONFIG.idKalendarza, idWydarzenia);
  return { linkMeet: wyciagnijLink_(wydarzenie) };
}


/**
 * Wstawia adres konferencji w miejsce oznaczone w podglądzie.
 *
 * Wydarzenie w tym momencie już istnieje, więc żaden kłopot z linkiem nie
 * może przerwać operacji — wszystko, co pójdzie nie tak, wraca jako uwaga.
 * Rzucenie wyjątku zostawiłoby w kalendarzu sierotę, a zwołujący kliknąłby
 * drugi raz i miałby dwa posiedzenia.
 */
function wstawLinkWTresc_(tresc, linkMeet, ostrzezenia) {
  if (!linkMeet) {
    ostrzezenia.push(
      'Google nie zdążyło wygenerować linku Meet. Wydarzenie jest już ' +
      'w kalendarzu. Otwórz je za chwilę, link powinien tam być, i wklej go ' +
      'w treści w miejscu „' + MIEJSCE_NA_LINK + '”.'
    );
    return tresc;
  }

  if (tresc.indexOf(MIEJSCE_NA_LINK) === -1) {
    ostrzezenia.push(
      'W treści nie ma już miejsca oznaczonego na link Meet, więc nic tam nie ' +
      'wstawiłem. Adres konferencji to ' + linkMeet + '. Wklej go ręcznie.'
    );
    return tresc;
  }

  return tresc.split(MIEJSCE_NA_LINK).join(linkMeet);
}


/**
 * Zapisuje zawiadomienie jako wersję roboczą w Gmailu. Adresy członków idą
 * do UDW — przy mailu do grupy osób nie wolno ujawniać całej listy pozostałym.
 *
 * @param {{temat: string, tresc: string}} dane
 * @return {{link: string, liczbaAdresatow: number}}
 */
function utworzWersjeRoboczaMaila(dane) {
  const rodzaj = dane.rodzaj ? znajdzRodzaj_(dane.rodzaj) : null;
  const adresy = rodzaj
    ? adresyRodzaju_(rodzaj)
    : (KONFIG.adresyDoWysylki || []).filter(String);

  if (!adresy.length) {
    throw new Error(powodBrakuAdresow_(rodzaj));
  }

  const opcje = { bcc: adresy.join(',') };

  if (KONFIG.mailWHtml) {
    opcje.htmlBody = naHtml_(dane.tresc);
  }

  const wersja = GmailApp.createDraft(
    KONFIG.adresNadawcyWDo || Session.getActiveUser().getEmail(),
    dane.temat,
    dane.tresc,
    opcje
  );

  return {
    link: 'https://mail.google.com/mail/u/0/#drafts?compose=' +
      wersja.getMessageId(),
    liczbaAdresatow: adresy.length,
  };
}


/**
 * Nadchodzące posiedzenia i terminy utworzone tym narzędziem — żeby widzieć
 * cały cykl, mimo że każde posiedzenie zakładasz osobno.
 */
function pobierzNadchodzace() {
  const teraz = new Date();
  const odpowiedz = Calendar.Events.list(KONFIG.idKalendarza, {
    timeMin: teraz.toISOString(),
    privateExtendedProperty: 'zrodlo=' + ZNACZNIK_NARZEDZIA,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 15,
  });

  return (odpowiedz.items || []).map(function (wydarzenie) {
    const wlasciwosci = (wydarzenie.extendedProperties || {}).private || {};
    const calodniowe = Boolean(wydarzenie.start.date);
    const start = new Date(wydarzenie.start.dateTime || wydarzenie.start.date);

    return {
      id: wydarzenie.id,
      tytul: wydarzenie.summary,
      kiedy: calodniowe
        ? sformatujDate_(start)
        : sformatujDate_(start) + ', godz. ' + sformatujGodzine_(start),
      typ: wlasciwosci.typ || '',
      termin: wlasciwosci.typ === 'termin',
      /** Zapowiedź z planu rocznego, a nie zwołane posiedzenie. */
      zapowiedz: wlasciwosci.typ === TYP_PLANU,
      /** Przy zwołanym posiedzeniu można jeszcze dopiąć dodatki. */
      doDokonczenia: wlasciwosci.typ === 'posiedzenie',
      linkWydarzenia: wydarzenie.htmlLink,
    };
  });
}


/**
 * Minione posiedzenia — do podglądu w interfejsie i do podpowiadania godziny
 * oraz czasu trwania przy zakładaniu kolejnego.
 *
 * @return {{lista: Object[], ostatnie: Object}} lista od najnowszego,
 *   oraz mapa rodzaj → ustawienia z ostatniego takiego posiedzenia
 */
function pobierzMinione() {
  const teraz = new Date();
  const od = dodajMiesiace_(teraz, -KONFIG.historiaMiesiecy);

  const odpowiedz = Calendar.Events.list(KONFIG.idKalendarza, {
    timeMin: od.toISOString(),
    timeMax: teraz.toISOString(),
    privateExtendedProperty: 'zrodlo=' + ZNACZNIK_NARZEDZIA,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 250,
  });

  const posiedzenia = (odpowiedz.items || []).filter(function (wydarzenie) {
    const wlasciwosci = (wydarzenie.extendedProperties || {}).private || {};
    return wlasciwosci.typ === 'posiedzenie' && wydarzenie.start.dateTime;
  });

  // Lista rośnie chronologicznie, więc kolejny wpis tego samego rodzaju
  // nadpisuje poprzedni i na końcu zostaje najświeższy.
  const ostatnie = {};
  const lista = [];

  posiedzenia.forEach(function (wydarzenie) {
    const wlasciwosci = (wydarzenie.extendedProperties || {}).private || {};
    const start = new Date(wydarzenie.start.dateTime);
    const koniec = new Date(wydarzenie.end.dateTime);
    const minuty = Math.round((koniec.getTime() - start.getTime()) / 60000);

    if (wlasciwosci.rodzaj) {
      ostatnie[wlasciwosci.rodzaj] = {
        godzina: sformatujGodzine_(start),
        czasTrwania: minuty,
        miejsce: wydarzenie.location || '',
        data: sformatujDate_(start),
      };
    }

    lista.push({
      tytul: wydarzenie.summary,
      kiedy: sformatujDate_(start) + ', ' + sformatujGodzine_(start) +
        '–' + sformatujGodzine_(koniec),
      rodzaj: nazwaRodzaju_(wlasciwosci.rodzaj),
      miejsce: wydarzenie.location || '',
      linkWydarzenia: wydarzenie.htmlLink,
    });
  });

  return {
    lista: lista.reverse().slice(0, KONFIG.liczbaHistorii),
    ostatnie: ostatnie,
  };
}


/** Etykieta rodzaju po identyfikatorze; puste, gdy rodzaj zniknął z konfiguracji. */
function nazwaRodzaju_(id) {
  for (let i = 0; i < RODZAJE_POSIEDZEN.length; i++) {
    if (RODZAJE_POSIEDZEN[i].id === id) {
      return RODZAJE_POSIEDZEN[i].nazwa;
    }
  }

  return '';
}


// ─────────────────────────────────────────────────────────────────────────────
// Terminy statutowe
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sprawdza to, czego Statut wymaga, a czego kalendarz sam nie dopilnuje:
 * wyprzedzenie zawiadomienia, jego formę i papierową stronę obrad.
 * Zwraca listę zdań — nic nie blokuje, decyzja należy do zwołującego.
 */
function zbadajTerminy_(rodzaj, start, miejsce) {
  const ostrzezenia = [];

  if (KONFIG.pilnujTerminowStatutowych && rodzaj.wyprzedzenieDni) {
    const dni = dniDo_(start);

    if (dni < rodzaj.wyprzedzenieDni) {
      ostrzezenia.push(
        'Do posiedzenia zostało ' + odmienDni_(dni) + ', a ' + rodzaj.podstawa +
        ' wymaga zawiadomienia z ' + rodzaj.wyprzedzenieDni + '-dniowym wyprzedzeniem. ' +
        'Najbliższy zgodny termin to ' +
        sformatujDate_(dodajDni_(dzisiaj_(), rodzaj.wyprzedzenieDni))
      );
    }
  }

  if (rodzaj.naPismie) {
    ostrzezenia.push(
      'Zawiadomienie o okręgowym zjeździe delegatów musi trafić na piśmie ' +
      'do delegatów i do zarządów kół, z załączonym sprawozdaniem z działalności ' +
      'oraz pozostałymi dokumentami i wnioskami będącymi tematem obrad ' +
      '(§ 41 ust. 2 Statutu PZW). Sam mail nie wyczerpuje formy pisemnej.'
    );
  }

  if (rodzaj.listaObecnosci && !miejsce) {
    ostrzezenia.push(
      'Nie podano miejsca obrad. Uchwały i wybory wymagają listy obecności ' +
      'z podpisami, a przy zjeździe także głosowania tajnego. Samo spotkanie ' +
      'w Meet tego nie zastąpi; potraktuj link jako uzupełnienie obrad na miejscu.'
    );
  }

  const dzienWolny = opiszDzienWolny_(start);

  if (dzienWolny) {
    ostrzezenia.push(dzienWolny);
  }

  // Komisję rewizyjną, sąd koleżeński i komisje problemowe zwołuje ich własny
  // przewodniczący. Dopóki nie ma dla nich listy osób, podpis pochodzi
  // z Zarządu Okręgu, a w piśmie tego organu jest to po prostu nieprawda.
  if (rodzaj.wlasniZwolujacy && !(rodzaj.zwolujacy || []).length) {
    ostrzezenia.push(
      rodzaj.zwoluje + ' Lista osób dla tego organu jest pusta, więc podpis ' +
      'pochodzi ze składu Zarządu Okręgu. Uzupełnij pole „zwolujacy” przy tym ' +
      'rodzaju w pliku Konfiguracja.gs albo popraw podpis w treści.'
    );
  }

  return ostrzezenia;
}


/**
 * Zdanie o kworum z doliczonymi głowami. Statut mówi ułamkiem („2/3 członków”),
 * a na sali liczy się osoby: przy 13-osobowym Zarządzie Okręgu wychodzi
 * 9 obecnych i 6 głosów za (§ 47 pkt 14).
 */
function opiszKworum_(rodzaj) {
  if (!rodzaj || !rodzaj.kworum) {
    return '';
  }

  if (!rodzaj.kworumUlamek || !rodzaj.sklad) {
    return rodzaj.kworum;
  }

  const wynik = kworumKwalifikowane_(rodzaj);

  return rodzaj.kworum + ' Przy ' + rodzaj.sklad + '-osobowym składzie oznacza ' +
    'to obecność co najmniej ' + wynik.obecni + ' członków i ' + wynik.za + ' ' +
    odmienGlosy_(wynik.za) + ' za.';
}


/** Ilu musi być obecnych i ilu zagłosować za, żeby uchwała przeszła. */
function kworumKwalifikowane_(rodzaj) {
  const licznik = rodzaj.kworumUlamek[0];
  const mianownik = rodzaj.kworumUlamek[1];
  const obecni = Math.ceil(rodzaj.sklad * licznik / mianownik);

  return { obecni: obecni, za: Math.ceil(obecni * licznik / mianownik) };
}


/** 1 głos, 2–4 głosy, 5+ głosów, z wyjątkiem nastek. */
function odmienGlosy_(ile) {
  if (ile === 1) {
    return 'głos';
  }

  const ostatnia = ile % 10;
  const nastka = ile % 100;
  const kilka = ostatnia >= 2 && ostatnia <= 4 && (nastka < 12 || nastka > 14);

  return kilka ? 'głosy' : 'głosów';
}


/**
 * Całodniowe przypomnienie o kolejnym posiedzeniu w cyklu, który narzuca
 * Statut — dla Zarządu Okręgu kwartał (§ 46 ust. 1), dla Prezydium miesiąc
 * (§ 48 ust. 1). Bez tego łatwo przekroczyć termin, bo nikt go nie pilnuje.
 */
function wstawPrzypomnienieOCyklu_(rodzaj, start) {
  const termin = dodajMiesiace_(start, rodzaj.cyklMiesiecy);

  Calendar.Events.insert({
    summary: 'Upływa termin: ' + rodzaj.nazwa,
    description:
      'Statut PZW wymaga, aby ten organ zbierał się ' +
      rodzaj.czestotliwosc.charAt(0).toLowerCase() + rodzaj.czestotliwosc.slice(1) +
      '\n\nPoprzednie posiedzenie: ' + sformatujDate_(start) +
      '\nZwołuje: ' + rodzaj.zwoluje +
      '\n\n' + KONFIG.okreg.nazwa + '\n' + KONFIG.okreg.adres,
    start: { date: naFormatDaty_(termin) },
    end: { date: naFormatDaty_(dodajDni_(termin, 1)) },
    extendedProperties: {
      private: { zrodlo: ZNACZNIK_NARZEDZIA, typ: 'termin', rodzaj: rodzaj.id },
    },
  }, KONFIG.idKalendarza);

  return sformatujDate_(termin);
}


// ─────────────────────────────────────────────────────────────────────────────
// Kalendarz
// ─────────────────────────────────────────────────────────────────────────────

function wstawWydarzenie_(tytul, start, koniec, miejsce, rodzaj) {
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
      private: {
        zrodlo: ZNACZNIK_NARZEDZIA,
        typ: 'posiedzenie',
        rodzaj: rodzaj.id,
      },
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

  // Dwie próby, nie pięć. Dłuższe czekanie w głównym wywołaniu znaczyłoby
  // patrzenie na zablokowany przycisk; jak się nie uda, przeglądarka dopyta
  // sama przez sprawdzLinkMeet().
  for (let proba = 0; !link && proba < 2; proba++) {
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
// Tekst zawiadomienia
// ─────────────────────────────────────────────────────────────────────────────

function zlozZaproszenie_(rodzaj, start, drugiStart, linkMeet, miejsce, porzadek,
                          idZwolujacego) {
  const wiersze = [];

  wiersze.push(zwrotPowitalnyRodzaju_(rodzaj));
  wiersze.push('');

  const zwolanie = zdanieZwolania_(rodzaj, idZwolujacego) +
    ' ' + DNI_W_ZDANIU[start.getDay()] + ', ' + sformatujDate_(start);

  if (drugiStart) {
    wiersze.push(zwolanie + ':');
    wiersze.push('– w pierwszym terminie o godzinie ' + sformatujGodzine_(start) + ',');
    wiersze.push('– w drugim terminie o godzinie ' + sformatujGodzine_(drugiStart) + '.');
  } else {
    wiersze.push(zwolanie + ', o godzinie ' + sformatujGodzine_(start) + '.');
  }

  const kworum = opiszKworum_(rodzaj);

  if (kworum) {
    wiersze.push('');
    wiersze.push(kworum);
  }

  wiersze.push('');

  if (miejsce) {
    wiersze.push('Obradujemy w formule hybrydowej.');
    wiersze.push('Na miejscu: ' + miejsce);
    wiersze.push('Zdalnie, przez Google Meet:');
  } else {
    wiersze.push('Obradujemy online, w Google Meet:');
  }

  wiersze.push(linkMeet);

  const dopisek = rodzaj.niejawne
    ? KONFIG.dopiskiPodLinkiemNiejawne
    : KONFIG.dopiskiPodLinkiem;

  if (dopisek) {
    wiersze.push(dopisek);
  }

  if (rodzaj.dopiskFormalny) {
    wiersze.push('');
    wiersze.push(rodzaj.dopiskFormalny);
  }

  if (porzadek.length) {
    wiersze.push('');
    wiersze.push('Proponowany porządek obrad:');
    porzadek.forEach(function (punkt) {
      wiersze.push(punkt);
    });
  }

  if (KONFIG.instrukcjaWejscia && KONFIG.instrukcjaWejscia.length) {
    wiersze.push('');
    wiersze.push(KONFIG.naglowekInstrukcji + ':');
    KONFIG.instrukcjaWejscia.forEach(function (punkt) {
      wiersze.push('– ' + punkt);
    });
  }

  wiersze.push('');
  zlozPodpis_(idZwolujacego, rodzaj).forEach(function (linia) {
    wiersze.push(linia);
  });

  if (KONFIG.stopkaZDanymiOkregu) {
    wiersze.push('');
    wiersze.push('–');
    wiersze.push(KONFIG.okreg.nazwa + ' · kadencja ' + KONFIG.kadencja);
    wiersze.push(
      KONFIG.okreg.adres + ' · ' +
      KONFIG.okreg.telefony.join(', ') + ' · ' +
      KONFIG.okreg.strona
    );
    wiersze.push(
      'Podstawa zwołania: ' + rodzaj.podstawa +
      ' (tekst jednolity z dnia 15 marca 2017 r.).'
    );
  }

  return wiersze.join('\n');
}


/**
 * Ta sama treść w HTML. Gmail w wersji tekstowej nie zawsze podlinkuje adres,
 * a link Meet jest w tym mailu najważniejszy.
 */
function naHtml_(tekst) {
  const tresc = String(tekst)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')
    .replace(/\n/g, '<br>');

  return '<div style="font-family: Arial, Helvetica, sans-serif; ' +
    'font-size: 14px; line-height: 1.6; color: #131c28;">' + tresc + '</div>';
}


/**
 * Zdanie otwierające zawiadomienie.
 *
 * Posiedzenia Zarządu Okręgu i Prezydium zwołuje prezes albo osoba przez
 * niego upoważniona (§ 46 ust. 2, § 48 ust. 4). Gdy podpisuje ktoś inny niż
 * prezes, zawiadomienie musi powiedzieć, że działa z upoważnienia; bez tego
 * czytelnik nie wie, czy zwołanie jest skuteczne.
 */
function zdanieZwolania_(rodzaj, idZwolujacego) {
  const zdanie = rodzaj.zdanieZwolania
    .replace('{okreg}', KONFIG.okreg.nazwa)
    .replace('{okregu}', KONFIG.okreg.nazwaDopelniaczKrotka);

  if (!rodzaj.upowaznieniePrezesa) {
    return zdanie;
  }

  const osoba = zwolujacyLubDomyslny_(idZwolujacego, rodzaj);

  if (!osoba || czyPrezes_(osoba)) {
    return zdanie;
  }

  // Duża litera przenosi się na początek dopisku.
  return 'z upoważnienia Prezesa Zarządu ' + KONFIG.okreg.nazwaDopelniaczKrotka +
    ' ' + zdanie;
}


function zlozTematMaila_(tytul, start) {
  return 'Zawiadomienie: ' + tytul + ', ' + sformatujDate_(start);
}


/** Porządek obrad z formularza; puste pole = szkic ze Statutu. */
function rozbijNaWiersze_(tekst, domyslny) {
  if (!tekst || !String(tekst).trim()) {
    return domyslny || [];
  }

  return String(tekst).split('\n')
    .map(function (wiersz) { return wiersz.trim(); })
    .filter(function (wiersz) { return wiersz.length > 0; });
}


function znajdzRodzaj_(id) {
  for (let i = 0; i < RODZAJE_POSIEDZEN.length; i++) {
    if (RODZAJE_POSIEDZEN[i].id === id) {
      return RODZAJE_POSIEDZEN[i];
    }
  }

  throw new Error('Nieznany rodzaj posiedzenia: ' + id);
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
    throw new Error('Podaj datę posiedzenia.');
  }

  const d = String(data).split('-').map(Number);
  const g = String(godzina || KONFIG.domyslnaGodzina).split(':').map(Number);

  return new Date(d[0], d[1] - 1, d[2], g[0] || 0, g[1] || 0, 0);
}


function dzisiaj_() {
  const teraz = new Date();
  return new Date(teraz.getFullYear(), teraz.getMonth(), teraz.getDate());
}


function dodajDni_(data, ile) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate() + ile);
}


/**
 * Dodaje miesiące, przycinając dzień do długości miesiąca docelowego —
 * 31 marca + 1 miesiąc daje 30 kwietnia, a nie 1 maja.
 */
function dodajMiesiace_(data, ile) {
  const docelowy = new Date(data.getFullYear(), data.getMonth() + ile, 1);
  const ostatni = new Date(docelowy.getFullYear(), docelowy.getMonth() + 1, 0).getDate();

  return new Date(
    docelowy.getFullYear(),
    docelowy.getMonth(),
    Math.min(data.getDate(), ostatni)
  );
}


/** Pełne doby między dziś a dniem posiedzenia — tak liczy się wyprzedzenie. */
function dniDo_(start) {
  const dzien = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  return Math.round((dzien.getTime() - dzisiaj_().getTime()) / 86400000);
}


function odmienDni_(ile) {
  if (ile === 1) {
    return '1 dzień';
  }
  if (ile === 0) {
    return 'mniej niż dzień';
  }
  if (ile < 0) {
    return 'ujemna liczba dni, data jest w przeszłości';
  }
  return ile + ' dni';
}


/** '2026-09-15T18:00:00' — bez przesunięcia, strefę podajemy osobno. */
function naFormatLokalny_(data) {
  return Utilities.formatDate(
    data, KONFIG.strefaCzasowa, "yyyy-MM-dd'T'HH:mm:ss"
  );
}


/** '2026-09-15' — dla wydarzeń całodniowych. */
function naFormatDaty_(data) {
  return Utilities.formatDate(data, KONFIG.strefaCzasowa, 'yyyy-MM-dd');
}


/** '15 września 2026 r.' */
function sformatujDate_(data) {
  return data.getDate() + ' ' +
    MIESIACE_DOPELNIACZ[data.getMonth()] + ' ' +
    data.getFullYear() + ' r.';
}


/** '18:00' */
function sformatujGodzine_(data) {
  return Utilities.formatDate(data, KONFIG.strefaCzasowa, 'HH:mm');
}


/** 'wtorek, 15 września 2026 r., 18:00–20:00 (II termin 18:30)' */
function opiszTermin_(start, koniec, drugiStart) {
  const opis = DNI_TYGODNIA[start.getDay()] + ', ' +
    sformatujDate_(start) + ', ' +
    sformatujGodzine_(start) + '–' + sformatujGodzine_(koniec);

  return drugiStart
    ? opis + ' (II termin ' + sformatujGodzine_(drugiStart) + ')'
    : opis;
}
