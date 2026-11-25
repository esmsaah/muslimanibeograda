// Sav sadržaj sajta na srpskom (ekavica). Prevodi su u src/i18n/*.ts.

export type Dzemat = {id: string; name: string; district: string; address: string; imam?: string; photo?: string; photoAlt?: string; mapQuery: string};

export const DZEMATI: Dzemat[] = [
  {id: 'bajrakli', name: 'Bajrakli džamija', district: 'Stari grad', address: 'Gospodar Jevremova 11', mapQuery: 'Bajrakli džamija, Gospodar Jevremova 11, Beograd'},
  {id: 'islamski-centar', name: 'Mesdžid Islamski centar', district: 'Zvezdara', address: 'Bulevar kralja Aleksandra 241', mapQuery: 'Bulevar kralja Aleksandra 241, Beograd'},
  {id: 'borca', name: 'Borčanska džamija', district: 'Borča', address: 'Beočinska bb', mapQuery: 'Beočinska, Borča, Beograd'},
  {id: 'krnjaca', name: 'Mesdžid Krnjača', district: 'Krnjača', address: 'Palilula', mapQuery: '44.85369,20.51756'},
  {id: 'karaburma', name: 'Džamija na Karaburmi', district: 'Karaburma', address: 'Mirijevsko brdo 66', mapQuery: 'Mirijevsko brdo 66, Beograd'},
  {id: 'zemun', name: 'Mesdžid Vojni put', district: 'Zemun', address: 'Pazovački put 14c', mapQuery: '44.84606,20.37594'},
  {id: 'zemun-polje', name: 'Džamija u Zemun Polju', district: 'Zemun Polje', address: 'Kurirska 41', mapQuery: 'Kurirska 41, Zemun Polje, Beograd'},
  {id: 'batajnica', name: 'Džamija u Batajnici', district: 'Batajnica', address: 'Novosadska 74', mapQuery: 'Novosadska 74, Batajnica, Beograd'},
  {id: 'ledine', name: 'Džamija na Ledinama', district: 'Ledine', address: 'Slovačka 15ž', mapQuery: 'Slovačka 15, Ledine, Beograd'},
  {id: 'surcin', name: 'Džamija u Surčinu', district: 'Surčin', address: 'Marka Pola bb', mapQuery: 'Marka Pola, Surčin, Beograd'},
  {id: 'sremcica', name: 'Džamija u Sremčici', district: 'Sremčica', address: 'Železnički put 13b', mapQuery: 'Železnički put 13b, Sremčica, Beograd'},
];

export interface HalalSpot {
  id: string;
  category: 'halal' | 'bez-svinjetine' | 'kafici' | 'prodavnice';
  categoryLabel: string;
  name: string;
  street: string;
  district: string;
  hours: string;
  note: string;
  communityTip: string;
  phones?: string[];
  website?: string;
  instagram?: string;
  whatsapp?: string;
  photoSrc: string;
  photoAlt: string;
}

export interface CulturalEvent {
  id: string;
  day: string;
  month: string;
  title: string;
  place: string;
  time: string;
  photoSrc: string;
  summary: string;
  when?: string;
  note?: string;
  instagramEmbed?: string;
  instagramUrl?: string;
  applyEmail?: string;
  ticketUrl?: string;
  phone?: string;
  short?: string;
  posterTitle?: string;
  photos?: string[];
  photoContain?: string;
  program?: {when: string; what: string; where: string}[];
  linkLabel?: string;
  noteLabel?: string;
  isoDates?: string[];
  isoEnd?: string;
  posterLabel?: string;
  posterBg?: string;
}

