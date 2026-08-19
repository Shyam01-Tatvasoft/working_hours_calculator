import React from 'react';

/**
 * MealBreakIcon — Custom SVG icon matching the requested "Meal Break" logo.
 * Bolder design with high contrast, optimized for scaling.
 */
export function MealBreakIcon({ className = '', size = 24, ...props }) {
  const maskId = React.useId().replace(/:/g, '-');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="currentColor"
      className={`meal-break-icon ${className}`}
      {...props}
    >
      <defs>
        <mask id={`bag-mask-${maskId}`}>
          {/* Default: keep everything (white) */}
          <rect x="0" y="0" width="100" height="100" fill="white" />
          
          {/* Subtract Fork (black cutout) */}
          {/* Prongs & head */}
          <path
            d="M 38 43 v 8 c 0 2.5 1.5 3.5 3.5 3.5 s 3.5 -1 3.5 -3.5 v -8"
            fill="none"
            stroke="black"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Middle prong */}
          <line x1="41.5" y1="43" x2="41.5" y2="49" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
          {/* Stem/Handle */}
          <path
            d="M 41.5 54.5 v 12"
            fill="none"
            stroke="black"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Subtract Knife (black cutout) */}
          {/* Blade */}
          <path
            d="M 52 43 v 10 c 0 1.5 0.8 2.5 2 2.5 s 2 -1 2 -2.5 v -6 c 0 -3 -4 -4 -4 -4 Z"
            fill="black"
          />
          {/* Handle */}
          <path
            d="M 54 55.5 v 11"
            fill="none"
            stroke="black"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Subtract Clock outer bounds with padding gap */}
          <circle cx="72" cy="34" r="19" fill="black" />
        </mask>
      </defs>

      {/* 1. Bag Handle */}
      <path
        d="M 40 32 c 0 -11, 16 -11, 16 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        mask={`url(#bag-mask-${maskId})`}
      />

      {/* 2. Bag Body */}
      <rect
        x="30"
        y="32"
        width="36"
        height="45"
        rx="5.5"
        fill="currentColor"
        mask={`url(#bag-mask-${maskId})`}
      />

      {/* 3. Coffee Cup */}
      {/* Cup body */}
      <path d="M 10 50 L 12.5 74.5 c 0.3 2 1.8 3.5 3.5 3.5 h 7 c 1.7 0 3.2 -1.5 3.5 -3.5 L 29 50 Z" />
      {/* Cup lid */}
      <rect x="8" y="46" width="23" height="4" rx="2" />
      {/* Spout */}
      <rect x="10.5" y="43" width="3.5" height="3" rx="0.5" />

      {/* 4. Clock */}
      {/* Circle */}
      <circle
        cx="72"
        cy="34"
        r="15"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
      />
      {/* Hands */}
      <path
        d="M 72 34 L 72 25 M 72 34 L 80.5 29.5"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Pin */}
      <circle cx="72" cy="34" r="1.8" fill="currentColor" />
    </svg>
  );
}
