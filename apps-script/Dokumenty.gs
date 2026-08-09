/**
 * Dokumenty posiedzenia – folder na materiały, protokół, lista obecności
 * i pisemne zawiadomienie do druku.
 *
 * Wszystko tutaj to **dodatki** (patrz Dodatki.gs): powstaje po utworzeniu
 * posiedzenia, osobnymi wywołaniami, i żadna awaria Dysku ani Dokumentów
 * nie ma prawa dotknąć samego wydarzenia. Każda funkcja `zaloz…_` zwraca
 * `{komunikat, link}` albo rzuca wyjątkiem, który łapie runner dodatków.
 *
 * Dokumenty lądują w folderze posiedzenia, jeśli ten już powstał; inaczej
 * w katalogu głównym Dysku.
 */

/** Nagłówek, po którym poznajemy porządek obrad w treści zawiadomienia. */
const NAGLOWEK_PORZADKU = 'Proponowany porządek obrad:';

/** Ile pustych wierszy dać na liście obecności, gdy skład organu jest nieznany. */
const WIERSZY_BEZ_SKLADU = 15;


// ─────────────────────────────────────────────────────────────────────────────
// Folder na materiały
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Folder na dokumenty, które trzeba rozesłać przed obradami. Przy zjeździe
 * to nie wygoda, tylko wymóg – § 41 ust. 2 każe załączyć sprawozdanie
 * i pozostałe dokumenty będące tematem obrad.
 *
 * Folder powstaje prywatny. Dostęp nadajesz sam, na Dysku – narzędzie nie
 * rozdaje uprawnień do dokumentów Okręgu za Ciebie.
 */
function zalozFolderMaterialow_(wydarzenie) {
  const start = new Date(wydarzenie.start.dateTime);
  const nazwa = naFormatDaty_(start) + ' – ' + wydarzenie.summary;

  const rodzic = KONFIG.idFolderuNadrzednego
    ? DriveApp.getFolderById(KONFIG.idFolderuNadrzednego)
    : DriveApp.getRootFolder();

  const folder = rodzic.createFolder(nazwa);

  return {
    link: folder.getUrl(),
    komunikat: 'Folder jest prywatny – udostępnij go odbiorcom albo załącz ' +
      'dokumenty do maila.',
  };
}


/**
 * Folder tego posiedzenia albo null. Identyfikator wyłuskujemy z odnośnika,
 * który sami wcześniej zapisaliśmy – `folder.getUrl()` daje zawsze
 * `…/drive/folders/<identyfikator>`.
 */
function folderPosiedzenia_(wydarzenie) {
  const znacznik = wlasciwosciPrywatne_(wydarzenie)[ZNACZNIK_DODATKU + 'folder'];
  const dopasowanie = /\/folders\/([-\w]+)/.exec(String(znacznik || ''));

  if (!dopasowanie) {
    return null;
  }

  try {
    return DriveApp.getFolderById(dopasowanie[1]);
  } catch (blad) {
    // Folder mógł zostać skasowany ręcznie – dokument trafi do katalogu
    // głównego, co jest lepsze niż przerwana operacja.
    return null;
  }
}


/** Przenosi świeży dokument do folderu posiedzenia, jeśli taki istnieje. */
function odloz_(dokument, wydarzenie) {
  const folder = folderPosiedzenia_(wydarzenie);

  if (folder) {
    DriveApp.getFileById(dokument.getId()).moveTo(folder);
  }

  return dokument.getUrl();
}


// ─────────────────────────────────────────────────────────────────────────────
// Protokół
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Szkielet protokołu. Punkt „przyjęcie protokołu z poprzedniego posiedzenia”
 * stoi w porządku obrad każdego organu Okręgu, więc protokół i tak musi
 * powstać – narzędzie zna już termin, miejsce i porządek, więc składa
 * rusztowanie, a zostaje wpisać przebieg i uchwały.
 */
