/**
 * Kto zwołuje i jak się podpisuje.
 *
 * Posiedzenia Zarządu Okręgu i Prezydium zwołuje prezes zarządu okręgu albo
 * upoważniony przez niego członek zarządu, odpowiednio wiceprezes
 * (§ 46 ust. 2, § 48 ust. 4). W praktyce robi to zwykle ta sama osoba, ale
 * nie zawsze ta sama — stąd wybór przy każdym zawiadomieniu, zamiast jednego
 * podpisu wpisanego na stałe.
 */

/**
 * Lista osób do wyboru w formularzu, razem ze wskazaniem domyślnej.
 * Wywoływane z przeglądarki przez google.script.run.
 */
function pobierzZwolujacych(idRodzaju) {
  const rodzaj = idRodzaju ? znajdzRodzajLubNic_(idRodzaju) : null;
  const osoby = listaOsob_(rodzaj);

  return {
    osoby: osoby.map(function (osoba) {
      return {
        id: osoba.id,
        imie: osoba.imie,
        funkcja: osoba.funkcja,
        etykieta: osoba.imie + ', ' + osoba.funkcja,
      };
    }),
    domyslny: osoby.length && osoby[0].id !== KONFIG.domyslnyZwolujacy &&
      !znajdzOsobe_(osoby, KONFIG.domyslnyZwolujacy)
      ? osoby[0].id
      : (KONFIG.domyslnyZwolujacy || ''),
    /** Czy to lista tego organu, czy podstawiona lista Zarządu Okręgu. */
    wlasna: Boolean(rodzaj && (rodzaj.zwolujacy || []).length),
  };
}


/**
 * Osoby uprawnione do zwołania. Organ, który zwołuje się sam (komisja
 * rewizyjna, sąd koleżeński, komisja problemowa), ma własną listę; dopóki
 * jest pusta, podstawiamy skład Zarządu i mówimy o tym w ostrzeżeniach.
 */
function listaOsob_(rodzaj) {
  const wlasne = (rodzaj && rodzaj.zwolujacy) ? rodzaj.zwolujacy : [];
  return wlasne.length ? wlasne : (KONFIG.zwolujacy || []);
}


function znajdzOsobe_(osoby, id) {
  for (let i = 0; i < osoby.length; i++) {
    if (osoby[i].id === id) {
      return osoby[i];
    }
  }

  return null;
}


/** Osoba po identyfikatorze; null, gdy lista jest pusta albo id nie pasuje. */
function znajdzZwolujacego_(id, rodzaj) {
  return znajdzOsobe_(listaOsob_(rodzaj), id);
}


/** Osoba domyślna, a gdy jej nie ma, pierwsza z listy. */
function domyslnyZwolujacy_(rodzaj) {
  const osoby = listaOsob_(rodzaj);
  return znajdzOsobe_(osoby, KONFIG.domyslnyZwolujacy) || osoby[0] || null;
}


/**
 * Podpis pod zawiadomieniem: formuła grzecznościowa, imię i nazwisko,
 * funkcja. Gdy nikogo nie wskazano — podpis zapasowy z konfiguracji.
 *
 * @param {string} idOsoby identyfikator z KONFIG.zwolujacy ('' = domyślna)
 * @return {string[]} kolejne wiersze podpisu
 */
function zlozPodpis_(idOsoby, rodzaj) {
  const osoba = (idOsoby && znajdzZwolujacego_(idOsoby, rodzaj)) ||
    domyslnyZwolujacy_(rodzaj);

  if (!osoba) {
    return KONFIG.podpis || [];
  }

  return [
    KONFIG.zwrotKoncowy || 'Z wędkarskim pozdrowieniem',
    osoba.imie,
    osoba.funkcja,
  ];
}


/**
 * Lista adresowa organu.
 *
 * Posiedzenie niejawne **nie dziedziczy** listy globalnej. Zawiadomienie
 * o sprawie przed Okręgowym Sądem Koleżeńskim nie ma prawa trafić do całego
 * Zarządu Okręgu razem z linkiem do obrad, a przy jednej wspólnej liście
 * właśnie to by się stało.
 */
function adresyRodzaju_(rodzaj) {
  if (!rodzaj) {
    return [];
  }

  const wlasne = (rodzaj.adresy || []).filter(String);

  if (wlasne.length) {
    return wlasne;
  }

  if (rodzaj.niejawne) {
    return [];
  }

  return (KONFIG.adresyDoWysylki || []).filter(String);
}


/** Dlaczego lista adresowa jest pusta – żeby komunikat mówił, co poprawić. */
function powodBrakuAdresow_(rodzaj) {
  if (rodzaj && rodzaj.niejawne) {
    return 'Posiedzenie jest niejawne, a ' + rodzaj.nazwa + ' nie ma własnej ' +
      'listy adresowej. Globalnej listy narzędzie tu nie użyje. Uzupełnij pole ' +
      '`adresy` przy tym rodzaju w pliku Konfiguracja.gs albo roześlij ' +
      'zawiadomienie ręcznie.';
  }

  return 'Lista adresowa jest pusta. Uzupełnij KONFIG.adresyDoWysylki ' +
    'w pliku Konfiguracja.gs.';
}


/**
 * Zwrot otwierający. Zarząd Okręgu i Prezydium są w całości męskie, więc
 * domyślna forma też; gremia o szerszym składzie mają własny zwrot przy
 * swoim rodzaju posiedzenia.
 */
function zwrotPowitalnyRodzaju_(rodzaj) {
  if (rodzaj && rodzaj.zwrotPowitalny) {
    return rodzaj.zwrotPowitalny;
  }

  return KONFIG.zwrotPowitalny;
}