export const HISTORY_STORY = {
  label: 'Istorija i kontinuitet · Beograd',
  title: 'Viševekovni trag muslimana u Beogradu',
  paragraphs: [
    'Prisustvo muslimana u Beogradu utkano je u samo tkivo grada — od starih dorćolskih mahala, nekadašnjih džamija i česmi, do 1867. godine kada Bajrakli džamija ostaje kao jedini sačuvani svedok tog vremena.',
    'Tokom dvadesetog veka grad je oblikovao novi val života: hiljade porodica, radnika, zanatlija i studenata iz Sandžaka, Bosne, Makedonije, sa juga i iz prijateljskih nesvrstanih zemalja gradilo je Novi Beograd i ostavilo nove generacije rođenih Beograđana.',
    'Danas ovu mrežu čine komšije različitih pozadina i generacija. Ovaj sajt nastaje iz potrebe građana da se upoznaju, čuvaju kulturno nasleđe i podržavaju jedni druge u poslu i svakodnevnom životu — potpuno van zvaničnih institucija i bez fizičke adrese.',
  ],
  photoSrc: '/assets/community/506A4303.jpg',
  photoAlt: 'Čitanje knjige pored drvenog prozora u Beogradu',
};

export const SITE_GOALS = [
  {
    num: '01',
    title: 'Pamćenje i otvorena priča',
    text: 'Čuvati istoriju i današnji život muslimana u Beogradu bez stereotipa.',
  },
  {
    num: '02',
    title: 'Komšijska ekonomija',
    text: 'Unajmljivati i preporučivati jedni druge — majstore, lekare, dizajnere, krojače.',
  },
  {
    num: '03',
    title: 'Halal & kulturna mapa',
    text: 'Proverene adrese restorana, kafića, prodavnica i bezalkoholnih dešavanja.',
  },
  {
    num: '04',
    title: 'Van svake institucije',
    text: 'Čisto građansko umrežavanje bez kancelarije, adrese i upravnih tela.',
  },
];

