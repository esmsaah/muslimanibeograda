import React, {useEffect, useState} from 'react';

/**
 * Traditional Quranic Verse-End Medallion (Završetak ajeta / Khatam al-Ayah).
 */
export function AyahEndMark({
  size = 20,
  color = 'currentColor',
  accentColor = '#0F7A53',
  className = '',
}: {
  size?: number;
  color?: string;
  accentColor?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M18 2.5C19.8 5.2 21.8 5.8 24.8 4.9C24.8 8.1 26.2 9.5 29.3 9.7C28.2 12.6 28.9 14.6 31.6 16.3C29.3 18.4 29.3 20.5 31.4 22.7C28.5 24 27.6 25.9 28.3 29C25.1 28.7 23.6 30 23.2 33.1C20.4 31.7 18.4 32.1 16.5 34.5C14.7 31.8 12.7 31.2 9.7 32.1C9.7 28.9 8.3 27.5 5.2 27.3C6.3 24.4 5.6 22.4 2.9 20.7C5.2 18.6 5.2 16.5 3.1 14.3C6 13 6.9 11.1 6.2 8C9.4 8.3 10.9 7 11.3 3.9C14.1 5.3 16.1 4.9 18 2.5Z"
        stroke={color}
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <circle
        cx="17.2"
        cy="18.5"
        r="6.8"
        stroke={color}
        strokeOpacity="0.6"
        strokeWidth="1.05"
      />
      <circle cx="17.2" cy="18.5" r="2.3" fill={accentColor} />
    </svg>
  );
}

/**
 * Refined architectural Tespih strand for TespihButton:
 * Light stone-toned outlined beads resting on a fine hairline cord,
 * a silent open gap (bošluk) across which the emerald-counted bead glides cleanly,
 * a turned hourglass imame finial, and delicate gravity-draped kićanka tassel threads.
 */
export function TespihBeadStrand({
  step = 0,
  isActive = false,
  className = '',
}: {
  step?: number;
  isActive?: boolean;
  className?: string;
}) {
  // Isti jezik kao znak Sumud: puna zrna boje kafe na koncu,
  // jedno zrno koje se broji klizi kroz prazninu, imame u safranu i resa od tri niti.
  const y = (x: number) => 8 + 0.0009 * (x - 4) * (128 - x);
  const fixedLeft = [6, 13, 20, 27, 34];
  const fixedRight = [104, 111, 118];
  const slideX = 46 + (step % 4) * 15;
  return (
    <svg width="176" height="26" viewBox="0 0 176 26" fill="none" aria-hidden="true" className={className}>
      <path d="M 2 8 Q 66 16.5, 128 8" stroke="#2B211C" strokeOpacity="0.45" strokeWidth="1" strokeLinecap="round" />
      {fixedLeft.map((x) => (
        <circle key={`l${x}`} cx={x} cy={y(x)} r="2.9" fill="#2B211C" />
      ))}
      {fixedRight.map((x) => (
        <circle key={`r${x}`} cx={x} cy={y(x)} r="2.9" fill="#2B211C" />
      ))}
      <circle
        cx={0}
        cy={0}
        r={isActive ? 3.4 : 2.9}
        fill={isActive ? '#0F7A53' : '#2B211C'}
        style={{
          transform: `translate(${slideX}px, ${y(slideX)}px)`,
          transition: 'transform 360ms cubic-bezier(0.22, 1, 0.36, 1), fill 200ms',
        }}
      />
      <circle cx="129.5" cy="8" r="3.1" fill="#D9A02B" />
      <rect x="134" y="5.2" width="14" height="5.6" rx="2.8" fill="#D9A02B" />
      <g stroke="#2B211C" strokeWidth="1.15" strokeLinecap="round" fill="none" className="origin-[148px_8px] transition-transform duration-500 group-hover:rotate-[-10deg]">
        <path d="M 148 8.5 Q 149.5 15, 148.5 23" />
        <path d="M 148 8.5 Q 152 14, 153.5 21.5" />
        <path d="M 148 8.5 Q 145.5 14, 143.5 21.5" />
      </g>
    </svg>
  );
}

/**
 * Unmistakable Tespih Loader (vertical hanging teardrop strand with gliding bead).
 */
export function TespihLoader({
  size = 64,
  active = true,
  label,
  className = '',
}: {
  size?: number;
  active?: boolean;
  label?: string;
  className?: string;
}) {
  const totalSlots = 21;
  const [gapIndex, setGapIndex] = useState(4);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      setGapIndex((prev) => (prev + 1) % totalSlots);
    }, 180);
    return () => window.clearInterval(timer);
  }, [active]);

  const points: Array<{x: number; y: number}> = [];
  const cx = 32;
  const topY = 9;
  const bottomJoinY = 49;
  const rx = 19;
  for (let i = 0; i < totalSlots; i++) {
    const u = 0.04 + (i / (totalSlots - 1)) * 0.92;
    const angle = Math.PI / 2 - u * Math.PI * 2;
    const heightRatio = (1 - Math.sin(angle)) * 0.5;
    const pinch = 0.24 + 0.76 * Math.pow(heightRatio, 0.55);
    const x = cx + Math.cos(angle) * rx * pinch;
    const midY = (topY + bottomJoinY) / 2;
    const ry = (bottomJoinY - topY) / 2;
    const y = midY + Math.sin(angle) * ry;
    points.push({x, y});
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={Math.round(size * 1.25)}
        viewBox="0 0 64 80"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M 32 49 C 47 41, 52 24, 49 16 C 46 8, 38 7, 32 7 C 26 7, 18 8, 15 16 C 12 24, 17 41, 32 49 Z"
          stroke="#221D1A"
          strokeOpacity="0.34"
          strokeWidth="1.05"
        />

        {points.map((pt, idx) => {
          const isGap = idx === gapIndex;
          const isSlidingBead = idx === (gapIndex + 1) % totalSlots;
          const isDurak = idx === 6 || idx === 14;
          if (isGap) {
            return (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r="0.85"
                fill="#A62C3B"
                opacity="0.65"
              />
            );
          }
          if (isDurak) {
            return (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r="2.2"
                fill="#A62C3B"
                stroke="#221D1A"
                strokeWidth="0.85"
              />
            );
          }
          return (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={isSlidingBead ? 3.3 : 2.9}
              fill={isSlidingBead ? '#0F7A53' : '#F4F3EF'}
              stroke="#221D1A"
              strokeWidth="1"
              className="transition-all duration-150"
            />
          );
        })}

        <circle cx="32" cy="49.5" r="2" fill="#FFFFFF" stroke="#221D1A" strokeWidth="0.9" />
        <path
          d="M 30 52 C 29.4 55, 30.6 58, 30.2 61.5 H 33.8 C 33.4 58, 34.6 55, 34 52 Z"
          fill="#221D1A"
        />
        <rect x="30.4" y="62.2" width="3.2" height="1.6" fill="#A62C3B" />

        <path
          d="M 32 64 Q 29.5 71, 28 76.5 M 32 64 Q 31 71, 30.5 77.5 M 32 64 Q 33 71, 33.5 77.5 M 32 64 Q 34.5 71, 36 76.5"
          stroke="#A62C3B"
          strokeWidth="1.05"
          strokeLinecap="round"
        />
      </svg>
      {label && (
        <span className="font-mono-tabular text-xs text-[#4F4A46]">{label}</span>
      )}
    </div>
  );
}
