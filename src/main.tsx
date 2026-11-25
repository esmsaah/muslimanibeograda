import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {LangProvider} from './i18n';
import '@fontsource/syne/500';
import '@fontsource/syne/600';
import '@fontsource/syne/700';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource/space-grotesk/400';
import '@fontsource/space-grotesk/500';
import '@fontsource/space-grotesk/600';
import '@fontsource/space-grotesk/700';
import '@fontsource/ibm-plex-mono/400';
import '@fontsource/ibm-plex-mono/500';
import '@fontsource/big-shoulders-display/800';
import '@fontsource/big-shoulders-display/900';
import '@fontsource/reem-kufi/500';
import '@fontsource/reem-kufi/600';
import '@fontsource/reem-kufi/700';
import '@fontsource/unbounded/800';
import '@fontsource/unbounded/900';
import '@fontsource/amiri/400';
import '@fontsource/amiri/400-italic';
import '@fontsource/familjen-grotesk/700';
import '@fontsource/rakkas/400';
import '@fontsource/cormorant-garamond/500';
import '@fontsource/cormorant-garamond/400-italic';
import '@fontsource/instrument-sans/400';
import '@fontsource/instrument-sans/500';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <LangProvider>
    <App />
  </LangProvider>,
);
