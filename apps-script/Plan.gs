/**
 * Plan roczny posiedzeń.
 *
 * Statut narzuca rytm, ale nie daty: Zarząd Okręgu obraduje nie rzadziej niż
 * raz na kwartał (§ 46 ust. 1), Prezydium nie rzadziej niż raz w miesiącu
 * (§ 48 ust. 1). Narzędzie proponuje terminy na cały rok według tego rytmu
 * i preferowanego dnia tygodnia, omijając dni ustawowo wolne.
 *
 * Plan to **wpisy całodniowe**, a nie prawdziwe posiedzenia. Nie mają linku
 * Meet ani zawiadomienia; są zapowiedzią w kalendarzu. Kiedy zwołujesz
 * posiedzenie na zaplanowany dzień, wpis planu znika sam.
 */

/** Typ wpisu w kalendarzu, po którym poznajemy plan. */
const TYP_PLANU = 'plan';


/**
 * Proponuje terminy, niczego nie zapisując. Zawsze obejrzyj listę, zanim
 * wpuścisz ją do kalendarza.
 *
 * @param {{rodzaj: string, rok: number, dzienTygodnia: number,
 *          ktoryTydzien: number}} dane
 */
function zaproponujPlan(dane) {
  const rodzaj = znajdzRodzaj_(dane.rodzaj);

  if (!rodzaj.cyklMiesiecy) {
    throw new Error(
      rodzaj.nazwa + ' nie ma cyklu narzuconego Statutem, więc nie ma czego ' +
      'planować z góry.'
    );
  }

  const rok = Number(dane.rok) || new Date().getFullYear();
  const dzien = liczbaLubDomyslna_(dane.dzienTygodnia, KONFIG.preferowanyDzienTygodnia);
  const ktory = liczbaLubDomyslna_(dane.ktoryTydzien, KONFIG.ktoryTydzienMiesiaca);
  const zajete = miesiaceZajete_(rodzaj.id, rok);

  const terminy = [];

  for (let miesiac = 0; miesiac < 12; miesiac += rodzaj.cyklMiesiecy) {
    const data = wybierzDzien_(rok, miesiac, dzien, ktory);
    const swieto = opiszDzienWolny_(data);

    terminy.push({
      data: naFormatDaty_(data),
      opis: DNI_TYGODNIA[data.getDay()] + ', ' + sformatujDate_(data),
      miesiac: MIESIACE_MIANOWNIK[miesiac],
      uwaga: swieto || '',
      zajety: Boolean(zajete[miesiac]),
      wybrany: !swieto && !zajete[miesiac],
    });
  }

  return {
    rodzaj: rodzaj.id,
    nazwa: rodzaj.nazwa,
    cykl: opiszCykl_(rodzaj.cyklMiesiecy),
    rok: rok,
    terminy: terminy,
  };
}


/**
 * Zakłada wpisy planu dla wskazanych dat.
 *
 * @param {{rodzaj: string, daty: string[]}} dane
 */
function utworzPlan(dane) {
  const rodzaj = znajdzRodzaj_(dane.rodzaj);
  const daty = (dane.daty || []).filter(String);

  if (!daty.length) {
    throw new Error('Nie zaznaczono żadnego terminu.');
  }

  let zalozonych = 0;

  daty.forEach(function (tekst) {
    const data = zbudujDate_(tekst, '00:00');

    Calendar.Events.insert({
      summary: 'Planowane: ' + rodzaj.nazwa,
      description:
        'Zapowiedź terminu, nie zwołane posiedzenie.\n\n' +
        rodzaj.czestotliwosc + '\nZwołuje: ' + rodzaj.zwoluje +
        '\n\nGdy zwołasz posiedzenie na ten dzień, ten wpis zniknie sam.\n\n' +
        KONFIG.okreg.nazwa,
      start: { date: naFormatDaty_(data) },
      end: { date: naFormatDaty_(dodajDni_(data, 1)) },
      transparency: 'transparent',
      extendedProperties: {
        private: { zrodlo: ZNACZNIK_NARZEDZIA, typ: TYP_PLANU, rodzaj: rodzaj.id },
      },
    }, KONFIG.idKalendarza);

    zalozonych++;
  });

  return {
    zalozonych: zalozonych,
    komunikat: 'Wpisano ' + zalozonych + ' ' + odmienTerminy_(zalozonych) +
      ' do kalendarza. To zapowiedzi, nie zwołane posiedzenia.',
  };
}


/**
 * Kasuje zapowiedź, gdy posiedzenie tego rodzaju faktycznie zostaje zwołane
 * na ten sam dzień. Bez tego kalendarz pokazywałby dwa wpisy o jednym
 * posiedzeniu.
 */
function usunWpisPlanu_(rodzaj, start) {
  const dzien = new Date(start.getFullYear(), start.getMonth(), start.getDate());

  try {
    const odpowiedz = Calendar.Events.list(KONFIG.idKalendarza, {
      timeMin: dzien.toISOString(),
      timeMax: dodajDni_(dzien, 1).toISOString(),
      privateExtendedProperty: 'zrodlo=' + ZNACZNIK_NARZEDZIA,
      singleEvents: true,
      maxResults: 25,
    });

    (odpowiedz.items || []).forEach(function (wydarzenie) {
      const wlasciwosci = (wydarzenie.extendedProperties || {}).private || {};

      if (wlasciwosci.typ === TYP_PLANU && wlasciwosci.rodzaj === rodzaj.id) {
        Calendar.Events.remove(KONFIG.idKalendarza, wydarzenie.id);
      }
    });
  } catch (blad) {
    // Sprzątanie zapowiedzi nie jest powodem, żeby przerywać zwoływanie.
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// Wybór dat
// ─────────────────────────────────────────────────────────────────────────────

/**
 * N-ty dzień tygodnia w miesiącu, na przykład drugi czwartek.
 * `ktory` ujemny liczy od końca: -1 to ostatni taki dzień.
 */
function wybierzDzien_(rok, miesiac, dzienTygodnia, ktory) {
  if (ktory < 0) {
    const ostatni = new Date(rok, miesiac + 1, 0);
    const cofnij = (ostatni.getDay() - dzienTygodnia + 7) % 7;
    return new Date(rok, miesiac, ostatni.getDate() - cofnij);
  }

  const pierwszy = new Date(rok, miesiac, 1);
  const przesun = (dzienTygodnia - pierwszy.getDay() + 7) % 7;

  return new Date(rok, miesiac, 1 + przesun + (Math.max(ktory, 1) - 1) * 7);
}


/** Miesiące, w których posiedzenie tego rodzaju już jest w kalendarzu. */
function miesiaceZajete_(idRodzaju, rok) {
  const zajete = {};

  try {
    const wydarzenia = wypiszPosiedzeniaZKalendarza_(
      new Date(rok, 0, 1), new Date(rok + 1, 0, 1)
    );

    wydarzenia.forEach(function (wpis) {
      if (wpis.rodzaj === idRodzaju) {
        zajete[wpis.start.getMonth()] = true;
      }
    });
  } catch (blad) {
    // Brak dostępu do historii nie może zablokować propozycji planu.
  }

  return zajete;
}


function liczbaLubDomyslna_(wartosc, domyslna) {
  const liczba = Number(wartosc);
  return isNaN(liczba) ? domyslna : liczba;
}


function odmienTerminy_(ile) {
  if (ile === 1) {
    return 'termin';
  }

  const ostatnia = ile % 10;
  const nastka = ile % 100;
  const kilka = ostatnia >= 2 && ostatnia <= 4 && (nastka < 12 || nastka > 14);

  return kilka ? 'terminy' : 'terminów';
}