export const HALAL_SPOTS: HalalSpot[] = [
  {id: 'gallos', category: 'halal', categoryLabel: 'Halal', name: 'Gallo\'s', street: 'Čika Ljubina 7 i TC Galerija (Bulevar Vudroa Vilsona 14, 2. sprat, Savski venac)', district: 'Stari grad', hours: '', note: 'Piletina sa roštilja. Dve lokacije.', communityTip: 'Ima halal certifikat, vidi se i na fotografijama u galeriji restorana.', phones: ['066 800 8599', '062 828 8088'], photoSrc: '/assets/community/IMG_7777.jpg', photoAlt: 'Halal hrana u Beogradu'},
  {id: 'cesnili', category: 'halal', categoryLabel: 'Halal', name: 'Češnili Doner', street: 'Zmaj Jovina 6', district: 'Stari grad', hours: '', note: 'Pileći doner, pilav i falafel.', communityTip: 'Restoran navodi da ima halal certifikat.', phones: ['011 764 3190'], photoSrc: '/assets/community/IMG_2412.jpg', photoAlt: 'Halal hrana u Beogradu'},
  {id: 'anadolia', category: 'halal', categoryLabel: 'Halal', name: 'Anadolija', street: 'Strahinjića Bana 66a', district: 'Stari grad', hours: '', note: 'Turska kuhinja.', communityTip: 'Restoran navodi da je halal.', photoSrc: '/assets/community/IMG_7777.jpg', photoAlt: 'Halal hrana u Beogradu'},
  {id: 'yxlanzh', category: 'halal', categoryLabel: 'Halal', name: 'YXlanzh', street: 'Jug Bogdanova 6', district: 'Savski venac', hours: '', note: 'Kineska kuhinja, ručno rađene nudle i knedle.', communityTip: 'Halal kineska kuhinja, prema restoranu.', photoSrc: '/assets/community/IMG_2412.jpg', photoAlt: 'Halal hrana u Beogradu'},
  {id: 'berlin-doner', category: 'halal', categoryLabel: 'Halal', name: 'Real Berlin Doner', street: 'Jug Bogdanova 9', district: 'Savski venac', hours: '', note: 'Doner kebab.', communityTip: 'Restoran navodi da je halal.', photoSrc: '/assets/community/IMG_7777.jpg', photoAlt: 'Halal hrana u Beogradu'},
  {id: 'mujo', category: 'halal', categoryLabel: 'Halal', name: 'Pazarski specijaliteti', street: 'Vojislava Ilića 7', district: 'Zvezdara', hours: '', note: 'Pazarski ćevapi, pite i mantije.', communityTip: 'Halal, prema restoranu.', photoSrc: '/assets/community/IMG_2412.jpg', photoAlt: 'Halal hrana u Beogradu'},
  {id: 'ike', category: 'halal', categoryLabel: 'Halal', name: 'IKE 1997', street: 'Jug Bogdanova 5', district: 'Savski venac', hours: '', note: 'Kineska kuhinja, knedle i nudle.', communityTip: 'Halal kineska kuhinja, prema restoranu.', photoSrc: '/assets/community/IMG_7777.jpg', photoAlt: 'Halal hrana u Beogradu'},
  {id: 'nemrut', category: 'halal', categoryLabel: 'Halal', name: 'Fast Food Nemrut', street: 'Jug Bogdanova 5', district: 'Savski venac', hours: '', note: 'Turski kebab i brza hrana.', communityTip: 'U nazivu ističe da je HALAL.', photoSrc: '/assets/community/IMG_2412.jpg', photoAlt: 'Halal hrana u Beogradu'},
  {id: 'hanan', category: 'halal', categoryLabel: 'Halal', name: 'Restoran Hanan', street: 'Svetogorska 2', district: 'Stari grad', hours: '', note: 'Libanska kuhinja i arapski kolači.', communityTip: 'Na sajtu navodi da služi halal hranu, osoblje je to potvrdilo i usmeno.', phones: ['011 334 5304'], photoSrc: '/assets/community/IMG_7777.jpg', photoAlt: 'Halal hrana u Beogradu'},
  {id: 'hanan-shawarma', category: 'halal', categoryLabel: 'Halal', name: 'Shawarma Hanan', street: 'Strahinjića Bana 57, Njegoševa 31v i Nemanjina 32', district: 'Stari grad', hours: '', note: 'Šavarma, falafel i kibbeh. Tri lokacije.', communityTip: 'Isti vlasnici kao restoran Hanan, koji navodi da služi halal hranu. Adresu na Nemanjinoj proverite pre dolaska.', photoSrc: '/assets/community/IMG_2412.jpg', photoAlt: 'Halal hrana u Beogradu'},
  {id: 'kultura', category: 'halal', categoryLabel: 'Halal', name: 'Restoran Kultura', street: 'Kralja Petra 23 i Cara Lazara 3', district: 'Stari grad', hours: '', note: 'Turska i arapska kuhinja, pide, lahmadžun, šavarma. Više lokacija.', communityTip: 'Halal vodiči je navode kao jedno od pouzdanijih halal mesta u gradu.', phones: ['069 556 5127'], photoSrc: '/assets/community/IMG_2412.jpg', photoAlt: 'Halal hrana u Beogradu'},
  {id: 'meze', category: 'halal', categoryLabel: 'Halal', name: 'Meze Turski Restoran', street: 'Carice Milice 5', district: 'Stari grad', hours: '', note: 'Turski restoran, iskender i adana kebab.', communityTip: 'Halal vodiči navode da je ceo meni halal.', photoSrc: '/assets/community/IMG_7777.jpg', photoAlt: 'Halal hrana u Beogradu'},
  {id: 'falafel-cose', category: 'halal', categoryLabel: 'Halal', name: 'Falafel Ćoše', street: 'Gandijeva 3, Blok 64', district: 'Novi Beograd', hours: '', note: 'Falafel, humus i domaće limunade, libanski kuhar.', communityTip: 'Halal potvrđen iz zajednice.', photoSrc: '/assets/community/IMG_2412.jpg', photoAlt: 'Halal hrana u Beogradu'},
  {id: 'studio-shawarma', category: 'halal', categoryLabel: 'Halal', name: 'Studio Shawarma', street: 'Kralja Milana 20', district: 'Stari grad', hours: '', note: 'Libanska šavarma, humus i falafel.', communityTip: 'Halalfoodle ga navodi kao halal opciju, ali restoran u svom opisu ne navodi zvanični certifikat. Služi alkohol.', photoSrc: '/assets/community/IMG_7777.jpg', photoAlt: 'Halal hrana u Beogradu'},
  {id: 'beef-noodles', category: 'halal', categoryLabel: 'Halal', name: 'Chinese Beef Noodles', street: 'Makedonska 11', district: 'Stari grad', hours: '', note: 'Lanzhou goveđe nudle u supi, ručno vučeni rezanci.', communityTip: 'U nazivu ističe HALAL, a Halalfoodle ga navodi kao halal restoran.', photoSrc: '/assets/community/IMG_7777.jpg', photoAlt: 'Halal hrana u Beogradu'},
  {id: 'afifa', category: 'halal', categoryLabel: 'Halal', name: 'Afifa Halal Food', street: 'Gospodar Jevremova 15', district: 'Stari grad', hours: '', note: 'Šavarma, falafel, humus i šiš tavuk, preko puta Bajrakli džamije.', communityTip: 'U nazivu i opisu ističe da je halal.', phones: ['069 249 2202'], photoSrc: '/assets/community/IMG_2412.jpg', photoAlt: 'Halal hrana u Beogradu'},
  {id: 'savcic', category: 'bez-svinjetine', categoryLabel: 'Bez svinjetine', name: 'Ćevabdžinica Savčić', street: 'Strahinjića Bana 52', district: 'Stari grad', hours: '', note: 'Ćevapi i roštilj.', communityTip: 'Nema halal certifikat, ali ne služi svinjetinu.', photoSrc: '/assets/community/IMG_2412.jpg', photoAlt: 'Halal hrana u Beogradu'},
  {id: 'istanbul', category: 'bez-svinjetine', categoryLabel: 'Bez svinjetine', name: 'Istanbul Turkish Restaurant', street: 'Kraljice Natalije 30 (ex Narodnog fronta)', district: 'Savski venac', hours: '', note: 'Turska kuhinja, kebab, pide iz kamene peći, meze i turski doručak.', communityTip: 'Ne služi svinjetinu. Na društvenim mrežama koristi oznaku halal, ali certifikat nije naveden.', photoSrc: '/assets/community/IMG_7777.jpg', photoAlt: 'Halal hrana u Beogradu'},
  {id: 'ujgurski', category: 'halal', categoryLabel: 'Halal', name: 'R-Tiam Uyghur Restaurant', street: 'Balkanska 8', district: 'Savski venac', hours: '', note: 'Ujgurska kuhinja, ručno vučene nudle i jagnjetina.', communityTip: 'Restoran na društvenim mrežama navodi da služi samo halal hranu.', photoSrc: '/assets/community/IMG_2412.jpg', photoAlt: 'Halal hrana u Beogradu'},
  {id: 'doner-kuca', category: 'halal', categoryLabel: 'Halal', name: 'Doner kuća', street: 'Gavrila Principa 35', district: 'Savski venac', hours: '', note: 'Doner kebab.', communityTip: 'Na meniju ima halal oznaku.', photoSrc: '/assets/community/IMG_7777.jpg', photoAlt: 'Halal hrana u Beogradu'},
  {id: 'bowl-doner', category: 'bez-svinjetine', categoryLabel: 'Bez svinjetine', name: 'Bowl Doner', street: 'Banatska 89', district: 'Zemun', hours: '', note: 'Doner u činiji i sendviču.', communityTip: 'Ne služi svinjetinu. Na društvenim mrežama koristi halal oznake, ali halal nije zvanično potvrđen.', photoSrc: '/assets/community/IMG_2412.jpg', photoAlt: 'Halal hrana u Beogradu'},
  {id: 'donerium', category: 'bez-svinjetine', categoryLabel: 'Bez svinjetine', name: 'Donerium Kebab House', street: 'Milentija Popovića 32A', district: 'Novi Beograd', hours: '', note: 'Doner i kebab.', communityTip: 'Ne služi svinjetinu. Na društvenim mrežama koristi halal oznake, ali halal nije zvanično potvrđen.', photoSrc: '/assets/community/IMG_2412.jpg', photoAlt: 'Halal hrana u Beogradu'},
  {id: 'mama-sara-zemun', category: 'halal', categoryLabel: 'Halal', name: 'Mama Sara', street: 'Karađorđeva 14B', district: 'Zemun', hours: '', note: 'Šavarma, falafel, baklava i sutlijaš.', communityTip: 'Na meniju ima halal oznaku.', photoSrc: '/assets/community/IMG_7777.jpg', photoAlt: 'Halal hrana u Beogradu'},
  {id: 'mama-sara-airport', category: 'halal', categoryLabel: 'Halal', name: 'Mama Sara', street: 'Omladinskih brigada 98, Airport City', district: 'Novi Beograd', hours: '', note: 'Šavarma, falafel, baklava i sutlijaš.', communityTip: 'Na meniju ima halal oznaku.', photoSrc: '/assets/community/IMG_2412.jpg', photoAlt: 'Halal hrana u Beogradu'},
  {id: 'alibaba', category: 'prodavnice', categoryLabel: 'Prodavnica', name: 'Ali Baba Hanabal', street: 'Golsvortijeva 21', district: 'Vračar', hours: '', note: 'Arapska radnja, duh orijenta u centru grada. Ručno rađene kožne torbe, rančevi, sandale, papuče, kaiševi, novčanici i taburei, tunižanska ručno rađena keramika i tadžini, ćilimi, suveniri, nakit i nargile.', communityTip: 'Maloprodaja i veleprodaja.', phones: ['011 244 30 89', '065 57 59 385'], photoSrc: '/assets/community/IMG_7777.jpg', photoAlt: 'Prodavnica u Beogradu'},
  {id: 'meandri', category: 'prodavnice', categoryLabel: 'Prodavnica', name: 'Meandri', street: 'Jelisavete Načić 4 i Porečka 1 (Palilula)', district: 'Stari grad', hours: '', note: 'Halal mesnica. Sveže meso i peštersko-sjenički proizvodi.', communityTip: 'Halal mesnica, potvrđeno iz zajednice. Radno vreme na Jelisavete Načić od 8 do 16h.', phones: ['062 856 0014'], photoSrc: '/assets/community/IMG_7777.jpg', photoAlt: 'Prodavnica u Beogradu'},
  {id: 'jusuf', category: 'prodavnice', categoryLabel: 'Prodavnica', name: 'Jusuf', street: 'Kalenić pijaca', district: 'Vračar', hours: '', note: 'Suho meso i sir na Kalenić pijaci.', communityTip: '', phones: [], photoSrc: '/assets/community/IMG_7777.jpg', photoAlt: 'Prodavnica u Beogradu'},
  {id: 'gari', category: 'prodavnice', categoryLabel: 'Prodavnica', name: 'Gari', street: 'Palilulska pijaca', district: 'Palilula', hours: '', note: 'Zrnasti, orašasti i mahunasti proizvodi, suvo voće i začini vrhunskog kvaliteta. Dostava na kućnu adresu.', communityTip: 'Dostava na kućnu adresu, narudžbe telefonom ili preko Instagrama.', phones: ['063 190 7772'], instagram: 'gari_orah', photoSrc: '/assets/community/IMG_7777.jpg', photoAlt: 'Prodavnica u Beogradu'},
  {id: 'arapski-ducan', category: 'prodavnice', categoryLabel: 'Prodavnica', name: 'Arapski dućan', street: 'Prvomajska', district: 'Zemun', hours: '', note: 'Arapske namirnice, pirinač i žitarice, mahunarke, začini, ulja i ghee, sirevi, slatkiši, urme i orašasto, sokovi i kafa, kao i paketi za mansaf, kabsu i musakhan.', communityTip: 'Radnja u Prvomajskoj, otvara se u 9h. Naručuje se i online preko sajta ili WhatsAppa, uz dostavu.', website: 'https://arapskiducan.com', whatsapp: '062 976 3260', photoSrc: '/assets/community/IMG_7777.jpg', photoAlt: 'Prodavnica u Beogradu'},
  {id: 'turk-marketi', category: 'prodavnice', categoryLabel: 'Prodavnica', name: 'Belgrad Türk Marketi', street: 'Zage Malivuk 19F', district: 'Palilula', hours: '', note: 'Turske i bliskoistočne namirnice, začini, doručak, turšija, sosevi, slatkiši i rahat lokum, pića, mahunarke, gotova jela i oprema za čaj. Radi i veleprodaja.', communityTip: 'Prvi broj je za srpski i engleski, drugi za turski. Radi pon–sub 10–18h. Besplatna dostava po Beogradu za narudžbe preko 5.000 RSD.', phones: ['060 413 07 85', '060 413 07 86'], website: 'https://belgradturkmarketi.com/sr/', photoSrc: '/assets/community/IMG_7777.jpg', photoAlt: 'Prodavnica u Beogradu'},
  {id: 'latife', category: 'kafici', categoryLabel: 'Kafić', name: 'Latife Belgrade', street: 'Zmaj Jovina 7', district: 'Stari grad', hours: '', note: 'Kafić u centru grada.', communityTip: 'Nije potvrđeno halal i na meniju ima alkoholna pića (pivo, žestoka pića i rakiju). Šunka im je pureća i nemaju svinjetinu.', photoSrc: '/assets/community/IMG_7777.jpg', photoAlt: 'Kafić u Beogradu'},
];

