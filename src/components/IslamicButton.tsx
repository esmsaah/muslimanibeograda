import React, {useEffect, useState} from 'react';
import {AyahEndMark, TespihBeadStrand} from './IslamicElements';

export type IslamicButtonVariant =
  | 'kocka'
  | 'flowline'
  | 'tespih'
  | 'portal'
  | 'muqarnas';

export type IslamicButtonTone = 'charcoal' | 'emerald' | 'concrete' | 'brick' | 'light' | 'outline';
export type IslamicButtonSize = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: IslamicButtonVariant;
  tone?: IslamicButtonTone;
  size?: IslamicButtonSize;
  children?: React.ReactNode;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  className?: string;
}

type ButtonAsButton = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    href: string;
  };

export type IslamicButtonProps = ButtonAsButton | ButtonAsLink;

const SIZE_PAD: Record<IslamicButtonSize, string> = {
  sm: 'h-9 px-3.5 text-xs gap-2',
  md: 'h-11 px-4 text-[13px] gap-2.5',
  lg: 'h-12 px-5 text-sm gap-2.5',
};

export function IslamicButton({
  variant = 'portal',
  tone = 'charcoal',
  size = 'md',
  children,
  iconLeft,
  iconRight,
  className = '',
  onClick,
  ...rest
}: IslamicButtonProps) {
  const [beadStep, setBeadStep] = useState(0);
  const [isHoveringTespih, setIsHoveringTespih] = useState(false);
  const padCls = SIZE_PAD[size];

  // Calmly glide counted bead across the exposed cord gap when hovering ("kao da se tespiha")
  useEffect(() => {
    if (variant !== 'tespih' || !isHoveringTespih) return;
    const timer = window.setInterval(() => {
      setBeadStep((prev) => (prev + 1) % 4);
    }, 360);
    return () => window.clearInterval(timer);
  }, [variant, isHoveringTespih]);

  const handleInteraction = (e: React.MouseEvent<HTMLElement>) => {
    if (variant === 'tespih') {
      setBeadStep((prev) => (prev + 1) % 4);
    }
    if (onClick) {
      (onClick as (ev: React.MouseEvent<HTMLElement>) => void)(e);
    }
  };

  const renderInner = () => {
    // 1. KOCKA: Sharp architectural block with Label directly adjacent to AyahEndMark
    if (variant === 'kocka') {
      const iconDim = size === 'sm' ? 17 : size === 'lg' ? 21 : 19;
      const surfaceCls =
        tone === 'outline'
          ? 'border-[#0F7A53] bg-transparent text-[#0F7A53] group-hover:bg-[#0F7A53] group-hover:text-[#FFFFFF]'
          : tone === 'emerald'
          ? 'border-[#0F7A53] bg-[#0F7A53] text-[#FFFFFF] group-hover:bg-[#221D1A] group-hover:border-[#221D1A]'
          : tone === 'brick'
            ? 'border-[#9E2B45] bg-[#9E2B45] text-[#FFFFFF] group-hover:bg-[#2B211C] group-hover:border-[#2B211C]'
            : tone === 'concrete'
              ? 'border-[#221D1A] bg-[#EAEAE6] text-[#221D1A] group-hover:bg-[#221D1A] group-hover:text-[#FFFFFF]'
              : 'border-[#221D1A] bg-[#FFFFFF] text-[#221D1A] group-hover:bg-[#221D1A] group-hover:text-[#FFFFFF]';

      const markAccent =
        tone === 'emerald'
          ? '#FFFFFF'
          : tone === 'brick'
            ? '#A62C3B'
            : '#0F7A53';

      return (
        <span
          className={`inline-flex items-center border font-medium transition-colors duration-200 whitespace-nowrap shrink-0 ${padCls} ${surfaceCls}`}
        >
          {iconLeft && <span className="shrink-0">{iconLeft}</span>}
          {children && <span>{children}</span>}
        </span>
      );
    }

    // 2. FLOWLINE: Clean modernist label underlined by an undulating continuous wave
    if (variant === 'flowline' || variant === 'tespih') {
      const waveStroke =
        tone === 'light'
          ? '#D9A02B'
          : tone === 'brick'
            ? '#9E2B45'
            : tone === 'charcoal'
              ? '#221D1A'
              : '#0F7A53';
      const flowText =
        tone === 'light'
          ? 'text-[#EDEDEA] group-hover:text-[#D9A02B]'
          : 'text-[#221D1A] group-hover:text-[#0F7A53]';
      return (
        <span className="relative inline-flex flex-col items-start pb-2.5 pt-1 whitespace-nowrap shrink-0">
          <span className={`font-human inline-flex items-center gap-2 text-[17px] font-medium tracking-[-0.015em] transition-colors duration-200 ${flowText}`}>
            {iconLeft && <span className="shrink-0">{iconLeft}</span>}
            <span>{children}</span>
            {iconRight && <span className="shrink-0">{iconRight}</span>}
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-0 bottom-0 left-0 h-2.5 overflow-hidden"
          >
            <svg
              viewBox="0 0 240 12"
              preserveAspectRatio="none"
              className="animate-flow-wave h-full w-[200%]"
            >
              <path
                d="M0 6 Q 15 1, 30 6 T 60 6 T 90 6 T 120 6 T 150 6 T 180 6 T 210 6 T 240 6"
                fill="none"
                stroke={waveStroke}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </span>
      );
    }

    // 4. PORTAL: Monolithic slab with carved pointed-arch light slit
    if (variant === 'portal') {
      const bgCls =
        tone === 'emerald'
          ? 'bg-[#0F7A53] text-[#FFFFFF]'
          : 'bg-[#221D1A] text-[#FFFFFF]';
      const hoverBg =
        tone === 'brick'
          ? '#A62C3B'
          : tone === 'emerald'
            ? '#0A5E3F'
            : '#0F7A53';

      return (
        <span
          className={`relative inline-flex items-center overflow-hidden font-medium tracking-[0.01em] transition-colors duration-300 whitespace-nowrap shrink-0 ${padCls} ${bgCls}`}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100"
            style={{backgroundColor: hoverBg}}
          />
          <span aria-hidden="true" className="relative z-10 flex items-center shrink-0">
            <svg width="11" height="16" viewBox="0 0 11 16" fill="none">
              <path
                d="M1.5 15V7C1.5 4 3.3 2 5.5 1C7.7 2 9.5 4 9.5 7V15"
                stroke="#FFFFFF"
                strokeOpacity="0.88"
                strokeWidth="1.2"
              />
            </svg>
          </span>
          {iconLeft && <span className="relative z-10 shrink-0">{iconLeft}</span>}
          <span className="relative z-10">{children}</span>
          {iconRight && <span className="relative z-10 shrink-0">{iconRight}</span>}
        </span>
      );
    }

    // 5. MUQARNAS: Recessed concrete architectural niche
    const isConcrete = tone === 'concrete';
    return (
      <span
        className={`relative inline-flex items-center border border-[#221D1A] font-medium text-[#221D1A] transition-colors duration-200 whitespace-nowrap shrink-0 ${padCls} ${
          isConcrete ? 'bg-[#EAEAE6]' : 'bg-[#FFFFFF]'
        } group-hover:bg-[#EAEAE6]`}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[3px] border border-[#221D1A]/20 transition-all duration-300 group-hover:inset-[2px] group-hover:border-[#0F7A53]/70"
        />
        {iconLeft && <span className="relative z-10 shrink-0">{iconLeft}</span>}
        <span className="relative z-10">{children}</span>
        {iconRight && <span className="relative z-10 shrink-0">{iconRight}</span>}
      </span>
    );
  };

  const wrapperCls = `group inline-flex items-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F7A53] focus-visible:ring-offset-2 disabled:opacity-55 disabled:pointer-events-none ${className}`;

  if ('href' in rest && rest.href !== undefined) {
    const {href, ...anchorProps} = rest as ButtonAsLink;
    return (
      <a
        href={href}
        onClick={handleInteraction}
        onMouseEnter={() => setIsHoveringTespih(true)}
        onMouseLeave={() => setIsHoveringTespih(false)}
        className={wrapperCls}
        {...anchorProps}
      >
        {renderInner()}
      </a>
    );
  }

  const buttonProps = rest as ButtonAsButton;
  return (
    <button
      type={buttonProps.type ?? 'button'}
      onClick={handleInteraction}
      onMouseEnter={() => setIsHoveringTespih(true)}
      onMouseLeave={() => setIsHoveringTespih(false)}
      className={wrapperCls}
      {...buttonProps}
    >
      {renderInner()}
    </button>
  );
}
