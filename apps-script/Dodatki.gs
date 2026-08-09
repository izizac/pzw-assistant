/**
 * Dodatki do posiedzenia – wszystko, co nie jest niezbędne, żeby je zwołać.
 *
 * Ścieżka krytyczna to trzy rzeczy: wydarzenie w kalendarzu, link Google Meet
 * i tekst zawiadomienia. Robi je `utworzPosiedzenie()` i na tym kończy.
 * Folder na materiały, protokół, pismo do druku, lista obecności, goście
 * i przypomnienie o cyklu to **dodatki**: każdy jest osobnym wywołaniem
 * z przeglądarki, każdy może paść bez szkody dla pozostałych i dla samego
 * posiedzenia.
 *
 * Trzy reguły trzymają to w ryzach:
 *
 *   1. Dodatek nigdy nie rzuca wyjątkiem – błąd wraca jako stan „blad”.
 *      Wydarzenie już istnieje i nic nie ma prawa go cofnąć.
 *   2. Stan siedzi na wydarzeniu, we właściwościach prywatnych, a nie w sesji
 *      przeglądarki. Dzięki temu dopięcie jest idempotentne, a zamknięcie
 *      karty w połowie niczego nie psuje – brakujące dodatki widać przy
 *      posiedzeniu i można je dopiąć choćby za tydzień.
 *   3. Kod nie zna żadnego dodatku z nazwy. Wszystko stoi w tablicy DODATKI,
 *      tak samo jak dane statutowe stoją w RODZAJE_POSIEDZEN.
 */

/** Przedrostek znaczników we właściwościach prywatnych wydarzenia. */
const ZNACZNIK_DODATKU = 'd.';

/**
 * Etapy, na które dzielą się dodatki. Nie wszystko przydaje się w tej samej
 * chwili: folder na materiały trzeba mieć **przed** obradami, listę obecności
 * **na** obradach, a przypomnienie o kolejnym terminie dopiero **po**.
 * Kolejność w tablicy jest kolejnością na liście w interfejsie.
 */
const ETAPY = [
  {
    id: 'przed',
    nazwa: 'Przed posiedzeniem',
    opis: 'Do rozesłania i przygotowania, zanim ktokolwiek się zbierze',
  },
  {
    id: 'wtrakcie',
    nazwa: 'Na posiedzenie',
    opis: 'Weź ze sobą albo miej otwarte podczas obrad',
  },
  {
    id: 'po',
    nazwa: 'Po posiedzeniu',
    opis: 'Domknięcie sprawy; nic z tego nie jest pilne dzisiaj',
  },
];

/**
 * Katalog dodatków.
 *
 * Pola:
 *   id          klucz techniczny; wchodzi do znacznika na wydarzeniu
 *   etap        kiedy się przydaje: 'przed', 'wtrakcie', 'po'
 *   nazwa       etykieta na liście w interfejsie
 *   opis        jedno zdanie: co powstanie
 *   domyslnie   czy odpalać od razu po utworzeniu posiedzenia
 *   dotyczy     czy dodatek ma sens dla tego rodzaju posiedzenia
 *   wykonaj     robota; zwraca {komunikat, link} albo nic
 */
