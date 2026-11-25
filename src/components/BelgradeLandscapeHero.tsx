import {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {Download, Eye, EyeOff, Pause, Play, RotateCcw} from 'lucide-react';
import {
  drawDeliveryCyclist,
  PAINTING_HEIGHT,
  PAINTING_WIDTH,
  renderBelgradeGouachePainting,
} from '../utils/belgradePainting';
import {exportSkylineCyclistGif} from '../utils/gifExport';
import {TespihLoader} from './IslamicElements';

export interface BelgradeLandscapeHeroHandle {
  downloadGif: () => Promise<void>;
  downloadPng: () => Promise<void>;
}

const PASS_DURATION_MS = 7000;
const GIF_FRAMES = 100;

export const BelgradeLandscapeHero = forwardRef<BelgradeLandscapeHeroHandle>(
  function BelgradeLandscapeHero(_, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const staticCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const progressRef = useRef(0.18);
    const [isPlaying, setIsPlaying] = useState(true);
    const [showHeadlineGuide, setShowHeadlineGuide] = useState(false);
    const [exportState, setExportState] = useState<'gif' | 'png' | null>(null);
    const [gifPercent, setGifPercent] = useState(0);

    // Render static skyline once onto offscreen canvas
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

    // Smooth 7.2s calm cycling loop over unchanged static skyline
    useEffect(() => {
      let rafId = 0;
      let lastTime = performance.now();

      const drawFrame = (now: number) => {
        const dt = now - lastTime;
        lastTime = now;

        if (isPlaying) {
          progressRef.current = (progressRef.current + dt / PASS_DURATION_MS) % 1;
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
      } else {
        const canvas = canvasRef.current;
        const staticCanvas = staticCanvasRef.current;
        if (canvas && staticCanvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(staticCanvas, 0, 0);
            drawDeliveryCyclist(ctx, progressRef.current);
          }
        }
      }

      return () => {
        if (rafId) window.cancelAnimationFrame(rafId);
      };
    }, [isPlaying]);

    const handleRestart = () => {
      progressRef.current = 0;
      const canvas = canvasRef.current;
      const staticCanvas = staticCanvasRef.current;
      if (canvas && staticCanvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(staticCanvas, 0, 0);
          drawDeliveryCyclist(ctx, 0);
        }
      }
      setIsPlaying(true);
    };

    const handleDownloadGif = async () => {
      const staticCanvas = staticCanvasRef.current;
      if (!staticCanvas || exportState) return;
      setExportState('gif');
      setGifPercent(0);
      try {
        await exportSkylineCyclistGif(staticCanvas, drawDeliveryCyclist, {
          frames: GIF_FRAMES,
          durationMs: PASS_DURATION_MS,
          filename: 'belgrade-skyline-cyclist-16x9.gif',
          onProgress: (fraction) => setGifPercent(Math.round(fraction * 100)),
        });
      } finally {
        setExportState(null);
        setGifPercent(0);
      }
    };

    const handleDownloadPng = async () => {
      const staticCanvas = staticCanvasRef.current;
      if (!staticCanvas || exportState) return;
      setExportState('png');
      try {
        const dataUrl = staticCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'belgrade-skyline-solid-white.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } finally {
        setExportState(null);
      }
    };

    useImperativeHandle(ref, () => ({
      downloadGif: handleDownloadGif,
      downloadPng: handleDownloadPng,
    }));

    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsPlaying((prev) => !prev)}
              className="inline-flex items-center gap-1.5 border border-[#D5D3CE] bg-[#FFFFFF] px-3.5 py-2 text-xs font-medium text-[#2B211C] transition-colors hover:border-[#8F8D88] whitespace-nowrap shrink-0"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span>Play</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleRestart}
              aria-label="Restart pass from left edge"
              className="inline-flex items-center gap-1.5 border border-[#D5D3CE] bg-[#FFFFFF] px-3 py-2 text-xs font-medium text-[#2B211C] transition-colors hover:border-[#8F8D88] whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Restart</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHeadlineGuide((prev) => !prev)}
              aria-pressed={showHeadlineGuide}
              className={`inline-flex items-center gap-1.5 border px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                showHeadlineGuide
                  ? 'border-[#0F8A5F] bg-[#0F8A5F] text-[#FFFFFF]'
                  : 'border-[#D5D3CE] bg-[#FFFFFF] text-[#2B211C] hover:border-[#8F8D88]'
              }`}
            >
              {showHeadlineGuide ? (
                <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
              ) : (
                <EyeOff className="h-3.5 w-3.5" strokeWidth={1.75} />
              )}
              <span>
                {showHeadlineGuide ? 'Hide Headline Space' : 'Preview Headline Space'}
              </span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {exportState === 'gif' && (
              <TespihLoader size={36} label={`Spremamo GIF (${gifPercent}%)`} />
            )}
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={exportState !== null}
              className="inline-flex items-center gap-1.5 border border-[#D5D3CE] bg-[#FFFFFF] px-3.5 py-2 text-xs font-medium text-[#2B211C] transition-colors hover:border-[#8F8D88] disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>{exportState === 'png' ? 'Saving PNG' : 'Download Still PNG'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadGif}
              disabled={exportState !== null}
              className="inline-flex items-center gap-1.5 bg-[#0F8A5F] px-4 py-2 text-xs font-medium text-[#FFFFFF] transition-colors hover:bg-[#0B6F4C] disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>
                {exportState === 'gif'
                  ? `Encoding GIF (${gifPercent}%)`
                  : 'Download 16:9 GIF'}
              </span>
            </button>
          </div>
        </div>

        {/* 16:9 Animated Skyline Canvas */}
        <div className="border border-[#EDEDEA] bg-[#FFFFFF] p-2 sm:p-3">
          <div className="relative w-full aspect-video overflow-hidden bg-[#FFFFFF]">
            {showHeadlineGuide && (
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center px-6 pt-6 text-center sm:pt-10">
                <div className="border border-dashed border-[#8F8D88] bg-[#FFFFFF]/90 px-6 py-2.5">
                  <span className="font-mono-tabular block text-[10px] tracking-[0.14em] text-[#8F8D88] uppercase">
                    Empty Sky Zone for Website Headline
                  </span>
                  <span className="font-display mt-0.5 block text-xl font-normal tracking-tight text-[#2B211C] sm:text-3xl">
                    Muslims of Belgrade
                  </span>
                </div>
              </div>
            )}

            <canvas
              ref={canvasRef}
              width={PAINTING_WIDTH}
              height={PAINTING_HEIGHT}
              aria-label="Animated 16:9 illustration of the Belgrade skyline on solid white, with a small cyclist wearing a white kufi cap, short beard, and saffron delivery box riding slowly from left to right in front of the buildings and mosque"
              className="block h-full w-full"
            />
          </div>
        </div>

        {/* Animation & Skyline Notes */}
        <div className="grid grid-cols-1 gap-6 border-t border-[#EDEDEA] pt-6 sm:grid-cols-2">
          <div>
            <div className="font-mono-tabular text-xs text-[#8F8D88]">
              Animated Loop · 100 Frames · 70ms/Frame (7.0s)
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-[#4F453E]">
              A small cyclist wearing a white kufi cap, short beard, and plain saffron (#D9A02B)
              delivery box moves an equal distance per frame left to right with rolling wheels,
              synced pedaling, and a steady subtle bob.
            </p>
          </div>
          <div>
            <div className="font-mono-tabular text-xs text-[#8F8D88]">
              Static Skyline · Seamless Wrap
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-[#4F453E]">
              Only the cyclist’s tight moving bounding box updates after frame 1 so every building,
              bridge, and river line stays pixel-still with zero flicker in the 16:9 GIF (`1280×720`).
            </p>
          </div>
        </div>
      </div>
    );
  },
);
