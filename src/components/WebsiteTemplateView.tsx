import React, {useEffect, useMemo, useRef, useState} from 'react';
import {ArrowUp, ArrowUpRight, Check, Link2, Download, Globe, Instagram, Mail, MapPin, MessageCircle, Pause, Phone, Play, Plus, X} from 'lucide-react';
import {COMMUNITY_PHOTOS} from '../data/communityPhotos';
import {
  drawDeliveryCyclist,
  PAINTING_HEIGHT,
  PAINTING_WIDTH,
  renderBelgradeGouachePainting,
} from '../utils/belgradePainting';
import {IslamicButton} from './IslamicButton';
import {CULTURAL_EVENTS, DZEMATI, FAQ, HALAL_SPOTS, HISTORY_STORY, SITE_GOALS, USEFUL_CONTACTS} from '../data/content';
import {currentRoute, pathFor, setRoute} from '../route';
import type {Route} from '../route';
import {PrayerTimesCard} from './PrayerTimesCard';
import {IMENIK_LAYOUT, PREVIEW_NEIGHBORS} from '../layoutVariant';
import type {CulturalEvent, HalalSpot} from '../data/content';
import {useLang, fill} from '../i18n';
import SumudMark from './SumudMark';
import TespihRule from './TespihRule';
import {TespihLoader} from './IslamicElements';

export interface WebsiteTemplateViewProps {
  onNavigateSeries: (series: 'landscape' | 'lines' | 'drawings' | 'photos') => void;
  onExportGif: () => void;
  isExportingGif?: boolean;
  gifPercent?: number | null;
}

const FACEBOOK_URL = 'https://www.facebook.com/share/g/1DP6NJB5ka/';
const WHATSAPP_URL = 'https://chat.whatsapp.com/GjN9oBUI2EiJ8TIm4QguJj';
const CONTACT_EMAIL = 'muslimanibeograda@proton.me';
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;

const openCommunity = (which: 'whatsapp' | 'facebook') => {
  window.open(which === 'whatsapp' ? WHATSAPP_URL : FACEBOOK_URL, '_blank', 'noopener,noreferrer');
};

async function sendForm(subject: string, fields: Record<string, string>) {
  const res = await fetch(FORM_ENDPOINT, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', Accept: 'application/json'},
    body: JSON.stringify({_subject: subject, _template: 'table', _captcha: 'false', ...fields}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || String((data as {success?: unknown}).success) === 'false') {
    throw new Error('send failed');
  }
}

const INPUT_CLS =
  'mt-1.5 w-full border border-[#D4D3CD] bg-[#FFFFFF] px-3.5 py-2.5 text-sm text-[#221D1A] placeholder:text-[#807E79] focus:border-[#221D1A] focus:outline-none';

const telHref = (n: string) => `tel:+381${n.replace(/\D/g, '').replace(/^0/, '')}`;
const waHref = (n: string) => `https://wa.me/381${n.replace(/\D/g, '').replace(/^0/, '')}`;
const prettyUrl = (u: string) => u.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/(sr\/?)?$/, '').replace(/\/$/, '');
const ACTION_CLS = 'inline-flex items-center gap-1.5 text-[14px] text-[#0F7A53] transition-colors hover:text-[#221D1A]';

const PRICA_PHOTOS = [
  {src: '/assets/community/506A0447.jpg', alt: 'Okupljanje u dvorištu Bajrakli džamije', pos: 'object-center'},
  {src: '/assets/community/506A2783.jpg', alt: 'Pekar vadi lepinje iz krušne peći', pos: 'object-[50%_40%]'},
  {src: '/assets/community/506A6413.jpg', alt: 'Žena sa zastavom Palestine na Trgu republike', pos: 'object-center'},
];


// Izvor: rijaset.org, Mešihat srbijanski, Muftijstvo beogradsko

const ALL_AREAS = 'Ceo grad';

type HalalCategory = 'sve' | 'restorani' | 'kafici' | 'prodavnice';
type SkillCategory = 'sve' | 'zdravlje' | 'zanat' | 'biznis' | 'hrana' | 'lepota';



const COMMUNITY_CHANNELS = [
  {id: 'whatsapp' as const, src: '/assets/community/506A5547.jpg', alt: 'Žene uče u džamiji uz prozore', pos: 'object-[60%_center]', title: 'Ženski online džemat', sub: 'WhatsApp grupa za sestre', action: 'Pridruži se'},
  {id: 'facebook' as const, src: '/assets/community/506A0430.jpg', alt: 'Muškarci ispred džamije posle namaza', pos: 'object-center', title: 'Facebook stranica', sub: 'Vesti, događaji i objave zajednice', action: 'Prati nas'},
];

/** Kontakt iz imenika kao link: telefon, Instagram, mejl ili sajt. */
function ContactLink({value}: {value: string}) {
  const v = value.trim();
  if (!v) return null;
  const cls = 'font-quiet mt-2 inline-flex items-center gap-1.5 text-[18px] text-[#0F7A53] hover:underline';
  if (v.startsWith('@')) return <a href={`https://www.instagram.com/${v.slice(1)}/`} target="_blank" rel="noopener noreferrer" className={cls}><Instagram className="h-3.5 w-3.5" /> {v}</a>;
  if (v.includes('@')) return <a href={`mailto:${v}`} className={cls}><Mail className="h-3.5 w-3.5" /> {v}</a>;
  if (/^https?:\/\//.test(v) || /\.[a-z]{2,}/i.test(v)) return <a href={v.startsWith('http') ? v : `https://${v}`} target="_blank" rel="noopener noreferrer" className={cls}><Globe className="h-3.5 w-3.5" /> {prettyUrl(v)}</a>;
  return <a href={telHref(v)} className={cls}><Phone className="h-3.5 w-3.5" /> {v}</a>;
}

interface NeighborListing {
  id: string;
  category: Exclude<SkillCategory, 'sve'>;
  categoryLabel: string;
  name: string;
  profession: string;
  district: string;
  note: string;
  contact: string;
  recommendedBy?: string;
}



// Curated atmospheric photos for the slow cross-fade (replaces photo gallery)
const AMBIENT_FADE_PHOTOS = [
  COMMUNITY_PHOTOS[14], // 506A4092
  COMMUNITY_PHOTOS[1], // 506A0447 - courtyard gathering
  COMMUNITY_PHOTOS[15], // 506A0464
  COMMUNITY_PHOTOS[6], // 506A4303 - quiet morning book
  COMMUNITY_PHOTOS[9], // 506A2232 - women cultural gathering
];



const CAT_COLORS: Record<string, string> = {sve:'#2B211C',zanat:'#D9A02B',hrana:'#9E2B45',biznis:'#2B211C',zdravlje:'#0F7A53',lepota:'#9E2B45'};



// Rakkas nema slovo đ, pa ga gradimo od slova d i tanke crte
function withDj(text: string) {
  const parts = text.split('đ');
  return parts.flatMap((part, i) =>
    i === 0 ? [part] : [<span key={i} className="dj">d</span>, part],
  );
}

function EventPhotos({photos, alt, contain}: {photos: string[]; alt: string; contain?: string}) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (photos.length < 2) return;
    const id = window.setInterval(() => setIdx((i) => (i + 1) % photos.length), 4500);
    return () => window.clearInterval(id);
  }, [photos.length]);
  return (
    <>
      {photos.map((src, i) => (
        <img loading="lazy" decoding="async"
          key={src}
          src={src}
          alt={i === idx ? alt : ''}
          aria-hidden={i !== idx}
          referrerPolicy="no-referrer"
          className={`absolute inset-0 h-full w-full transition-opacity duration-[1400ms] ${contain ? 'object-contain' : 'object-cover'}`}
          style={{opacity: i === idx ? 1 : 0, background: contain}}
        />
      ))}
      {photos.length > 1 && (
        <div className="absolute bottom-3 start-4 flex gap-1.5">
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`${i + 1} / ${photos.length}`}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/60'}`}
            />
          ))}
        </div>
      )}
    </>
  );
}

function ChapterMark({label}: {label: string}) {
  return (
    <div className="flex items-baseline gap-5 border-b border-[#2B211C] px-6 sm:px-10 py-4">
      <span className="font-quiet text-[17px] leading-none text-[#8F8D88]">{label}</span>
    </div>
  );
}

function SignTitle({
  caps,
  rest,
  num,
  className = '',
  accent,
}: {
  caps: string;
  rest: string;
  num?: string;
  dark?: boolean;
  accent?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {num && (
        <div className="font-mono-tabular mb-4 text-[10px] tracking-[0.14em] text-[#8F8D88] uppercase">{num}</div>
      )}
      <h2 className="font-stone text-[40px] leading-[1.05] tracking-[0.12em] text-[#2B211C] uppercase sm:text-[48px]">
        {caps} <span className="font-quiet normal-case tracking-normal" style={{color: accent ?? '#0F7A53'}}>{rest}</span>
      </h2>
    </div>
  );
}