function zalozProtokol_(wydarzenie, rodzaj) {
  const start = new Date(wydarzenie.start.dateTime);
  const koniec = new Date(wydarzenie.end.dateTime);
  const porzadek = wyciagnijPorzadek_(wydarzenie.description, rodzaj);

  const dokument = DocumentApp.create(
    'Protokół – ' + wydarzenie.summary + ' – ' + naFormatDaty_(start)
  );

  const cialo = dokument.getBody();
  const pusty = cialo.getParagraphs()[0];

  naglowekJednostki_(cialo);

  cialo.appendParagraph('PROTOKÓŁ')
    .setHeading(DocumentApp.ParagraphHeading.TITLE)
    .setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  cialo.appendParagraph('z ' + nazwaWZdaniu_(rodzaj, wydarzenie.summary))
    .setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  cialo.appendParagraph(
    'odbytego ' + DNI_W_ZDANIU[start.getDay()] + ', ' + sformatujDate_(start) +
    ', w godzinach ' + sformatujGodzine_(start) + '–' + sformatujGodzine_(koniec) + '.'
  );

  cialo.appendParagraph(opiszTrybObrad_(wydarzenie));

  cialo.appendParagraph('Obecni')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  cialo.appendParagraph(
    'Obecnych …… na ' + (rodzaj && rodzaj.sklad ? rodzaj.sklad : '……') +
    ' członków. Lista obecności stanowi załącznik do protokołu.'
  );

  cialo.appendParagraph('Ponadto w posiedzeniu uczestniczyli: ……');

  const kworum = rodzaj ? opiszKworum_(rodzaj) : '';

  if (kworum) {
    cialo.appendParagraph(kworum).editAsText().setItalic(true);
  }

  cialo.appendParagraph('Porządek obrad')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  wypiszPunkty_(cialo, porzadek);

  cialo.appendParagraph('Przebieg posiedzenia')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  if (porzadek.length) {
    porzadek.forEach(function (punkt) {
      cialo.appendParagraph(punkt)
        .setHeading(DocumentApp.ParagraphHeading.HEADING3);
      cialo.appendParagraph('……');
    });
  } else {
    cialo.appendParagraph('……');
  }

  cialo.appendParagraph('Uchwały podjęte na posiedzeniu')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  const uchwaly = cialo.appendTable([
    ['Numer uchwały', 'Przedmiot', 'Za / przeciw / wstrzym.'],
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ]);

  uchwaly.getRow(0).editAsText().setBold(true);

  if (rodzaj && rodzaj.dopiskFormalny) {
    cialo.appendParagraph(rodzaj.dopiskFormalny).editAsText().setItalic(true);
  }

  cialo.appendParagraph('Podpisy')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  const podpisy = cialo.appendTable([
    ['Protokolant', 'Przewodniczący posiedzenia'],
    ['\n\n……………………………………', '\n\n……………………………………'],
  ]);

  podpisy.getRow(0).editAsText().setBold(true);

  stopkaDokumentu_(cialo, rodzaj);

  if (pusty) {
    pusty.removeFromParent();
  }

  dokument.saveAndClose();

  const link = odloz_(dokument, wydarzenie);
  return { link: link, komunikat: 'Porządek obrad: ' + porzadek.length + ' pkt' };
}


// ─────────────────────────────────────────────────────────────────────────────
// Lista obecności
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lista obecności z rubrykami na podpisy. Uchwały i wybory wymagają podpisanej
 * listy, a przy zjeździe także głosowania tajnego – spotkanie w Meet tego nie
 * zastępuje i narzędzie ostrzega o tym już przy zwoływaniu.
 *
 * Nazwisk nie wpisujemy: skład organu bywa inny niż lista adresowa, a lista
 * i tak idzie do podpisu na papierze.
 */
