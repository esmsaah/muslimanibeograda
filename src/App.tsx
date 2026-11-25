import SumudMark from './components/SumudMark';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {LANGS, useLang} from './i18n';
import {
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Download,
  Image as ImageIcon,
  Maximize2,
  X,
} from 'lucide-react';
import {
  BelgradeLandscapeHero,
  BelgradeLandscapeHeroHandle,
} from './components/BelgradeLandscapeHero';
import {HeroRotoscope} from './components/HeroRotoscope';
import {IslamicButton} from './components/IslamicButton';
import {WebsiteTemplateView} from './components/WebsiteTemplateView';
import {
  DRAWING_PLATES,
  LINE_PLATES,
  PHOTO_PLATES,
  PortraitPlate,
  REFERENCE_IMAGE,
  WallTone,
} from './data/portraits';
import {
  drawDeliveryCyclist,
  renderBelgradeGouachePainting,
} from './utils/belgradePainting';
import {exportSkylineCyclistGif} from './utils/gifExport';
import {extractCharcoalLines} from './utils/lineExtract';
import {downloadPortraitsAsZip} from './utils/zipDownload';

type SeriesKey = 'template' | 'landscape' | 'lines' | 'drawings' | 'photos';
type WallFilter = 'all' | WallTone;

function PortraitFrame({
  plate,
  resolvedSrc,
  showGuides,
  failed,
  onError,
  onOpen,
  compact = false,
}: {
  plate: PortraitPlate;
  resolvedSrc: string;
  showGuides: boolean;
  failed: boolean;
  onError: (id: string) => void;
  onOpen: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative block w-full aspect-square overflow-hidden bg-[#cfd6dc] text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F8A5F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eceff2]"
      aria-label={`Inspect Plate ${plate.plateNumber}: ${plate.title}`}
    >
      {failed ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#8ea1b2] to-[#c7cdd3] p-6 text-center text-[#1e252c]">
          <ImageIcon className="h-6 w-6 opacity-60" strokeWidth={1.5} />
          <span className="text-xs font-medium">{plate.title}</span>
        </div>
      ) : (
        <img
          src={resolvedSrc}
          alt={`Chest-up square portrait of ${plate.title.toLowerCase()} against ${plate.wallLabel.toLowerCase()}`}
          referrerPolicy="no-referrer"
          onError={() => onError(plate.id)}
          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.015]"
        />
      )}

      {showGuides && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/55" />
          <div className="absolute inset-x-0 top-[44%] h-px bg-white/55" />
          <div className="absolute inset-x-0 top-[23%] h-px border-t border-dashed border-white/40" />
        </div>
      )}

      {!compact && (
        <span className="pointer-events-none absolute end-3 bottom-3 flex h-8 w-8 items-center justify-center bg-[#1e252c]/70 text-[#eef1f4] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        </span>
      )}
    </button>
  );
}

