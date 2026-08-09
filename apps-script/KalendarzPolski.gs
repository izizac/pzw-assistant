/**
 * Kalendarz roku w Polsce – dni wolne, kalendarz szkolny i własne wydarzenia
 * Okręgu, wpisywane do kalendarza jako całodniowe zapowiedzi.
 *
 * Po co: terminy posiedzeń układa się wokół tego, kiedy ludzie są dostępni.
 * Boże Ciało, ferie w mazowieckiem i długi weekend majowy wycinają z roku
 * kilkanaście dni, w których frekwencja i tak by nie dopisała. Narzędzie
 * ostrzega o nich przy zwoływaniu, ale wygodniej mieć je po prostu widoczne
 * w kalendarzu, zanim wybierze się datę.
 *
 * Wpisy są **przezroczyste** (`transparency: transparent`), więc nie zajmują
 * czasu i nie kolidują z niczym. To tło, nie zobowiązania.
 *
 * Wpisujemy wyłącznie to, co wynika z reguł i daje się policzyć: dni ustawowo
 * wolne (z daty Wielkanocy), dni mostkowe, rozpoczęcie i zakończenie zajęć,
 * obie przerwy świąteczne, wakacje letnie.
 *
 * Ferii zimowych tu nie ma świadomie. MEN ogłasza je co roku osobno dla
 * każdego województwa i nie ma reguły, z której dałoby się je wyliczyć,
 * a wpisywanie zmyślonych dat do kalendarza władz Okręgu byłoby gorsze
 * niż ich brak.
 */

/** Typ wpisu w kalendarzu, po którym poznajemy tło roku. */
const TYP_KALENDARZA = 'kalendarz';

/**
 * Reguły z rozporządzenia o organizacji roku szkolnego. Wpisane wprost, bo
 * to reguły, nie daty. MEN publikuje wiążący kalendarz na każdy rok:
 * gov.pl/web/edukacja/kalendarz-roku-szkolnego
 */
const REGULY_SZKOLNE = {
  /** Zajęcia zaczynają się 1 września; gdy to piątek albo sobota – w poniedziałek. */
  rozpoczecie: 'najbliższy poniedziałek, gdy 1 września wypada w piątek albo sobotę',
  /** Zajęcia kończą się w najbliższy piątek po 20 czerwca. */
  zakonczenie: 'najbliższy piątek po 20 czerwca',
};


// ─────────────────────────────────────────────────────────────────────────────
// Wywołania z przeglądarki
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Co da się wpisać do kalendarza na dany rok. Niczego nie zapisuje.
 *
 * @param {number} rok
 * @return {{rok: number, grupy: Object[], brakFerii: boolean}}
 */
function zaproponujKalendarzRoku(rok) {
  const wybrany = Number(rok) || new Date().getFullYear();

  return {
    rok: wybrany,
    grupy: [
      {
        id: 'swieta',
        nazwa: 'Dni ustawowo wolne od pracy',
        opis: 'Święta stałe i ruchome, liczone z daty Wielkanocy',
        wpisy: wpisySwiat_(wybrany),
      },
      {
        id: 'mostki',
        nazwa: 'Dni mostkowe',
        opis: 'Dni robocze wciśnięte między święto a weekend',
        wpisy: wpisyMostkow_(wybrany),
      },
      {
        id: 'szkolne',
        nazwa: 'Kalendarz szkolny',
        opis: 'Przerwy świąteczne i wakacje, wyliczone z reguł rozporządzenia',
        wpisy: wpisySzkolne_(wybrany),
      },
      {
        id: 'wlasne',
        nazwa: 'Wydarzenia Okręgu',
        opis: 'To, co wpiszesz w KONFIG.wlasneWydarzenia',
        wpisy: wpisyWlasne_(wybrany),
      },
    ],
  };
}


/**
 * Wpisuje zaznaczone pozycje do kalendarza.
 *
 * @param {{wpisy: Object[]}} dane pozycje wprost z propozycji
 */
