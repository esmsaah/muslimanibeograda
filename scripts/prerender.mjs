// Posle builda pravi gotov HTML za svaki jezik (/, /en/, /ar/, /tr/),
// strukturirane podatke za Google, sitemap i llms.txt za AI asistente.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const SITE = 'https://muslimanibeograda.com';
const ssr = await import(pathToFileURL(path.join(ROOT, 'dist-ssr/entry-server.js')).href);
const {render, pathFor, DICTS, FAQ, CULTURAL_EVENTS, DZEMATI, HALAL_SPOTS, USEFUL_CONTACTS, HISTORY_STORY} = ssr;

const LANGS = [
  {code: 'sr', path: '/', html: 'sr-Latn', og: 'sr_RS'},
  {code: 'en', path: '/en/', html: 'en', og: 'en_US'},
  {code: 'ar', path: '/ar/', html: 'ar', og: 'ar_AR'},
  {code: 'tr', path: '/tr/', html: 'tr', og: 'tr_TR'},
];

const T = (lang, s) => (!s || lang === 'sr' ? s : DICTS[lang]?.[s] ?? s);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const telIntl = (p) => '+381' + p.replace(/\D/g, '').replace(/^0/, '');

const TITLE = 'Muslimani Beograda · halal restorani, džamije i događaji | Sumud';
const DESC = 'Halal restorani i prodavnice, džamije i mesdžidi, kulturni događaji i važni kontakti za muslimane u Beogradu.';
const SHARE = 'Halal mesta, džamije, događaji i umrežavanje muslimana u Beogradu.';

const spotType = (c) => (c === 'prodavnice' ? 'Store' : c === 'kafici' ? 'CafeOrCoffeeShop' : 'Restaurant');
const NO_ADDR = 'Adresu dodajemo uskoro';
const address = (street, district) => ({
  '@type': 'PostalAddress',
  ...(street && street !== NO_ADDR && street !== T('en', NO_ADDR) ? {streetAddress: street} : {}),
  addressLocality: district ? `Beograd, ${district}` : 'Beograd',
  addressRegion: 'Beograd',
  addressCountry: 'RS',
});

function homeGraph(lang, url) {
  const graph = [
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      name: 'Sumud · Muslimani Beograda',
      alternateName: ['Muslimani Beograda', 'Sumud', 'Belgrade Muslim Collective', 'Muslims of Belgrade'],
      url: `${SITE}/`,
      inLanguage: LANGS.map((l) => l.html),
      description: T(lang, DESC),
      publisher: {'@id': `${SITE}/#org`},
    },
    {
      '@type': 'Organization',
      '@id': `${SITE}/#org`,
      name: 'Sumud · Muslimani Beograda',
      url: `${SITE}/`,
      logo: `${SITE}/assets/sumud-znak.svg`,
      email: 'muslimanibeograda@proton.me',
      sameAs: ['https://www.facebook.com/share/g/19ucSXWVUp/'],
      areaServed: {'@type': 'City', name: 'Beograd'},
      description: `${T(lang, 'Kolektiv muslimana Beograda – Sumud')} ${T(lang, 'je prostor susreta, povezivanja i solidarnosti muslimana koji žive, rade, studiraju ili posećuju Beograd.')}`,
    },
    {
      '@type': 'WebPage',
      '@id': `${url}#page`,
      url,
      name: T(lang, TITLE),
      inLanguage: LANGS.find((l) => l.code === lang).html,
      isPartOf: {'@id': `${SITE}/#website`},
      about: {'@type': 'Thing', name: T(lang, 'Muslimani Beograda')},
    },
    {
      '@type': 'ItemList',
      name: T(lang, 'Halal Beograd'),
      itemListElement: HALAL_SPOTS.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': spotType(s.category),
          name: s.name,
          address: address(T(lang, s.street), s.district),
          ...(s.category !== 'prodavnice' ? {servesCuisine: T(lang, s.note)} : {description: T(lang, s.note)}),
          ...(s.phones?.length ? {telephone: telIntl(s.phones[0])} : {}),
          ...(s.website || s.instagram ? {sameAs: [s.website, s.instagram].filter(Boolean)} : {}),
        },
      })),
    },
    {
      '@type': 'ItemList',
      name: T(lang, 'Džemati Beograda'),
      itemListElement: DZEMATI.map((d, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {'@type': 'Mosque', name: T(lang, d.name), address: address(d.address, d.district)},
      })),
    },
  ];
  for (const e of CULTURAL_EVENTS) {
    for (const start of e.isoDates ?? []) {
      graph.push({
        '@type': 'Event',
        name: T(lang, e.title),
        description: T(lang, e.summary),
        startDate: start,
        ...(e.isoEnd ? {endDate: e.isoEnd} : {}),
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        location: {'@type': 'Place', name: T(lang, e.place), address: address(T(lang, e.place), '')},
        image: `${SITE}${(e.photos?.[0] ?? e.photoSrc).replace(/^\/?/, '/')}`,
        ...(e.ticketUrl ? {url: e.ticketUrl} : {}),
      });
    }
  }
  return graph;
}

