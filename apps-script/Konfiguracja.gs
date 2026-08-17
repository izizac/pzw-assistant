/**
 * KONFIGURACJA — to jedyny plik, który normalnie edytujesz.
 *
 * Zmiany zapisują się od razu; nie trzeba nic wdrażać ponownie,
 * chyba że zmieniasz uprawnienia lub dodajesz nowe pliki.
 *
 * Niżej, pod obiektem KONFIG, siedzi tablica RODZAJE_POSIEDZEN. Odwzorowuje
 * Statut Polskiego Związku Wędkarskiego (tekst jednolity z 15 marca 2017 r.),
 * rozdział V „Okręgi Związku” — częstotliwość posiedzeń, terminy zawiadomień
 * i szkice porządku obrad. Zwykle nie ma potrzeby jej ruszać.
 */

const KONFIG = {

  // ─── Okręg ────────────────────────────────────────────────────────────────

  okreg: {
    /** Pełna nazwa — do tytułu wydarzenia i nagłówka zawiadomienia. */
    nazwa: 'Okręg Mazowiecki Polskiego Związku Wędkarskiego w Warszawie',

    /**
     * Ta sama nazwa w dopełniaczu — do zdań typu „posiedzenie Zarządu Okręgu
     * Mazowieckiego… ”. Trzymamy ją osobno, bo polszczyzny nie da się odmienić
     * regułką.
     */
    nazwaDopelniacz: 'Okręgu Mazowieckiego Polskiego Związku Wędkarskiego w Warszawie',

    /**
     * Skrócony dopełniacz do zdania zwołującego — pełna nazwa ciągnięta przez
     * każde zdanie robi się nieczytelna, a i tak stoi w stopce.
     */
    nazwaDopelniaczKrotka: 'Okręgu Mazowieckiego PZW',

    skrot: 'OM PZW',
    adres: 'ul. Retmańska 75, 05-140 Serock',

    /** Miejscowość do daty na pismach: „Serock, dnia 15 września 2026 r.”. */
    miejscowosc: 'Serock',
    telefony: ['22 620 50 83', '22 654 57 05'],
    strona: 'https://ompzw.pl',

    /**
     * Godło Okręgu — trafia na ikonę karty przeglądarki. Plik hostuje sam
     * Okręg. Logo PZW w nagłówku aplikacji jest wklejone wektorowo wprost
     * do Index.html, więc strona działa nawet gdy ompzw.pl nie odpowiada.
     */
    godlo: 'https://ompzw.pl/photos/logo/sitelogo/1/photo-106.png',
  },

  /**
   * Bieżąca kadencja władz Okręgu — trafia do stopki zawiadomienia.
   * VII Okręgowy Zjazd Delegatów OM PZW odbył się 21 lutego 2026 r.
   * w Zielonce i wybrał władze na lata 2026–2030: Zarząd Okręgu liczy
   * 13 osób wraz z Prezesem, Okręgowa Komisja Rewizyjna 9, Okręgowy Sąd
   * Koleżeński 9. Statut dopuszcza zarząd okręgu w przedziale 11–31 osób
   * (§ 45 ust. 1).
   */
  kadencja: '2026–2030',

  /** Liczebność Zarządu Okręgu — służy do przeliczenia kworum kwalifikowanego. */
  liczbaCzlonkowZarzadu: 13,

  // ─── Przydatne linki ──────────────────────────────────────────────────────

  /**
   * Skróty pokazywane w karcie „Linki” — to, po co i tak sięgasz, szykując
   * porządek obrad. Każdy wpis to `nazwa`, `opis` i `adres`.
   * Pusta lista ([]) chowa całą kartę.
   * Pełniejszy zestaw adresów jest w docs/linki.md.
   */
  przydatneLinki: [
    {
      nazwa: 'Uchwały Zarządu Okręgu',
      opis: 'Od nich zacznij. Punkt „realizacja uchwał” wymaga wiedzy, co podjęto wcześniej',
      adres: 'https://om.pzw.pl/strefa-pzw/zarzad-okregu/uchwaly-okregu',
    },
    {
      nazwa: 'Skład Zarządu i organów Okręgu',
      opis: 'Kto zasiada w Zarządzie, Okręgowej Komisji Rewizyjnej i Okręgowym Sądzie Koleżeńskim',
      adres: 'https://om.pzw.pl/strefa-pzw/zarzad-okregu/sklad-zarzadu-organy/zarzad',
    },
    {
      nazwa: 'Statut PZW (PDF)',
      opis: 'Tekst jednolity z 15 marca 2017 r. Podstawa wszystkich terminów w narzędziu',
      adres: 'https://pzw.org.pl/brepo/panel_repo/2023/03/03/dttmhj/statut-pzw.pdf',
    },
    {
      nazwa: 'Wykaz kół Okręgu',
      opis: 'Adresy i dane kontaktowe kół, do zawiadomień o zjeździe i narad z prezesami',
      adres: 'https://om.pzw.pl/strefa-pzw/wykaz-kol',
    },
    {
      nazwa: 'Do pobrania: druki dla kół',
      opis: 'Wzory dokumentów i formularzy Okręgu',
      adres: 'https://om.pzw.pl/strefa-pzw/do-pobrania',
    },
  ],

  /**
   * Zwrot powitalny otwierający maila. W Zarządzie Okręgu i w Prezydium nie ma
   * koleżanek, więc forma jest męskoosobowa. Gremia o szerszym składzie —
   * zjazd delegatów, narada z prezesami kół — mają własny `zwrotPowitalny`
   * w RODZAJE_POSIEDZEN.
   */
  zwrotPowitalny: 'Szanowni Koledzy,',

  /** Formuła zamykająca, tuż nad podpisem zwołującego. */
  zwrotKoncowy: 'Z wędkarskim pozdrowieniem',

  /**
   * Osoby uprawnione do zwoływania posiedzeń. Wybierasz jedną w formularzu,
   * a jej imię i funkcja trafiają pod zawiadomienie jako podpis.
   * Posiedzenia Zarządu Okręgu i Prezydium zwołuje prezes zarządu okręgu albo
   * upoważniony przez niego członek zarządu, odpowiednio wiceprezes
   * (§ 46 ust. 2, § 48 ust. 4).
   *
   * Skład kadencji 2026–2030 za wykazem Okręgu (sprawdzony w sierpniu 2026):
   * om.pzw.pl/strefa-pzw/zarzad-okregu/sklad-zarzadu-organy/zarzad
   * Funkcje rozwinięte do formy pełnej, bo idą pod pismo — na stronie Okręgu
   * stoją skrótowo („Wiceprezes ds. Sportu”). Nazwisko sekretarza Zjazdu
   * zapisano tam „Dygudaj”; relacja z VII Zjazdu podaje „Dygadaj” —
   * pierwszeństwo ma wykaz Zarządu.
   */
  zwolujacy: [
    {
      id: 'sobczak',
      imie: 'Daniel Sobczak',
      funkcja: 'Wiceprezes Zarządu Okręgu Mazowieckiego PZW ds. Sportu',
    },
    {
      id: 'kolodziejek',
      imie: 'Piotr Kołodziejek',
      funkcja: 'Prezes Zarządu Okręgu Mazowieckiego PZW',
    },
    {
      id: 'pastusiak',
      imie: 'Waldemar Pastusiak',
      funkcja: 'Sekretarz Zarządu Okręgu Mazowieckiego PZW',
    },
    {
      id: 'czajkowski',
      imie: 'Radosław Czajkowski',
      funkcja: 'Skarbnik Zarządu Okręgu Mazowieckiego PZW',
    },
    {
      id: 'dygudaj',
      imie: 'Edward Dygudaj',
      funkcja: 'Wiceprezes Zarządu Okręgu Mazowieckiego PZW ds. Gospodarczych',
    },
    {
      id: 'ferens',
      imie: 'Dariusz Ferens',
      funkcja: 'Wiceprezes Zarządu Okręgu Mazowieckiego PZW ds. Zagospodarowania i Ochrony Wód',
    },
    {
      id: 'pacuszka',
      imie: 'Grzegorz Pacuszka',
      funkcja: 'Wiceprezes Zarządu Okręgu Mazowieckiego PZW ds. Młodzieży i Promocji',
    },
    {
      id: 'gomulka',
      imie: 'Grzegorz Gomułka',
      funkcja: 'Członek Zarządu Okręgu Mazowieckiego PZW',
    },
    {
      id: 'kryszczak',
      imie: 'Adam Kryszczak',
      funkcja: 'Członek Zarządu Okręgu Mazowieckiego PZW',
    },
    {
      id: 'molendowski',
      imie: 'Dariusz Molendowski',
      funkcja: 'Członek Zarządu Okręgu Mazowieckiego PZW',
    },
    {
      id: 'niewiadomski',
      imie: 'Artur Niewiadomski',
      funkcja: 'Członek Zarządu Okręgu Mazowieckiego PZW',
    },
    {
      id: 'pierzchanowski',
      imie: 'Roman Pierzchanowski',
      funkcja: 'Członek Zarządu Okręgu Mazowieckiego PZW',
    },
    {
      id: 'slawinski',
      imie: 'Maciej Sławiński',
      funkcja: 'Członek Zarządu Okręgu Mazowieckiego PZW',
    },
  ],

  /** Kogo formularz podpowiada jako zwołującego. */
  domyslnyZwolujacy: 'sobczak',

  /**
   * Podpis zapasowy — wchodzi do gry tylko wtedy, gdy lista `zwolujacy`
   * jest pusta.
   */
  podpis: [
    'Z wędkarskim pozdrowieniem',
    'Imię Nazwisko',
    'Prezes Zarządu Okręgu Mazowieckiego PZW',
  ],

  /** Czy dokleić stopkę z danymi Okręgu i podstawą prawną zwołania. */
  stopkaZDanymiOkregu: true,

  // ─── Domyślne wartości formularza ─────────────────────────────────────────
  // Możesz je nadpisać przy każdym posiedzeniu — to tylko wstępne wypełnienie.

  domyslnyRodzaj: 'zarzad-okregu',
  domyslnaGodzina: '11:00',

  /**
   * Odstęp między pierwszym a drugim terminem, jeśli regulamin obrad go
   * przewiduje. Statut nie narzuca drugiego terminu na szczeblu okręgu —
   * domyślnie żaden rodzaj posiedzenia go nie używa.
   */
  odstepDrugiegoTerminuMinut: 30,

  // ─── Kalendarz ────────────────────────────────────────────────────────────

  /**
   * 'primary' = Twój główny kalendarz.
   * Jeśli chcesz osobny kalendarz na sprawy Okręgu, załóż go w Kalendarzu
   * Google i wklej tutaj jego identyfikator (Ustawienia kalendarza →
   * Identyfikator).
   */
  idKalendarza: 'primary',

  strefaCzasowa: 'Europe/Warsaw',

  // ─── Pilnowanie terminów ──────────────────────────────────────────────────

  /**
   * Ostrzegaj, gdy do posiedzenia zostało mniej dni, niż wymaga Statut
   * (21 dni dla okręgowego zjazdu delegatów — § 41 ust. 2).
   * Ostrzeżenie nie blokuje utworzenia wydarzenia — decyzja należy do Ciebie.
   */
  pilnujTerminowStatutowych: true,

  /**
   * Zakładaj całodniowe przypomnienie o kolejnym posiedzeniu w cyklu, który
   * narzuca Statut: Zarząd Okręgu nie rzadziej niż raz na kwartał (§ 46 ust. 1),
   * Prezydium nie rzadziej niż raz w miesiącu (§ 48 ust. 1).
   */
  przypomnienieOCyklu: true,

  // ─── Przypomnienie dzień wcześniej ────────────────────────────────────────

  /**
   * Wyzwalacz czasowy raz na dobę sprawdza, czy jutro jest posiedzenie,
   * i przygotowuje w Gmailu wersję roboczą przypomnienia. Nic nie wychodzi
   * samo — wysyłasz ręcznie, tak jak samo zawiadomienie. Wyzwalacz
   * instalujesz przyciskiem w karcie „Terminy statutowe”.
   */
  przypomnienieDzienWczesniej: true,

  /** Godzina, o której wyzwalacz się budzi (0–23). */
  godzinaPrzypomnienia: 7,

  // ─── Dodatki ──────────────────────────────────────────────────────────────

  /**
   * Które dodatki mają być zaznaczone od razu po utworzeniu posiedzenia.
   * Klucz pominięty = zostaje ustawienie z tablicy DODATKI w Dodatki.gs.
   * Odznaczonego dodatku i tak można dopiąć później przyciskiem „Dokończ”.
   */
  dodatki: {
    cykl: true,
    obecnosc: true,
    pismo: true,
    folder: false,
    protokol: false,
    goscie: false,
  },

  /**
   * Folder nadrzędny, w którym powstają foldery poszczególnych posiedzeń.
   * Pusto = katalog główny Dysku. Identyfikator stoi w adresie folderu:
   * drive.google.com/drive/folders/[TO_JEST_IDENTYFIKATOR]
   */
  idFolderuNadrzednego: '',

  /** Czy Google ma powiadomić gości o zaproszeniu, zmianie i odwołaniu. */
  powiadamiajGosci: true,

  // ─── Ostrzeżenia o terminie ───────────────────────────────────────────────

  /**
   * Ostrzegaj, gdy termin wypada w niedzielę, w dzień ustawowo wolny od pracy
   * albo w dzień mostkowy między świętem a weekendem. Święta ruchome liczą się
   * z daty Wielkanocy, patrz Terminarz.gs.
   */
  ostrzegajOSwietach: true,

  // ─── Rejestr uchwał ───────────────────────────────────────────────────────

  /**
   * Arkusz z uchwałami: numeracja narastająca w obrębie organu i roku
   * („Uchwała nr 12/2026 Prezydium Zarządu Okręgu Mazowieckiego PZW”).
   * Z niego biorą się też punkty porządku obrad Zarządu w trybie § 48 ust. 2.
   */
  rejestrUchwal: true,

  /**
   * Identyfikator arkusza rejestru. Pusto = narzędzie założy arkusz przy
   * pierwszej uchwale i zapamięta go samo; nie musisz tu nic wpisywać.
   */
  idArkuszaRejestru: '',

  // ─── Tło kalendarza ───────────────────────────────────────────────────────

  /**
   * Własne wydarzenia Okręgu, wpisywane w tło kalendarza razem z dniami
   * wolnymi. Powtarzają się co rok, więc podajesz dzień i miesiąc, nie datę.
   *
   * Ferii zimowych narzędzie nie wpisuje: MEN ogłasza je co roku osobno dla
   * każdego województwa i nie ma reguły, z której dałoby się je wyliczyć.
   * Jeśli ich potrzebujesz, dopisz je tutaj ręcznie po ogłoszeniu.
   *
   *   { nazwa: 'Otwarcie sezonu', miesiac: 5, dzien: 1, ileDni: 1, uwaga: '' }
   */
  wlasneWydarzenia: [],

  /**
   * Ile dni w obie strony pokazywać pod polem daty, przy wybieraniu terminu.
   * Widać tam dni wolne, dni mostkowe, inne posiedzenia i zapowiedzi z planu,
   * żeby termin dało się ustawić świadomie, a nie poprawiać po ostrzeżeniu.
   */
  oknoOtoczeniaDni: 10,

  // ─── Plan roczny ──────────────────────────────────────────────────────────

  /** Preferowany dzień tygodnia posiedzeń: 0 = niedziela … 4 = czwartek. */
  preferowanyDzienTygodnia: 4,

  /** Który taki dzień w miesiącu: 1–4, albo -1 dla ostatniego. */
  ktoryTydzienMiesiaca: 2,

  // ─── Wersja robocza maila ─────────────────────────────────────────────────

  /**
   * Czy obok wersji tekstowej wstawić wersję HTML, z klikalnym linkiem Meet.
   * Treść jest ta sama.
   */
  mailWHtml: true,

  // ─── Historia posiedzeń ───────────────────────────────────────────────────

  /**
   * Ile miesięcy wstecz sięgać po minione posiedzenia. Z nich narzędzie
   * bierze podpowiedzi: godzinę, czas trwania i miejsce ostatniego
   * posiedzenia danego rodzaju.
   */
  historiaMiesiecy: 24,

  /** Ile pozycji pokazać na liście „Ostatnie posiedzenia”. */
  liczbaHistorii: 10,

  // ─── Wysyłka maila ────────────────────────────────────────────────────────

  /**
   * Adresy członków Zarządu Okręgu (albo Prezydium — zależnie od tego, kogo
   * zwołujesz najczęściej). Trafiają do UDW (BCC), żeby nie ujawniać całej
   * listy każdemu odbiorcy.
   * Pusta lista = przycisk tworzenia wersji roboczej się nie pokazuje.
   */
  adresyDoWysylki: [],

  /** Adres, na który mail przychodzi w polu „Do” (zwykle biuro Okręgu). */
  adresNadawcyWDo: '',

  // ─── Instrukcja wejścia na Meet ───────────────────────────────────────────
  // Lista punktów doklejana na końcu zawiadomienia. Skasuj lub zmień dowolny
  // wiersz — tekst przepisuje się 1:1. Pustą listę ([]) pomija cały blok.

  naglowekInstrukcji: 'Jak dołączyć do posiedzenia online',

  instrukcjaWejscia: [
    'Wystarczy kliknąć link. Konta Google ani instalacji nie trzeba.',
    'Niezalogowani podają imię i nazwisko, a potem czekają na wpuszczenie. Warto połączyć się 5 minut wcześniej.',
  ],

  /** Zdanie doklejane pod linkiem Meet przy posiedzeniach zwykłych. */
  dopiskiPodLinkiem: 'Link jest przeznaczony dla członków zwołanego gremium. Proszę nie publikować go poza nim.',

  /** Zdanie doklejane pod linkiem przy posiedzeniach niejawnych. */
  dopiskiPodLinkiemNiejawne: 'Posiedzenie jest niejawne. Link jest przeznaczony wyłącznie dla składu orzekającego i osób wezwanych. Proszę go nie przekazywać dalej.',

  // ─── Opis w samym wydarzeniu kalendarza ───────────────────────────────────

  /** Czy do opisu wydarzenia w kalendarzu wpisać treść zawiadomienia. */
  opisWydarzeniaZZaproszenia: true,
};


