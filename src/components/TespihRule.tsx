import React from 'react';

// Suptilna linija kao tespih: tanak konac sa sitnim zrnima, a na kraju imame u safranu i resa.
export default function TespihRule({className = ''}: {className?: string}) {
  return (
    <div className={`flex items-center ${className}`} aria-hidden="true">
      <div
        className="h-[6px] flex-1"
        style={{
          background:
            'radial-gradient(circle, #2B211C 0 1.9px, transparent 2.3px) 0 50% / 16px 6px repeat-x, linear-gradient(rgba(43,33,28,0.35), rgba(43,33,28,0.35)) 0 50% / 100% 1px no-repeat',
        }}
      />
      <svg width="34" height="16" viewBox="0 0 34 16" className="shrink-0">
        <circle cx="3.5" cy="5" r="2.6" fill="#D9A02B" />
        <rect x="7.5" y="2.6" width="11" height="4.8" rx="2.4" fill="#D9A02B" />
        <g stroke="#2B211C" strokeWidth="1" strokeLinecap="round" fill="none">
          <path d="M 19 5 Q 21 9, 20.5 15" />
          <path d="M 19 5 Q 23.5 8.5, 25 14" />
          <path d="M 19 5 Q 17.5 9.5, 16 14" />
        </g>
      </svg>
    </div>
  );
}
