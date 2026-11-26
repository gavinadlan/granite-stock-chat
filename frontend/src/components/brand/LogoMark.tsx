import { useId, type SVGProps } from 'react';

/** Chat bubble with three candlesticks; the first two are transparent holes in the bubble. */
export function LogoMark(props: SVGProps<SVGSVGElement>) {
  // Colons from useId are not safe in every url(#...) implementation.
  const maskId = `logo-${useId().replace(/:/g, '')}`;

  return (
    <svg viewBox="0 0 32 32" role="img" aria-label="StockAI" {...props}>
      <defs>
        <mask id={maskId}>
          <rect width="32" height="32" fill="white" />
          <rect x="8" y="13" width="2" height="8" fill="black" />
          <rect x="7" y="15" width="4" height="4" fill="black" />
          <rect x="15" y="9" width="2" height="10" fill="black" />
          <rect x="14" y="11" width="4" height="5" fill="black" />
        </mask>
      </defs>
      <path
        d="M8 3H24A6 6 0 0 1 30 9V19A6 6 0 0 1 24 25H14L8 30V25A6 6 0 0 1 2 19V9A6 6 0 0 1 8 3Z"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
      <g fill="hsl(var(--logo-accent))">
        <rect x="22" y="6" width="2" height="10" />
        <rect x="21" y="8" width="4" height="6" />
      </g>
    </svg>
  );
}
