/**
 * KONFIGURACJA — to jedyny plik, który normalnie edytujesz.
 *
 * Zmiany zapisują się od razu; nie trzeba nic wdrażać ponownie,
 * chyba że zmieniasz uprawnienia lub dodajesz nowe pliki.
 */

const KONFIG = {

  // ─── Koło i podpis ────────────────────────────────────────────────────────

  /** Pełna nazwa koła — trafia do tytułu wydarzenia i do treści zaproszenia. */
  nazwaKola: 'Koło PZW nr 00 „Nazwa”',

  /** Zwrot powitalny otwierający maila. */
  zwrotPowitalny: 'Szanowne Koleżanki, Szanowni Koledzy,',

  /** Podpis pod mailem. Każdy element to osobna linia. */
  podpis: [
    'Z wędkarskim pozdrowieniem',
    'Imię Nazwisko',
    'Prezes Koła PZW nr 00',
  ],

  // ─── Domyślne wartości formularza ─────────────────────────────────────────
  // Możesz je nadpisać przy każdym spotkaniu — to tylko wstępne wypełnienie.

  domyslnyTytul: 'Zebranie Koła PZW',
  domyslnaGodzina: '18:00',
  domyslnyCzasTrwaniaMinut: 120,

  // ─── Kalendarz ────────────────────────────────────────────────────────────

  /**
   * 'primary' = Twój główny kalendarz.
   * Jeśli chcesz osobny kalendarz na sprawy PZW, załóż go w Kalendarzu Google
   * i wklej tutaj jego identyfikator (Ustawienia kalendarza → Identyfikator).
   */
  idKalendarza: 'primary',

  strefaCzasowa: 'Europe/Warsaw',

  // ─── Instrukcja wejścia na Meet ───────────────────────────────────────────
  // Lista punktów doklejana na końcu zaproszenia. Skasuj lub zmień dowolny
  // wiersz — tekst przepisuje się 1:1. Pustą listę ([]) pomija cały blok.

  naglowekInstrukcji: 'Jak dołączyć do spotkania online',

  instrukcjaWejscia: [
    'Nie trzeba mieć konta Google ani niczego instalować — wystarczy kliknąć powyższy link.',
    'Link otworzy się w przeglądarce. Zezwól na dostęp do mikrofonu i kamery.',
    'Jeśli nie jesteś zalogowany w Google, wpisz swoje imię i nazwisko i kliknij „Poproś o dołączenie” — wpuszczę Cię do spotkania.',
    'Najlepiej połączyć się 5 minut przed czasem, żeby spokojnie sprawdzić dźwięk.',
  ],

  /**
   * Zdanie doklejane pod linkiem Meet. Ustaw na '' żeby pominąć.
   */
  dopiskiPodLinkiem: 'Link jest otwarty — można go przekazać dalej członkom Koła.',

  // ─── Porządek obrad ───────────────────────────────────────────────────────

  /**
   * Miejsce, w które wpiszesz punkty zebrania po wklejeniu tekstu do maila.
   * Ustaw na [] jeśli wolisz dopisywać wszystko od zera.
   */
  naglowekPorzadku: 'Planowany porządek obrad:',

  szkicPorzadku: [
    '1. Otwarcie zebrania i stwierdzenie kworum.',
    '2. …',
    '3. Wolne wnioski.',
  ],

  // ─── Opis w samym wydarzeniu kalendarza ───────────────────────────────────

  /** Czy do opisu wydarzenia w kalendarzu wpisać treść zaproszenia. */
  opisWydarzeniaZZaproszenia: true,
};
