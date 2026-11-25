import {renderToString} from 'react-dom/server';
import App from './App.tsx';
import {LangProvider} from './i18n';
import type {Lang} from './i18n';
import {EN} from './i18n/en';
import {AR} from './i18n/ar';
import {TR} from './i18n/tr';

export {CULTURAL_EVENTS, DZEMATI, HALAL_SPOTS, USEFUL_CONTACTS, HISTORY_STORY, SITE_GOALS} from './data/content';

export const DICTS = {en: EN, ar: AR, tr: TR} as Record<string, Record<string, string>>;

export function render(lang: Lang) {
  return renderToString(
    <LangProvider initial={lang}>
      <App />
    </LangProvider>,
  );
}