export const CULTURAL_EVENTS: CulturalEvent[] = [
  {
    id: 'dani-solidarnosti',
    isoDates: ['2026-11-24T19:00:00+01:00'],
    isoEnd: '2026-11-29T19:00:00+01:00',
    day: '24–29',
    month: 'NOV',
    time: '',
    short: 'nov',
    when: 'Od 24. do 29. novembra',
    title: 'Dani solidarnosti sa narodom Palestine',
    place: 'Više lokacija u Beogradu',
    photoSrc: '',
    photos: ['/assets/events/dani-solidarnosti.jpg'],
    summary:
      'Treće izdanje programa kolektiva Za slobodnu Palestinu. Nedelju dana izložbi, predavanja, muzike i razgovora, a na kraju bazar za pomoć narodu Palestine.',
    note: 'Deo programa održava se u kafićima i barovima.',
    noteLabel: 'Dobro je znati',
    program: [
      {when: 'Uto 24. nov, 19h', what: 'Otvaranje izložbe „Gde sjaj prebiva", 32 politička plakata iz zbirke Muzeja Palestine', where: 'Galerija Artget, Knez Mihailova 6'},
      {when: 'Sre 25. nov, 19h', what: 'Posteri za solidarnost i upoznavanje sa kolektivom', where: 'Leposava bar, Velike stepenice 6'},
      {when: 'Čet 26. nov, 19h', what: 'Predavanje „Arheologija pod okupacijom", Duška Radosavljević', where: 'Kafe bar 16, Cetinjska 15a'},
      {when: 'Pet 27. nov, 20h', what: 'Muzičko veče Global South Bangers, Acid Amazigh, SAUD i PhillieP', where: 'Ljubimac bar, Cetinjska 15'},
      {when: 'Sub 28. nov, 18h', what: 'Razgovor „Solidarnost sa narodom Palestine: regionalna borba i otpor" sa grupama Nepokorena Palestina i Nepokolebljiva', where: 'Galerija Artget, Knez Mihailova 6'},
      {when: 'Sub 28. nov, 21h', what: 'Acid Amazigh uživo, ulaz uz dobrovoljni prilog za kolektiv', where: 'Sutra.145, Čumićevo sokače 145'},
      {when: 'Ned 29. nov, 13–19h', what: 'Bazar za Palestinu, muzika Jelena Martinović i P.Amir', where: 'Leposava bar, Velike stepenice 6'},
    ],
    ticketUrl: 'https://zaslobodnupalestinu.org/dani-solidarnosti-sa-narodom-palestine-3/',
    linkLabel: 'Ceo program',
    instagramUrl: 'https://www.instagram.com/zaslobodnupalestinu/',
  },
  {
    id: 'hasanaginica',
    isoDates: ['2026-11-26T20:30:00+01:00', '2026-12-16T20:30:00+01:00'],
    day: '26',
    month: 'NOV',
    time: '20:30',
    when: '26. novembar i 16. decembar, u 20:30',
    short: 'nov, 20:30',
    posterTitle: 'Hasanaginica',
    photos: ['/assets/events/hasanaginica-1.jpg', '/assets/events/hasanaginica-2.jpg'],
    posterLabel: 'Narodno pozorište',
    title: 'Hasanaginica u Narodnom pozorištu',
    place: 'Narodno pozorište · Scena Raša Plaović, Francuska 3',
    photoSrc: '',
    summary:
      'Drama Ljubomira Simovića prema čuvenoj baladi o Hasanaginici. Predstava je premijerno izvedena 2001. godine i godinama je na repertoaru, a Vanja Ejdus je za naslovnu ulogu dobila Sterijinu nagradu.',
    ticketUrl: 'https://www.narodnopozoriste.rs/lat/predstave/hasanaginica',
    phone: '011 262 0946',
  },
  {
    id: 'deli-monday',
    day: 'PON',
    month: '',
    time: '18:00',
    when: 'Svakog ponedeljka od 18h',
    short: 'svakog, od 18h',
    title: 'Deli Monday u KC Gradu',
    place: 'KC Grad · Braće Krsmanović 4',
    photoSrc: '',
    summary:
      'Od 2011. godine svakog ponedeljka u KC Gradu kuva neko drugi, a publika jede za bon od 600 dinara. Na stolu je svaki put druga kuhinja sveta, uvek uz vegetarijansku i vegansku opciju.',
    note: 'Hrana nije automatski halal jer se kuvari menjaju. Proverite šta se sprema te večeri.',
    instagramEmbed: 'https://www.instagram.com/p/DgFQM6DjHl-/embed/',
    instagramUrl: 'https://www.instagram.com/p/DgFQM6DjHl-/',
    applyEmail: 'deli@gradbeograd.eu',
  },
];