const ld = (graph) => JSON.stringify({'@context': 'https://schema.org', '@graph': graph}).replace(/</g, '\\u003c');
const SITE_NAME = (lang) => T(lang, 'Muslimani Beograda');
const CAT_TITLE = {halal: 'Halal restoran u Beogradu', 'bez-svinjetine': 'Restoran u Beogradu', kafici: 'Kafić u Beogradu', prodavnice: 'Halal prodavnica u Beogradu'};
const clip = (s, n = 300) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s);
const crumbs = (lang, items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, item], i) => ({'@type': 'ListItem', position: i + 1, name, item})),
});

function routes() {
  return [
    {kind: 'home'},
    {kind: 'pitanja'},
    {kind: 'vaktija'},
    ...HALAL_SPOTS.map((x) => ({kind: 'halal', id: x.id})),
    ...DZEMATI.map((x) => ({kind: 'dzamija', id: x.id})),
    ...CULTURAL_EVENTS.map((x) => ({kind: 'dogadjaj', id: x.id})),
  ];
}

function page(lang, route) {
  const url = SITE + pathFor(lang, route);
  const home = SITE + pathFor(lang, {kind: 'home'});
  const website = {'@type': 'WebSite', '@id': `${SITE}/#website`, name: 'Sumud · Muslimani Beograda', url: `${SITE}/`};
  if (route.kind === 'halal') {
    const s = HALAL_SPOTS.find((x) => x.id === route.id);
    const title = `${s.name}, ${T(lang, s.street).split(' (')[0]} · ${T(lang, CAT_TITLE[s.category])} | ${SITE_NAME(lang)}`;
    const desc = clip([`${s.name}, ${T(lang, s.street)}, ${s.district}.`, T(lang, s.note), T(lang, s.communityTip), T(lang, 'Adresa, telefon i halal status, uz sva halal mesta u Beogradu.')].filter(Boolean).join(' '));
    const entity = {
      '@type': spotType(s.category),
      '@id': `${url}#place`,
      name: s.name,
      url,
      description: [T(lang, s.note), T(lang, s.communityTip)].filter(Boolean).join(' '),
      address: address(T(lang, s.street), s.district),
      ...(s.category !== 'prodavnice' ? {servesCuisine: T(lang, s.note)} : {}),
      ...(s.phones?.length ? {telephone: telIntl(s.phones[0])} : {}),
      ...(s.website || s.instagram ? {sameAs: [s.website, s.instagram && `https://www.instagram.com/${s.instagram}/`].filter(Boolean)} : {}),
      image: `${SITE}/assets/halal/${s.id}.jpg`,
    };
    return {url, title, desc, graph: [website, entity, crumbs(lang, [[SITE_NAME(lang), home], [T(lang, 'Halal Beograd'), `${home}#halal-beograd`], [s.name, url]])]};
  }
  if (route.kind === 'dzamija') {
    const d = DZEMATI.find((x) => x.id === route.id);
    const name = T(lang, d.name);
    const where = d.address === NO_ADDR ? d.district : d.address;
    const title = `${name}, ${where} · ${T(lang, 'Džamija u Beogradu')} | ${SITE_NAME(lang)}`;
    const desc = `${name}, ${d.address === NO_ADDR ? '' : d.address + ', '}${d.district}. ${T(lang, 'Adresa, mapa i svi džemati Beograda na jednom mestu.')}`;
    const entity = {'@type': 'Mosque', '@id': `${url}#place`, name, url, address: address(d.address, d.district), hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.mapQuery)}`};
    return {url, title, desc, graph: [website, entity, crumbs(lang, [[SITE_NAME(lang), home], [T(lang, 'Džemati Beograda'), `${home}#dzemati`], [name, url]])]};
  }
  if (route.kind === 'dogadjaj') {
    const e = CULTURAL_EVENTS.find((x) => x.id === route.id);
    const name = T(lang, e.title);
    const when = T(lang, e.when ?? `${e.day} ${e.month}`);
    const title = `${name} · ${when} | ${SITE_NAME(lang)}`;
    const desc = clip(`${name}, ${when}, ${T(lang, e.place)}. ${T(lang, e.summary)}`);
    const events = (e.isoDates ?? []).map((start, i) => ({
      '@type': 'Event',
      '@id': `${url}#event-${i}`,
      name,
      description: T(lang, e.summary),
      startDate: start,
      ...(e.isoEnd ? {endDate: e.isoEnd} : {}),
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: {'@type': 'Place', name: T(lang, e.place), address: address(T(lang, e.place), '')},
      image: `${SITE}${(e.photos?.[0] ?? e.photoSrc).replace(/^\/?/, '/')}`,
      url,
    }));
    const og = fs.existsSync(path.join(ROOT, 'public/assets/events/og', `${e.id}.jpg`)) ? `${SITE}/assets/events/og/${e.id}.jpg` : undefined;
    return {url, title, desc, og, graph: [website, ...events, crumbs(lang, [[SITE_NAME(lang), home], [T(lang, 'Kulturni događaji'), `${home}#kulturni-dogadjaji`], [name, url]])]};
  }
  if (route.kind === 'vaktija') {
    return {url, title: T(lang, 'Vaktija Beograd · vreme namaza danas | Muslimani Beograda'), desc: T(lang, 'Današnja vaktija za Beograd. Sabah, podne, ikindija, akšam i jacija, uz sve džamije i mesdžide u gradu.'), graph: [website, crumbs(lang, [[SITE_NAME(lang), home], [T(lang, 'Vreme namaza · Beograd'), url]])]};
  }
  if (route.kind === 'pitanja') {
    const faq = {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      url,
      mainEntity: FAQ.map((f) => ({'@type': 'Question', name: T(lang, f.q), acceptedAnswer: {'@type': 'Answer', text: T(lang, f.a)}})),
    };
    return {url, title: T(lang, 'Česta pitanja · muslimani u Beogradu | Sumud'), desc: T(lang, 'Gde jesti halal, gde je džamija, gde se klanja džuma i koje brojeve treba znati u Beogradu.'), graph: [website, faq]};
  }
  return {url, title: T(lang, TITLE), desc: T(lang, DESC), graph: homeGraph(lang, url)};
}