export function WebsiteTemplateView({
  onNavigateSeries,
  onExportGif,
  isExportingGif = false,
  gifPercent = null,
}: WebsiteTemplateViewProps) {
  const {t, lang} = useLang();
  // Svako mesto ima svoju adresu (npr. /halal/hanan/). Ako je neko došao
  // direktno na nju, otvori to mesto, ali ostani na istoj stranici.
  const [route0] = useState<Route>(currentRoute);
  const route0Spot = route0.kind === 'halal' && HALAL_SPOTS.some((x) => x.id === route0.id) ? route0.id : null;
  const route0Dzemat = route0.kind === 'dzamija' && DZEMATI.some((x) => x.id === route0.id) ? route0.id : null;
  const [faqOpen, setFaqOpen] = useState(route0.kind === 'pitanja');
  const openFaq = (open: boolean) => { setFaqOpen(open); setRoute(lang, open ? {kind: 'pitanja'} : {kind: 'home'}); };
  useEffect(() => {
    if (!faqOpen) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setFaqOpen(false); setRoute(lang, {kind: 'home'}); } };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [faqOpen, lang]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const staticCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const progressRef = useRef(0.16);

  const [isPlaying, setIsPlaying] = useState(true);
  const [ambientIdx, setAmbientIdx] = useState(0);
  const [halalFilter, setHalalFilter] = useState<HalalCategory>('sve');
  const [areaFilter, setAreaFilter] = useState<string>(ALL_AREAS);
  const [areaMenuOpen, setAreaMenuOpen] = useState(false);
  const areaMenuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!areaMenuOpen) return;
    const close = (e: MouseEvent) => { if (areaMenuRef.current && !areaMenuRef.current.contains(e.target as Node)) setAreaMenuOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setAreaMenuOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [areaMenuOpen]);
  const [visibleCount, setVisibleCount] = useState(() => {
    if (!route0Spot) return 8;
    const order: Record<string, number> = {halal: 0, 'bez-svinjetine': 1, kafici: 2, prodavnice: 3};
    const i = [...HALAL_SPOTS].sort((x, y) => order[x.category] - order[y.category]).findIndex((x) => x.id === route0Spot);
    return i < 8 ? 8 : 8 + Math.ceil((i + 1 - 8) / 10) * 10;
  });
  const halalListRef = useRef<HTMLOListElement | null>(null);
  const halalDetailRef = useRef<HTMLDivElement | null>(null);
  const isMobile = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches;
  const pickSpot = (id: string) => {
    setSelectedSpotId(id);
    setRoute(lang, {kind: 'halal', id});
    if (isMobile()) requestAnimationFrame(() => halalDetailRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'}));
  };
  const backToHalalList = () => halalListRef.current?.scrollIntoView({behavior: 'smooth', block: 'center'});

  const [selectedSpotId, setSelectedSpotId] = useState<string>(route0Spot ?? HALAL_SPOTS[0].id);
  const [rsvpIds, setRsvpIds] = useState<Record<string, boolean>>({});
  const [storyOpen, setStoryOpen] = useState(false);
  const setCommunityModal = (which: 'whatsapp' | 'facebook' | null) => {
    if (which) openCommunity(which);
  };
  const [pricaIdx, setPricaIdx] = useState(0);
  const [openDzemat, setOpenDzemat] = useState<string | null>(route0Dzemat);
  const toggleDzemat = (id: string | null) => { setOpenDzemat(id); setRoute(lang, id ? {kind: 'dzamija', id} : {kind: 'home'}); };

  // RSVP
  const [rsvpEvent, setRsvpEvent] = useState<CulturalEvent | null>(null);
  const [openEventId, setOpenEventId] = useState<string | null>(route0.kind === 'dogadjaj' && CULTURAL_EVENTS.some((x) => x.id === route0.id) ? route0.id : null);
  const [copiedEvent, setCopiedEvent] = useState<string | null>(null);
  const copyEventLink = async (id: string) => {
    const url = `https://muslimanibeograda.com${pathFor(lang, {kind: 'dogadjaj', id})}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt(t('Kopiraj link'), url);
    }
    setCopiedEvent(id);
    window.setTimeout(() => setCopiedEvent((c) => (c === id ? null : c)), 2000);
  };
  const toggleEvent = (id: string | null) => { setOpenEventId(id); setRoute(lang, id ? {kind: 'dogadjaj', id} : {kind: 'home'}); };
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [sgTitle, setSgTitle] = useState('');
  const [sgWhen, setSgWhen] = useState('');
  const [sgPlace, setSgPlace] = useState('');
  const [sgLink, setSgLink] = useState('');
  const [sgNote, setSgNote] = useState('');
  const [sgContact, setSgContact] = useState('');
  const [sgStatus, setSgStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const openSuggest = () => { setSgStatus('idle'); setSuggestOpen(true); };
  const handleSuggestSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSgStatus('sending');
    sendForm(`Predlog događaja · ${sgTitle.trim()}`, {
      'Događaj': sgTitle.trim(),
      'Kada': sgWhen.trim(),
      'Gde': sgPlace.trim(),
      'Link': sgLink.trim() || '—',
      'Opis': sgNote.trim() || '—',
      'Kontakt': sgContact.trim() || '—',
    })
      .then(() => {
        setSgStatus('done');
        setSgTitle(''); setSgWhen(''); setSgPlace(''); setSgLink(''); setSgNote('');
      })
      .catch(() => setSgStatus('error'));
  };
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpContact, setRsvpContact] = useState('');
  const [rsvpCount, setRsvpCount] = useState('1');
  const [rsvpStatus, setRsvpStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [nbrDone, setNbrDone] = useState(false);
  const [nbrError, setNbrError] = useState(false);
  const [helpError, setHelpError] = useState(false);

  // Neighbor directory
  const [neighbors, setNeighbors] = useState<NeighborListing[]>(PREVIEW_NEIGHBORS);
  const [skillFilter, setSkillFilter] = useState<SkillCategory>('sve');
  const [showAddNeighbor, setShowAddNeighbor] = useState(false);
  const [nbrMode, setNbrMode] = useState<'self' | 'rec'>('self');
  const [contactGroup, setContactGroup] = useState('Papiri i posao');
  const [nbrName, setNbrName] = useState('');
  const [nbrProfession, setNbrProfession] = useState('');
  const [nbrCategory, setNbrCategory] = useState<Exclude<SkillCategory, 'sve'>>('zanat');
  const [nbrDistrict, setNbrDistrict] = useState('');
  const [nbrNote, setNbrNote] = useState('');
  const [nbrContact, setNbrContact] = useState('');
  const [nbrRecommender, setNbrRecommender] = useState('');
  const [nbrSaving, setNbrSaving] = useState(false);

  // Help form
  const [helpName, setHelpName] = useState('');
  const [helpContact, setHelpContact] = useState('');
  const [helpMessage, setHelpMessage] = useState('');
  const [helpSending, setHelpSending] = useState(false);
  const [helpSubmitted, setHelpSubmitted] = useState(false);

  // Belgrade skyline canvas animation
  useEffect(() => {
    const offscreen = document.createElement('canvas');
    renderBelgradeGouachePainting(offscreen);
    staticCanvasRef.current = offscreen;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(offscreen, 0, 0);
        drawDeliveryCyclist(ctx, progressRef.current);
      }
    }
  }, []);

  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();

    const drawFrame = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;

      if (isPlaying) {
        progressRef.current = (progressRef.current + dt / 7000) % 1;
      }

      const canvas = canvasRef.current;
      const staticCanvas = staticCanvasRef.current;
      if (canvas && staticCanvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(staticCanvas, 0, 0);
          drawDeliveryCyclist(ctx, progressRef.current);
        }
      }

      if (isPlaying) {
        rafId = window.requestAnimationFrame(drawFrame);
      }
    };

    if (isPlaying) {
      rafId = window.requestAnimationFrame(drawFrame);
    }

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [isPlaying]);

  // Ambient slow crossfade of Belgrade community photography (non-gallery)
  useEffect(() => {
    const timer = window.setInterval(() => {
      setAmbientIdx((prev) => (prev + 1) % AMBIENT_FADE_PHOTOS.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPricaIdx((prev) => (prev + 1) % PRICA_PHOTOS.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const halalByCategory = useMemo(() => {
    const order: Record<string, number> = {halal: 0, 'bez-svinjetine': 1, kafici: 2, prodavnice: 3};
    const sorted = [...HALAL_SPOTS].sort((x, y) => order[x.category] - order[y.category]);
    if (halalFilter === 'sve') return sorted;
    if (halalFilter === 'prodavnice' || halalFilter === 'kafici') return sorted.filter((x) => x.category === halalFilter);
    return sorted.filter((x) => x.category !== 'prodavnice' && x.category !== 'kafici');
  }, [halalFilter]);

  const halalAreas = useMemo(
    () => [ALL_AREAS, ...Array.from(new Set(halalByCategory.map((x) => x.district))).sort((a, b) => a.localeCompare(b, 'sr'))],
    [halalByCategory],
  );

  useEffect(() => {
    if (!halalAreas.includes(areaFilter)) setAreaFilter(ALL_AREAS);
  }, [halalAreas, areaFilter]);

  const filteredHalal = useMemo(
    () => (areaFilter === ALL_AREAS ? halalByCategory : halalByCategory.filter((x) => x.district === areaFilter)),
    [halalByCategory, areaFilter],
  );

  const filterFirstRun = useRef(true);
  useEffect(() => {
    if (filterFirstRun.current) { filterFirstRun.current = false; return; }
    setVisibleCount(8);
    if (filteredHalal[0]) setSelectedSpotId(filteredHalal[0].id);
    if (currentRoute().kind === 'halal') setRoute(lang, {kind: 'home'});
    if (halalListRef.current) halalListRef.current.scrollTop = 0;
  }, [filteredHalal]);

  const showMoreHalal = () => {
    const firstNew = visibleCount;
    setVisibleCount((v) => v + 10);
    window.setTimeout(() => {
      const list = halalListRef.current;
      const el = list?.children[firstNew] as HTMLElement | undefined;
      if (list && el) list.scrollTo({top: el.offsetTop - 8, behavior: 'smooth'});
    }, 60);
  };

  const filteredNeighbors = useMemo(() => {
    if (skillFilter === 'sve') return neighbors;
    return neighbors.filter((n) => n.category === skillFilter);
  }, [neighbors, skillFilter]);

  const selectedSpot =
    filteredHalal.find((s) => s.id === selectedSpotId) ?? filteredHalal[0];

  useEffect(() => {
    const target = route0Spot ? (isMobile() ? halalDetailRef.current : document.getElementById('halal-beograd')) : route0Dzemat ? document.getElementById('dzemati') : route0.kind === 'vaktija' ? document.getElementById('vaktija') : route0.kind === 'dogadjaj' ? document.getElementById('kulturni-dogadjaji') : null;
    if (target) window.setTimeout(() => target.scrollIntoView({block: 'start'}), 150);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Linkovi u meniju (#halal-beograd...) samo skroluju, a adresa ostaje čista,
  // bez # i bez ostatka prethodne stranice (npr. /vaktija/#halal-beograd).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute('href')!.slice(1);
      const el = id ? document.getElementById(id) : null;
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({behavior: 'smooth', block: 'start'});
      setRoute(lang, {kind: 'home'});
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [lang]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({behavior: 'smooth', block: 'start'});
  };

  const handleAddNeighbor = (event: React.FormEvent) => {
    event.preventDefault();
    if (!nbrName.trim() || !nbrProfession.trim()) return;
    const catLabels: Record<Exclude<SkillCategory, 'sve'>, string> = {
      zdravlje: 'Doktori i zdravlje',
      zanat: 'Zanati i majstori',
      biznis: 'Preduzetnici i frilenseri',
      hrana: 'Hrana i ketering',
      lepota: 'Lepota i njega',
    };
    setNbrSaving(true);
    setNbrError(false);
    sendForm(`Imenik · ${nbrMode === 'rec' ? 'preporuka' : 'novi unos'} · ${nbrProfession.trim()}`, {
      'Ime ili radnja': nbrName.trim(),
      'Zanimanje / usluga': nbrProfession.trim(),
      Oblast: catLabels[nbrCategory],
      'Deo grada': nbrDistrict.trim() || '—',
      Kontakt: nbrContact.trim() || '—',
      'Preporučio/la': nbrRecommender.trim() || 'Samostalna prijava',
      Opis: nbrNote.trim() || '—',
    })
      .then(() => {
        setNbrName('');
        setNbrProfession('');
        setNbrDistrict('');
        setNbrNote('');
        setNbrContact('');
        setNbrRecommender('');
        setNbrDone(true);
      })
      .catch(() => setNbrError(true))
      .finally(() => setNbrSaving(false));
  };

  const handleHelpSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!helpMessage.trim() && !helpContact.trim()) return;
    setHelpSending(true);
    setHelpError(false);
    sendForm('Javi nam se · poruka sa sajta', {
      Ime: helpName.trim() || '—',
      Kontakt: helpContact.trim(),
      Poruka: helpMessage.trim(),
    })
      .then(() => setHelpSubmitted(true))
      .catch(() => setHelpError(true))
      .finally(() => setHelpSending(false));
  };

  const openRsvp = (ev: CulturalEvent) => {
    setRsvpEvent(ev);
    setRsvpStatus(rsvpIds[ev.id] ? 'done' : 'idle');
  };

  const handleRsvpSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!rsvpEvent || !rsvpName.trim()) return;
    setRsvpStatus('sending');
    sendForm(`RSVP · ${rsvpEvent.title} · ${rsvpEvent.day} ${rsvpEvent.month}`, {
      Događaj: `${rsvpEvent.title} (${rsvpEvent.day} ${rsvpEvent.month}, ${rsvpEvent.time}, ${rsvpEvent.place})`,
      Ime: rsvpName.trim(),
      Kontakt: rsvpContact.trim() || '—',
      'Broj osoba': rsvpCount,
    })
      .then(() => {
        setRsvpIds((prev) => ({...prev, [rsvpEvent.id]: true}));
        setRsvpStatus('done');
      })
      .catch(() => setRsvpStatus('error'));
  };

  const currentFadePhoto = AMBIENT_FADE_PHOTOS[ambientIdx];

  return (
    <div className="bg-[#FFFFFF] text-[#221D1A] overflow-x-hidden">
      {/* 1. O MUSLIMANIMA BEOGRADA — Uvod & panorama grada */}
      <section id="o-muslimanima" className="bg-[linear-gradient(90deg,#FFFFFF_0,#FFFFFF_60%,#EDEDEA_60%,#EDEDEA_100%)] rtl:bg-[linear-gradient(270deg,#FFFFFF_0,#FFFFFF_60%,#EDEDEA_60%,#EDEDEA_100%)]">
        <div className="mx-auto max-w-[1440px] lg:ps-[130px]">
        <div className="grid grid-cols-1 border-s border-[#2B211C] lg:grid-cols-[560px_1fr]">
          {/* Levo, uz čvrstu vertikalu */}
          <div className="relative flex flex-col justify-between bg-[#FFFFFF] px-6 sm:px-10 pt-10 pb-8 lg:min-h-[560px] lg:pt-16 lg:pb-12">
            <div>
              <h1 className="font-stone text-[64px] leading-none tracking-[0.2em] text-[#2B211C] sm:text-[76px]">
                {t("SUMUD")}
              </h1>
              <p className="font-quiet mt-4 text-[22px] leading-snug text-[#2B211C]">
                {t("Kolektiv muslimana Beograda")}
              </p>
            </div>
            <div className="mt-8 hidden lg:mt-0 lg:block">
              <div aria-hidden="true" className="hidden h-[96px] w-[96px] rounded-full bg-[#D9A02B] lg:block" />
              <blockquote className="font-quiet m-0 mt-8 max-w-[380px] text-[22px] leading-[1.4] text-[#2B211C]">
                {t("„Vernici su u svojoj međusobnoj ljubavi, milosti i saosećanju poput jednog tela.”")}
              </blockquote>
              <p className="font-quiet mt-3 text-[15px] text-[#8F8D88]">{t("Hadis, beleže Buhari i Muslim")}</p>
            </div>
          </div>

          {/* Desno, betonsko polje sa crtežom */}
          <div className="relative flex flex-col justify-end bg-[#EDEDEA] px-0 pt-20 pb-4 sm:px-10 lg:px-14 lg:pt-14 lg:pb-8">
            <div aria-hidden="true" className="absolute end-8 top-7 h-[48px] w-[48px] rounded-full bg-[#D9A02B] lg:hidden" />
            <div className="pointer-events-none relative overflow-hidden lg:mt-24" style={{aspectRatio: '2400 / 820'}}>
              <canvas
                ref={canvasRef}
                width={PAINTING_WIDTH}
                height={PAINTING_HEIGHT}
                aria-label={t("Ilustracija Beograda sa Bajrakli džamijom u centru i biciklistom u pokretu")}
                className="absolute start-0 block h-auto w-full mix-blend-multiply"
                style={{top: '-47%'}}
              />
            </div>

          </div>
          {/* Hadis ispod crteža, samo na mobitelu */}
          <div className="bg-[#FFFFFF] px-6 pt-8 pb-10 lg:hidden">
            <blockquote className="font-quiet m-0 max-w-[380px] text-[21px] leading-[1.4] text-[#2B211C]">
              {t("„Vernici su u svojoj međusobnoj ljubavi, milosti i saosećanju poput jednog tela.”")}
            </blockquote>
            <p className="font-quiet mt-3 text-[15px] text-[#8F8D88]">{t("Hadis, beleže Buhari i Muslim")}</p>
          </div>
        </div>
        </div>
      </section>

      {/* Istorija, ciljevi i tihi foto-fade u jednom kadru (bez galerije) */}
      <div className="bg-[#FFFFFF]">
      <section className="mx-auto max-w-[1440px] lg:ps-[130px]">
        <div className="border-s border-[#2B211C] bg-[#FFFFFF]">
          <ChapterMark label={t("Priča o nama")} />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_560px]">
            {/* Levo: jedna fotografija kao ploča */}
            <div className="bg-[#EDEDEA] px-6 sm:px-10 pt-10 pb-10 lg:pt-12">
              <div className="relative aspect-[4/3] w-full max-w-[560px] overflow-hidden rounded-se-[96px] bg-[#D4D3CD] lg:aspect-[4/5]">
                {PRICA_PHOTOS.map((p, i) => (
                  <img loading="lazy" decoding="async"
                    key={p.src}
                    src={p.src}
                    alt={t(p.alt)}
                    className={`absolute inset-0 h-full w-full object-cover ${p.pos} transition-opacity duration-[1400ms] ease-in-out ${i === pricaIdx ? 'opacity-100' : 'opacity-0'}`}
                  />
                ))}
              </div>
            </div>

            {/* Desno: priča */}
            <div className="bg-[#FFFFFF] px-6 sm:px-10 pt-10 pb-14 lg:pt-12">
              <SignTitle caps={t("Priča")} rest={t("o nama")} />
              <p className="font-quiet mt-8 text-[21px] leading-[1.5] text-[#2B211C]">
                {t(HISTORY_STORY.paragraphs[0])}
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-[#4F4A46]">
                {t(HISTORY_STORY.paragraphs[1])}
              </p>
              <div className="mt-8">
                <IslamicButton variant="flowline" size="sm" onClick={() => setStoryOpen(true)}>
                  {t("Pročitaj ceo tekst")}
                </IslamicButton>
              </div>

              <dl className="mt-14 border-t border-[#2B211C]">
                {SITE_GOALS.map((goal) => (
                  <div key={goal.num} className="border-b border-[#D4D3CD] py-4">
                    <dt className="sr-only">{goal.num}</dt>
                    <dd className="m-0">
                      <div className="font-stone text-[20px] text-[#2B211C]">{t(goal.title)}</div>
                      <div className="mt-1 text-[13px] leading-relaxed text-[#4F4A46]">{t(goal.text)}</div>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* 2. HALAL BEOGRAD — Redizajnirani arhitektonski gradski vodič */}
      <div className="bg-[linear-gradient(90deg,#FFFFFF_0,#FFFFFF_9%,#EDEDEA_9%,#EDEDEA_100%)] rtl:bg-[linear-gradient(270deg,#FFFFFF_0,#FFFFFF_9%,#EDEDEA_9%,#EDEDEA_100%)]">
      <section id="halal-beograd" className="mx-auto max-w-[1440px] lg:ps-[130px]">
        <div className="border-s border-[#2B211C] bg-[#EDEDEA]">
          <ChapterMark label={t("Halal Beograd")} />
        <div className="grid grid-cols-1 lg:grid-cols-[560px_1fr]">
          {/* Levo: indeks adresa */}
          <div className="px-6 sm:px-10 pt-10 pb-14 lg:pt-12">
            <SignTitle num={t("Gde jesti i kupovati")} caps={t("Halal")} rest={t("Beograd")} />

            <div className="mt-10 flex flex-wrap items-end justify-between gap-x-7 gap-y-3">
              <div role="group" aria-label={t("Filtriraj halal kategorije")} className="flex flex-wrap gap-x-7 gap-y-2 text-[15px]">
                {([['sve', 'Sve'], ['restorani', 'Restorani'], ['kafici', 'Kafići'], ['prodavnice', 'Prodavnice']] as const).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setHalalFilter(key)}
                    className={`pb-1 transition-colors ${halalFilter === key ? 'border-b border-[#2B211C] text-[#2B211C]' : 'text-[#8F8D88] hover:text-[#2B211C]'}`}
                  >
                    {t(label)}
                  </button>
                ))}
              </div>

              <div ref={areaMenuRef} className="relative pb-1">
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={areaMenuOpen}
                  onClick={() => setAreaMenuOpen((o) => !o)}
                  className={`inline-flex items-center gap-1.5 text-[13px] transition-colors ${areaFilter !== ALL_AREAS ? 'text-[#2B211C]' : 'text-[#8F8D88] hover:text-[#2B211C]'}`}
                >
                  <MapPin className="h-3 w-3" />
                  {t(areaFilter)}
                  <svg viewBox="0 0 10 6" className={`h-1.5 w-2.5 transition-transform ${areaMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
                </button>
                {areaMenuOpen && (
                  <ul role="listbox" aria-label={t("Opština")} className="absolute end-0 z-20 mt-2 min-w-[180px] border border-[#D4D3CD] bg-white py-1.5 shadow-[0_8px_24px_rgba(43,33,28,0.08)]">
                    {halalAreas.map((area) => (
                      <li key={area}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={areaFilter === area}
                          onClick={() => { setAreaFilter(area); setAreaMenuOpen(false); }}
                          className={`flex w-full items-center justify-between gap-4 px-4 py-1.5 text-start text-[13px] transition-colors hover:bg-[#EDEDEA] ${areaFilter === area ? 'text-[#2B211C]' : 'text-[#4F4A46]'}`}
                        >
                          {t(area)}
                          {areaFilter === area && <Check className="h-3 w-3 text-[#0F7A53]" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <ol
              ref={halalListRef}
              className={`relative mt-8 grid grid-cols-1 gap-x-8 border-t border-[#2B211C] sm:grid-cols-2 ${visibleCount > 8 ? 'thin-scroll max-h-[560px] overflow-y-auto pe-2' : ''}`}
            >
              {filteredHalal.slice(0, visibleCount).map((spot, idx) => {
                const isSelected = selectedSpot?.id === spot.id;
                return (
                  <li key={spot.id} className="border-b border-[#D4D3CD]">
                    <a
                      href={pathFor(lang, {kind: 'halal', id: spot.id})}
                      onClick={(e) => { e.preventDefault(); pickSpot(spot.id); }}
                      className="block w-full py-3 text-start"
                    >
                      <span>
                        <span className={`font-stone flex items-baseline justify-between gap-3 text-[18px] leading-tight transition-colors ${isSelected ? 'text-[#9E2B45]' : 'text-[#2B211C]'}`}>
                          {spot.name}
                          {spot.category === 'halal' && (
                            <span className="font-mono-tabular shrink-0 text-[10px] tracking-[0.12em] text-[#0F7A53] uppercase">{t("Halal")}</span>
                          )}
                        </span>
                        <span className="mt-1 block text-[13px] text-[#4F4A46]">
                          {t(spot.street)} · {t(spot.district)}
                        </span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ol>
            {filteredHalal.length === 0 && (
              <p className="font-quiet mt-5 text-[18px] text-[#8F8D88]">{t("Za ovaj izbor još nema upisanih mesta.")}</p>
            )}
            {filteredHalal.length > visibleCount && (
              <button
                type="button"
                onClick={showMoreHalal}
                className="font-quiet mt-5 text-[18px] text-[#0F7A53] hover:underline"
              >
                + {Math.min(10, filteredHalal.length - visibleCount)}{' '}{t("mesta")}
              </button>
            )}
            <p className="mt-6 text-[12px] leading-relaxed text-[#8F8D88]">
              {t("Kod svakog mesta piše odakle je podatak o halal statusu. Oznaka Halal znači da je halal potvrđen ili da ga restoran sam navodi. Certifikat uvek proverite na licu mesta.")}
            </p>
          </div>

          {/* Desno: velika ploča, pa ispod tekst i mala slika izabranog mesta */}
          {selectedSpot && (
            <div className="px-6 sm:px-10 pt-10 pb-12 lg:sticky lg:top-24 lg:self-start lg:px-14 lg:pt-12">
              <div className="relative hidden aspect-[16/7] w-full overflow-hidden rounded-se-[96px] bg-[#D4D3CD] lg:block">
                <img loading="lazy" decoding="async" src="/assets/community/IMG_7777.jpg" alt={t("Kuskus, tadžin i čorba na stolu")} className="absolute inset-0 h-full w-full object-cover object-[50%_55%]" />
              </div>
              <div ref={halalDetailRef} className="grid scroll-mt-28 grid-cols-1 gap-8 border-t border-[#2B211C] pt-6 lg:mt-8 lg:grid-cols-[1fr_200px]">
                <div>
                  <div className={`inline-block px-2 py-0.5 text-[12px] ${selectedSpot.category === 'halal' ? 'bg-[#0F7A53] text-white' : 'bg-[#D4D3CD] text-[#2B211C]'}`}>{t(selectedSpot.category === 'halal' ? 'Halal' : selectedSpot.category === 'prodavnice' ? 'Prodavnica' : selectedSpot.category === 'kafici' ? 'Kafić' : 'Restoran')}</div>
                  <h3 className="font-stone mt-2 text-[30px] leading-tight text-[#2B211C]">{selectedSpot.name}</h3>
                  <div className="font-quiet mt-1 text-[19px] text-[#9E2B45]">{t(selectedSpot.street)}, {t(selectedSpot.district)}</div>
                  <p className="mt-4 max-w-md text-[14px] leading-relaxed text-[#4F4A46]">{t(selectedSpot.note)}</p>
                  {selectedSpot.communityTip && (
                    <div className="mt-4 max-w-md border-s-2 border-[#0F7A53] ps-3">
                      <div className="font-mono-tabular text-[10px] tracking-[0.12em] text-[#8F8D88] uppercase">{t(selectedSpot.category === 'prodavnice' ? 'Kontakt i info' : 'Halal status')}</div>
                      <p className="mt-1 text-[13px] leading-relaxed text-[#2B211C]">{t(selectedSpot.communityTip)}</p>
                    </div>
                  )}
                  <div className="mt-5 flex max-w-md flex-wrap gap-x-6 gap-y-2">
                    {selectedSpot.phones?.map((n) => (
                      <a key={n} href={telHref(n)} className={ACTION_CLS}>
                        <Phone className="h-3.5 w-3.5" /> {n}
                      </a>
                    ))}
                    {selectedSpot.whatsapp && (
                      <a href={waHref(selectedSpot.whatsapp)} target="_blank" rel="noopener noreferrer" className={ACTION_CLS}>
                        <MessageCircle className="h-3.5 w-3.5" />{' '}{t("WhatsApp")}
                      </a>
                    )}
                    {selectedSpot.website && (
                      <a href={selectedSpot.website} target="_blank" rel="noopener noreferrer" className={ACTION_CLS}>
                        <Globe className="h-3.5 w-3.5" /> {prettyUrl(selectedSpot.website)}
                      </a>
                    )}
                    {selectedSpot.instagram && (
                      <a href={`https://www.instagram.com/${selectedSpot.instagram}/`} target="_blank" rel="noopener noreferrer" className={ACTION_CLS}>
                        <Instagram className="h-3.5 w-3.5" /> @{selectedSpot.instagram}
                      </a>
                    )}
                    {selectedSpot.district !== 'Online' && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedSpot.name} ${selectedSpot.street} Beograd`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={ACTION_CLS}
                      >
                        <MapPin className="h-3.5 w-3.5" />{' '}{t("Otvori na mapi")}
                      </a>
                    )}
                  </div>
                </div>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-se-[48px] bg-[#D4D3CD] lg:aspect-square">
                  <img loading="lazy" decoding="async" key={selectedSpot.id} src={`/assets/halal/${selectedSpot.id}.jpg`} alt={selectedSpot.name} onError={(e) => { const img = e.currentTarget; if (!img.dataset.fallback) { img.dataset.fallback = "1"; img.src = selectedSpot.photoSrc; } }} className="animate-fade-in absolute inset-0 h-full w-full object-cover" />
                </div>
              </div>
              <button type="button" onClick={backToHalalList} className="font-quiet mt-8 text-[18px] text-[#0F7A53] hover:underline lg:hidden">{t("Nazad na spisak")}</button>
            </div>
          )}
        </div>
        </div>
      </section>
      </div>

      {/* 3. DŽEMATI BEOGRADA */}
      <section id="dzemati" className="bg-[linear-gradient(90deg,#FFFFFF_0,#FFFFFF_60%,#EDEDEA_60%,#EDEDEA_100%)] rtl:bg-[linear-gradient(270deg,#FFFFFF_0,#FFFFFF_60%,#EDEDEA_60%,#EDEDEA_100%)]">
        <div className="mx-auto max-w-[1440px] lg:ps-[130px]">
        <div className="border-s border-[#2B211C] bg-[#FFFFFF]">
          <ChapterMark label={t("Džemati Beograda")} />
          <div className="grid grid-cols-1 lg:grid-cols-[560px_1fr]">
            <div className="px-6 sm:px-10 pt-10 pb-8 lg:pb-14 lg:pt-12">
              <SignTitle caps={t("Gde")} rest={t("klanjati")} />
              <p className="font-quiet mt-5 max-w-md text-[19px] leading-[1.5] text-[#2B211C]">
                {t("Džamije i mesdžidi Beograda, od Dorćola do Batajnice. Klikni na džemat za adresu i mesto na mapi.")}
              </p>
              <PrayerTimesCard />
              <div className="relative mt-10 hidden aspect-[4/5] w-full overflow-hidden rounded-se-[96px] bg-[#D4D3CD] lg:block">
                <img loading="lazy" decoding="async" src="/assets/community/506A5593.jpg" alt={t("Čovek uzima abdest na šadrvanu")} className="absolute inset-0 h-full w-full object-cover object-[45%_center]" />
              </div>
            </div>

            <div className="bg-[#EDEDEA] px-6 sm:px-10 pt-10 pb-14 lg:px-14 lg:pt-12">
              <ol className="border-t border-[#2B211C]">
                {DZEMATI.map((dz) => {
                  const open = openDzemat === dz.id;
                  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(dz.mapQuery)}&z=15&output=embed`;
                  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dz.mapQuery)}`;
                  return (
                    <li key={dz.id} className="border-b border-[#D4D3CD]">
                      <a
                        href={pathFor(lang, {kind: 'dzamija', id: dz.id})}
                        aria-expanded={open}
                        onClick={(e) => { e.preventDefault(); toggleDzemat(open ? null : dz.id); }}
                        className="group flex w-full items-baseline justify-between gap-6 py-4 text-start"
                      >
                        <span>
                          <span className={`font-stone block text-[22px] leading-tight transition-colors ${open ? 'text-[#0F7A53]' : 'text-[#2B211C] group-hover:text-[#0F7A53]'}`}>{t(dz.name)}</span>
                          <span className="mt-1 block text-[13px] text-[#4F4A46]">{t(dz.address)} · {t(dz.district)}</span>
                        </span>
                        <span className={`font-stone shrink-0 text-[24px] leading-none text-[#8F8D88] transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>+</span>
                      </a>
                      {open && (
                        <div className="animate-fade-in grid grid-cols-1 gap-6 pb-8 sm:grid-cols-2">
                          {dz.photo ? (
                            <div className="relative aspect-square w-full overflow-hidden rounded-se-[48px] bg-[#D4D3CD]">
                              <img loading="lazy" decoding="async" src={dz.photo} alt={dz.photoAlt ?? dz.name} className="absolute inset-0 h-full w-full object-cover" />
                            </div>
                          ) : null}
                          <div className={`relative w-full overflow-hidden bg-[#D4D3CD] ${dz.photo ? 'aspect-square' : 'aspect-[16/10] sm:col-span-2 rounded-se-[48px]'}`}>
                            <iframe
                              title={`${t('Mapa')}, ${t(dz.name)}`}
                              src={mapSrc}
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                              className="absolute inset-0 h-full w-full border-0 grayscale-[0.6] contrast-[0.95]"
                            />
                          </div>
                          <div className="flex flex-wrap items-baseline justify-between gap-4 sm:col-span-2">
                            <span />
                            <IslamicButton variant="flowline" href={mapLink} target="_blank" rel="noopener noreferrer">{t("Otvori u mapama")}</IslamicButton>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* 3. KULTURNI DOGAĐAJI — Halal i kulturna dešavanja u gradu */}
      <div className="bg-[#FFFFFF]">
      <section id="kulturni-dogadjaji" className="mx-auto max-w-[1440px] lg:ps-[130px]">
        <div className="border-s border-[#2B211C] bg-[#FFFFFF] pb-16">
          <ChapterMark label={t("Kulturni događaji")} />
          <div className="px-6 sm:px-10 pt-10 lg:pt-12">
          <SignTitle caps={t("Šta se")} rest={t("dešava u gradu")} />

          <ol className="mt-10 grid grid-cols-1 gap-x-10 border-t border-[#D4D3CD] lg:grid-cols-3">
            {CULTURAL_EVENTS.map((ev) => {
              const joined = Boolean(rsvpIds[ev.id]);
              const open = openEventId === ev.id;
              return (
                <li key={ev.id} className="flex flex-col border-b border-[#D4D3CD] py-8 lg:border-b-0 lg:border-e lg:pe-10 lg:last:border-e-0">
                  <div className="flex items-baseline justify-between">
                    <span className="font-stone text-[56px] leading-none text-[#D9A02B]">{t(ev.day)}</span>
                    <span className="font-quiet text-[18px] text-[#8F8D88]">{ev.short ? t(ev.short) : `${t(ev.month).toLowerCase()}, ${ev.time}`}</span>
                  </div>
                  <div className="relative mt-5 aspect-[4/3] w-full overflow-hidden rounded-se-[96px] bg-[#EDEDEA]">
                    {ev.photos && ev.photos.length > 0 ? (
                      <EventPhotos photos={ev.photos} alt={t(ev.title)} contain={ev.photoContain} />
                    ) : ev.instagramEmbed ? (
                      <div className="pointer-events-none absolute top-0 start-[-14%] w-[128%]" style={{marginTop: 'calc(-58px - 68%)'}}>
                        <iframe
                          src={ev.instagramEmbed}
                          title={`${t(ev.title)} · Instagram`}
                          loading="lazy"
                          scrolling="no"
                          tabIndex={-1}
                          className="block h-[1100px] w-full border-0"
                        />
                      </div>
                    ) : ev.photoSrc ? (
                      <img loading="lazy" decoding="async" src={ev.photoSrc} alt={t(ev.title)} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full flex-col justify-end p-6" style={{background: ev.posterBg ?? '#2B211C'}}>
                        <div className="font-mono-tabular text-[10px] tracking-[0.14em] text-[#D9A02B] uppercase">{t(ev.posterLabel ?? '')}</div>
                        <div className="font-stone mt-2 text-[34px] leading-none text-white">{ev.posterTitle ?? t(ev.title)}</div>
                      </div>
                    )}
                  </div>

                  <h3 className="font-stone mt-5 text-[26px] leading-tight text-[#2B211C]">{t(ev.title)}</h3>
                  <div className="font-quiet mt-1 text-[17px] text-[#9E2B45]">{t(ev.place)}</div>
                  <p className={`mt-2 text-[14px] leading-relaxed text-[#4F4A46] ${open ? '' : 'line-clamp-3'}`}>{t(ev.summary)}</p>

                  {open && (
                    <div className="mt-4 space-y-4">
                      {ev.when && <p className="font-quiet text-[17px] text-[#2B211C]">{t(ev.when)}</p>}
                      {ev.program && (
                        <ol className="border-t border-[#D4D3CD]">
                          {ev.program.map((item) => (
                            <li key={item.when + item.what} className="border-b border-[#EAEAE6] py-3">
                              <div className="font-mono-tabular text-[11px] text-[#0F7A53] uppercase">{t(item.when)}</div>
                              <div className="mt-1 text-[14px] leading-snug text-[#2B211C]">{t(item.what)}</div>
                              <div className="mt-0.5 text-[12px] text-[#8F8D88]">{item.where}</div>
                            </li>
                          ))}
                        </ol>
                      )}
                      {ev.note && (
                        <div className="border-s-2 border-[#D9A02B] ps-4">
                          <div className="font-mono-tabular text-[10px] tracking-[0.14em] text-[#8F8D88] uppercase">{t(ev.noteLabel ?? 'Halal')}</div>
                          <p className="mt-1 text-[14px] leading-relaxed text-[#2B211C]">{t(ev.note)}</p>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {ev.ticketUrl && (
                          <a href={ev.ticketUrl} target="_blank" rel="noopener noreferrer" className={ACTION_CLS}>
                            <Globe className="h-3.5 w-3.5" /> {t(ev.linkLabel ?? 'Karte i termini')}
                          </a>
                        )}
                        {ev.phone && (
                          <a href={telHref(ev.phone)} className={ACTION_CLS}>
                            <Phone className="h-3.5 w-3.5" /> {t("Blagajna")} {ev.phone}
                          </a>
                        )}
                        {ev.instagramUrl && (
                          <a href={ev.instagramUrl} target="_blank" rel="noopener noreferrer" className={ACTION_CLS}>
                            <Instagram className="h-3.5 w-3.5" /> {t("Objava na Instagramu")}
                          </a>
                        )}
                      </div>
                      {ev.applyEmail && (
                        <div className="rounded-se-[40px] bg-[#EDEDEA] p-5">
                          <div className="font-mono-tabular text-[10px] tracking-[0.14em] text-[#8F8D88] uppercase">{t("Otvoreni poziv")}</div>
                          <h4 className="font-stone mt-2 text-[20px] leading-tight text-[#2B211C]">{t("Skuvajte za ceo grad")}</h4>
                          <p className="mt-2 text-[13px] leading-relaxed text-[#4F4A46]">
                            {t("Program traži kuvare za nove ponedeljke. Mogu se prijaviti restorani, udruženja, aktivisti i svako ko kuva za veliko društvo, pa i večera za svoju dijasporu otvorena za sve. Dolazi između 50 i 200 ljudi.")}
                          </p>
                          <p className="mt-2 text-[13px] leading-relaxed text-[#4F4A46]">
                            {t("U mejlu napišite ko ste, šta biste spremili, šta želite da promovišete i željeni termin.")}
                          </p>
                          <p className="font-quiet mt-2 text-[16px] text-[#2B211C]">
                            {t("Neka među ponedeljcima bude i halal večera. Prijavite se sa svojim jelom.")}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                            <a href={`mailto:${ev.applyEmail}`} className={ACTION_CLS}>
                              <Mail className="h-3.5 w-3.5" /> {ev.applyEmail}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-auto flex flex-wrap items-center gap-6 pt-6">
                    <IslamicButton
                      variant={joined ? 'kocka' : 'flowline'}
                      tone={joined ? 'emerald' : 'charcoal'}
                      size="sm"
                      onClick={() => openRsvp(ev)}
                      iconLeft={joined ? <Check className="h-3.5 w-3.5" /> : undefined}
                    >
                      {t(joined ? 'Zabeleženo' : 'Planiram doći')}
                    </IslamicButton>
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => toggleEvent(open ? null : ev.id)}
                      className="text-[14px] text-[#0F7A53] transition-colors hover:text-[#221D1A]"
                    >
                      {t(open ? 'Vidi manje' : 'Vidi više')}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyEventLink(ev.id)}
                      aria-label={t('Kopiraj link')}
                      title={t('Kopiraj link')}
                      className="ms-auto inline-flex items-center gap-1.5 text-[12px] text-[#8F8D88] transition-colors hover:text-[#221D1A]"
                    >
                      {copiedEvent === ev.id ? (
                        <>
                          <Check className="h-4 w-4 text-[#0F7A53]" />
                          <span className="text-[#0F7A53]">{t('Link kopiran')}</span>
                        </>
                      ) : (
                        <Link2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="mt-8 flex flex-col gap-4 border-t border-[#D4D3CD] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-stone text-[22px] leading-tight text-[#2B211C]">{t("Znaš za dobar događaj?")}</div>
              <p className="mt-1 text-[14px] text-[#4F4A46]">{t("Predavanje, iftar, izložba, koncert ili šetnja. Pošalji nam i dodaćemo ga ovde.")}</p>
            </div>
            <IslamicButton variant="kocka" tone="charcoal" size="sm" iconLeft={<Plus className="h-3.5 w-3.5" />} onClick={openSuggest}>
              {t("Predloži događaj")}
            </IslamicButton>
          </div>
        </div>
          </div>
      </section>
      </div>

      {/* 4. UMREŽAVANJA — zajednica gore, pa Koga zvati i imenik rame uz rame */}
      <div className="bg-[#FFFFFF]">
      <section id="umrezavanja" className="mx-auto max-w-[1440px] lg:ps-[130px]">
        <div className="border-s border-[#2B211C] bg-[#FFFFFF]">
          <ChapterMark label={t("Umrežavanje muslimana")} />

          {/* Zajednica: Ženski džemat i Facebook */}
          {IMENIK_LAYOUT === 'd1' ? (
            <div className="grid grid-cols-1 gap-x-10 gap-y-5 bg-[#EDEDEA] px-6 py-6 sm:px-10 md:grid-cols-2">
              {COMMUNITY_CHANNELS.map((ch) => (
                <button key={ch.id} type="button" onClick={() => setCommunityModal(ch.id)} className="group flex w-full items-stretch gap-5 text-start">
                  <span className="relative block h-[112px] w-[44%] max-w-[240px] shrink-0 overflow-hidden rounded-se-[40px] bg-[#D4D3CD]">
                    <img loading="lazy" decoding="async" src={ch.src} alt={t(ch.alt)} className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${ch.pos}`} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col justify-center border-t border-[#2B211C] pt-2">
                    <span className="font-stone text-[22px] leading-tight text-[#2B211C] transition-colors group-hover:text-[#0F7A53]">{t(ch.title)}</span>
                    <span className="font-quiet mt-0.5 text-[15px] leading-snug text-[#8F8D88]">{t(ch.sub)}</span>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-[#0F7A53]">
                      {t(ch.action)}
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" />
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 bg-[#EDEDEA] px-6 py-6 sm:grid-cols-2 sm:px-10">
              {COMMUNITY_CHANNELS.map((ch) => (
                <button key={ch.id} type="button" onClick={() => setCommunityModal(ch.id)} className="group flex items-center gap-4 text-start">
                  <span className="relative block h-[72px] w-[72px] shrink-0 overflow-hidden rounded-se-[24px] bg-[#D4D3CD]">
                    <img loading="lazy" decoding="async" src={ch.src} alt={t(ch.alt)} className={`absolute inset-0 h-full w-full object-cover ${ch.pos}`} />
                  </span>
                  <span>
                    <span className="font-stone block text-[22px] leading-tight text-[#2B211C] transition-colors group-hover:text-[#0F7A53]">{t(ch.title)}</span>
                    <span className="font-quiet block text-[15px] text-[#8F8D88]">{t(ch.sub)}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 gap-x-16 gap-y-14 px-6 pt-9 pb-12 sm:px-10 lg:grid-cols-2 lg:gap-y-0 lg:pt-10">
            {/* Koga zvati. Kolone dele redove (subgrid), pa su linije poravnate. */}
            <div className="grid grid-cols-1 lg:row-span-3 lg:grid-rows-subgrid">
              <div>
                <SignTitle caps={t("Koga")} rest={t("zvati")} accent="#9E2B45" />
                <p className="font-quiet mt-2 max-w-xl text-[18px] leading-[1.5] text-[#2B211C]">
                  {t("Brojevi koji trebaju svakome ko tek dođe u Beograd.")}
                </p>
              </div>
              <div role="group" aria-label={t("Vrsta kontakta")} className="mt-5 flex flex-wrap content-center items-center gap-x-6 gap-y-2 text-[15px]">
                {USEFUL_CONTACTS.map((g) => (
                  <button
                    key={g.title}
                    type="button"
                    onClick={() => setContactGroup(g.title)}
                    className={`pb-1 transition-colors ${contactGroup === g.title ? 'border-b border-[#2B211C] text-[#2B211C]' : 'text-[#8F8D88] hover:text-[#2B211C]'}`}
                  >
                    {t(g.title)}
                  </button>
                ))}
              </div>
              <ol className="mt-2 grid grid-cols-1 content-start gap-x-8 sm:grid-cols-2">
                {(USEFUL_CONTACTS.find((g) => g.title === contactGroup) ?? USEFUL_CONTACTS[0]).items.map((c) => (
                  <li key={c.name} className="border-b border-[#D4D3CD] py-4">
                    <div className="font-stone text-[19px] leading-tight text-[#2B211C]">{t(c.name)}</div>
                    <div className="mt-1 text-[13px] text-[#8F8D88]">{t(c.note)}</div>
                    {c.phone ? (
                      <a href={telHref(c.phone)} className="font-quiet mt-2 inline-flex items-center gap-1.5 text-[18px] text-[#0F7A53] hover:underline">
                        <Phone className="h-3.5 w-3.5" /> {c.phone}
                      </a>
                    ) : c.link ? (
                      <a href={c.link} target="_blank" rel="noopener noreferrer" className="font-quiet mt-2 inline-flex items-center gap-1.5 text-[18px] text-[#0F7A53] hover:underline">
                        <Globe className="h-3.5 w-3.5" /> {c.linkLabel}
                      </a>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>

            {/* Imenik: Osloni se na svoje */}
            <div id="imenik" className="grid scroll-mt-24 grid-cols-1 lg:row-span-3 lg:grid-rows-subgrid">
              <div>
                <SignTitle caps={t("Osloni se")} rest={t("na svoje")} />
                <p className="font-quiet mt-2 max-w-xl text-[18px] leading-[1.5] text-[#2B211C]">
                  {t("Muslimani koji rade u Beogradu.")}
                </p>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                <IslamicButton
                  variant="kocka"
                  tone="brick"
                  size="sm"
                  iconLeft={<Plus className="h-3.5 w-3.5" />}
                  onClick={() => { setNbrMode('self'); setNbrDone(false); setShowAddNeighbor(true); }}
                >
                  {t("Upiši svoj biznis")}
                </IslamicButton>
                <IslamicButton
                  variant="flowline"
                  size="sm"
                  onClick={() => { setNbrMode('rec'); setNbrDone(false); setShowAddNeighbor(true); }}
                >
                  {t("Preporuči nekoga")}
                </IslamicButton>
              </div>
              <div>
                {neighbors.length > 6 && (
                  <div role="group" aria-label={t("Filtriraj delatnosti")} className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px]">
                    {(
                      [
                        ['sve', 'Sve'],
                        ['zdravlje', 'Doktori i zdravlje'],
                        ['zanat', 'Zanati i majstori'],
                        ['biznis', 'Preduzetnici i frilenseri'],
                        ['hrana', 'Hrana i ketering'],
                        ['lepota', 'Lepota i njega'],
                      ] as const
                    ).map(([key, label]) => (
                      <button key={key} type="button" onClick={() => setSkillFilter(key)} className={`shrink-0 whitespace-nowrap pb-1 transition-colors ${skillFilter === key ? 'border-b border-[#2B211C] text-[#2B211C]' : 'text-[#8F8D88] hover:text-[#2B211C]'}`}>
                        {t(label)}
                      </button>
                    ))}
                  </div>
                )}
              {neighbors.length === 0 ? (
                <p className="font-quiet mt-4 text-[17px] text-[#8F8D88]">{t("Imenik tek počinje. Prvi upisi pojaviće se ovde čim ih pregledamo.")}</p>
              ) : (
                <ol className="mt-2 grid grid-cols-1 content-start gap-x-8 sm:grid-cols-2">
                  {filteredNeighbors.map((item) => (
                    <li key={item.id} className="border-b border-[#D4D3CD] py-4">
                      <div className="font-stone text-[19px] leading-tight text-[#2B211C]">{item.name}</div>
                      <div className="mt-1 text-[13px] text-[#8F8D88]">{item.profession} · {item.district}</div>
                      {item.note && <p className="mt-1 text-[13px] leading-relaxed text-[#4F4A46]">{item.note}</p>}
                      <ContactLink value={item.contact} />
                    </li>
                  ))}
                </ol>
              )}

              <div className="mt-6">
        {/* Formular za dodavanje komšije / sebe */}
        {showAddNeighbor && (
          <div className="mb-10 border border-[#D4D3CD] bg-[#EAEAE6]/55 p-7 sm:p-9">
            {nbrSaving ? (
              <div className="flex min-h-[180px] flex-col items-center justify-center">
                <TespihLoader size={58} label={t("Šaljemo vaš unos...")} />
              </div>
            ) : nbrDone ? (
              <div className="py-4">
                <div className="inline-flex h-9 w-9 items-center justify-center bg-[#0F7A53] text-[#FFFFFF]">
                  <Check className="h-4 w-4" />
                </div>
                <h3 className="font-stone mt-4 text-[24px] text-[#221D1A]">{t("Hvala, unos je poslan")}</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-[#4F4A46]">
                  {t("Pregledaćemo ga i dodati u imenik u narednim danima.")}
                </p>
                <div className="mt-5 flex items-center gap-6">
                  <IslamicButton variant="kocka" tone="concrete" size="sm" onClick={() => setNbrDone(false)}>
                    {t("Dodaj još jednog")}
                  </IslamicButton>
                  <button type="button" onClick={() => { setNbrDone(false); setShowAddNeighbor(false); }} className="text-xs text-[#807E79] hover:text-[#221D1A]">
                    {t("Zatvori")}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddNeighbor} className="space-y-5">
                <div className="font-stone text-[22px] text-[#221D1A]">{t(nbrMode === 'rec' ? 'Preporuči nekoga' : 'Upiši svoj biznis')}</div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor="nbr-name"
                      className="block text-xs font-medium text-[#221D1A]"
                    >
                      {t("Ime ili radnja")}
                    </label>
                    <input
                      id="nbr-name"
                      type="text"
                      required
                      value={nbrName}
                      onChange={(e) => setNbrName(e.target.value)}
                      placeholder={t("Npr. Edin S.")}
                      className="mt-1.5 w-full border border-[#D4D3CD] bg-[#FFFFFF] px-3 py-2 text-sm focus:border-[#221D1A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="nbr-prof"
                      className="block text-xs font-medium text-[#221D1A]"
                    >
                      {t("Zanimanje / usluga")}
                    </label>
                    <input
                      id="nbr-prof"
                      type="text"
                      required
                      value={nbrProfession}
                      onChange={(e) => setNbrProfession(e.target.value)}
                      placeholder={t("Npr. Automehaničar")}
                      className="mt-1.5 w-full border border-[#D4D3CD] bg-[#FFFFFF] px-3 py-2 text-sm focus:border-[#221D1A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="nbr-cat"
                      className="block text-xs font-medium text-[#221D1A]"
                    >
                      {t("Oblast")}
                    </label>
                    <select
                      id="nbr-cat"
                      value={nbrCategory}
                      onChange={(e) =>
                        setNbrCategory(e.target.value as Exclude<SkillCategory, 'sve'>)
                      }
                      className="mt-1.5 w-full border border-[#D4D3CD] bg-[#FFFFFF] px-3 py-2 text-sm focus:border-[#221D1A] focus:outline-none"
                    >
                      <option value="zdravlje">{t("Doktori i zdravlje")}</option>
                      <option value="zanat">{t("Zanati i majstori")}</option>
                      <option value="biznis">{t("Preduzetnici i frilenseri")}</option>
                      <option value="hrana">{t("Hrana i ketering")}</option>
                      <option value="lepota">{t("Lepota i njega")}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor="nbr-dist"
                      className="block text-xs font-medium text-[#221D1A]"
                    >
                      {t("Deo grada")}
                    </label>
                    <input
                      id="nbr-dist"
                      type="text"
                      value={nbrDistrict}
                      onChange={(e) => setNbrDistrict(e.target.value)}
                      placeholder={t("Npr. Voždovac / Dorćol")}
                      className="mt-1.5 w-full border border-[#D4D3CD] bg-[#FFFFFF] px-3 py-2 text-sm focus:border-[#221D1A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="nbr-contact"
                      className="block text-xs font-medium text-[#221D1A]"
                    >
                      {t("Kontakt (telefon / IG / email)")}
                    </label>
                    <input
                      id="nbr-contact"
                      type="text"
                      value={nbrContact}
                      onChange={(e) => setNbrContact(e.target.value)}
                      placeholder={t("Telefon ili profil")}
                      className="mt-1.5 w-full border border-[#D4D3CD] bg-[#FFFFFF] px-3 py-2 text-sm focus:border-[#221D1A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="nbr-rec"
                      className="block text-xs font-medium text-[#221D1A]"
                    >
                      {t("Preporučio/la (opcionalno)")}
                    </label>
                    <input
                      id="nbr-rec"
                      type="text"
                      value={nbrRecommender}
                      onChange={(e) => setNbrRecommender(e.target.value)}
                      placeholder={t("Ime ili ostavite prazno")}
                      className="mt-1.5 w-full border border-[#D4D3CD] bg-[#FFFFFF] px-3 py-2 text-sm focus:border-[#221D1A] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="nbr-note"
                    className="block text-xs font-medium text-[#221D1A]"
                  >
                    {t("Kratak opis onoga što radite")}
                  </label>
                  <input
                    id="nbr-note"
                    type="text"
                    value={nbrNote}
                    onChange={(e) => setNbrNote(e.target.value)}
                    placeholder={t("Šta nudite i kako vas komšije mogu angažovati...")}
                    className="mt-1.5 w-full border border-[#D4D3CD] bg-[#FFFFFF] px-3 py-2 text-sm focus:border-[#221D1A] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <IslamicButton
                    type="submit"
                    variant="kocka"
                    tone="charcoal"
                    size="sm"
                    iconLeft={<Plus className="h-3.5 w-3.5" />}
                  >
                    {t("Pošalji unos")}
                  </IslamicButton>
                  <button
                    type="button"
                    onClick={() => setShowAddNeighbor(false)}
                    className="text-xs text-[#807E79] hover:text-[#221D1A]"
                  >
                    {t("Otkaži")}
                  </button>
                </div>
                {nbrError && (
                  <p className="text-sm text-[#9E2B45]">
                    {t("Slanje nije uspelo. Pokušajte ponovo ili pišite na")}{' '}{CONTACT_EMAIL}.
                  </p>
                )}
              </form>
            )}
          </div>
        )}

              </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* 5. POTRAŽI POMOĆ — Isključivo građanska solidarnost van institucija */}
      <section id="potrazi-pomoc" className="bg-[linear-gradient(90deg,#FFFFFF_0,#FFFFFF_60%,#EDEDEA_60%,#EDEDEA_100%)] rtl:bg-[linear-gradient(270deg,#FFFFFF_0,#FFFFFF_60%,#EDEDEA_60%,#EDEDEA_100%)]">
        <div className="mx-auto max-w-[1440px] lg:ps-[130px]">
          <div className="border-s border-[#2B211C] bg-[#FFFFFF]">
          <ChapterMark label={t("Javi nam se")} />
          <div className="grid grid-cols-1 lg:grid-cols-[560px_1fr]">
            <div className="flex flex-col justify-between bg-[#FFFFFF] px-6 sm:px-10 pt-10 pb-14 lg:pt-12">
              <div>
                <SignTitle caps={t("Javi se,")} rest={t("tu smo")} />
                <p className="font-quiet mt-6 text-[19px] leading-[1.5] text-[#2B211C]">
                  {t("Ovaj sajt nema fizičku adresu, kancelariju niti je povezan sa zvaničnim islamskim zajednicama. Obraćate se direktno komšijama i volonterima za snalaženje u gradu, studentski smeštaj ili razgovor.")}
                </p>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-[#EAEAE6] pt-6 text-xs">
                <button
                  type="button"
                  onClick={() => setCommunityModal('whatsapp')}
                  className="font-medium text-[#0F7A53] hover:text-[#221D1A] transition-colors"
                >
                  {t("Ženski online džemat · WhatsApp")}
                </button>
                <span aria-hidden="true" className="text-[#D4D3CD]">
                  /
                </span>
                <button
                  type="button"
                  onClick={() => setCommunityModal('facebook')}
                  className="font-medium text-[#221D1A] hover:text-[#0F7A53] transition-colors"
                >
                  {t("Facebook stranica")}
                </button>
              </div>
            </div>

            <div className="bg-[#EDEDEA] px-6 sm:px-10 pt-10 pb-14 lg:px-14 lg:pt-12">
              {helpSending ? (
                <div className="flex min-h-[240px] flex-col items-center justify-center py-10">
                  <TespihLoader size={64} label={t("Šaljemo vaš upit komšijama...")} />
                </div>
              ) : helpSubmitted ? (
                <div className="py-10">
                  <div className="inline-flex h-9 w-9 items-center justify-center bg-[#0F7A53] text-[#FFFFFF]">
                    <Check className="h-4 w-4" />
                  </div>
                  <h3 className="font-human mt-5 text-2xl font-medium text-[#221D1A]">
                    {t("Poruka je zabeležena")}
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-[#4F4A46]">
                    {helpName ? fill(t('Hvala, {name}. Neko iz građanske mreže u Beogradu javiće vam se u najkraćem roku.'), {name: helpName}) : t('Hvala. Neko iz građanske mreže u Beogradu javiće vam se u najkraćem roku.')}
                  </p>
                  <div className="mt-6">
                    <IslamicButton
                      variant="kocka"
                      tone="concrete"
                      size="sm"
                      onClick={() => {
                        setHelpSubmitted(false);
                        setHelpMessage('');
                      }}
                    >
                      {t("Nova poruka")}
                    </IslamicButton>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleHelpSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="help-name"
                        className="block text-xs font-medium text-[#221D1A]"
                      >
                        {t("Ime (opcionalno)")}
                      </label>
                      <input
                        id="help-name"
                        type="text"
                        value={helpName}
                        onChange={(e) => setHelpName(e.target.value)}
                        placeholder={t("Kako da vas oslovimo")}
                        className="mt-1.5 w-full border border-[#D4D3CD] bg-[#FFFFFF] px-3.5 py-2.5 text-sm text-[#221D1A] placeholder:text-[#807E79] focus:border-[#221D1A] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="help-contact"
                        className="block text-xs font-medium text-[#221D1A]"
                      >
                        {t("Kontakt (telefon / WhatsApp / email)")}
                      </label>
                      <input
                        id="help-contact"
                        type="text"
                        required
                        value={helpContact}
                        onChange={(e) => setHelpContact(e.target.value)}
                        placeholder={t("Gde da vam odgovorimo")}
                        className="mt-1.5 w-full border border-[#D4D3CD] bg-[#FFFFFF] px-3.5 py-2.5 text-sm text-[#221D1A] placeholder:text-[#807E79] focus:border-[#221D1A] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="help-message"
                      className="block text-xs font-medium text-[#221D1A]"
                    >
                      {t("Poruka")}
                    </label>
                    <textarea
                      id="help-message"
                      rows={3}
                      required
                      value={helpMessage}
                      onChange={(e) => setHelpMessage(e.target.value)}
                      placeholder={t("Ukratko napišite šta vam je potrebno...")}
                      className="mt-1.5 w-full border border-[#D4D3CD] bg-[#FFFFFF] px-3.5 py-2.5 text-sm text-[#221D1A] placeholder:text-[#807E79] focus:border-[#221D1A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-8">
                      <IslamicButton type="submit" variant="kocka" tone="brick" size="md">
                        {t("Pošalji upit")}
                      </IslamicButton>
                      <IslamicButton
                        type="button"
                        variant="flowline"
                        tone="brick"
                        size="md"
                        href={`mailto:${CONTACT_EMAIL}`}
                      >
                        {t("Ili pošalji mail")}
                      </IslamicButton>
                    </div>
                    {helpError && (
                      <p className="mt-4 text-sm text-[#9E2B45]">
                        {t("Slanje nije uspelo. Pokušajte ponovo ili pišite na")}{' '}{CONTACT_EMAIL}.
                      </p>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* Tihi završni dio */}
      <footer className="bg-[linear-gradient(90deg,#FFFFFF_0,#FFFFFF_9%,#EDEDEA_9%,#EDEDEA_100%)] rtl:bg-[linear-gradient(270deg,#FFFFFF_0,#FFFFFF_9%,#EDEDEA_9%,#EDEDEA_100%)] text-[#2B211C]">
        <div className="mx-auto max-w-[1440px] lg:ps-[130px]">
          <div className="border-s border-[#2B211C] bg-[#EDEDEA] px-6 sm:px-10 pt-16 pb-12">
            <figure className="m-0 max-w-3xl">
              <p className="font-amiri-ar text-left [[dir=rtl]_&]:text-right text-[26px] leading-[1.9] text-[#0F7A53] sm:text-[30px]" dir="rtl" lang="ar">
                وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ ۖ وَلَا تَعَاوَنُوا عَلَى الْإِثْمِ وَالْعُدْوَانِ
              </p>
              {lang !== 'ar' && (
              <blockquote className="font-quiet m-0 mt-4 text-[26px] leading-[1.4] text-[#2B211C]">
                {t("„Jedni drugima pomažite u dobročinstvu i čestitosti, a ne sudelujte u grehu i neprijateljstvu.”")}
              </blockquote>
              )}
              <figcaption className="font-quiet mt-4 text-[15px] text-[#8F8D88]">
                {t("El-Maide, 2")}
              </figcaption>
            </figure>

            <div className="mt-14 border-t border-[#2B211C] pt-6 sm:flex sm:items-center sm:justify-between">
              <button type="button" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} aria-label={t("Povratak na vrh")} className="flex items-center gap-3"><img src="/assets/sumud-znak.svg" alt="" aria-hidden="true" className="h-[30px] w-auto" /><span className="font-stone text-[16px] tracking-[0.3em] text-[#2B211C]">{t("SUMUD")}</span></button>
              <nav className="mt-3 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-2">
                <button type="button" onClick={() => setCommunityModal('whatsapp')} className="border-b border-[#D4D3CD] py-3.5 text-start text-[16px] leading-tight text-[#4F4A46] transition-colors hover:text-[#221D1A] sm:border-0 sm:py-0 sm:text-[14px]">{t("Ženski online džemat · WhatsApp")}</button>
                <button type="button" onClick={() => setCommunityModal('facebook')} className="border-b border-[#D4D3CD] py-3.5 text-start text-[16px] leading-tight text-[#4F4A46] transition-colors hover:text-[#221D1A] sm:border-0 sm:py-0 sm:text-[14px]">{t("Facebook")}</button>
                <a href={pathFor(lang, {kind: 'vaktija'})} onClick={(e) => { e.preventDefault(); setRoute(lang, {kind: 'vaktija'}); document.getElementById('vaktija')?.scrollIntoView({behavior: 'smooth', block: 'start'}); }} className="border-b border-[#D4D3CD] py-3.5 text-start text-[16px] leading-tight text-[#4F4A46] transition-colors hover:text-[#221D1A] sm:border-0 sm:py-0 sm:text-[14px]">{t("Vreme namaza · Beograd")}</a>
                <a href={pathFor(lang, {kind: 'pitanja'})} onClick={(e) => { e.preventDefault(); openFaq(true); }} className="border-b border-[#D4D3CD] py-3.5 text-start text-[16px] leading-tight text-[#4F4A46] transition-colors hover:text-[#221D1A] sm:border-0 sm:py-0 sm:text-[14px]">{t("Česta pitanja")}</a>
                <button type="button" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} aria-label={t("Povratak na vrh")} title={t("Povratak na vrh")} className="mt-4 inline-flex h-9 w-9 items-center justify-center self-start text-[#4F4A46] transition-colors hover:text-[#221D1A] sm:mt-0"><ArrowUp className="h-[18px] w-[18px]" /></button>
              </nav>
            </div>
          </div>
        </div>
      </footer>

      {/* RSVP modal */}
      {rsvpEvent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${t('Prijava za događaj')} ${t(rsvpEvent.title)}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#221D1A]/80 p-4 sm:p-8"
          onClick={() => setRsvpEvent(null)}
        >
          <div
            className="w-full max-w-md border border-[#221D1A] bg-[#FFFFFF] p-7 sm:p-9"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#EAEAE6] pb-3">
              <span className="font-mono-tabular text-[11px] text-[#0F7A53] uppercase">
                {rsvpEvent.day} {t(rsvpEvent.month)} · {rsvpEvent.time}
              </span>
              <button
                type="button"
                onClick={() => setRsvpEvent(null)}
                aria-label={t("Zatvori prozor")}
                className="inline-flex h-8 w-8 items-center justify-center border border-[#D4D3CD] text-[#221D1A] hover:border-[#221D1A]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h3 className="font-stone mt-5 text-[26px] leading-tight text-[#221D1A]">{t(rsvpEvent.title)}</h3>
            <div className="font-quiet mt-1 text-[17px] text-[#9E2B45]">{t(rsvpEvent.place)}</div>

            {rsvpStatus === 'done' ? (
              <div className="mt-6">
                <div className="inline-flex h-9 w-9 items-center justify-center bg-[#0F7A53] text-[#FFFFFF]">
                  <Check className="h-4 w-4" />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#4F4A46]">
                  {rsvpName ? fill(t('Zabeleženo, vidimo se, {name}! Ako se planovi promene, javite nam na'), {name: rsvpName}) : t('Zabeleženo, vidimo se! Ako se planovi promene, javite nam na')}{' '}{CONTACT_EMAIL}.
                </p>
                <div className="mt-6">
                  <IslamicButton variant="kocka" tone="charcoal" size="sm" onClick={() => setRsvpEvent(null)}>
                    {t("Zatvori")}
                  </IslamicButton>
                </div>
              </div>
            ) : rsvpStatus === 'sending' ? (
              <div className="flex min-h-[160px] items-center justify-center">
                <TespihLoader size={52} label={t("Šaljemo prijavu...")} />
              </div>
            ) : (
              <form onSubmit={handleRsvpSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="rsvp-name" className="block text-xs font-medium text-[#221D1A]">{t("Ime")}</label>
                  <input id="rsvp-name" type="text" required value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} placeholder={t("Kako da vas zabeležimo")} className={INPUT_CLS} />
                </div>
                <div className="grid grid-cols-[1fr_110px] gap-4">
                  <div>
                    <label htmlFor="rsvp-contact" className="block text-xs font-medium text-[#221D1A]">{t("Kontakt (opcionalno)")}</label>
                    <input id="rsvp-contact" type="text" value={rsvpContact} onChange={(e) => setRsvpContact(e.target.value)} placeholder={t("Telefon ili email")} className={INPUT_CLS} />
                  </div>
                  <div>
                    <label htmlFor="rsvp-count" className="block text-xs font-medium text-[#221D1A]">{t("Broj osoba")}</label>
                    <select id="rsvp-count" value={rsvpCount} onChange={(e) => setRsvpCount(e.target.value)} className={INPUT_CLS}>
                      {['1', '2', '3', '4', '5', '6+'].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-6 pt-2">
                  <IslamicButton type="submit" variant="kocka" tone="emerald" size="sm">
                    {t("Potvrdi dolazak")}
                  </IslamicButton>
                  <button type="button" onClick={() => setRsvpEvent(null)} className="text-xs text-[#807E79] hover:text-[#221D1A]">
                    {t("Otkaži")}
                  </button>
                </div>
                {rsvpStatus === 'error' && (
                  <p className="text-sm text-[#9E2B45]">{t("Slanje nije uspelo. Pokušajte ponovo.")}</p>
                )}
              </form>
            )}
          </div>
        </div>
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="faq-title"
        hidden={!faqOpen}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#221D1A]/80 p-4 sm:p-8"
        onClick={() => openFaq(false)}
      >
        <div
          className="max-h-[92vh] w-full max-w-2xl overflow-y-auto border border-[#221D1A] bg-[#FFFFFF] p-7 sm:p-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-[#EAEAE6] pb-3">
            <span className="font-mono-tabular text-[11px] text-[#0F7A53] uppercase">{t("Muslimani Beograda")}</span>
            <button
              type="button"
              onClick={() => openFaq(false)}
              aria-label={t("Zatvori prozor")}
              className="inline-flex h-8 w-8 items-center justify-center border border-[#D4D3CD] text-[#221D1A] hover:border-[#221D1A]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <h2 id="faq-title" className="font-stone mt-5 text-[30px] leading-tight text-[#221D1A]">{t("Česta pitanja")}</h2>
          <dl className="mt-4">
            {FAQ.map((f) => (
              <div key={f.q} className="border-b border-[#EAEAE6] py-5 last:border-b-0">
                <dt className="font-stone text-[20px] leading-snug text-[#221D1A]">{t(f.q)}</dt>
                <dd className="mt-2 text-[15px] leading-relaxed text-[#4F4A46]">{t(f.a)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {suggestOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("Predloži događaj")}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#221D1A]/80 p-4 sm:p-8"
          onClick={() => setSuggestOpen(false)}
        >
          <div
            className="max-h-[92vh] w-full max-w-md overflow-y-auto border border-[#221D1A] bg-[#FFFFFF] p-7 sm:p-9"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#EAEAE6] pb-3">
              <span className="font-mono-tabular text-[11px] text-[#0F7A53] uppercase">{t("Kulturni događaji")}</span>
              <button
                type="button"
                onClick={() => setSuggestOpen(false)}
                aria-label={t("Zatvori prozor")}
                className="inline-flex h-8 w-8 items-center justify-center border border-[#D4D3CD] text-[#221D1A] hover:border-[#221D1A]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h3 className="font-stone mt-5 text-[26px] leading-tight text-[#221D1A]">{t("Predloži događaj")}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-[#4F4A46]">{t("Predavanje, iftar, izložba, koncert ili šetnja. Pošalji nam i dodaćemo ga ovde.")}</p>

            {sgStatus === 'done' ? (
              <div className="mt-6">
                <div className="inline-flex h-9 w-9 items-center justify-center bg-[#0F7A53] text-[#FFFFFF]">
                  <Check className="h-4 w-4" />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#4F4A46]">{t("Hvala, predlog je poslat. Pogledaćemo ga i dodati događaj na sajt.")}</p>
                <div className="mt-6 flex items-center gap-6">
                  <IslamicButton variant="kocka" tone="charcoal" size="sm" onClick={() => setSuggestOpen(false)}>
                    {t("Zatvori")}
                  </IslamicButton>
                  <button type="button" onClick={() => setSgStatus('idle')} className="text-xs text-[#807E79] hover:text-[#221D1A]">
                    {t("Predloži još jedan")}
                  </button>
                </div>
              </div>
            ) : sgStatus === 'sending' ? (
              <div className="flex min-h-[160px] items-center justify-center">
                <TespihLoader size={52} label={t("Šaljemo predlog...")} />
              </div>
            ) : (
              <form onSubmit={handleSuggestSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="sg-title" className="block text-xs font-medium text-[#221D1A]">{t("Naziv događaja")}</label>
                  <input id="sg-title" type="text" required value={sgTitle} onChange={(e) => setSgTitle(e.target.value)} placeholder={t("Npr. Predavanje o islamskoj umetnosti")} className={INPUT_CLS} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="sg-when" className="block text-xs font-medium text-[#221D1A]">{t("Kada")}</label>
                    <input id="sg-when" type="text" required value={sgWhen} onChange={(e) => setSgWhen(e.target.value)} placeholder={t("Datum i sat")} className={INPUT_CLS} />
                  </div>
                  <div>
                    <label htmlFor="sg-place" className="block text-xs font-medium text-[#221D1A]">{t("Gde")}</label>
                    <input id="sg-place" type="text" required value={sgPlace} onChange={(e) => setSgPlace(e.target.value)} placeholder={t("Mesto i adresa")} className={INPUT_CLS} />
                  </div>
                </div>
                <div>
                  <label htmlFor="sg-link" className="block text-xs font-medium text-[#221D1A]">{t("Link (opcionalno)")}</label>
                  <input id="sg-link" type="text" value={sgLink} onChange={(e) => setSgLink(e.target.value)} placeholder={t("Instagram, sajt ili Facebook")} className={INPUT_CLS} />
                </div>
                <div>
                  <label htmlFor="sg-note" className="block text-xs font-medium text-[#221D1A]">{t("Kratak opis (opcionalno)")}</label>
                  <textarea id="sg-note" rows={3} value={sgNote} onChange={(e) => setSgNote(e.target.value)} placeholder={t("O čemu je i za koga je")} className={INPUT_CLS} />
                </div>
                <div>
                  <label htmlFor="sg-contact" className="block text-xs font-medium text-[#221D1A]">{t("Tvoj kontakt (opcionalno)")}</label>
                  <input id="sg-contact" type="text" value={sgContact} onChange={(e) => setSgContact(e.target.value)} placeholder={t("Telefon ili email")} className={INPUT_CLS} />
                </div>
                <div className="flex items-center gap-6 pt-2">
                  <IslamicButton type="submit" variant="kocka" tone="emerald" size="sm">
                    {t("Pošalji predlog")}
                  </IslamicButton>
                  <button type="button" onClick={() => setSuggestOpen(false)} className="text-xs text-[#807E79] hover:text-[#221D1A]">
                    {t("Otkaži")}
                  </button>
                </div>
                {sgStatus === 'error' && (
                  <p className="text-sm text-[#9E2B45]">{t("Slanje nije uspelo. Pokušajte ponovo.")}</p>
                )}
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal za puni tekst o istoriji */}
      {storyOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t(HISTORY_STORY.title)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#221D1A]/80 p-4 sm:p-8"
          onClick={() => setStoryOpen(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-[#221D1A] bg-[#FFFFFF] p-6 sm:p-10"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-[#EAEAE6] pb-4">
              <div className="font-mono-tabular text-[11px] text-[#807E79]">
                {t(HISTORY_STORY.label)}
              </div>
              <button
                type="button"
                onClick={() => setStoryOpen(false)}
                aria-label={t("Zatvori priču")}
                className="inline-flex h-8 w-8 items-center justify-center border border-[#D4D3CD] text-[#221D1A] hover:border-[#221D1A]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-12 sm:items-center">
              <div className="border border-[#D4D3CD] bg-[#EAEAE6] p-1 sm:col-span-5">
                <img loading="lazy" decoding="async"
                  src={HISTORY_STORY.photoSrc}
                  alt={t(HISTORY_STORY.photoAlt)}
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
              <div className="sm:col-span-7">
                <h3 className="font-brutal text-2xl font-semibold tracking-[-0.02em] text-[#221D1A] sm:text-3xl">
                  {t(HISTORY_STORY.title)}
                </h3>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-[#4F4A46]">
              {HISTORY_STORY.paragraphs.map((p, idx) => (
                <p key={idx}>{t(p)}</p>
              ))}
            </div>

            <div className="mt-8 flex justify-end border-t border-[#EAEAE6] pt-5">
              <IslamicButton
                variant="kocka"
                tone="charcoal"
                size="sm"
                onClick={() => setStoryOpen(false)}
              >
                {t("Zatvori")}
              </IslamicButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