export type UsefulContact = {name: string; note: string; phone?: string; link?: string; linkLabel?: string};

export type ContactGroup = {title: string; items: UsefulContact[]};

export const USEFUL_CONTACTS: ContactGroup[] = [
  {title: 'Hitno', items: [
    {name: 'Hitna pomoć', note: 'Medicinski hitni slučajevi', phone: '194'},
    {name: 'Policija', note: 'Napad, krađa, nesreća', phone: '192'},
    {name: 'Vatrogasci', note: 'Požar i spašavanje', phone: '193'},
    {name: 'Opšti broj za hitne slučajeve', note: 'Sa mobilnog telefona', phone: '112'},
  ]},
  {title: 'Zdravlje', items: [
    {name: 'Urgentni centar', note: 'Pasterova 2, radi 24h', phone: '011 361 8444'},
    {name: 'Ambulanta Hitne pomoći za odrasle', note: 'Franše d\'Eperea 5, radi 24h', phone: '011 361 5013'},
    {name: 'Dežurna apoteka Prvi maj', note: 'Kralja Milana 9, radi 24h', phone: '011 324 1349'},
  ]},
  {title: 'Papiri i posao', items: [
    {name: 'Uprava za strance', note: 'Omladinskih brigada 1, Novi Beograd', phone: '011 361 8956'},
    {name: 'Portal za strance', note: 'Vize, boravak i rad, zahtevi online', link: 'https://welcometoserbia.gov.rs', linkLabel: 'welcometoserbia.gov.rs'},
    {name: 'Nacionalna služba za zapošljavanje', note: 'Oglasi za posao i savetnici', link: 'https://www.nsz.gov.rs', linkLabel: 'nsz.gov.rs'},
  ]},
  {title: 'Stan i grad', items: [
    {name: 'Servisni centar Grada', note: 'Voda, grejanje, čistoća, parking', phone: '11011'},
    {name: 'Elektrodistribucija', note: 'Struja, kvarovi i stanje brojila, besplatno', phone: '0800 360 300'},
  ]},
  {title: 'Prevoz', items: [
    {name: 'Aerodrom Nikola Tesla', note: 'Informacije o letovima', phone: '011 209 4444'},
    {name: 'Pink Taxi', note: 'Taksi, radi 24h', phone: '19803'},
    {name: 'Naxis Taxi', note: 'Taksi, radi 24h', phone: '19804'},
  ]},
];