export default function App() {
  const heroRef = useRef<BelgradeLandscapeHeroHandle | null>(null);
  const [series, setSeries] = useState<SeriesKey>('template');
  const [filter, setFilter] = useState<WallFilter>('all');
  const [showGuides, setShowGuides] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [extractedLines, setExtractedLines] = useState<Record<string, string>>({});
  const [isZipping, setIsZipping] = useState(false);
  const [gifPercent, setGifPercent] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {t, lang, setLang} = useLang();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const isTemplate = series === 'template';
  const isLandscape = series === 'landscape';
  const isEditorialWhite = isTemplate || isLandscape;

  useEffect(() => {
    let cancelled = false;
    const targets = LINE_PLATES.filter((plate) => plate.extractLines);
    Promise.all(
      targets.map(async (plate) => {
        try {
          const url = await extractCharcoalLines(plate.imageSrc);
          return [plate.id, url] as const;
        } catch {
          return [plate.id, plate.imageSrc] as const;
        }
      }),
    ).then((pairs) => {
      if (cancelled) return;
      setExtractedLines(Object.fromEntries(pairs));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const currentPlates =
    series === 'lines'
      ? LINE_PLATES
      : series === 'drawings'
        ? DRAWING_PLATES
        : PHOTO_PLATES;

  const resolveSrc = useCallback(
    (plate: PortraitPlate) => {
      if (plate.extractLines && extractedLines[plate.id]) {
        return extractedLines[plate.id];
      }
      return plate.imageSrc;
    },
    [extractedLines],
  );

  const filteredPlates = useMemo(() => {
    if (series !== 'photos' || filter === 'all') return currentPlates;
    return currentPlates.filter((plate) => plate.wallTone === filter);
  }, [series, filter, currentPlates]);

  const activePlate =
    activeIndex !== null ? currentPlates[activeIndex] ?? null : null;

  const handleSelectSeries = (next: SeriesKey) => {
    setSeries(next);
    setFilter('all');
    setActiveIndex(null);
    setMobileMenuOpen(false);
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleImageError = useCallback((id: string) => {
    setFailedImages((prev) => ({...prev, [id]: true}));
  }, []);

  const handleOpenPlate = useCallback(
    (plateId: string) => {
      const idx = currentPlates.findIndex((p) => p.id === plateId);
      if (idx !== -1) {
        setActiveIndex(idx);
      }
    },
    [currentPlates],
  );

  const handleStep = useCallback(
    (direction: -1 | 1) => {
      setActiveIndex((prev) => {
        if (prev === null) return null;
        return (prev + direction + currentPlates.length) % currentPlates.length;
      });
    },
    [currentPlates.length],
  );

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveIndex(null);
      } else if (event.key === 'ArrowLeft') {
        handleStep(-1);
      } else if (event.key === 'ArrowRight') {
        handleStep(1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, handleStep]);

  const handleDownloadAll = async () => {
    if (isZipping) return;
    setIsZipping(true);
    setDownloadError(null);
    try {
      const zipName =
        series === 'lines'
          ? 'belgrade-loose-line-portraits.zip'
          : series === 'drawings'
            ? 'belgrade-portrait-drawings.zip'
            : 'muslims-of-belgrade-portraits.zip';
      await downloadPortraitsAsZip(
        currentPlates.map((plate) => ({
          filename: plate.downloadName,
          url: resolveSrc(plate),
        })),
        zipName,
      );
    } catch {
      setDownloadError(
        'Could not bundle the archive. Try downloading individual plates below.',
      );
    } finally {
      setIsZipping(false);
    }
  };

  const handleDirectGifExport = async () => {
    if (gifPercent !== null) return;
    if (heroRef.current) {
      await heroRef.current.downloadGif();
      return;
    }
    setGifPercent(0);
    try {
      const staticCanvas = document.createElement('canvas');
      renderBelgradeGouachePainting(staticCanvas);
      await exportSkylineCyclistGif(staticCanvas, drawDeliveryCyclist, {
        frames: 100,
        durationMs: 7000,
        filename: 'belgrade-skyline-cyclist-16x9.gif',
        onProgress: (fraction) => setGifPercent(Math.round(fraction * 100)),
      });
    } finally {
      setGifPercent(null);
    }
  };

  const handlePrimaryAction = async () => {
    if (isTemplate) {
      const el = document.getElementById('potrazi-pomoc');
      if (el) el.scrollIntoView({behavior: 'smooth', block: 'start'});
      setMobileMenuOpen(false);
      return;
    }
    if (isLandscape) {
      await handleDirectGifExport();
      return;
    }
    await handleDownloadAll();
  };

  const renderSeriesTabs = () => (
    <div
      role="group"
      aria-label="Odaberi prikaz ili arhivu"
      className={`inline-flex flex-wrap items-center gap-1 p-1 ${
        isEditorialWhite ? 'bg-[#EDEDEA]' : 'bg-[#e1e6eb]'
      }`}
    >
      <button
        type="button"
        onClick={() => handleSelectSeries('template')}
        className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
          series === 'template'
            ? 'bg-[#FFFFFF] text-[#2B211C]'
            : 'text-[#54606d] hover:text-[#2B211C]'
        }`}
      >
        Naslovna stranica
      </button>
      <button
        type="button"
        onClick={() => handleSelectSeries('landscape')}
        className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
          series === 'landscape'
            ? 'bg-[#FFFFFF] text-[#2B211C]'
            : 'text-[#54606d] hover:text-[#2B211C]'
        }`}
      >
        Skyline GIF Studio
      </button>
      <button
        type="button"
        onClick={() => handleSelectSeries('lines')}
        className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
          series === 'lines'
            ? 'bg-[#f6f8fa] text-[#1e252c]'
            : 'text-[#54606d] hover:text-[#1e252c]'
        }`}
      >
        Linijski portreti (10)
      </button>
      <button
        type="button"
        onClick={() => handleSelectSeries('drawings')}
        className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
          series === 'drawings'
            ? 'bg-[#f6f8fa] text-[#1e252c]'
            : 'text-[#54606d] hover:text-[#1e252c]'
        }`}
      >
        Skice u boji (10)
      </button>
      <button
        type="button"
        onClick={() => handleSelectSeries('photos')}
        className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
          series === 'photos'
            ? 'bg-[#f6f8fa] text-[#1e252c]'
            : 'text-[#54606d] hover:text-[#1e252c]'
        }`}
      >
        Analogne fotografije (06)
      </button>
    </div>
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isEditorialWhite
          ? 'bg-[#FFFFFF] text-[#2B211C]'
          : 'bg-[#eceff2] text-[#1e252c]'
      }`}
    >
      {/* 3-Zone Top Navigation Bar */}
      <header
        className={`sticky top-0 z-30 border-b backdrop-blur-sm transition-colors duration-300 ${
          isEditorialWhite
            ? 'border-[#D4D3CD] bg-[#FFFFFF]/95'
            : 'border-[#d5dbe1] bg-[#eceff2]/95'
        }`}
      >
        <div className={`mx-auto flex max-w-[1260px] items-center justify-between gap-6 px-6 transition-all duration-300 sm:px-10 ${scrolled ? 'py-2' : 'py-3.5'}`}>
          <a
            href={isTemplate ? '#o-muslimanima' : '#overview'}
            onClick={() => {
              if (!isTemplate) handleSelectSeries('template');
            }}
            className={`text-base tracking-[-0.02em] whitespace-nowrap shrink-0 ${
              isEditorialWhite ? 'text-[#221D1A]' : 'text-[#1e252c]'
            }`}
          >
            <span className="flex items-center gap-4"><img src="/assets/sumud-znak.svg" alt={t('SUMUD znak')} className={`w-auto transition-all duration-300 ${scrolled ? 'h-[32px]' : 'h-[44px]'}`} /><span className={`font-stone tracking-[0.3em] text-[#2B211C] transition-all duration-300 ${scrolled ? 'text-[16px]' : 'text-[18px]'}`}>SUMUD</span></span>
          </a>

          <nav
            aria-label="Primary"
            className={`hidden lg:flex items-center gap-10 text-[14px] ${
              isEditorialWhite ? 'text-[#4F4A46]' : 'text-[#54606d]'
            }`}
          >
            {isTemplate ? (
              <>
                <a
                  href="#o-muslimanima"
                  className="hover:text-[#221D1A] transition-colors whitespace-nowrap shrink-0"
                >
                  {t('O nama')}
                </a>
                <a
                  href="#halal-beograd"
                  className="hover:text-[#221D1A] transition-colors whitespace-nowrap shrink-0"
                >
                  {t('Halal Beograd')}
                </a>
                <a
                  href="#dzemati"
                  className="hover:text-[#221D1A] transition-colors whitespace-nowrap shrink-0"
                >
                  {t('Džemati')}
                </a>
                <a
                  href="#kulturni-dogadjaji"
                  className="hover:text-[#221D1A] transition-colors whitespace-nowrap shrink-0"
                >
                  {t('Kulturni događaji')}
                </a>
                <a
                  href="#umrezavanja"
                  className="hover:text-[#221D1A] transition-colors whitespace-nowrap shrink-0"
                >
                  {t('Umrežavanje')}
                </a>
                <a
                  href="#potrazi-pomoc"
                  className="hover:text-[#221D1A] transition-colors whitespace-nowrap shrink-0"
                >
                  {t('Javi nam se')}
                </a>
              </>
            ) : (
              <>
                <a
                  href="#overview"
                  className="hover:text-[#221D1A] transition-colors whitespace-nowrap shrink-0"
                >
                  Overview
                </a>
                <a
                  href="#plates"
                  className="hover:text-[#221D1A] transition-colors whitespace-nowrap shrink-0"
                >
                  {isLandscape ? 'Hero Illustration' : 'Plates'}
                </a>
                <a
                  href={isLandscape ? '#landmarks' : '#contact-strip'}
                  className="hover:text-[#221D1A] transition-colors whitespace-nowrap shrink-0"
                >
                  {isLandscape ? 'Landmarks' : 'Contact Strip'}
                </a>
                <a
                  href="#reference"
                  className="hover:text-[#221D1A] transition-colors whitespace-nowrap shrink-0"
                >
                  Palette &amp; Style
                </a>
              </>
            )}
          </nav>

          {isTemplate && (
            <div role="group" aria-label="Language" className="flex shrink-0 items-center gap-2.5 text-[12px] tracking-[0.08em]">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  lang={l.code}
                  title={l.name}
                  aria-pressed={lang === l.code}
                  onClick={() => setLang(l.code)}
                  className={`transition-colors ${lang === l.code ? 'text-[#2B211C] underline underline-offset-4' : 'text-[#8F8D88] hover:text-[#2B211C]'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}

          {isTemplate ? (
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="border border-[#D4D3CD] px-3 py-1.5 text-xs font-medium text-[#221D1A] lg:hidden"
            >
              {t(mobileMenuOpen ? 'Zatvori' : 'Meni')}
            </button>
          ) : (
            <div className="flex items-center gap-3 shrink-0">
              <IslamicButton
                variant={isLandscape ? 'portal' : 'muqarnas'}
                tone={isLandscape ? 'emerald' : 'concrete'}
                size="sm"
                onClick={handlePrimaryAction}
                disabled={(!isEditorialWhite && isZipping) || gifPercent !== null}
                iconLeft={<Download className="h-3.5 w-3.5" strokeWidth={1.75} />}
              >
                {isLandscape
                  ? gifPercent !== null
                    ? `Encoding (${gifPercent}%)`
                    : 'Export 16:9 GIF'
                  : isZipping
                    ? 'Preparing ZIP'
                    : 'Download Set'}
              </IslamicButton>
            </div>
          )}
        </div>

        {/* Mobile Menu Drawer */}
        {isTemplate && mobileMenuOpen && (
          <div className="border-t border-[#2B211C] bg-[#FFFFFF] px-6 pt-2 pb-6 lg:hidden">
            <nav className="flex flex-col text-[#2B211C]">
              <a
                href="#o-muslimanima"
                onClick={() => setMobileMenuOpen(false)}
                className="font-stone border-b border-[#D4D3CD] py-3.5 text-[24px] leading-tight hover:text-[#0F7A53]"
              >
                {t('O nama')}
              </a>
              <a
                href="#halal-beograd"
                onClick={() => setMobileMenuOpen(false)}
                className="font-stone border-b border-[#D4D3CD] py-3.5 text-[24px] leading-tight hover:text-[#0F7A53]"
              >
                {t('Halal Beograd')}
              </a>
              <a
                href="#dzemati"
                onClick={() => setMobileMenuOpen(false)}
                className="font-stone border-b border-[#D4D3CD] py-3.5 text-[24px] leading-tight hover:text-[#0F7A53]"
              >
                {t('Džemati')}
              </a>
              <a
                href="#kulturni-dogadjaji"
                onClick={() => setMobileMenuOpen(false)}
                className="font-stone border-b border-[#D4D3CD] py-3.5 text-[24px] leading-tight hover:text-[#0F7A53]"
              >
                {t('Kulturni događaji')}
              </a>
              <a
                href="#umrezavanja"
                onClick={() => setMobileMenuOpen(false)}
                className="font-stone border-b border-[#D4D3CD] py-3.5 text-[24px] leading-tight hover:text-[#0F7A53]"
              >
                {t('Umrežavanje')}
              </a>
              <a
                href="#potrazi-pomoc"
                onClick={() => setMobileMenuOpen(false)}
                className="font-quiet py-3.5 text-[24px] leading-tight text-[#9E2B45]"
              >
                {t('Javi nam se')}
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Studio Archive Bar: shown cleanly only when inspecting GIF/Portrait studio modes */}
      {!isTemplate && (
        <div
          className={`border-b ${
            isEditorialWhite
              ? 'border-[#EDEDEA] bg-[#FFFFFF]'
              : 'border-[#d5dbe1] bg-[#eceff2]'
          }`}
        >
          <div className="mx-auto flex max-w-[1260px] items-center justify-between gap-4 px-6 py-2.5 sm:px-10">
            {renderSeriesTabs()}
          </div>
        </div>
      )}

      {isTemplate ? (
        <WebsiteTemplateView
          onNavigateSeries={(next) => handleSelectSeries(next)}
          onExportGif={handleDirectGifExport}
          isExportingGif={gifPercent !== null}
          gifPercent={gifPercent}
        />
      ) : (
      <main className="mx-auto max-w-[1200px] px-6 pb-20">
        {/* Overview */}
        <section
          id="overview"
          className={`border-b pt-12 pb-10 ${
            isLandscape ? 'border-[#EDEDEA]' : 'border-[#d5dbe1]'
          }`}
        >
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <div
                className={`font-mono-tabular mb-3 flex flex-wrap items-center gap-2 text-xs ${
                  isLandscape ? 'text-[#8F8D88]' : 'text-[#5d6a78]'
                }`}
              >
                <span>Belgrade Series</span>
                <span aria-hidden="true">·</span>
                <span>
                  {series === 'landscape'
                    ? '16:9 Animated GIF · 100 Frames'
                    : series === 'lines'
                      ? '10 Loose Line Plates (1:1)'
                      : series === 'drawings'
                        ? '10 Hand-Drawn Plates (1:1)'
                        : '06 Analog Photo Plates (1:1)'}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {series === 'landscape'
                    ? 'Belgrade Skyline · Cyclist Loop'
                    : series === 'lines'
                      ? 'Rotoscope Hero Loop'
                      : series === 'drawings'
                        ? 'Chalk Pastel & Graphite on Plaster'
                        : 'Rough Plaster Ground'}
                </span>
              </div>
              <h1
                className={`font-display text-4xl font-normal tracking-tight sm:text-5xl [text-wrap:balance] ${
                  isLandscape ? 'text-[#2B211C]' : 'text-[#1e252c]'
                }`}
              >
                {series === 'landscape'
                  ? 'Belgrade Skyline on Solid White'
                  : series === 'lines'
                    ? 'Loose Line Portraits for Hero Loop'
                    : series === 'drawings'
                      ? 'Urban Belgrade Portrait Drawings'
                      : 'Muslims of Belgrade'}
              </h1>
              <p
                className={`mt-4 max-w-2xl text-[15px] leading-relaxed ${
                  isLandscape ? 'text-[#4F453E]' : 'text-[#48535f]'
                }`}
              >
                {series === 'landscape'
                  ? 'The static Belgrade skyline on solid white (#FFFFFF) with continuous coffee-brown outlines and soft gouache fills, now animated with one small cyclist wearing a white kufi cap, short beard, and plain saffron (#D9A02B) delivery box riding calmly across the baseline.'
                  : series === 'lines'
                    ? 'Ten monochrome, loose charcoal line drawings aligned on the exact same chest-up axis on light concrete grey paper—built to layer and draw one Belgrade identity over another in a website hero loop.'
                    : series === 'drawings'
                      ? 'Ten raw, hand-drawn chalk pastel and graphite portraits on light concrete grey plaster. Muted faded emerald green, saffron yellow, and pomegranate red capture diverse everyday Belgrade residents in quiet, unposed moments.'
                      : 'Six chest-up square portraits photographed under flat, diffused grey light against rough-troweled blue and off-white plaster walls. Consistent head placement, lifted blacks, desaturated cool tones, and fine analog grain hold the series in quiet stillness.'}
              </p>
            </div>

            <div className="lg:col-span-4 lg:text-end">
              <div
                className={`font-mono-tabular text-xs leading-6 ${
                  isLandscape ? 'text-[#8F8D88]' : 'text-[#5d6a78]'
                }`}
              >
                <div>
                  {series === 'landscape'
                    ? 'Background: Plain Flat #FFFFFF'
                    : 'Aspect Ratio: 1:1 Square'}
                </div>
                <div>
                  {series === 'landscape'
                    ? 'Loop: 7.0s Per Pass · 70ms / Frame'
                    : 'Framing: Chest-Up · Centered Axis'}
                </div>
                <div>
                  {series === 'landscape'
                    ? 'Export: Animated 16:9 GIF & Still PNG'
                    : series === 'lines'
                      ? 'Medium: Monochrome Charcoal Contours'
                      : series === 'drawings'
                        ? 'Palette: Emerald · Saffron · Pomegranate'
                        : 'Tone: Lifted Matte · Cool Cast'}
                </div>
              </div>
            </div>
          </div>

          {downloadError && (
            <p role="alert" className="mt-4 text-xs text-[#9E2B45]">
              {downloadError}
            </p>
          )}
        </section>

        {/* Controls & Hero Preview / Plates Grid */}
        <section id="plates" className="pt-10 pb-14">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              {series === 'photos' && (
                <div
                  role="group"
                  aria-label="Filter portraits by wall plaster tone"
                  className="inline-flex items-center gap-1 bg-[#e1e6eb] p-1"
                >
                  <button
                    type="button"
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      filter === 'all'
                        ? 'bg-[#f6f8fa] text-[#1e252c]'
                        : 'text-[#54606d] hover:text-[#1e252c]'
                    }`}
                  >
                    All (06)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter('blue')}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      filter === 'blue'
                        ? 'bg-[#f6f8fa] text-[#1e252c]'
                        : 'text-[#54606d] hover:text-[#1e252c]'
                    }`}
                  >
                    Blue Plaster (03)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter('off-white')}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      filter === 'off-white'
                        ? 'bg-[#f6f8fa] text-[#1e252c]'
                        : 'text-[#54606d] hover:text-[#1e252c]'
                    }`}
                  >
                    Off-White Plaster (03)
                  </button>
                </div>
              )}
            </div>

            {series !== 'landscape' && (
              <button
                type="button"
                onClick={() => setShowGuides((prev) => !prev)}
                aria-pressed={showGuides}
                className={`inline-flex items-center gap-2 border px-3.5 py-2 text-xs font-medium transition-colors self-start md:self-auto whitespace-nowrap shrink-0 ${
                  showGuides
                    ? 'border-[#4d647a] bg-[#4d647a] text-[#f4f6f8]'
                    : 'border-[#ccd3da] bg-transparent text-[#3d4854] hover:border-[#8ea1b2]'
                }`}
              >
                <Crosshair className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>
                  {showGuides ? 'Hide Alignment Guides' : 'Show Alignment Guides'}
                </span>
              </button>
            )}
          </div>

          {series === 'landscape' ? (
            <BelgradeLandscapeHero ref={heroRef} />
          ) : (
            <>
              {series === 'lines' && (
                <div className="mb-12">
                  <HeroRotoscope
                    plates={LINE_PLATES}
                    resolvedSources={extractedLines}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPlates.map((plate) => {
                  const resolved = resolveSrc(plate);
                  return (
                    <article key={plate.id} className="flex flex-col">
                      <div className="border border-[#d5dbe1] bg-[#e5e9ed] p-2">
                        <PortraitFrame
                          plate={plate}
                          resolvedSrc={resolved}
                          showGuides={showGuides}
                          failed={Boolean(failedImages[plate.id])}
                          onError={handleImageError}
                          onOpen={() => handleOpenPlate(plate.id)}
                        />
                      </div>

                      <div className="mt-3.5 flex items-baseline justify-between gap-4">
                        <div className="font-mono-tabular flex items-center gap-2 text-xs text-[#5d6a78]">
                          <span>Plate {plate.plateNumber}</span>
                          <span aria-hidden="true">·</span>
                          <span>{plate.wallLabel}</span>
                        </div>

                        <a
                          href={resolved}
                          download={plate.downloadName}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4d647a] hover:text-[#2a3846] transition-colors whitespace-nowrap shrink-0"
                        >
                          <Download className="h-3 w-3" strokeWidth={1.75} />
                          <span>Save JPG</span>
                        </a>
                      </div>

                      <h2 className="font-display mt-1.5 text-2xl font-medium tracking-tight text-[#1e252c]">
                        {plate.title}
                      </h2>
                      <p className="mt-1 text-sm leading-relaxed text-[#54606d]">
                        {plate.details}
                      </p>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* Landmarks Index (Landscape Mode) or Horizontal Contact Strip */}
        {series === 'landscape' ? (
          <section
            id="landmarks"
            className="border-t border-[#EDEDEA] pt-12 pb-14"
          >
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
              <div>
                <h2 className="font-display text-3xl font-normal tracking-tight text-[#2B211C]">
                  Belgrade Skyline Composition
                </h2>
                <p className="mt-1 text-sm text-[#8F8D88]">
                  Calm start-to-right elevation on one clean baseline, with faded colour held at the Muslim centre.
                </p>
              </div>
              <span className="font-mono-tabular text-xs text-[#8F8D88]">
                Left-to-Right Hierarchy · Hand-Painted Gouache
              </span>
            </div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  num: '01',
                  role: 'Centre Focus · In Colour',
                  name: 'Modest Bajrakli Mosque',
                  place: 'Square Hall · Small Dome & Minaret',
                  note: 'Authentic modest square stone prayer hall, low emerald dome, slender minaret with saffron balcony, and pomegranate doorway.',
                },
                {
                  num: '02',
                  role: 'Centre Focus · In Colour',
                  name: 'Šadrvan, Cypresses & Iznik Tulips',
                  place: 'Courtyard Beside Mosque',
                  note: 'Small octagonal courtyard fountain with emerald canopy, subtle crescent finials, slender cypresses, and tiny tulips.',
                },
                {
                  num: '03',
                  role: 'Belgrade Bridges',
                  name: 'Ada Bridge & Branko’s Bridge',
                  place: 'Sava Crossing',
                  note: 'Single tall cable-stayed Ada pylon with a fan of hand-drawn stays, plus a low girder bridge stretching behind buildings.',
                },
                {
                  num: '04',
                  role: 'Left Horizon · Muted',
                  name: 'Genex Tower & Tram',
                  place: 'New Belgrade to Dorćol',
                  note: 'Twin brutalist shafts and skybridge beside a quiet Belgrade tram and overhead wire in soft concrete tones.',
                },
                {
                  num: '05',
                  role: 'Multicultural Skyline · Muted',
                  name: 'Churches, Facades & Kalemegdan',
                  place: 'Shared Historic City',
                  note: 'Gothic church spire, old Dorćol facade, Kalemegdan fortress wall with Sahat-kula, St. Mark’s domes, and modern blocks.',
                },
                {
                  num: '06',
                  role: 'Water & Subtle Ornament',
                  name: 'Sava & Danube Reflection',
                  place: 'Lower Baseline',
                  note: 'Thin broken river lines below the skyline with a whisper-faint geometric star pattern woven into the plaster.',
                },
              ].map((item) => (
                <article
                  key={item.num}
                  className="border-t border-[#EDEDEA] pt-4"
                >
                  <div className="font-mono-tabular flex items-center gap-2 text-[11px] text-[#8F8D88]">
                    <span>{item.num}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.role}</span>
                  </div>
                  <h3 className="font-display mt-1.5 text-2xl font-medium tracking-tight text-[#2B211C]">
                    {item.name}
                  </h3>
                  <div className="mt-0.5 text-xs text-[#8F8D88]">{item.place}</div>
                  <p className="mt-2 text-sm leading-relaxed text-[#4F453E]">
                    {item.note}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section
            id="contact-strip"
            className="border-t border-[#d5dbe1] pt-12 pb-14"
          >
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
              <div>
                <h2 className="font-display text-3xl font-normal tracking-tight text-[#1e252c]">
                  Horizontal Contact Strip
                </h2>
                <p className="mt-1 text-sm text-[#54606d]">
                  Side-by-side scale check verifying uniform chest-up crop and head height across all{' '}
                  {currentPlates.length} portraits.
                </p>
              </div>
              <span className="font-mono-tabular text-xs text-[#5d6a78]">
                01 — {String(currentPlates.length).padStart(2, '0')} Sequence
              </span>
            </div>

            <div
              className={`grid grid-cols-2 gap-3 sm:grid-cols-5 ${
                currentPlates.length === 10 ? 'lg:grid-cols-5' : 'lg:grid-cols-6'
              }`}
            >
              {currentPlates.map((plate) => (
                <div key={plate.id} className="space-y-1.5">
                  <div className="border border-[#d5dbe1] bg-[#e5e9ed] p-1">
                    <PortraitFrame
                      plate={plate}
                      resolvedSrc={resolveSrc(plate)}
                      showGuides={showGuides}
                      failed={Boolean(failedImages[plate.id])}
                      onError={handleImageError}
                      onOpen={() => handleOpenPlate(plate.id)}
                      compact
                    />
                  </div>
                  <div className="font-mono-tabular flex items-center justify-between text-[11px] text-[#5d6a78]">
                    <span>{plate.plateNumber}</span>
                    <span>
                      {plate.wallTone === 'concrete-grey'
                        ? 'Concrete'
                        : plate.wallTone === 'blue'
                          ? 'Blue'
                          : 'Off-White'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reference Tone & Mood */}
        <section
          id="reference"
          className={`border-t pt-12 ${
            isLandscape ? 'border-[#EDEDEA]' : 'border-[#d5dbe1]'
          }`}
        >
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-stretch">
            <div className="lg:col-span-5">
              <div
                className={`h-full border p-2 ${
                  isLandscape
                    ? 'border-[#EDEDEA] bg-[#FFFFFF]'
                    : 'border-[#d5dbe1] bg-[#e5e9ed]'
                }`}
              >
                {failedImages['plaster-ref'] ? (
                  <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-2 bg-[#EDEDEA] p-6 text-center text-[#2B211C]">
                    <ImageIcon className="h-6 w-6 opacity-60" strokeWidth={1.5} />
                    <span className="text-xs font-medium">
                      Plaster Texture Reference
                    </span>
                  </div>
                ) : (
                  <img
                    src={REFERENCE_IMAGE}
                    alt="Reference still showing rough troweled matte plaster tiles photographed under soft grey daylight"
                    referrerPolicy="no-referrer"
                    onError={() => handleImageError('plaster-ref')}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col justify-between lg:col-span-7">
              <div>
                <div
                  className={`font-mono-tabular text-xs ${
                    isLandscape ? 'text-[#8F8D88]' : 'text-[#5d6a78]'
                  }`}
                >
                  Artistic Texture &amp; Tone Benchmark
                </div>
                <h2
                  className={`font-display mt-2 text-3xl font-normal tracking-tight ${
                    isLandscape ? 'text-[#2B211C]' : 'text-[#1e252c]'
                  }`}
                >
                  {series === 'landscape'
                    ? 'Confident Coffee-Brown Outlines · Solid White'
                    : series === 'lines'
                      ? 'Charcoal Contours on Concrete Ground'
                      : series === 'drawings'
                        ? 'Muted Chalk Palette on Concrete Grey'
                        : 'Analog Grade & Plaster Palette'}
                </h2>
                <p
                  className={`mt-3 max-w-xl text-[15px] leading-relaxed ${
                    isLandscape ? 'text-[#4F453E]' : 'text-[#48535f]'
                  }`}
                >
                  {series === 'landscape'
                    ? 'Keeps the soft hand-painted colour washes inside each building and muted concrete palette from the study, now cleanly isolated on a plain flat #FFFFFF background with stronger, continuous coffee-brown (#2B211C) hand-drawn outlines.'
                    : series === 'lines'
                      ? 'Stripping away color fills leaves raw graphite and charcoal contour lines on a uniform concrete grey surface so identities can overlap smoothly via CSS multiply blending.'
                      : series === 'drawings'
                        ? 'Drawing studies retain the faded matte surface, chalky plaster tooth, soft diffused grey light, and fine grain from the reference frame while translating the palette into muted emerald green, saffron yellow, and pomegranate red on light concrete grey.'
                        : 'Each portrait adopts the desaturated cool cast, lifted milky shadows, soft overhead light, and hand-troweled matte plaster surface from the reference frame, removing all board, card, and hand elements.'}
                </p>
              </div>

              {series === 'landscape' ? (
                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[#EDEDEA] pt-6 sm:grid-cols-3 lg:grid-cols-6">
                  <div>
                    <div className="h-10 w-full border border-[#D5D3CE] bg-[#EDEDEA]" />
                    <div className="mt-2 text-xs font-medium text-[#2B211C]">
                      Light Concrete
                    </div>
                    <div className="font-mono-tabular text-[11px] text-[#8F8D88]">
                      #EDEDEA
                    </div>
                  </div>
                  <div>
                    <div className="h-10 w-full border border-[#D5D3CE] bg-[#8F8D88]" />
                    <div className="mt-2 text-xs font-medium text-[#2B211C]">
                      Concrete Grey
                    </div>
                    <div className="font-mono-tabular text-[11px] text-[#8F8D88]">
                      #8F8D88
                    </div>
                  </div>
                  <div>
                    <div className="h-10 w-full border border-[#D5D3CE] bg-[#0F8A5F]" />
                    <div className="mt-2 text-xs font-medium text-[#2B211C]">
                      Emerald Green
                    </div>
                    <div className="font-mono-tabular text-[11px] text-[#8F8D88]">
                      #0F8A5F
                    </div>
                  </div>
                  <div>
                    <div className="h-10 w-full border border-[#D5D3CE] bg-[#D9A02B]" />
                    <div className="mt-2 text-xs font-medium text-[#2B211C]">
                      Saffron
                    </div>
                    <div className="font-mono-tabular text-[11px] text-[#8F8D88]">
                      #D9A02B
                    </div>
                  </div>
                  <div>
                    <div className="h-10 w-full border border-[#D5D3CE] bg-[#9E2B45]" />
                    <div className="mt-2 text-xs font-medium text-[#2B211C]">
                      Pomegranate
                    </div>
                    <div className="font-mono-tabular text-[11px] text-[#8F8D88]">
                      #9E2B45
                    </div>
                  </div>
                  <div>
                    <div className="h-10 w-full border border-[#D5D3CE] bg-[#2B211C]" />
                    <div className="mt-2 text-xs font-medium text-[#2B211C]">
                      Coffee Brown
                    </div>
                    <div className="font-mono-tabular text-[11px] text-[#8F8D88]">
                      #2B211C
                    </div>
                  </div>
                </div>
              ) : series === 'lines' ? (
                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[#d5dbe1] pt-6 sm:grid-cols-2">
                  <div>
                    <div className="h-10 w-full border border-[#c6cdd4] bg-[#26282a]" />
                    <div className="mt-2 text-xs font-medium text-[#1e252c]">
                      Charcoal Contour Line
                    </div>
                    <div className="font-mono-tabular text-[11px] text-[#5d6a78]">
                      #26282A · Multiply Blend Layer
                    </div>
                  </div>
                  <div>
                    <div className="h-10 w-full border border-[#c6cdd4] bg-[#d3d5d3]" />
                    <div className="mt-2 text-xs font-medium text-[#1e252c]">
                      Concrete Plaster Paper
                    </div>
                    <div className="font-mono-tabular text-[11px] text-[#5d6a78]">
                      #D3D5D3 · Uniform Loop Ground
                    </div>
                  </div>
                </div>
              ) : series === 'drawings' ? (
                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[#d5dbe1] pt-6 sm:grid-cols-4">
                  <div>
                    <div className="h-10 w-full border border-[#c6cdd4] bg-[#4f846b]" />
                    <div className="mt-2 text-xs font-medium text-[#1e252c]">
                      Faded Emerald
                    </div>
                    <div className="font-mono-tabular text-[11px] text-[#5d6a78]">
                      #4F846B
                    </div>
                  </div>
                  <div>
                    <div className="h-10 w-full border border-[#c6cdd4] bg-[#d6af5c]" />
                    <div className="mt-2 text-xs font-medium text-[#1e252c]">
                      Muted Saffron
                    </div>
                    <div className="font-mono-tabular text-[11px] text-[#5d6a78]">
                      #D6AF5C
                    </div>
                  </div>
                  <div>
                    <div className="h-10 w-full border border-[#c6cdd4] bg-[#9b4b50]" />
                    <div className="mt-2 text-xs font-medium text-[#1e252c]">
                      Pomegranate Red
                    </div>
                    <div className="font-mono-tabular text-[11px] text-[#5d6a78]">
                      #9B4B50
                    </div>
                  </div>
                  <div>
                    <div className="h-10 w-full border border-[#c6cdd4] bg-[#cfd2d4]" />
                    <div className="mt-2 text-xs font-medium text-[#1e252c]">
                      Concrete Grey
                    </div>
                    <div className="font-mono-tabular text-[11px] text-[#5d6a78]">
                      #CFD2D4
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-8 grid grid-cols-1 gap-4 border-t border-[#d5dbe1] pt-6 sm:grid-cols-3">
                  <div>
                    <div className="h-10 w-full border border-[#c6cdd4] bg-[#768c9f]" />
                    <div className="mt-2 text-xs font-medium text-[#1e252c]">
                      Muted Blue Plaster
                    </div>
                    <div className="font-mono-tabular text-[11px] text-[#5d6a78]">
                      #768C9F · Plates 01, 04, 06
                    </div>
                  </div>
                  <div>
                    <div className="h-10 w-full border border-[#c6cdd4] bg-[#d4d9dc]" />
                    <div className="mt-2 text-xs font-medium text-[#1e252c]">
                      Chalky Off-White
                    </div>
                    <div className="font-mono-tabular text-[11px] text-[#5d6a78]">
                      #D4D9DC · Plates 02, 03, 05
                    </div>
                  </div>
                  <div>
                    <div className="h-10 w-full border border-[#c6cdd4] bg-[#363c42]" />
                    <div className="mt-2 text-xs font-medium text-[#1e252c]">
                      Lifted Analog Black
                    </div>
                    <div className="font-mono-tabular text-[11px] text-[#5d6a78]">
                      #363C42 · Low Contrast Floor
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      )}

      {/* Lightbox Modal */}
      {activePlate && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Plate ${activePlate.plateNumber}: ${activePlate.title}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#181e24]/88 p-4 sm:p-8"
          onClick={() => setActiveIndex(null)}
        >
          <div
            className="relative flex w-full max-w-3xl flex-col bg-[#eceff2] p-4 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="font-mono-tabular flex items-center gap-2 text-xs text-[#54606d]">
                <span>
                  Plate {activePlate.plateNumber} /{' '}
                  {String(currentPlates.length).padStart(2, '0')}
                </span>
                <span aria-hidden="true">·</span>
                <span>{activePlate.wallLabel}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowGuides((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    showGuides
                      ? 'border-[#4d647a] bg-[#4d647a] text-[#f4f6f8]'
                      : 'border-[#ccd3da] text-[#3d4854] hover:border-[#8ea1b2]'
                  }`}
                >
                  <Crosshair className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span>Guides</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveIndex(null)}
                  aria-label="Close lightbox"
                  className="inline-flex h-8 w-8 items-center justify-center border border-[#ccd3da] text-[#1e252c] hover:bg-[#e1e6eb] transition-colors"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[560px] aspect-square border border-[#d5dbe1] bg-[#cfd6dc]">
              <img
                src={resolveSrc(activePlate)}
                alt={`Chest-up square portrait of ${activePlate.title.toLowerCase()}`}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              {showGuides && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                >
                  <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/60" />
                  <div className="absolute inset-x-0 top-[44%] h-px bg-white/60" />
                  <div className="absolute inset-x-0 top-[23%] h-px border-t border-dashed border-white/45" />
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="font-display text-2xl font-medium text-[#1e252c]">
                  {activePlate.title}
                </h3>
                <p className="mt-1 text-sm text-[#54606d]">
                  {activePlate.details}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleStep(-1)}
                  aria-label="Previous plate"
                  className="inline-flex h-9 w-9 items-center justify-center border border-[#ccd3da] text-[#1e252c] hover:bg-[#e1e6eb] transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  onClick={() => handleStep(1)}
                  aria-label="Next plate"
                  className="inline-flex h-9 w-9 items-center justify-center border border-[#ccd3da] text-[#1e252c] hover:bg-[#e1e6eb] transition-colors"
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
                </button>
                <a
                  href={resolveSrc(activePlate)}
                  download={activePlate.downloadName}
                  className="inline-flex h-9 items-center gap-2 bg-[#4d647a] px-4 text-xs font-medium text-[#f4f6f8] hover:bg-[#3f5468] transition-colors whitespace-nowrap shrink-0"
                >
                  <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span>Download Plate</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
