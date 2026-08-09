/**
 * Goście wydarzenia i frekwencja.
 *
 * Dopisanie członków jako gości kalendarza daje jedną rzecz, której nie da
 * żadna wersja robocza maila: odpowiedzi wracają do wydarzenia. Dzięki temu
 * przed posiedzeniem widać, czy zbierze się kworum – a przy Zarządzie Okręgu
 * to nie ciekawostka, bo uchwały z § 47 pkt 14 wymagają obecności co najmniej
 * 2/3 członków.
 *
 * To dodatek, nie ścieżka krytyczna (patrz Dodatki.gs). Kto woli sam panować
 * nad korespondencją, po prostu go nie włącza i zostaje przy UDW.
 */

/** Odpowiedzi gościa w Kalendarzu Google, po ludzku. */
const STANY_ODPOWIEDZI = {
  accepted: 'potwierdzili',
  declined: 'odmówili',
  tentative: 'być może',
  needsAction: 'bez odpowiedzi',
};


/**
 * Dopisuje listę adresową organu do gości wydarzenia. Dotychczasowych gości
 * zachowujemy – łatka na `attendees` podmienia całą listę, więc trzeba ją
 * scalić, zamiast nadpisać.
 */
function dopiszGosci_(wydarzenie, rodzaj) {
  const adresy = adresyRodzaju_(rodzaj);

  if (!adresy.length) {
    return { komunikat: 'Brak listy adresowej dla tego organu' };
  }

  const obecni = wydarzenie.attendees || [];
  const znane = {};

  obecni.forEach(function (gosc) {
    znane[String(gosc.email).toLowerCase()] = true;
  });

  const nowi = adresy.filter(function (adres) {
    return !znane[String(adres).toLowerCase()];
  });

  if (!nowi.length) {
    return { komunikat: 'Wszyscy byli już zaproszeni' };
  }

  const lista = obecni.concat(nowi.map(function (adres) {
    return { email: adres };
  }));

  Calendar.Events.patch(
    { attendees: lista },
    KONFIG.idKalendarza,
    wydarzenie.id,
    { sendUpdates: KONFIG.powiadamiajGosci ? 'all' : 'none' }
  );

  return {
    komunikat: 'Zaproszono ' + odmienOsoby_(nowi.length) +
      (KONFIG.powiadamiajGosci ? '' : ' (bez powiadomienia mailem)'),
  };
}


/**
 * Kto potwierdził udział i czy to wystarczy do kworum.
 * Wywoływane z przeglądarki dla wybranego posiedzenia.
 */
function pobierzFrekwencje(idWydarzenia) {
  const wydarzenie = wczytajPosiedzenie_(idWydarzenia);
  const rodzaj = znajdzRodzajLubNic_(wlasciwosciPrywatne_(wydarzenie).rodzaj);
  const goscie = wydarzenie.attendees || [];

  if (!goscie.length) {
    return {
      tytul: wydarzenie.summary,
      zaproszonych: 0,
      pozycje: [],
      werdykt: 'Do tego wydarzenia nie zaproszono nikogo przez kalendarz, ' +
        'więc nie ma odpowiedzi do policzenia.',
      pilne: false,
    };
  }

  const liczniki = { accepted: 0, declined: 0, tentative: 0, needsAction: 0 };

  goscie.forEach(function (gosc) {
    const stan = gosc.responseStatus || 'needsAction';
    liczniki[stan] = (liczniki[stan] || 0) + 1;
  });

  const pozycje = Object.keys(STANY_ODPOWIEDZI).map(function (klucz) {
    return { nazwa: STANY_ODPOWIEDZI[klucz], ile: liczniki[klucz] || 0 };
  });

  return {
    tytul: wydarzenie.summary,
    zaproszonych: goscie.length,
    pozycje: pozycje,
    werdykt: ocenKworum_(rodzaj, liczniki.accepted),
    pilne: czyKworumZagrozone_(rodzaj, liczniki.accepted),
  };
}


/**
 * Zdanie o tym, czy potwierdzenia wystarczą. Liczymy do składu organu,
 * a nie do liczby zaproszonych – lista adresowa bywa niepełna, a Statut
 * mówi o członkach organu.
 */
function ocenKworum_(rodzaj, potwierdzilo) {
  if (!rodzaj || !rodzaj.sklad) {
    return 'Potwierdziło ' + odmienOsoby_(potwierdzilo) +
      '. Skład tego organu nie jest wpisany w konfiguracji, więc kworum ' +
      'trzeba ocenić samodzielnie.';
  }

  const zwykle = Math.floor(rodzaj.sklad / 2) + 1;
  const zdania = [
    'Potwierdziło ' + odmienOsoby_(potwierdzilo) + ' na ' + rodzaj.sklad +
      ' członków organu.',
    'Zwykła większość składu to ' + zwykle + '.',
  ];

  if (rodzaj.kworumUlamek) {
    const kwalifikowane = kworumKwalifikowane_(rodzaj);

    zdania.push(
      'Uchwały wymagające kworum kwalifikowanego potrzebują ' +
      kwalifikowane.obecni + ' obecnych i ' + kwalifikowane.za + ' ' +
      odmienGlosy_(kwalifikowane.za) + ' za.'
    );
  }

  return zdania.join(' ');
}


function czyKworumZagrozone_(rodzaj, potwierdzilo) {
  if (!rodzaj || !rodzaj.sklad) {
    return false;
  }

  return potwierdzilo < Math.floor(rodzaj.sklad / 2) + 1;
}


function odmienOsoby_(ile) {
  if (ile === 1) {
    return '1 osoba';
  }

  const ostatnia = ile % 10;
  const nastka = ile % 100;
  const kilka = ostatnia >= 2 && ostatnia <= 4 && (nastka < 12 || nastka > 14);

  return ile + (kilka ? ' osoby' : ' osób');
}
