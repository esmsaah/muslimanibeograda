// Adrese pojedinačnih mesta. Sajt ostaje jedna stranica, ali svaki restoran,
// džamija i stranica sa pitanjima ima svoju adresu, pa ih Google i AI nalaze.
import type {Lang} from './i18n';

export type Route = {kind: 'home'} | {kind: 'halal'; id: string} | {kind: 'dzamija'; id: string} | {kind: 'pitanja'} | {kind: 'vaktija'};

const LANG_PREFIX: Record<Lang, string> = {sr: '', en: '/en', ar: '/ar', tr: '/tr'};
const MOSQUE_SEG: Record<Lang, string> = {sr: 'dzamije', en: 'mosques', ar: 'mosques', tr: 'camiler'};
const FAQ_SEG: Record<Lang, string> = {sr: 'pitanja', en: 'faq', ar: 'faq', tr: 'sss'};
const VAKTIJA_SEG: Record<Lang, string> = {sr: 'vaktija', en: 'prayer-times', ar: 'prayer-times', tr: 'namaz-vakitleri'};
const ALL_VAKTIJA = new Set(Object.values(VAKTIJA_SEG));
const ALL_MOSQUE = new Set(Object.values(MOSQUE_SEG));
const ALL_FAQ = new Set(Object.values(FAQ_SEG));

export function pathFor(lang: Lang, r: Route): string {
  const p = LANG_PREFIX[lang];
  if (r.kind === 'halal') return `${p}/halal/${r.id}/`;
  if (r.kind === 'dzamija') return `${p}/${MOSQUE_SEG[lang]}/${r.id}/`;
  if (r.kind === 'pitanja') return `${p}/${FAQ_SEG[lang]}/`;
  if (r.kind === 'vaktija') return `${p}/${VAKTIJA_SEG[lang]}/`;
  return `${p}/`;
}

export function parseRoute(pathname: string): Route {
  const segs = pathname.split('/').filter(Boolean);
  if (['en', 'ar', 'tr', 'sr'].includes(segs[0])) segs.shift();
  if (segs[0] === 'halal' && segs[1]) return {kind: 'halal', id: segs[1]};
  if (ALL_MOSQUE.has(segs[0]) && segs[1]) return {kind: 'dzamija', id: segs[1]};
  if (ALL_FAQ.has(segs[0])) return {kind: 'pitanja'};
  if (ALL_VAKTIJA.has(segs[0])) return {kind: 'vaktija'};
  return {kind: 'home'};
}

let serverRoute: Route = {kind: 'home'};
/** Used by the prerender, where there is no window. */
export function setServerRoute(r: Route) {
  serverRoute = r;
}

export function currentRoute(): Route {
  if (typeof window === 'undefined') return serverRoute;
  try {
    return parseRoute(window.location.pathname);
  } catch {
    return {kind: 'home'};
  }
}

/** Promeni adresu bez otvaranja nove stranice. */
export function setRoute(lang: Lang, r: Route) {
  try {
    const next = pathFor(lang, r);
    if (window.location.pathname !== next) window.history.replaceState(null, '', next);
  } catch {
    /* prerender */
  }
}