function utworzKalendarzRoku(dane) {
  const wpisy = dane.wpisy || [];

  if (!wpisy.length) {
    throw new Error('Nie zaznaczono żadnej pozycji.');
  }

  let zalozonych = 0;

  wpisy.forEach(function (wpis) {
    const od = zbudujDate_(wpis.od, '00:00');
    const doDnia = zbudujDate_(wpis.doDnia || wpis.od, '00:00');

    Calendar.Events.insert({
      summary: wpis.nazwa,
      description: (wpis.uwaga || '') + '\n\nWpis tła kalendarza, założony ' +
        'przez generator posiedzeń. Nie zajmuje czasu i nie blokuje terminu.',
      start: { date: naFormatDaty_(od) },
      // Kalendarz Google traktuje datę końca jako rozłączną, stąd doba więcej.
      end: { date: naFormatDaty_(dodajDni_(doDnia, 1)) },
      transparency: 'transparent',
      extendedProperties: {
        private: {
          zrodlo: ZNACZNIK_NARZEDZIA,
          typ: TYP_KALENDARZA,
          grupa: wpis.grupa || '',
        },
      },
    }, KONFIG.idKalendarza);

    zalozonych++;
  });

  return {
    zalozonych: zalozonych,
    komunikat: 'Wpisano ' + zalozonych + ' ' + odmienPozycje_(zalozonych) +
      ' do kalendarza.',
  };
}


/**
 * Kasuje tło kalendarza dla wskazanego roku. Bez tego poprawienie ferii
 * po ogłoszeniu przez MEN zostawiałoby duplikaty.
 */
