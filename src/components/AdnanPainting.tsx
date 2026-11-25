import React from 'react';

// Mala slika u duhu Etel Adnan: ravna polja boje, sunce kao pun krug, brdo, rijeka i tlo.
export default function AdnanPainting({className = ''}: {className?: string}) {
  return (
    <figure className={`m-0 inline-block border border-[#D4D3CD] bg-[#FFFFFF] p-2 ${className}`} aria-hidden="true">
      <svg viewBox="0 0 100 100" className="block h-full w-full">
        <rect width="100" height="100" fill="#F3E6C9" />
        <circle cx="71" cy="27" r="11" fill="#D9A02B" />
        <path d="M0 68 L18 46 Q26 37 35 45 L52 58 Q60 52 68 56 L100 50 V72 H0 Z" fill="#9E2B45" />
        <rect y="70" width="100" height="16" fill="#0F7A53" />
        <rect y="86" width="100" height="14" fill="#2B211C" />
      </svg>
    </figure>
  );
}
