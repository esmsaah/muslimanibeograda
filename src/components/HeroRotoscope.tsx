import {useEffect, useState} from 'react';
import {Download, Pause, Play, RotateCcw, SkipForward} from 'lucide-react';
import {PortraitPlate} from '../data/portraits';
import {exportHeroGif} from '../utils/gifExport';

interface HeroRotoscopeProps {
  plates: PortraitPlate[];
  resolvedSources: Record<string, string>;
}

type SpeedPreset = 'slow' | 'medium' | 'snappy';

const SPEED_MS: Record<SpeedPreset, number> = {
  slow: 2200,
  medium: 1350,
  snappy: 780,
};

export function HeroRotoscope({plates, resolvedSources}: HeroRotoscopeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<SpeedPreset>('medium');
  const [ghostTrail, setGhostTrail] = useState(true);
  const [isExportingGif, setIsExportingGif] = useState(false);

  useEffect(() => {
    if (!isPlaying || plates.length < 2) return;
    const interval = window.setInterval(() => {
      setCurrentIndex((prev) => {
        setPreviousIndex(prev);
        return (prev + 1) % plates.length;
      });
    }, SPEED_MS[speed]);
    return () => window.clearInterval(interval);
  }, [isPlaying, speed, plates.length]);

  const handleStepNext = () => {
    setIsPlaying(false);
    setCurrentIndex((prev) => {
      setPreviousIndex(prev);
      return (prev + 1) % plates.length;
    });
  };

  const handleReset = () => {
    setPreviousIndex(null);
    setCurrentIndex(0);
  };

  const handleExportGif = async () => {
    if (isExportingGif) return;
    setIsExportingGif(true);
    try {
      const sources = plates.map((p) => resolvedSources[p.id] || p.imageSrc);
      await exportHeroGif(sources, SPEED_MS[speed], ghostTrail);
    } finally {
      setIsExportingGif(false);
    }
  };

  const activePlate = plates[currentIndex];
  const prevPlate = previousIndex !== null ? plates[previousIndex] : null;

  return (
    <div className="grid grid-cols-1 gap-8 border-b border-[#d5dbe1] pb-12 lg:grid-cols-12 lg:items-center">
      <div className="lg:col-span-6">
        <div className="relative mx-auto aspect-square w-full max-w-[480px] overflow-hidden border border-[#d5dbe1] bg-[#d3d5d3]">
          {/* Previous portrait ghost layer */}
          {ghostTrail && prevPlate && (
            <img
              key={`prev-${prevPlate.id}`}
              src={resolvedSources[prevPlate.id] || prevPlate.imageSrc}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-multiply transition-opacity duration-500"
            />
          )}

          {/* Active portrait drawing layer */}
          {plates.map((plate, index) => {
            const isActive = index === currentIndex;
            return (
              <img
                key={plate.id}
                src={resolvedSources[plate.id] || plate.imageSrc}
                alt={
                  isActive
                    ? `Loose line portrait of ${plate.title.toLowerCase()}`
                    : ''
                }
                aria-hidden={!isActive}
                referrerPolicy="no-referrer"
                className={`absolute inset-0 h-full w-full object-cover mix-blend-multiply transition-all duration-700 ease-out ${
                  isActive
                    ? 'opacity-100 scale-100'
                    : 'pointer-events-none opacity-0 scale-[1.01]'
                }`}
              />
            );
          })}
        </div>
      </div>

      <div className="flex flex-col justify-between lg:col-span-6">
        <div>
          <div className="font-mono-tabular flex items-center gap-2 text-xs text-[#5d6a78]">
            <span>Hero Rotoscope Preview</span>
            <span aria-hidden="true">·</span>
            <span>
              Frame {String(currentIndex + 1).padStart(2, '0')} /{' '}
              {String(plates.length).padStart(2, '0')}
            </span>
          </div>

          <h2 className="font-display mt-2 text-3xl font-normal tracking-tight text-[#1e252c] sm:text-4xl [text-wrap:balance]">
            One Identity Drawn Over the Next
          </h2>

          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-[#48535f]">
            Each monochrome charcoal line portrait aligns on the same chest-up axis and concrete
            grey ground so frames multiply cleanly over one another in a continuous hero loop.
          </p>

          {activePlate && (
            <div className="mt-5 border-t border-[#d5dbe1] pt-4">
              <div className="font-mono-tabular text-xs text-[#5d6a78]">
                Active Layer · Plate {activePlate.plateNumber}
              </div>
              <div className="font-display mt-1 text-2xl font-medium text-[#1e252c]">
                {activePlate.title}
              </div>
            </div>
          )}
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPlaying((prev) => !prev)}
            className="inline-flex items-center gap-2 bg-[#4d647a] px-4 py-2 text-xs font-medium text-[#f4f6f8] transition-colors hover:bg-[#3f5468] whitespace-nowrap shrink-0"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>Pause Loop</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>Play Loop</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleStepNext}
            className="inline-flex items-center gap-1.5 border border-[#ccd3da] px-3 py-2 text-xs font-medium text-[#3d4854] hover:border-[#8ea1b2] transition-colors whitespace-nowrap shrink-0"
          >
            <SkipForward className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Next Frame</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset to first frame"
            className="inline-flex h-8 w-8 items-center justify-center border border-[#ccd3da] text-[#3d4854] hover:border-[#8ea1b2] transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>

          <div
            role="group"
            aria-label="Loop speed"
            className="inline-flex items-center gap-1 bg-[#e1e6eb] p-1"
          >
            {(['slow', 'medium', 'snappy'] as SpeedPreset[]).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setSpeed(preset)}
                className={`px-2.5 py-1 text-xs font-medium capitalize transition-colors whitespace-nowrap shrink-0 ${
                  speed === preset
                    ? 'bg-[#f6f8fa] text-[#1e252c]'
                    : 'text-[#54606d] hover:text-[#1e252c]'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setGhostTrail((prev) => !prev)}
            aria-pressed={ghostTrail}
            className={`border px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              ghostTrail
                ? 'border-[#4d647a] bg-[#4d647a] text-[#f4f6f8]'
                : 'border-[#ccd3da] text-[#3d4854] hover:border-[#8ea1b2]'
            }`}
          >
            Ghost Overlap: {ghostTrail ? 'On' : 'Off'}
          </button>

          <button
            type="button"
            onClick={handleExportGif}
            disabled={isExportingGif}
            className="inline-flex items-center gap-1.5 border border-[#4d647a] px-3.5 py-2 text-xs font-medium text-[#3d4854] transition-colors hover:bg-[#e1e6eb] disabled:opacity-60 whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>{isExportingGif ? 'Encoding GIF' : 'Download GIF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