const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const allUrls = [];
let count = 0;

for (const route of routes()) {
  const alts = LANGS.map((a) => [a.html, SITE + pathFor(a.code, route)]);
  allUrls.push(alts);
  for (const l of LANGS) {
    const {url, title, desc, graph, og} = page(l.code, route);
    const share = route.kind === 'home' ? T(l.code, SHARE) : desc;
    const ogTitle = route.kind === 'home' ? T(l.code, 'Sumud · Muslimani Beograda') : title;
    const head = [
      ...alts.map(([hl, href]) => `<link rel="alternate" hreflang="${hl}" href="${href}" />`),
      `<link rel="alternate" hreflang="x-default" href="${alts[0][1]}" />`,
      `<script type="application/ld+json">${ld(graph)}</script>`,
    ].join('\n    ');
    let html = template
      .replace(/<html lang="[^"]*"/, `<html lang="${l.html}" dir="${l.code === 'ar' ? 'rtl' : 'ltr'}"`)
      .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
      .replace(/(<meta name="description" content=")[^"]*"/, `$1${esc(desc)}"`)
      .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${url}"`)
      .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${esc(ogTitle)}"`)
      .replace(/(<meta name="twitter:title" content=")[^"]*"/, `$1${esc(ogTitle)}"`)
      .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${esc(share)}"`)
      .replace(/(<meta name="twitter:description" content=")[^"]*"/, `$1${esc(share)}"`)
      .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${url}"`)
      .replace(/(<meta property="og:locale" content=")[^"]*"/, `$1${l.og}"`)
      .replace(/(<meta property="og:image" content=")[^"]*"/, `$1${og ?? `${SITE}/og-image.jpg`}"`)
      .replace(/(<meta name="twitter:image" content=")[^"]*"/, `$1${og ?? `${SITE}/og-image.jpg`}"`)
      .replace('<!--seo-->', head);
    const body = render(l.code, route);
    html = html.replace(/<div id="root">[\s\S]*?<\/div>(\s*<script|\s*<\/body>)/, `<div id="root" data-prerendered="${l.code}">${body}</div>$1`);
    if (!html.includes(`data-prerendered="${l.code}"`)) throw new Error('root not found in template');
    const out = path.join(DIST, decodeURI(new URL(url).pathname), 'index.html');
    fs.mkdirSync(path.dirname(out), {recursive: true});
    fs.writeFileSync(out, html);
    count++;
  }
}
console.log(`prerender ${count} stranica`);

// Sitemap
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(
  path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allUrls
  .flatMap((alts) => {
    const links = alts.map(([hl, href]) => `    <xhtml:link rel="alternate" hreflang="${hl}" href="${href}"/>`).join('\n');
    return alts.map(([, href]) => `  <url>\n    <loc>${href}</loc>\n${links}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${alts[0][1]}"/>\n    <lastmod>${today}</lastmod>\n  </url>`);
  })
  .join('\n')}
</urlset>
`,
);

// llms.txt (kratko) i llms-full.txt (sve), na engleskom i srpskom
function fullText(lang) {
  const t = (s) => T(lang, s);
  const L = [];
  L.push(`## ${t('Halal Beograd')}`, '');
  for (const s of HALAL_SPOTS) {
    const bits = [t(s.categoryLabel), `${t(s.street)}, ${s.district}`, t(s.note), t(s.communityTip)];
    if (s.phones?.length) bits.push(s.phones.join(', '));
    if (s.website) bits.push(s.website);
    if (s.instagram) bits.push(s.instagram);
    L.push(`- **[${s.name}](${SITE}${pathFor(lang, {kind: 'halal', id: s.id})})** · ${bits.filter(Boolean).join(' · ')}`);
  }
  L.push('', `## ${t('Džemati Beograda')}`, '');
  for (const d of DZEMATI) L.push(`- **[${t(d.name)}](${SITE}${pathFor(lang, {kind: 'dzamija', id: d.id})})** · ${d.address === NO_ADDR ? d.district : `${d.address}, ${d.district}`}`);
  L.push('', `## ${t('Kulturni događaji')}`, '');
  for (const e of CULTURAL_EVENTS) {
    const bits = [t(e.when ?? `${e.day} ${e.month}`), t(e.place), t(e.summary)];
    if (e.ticketUrl) bits.push(e.ticketUrl);
    if (e.instagramUrl) bits.push(e.instagramUrl);
    L.push(`- **${t(e.title)}** · ${bits.filter(Boolean).join(' · ')}`);
  }
  L.push('', `## ${t('Česta pitanja')}`, '');
  for (const f of FAQ) L.push(`### ${t(f.q)}`, t(f.a), '');
  L.push(`## ${t('Koga zvati')}`, '');
  for (const g of USEFUL_CONTACTS) {
    L.push(`### ${t(g.title)}`);
    for (const c of g.items) L.push(`- **${t(c.name)}** · ${[t(c.note), c.phone, c.link].filter(Boolean).join(' · ')}`);
  }
  return L.join('\n');
}