function usunKalendarzRoku(rok) {
  const wybrany = Number(rok) || new Date().getFullYear();

  const odpowiedz = Calendar.Events.list(KONFIG.idKalendarza, {
    timeMin: new Date(wybrany, 0, 1).toISOString(),
    timeMax: new Date(wybrany + 1, 0, 1).toISOString(),
    privateExtendedProperty: 'zrodlo=' + ZNACZNIK_NARZEDZIA,
    singleEvents: true,
    maxResults: 250,
  });

  let usunietych = 0;

  (odpowiedz.items || []).forEach(function (wydarzenie) {
    const wlasciwosci = (wydarzenie.extendedProperties || {}).private || {};

    if (wlasciwosci.typ === TYP_KALENDARZA) {
      Calendar.Events.remove(KONFIG.idKalendarza, wydarzenie.id);
      usunietych++;
    }
  });

  return {
    usunietych: usunietych,
    komunikat: 'Usunięto ' + usunietych + ' ' + odmienPozycje_(usunietych) + '.',
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// Otoczenie terminu
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Co dzieje się wokół wybranej daty: dni wolne, dni mostkowe, inne posiedzenia,
 * zapowiedzi z planu i upływające terminy statutowe.
 *
 * Sens jest prosty. Ostrzeżenie „to dzień wolny” przychodzi, gdy datę już się
 * wybrało. Tutaj widać sąsiedztwo **w chwili wybierania**, więc termin da się
 * ustawić świadomie, a nie poprawiać po fakcie.
 *
 * @param {string} data w formacie 'RRRR-MM-DD'
 */
function pobierzOtoczenieTerminu(data) {
  if (!data) {
    return { pozycje: [] };
  }

  const srodek = zbudujDate_(data, '00:00');
  const promien = KONFIG.oknoOtoczeniaDni || 10;
  const od = dodajDni_(srodek, -promien);
  const doDnia = dodajDni_(srodek, promien);

  // Siatka bierze cały miesiąc, więc pytamy kalendarz raz, o szerszy zakres,
  // i z tej samej odpowiedzi składamy listę.
  const siatka = granicSiatki_(srodek);
  const wydarzenia = wydarzeniaWOknie_(siatka.od, siatka.doDnia);

  const pozycje = dniWolneWOknie_(od, doDnia)
    .concat(okresySzkolneWOknie_(srodek, od, doDnia))
    .concat(wydarzenia.filter(function (wpis) {
      const dzien = zbudujDate_(wpis.data, '00:00');
      return dzien >= od && dzien <= doDnia;
    }));

  pozycje.forEach(function (pozycja) {
    const dzien = zbudujDate_(pozycja.data, '00:00');
    const roznica = Math.round((dzien.getTime() - srodek.getTime()) / 86400000);

    pozycja.odleglosc = roznica;
    pozycja.kiedy = opiszOdleglosc_(roznica);
    // Okres trwający kilka dni opisujemy zakresem, nie dniem zaczepienia.
    pozycja.opis = pozycja.zakres ||
      DNI_TYGODNIA[dzien.getDay()] + ', ' + sformatujDate_(dzien);
  });

  return {
    promien: promien,
    siatka: zlozSiatke_(srodek, siatka, wydarzenia),
    pozycje: pozycje.sort(function (a, b) {
      return a.odleglosc - b.odleglosc;
    }),
  };
}


/** Pełne tygodnie obejmujące miesiąc wybranej daty; tydzień zaczyna poniedziałek. */
function granicSiatki_(srodek) {
  const pierwszy = new Date(srodek.getFullYear(), srodek.getMonth(), 1);
  const ostatni = new Date(srodek.getFullYear(), srodek.getMonth() + 1, 0);

  return {
    od: dodajDni_(pierwszy, -((pierwszy.getDay() + 6) % 7)),
    doDnia: dodajDni_(ostatni, 6 - ((ostatni.getDay() + 6) % 7)),
    miesiac: srodek.getMonth(),
  };
}


/**
 * Siatka miesiąca dzień po dniu. Kolor sam nie wystarczy, więc każdy dzień
 * niesie też `opis` – czytnik ekranu i dymek mówią to samo, co barwa.
 */
function zlozSiatke_(srodek, granice, wydarzenia) {
  const poDniach = {};

  wydarzenia.forEach(function (wpis) {
    poDniach[wpis.data] = (poDniach[wpis.data] || []).concat([wpis]);
  });

  const tygodnie = [];
  let tydzien = [];

  for (let dzien = new Date(granice.od); dzien <= granice.doDnia;
       dzien = dodajDni_(dzien, 1)) {
    tydzien.push(opiszDzienSiatki_(dzien, srodek, granice, poDniach));

    if (tydzien.length === 7) {
      tygodnie.push(tydzien);
      tydzien = [];
    }
  }

  return {
    naglowek: MIESIACE_MIANOWNIK[granice.miesiac] + ' ' + srodek.getFullYear(),
    dni: ['pon', 'wt', 'śr', 'czw', 'pt', 'sob', 'nd'],
    tygodnie: tygodnie,
  };
}


function opiszDzienSiatki_(dzien, srodek, granice, poDniach) {
  const klucz = naFormatDaty_(dzien);
  const swieta = swietaRoku_(dzien.getFullYear());
  const swieto = swieta[kluczDnia_(dzien)] || '';
  const okres = swieto ? '' : nazwaOkresuSzkolnego_(dzien);
  const wydarzenia = poDniach[klucz] || [];

  const czesci = [DNI_TYGODNIA[dzien.getDay()] + ', ' + sformatujDate_(dzien)];

  if (swieto) {
    czesci.push(swieto);
  }

  if (okres) {
    czesci.push(okres);
  }

  if (!swieto && !okres && opiszMostek_(dzien, swieta)) {
    czesci.push('dzień mostkowy');
  }

  wydarzenia.forEach(function (wpis) {
    czesci.push(wpis.nazwa);
  });

  return {
    dzien: dzien.getDate(),
    data: klucz,
    poza: dzien.getMonth() !== granice.miesiac,
    wybrany: klucz === naFormatDaty_(srodek),
    wolne: Boolean(swieto) || dzien.getDay() === 0,
    swieto: swieto,
    szkolne: Boolean(okres),
    mostek: !swieto && !okres && Boolean(opiszMostek_(dzien, swieta)),
    wydarzen: wydarzenia.length,
    opis: czesci.join('. '),
  };
}


/** Nazwa wielodniowego okresu szkolnego, w którym stoi ten dzień. */
function nazwaOkresuSzkolnego_(data) {
  const wpisy = wpisySzkolne_(data.getFullYear());

  for (let i = 0; i < wpisy.length; i++) {
    const wpis = wpisy[i];

    if (wpis.od === wpis.doDnia) {
      continue;
    }

    if (data >= zbudujDate_(wpis.od, '00:00') &&
        data <= zbudujDate_(wpis.doDnia, '00:00')) {
      return wpis.nazwa;
    }
  }

  return '';
}


function dniWolneWOknie_(od, doDnia) {
  const pozycje = [];

  for (let dzien = new Date(od); dzien <= doDnia; dzien = dodajDni_(dzien, 1)) {
    const swieta = swietaRoku_(dzien.getFullYear());
    const swieto = swieta[kluczDnia_(dzien)];

    if (swieto) {
      pozycje.push({ data: naFormatDaty_(dzien), nazwa: swieto, rodzaj: 'wolne' });
      continue;
    }

    if (opiszMostek_(dzien, swieta)) {
      pozycje.push({
        data: naFormatDaty_(dzien),
        nazwa: 'Dzień mostkowy',
        rodzaj: 'mostek',
      });
    }
  }

  return pozycje;
}


/**
 * Przerwy szkolne i wakacje zachodzące na okno. Liczymy je, zamiast czytać
 * z kalendarza, więc widać je niezależnie od tego, czy tło roku zostało
 * wpisane. Bez tego 23 grudnia wyglądał na zwykłą środę.
 *
 * Pozycję zaczepiamy tam, gdzie okres jest najbliżej wybranego dnia: gdy
 * termin wypada w środku okresu, wychodzi „tego samego dnia”.
 */
function okresySzkolneWOknie_(srodek, od, doDnia) {
  const lata = {};
  lata[od.getFullYear()] = true;
  lata[doDnia.getFullYear()] = true;

  const pozycje = [];

  Object.keys(lata).forEach(function (rok) {
    wpisySzkolne_(Number(rok)).forEach(function (wpis) {
      const start = zbudujDate_(wpis.od, '00:00');
      const koniec = zbudujDate_(wpis.doDnia, '00:00');

      if (koniec < od || start > doDnia) {
        return;
      }

      const kotwica = srodek < start ? start : (srodek > koniec ? koniec : srodek);

      pozycje.push({
        data: naFormatDaty_(kotwica),
        nazwa: wpis.nazwa,
        rodzaj: 'szkolne',
        zakres: wpis.od === wpis.doDnia ? '' : wpis.opis,
      });
    });
  });

  return pozycje;
}


/**
 * Zdanie o tym, że termin wpada w przerwę szkolną albo wakacje.
 * To nie są dni wolne od pracy, więc mówimy o frekwencji, nie o zakazie.
 */
function opiszOkresSzkolny_(data) {
  const wpisy = wpisySzkolne_(data.getFullYear());

  for (let i = 0; i < wpisy.length; i++) {
    const wpis = wpisy[i];
    const start = zbudujDate_(wpis.od, '00:00');
    const koniec = zbudujDate_(wpis.doDnia, '00:00');

    if (wpis.od !== wpis.doDnia && data >= start && data <= koniec) {
      return 'Termin wypada w okresie „' + wpis.nazwa.toLowerCase() + '” (' +
        wpis.opis + '). To nie jest dzień wolny od pracy, ale wielu członków ' +
        'wyjeżdża wtedy z rodziną.';
    }
  }

  return '';
}


/**
 * Wpisy narzędzia z okna. Tło kalendarza pomijamy, bo dni wolne i przerwy
 * liczymy i tak, a wpisane wcześniej tło dublowałoby każdą pozycję.
 */
function wydarzeniaWOknie_(od, doDnia) {
  let odpowiedz;

  try {
    odpowiedz = Calendar.Events.list(KONFIG.idKalendarza, {
      timeMin: od.toISOString(),
      timeMax: dodajDni_(doDnia, 1).toISOString(),
      privateExtendedProperty: 'zrodlo=' + ZNACZNIK_NARZEDZIA,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 50,
    });
  } catch (blad) {
    return [];
  }

  const nazwyTypow = {
    posiedzenie: 'posiedzenie',
    termin: 'termin',
    plan: 'zapowiedz',
  };

  return (odpowiedz.items || [])
    .filter(function (wydarzenie) {
      const typ = ((wydarzenie.extendedProperties || {}).private || {}).typ;
      return Object.prototype.hasOwnProperty.call(nazwyTypow, typ);
    })
    .map(function (wydarzenie) {
      const typ = ((wydarzenie.extendedProperties || {}).private || {}).typ;
      const start = new Date(wydarzenie.start.dateTime || wydarzenie.start.date);

      return {
        data: naFormatDaty_(start),
        nazwa: wydarzenie.summary,
        rodzaj: nazwyTypow[typ],
        godzina: wydarzenie.start.dateTime ? sformatujGodzine_(start) : '',
      };
    });
}


/** „tego samego dnia”, „dzień wcześniej”, „3 dni później”. */
function opiszOdleglosc_(roznica) {
  if (roznica === 0) {
    return 'tego samego dnia';
  }

  if (roznica === -1) {
    return 'dzień wcześniej';
  }

  if (roznica === 1) {
    return 'nazajutrz';
  }

  return Math.abs(roznica) + ' dni ' + (roznica < 0 ? 'wcześniej' : 'później');
}


// ─────────────────────────────────────────────────────────────────────────────
// Składanie pozycji
// ─────────────────────────────────────────────────────────────────────────────

function wpisySwiat_(rok) {
  const swieta = swietaRoku_(rok);

  return Object.keys(swieta).sort().map(function (klucz) {
    const czesci = klucz.split('-');
    const data = new Date(rok, Number(czesci[0]) - 1, Number(czesci[1]));

    return pozycja_('swieta', swieta[klucz], data, data,
      'Dzień ustawowo wolny od pracy.', true);
  });
}


/**
 * Dni mostkowe całego roku. Domyślnie odznaczone: to nie są dni wolne,
 * tylko takie, w których frekwencja bywa marna.
 */
function wpisyMostkow_(rok) {
  const swieta = swietaRoku_(rok);
  const wpisy = [];

  for (let dzien = new Date(rok, 0, 1); dzien.getFullYear() === rok;
       dzien = dodajDni_(dzien, 1)) {
    const mostek = opiszMostek_(dzien, swieta);

    if (mostek) {
      wpisy.push(pozycja_('mostki', 'Dzień mostkowy', dzien, dzien, mostek, false));
    }
  }

  return wpisy;
}


function wpisySzkolne_(rok) {
  const wielkanoc = wielkanoc_(rok);
  const wpisy = [];

  // Czwartek przed Wielkanocą aż do wtorku po niej.
  wpisy.push(pozycja_('szkolne', 'Wiosenna przerwa świąteczna',
    dodajDni_(wielkanoc, -3), dodajDni_(wielkanoc, 2),
    'Wyliczona z daty Wielkanocy.', true));

  wpisy.push(pozycja_('szkolne', 'Zakończenie zajęć w szkołach',
    zakonczenieZajec_(rok), zakonczenieZajec_(rok),
    'Reguła: ' + REGULY_SZKOLNE.zakonczenie + '.', true));

  wpisy.push(pozycja_('szkolne', 'Wakacje letnie',
    dodajDni_(zakonczenieZajec_(rok), 1), new Date(rok, 7, 31),
    'Od dnia po zakończeniu zajęć do końca sierpnia.', true));

  wpisy.push(pozycja_('szkolne', 'Rozpoczęcie roku szkolnego',
    rozpoczecieZajec_(rok), rozpoczecieZajec_(rok),
    'Reguła: 1 września, a gdy wypada w piątek albo sobotę – ' +
    REGULY_SZKOLNE.rozpoczecie + '.', true));

  wpisy.push(pozycja_('szkolne', 'Zimowa przerwa świąteczna',
    new Date(rok, 11, 23), new Date(rok, 11, 31),
    'Reguła: 23–31 grudnia.', true));

  return wpisy;
}


function wpisyWlasne_(rok) {
  return (KONFIG.wlasneWydarzenia || []).map(function (wydarzenie) {
    const od = new Date(rok, wydarzenie.miesiac - 1, wydarzenie.dzien);
    const doDnia = wydarzenie.ileDni > 1
      ? dodajDni_(od, wydarzenie.ileDni - 1)
      : od;

    return pozycja_('wlasne', wydarzenie.nazwa, od, doDnia,
      wydarzenie.uwaga || '', true);
  });
}


/** Zajęcia kończą się w najbliższy piątek po 20 czerwca. */
function zakonczenieZajec_(rok) {
  const dwudziesty = new Date(rok, 5, 20);
  const doPiatku = (5 - dwudziesty.getDay() + 7) % 7 || 7;

  return dodajDni_(dwudziesty, doPiatku);
}


/** 1 września, a gdy wypada w piątek albo sobotę – najbliższy poniedziałek. */
function rozpoczecieZajec_(rok) {
  const pierwszy = new Date(rok, 8, 1);
  const dzien = pierwszy.getDay();

  if (dzien === 5 || dzien === 6) {
    return dodajDni_(pierwszy, dzien === 5 ? 3 : 2);
  }

  return pierwszy;
}


function pozycja_(grupa, nazwa, od, doDnia, uwaga, wybrany) {
  const jedenDzien = naFormatDaty_(od) === naFormatDaty_(doDnia);

  return {
    grupa: grupa,
    nazwa: nazwa,
    od: naFormatDaty_(od),
    doDnia: naFormatDaty_(doDnia),
    opis: jedenDzien
      ? DNI_TYGODNIA[od.getDay()] + ', ' + sformatujDate_(od)
      : sformatujDate_(od) + ' – ' + sformatujDate_(doDnia),
    uwaga: uwaga,
    wybrany: wybrany,
  };
}


function odmienPozycje_(ile) {
  if (ile === 1) {
    return 'pozycję';
  }

  const ostatnia = ile % 10;
  const nastka = ile % 100;
  const kilka = ostatnia >= 2 && ostatnia <= 4 && (nastka < 12 || nastka > 14);

  return kilka ? 'pozycje' : 'pozycji';
}
