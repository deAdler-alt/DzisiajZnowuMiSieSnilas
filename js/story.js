export const CHARACTERS = {
  Gienek: { role: 'Protagonista', bio: 'Pro gracz LoL, ex-prezes KNML na PRz.' },
  'Toxic Gracz LoL': { role: 'Antagonista', bio: 'Ranked bez duszy, dusza bez ranku.' },
  HR: { role: 'Przeszkoda', bio: 'Rekruter z obsesją na punkcie CV.' },
  'Potężny Kac': { role: 'Boss', bio: 'Pamięć najlepszej imprezy studenckiej.' },
  'J.M. Rektor': { role: 'Final Boss', bio: 'Strażnik łańcucha i sesji egzaminacyjnej.' },
};

export const INTRO_CRAWL = [
  'DZISIAJ ZNOWU MI SIĘ ŚNIŁAŚ',
  'Epizod I: ŁAŃCUCH REKTORA',
  '',
  'Gienek, ex-prezes Koła Naukowego Machine Learning',
  'na Politechnice Rzeszowskiej, znów śni ten sam sen.',
  '',
  'Zamknięte drzwi starego biura KNML.',
  'Za nimi trzy wspomnienia, które kiedyś porzucił:',
  'Pierwszy Turniej, Pierwsza Praca, Najlepsza Impreza.',
  '',
  'Bez nich nie spojrzy Rektorowi w oczy.',
  'Bez nich nie obudzi się naprawdę.',
  '',
  'Czas odzyskać klucze pamięci.',
];

export const CREDITS_CRAWL = [
  'DZISIAJ ZNOWU MI SIĘ ŚNIŁAŚ',
  'Epizod I: ŁAŃCUCH REKTORA',
  '',
  'W rolach głównych:',
  'Gienek jako On Sam',
  'J.M. Rektor jako Ostatni Egzamin',
  'Toxic Gracz LoL jako Internet',
  'Potężny Kac jako Poranek Po',
  'HR jako Luka w CV',
  '',
  'Klucze pamięci:',
  'Pierwszy Turniej · Pierwsza Praca · Najlepsza Impreza',
  '',
  'Specjalne podziękowania:',
  'KNML · Politechnika Rzeszowska',
  'Team Ranked · GPU, które przetrwało trening',
  'Pepsi · Tabletki · Komenda 997',
  '',
  'Stworzone z miłością na urodziny Gienka.',
  'Dzięki, że jesteś tym samym ziomkiem co zawsze.',
  'Niech loss zawsze Ci spada. Sto lat!',
];