const intro = `# Sumud · Muslimani Beograda (Belgrade Muslim Collective)

> Sumud is a grassroots, non-institutional network of Muslims in Belgrade, Serbia. The site muslimanibeograda.com lists halal restaurants, cafés and shops, all mosques and masjids of Belgrade by municipality, cultural events, useful phone numbers for newcomers to the city, and a directory of Muslim professionals and entrepreneurs. It is useful for any Muslim who lives in, moves to or visits Belgrade.

Languages: Serbian (${SITE}/), English (${SITE}/en/), Arabic (${SITE}/ar/), Turkish (${SITE}/tr/).
Contact: muslimanibeograda@proton.me

## Pages
- [Serbian](${SITE}/): Muslimani Beograda, halal Beograd, džamije i mesdžidi, događaji, kontakti
- [English](${SITE}/en/): halal food in Belgrade, mosques in Belgrade, events, useful contacts
- [Arabic](${SITE}/ar/): حلال في بلغراد، مساجد بلغراد
- [Turkish](${SITE}/tr/): Belgrad'da helal yemek, camiler
- [Full data](${SITE}/llms-full.txt): every listed place, mosque, event and contact
`;

fs.writeFileSync(path.join(DIST, 'llms.txt'), intro);
fs.writeFileSync(
  path.join(DIST, 'llms-full.txt'),
  `${intro}\n\n# English\n\n${fullText('en')}\n\n# Srpski\n\n${fullText('sr')}\n`,
);
console.log('sitemap.xml, llms.txt, llms-full.txt');
