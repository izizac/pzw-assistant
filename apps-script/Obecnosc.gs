/**
 * Lista obecności odklikiwana na posiedzeniu.
 *
 * Odpowiedzi z kalendarza to deklaracja sprzed posiedzenia i nie zastąpią
 * listy obecności: ludzie siedzą w jednej sali, często przy jednym komputerze,
 * a ktoś, kto przyjął zaproszenie, może nie dojechać. Statut liczy obecnych,
 * nie zaproszonych — przy uchwałach z § 47 pkt 14 trzeba 2/3 składu organu
 * na sali.
 *
 * Zaznaczenia trzymamy przy samym wydarzeniu, w `extendedProperties`, żeby
 * przetrwały zamknięcie karty i były widoczne z każdego komputera.
 */

/** Klucz, pod którym lista obecności siedzi przy wydarzeniu. */
const WLASCIWOSC_OBECNOSCI = 'obecni';


/**
 * Skład organu do odklikania wraz z zapisanymi zaznaczeniami.
 * Wywoływane z przeglądarki.
 *
 * @param {string} idWydarzenia
 * @return {{tytul: string, organ: string, czlonkowie: Object[],
 *           obecnych: number, sklad: number, werdykt: string, pilne: boolean}}
 */
function pobierzListeObecnosci(idWydarzenia) {
  const wydarzenie = wczytajPosiedzenie_(idWydarzenia);
  const rodzaj = znajdzRodzajLubNic_(wlasciwosciPrywatne_(wydarzenie).rodzaj);
  const zaznaczeni = odczytajObecnych_(wydarzenie);
  const sklad = skladOrganu_(rodzaj);

  const czlonkowie = sklad.map(function (osoba) {
    return {
      id: osoba.id,
      imie: osoba.imie,
      funkcja: osoba.funkcja,
      obecny: zaznaczeni.indexOf(osoba.id) !== -1,
    };
  });

  const obecnych = czlonkowie.filter(function (o) { return o.obecny; }).length;

  return {
    tytul: wydarzenie.summary,
    organ: rodzaj ? rodzaj.nazwa : '',
    czlonkowie: czlonkowie,
    obecnych: obecnych,
    sklad: liczebnoscOrganu_(rodzaj, sklad),
    werdykt: ocenObecnosc_(rodzaj, obecnych, liczebnoscOrganu_(rodzaj, sklad)),
    pilne: brakKworum_(rodzaj, obecnych, liczebnoscOrganu_(rodzaj, sklad)),
  };
}


/**
 * Zapisuje zaznaczenia i zwraca przeliczony werdykt.
 *
 * @param {{id: string, obecni: string[]}} dane
 */
function zapiszObecnosc(dane) {
  const wydarzenie = wczytajPosiedzenie_(dane.id);
  const rodzaj = znajdzRodzajLubNic_(wlasciwosciPrywatne_(wydarzenie).rodzaj);
  const obecni = (dane.obecni || []).filter(String);
  const liczebnosc = liczebnoscOrganu_(rodzaj, skladOrganu_(rodzaj));

  Calendar.Events.patch({
    extendedProperties: {
      private: (function () {
        const wlasciwosci = wlasciwosciPrywatne_(wydarzenie);
        wlasciwosci[WLASCIWOSC_OBECNOSCI] = obecni.join(',');
        return wlasciwosci;
      })(),
    },
  }, KONFIG.idKalendarza, dane.id);

  return {
    obecnych: obecni.length,
    sklad: liczebnosc,
    werdykt: ocenObecnosc_(rodzaj, obecni.length, liczebnosc),
    pilne: brakKworum_(rodzaj, obecni.length, liczebnosc),
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// Skład organu
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Imienny skład organu. Gdy rodzaj posiedzenia nie ma własnego, bierzemy
 * Zarząd Okręgu — Prezydium i komisje wybiera się spośród jego członków.
 */
function skladOrganu_(rodzaj) {
  const wlasny = rodzaj && rodzaj.czlonkowie;

  if (wlasny && wlasny.length) {
    return wlasny;
  }

  return KONFIG.zwolujacy || [];
}


/**
 * Liczebność, do której odnosimy kworum. Statut mówi o składzie organu,
 * a ten bywa większy niż lista nazwisk, którą mamy wpisaną.
 */
function liczebnoscOrganu_(rodzaj, sklad) {
  return (rodzaj && rodzaj.sklad) || sklad.length;
}


// ─────────────────────────────────────────────────────────────────────────────
// Kworum
// ─────────────────────────────────────────────────────────────────────────────

function ocenObecnosc_(rodzaj, obecnych, liczebnosc) {
  if (!liczebnosc) {
    return 'Obecnych: ' + odmienOsoby_(obecnych) +
      '. Skład tego organu nie jest wpisany, więc kworum oceń samodzielnie.';
  }

  const zwykle = Math.floor(liczebnosc / 2) + 1;
  const zdania = ['Obecnych ' + obecnych + ' na ' + liczebnosc +
    ' członków organu.'];

  zdania.push(obecnych >= zwykle
    ? 'Zwykła większość składu (' + zwykle + ') jest.'
    : 'Do zwykłej większości brakuje ' +
      odmienOsoby_(zwykle - obecnych) + '.');

  if (rodzaj && rodzaj.kworumUlamek) {
    const potrzeba = kworumKwalifikowane_(rodzaj);

    zdania.push(obecnych >= potrzeba.obecni
      ? 'Uchwały z kworum kwalifikowanym też przejdą: wymagają ' +
        potrzeba.obecni + ' obecnych i ' + potrzeba.za + ' ' +
        odmienGlosy_(potrzeba.za) + ' za.'
      : 'Na uchwały z kworum kwalifikowanym za mało: potrzeba ' +
        potrzeba.obecni + ' obecnych (§ 47 pkt 14).');
  }

  return zdania.join(' ');
}


function brakKworum_(rodzaj, obecnych, liczebnosc) {
  return Boolean(liczebnosc) && obecnych < Math.floor(liczebnosc / 2) + 1;
}


// ─────────────────────────────────────────────────────────────────────────────
// Zapis przy wydarzeniu
// ─────────────────────────────────────────────────────────────────────────────

function odczytajObecnych_(wydarzenie) {
  const zapis = wlasciwosciPrywatne_(wydarzenie)[WLASCIWOSC_OBECNOSCI] || '';
  return zapis ? zapis.split(',') : [];
}