const DODATKI = [

  {
    id: 'cykl',
    etap: 'po',
    nazwa: 'Przypomnienie o cyklu',
    opis: 'Całodniowy wpis w dniu, w którym upływa termin ze Statutu',
    domyslnie: true,
    dotyczy: function (rodzaj) {
      return Boolean(rodzaj && rodzaj.cyklMiesiecy);
    },
    wykonaj: function (wydarzenie, rodzaj) {
      const termin = wstawPrzypomnienieOCyklu_(
        rodzaj, new Date(wydarzenie.start.dateTime)
      );
      return { komunikat: 'Kolejne posiedzenie musi się odbyć do ' + termin };
    },
  },

  {
    id: 'folder',
    etap: 'przed',
    nazwa: 'Folder na materiały',
    opis: 'Folder na Dysku Google, do którego wrzucisz dokumenty na obrady',
    domyslnie: false,
    dotyczy: function () { return true; },
    wykonaj: function (wydarzenie) {
      return zalozFolderMaterialow_(wydarzenie);
    },
  },

  {
    id: 'protokol',
    etap: 'wtrakcie',
    nazwa: 'Dokument protokołu',
    opis: 'Dokument z porządkiem obrad, tabelą uchwał i miejscem na podpisy',
    domyslnie: false,
    dotyczy: function () { return true; },
    wykonaj: function (wydarzenie, rodzaj) {
      return zalozProtokol_(wydarzenie, rodzaj);
    },
  },

  {
    id: 'obecnosc',
    etap: 'wtrakcie',
    nazwa: 'Lista obecności',
    opis: 'Dokument do druku z rubrykami na podpisy członków',
    domyslnie: true,
    dotyczy: function (rodzaj) {
      return Boolean(rodzaj && rodzaj.listaObecnosci);
    },
    wykonaj: function (wydarzenie, rodzaj) {
      return zalozListeObecnosci_(wydarzenie, rodzaj);
    },
  },

  {
    id: 'pismo',
    etap: 'przed',
    nazwa: 'Zawiadomienie do druku',
    opis: 'Pismo na blankiecie Okręgu – § 41 ust. 2 wymaga formy pisemnej',
    domyslnie: true,
    dotyczy: function (rodzaj) {
      return Boolean(rodzaj && rodzaj.naPismie);
    },
    wykonaj: function (wydarzenie, rodzaj) {
      return zalozPismoDoDruku_(wydarzenie, rodzaj);
    },
  },

  {
    id: 'goscie',
    etap: 'przed',
    nazwa: 'Zaproszenia w kalendarzu',
    opis: 'Dopisuje członków jako gości – odpowiedzi wracają do wydarzenia',
    domyslnie: false,
    dotyczy: function (rodzaj) {
      return adresyRodzaju_(rodzaj).length > 0;
    },
    wykonaj: function (wydarzenie, rodzaj) {
      return dopiszGosci_(wydarzenie, rodzaj);
    },
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// Wywołania z przeglądarki
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wykonuje jeden dodatek. Przeglądarka woła to osobno dla każdego, równolegle.
 *
 * @param {{id: string, dodatek: string}} dane
 * @return {{id: string, stan: string, komunikat: string, link: string}}
 *   stan: 'gotowe' | 'pominiety' | 'blad'
 */
function dopnijDodatek(dane) {
  const dodatek = znajdzDodatek_(dane.dodatek);
  const wydarzenie = wczytajPosiedzenie_(dane.id);
  const wlasciwosci = wlasciwosciPrywatne_(wydarzenie);
  const rodzaj = znajdzRodzajLubNic_(wlasciwosci.rodzaj);

  if (!dodatek.dotyczy(rodzaj)) {
    return odpowiedz_(dodatek, 'pominiety', 'Nie dotyczy tego rodzaju posiedzenia', '');
  }

  const juz = wlasciwosci[ZNACZNIK_DODATKU + dodatek.id];

  if (juz) {
    return odpowiedz_(dodatek, 'gotowe', 'Było już dopięte', czyLink_(juz));
  }

  // Od tego miejsca nic nie ma prawa wylecieć w górę. Wydarzenie już istnieje,
  // a nieudany folder na Dysku nie jest powodem, żeby psuć zwołane posiedzenie.
  try {
    const wynik = dodatek.wykonaj(wydarzenie, rodzaj) || {};
    oznaczDodatek_(wydarzenie.id, dodatek.id, wynik.link || 'tak');

    return odpowiedz_(dodatek, 'gotowe', wynik.komunikat || '', wynik.link || '');
  } catch (blad) {
    return odpowiedz_(dodatek, 'blad', czytelnyBlad_(blad), '');
  }
}


/**
 * Czego przy tym posiedzeniu brakuje. Stąd bierze się lista pod przyciskiem
 * „Uzupełnij” – także dla posiedzenia założonego tydzień temu.
 */
function pobierzStanDodatkow(idWydarzenia) {
  const wydarzenie = wczytajPosiedzenie_(idWydarzenia);
  const wlasciwosci = wlasciwosciPrywatne_(wydarzenie);
  const rodzaj = znajdzRodzajLubNic_(wlasciwosci.rodzaj);

  return {
    id: wydarzenie.id,
    tytul: wydarzenie.summary,
    dodatki: opiszDodatki_(rodzaj, wlasciwosci),
  };
}


/**
 * Opis dodatków dla rodzaju posiedzenia – do listy w interfejsie.
 * Wywoływane też bez wydarzenia, przy składaniu podglądu.
 *
 * @param {Object} rodzaj
 * @param {Object} wlasciwosci właściwości prywatne wydarzenia ({} = jeszcze go nie ma)
 */
function opiszDodatki_(rodzaj, wlasciwosci) {
  const stan = wlasciwosci || {};

  return DODATKI
    .filter(function (dodatek) { return dodatek.dotyczy(rodzaj); })
    .map(function (dodatek) {
      const znacznik = stan[ZNACZNIK_DODATKU + dodatek.id];

      return {
        id: dodatek.id,
        etap: dodatek.etap,
        nazwa: dodatek.nazwa,
        opis: dodatek.opis,
        domyslnie: czyWlaczony_(dodatek),
        stan: znacznik ? 'gotowe' : 'oczekuje',
        link: znacznik ? czyLink_(znacznik) : '',
      };
    });
}


/** Etapy do zbudowania listy w interfejsie; kolejność ma znaczenie. */
function pobierzEtapy() {
  return ETAPY.map(function (etap) {
    return { id: etap.id, nazwa: etap.nazwa, opis: etap.opis };
  });
}


/** Konfiguracja może nadpisać domyślne zaznaczenie każdego dodatku. */
function czyWlaczony_(dodatek) {
  const wybor = KONFIG.dodatki || {};

  return Object.prototype.hasOwnProperty.call(wybor, dodatek.id)
    ? Boolean(wybor[dodatek.id])
    : dodatek.domyslnie;
}


// ─────────────────────────────────────────────────────────────────────────────
// Znaczniki na wydarzeniu
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Zapisuje ślad po dodatku. Właściwości prywatne to jedna mapa, więc dwa
 * dodatki kończące w tej samej chwili potrafią sobie nadpisać wpis – stąd
 * blokada i ponowny odczyt wydarzenia tuż przed zapisem.
 */
function oznaczDodatek_(idWydarzenia, idDodatku, wartosc) {
  const blokada = LockService.getUserLock();

  try {
    blokada.waitLock(20000);
  } catch (blad) {
    throw new Error(
      'Inne dopięcie trwa dłużej, niż wypada czekać. Spróbuj ponownie ' +
      'przyciskiem „Dokończ”.'
    );
  }

  try {
    const swieze = Calendar.Events.get(KONFIG.idKalendarza, idWydarzenia);
    const wlasciwosci = wlasciwosciPrywatne_(swieze);
    const nowe = {};

    Object.keys(wlasciwosci).forEach(function (klucz) {
      nowe[klucz] = wlasciwosci[klucz];
    });

    nowe[ZNACZNIK_DODATKU + idDodatku] = String(wartosc).slice(0, 1024);

    Calendar.Events.patch(
      { extendedProperties: { private: nowe } },
      KONFIG.idKalendarza,
      idWydarzenia
    );
  } finally {
    blokada.releaseLock();
  }
}


/** Znacznik trzyma albo odnośnik, albo samo „tak”. */
function czyLink_(znacznik) {
  return String(znacznik).indexOf('http') === 0 ? znacznik : '';
}


function wlasciwosciPrywatne_(wydarzenie) {
  return (wydarzenie.extendedProperties || {}).private || {};
}


function znajdzDodatek_(id) {
  for (let i = 0; i < DODATKI.length; i++) {
    if (DODATKI[i].id === id) {
      return DODATKI[i];
    }
  }

  throw new Error('Nieznany dodatek: ' + id);
}


/**
 * Wydarzenie po identyfikatorze, sprawdzone na tyle, żeby dodatek nie
 * próbował protokołować przypomnienia o terminie.
 */
function wczytajPosiedzenie_(id) {
  if (!id) {
    throw new Error('Nie wiadomo, do którego posiedzenia dopiąć.');
  }

  const wydarzenie = Calendar.Events.get(KONFIG.idKalendarza, id);

  if (!wydarzenie || !wydarzenie.start || !wydarzenie.start.dateTime) {
    throw new Error(
      'Ten wpis w kalendarzu nie jest posiedzeniem z godziną rozpoczęcia.'
    );
  }

  return wydarzenie;
}


function odpowiedz_(dodatek, stan, komunikat, link) {
  return {
    id: dodatek.id,
    nazwa: dodatek.nazwa,
    stan: stan,
    komunikat: komunikat,
    link: link,
  };
}


/**
 * Komunikaty Google bywają nieczytelne, a przy nowych usługach zwykle chodzi
 * o brak zgody na zakres – mówimy o tym wprost, zamiast pokazywać ślad stosu.
 */
function czytelnyBlad_(blad) {
  const tresc = blad && blad.message ? blad.message : String(blad);

  if (/permission|uprawnien|authoriz|autoryz|scope|zakres/i.test(tresc)) {
    return 'Brakuje uprawnienia do tej usługi Google. Otwórz narzędzie ' +
      'ponownie i zatwierdź dostęp – po dodaniu dokumentów i Dysku aplikacja ' +
      'prosi o nowe zakresy. (' + tresc + ')';
  }

  return tresc;
}
