import {useEffect, useState} from 'react';
import {useLang} from '../i18n';
import {belgradeToday, formatBelgrade, PRAYER_KEYS, prayerTimes} from '../utils/prayerTimes';
import type {PrayerKey} from '../utils/prayerTimes';

const NAMES: Record<PrayerKey, string> = {
  fajr: 'Sabah',
  sunrise: 'Izlazak sunca',
  dhuhr: 'Podne',
  asr: 'Ikindija',
  maghrib: 'Akšam',
  isha: 'Jacija',
};

const LOCALE = {sr: 'sr-Latn', en: 'en-GB', ar: 'ar', tr: 'tr'} as const;

/** Vreme namaza za Beograd, za današnji dan; menja se sam svakog dana. */
export function PrayerTimesCard({wide = false}: {wide?: boolean}) {
  const {t, lang} = useLang();
  // Prvo vremena iz builda (isti HTML kao prerender), pa odmah današnja.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const ref = now ?? new Date();
  const {y, m, d} = belgradeToday(ref);
  const times = prayerTimes(y, m, d);
  const next = now ? PRAYER_KEYS.find((k) => k !== 'sunrise' && times[k].getTime() > now.getTime()) : undefined;
  const dateLabel = new Intl.DateTimeFormat(LOCALE[lang], {timeZone: 'Europe/Belgrade', weekday: 'long', day: 'numeric', month: 'long'}).format(ref);

  return (
    <div id="vaktija" className={wide ? 'scroll-mt-28 border-t border-[#2B211C] pt-5' : 'mt-10 max-w-md scroll-mt-28 border-t border-[#2B211C] pt-5'}>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-mono-tabular text-[11px] tracking-[0.12em] text-[#0F7A53] uppercase">{t('Vreme namaza · Beograd')}</h3>
        <span className="text-[12px] text-[#8F8D88]" suppressHydrationWarning>{dateLabel}</span>
      </div>
      <dl className={`mt-4 grid grid-cols-3 gap-x-6 gap-y-4 ${wide ? 'sm:grid-cols-6' : ''}`}>
        {PRAYER_KEYS.map((k) => {
          const isNext = k === next;
          return (
            <div key={k}>
              <dt className={`text-[12px] ${isNext ? 'text-[#0F7A53]' : 'text-[#8F8D88]'}`}>
                {t(NAMES[k])}
                {isNext && <span className="ms-1">· {t('sledeći')}</span>}
              </dt>
              <dd className={`font-stone mt-0.5 text-[26px] leading-none lining-nums tabular-nums ${isNext ? 'text-[#0F7A53]' : k === 'sunrise' ? 'text-[#8F8D88]' : 'text-[#2B211C]'}`} suppressHydrationWarning>
                {formatBelgrade(times[k])}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