export const STORY = {
  room1Intro: [
    { speaker: 'Gienek', text: 'Stare biuro KNML... Zapach kurzu, rozgrzanego GPU i kawy, która wystygła w 2019 roku.' },
    { speaker: 'Gienek', text: 'Znowu ten sam sen. Wracam tu po trzy klucze pamięci. Bez nich nie stanę na wysokości Rektora.' },
    { speaker: 'Gienek', text: 'Dobra. Rozejrzyjmy się. Może coś jeszcze pamięta, kim byłem.' },
    { speaker: 'System', text: 'Sterowanie: WASD — ruch, SPACJA — interakcja. Zbierz przedmioty i znajdź drzwi.' },
  ],
  server: [
    { speaker: 'Gienek', text: 'Stary serwer KNML. Tu trenowaliśmy pierwsze sieci, gdy loss jeszcze nie spadał — a my razem z nim.' },
    { speaker: 'Gienek', text: '„Jeszcze jedna epoka” — mówiliśmy o trzeciej w nocy. I nagle robiła się siódma rano, a model dalej się nie uczył.' },
    { speaker: 'Gienek', text: 'Ale wentylatory grały jak orkiestra. Tęsknię za tym szumem.' },
  ],
  python: [
    { speaker: 'Gienek', text: 'IndentationError: unexpected indent. Klasyk. Cały ekran czerwony jak ranked na 0/7.' },
    { speaker: 'Gienek', text: 'Zawsze powtarzałem juniorom: to nie Python się psuje przed deadlinem. To Ty.' },
    { speaker: 'Gienek', text: 'No dobra, raz naprawdę była to wersja biblioteki. Raz.' },
  ],
  lol: [
    { speaker: 'Gienek', text: 'Plakat turnieju. Pierwszy raz stanąłem na scenie jako „Gienek z PRz”, a nie „ten od sieci neuronowych”.' },
    { speaker: 'Gienek', text: 'Ręce się trzęsły. Smite oddałem o klatkę za wcześnie. I tak wygraliśmy.' },
    { speaker: 'Gienek', text: 'To wspomnienie muszę odnowić w Krainie Ligi. Czuję, że tam na mnie czeka.' },
  ],
  whiteboard: [
    { speaker: 'Gienek', text: 'Tablica. Ktoś narysował architekturę modelu, a obok wielki napis „TO NIE ZADZIAŁA”.' },
    { speaker: 'Gienek', text: 'Zadziałało. Po trzech tygodniach i czterech litrach napojów energetycznych, ale zadziałało.' },
  ],
  trophy: [
    { speaker: 'Gienek', text: 'Puchar za drugie miejsce na hackathonie. Drugie, bo pierwsi mieli ładniejsze slajdy.' },
    { speaker: 'Gienek', text: 'Do dziś twierdzę, że nasz projekt był lepszy. Ale prezentacja to też umiejętność. Nauczyłem się.' },
  ],
  coffee: [
    { speaker: 'Gienek', text: 'Ekspres KNML. Serce koła. Gdy padał, padała cała produktywność.' },
    { speaker: 'Gienek', text: 'Napiłbym się. Ale to tylko sen — a we śnie kawa nigdy nie jest tak dobra jak ta o czwartej nad ranem przed obroną.' },
  ],
  room2Intro: [
    { speaker: 'Toxic Gracz LoL', text: 'gg ez, jungle diff, reportujcie mida. Ty i twoja drużyna to boty.' },
    { speaker: 'Gienek', text: 'Kraina Ligi. Tu każdy ranked to walka o duszę — cudzą i własną.' },
    { speaker: 'Gienek', text: 'Ale ja rządziłem kołem naukowym pełnym studentów przed sesją. Toksyczności się nie boję.' },
    { speaker: 'System', text: 'W walce: strzałki/WASD ruszają serce. WALCZ — traf w środek paska. ZAGRAJ — akcje. ŁASKA — spróbuj oszczędzić.' },
  ],
  room2Smite: [
    { speaker: 'Gienek', text: 'Widzę okno. Bar się ładuje — to moment na Smite.' },
    { speaker: 'System', text: 'Naciśnij SPACJĘ, gdy wskaźnik wejdzie w zieloną strefę!' },
  ],
  room2Key: [
    { speaker: 'Gienek', text: 'Smite trafiony! Klucz „Pierwszy Turniej” wraca do mnie.' },
    { speaker: 'Gienek', text: 'Odwaga, żeby wejść na scenę mimo trzęsących się rąk. Tego mi było trzeba.' },
  ],
  room3Intro: [
    { speaker: 'HR', text: 'Dzień dobry. Poproszę CV, list motywacyjny i pięć lat komercyjnego doświadczenia na stanowisku studenta.' },
    { speaker: 'Gienek', text: 'Wspinaczka po karierze. Od KNML do pierwszego korpo. Każda luka w CV to przepaść.' },
    { speaker: 'Gienek', text: 'Ale przepaście już przeskakiwałem — choćby te między deadline\'ami.' },
    { speaker: 'System', text: 'A/D — ruch, SPACJA/W — skok. Skacz po dokumentach, omijaj „Luki w CV”. Dotrzyj do METY.' },
  ],
  room3Key: [
    { speaker: 'Gienek', text: '„Pierwsza Praca” — klucz zdobyty. HR zostaje w tyle, wciąż machając formularzem.' },
    { speaker: 'Gienek', text: 'Wytrwałość. Nauczyłem się, że „nie” to często tylko „jeszcze nie”.' },
  ],
  room4Intro: [
    { speaker: 'Potężny Kac', text: 'Będę... tańczył... na twojej czaszce... jak na tej studniówce w akademiku...' },
    { speaker: 'Gienek', text: 'Studencka noc była legendarna. Kac jest potężny — ale wspomnienie tamtej imprezy jeszcze potężniejsze.' },
    { speaker: 'System', text: 'Gdy pojawi się litera (W/A/S/D), wciśnij ją zanim zniknie. Spóźnisz się — tracisz HP.' },
  ],
  room4Key: [
    { speaker: 'Gienek', text: '„Najlepsza Impreza” — ostatni klucz! Głowa boli, ale warto było.' },
    { speaker: 'Gienek', text: 'Radość życia. Bez niej reszta to tylko commity bez sensu. Tron Rektora czeka.' },
  ],
  room5Intro: [
    { speaker: 'J.M. Rektor', text: 'Gienek. Myślisz, że trzy klucze wystarczą? Łańcucha nie oddaje się bez walki.' },
    { speaker: 'Gienek', text: 'Przeszedłem przez ligę, karierę i kaca. Jest pan ostatnią przeszkodą, panie Rektorze.' },
    { speaker: 'J.M. Rektor', text: 'Ostatnią? Ja jestem KAŻDĄ przeszkodą. Jestem sesją, która nigdy się nie kończy.' },
  ],
  room5Phase2: [
    { speaker: 'J.M. Rektor', text: 'Faza druga! Podłoga akademicka nie jest wieczna — jak twoje stypendium!' },
    { speaker: 'System', text: 'Przetrwaj na platformach przez 10 sekund. Uważaj na spadające punkty ECTS.' },
  ],
  room5Phase3: [
    { speaker: 'J.M. Rektor', text: 'Dość! Ostateczny cios! Zobaczmy, czy KNML nauczył cię czegoś więcej niż backpropagacji!' },
    { speaker: 'System', text: 'Powtórz sekwencję klawiszy, a potem użyj ostatecznej obrony (SPACJA).' },
  ],
  endingThrone: [
    { speaker: 'J.M. Rektor', text: 'Dobrze... Masz moją moc i mój łańcuch. Tron jest twój, Rektorze Gienku.' },
    { speaker: 'J.M. Rektor', text: 'Może przez cały czas chciałem tylko, żeby ktoś w końcu przeszedł tę sesję z klasą.' },
    { speaker: 'Gienek', text: 'Pierwszy Turniej dał odwagę. Pierwsza Praca — wytrwałość. Najlepsza Impreza — radość.' },
    { speaker: 'Gienek', text: 'Wszystkie klucze wróciły. Siadam na tronie i...' },
  ],
  endingSurprise: [
    { speaker: 'System', text: 'NIESPODZIANKA! Światła zapalają się! Sen pęka jak bańka.' },
    { speaker: 'Gienek', text: 'Co?! To nie koronacja... to... wy wszyscy?! To urodziny?!' },
    { speaker: 'Gienek', text: 'Cały ten sen... prowadził tutaj. Do was.' },
  ],
  endingFinal: [
    { speaker: 'Gienek', text: 'Najlepszy prezent to nie tron ani łańcuch. To ludzie, którzy pamiętają, kim byłem — i lubią, kim jestem.' },
    { speaker: 'Gienek', text: 'Dzięki. Naprawdę. Sto lat samemu sobie, co?' },
    { speaker: 'System', text: 'Naciśnij R, aby zagrać od nowa, albo C, aby zobaczyć napisy końcowe.' },
  ],
};