/**
 * Rodzaje posiedzeń na szczeblu okręgu wraz z wymogami Statutu PZW.
 *
 * Pola:
 *   id                 klucz techniczny, nie zmieniaj
 *   nazwa              etykieta na liście w formularzu
 *   tytul              domyślny tytuł wydarzenia w kalendarzu
 *   zdanieZwolania     pierwsze zdanie zawiadomienia; {okreg} i {okregu}
 *                      podmieniają się na nazwę Okręgu w mianowniku
 *                      i dopełniaczu. Zdanie niesie własny zaimek
 *                      („które” / „który”), bo zjazd jest rodzaju męskiego
 *   czasTrwaniaMinut   wstępny czas trwania
 *   wyprzedzenieDni    ile dni wcześniej trzeba zawiadomić (0 = brak wymogu)
 *   naPismie           czy Statut żąda formy pisemnej — wtedy mail sam
 *                      nie wystarczy
 *   drugiTermin        czy zwołuje się dwa terminy tego samego dnia
 *   kworum             zdanie o prawomocności obrad ('' = pomiń)
 *   listaObecnosci     czy potrzebna lista obecności z podpisami
 *   niejawne           czy link ma zostać w wąskim gronie
 *   cyklMiesiecy       co ile miesięcy Statut każe się zbierać (0 = nie dotyczy)
 *   zwoluje            kto zwołuje posiedzenie
 *   czestotliwosc      podpowiedź w formularzu
 *   dopiskFormalny     akapit doklejany nad porządkiem obrad ('' = pomiń)
 *   podstawa           paragraf Statutu — trafia do stopki
 *   porzadek           szkic porządku obrad
 *
 * Pole opcjonalne:
 *   zwrotPowitalny     własny zwrot otwierający — dla gremiów o składzie
 *                      szerszym niż Zarząd (domyślnie KONFIG.zwrotPowitalny)
 */