function zalozListeObecnosci_(wydarzenie, rodzaj) {
  const start = new Date(wydarzenie.start.dateTime);
  const wierszy = (rodzaj && rodzaj.sklad) ? rodzaj.sklad : WIERSZY_BEZ_SKLADU;

  const dokument = DocumentApp.create(
    'Lista obecności – ' + wydarzenie.summary + ' – ' + naFormatDaty_(start)
  );

  const cialo = dokument.getBody();
  const pusty = cialo.getParagraphs()[0];

  naglowekJednostki_(cialo);

  cialo.appendParagraph('LISTA OBECNOŚCI')
    .setHeading(DocumentApp.ParagraphHeading.TITLE)
    .setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  cialo.appendParagraph('na ' + nazwaWZdaniu_(rodzaj, wydarzenie.summary))
    .setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  cialo.appendParagraph(
    dzienBezPrzyimka_(start) + ', ' + sformatujDate_(start) +
    ', godzina ' + sformatujGodzine_(start) + '.'
  ).setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  cialo.appendParagraph(opiszTrybObrad_(wydarzenie));

  const wiersze = [['Lp.', 'Imię i nazwisko', 'Funkcja', 'Podpis']];

  for (let i = 1; i <= wierszy; i++) {
    wiersze.push([String(i) + '.', '', '', '']);
  }

  const tabela = cialo.appendTable(wiersze);
  tabela.getRow(0).editAsText().setBold(true);

  if (rodzaj && rodzaj.sklad) {
    cialo.appendParagraph(
      'Skład organu: ' + rodzaj.sklad + ' osób. Obecnych: ……'
    );
  }

  const kworum = rodzaj ? opiszKworum_(rodzaj) : '';

  if (kworum) {
    cialo.appendParagraph(kworum).editAsText().setItalic(true);
  }

  cialo.appendParagraph('\nPrawidłowość listy potwierdzam:');
  cialo.appendParagraph('\n\n……………………………………')
    .setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
  cialo.appendParagraph('Przewodniczący posiedzenia')
    .setAlignment(DocumentApp.HorizontalAlignment.RIGHT);

  stopkaDokumentu_(cialo, rodzaj);

  if (pusty) {
    pusty.removeFromParent();
  }

  dokument.saveAndClose();

  return {
    link: odloz_(dokument, wydarzenie),
    komunikat: 'Rubryk na podpisy: ' + wierszy,
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// Pisemne zawiadomienie do druku
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Zawiadomienie na blankiecie, do podpisu i wysyłki pocztą.
 *
 * O okręgowym zjeździe delegatów zarząd okręgu zawiadamia delegatów i zarządy
 * kół **na piśmie**, co najmniej na 21 dni przed zjazdem, załączając
 * sprawozdanie z działalności oraz pozostałe dokumenty i wnioski będące
 * tematem obrad (§ 41 ust. 2). Mail tego wymogu nie wyczerpuje.
 *
 * Treść bierzemy z opisu wydarzenia, czyli z tego, co faktycznie rozesłano –
 * pismo i mail nie mogą się różnić.
 */
function zalozPismoDoDruku_(wydarzenie, rodzaj) {
  const start = new Date(wydarzenie.start.dateTime);

  const dokument = DocumentApp.create(
    'Zawiadomienie – ' + wydarzenie.summary + ' – ' + naFormatDaty_(start)
  );

  const cialo = dokument.getBody();
  const pusty = cialo.getParagraphs()[0];

  naglowekJednostki_(cialo);

  cialo.appendParagraph(
    KONFIG.okreg.miejscowosc + ', dnia ' + sformatujDate_(dzisiaj_())
  ).setAlignment(DocumentApp.HorizontalAlignment.RIGHT);

  cialo.appendParagraph('\nDelegaci na Okręgowy Zjazd Delegatów\nZarządy Kół Okręgu')
    .setAlignment(DocumentApp.HorizontalAlignment.RIGHT);

  cialo.appendParagraph('ZAWIADOMIENIE')
    .setHeading(DocumentApp.ParagraphHeading.TITLE)
    .setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  const tresc = wydarzenie.description || '';

  if (tresc) {
    tresc.split('\n').forEach(function (wiersz) {
      cialo.appendParagraph(wiersz);
    });
  } else {
    cialo.appendParagraph(
      'Treści zawiadomienia nie ma w opisie wydarzenia – wklej ją tutaj ręcznie.'
    );
  }

  const zalaczniki = (rodzaj && rodzaj.zalaczniki) ? rodzaj.zalaczniki : [];

  if (zalaczniki.length) {
    cialo.appendParagraph('Załączniki')
      .setHeading(DocumentApp.ParagraphHeading.HEADING2);

    zalaczniki.forEach(function (zalacznik, numer) {
      cialo.appendParagraph((numer + 1) + '. ' + zalacznik);
    });
  }

  stopkaDokumentu_(cialo, rodzaj);

  if (pusty) {
    pusty.removeFromParent();
  }

  dokument.saveAndClose();

  return {
    link: odloz_(dokument, wydarzenie),
    komunikat: zalaczniki.length
      ? 'Wykaz załączników: ' + zalaczniki.length + ' pozycji – dołącz je do przesyłki'
      : 'Sprawdź wykaz załączników przed wysyłką',
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// Wspólne kawałki dokumentów
// ─────────────────────────────────────────────────────────────────────────────

function naglowekJednostki_(cialo) {
  const naglowek = cialo.appendParagraph(KONFIG.okreg.nazwa);
  naglowek.setAlignment(DocumentApp.HorizontalAlignment.LEFT);
  naglowek.editAsText().setFontSize(10);

  const adres = cialo.appendParagraph(KONFIG.okreg.adres);
  adres.setAlignment(DocumentApp.HorizontalAlignment.LEFT);
  adres.editAsText().setFontSize(9).setForegroundColor('#666666');
}


function stopkaDokumentu_(cialo, rodzaj) {
  const stopka = cialo.appendParagraph(
    (rodzaj ? 'Podstawa zwołania: ' + rodzaj.podstawa + '. ' : '') +
    KONFIG.okreg.nazwa + ', kadencja ' + KONFIG.kadencja + '.'
  );

  stopka.editAsText().setFontSize(8).setForegroundColor('#666666');
}


function opiszTrybObrad_(wydarzenie) {
  if (!wydarzenie.location) {
    return 'Obrady odbyły się zdalnie, przez Google Meet.';
  }

  return wyciagnijLink_(wydarzenie)
    ? 'Miejsce obrad: ' + wydarzenie.location + ', oraz zdalnie, przez Google Meet.'
    : 'Miejsce obrad: ' + wydarzenie.location + '.';
}


function wypiszPunkty_(cialo, punkty) {
  if (!punkty.length) {
    cialo.appendParagraph('……');
    return;
  }

  punkty.forEach(function (punkt) {
    cialo.appendParagraph(punkt);
  });
}


/**
 * Porządek obrad z opisu wydarzenia – bierzemy ten, który faktycznie
 * rozesłano, a nie szkic z konfiguracji. Gdy opisu nie ma, wracamy do szkicu.
 */
function wyciagnijPorzadek_(opis, rodzaj) {
  const domyslny = (rodzaj && rodzaj.porzadek) ? rodzaj.porzadek : [];

  if (!opis) {
    return domyslny;
  }

  const wiersze = String(opis).split('\n');
  const poczatek = wiersze.indexOf(NAGLOWEK_PORZADKU);

  if (poczatek === -1) {
    return domyslny;
  }

  const punkty = [];

  for (let i = poczatek + 1; i < wiersze.length; i++) {
    const wiersz = wiersze[i].trim();

    if (!wiersz) {
      break;
    }

    punkty.push(wiersz);
  }

  return punkty.length ? punkty : domyslny;
}
