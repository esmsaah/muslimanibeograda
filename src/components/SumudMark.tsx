import React from 'react';

const fig = (R: number, r: number, gap: number) => (
  <>
    <path d={`M0,0 V${-R} A${R},${R} 0 0 1 ${R},0 Z`} />
    <circle cx={R + gap + r} cy={-r} r={r} />
  </>
);

export default function SumudMark({
  color = '#2B211C',
  accent = '#D9A02B',
  className = '',
}: {
  color?: string;
  accent?: string;
  className?: string;
}) {
  const n = 10;
  const Rc = 58;
  const y = Rc - 6;
  const w = 15;
  const h = 32;
  const b = y + w * 0.5 + h;
  return (
    <svg viewBox="-90 -90 180 196" className={className} aria-hidden="true">
      {Array.from({length: n}).map((_, i) =>
        i === n / 2 ? null : (
          <g key={i} transform={`rotate(${(360 * i) / n - 8}) translate(0,${-Rc})`} fill={color}>
            {fig(22, 6.5, 1.5)}
          </g>
        ),
      )}
      <g fill={accent}>
        <circle cx={0} cy={y} r={w * 0.5} />
        <rect x={-w / 2} y={y + w * 0.5 + 2.5} width={w} height={h} rx={w / 2} />
      </g>
      <g stroke={color} strokeWidth={2.4} strokeLinecap="round">
        <line x1={0} y1={b + 5} x2={0} y2={b + 22} />
        <line x1={-6} y1={b + 9} x2={-9} y2={b + 24} />
        <line x1={6} y1={b + 9} x2={9} y2={b + 24} />
      </g>
    </svg>
  );
}