const RODZAJE_POSIEDZEN = [

  {
    id: 'zarzad-okregu',
    /* Zwołuje prezes albo osoba przez niego upoważniona (§ 46 ust. 2). */
    upowaznieniePrezesa: true,
    nazwa: 'Posiedzenie Zarządu Okręgu',
    tytul: 'Posiedzenie Zarządu Okręgu Mazowieckiego PZW',
    zdanieZwolania: 'zwołuję posiedzenie Zarządu {okregu}, które odbędzie się',
    czasTrwaniaMinut: 180,
    wyprzedzenieDni: 0,
    naPismie: false,
    drugiTermin: false,
    kworum: 'Uchwały o powoływaniu i likwidacji jednostek gospodarczych oraz o tworzeniu i przystępowaniu do spółek prawa handlowego zapadają większością 2/3 głosów przy obecności co najmniej 2/3 członków Zarządu Okręgu (§ 47 pkt 14 Statutu PZW).',
    listaObecnosci: true,
    niejawne: false,
    cyklMiesiecy: 3,
    zwoluje: 'Prezes zarządu okręgu lub upoważniony przez niego członek zarządu (§ 46 ust. 2).',
    czestotliwosc: 'W miarę potrzeb, nie rzadziej niż raz na kwartał (§ 46 ust. 1).',
    dopiskFormalny: '',
    podstawa: '§ 46 Statutu PZW',
    nazwaOrganu: 'Zarządu Okręgu Mazowieckiego PZW',
    sklad: KONFIG.liczbaCzlonkowZarzadu,
    /** Jedyne kworum kwalifikowane na szczeblu okręgu (§ 47 pkt 14). */
    kworumUlamek: [2, 3],
    /** Pod ten punkt podwieszają się uchwały Prezydium czekające na przedłożenie. */
    wstawUchwalyPoPunkcie: 4,
    porzadek: [
      '1. Otwarcie posiedzenia i stwierdzenie zdolności do podejmowania uchwał.',
      '2. Przyjęcie porządku obrad.',
      '3. Przyjęcie protokołu z poprzedniego posiedzenia Zarządu Okręgu.',
      '4. Przedłożenie Zarządowi Okręgu uchwał Prezydium podjętych w sprawach z § 47 pkt 3–14, 23–25 i 27 (§ 48 ust. 2).',
      '5. Realizacja uchwał Krajowego Zjazdu Delegatów, Okręgowego Zjazdu Delegatów i Zarządu Głównego PZW (§ 47 pkt 2).',
      '6. Sprawy finansowe: wykonanie budżetu, roczne sprawozdanie finansowe Okręgu (§ 47 pkt 6–7).',
      '7. Wnioski pokontrolne Okręgowej Komisji Rewizyjnej i zalecenia Głównej Komisji Rewizyjnej (§ 47 pkt 5).',
      '8. Ochrona i zagospodarowanie wód, zarybienia (§ 47 pkt 15).',
      '9. Składki na ochronę i zagospodarowanie wód (§ 47 pkt 8).',
      '10. Sprawy kół: powoływanie, teren działania, organizowanie współpracy (§ 47 pkt 9 i 29).',
      '11. Działalność sportowa, praca z młodzieżą i szkolenia (§ 47 pkt 16–18).',
      '12. Odznaki związkowe, odznaki okręgowe i wyróżnienia (§ 47 pkt 11).',
      '13. Sprawy różne i wolne wnioski.',
      '14. Zamknięcie posiedzenia.',
    ],
  },

  {
    id: 'prezydium',
    /* Zwołuje prezes albo osoba przez niego upoważniona (§ 48 ust. 4). */
    upowaznieniePrezesa: true,
    nazwa: 'Posiedzenie Prezydium Zarządu Okręgu',
    tytul: 'Posiedzenie Prezydium Zarządu Okręgu Mazowieckiego PZW',
    zdanieZwolania: 'zwołuję posiedzenie Prezydium Zarządu {okregu}, które odbędzie się',
    czasTrwaniaMinut: 150,
    wyprzedzenieDni: 0,
    naPismie: false,
    drugiTermin: false,
    kworum: '',
    listaObecnosci: true,
    niejawne: false,
    cyklMiesiecy: 1,
    zwoluje: 'Prezes zarządu okręgu lub upoważniony przez niego wiceprezes (§ 48 ust. 4).',
    czestotliwosc: 'W miarę potrzeb, nie rzadziej niż raz w miesiącu (§ 48 ust. 1).',
    dopiskFormalny: 'Uchwały podjęte w sprawach wymienionych w § 47 pkt 3–14, 23–25 i 27 Statutu PZW podlegają przedłożeniu na najbliższym posiedzeniu Zarządu Okręgu, który może je uchylić bądź zmienić (§ 48 ust. 2).',
    podstawa: '§ 48 Statutu PZW',
    nazwaOrganu: 'Prezydium Zarządu Okręgu Mazowieckiego PZW',
    /** Nie więcej niż połowa stanu liczbowego zarządu okręgu (§ 45 ust. 3). */
    sklad: 6,
    kworumUlamek: null,
    /** Uchwały tego organu bywają przedkładane Zarządowi (§ 48 ust. 2). */
    uchwalyPrzedkladane: true,
    porzadek: [
      '1. Otwarcie posiedzenia.',
      '2. Przyjęcie porządku obrad.',
      '3. Przyjęcie protokołu z poprzedniego posiedzenia Prezydium.',
      '4. Bieżące kierowanie sprawami należącymi do kompetencji Zarządu Okręgu (§ 48 ust. 2).',
      '5. Sprawy finansowe i gospodarcze Okręgu.',
      '6. Ochrona i zagospodarowanie wód: sprawy bieżące.',
      '7. Sprawy kół i sekcji.',
      '8. Sprawy sportowe i młodzieżowe.',
      '9. Uchwały wymagające przedłożenia Zarządowi Okręgu (§ 47 pkt 3–14, 23–25, 27).',
      '10. Sprawy różne.',
      '11. Zamknięcie posiedzenia.',
    ],
  },

  {
    id: 'zjazd',
    nazwa: 'Okręgowy Zjazd Delegatów (zwyczajny)',
    tytul: 'Okręgowy Zjazd Delegatów Okręgu Mazowieckiego PZW',
    zdanieZwolania: 'Zarząd {okregu} zwołuje Okręgowy Zjazd Delegatów, który odbędzie się',
    czasTrwaniaMinut: 480,
    wyprzedzenieDni: 21,
    naPismie: true,
    drugiTermin: false,
    kworum: 'Statut nie określa kworum okręgowego zjazdu delegatów. Reguluje je regulamin obrad zatwierdzany przez Zjazd (§ 43 pkt 1 Statutu PZW).',
    listaObecnosci: true,
    niejawne: false,
    cyklMiesiecy: 0,
    zwoluje: 'Zarząd okręgu, w terminie uzgodnionym z Zarządem Głównym (§ 41 ust. 1).',
    czestotliwosc: 'Co 4 lata (§ 41 ust. 1). Ostatni był VII Zjazd OM PZW, 21 lutego 2026 r.',
    dopiskFormalny: 'Do zawiadomienia załącza się sprawozdanie z działalności oraz pozostałe dokumenty i wnioski będące tematem obrad (§ 41 ust. 2 Statutu PZW). W Zjeździe uczestniczą delegaci wybrani na walnych zgromadzeniach członków kół, a z głosem doradczym członkowie ustępujących władz i organów oraz osoby zaproszone (§ 42).',
    podstawa: '§ 41 ust. 2 Statutu PZW',
    nazwaOrganu: 'Okręgowego Zjazdu Delegatów OM PZW',
    sklad: 0,
    kworumUlamek: null,
    /** Wykaz na pisemnym zawiadomieniu; § 41 ust. 2 każe je dołączyć. */
    zalaczniki: [
      'Sprawozdanie Zarządu Okręgu z działalności za okres kadencji.',
      'Sprawozdanie Okręgowej Komisji Rewizyjnej wraz z wnioskiem w przedmiocie absolutorium.',
      'Sprawozdanie Okręgowego Sądu Koleżeńskiego.',
      'Projekt regulaminu obrad Zjazdu.',
      'Projekt programu działania Okręgu na kadencję.',
      'Pozostałe dokumenty i wnioski będące tematem obrad.',
    ],
    /** Delegaci kół to grono szersze niż Zarząd — forma włączająca. */
    zwrotPowitalny: 'Szanowne Koleżanki, Szanowni Koledzy,',
    porzadek: [
      '1. Otwarcie Zjazdu i wprowadzenie pocztu sztandarowego.',
      '2. Wybór Prezydium Zjazdu: przewodniczącego, zastępcy przewodniczącego i sekretarzy.',
      '3. Uchwalenie porządku i zatwierdzenie regulaminu obrad (§ 43 pkt 1).',
      '4. Powołanie komisji zjazdowych: mandatowej, wyborczej, skrutacyjnej oraz uchwał i wniosków.',
      '5. Protokół komisji mandatowej i stwierdzenie prawomocności Zjazdu.',
      '6. Sprawozdanie Zarządu Okręgu za okres kadencji (§ 43 pkt 2).',
      '7. Sprawozdanie Okręgowej Komisji Rewizyjnej.',
      '8. Sprawozdanie Okręgowego Sądu Koleżeńskiego.',
      '9. Dyskusja nad sprawozdaniami i rozpatrzenie zgłoszonych wniosków (§ 43 pkt 3).',
      '10. Udzielenie absolutorium ustępującemu Zarządowi Okręgu, na wniosek Okręgowej Komisji Rewizyjnej (§ 43 pkt 4).',
      '11. Ustalenie składu liczbowego Zarządu Okręgu oraz organów Okręgu (§ 43 pkt 5).',
      '12. Wybór prezesa Zarządu Okręgu (§ 43 pkt 6).',
      '13. Wybory członków Zarządu Okręgu, Okręgowej Komisji Rewizyjnej i Okręgowego Sądu Koleżeńskiego.',
      '14. Wybór delegatów i ich zastępców na Krajowy Zjazd Delegatów (§ 43 pkt 7).',
      '15. Ogłoszenie wyników wyborów przez komisję skrutacyjną.',
      '16. Uchwalenie programu działania Okręgu na kadencję.',
      '17. Przyjęcie uchwał i wniosków zjazdowych.',
      '18. Zamknięcie obrad i wyprowadzenie pocztu sztandarowego.',
    ],
  },

  {
    id: 'zjazd-nadzwyczajny',
    nazwa: 'Nadzwyczajny Okręgowy Zjazd Delegatów',
    tytul: 'Nadzwyczajny Okręgowy Zjazd Delegatów Okręgu Mazowieckiego PZW',
    zdanieZwolania: 'Zarząd {okregu} zwołuje Nadzwyczajny Okręgowy Zjazd Delegatów, który odbędzie się',
    czasTrwaniaMinut: 240,
    wyprzedzenieDni: 21,
    naPismie: true,
    drugiTermin: false,
    kworum: 'Statut nie określa kworum okręgowego zjazdu delegatów. Reguluje je regulamin obrad zatwierdzany przez Zjazd (§ 43 pkt 1 Statutu PZW).',
    listaObecnosci: true,
    niejawne: false,
    cyklMiesiecy: 0,
    zwoluje: 'Zarząd okręgu z własnej inicjatywy albo w terminie 3 miesięcy od wniosku Zarządu Głównego, Okręgowej Komisji Rewizyjnej, 1/3 zarządów kół lub 1/3 delegatów na ostatni zjazd (§ 44 ust. 1). Przy niedotrzymaniu terminu zjazd zwołuje niezwłocznie Okręgowa Komisja Rewizyjna (§ 44 ust. 2).',
    czestotliwosc: 'Zwoływany doraźnie. Uchwały tylko w sprawach, dla rozpatrzenia których zjazd zwołano (§ 44 ust. 3).',
    dopiskFormalny: 'Nadzwyczajny okręgowy zjazd delegatów podejmuje uchwały wyłącznie w sprawach, dla rozpatrzenia których został zwołany (§ 44 ust. 3 Statutu PZW). Termin zawiadomienia stosuje się odpowiednio jak przy zjeździe zwyczajnym (§ 41 ust. 2).',
    podstawa: '§ 44 Statutu PZW',
    nazwaOrganu: 'Nadzwyczajnego Okręgowego Zjazdu Delegatów OM PZW',
    sklad: 0,
    kworumUlamek: null,
    zalaczniki: [
      'Dokumenty i wnioski w sprawie, dla rozpatrzenia której Zjazd został zwołany.',
      'Projekt regulaminu obrad Zjazdu.',
    ],
    zwrotPowitalny: 'Szanowne Koleżanki, Szanowni Koledzy,',
    porzadek: [
      '1. Otwarcie Zjazdu.',
      '2. Wybór Prezydium Zjazdu: przewodniczącego, zastępcy przewodniczącego i sekretarza.',
      '3. Uchwalenie porządku i zatwierdzenie regulaminu obrad.',
      '4. Powołanie komisji mandatowej oraz komisji uchwał i wniosków.',
      '5. Protokół komisji mandatowej i stwierdzenie prawomocności Zjazdu.',
      '6. Przedstawienie sprawy, dla rozpatrzenia której Zjazd został zwołany.',
      '7. Dyskusja.',
      '8. Podjęcie uchwał, wyłącznie w sprawach objętych porządkiem obrad (§ 44 ust. 3).',
      '9. Zamknięcie obrad.',
    ],
  },

  {
    id: 'okr',
    /* Skład wybrany na VII Okręgowym Zjeździe Delegatów, 21 lutego 2026 r.
       Lista służy odklikiwaniu obecności; nazwiska są jawne, opublikował
       je sam Związek w relacji ze Zjazdu. */
    czlonkowie: [
      { id: 'chelstowski', imie: 'Sławomir Chełstowski', funkcja: 'Członek Okręgowej Komisji Rewizyjnej' },
      { id: 'kaminski', imie: 'Andrzej Kamiński', funkcja: 'Członek Okręgowej Komisji Rewizyjnej' },
      { id: 'kasprowicz', imie: 'Grzegorz Kasprowicz', funkcja: 'Członek Okręgowej Komisji Rewizyjnej' },
      { id: 'lewandowski', imie: 'Zbigniew Lewandowski', funkcja: 'Członek Okręgowej Komisji Rewizyjnej' },
      { id: 'lukasik', imie: 'Jerzy Łukasik', funkcja: 'Członek Okręgowej Komisji Rewizyjnej' },
      { id: 'morawski', imie: 'Tomasz Morawski', funkcja: 'Członek Okręgowej Komisji Rewizyjnej' },
      { id: 'rawski', imie: 'Kamil Rawski', funkcja: 'Członek Okręgowej Komisji Rewizyjnej' },
      { id: 'suska', imie: 'Anna Suska', funkcja: 'Członek Okręgowej Komisji Rewizyjnej' },
      { id: 'wojcik', imie: 'Józef Wójcik', funkcja: 'Członek Okręgowej Komisji Rewizyjnej' },
    ],
    nazwa: 'Posiedzenie Okręgowej Komisji Rewizyjnej',
    tytul: 'Posiedzenie Okręgowej Komisji Rewizyjnej OM PZW',
    zdanieZwolania: 'zwołuję posiedzenie Okręgowej Komisji Rewizyjnej {okregu}, które odbędzie się',
    czasTrwaniaMinut: 120,
    wyprzedzenieDni: 0,
    naPismie: false,
    drugiTermin: false,
    kworum: '',
    listaObecnosci: true,
    niejawne: false,
    cyklMiesiecy: 12,
    zwoluje: 'Przewodniczący Okręgowej Komisji Rewizyjnej. Tryb pracy określa Regulamin komisji rewizyjnych PZW (§ 50 ust. 1).',
    czestotliwosc: 'Kontrola działalności Zarządu Okręgu nie rzadziej niż raz w roku (§ 50 ust. 2 pkt 3).',
    dopiskFormalny: '',
    podstawa: '§ 49–50 Statutu PZW',
    nazwaOrganu: 'Okręgowej Komisji Rewizyjnej OM PZW',
    /** Statut dopuszcza 5–9 członków (§ 49); Zjazd ustalił 9. */
    sklad: 9,
    kworumUlamek: null,
    /**
     * Komisję zwołuje jej przewodniczący, nie prezes Zarządu (§ 50 ust. 1),
     * więc lista Zarządu tu nie pasuje. Dopisz skład Komisji, a narzędzie
     * przestanie podpowiadać osoby z Zarządu.
     * Wykaz organów: om.pzw.pl/strefa-pzw/zarzad-okregu/sklad-zarzadu-organy/organy
     */
    wlasniZwolujacy: true,
    zwolujacy: [],
    /** Pusto = zadziała globalna KONFIG.adresyDoWysylki. */
    adresy: [],
    porzadek: [
      '1. Otwarcie posiedzenia.',
      '2. Przyjęcie protokołu z poprzedniego posiedzenia.',
      '3. Kontrola działalności Okręgu (§ 50 ust. 2 pkt 1).',
      '4. Kontrola działalności Zarządu Okręgu (§ 50 ust. 2 pkt 3).',
      '5. Wnioski pokontrolne do Zarządu Okręgu (§ 50 ust. 2 pkt 2).',
      '6. Współpraca z komisjami rewizyjnymi kół (§ 50 ust. 2 pkt 4).',
      '7. Informacja dla Zarządu Okręgu, raz w roku (§ 50 ust. 2 pkt 5).',
      '8. Zamknięcie posiedzenia.',
    ],
  },

  {
    id: 'osk',
    /* Skład wybrany na VII Okręgowym Zjeździe Delegatów, 21 lutego 2026 r.
       Lista służy odklikiwaniu obecności; nazwiska są jawne, opublikował
       je sam Związek w relacji ze Zjazdu. */
    czlonkowie: [
      { id: 'andrasik', imie: 'Robert Andrasik', funkcja: 'Członek Okręgowego Sądu Koleżeńskiego' },
      { id: 'frelik', imie: 'Tomasz Frelik', funkcja: 'Członek Okręgowego Sądu Koleżeńskiego' },
      { id: 'jusinski', imie: 'Sebastian Jusiński', funkcja: 'Członek Okręgowego Sądu Koleżeńskiego' },
      { id: 'klodkiewicz', imie: 'Radosław Kłódkiewicz', funkcja: 'Członek Okręgowego Sądu Koleżeńskiego' },
      { id: 'myszkowski', imie: 'Wiesław Myszkowski', funkcja: 'Członek Okręgowego Sądu Koleżeńskiego' },
      { id: 'nidzgorski', imie: 'Janusz Nidzgorski', funkcja: 'Członek Okręgowego Sądu Koleżeńskiego' },
      { id: 'rucinski', imie: 'Krzysztof Ruciński', funkcja: 'Członek Okręgowego Sądu Koleżeńskiego' },
      { id: 'trzaskowski', imie: 'Marek Trzaskowski', funkcja: 'Członek Okręgowego Sądu Koleżeńskiego' },
      { id: 'wojciechowski', imie: 'Mariusz Wojciechowski', funkcja: 'Członek Okręgowego Sądu Koleżeńskiego' },
    ],
    nazwa: 'Posiedzenie Okręgowego Sądu Koleżeńskiego',
    tytul: 'Posiedzenie Okręgowego Sądu Koleżeńskiego OM PZW',
    zdanieZwolania: 'zwołuję posiedzenie Okręgowego Sądu Koleżeńskiego {okregu}, które odbędzie się',
    czasTrwaniaMinut: 120,
    wyprzedzenieDni: 0,
    naPismie: false,
    drugiTermin: false,
    kworum: '',
    listaObecnosci: true,
    niejawne: true,
    cyklMiesiecy: 0,
    zwoluje: 'Przewodniczący Okręgowego Sądu Koleżeńskiego. Tryb postępowania określa regulamin uchwalony przez Zarząd Główny (§ 52 ust. 1).',
    czestotliwosc: 'Doraźnie, w sprawach wniesionych. Informacja dla Zarządu Okręgu raz w roku (§ 52 ust. 2).',
    dopiskFormalny: '',
    podstawa: '§ 51–52 Statutu PZW',
    nazwaOrganu: 'Okręgowego Sądu Koleżeńskiego OM PZW',
    /** Statut dopuszcza 7–9 członków (§ 51); Zjazd ustalił 9. */
    sklad: 9,
    kworumUlamek: null,
    /** Sąd zwołuje jego przewodniczący (§ 52 ust. 1), nie prezes Zarządu. */
    wlasniZwolujacy: true,
    zwolujacy: [],
    /**
     * Posiedzenie niejawne. Narzędzie **nie** podstawi tu globalnej listy
     * adresowej Zarządu. Dopóki ta tablica jest pusta, wersji roboczej maila
     * nie da się utworzyć i zawiadomienie trzeba rozesłać ręcznie.
     */
    adresy: [],
    porzadek: [
      '1. Otwarcie posiedzenia.',
      '2. Wyznaczenie zespołów orzekających.',
      '3. Rozpatrzenie spraw wniesionych i wydanie orzeczeń.',
      '4. Sprawy odwoławcze od orzeczeń sądów koleżeńskich kół.',
      '5. Zamknięcie posiedzenia.',
    ],
  },

  {
    id: 'komisja',
    nazwa: 'Posiedzenie komisji problemowej Zarządu Okręgu',
    tytul: 'Posiedzenie komisji problemowej Zarządu Okręgu Mazowieckiego PZW',
    zdanieZwolania: 'zwołuję posiedzenie komisji problemowej Zarządu {okregu}, które odbędzie się',
    czasTrwaniaMinut: 120,
    wyprzedzenieDni: 0,
    naPismie: false,
    drugiTermin: false,
    kworum: '',
    listaObecnosci: false,
    niejawne: false,
    cyklMiesiecy: 0,
    zwoluje: 'Przewodniczący komisji, zgodnie z regulaminem uchwalonym przez Zarząd Okręgu (§ 47 pkt 12).',
    czestotliwosc: 'Wedle regulaminu komisji. Komisje powołuje Zarząd Okręgu (§ 47 pkt 12).',
    dopiskFormalny: '',
    podstawa: '§ 47 pkt 12 Statutu PZW',
    nazwaOrganu: 'komisji problemowej Zarządu Okręgu Mazowieckiego PZW',
    sklad: 0,
    kworumUlamek: null,
    /** Komisję zwołuje jej przewodniczący, wedle regulaminu (§ 47 pkt 12). */
    wlasniZwolujacy: true,
    zwolujacy: [],
    adresy: [],
    porzadek: [
      '1. Otwarcie posiedzenia.',
      '2. Przyjęcie protokołu z poprzedniego posiedzenia.',
      '3. Realizacja planu pracy komisji.',
      '4. Sprawy bieżące w zakresie działania komisji.',
      '5. Wnioski do Zarządu Okręgu.',
      '6. Zamknięcie posiedzenia.',
    ],
  },

  {
    /**
     * Kapitanat skraca się do OKS, ale identyfikatora „oks” tu nie ma celowo:
     * o jeden przestawiony znak od „osk”, czyli Okręgowego Sądu Koleżeńskiego.
     * Pomyłka kosztowałaby zawiadomienie wysłane nie temu organowi.
     */
    id: 'kapitanat',
    nazwa: 'Posiedzenie Okręgowego Kapitanatu Sportowego',
    tytul: 'Posiedzenie Okręgowego Kapitanatu Sportowego OM PZW',
    zdanieZwolania: 'zwołuję posiedzenie Okręgowego Kapitanatu Sportowego {okregu}, które odbędzie się',
    czasTrwaniaMinut: 120,
    wyprzedzenieDni: 0,
    naPismie: false,
    drugiTermin: false,
    /**
     * Statut nie ustala kworum dla komisji Zarządu Okręgu – robi to regulamin
     * Kapitanatu uchwalony przez Zarząd (§ 47 pkt 12). Regulaminu Okręgu
     * Mazowieckiego nie udało się znaleźć w serwisie ompzw.pl, więc zdanie
     * o prawomocności zostaje puste zamiast powielać liczby z innego okręgu.
     */
    kworum: '',
    listaObecnosci: true,
    niejawne: false,
    cyklMiesiecy: 0,
    zwoluje: 'Przewodniczący Okręgowego Kapitanatu Sportowego, zgodnie z regulaminem uchwalonym przez Zarząd Okręgu (§ 47 pkt 12).',
    czestotliwosc: 'W miarę potrzeb, wedle regulaminu Kapitanatu. Statut nie wyznacza cyklu (§ 47 pkt 12), ale rytm narzuca sezon: terminarz przed sezonem, klasy sportowe do 31 grudnia, listy zawodników do GKS raz w roku.',
    /**
     * Kadry okręgowe wyłania Zarząd Okręgu, ale wyłącznie na wniosek
     * Kapitanatu (§ 47 pkt 16). Ten akapit przypomina, dokąd trafia wynik obrad.
     */
    dopiskFormalny: 'Kadry okręgowe wyłania Zarząd Okręgu na wniosek Kapitanatu (§ 47 pkt 16 Statutu PZW).',
    podstawa: '§ 47 pkt 12 i 16 Statutu PZW',
    nazwaOrganu: 'Okręgowego Kapitanatu Sportowego OM PZW',
    /** Skład ustala Zarząd Okręgu; obsady kadencji 2026–2030 nie potwierdzono. */
    sklad: 0,
    kworumUlamek: null,
    /**
     * Posiedzenia Kapitanatu organizuje Daniel Sobczak, wiceprezes Zarządu
     * Okręgu ds. Sportu. Bierzemy jego wpis z KONFIG.zwolujacy zamiast
     * przepisywać nazwisko, żeby zmiana w wykazie nie wymagała poprawki
     * w dwóch miejscach.
     *
     * Czy pełni zarazem funkcję przewodniczącego Kapitanatu, nie wynika
     * z żadnego opublikowanego dokumentu Okręgu – patrz docs.
     */
    wlasniZwolujacy: true,
    zwolujacy: KONFIG.zwolujacy.filter(function (osoba) {
      return osoba.id === 'sobczak';
    }),
    adresy: [],
    /* Punkty 3–9 to powtarzalne obowiązki Kapitanatu. Terminarz, regulaminy
       Mistrzostw i Kadra Okręgu wynikają z regulaminu zawodów OM PZW
       (uchwała nr 442/II/2024); sędziowie, klasy sportowe i listy do GKS
       z Zasad Organizacji Sportu Wędkarskiego ZG PZW. Patrz docs. */
    porzadek: [
      '1. Otwarcie posiedzenia.',
      '2. Przyjęcie protokołu z poprzedniego posiedzenia.',
      '3. Terminarz zawodów okręgowych, do zatwierdzenia przez Zarząd Okręgu.',
      '4. Regulaminy Mistrzostw Okręgu i cyklu Grand Prix oraz limity uczestników.',
      '5. Sprawy sędziowskie: obsada zawodów, egzaminy na klasę podstawową i okręgową, ewidencja (ZOSW).',
      '6. Weryfikacja wyników i klasy sportowe druga i trzecia, w terminie do 31 grudnia (ZOSW).',
      '7. Kadra Okręgu: wnioski do Zarządu Okręgu (§ 47 pkt 16) i listy zawodników do GKS.',
      '8. Protesty, odwołania i kary za przewinienia sportowe.',
      '9. Sprawy różne i wolne wnioski.',
      '10. Zamknięcie posiedzenia.',
    ],
  },

  {
    id: 'narada-kol',
    nazwa: 'Narada z prezesami kół',
    tytul: 'Narada Zarządu Okręgu z prezesami kół OM PZW',
    zdanieZwolania: 'zapraszam na naradę Zarządu {okregu} z prezesami kół, która odbędzie się',
    czasTrwaniaMinut: 180,
    wyprzedzenieDni: 0,
    naPismie: false,
    drugiTermin: false,
    kworum: '',
    listaObecnosci: false,
    niejawne: false,
    cyklMiesiecy: 0,
    zwoluje: 'Zarząd Okręgu w ramach organizowania współpracy kół (§ 47 pkt 29).',
    czestotliwosc: 'Doraźnie. Okręg może organizować współpracę kół w ustalonych przez siebie rejonach (§ 37 ust. 9).',
    dopiskFormalny: '',
    podstawa: '§ 47 pkt 29 Statutu PZW',
    nazwaOrganu: 'narady Zarządu Okręgu z prezesami kół OM PZW',
    sklad: 0,
    kworumUlamek: null,
    /** Prezesi kół to inna lista niż członkowie Zarządu. */
    adresy: [],
    /** Prezesi kół to grono szersze niż Zarząd — forma włączająca. */
    zwrotPowitalny: 'Szanowne Koleżanki, Szanowni Koledzy,',
    porzadek: [
      '1. Otwarcie narady.',
      '2. Informacja o uchwałach Zarządu Okręgu i Zarządu Głównego PZW.',
      '3. Składki i zezwolenia na kolejny rok.',
      '4. Ochrona i zagospodarowanie wód: zadania kół.',
      '5. Terminarz zawodów i praca z młodzieżą.',
      '6. Sprawozdawczość kół i obsługa finansowo-księgowa (§ 47 pkt 20).',
      '7. Dyskusja i wnioski kół.',
      '8. Zamknięcie narady.',
    ],
  },
];