export type FaqItem = {q: string; a: string};

export const FAQ: FaqItem[] = [
  {q: 'Gde mogu da jedem halal u Beogradu?', a: 'Najviše halal restorana je u centru, na Dorćolu, oko Zelenog venca i Savskog venca. Ima libanske, turske, arapske, pa i kineske i ujgurske kuhinje, a nekoliko mesta je i u Zemunu i na Novom Beogradu. Kod svakog mesta na sajtu piše kako znamo da je halal. Ako niste sigurni, slobodno pitajte za certifikat.'},
  {q: 'Gde da kupim halal meso i namirnice?', a: 'Halal mesnica Meandri je u Jelisavete Načić 4 i u Porečkoj 1. Suho meso i sir ima Jusuf na Kalenić pijaci, a arapske i turske namirnice Arapski dućan u Zemunu i Belgrad Türk Marketi na Paliluli. Neke radnje dostavljaju i na kućnu adresu.'},
  {q: 'Gde mogu da klanjam u Beogradu?', a: 'U Beogradu ima jedanaest džamija i mesdžida, na Dorćolu, Zvezdari i Karaburmi, u Borči i Krnjači, u Zemunu, Zemun Polju i Batajnici, na Ledinama, u Surčinu i Sremčici. Na sajtu su adresa i mapa za svaki, pa lako nađete onaj koji vam je najbliži.'},
  {q: 'Gde se klanja džuma?', a: 'Džuma se klanja u Bajrakli džamiji na Dorćolu, u mesdžidu Islamskog centra na Bulevaru kralja Aleksandra 241 i u džematima po naseljima, na primer u Borči, Zemunu, Ledinama i Sremčici. Islamski centar je imao i drugu, kasniju džumu sa hutbom na arapskom. Vreme džume se menja leti i zimi, pa ga proverite u svom džematu.'},
  {q: 'Kada je namaz danas?', a: 'Vaktija za Beograd je na sajtu, u delu Džemati Beograda. Menja se sama svakog dana, a sledeći namaz je označen zelenom bojom.'},
  {q: 'Postoji li nešto za sestre?', a: 'Da, postoji ženski džemat, grupa za sestre na WhatsAppu. Link za pristup je u delu Umrežavanje i na dnu sajta.'},
  {q: 'Tek sam se doselio u Beograd. Šta prvo da sredim?', a: 'Ako niste državljanin Srbije, boravak i rad se sređuju u Upravi za strance u Omladinskih brigada 1 na Novom Beogradu, a većina zahteva može da se preda i preko portala welcometoserbia.gov.rs. Posao možete tražiti preko Nacionalne službe za zapošljavanje. Sve važne brojeve za grad, zdravlje i prevoz smo skupili u delu Koga zvati.'},
  {q: 'Koje brojeve treba da znam?', a: 'Hitna pomoć je 194, policija 192, vatrogasci 193, a sa mobilnog možete zvati i 112. Urgentni centar u Pasterovoj 2 radi 24 časa, kao i dežurna apoteka Prvi maj u Kralja Milana 9.'},
  {q: 'Kako da upoznam druge muslimane u Beogradu?', a: 'Dođite na džumu ili na neki od događaja sa sajta, tako se ljudi najlakše upoznaju. Pratite nas i na Facebooku, a ako vam treba neko za posao ili savet, u delu Umrežavanje možete preporučiti ili naći majstore, lekare i preduzetnike iz zajednice.'},
  {q: 'Znam dobro mesto ili događaj. Kako da vam javim?', a: 'Pišite nam preko forme Javi nam se na dnu sajta ili na muslimanibeograda@proton.me. Za događaje postoji i dugme Predloži događaj. Svaki predlog pogledamo pre nego što ga dodamo.'},
  {q: 'Ko pravi ovaj sajt?', a: 'Mi smo Sumud, grupa muslimana koji žive u Beogradu. Nismo deo nijedne verske ni državne institucije, sajt pravimo za sebe i za sve koji ovde žive ili dolaze. Ako vidite grešku, javite nam.'},
];
