export const CHARACTERS = {
  Gienek: { role: 'Protagonista', bio: 'Pro gracz LoL, ex-prezes KNML na PRz.' },
  'Toxic Gracz LoL': { role: 'Antagonista', bio: 'Ranked soul bez soul.' },
  HR: { role: 'Przeszkoda', bio: 'Rekruter z obsesją na punkcie CV.' },
  'Potężny Kac': { role: 'Boss', bio: 'Pamięć najlepszej imprezy studenckiej.' },
  'J.M. Rektor': { role: 'Final Boss', bio: 'Strażnik łańcucha i sesji egzaminacyjnej.' },
};

export const INTRO_CRAWL = [
  'DZISIAJ ZNOWU MI SIĘ ŚNIŁAŚ',
  'Epizod I: ŁAŃCUCH REKTORA',
  '',
  'Gienek, ex-prezes Koła Naukowego Machine Learning',
  'na Politechnice Rzeszowskiej, wraca do starego biura KNML.',
  '',
  'Wspomnienia zamknięte są w trzech kluczach pamięci:',
  'Pierwszy Turniej, Pierwsza Praca, Najlepsza Impreza.',
  '',
  'Tylko z nimi pokona J.M. Rektora',
  'i odzyska tron — albo przynajmniej łańcuch.',
];

export const CREDITS_CRAWL = [
  'DZISIAJ ZNOWU MI SIĘ ŚNIŁAŚ',
  'Epizod I: ŁAŃCUCH REKTORA',
  '',
  'W rolach głównych:',
  'Gienek jako On Sam',
  'J.M. Rektor jako Antagonista',
  'Toxic Gracz LoL jako Sieć',
  'Potężny Kac jako Weekend',
  'HR jako Luka w CV',
  '',
  'Specjalne podziękowania:',
  'KNML · Politechnika Rzeszowska',
  'Team Ranked · GPU które przetrwało trening',
  'Pepsi · Tabletki · Komenda',
  '',
  'Stworzone z miłością na urodziny Gienka.',
  'Niech moc z GPU będzie z Tobą.',
];

export const STORY = {
  room1Intro: [
    { speaker: 'Gienek', text: 'Stare biuro KNML... Zapach kurzu, GPU i niedospanych nocnych treningów modeli.' },
    { speaker: 'Gienek', text: 'Wróciłem po klucze pamięci. Bez nich nie stoję na wysokości Rektora.' },
    { speaker: 'System', text: 'Sterowanie: WASD — ruch, SPACJA — interakcja.' },
  ],
  server: [
    { speaker: 'Gienek', text: 'Stary serwer KNML. Tu trenowaliśmy pierwsze sieci, gdy loss jeszcze nie spadał, a my tak.' },
    { speaker: 'Gienek', text: 'Pamiętam noce, gdy siedzieliśmy tu do świtu. „Jeszcze jedna epoka treningu” i nagle robiła się siódma rano.' },
  ],
  python: [
    { speaker: 'Gienek', text: 'IndentationError: unexpected indent. Klasyk.' },
    { speaker: 'Gienek', text: 'Raz na sesji Python sam się psuł, gdy zbliżały się deadline\'y. Albo to był mój kod. Raczej mój.' },
  ],
  lol: [
    { speaker: 'Gienek', text: 'Plakat turnieju. Pierwszy raz stanąłem na scenie jako Gienek z PRz, nie jako „ten od ML".' },
    { speaker: 'Gienek', text: 'To wspomnienie muszę odnowić w Krainie Ligi...' },
  ],
  room2Intro: [
    { speaker: 'Toxic Gracz LoL', text: 'gg ez, report jungle diff, ty i twoja drużyna to boty.' },
    { speaker: 'Gienek', text: 'Kraina Ligi. Tu każdy ranked to walka o duszę. Dobrze, że mam doświadczenie z prezydentury KNML — tam też było toksycznie.' },
  ],
  room2Key: [
    { speaker: 'Gienek', text: 'Smite trafiony! Klucz Pierwszy Turniej wraca do mnie. Czuję, jak determinacja rośnie.' },
  ],
  room3Intro: [
    { speaker: 'HR', text: 'Dzień dobry. Proszę o CV, list motywacyjny i pięć lat doświadczenia na studenckim stażu.' },
    { speaker: 'Gienek', text: 'Wspinaczka po karierze. Od KNML do korpo. Każda luka w CV to przepaść, którą muszę przeskoczyć.' },
  ],
  room3Key: [
    { speaker: 'Gienek', text: 'Pierwsza Praca — klucz zdobyty. HR zostaje w tyle. Idę dalej.' },
  ],
  room4Intro: [
    { speaker: 'Potężny Kac', text: 'Będę... tańczył... na twojej czaszce... jak na studniówce...' },
    { speaker: 'Gienek', text: 'Studencka noc była legendarna. Kac jest potężny, ale wspomnienie imprezy silniejsze.' },
  ],
  room4Key: [
    { speaker: 'Gienek', text: 'Najlepsza Impreza — ostatni klucz! Tron Rektora czeka.' },
  ],
  room5Intro: [
    { speaker: 'J.M. Rektor', text: 'Gienek. Myślisz, że trzy klucze wystarczą? Łańcuch nie oddaje się bez walki.' },
    { speaker: 'Gienek', text: 'Przeszedłem przez ligę, karierę i kaca. Jesteś ostatnią przeszkodą, panie Rektorze.' },
  ],
  room5Phase2: [
    { speaker: 'J.M. Rektor', text: 'Faza druga! Podłoga akademicka nie jest wieczna!' },
  ],
  room5Phase3: [
    { speaker: 'J.M. Rektor', text: 'Ostateczny cios! Zobaczymy, czy KNML nauczył cię czegoś więcej niż backprop!' },
  ],
  endingThrone: [
    { speaker: 'J.M. Rektor', text: 'Masz moją moc... i mój łańcuch. Tron jest twój, Rektorze Gienku.' },
    { speaker: 'Gienek', text: 'Pierwszy Turniej dał odwagę. Pierwsza Praca — wytrwałość. Najlepsza Impreza — radość życia.' },
    { speaker: 'Gienek', text: 'Wszystkie klucze wróciły. Teraz zasiądę na tronie...' },
  ],
  endingSurprise: [
    { speaker: 'System', text: 'NIESPODZIANKA! Światła zapalają się!' },
    { speaker: 'Gienek', text: 'Co?! To nie koronacja... to urodziny?!' },
  ],
  endingFinal: [
    { speaker: 'Gienek', text: 'Najlepszy prezent to ta przygoda. Dziękuję wszystkim.' },
    { speaker: 'System', text: 'Naciśnij R aby zacząć od początku albo C aby zobaczyć napisy końcowe.' },
  ],
};
