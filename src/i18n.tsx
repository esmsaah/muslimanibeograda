import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import {EN} from './i18n/en';
import {AR} from './i18n/ar';
import {TR} from './i18n/tr';

export type Lang = 'sr' | 'en' | 'ar' | 'tr';

export const LANGS: {code: Lang; label: string; name: string}[] = [
  {code: 'sr', label: 'SR', name: 'Srpski'},
  {code: 'en', label: 'EN', name: 'English'},
  {code: 'ar', label: 'AR', name: 'العربية'},
  {code: 'tr', label: 'TR', name: 'Türkçe'},
];

const DICTS: Record<Exclude<Lang, 'sr'>, Record<string, string>> = {en: EN, ar: AR, tr: TR};

type Ctx = {lang: Lang; setLang: (l: Lang) => void; t: (s: string) => string};

const LangContext = createContext<Ctx>({lang: 'sr', setLang: () => {}, t: (s) => s});

const STORAGE_KEY = 'sumud-lang';

export const LANG_PATH: Record<Lang, string> = {sr: '/', en: '/en/', ar: '/ar/', tr: '/tr/'};
export const SITE_URL = 'https://muslimanibeograda.com';

function isLang(x: string | null | undefined): x is Lang {
  return !!x && LANGS.some((l) => l.code === x);
}

function langFromPath(pathname: string): Lang | null {
  const seg = pathname.split('/').filter(Boolean)[0];
  return isLang(seg) && seg !== 'sr' ? seg : null;
}

export function initialLang(): Lang {
  try {
    const fromPath = langFromPath(window.location.pathname);
    if (fromPath) return fromPath;
    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (isLang(fromUrl)) return fromUrl;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch {
    /* no window (prerender) or storage not available */
  }
  return 'sr';
}

export function LangProvider({children, initial}: {children: ReactNode; initial?: Lang}) {
  const [lang, setLangState] = useState<Lang>(() => initial ?? initialLang());

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* storage not available */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === 'sr' ? 'sr-Latn' : lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    const tr = (x: string) => (lang === 'sr' ? x : DICTS[lang][x] ?? x);
    document.title = tr('Muslimani Beograda · halal restorani, džamije i događaji | Sumud');
    const desc = tr('Halal restorani i prodavnice, džamije i mesdžidi, kulturni događaji i važni kontakti za muslimane u Beogradu.');
    document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', SITE_URL + LANG_PATH[lang]);
    // Keep the address in step with the language, so a shared link opens in it.
    const {pathname, hash} = window.location;
    if (pathname !== LANG_PATH[lang] && (pathname === '/' || langFromPath(pathname) || pathname === '/index.html')) {
      window.history.replaceState(null, '', LANG_PATH[lang] + hash);
    }
  }, [lang]);

  const t = useCallback(
    (s: string) => {
      if (lang === 'sr' || !s) return s;
      const hit = DICTS[lang][s];
      return hit ?? s;
    },
    [lang],
  );

  const value = useMemo(() => ({lang, setLang, t}), [lang, setLang, t]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

/** Replace {name} style placeholders after translating. */
export function fill(s: string, vars: Record<string, string | number>) {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}
