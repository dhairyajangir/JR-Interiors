/**
 * JR Interiors — Brand Logo Component
 *
 * Single source of truth for all logo variants.
 * Never use raw <img> tags for logos elsewhere in the codebase.
 *
 * Usage:
 *   <Logo variant="secondary" />       — explicit variant
 *   <Logo responsive />                 — auto-switches by breakpoint
 *   <Logo variant="watermark" aria-hidden />  — decorative
 */

import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

export type LogoVariant =
  | "primary"       // Full stacked: icon + JR + INTERIORS + tagline (large, square-ish)
  | "secondary"     // Horizontal: icon + divider + JR INTERIORS + tagline
  | "stacked"       // Compact stacked: icon + JR INTERIORS (no tagline)
  | "icon"          // Architectural space mark only
  | "monogram"      // JR serif lettermark only
  | "wordmark"      // Text-only: JR INTERIORS — WHERE VISION MEETS TRANSFORMATION
  | "hero"          // Maximum-impact primary (same asset, larger, with animation class)
  | "watermark"     // Icon at 5% opacity for background decoration
  | "stamp"         // Circular seal stamp logo
  | "social";       // Social / OG image

interface LogoProps {
  /** Which logo variant to render */
  variant?: LogoVariant;
  /**
   * Responsive mode: automatically switches variant based on viewport.
   * Overrides `variant` when true.
   * XL(>1440) → primary | L(1024-1440) → secondary | M/S(768-480) → stacked | XS(<480) → monogram | XXS → icon
   */
  responsive?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Override alt text (defaults to meaningful brand-specific text) */
  alt?: string;
  /** Mark as decorative — sets aria-hidden and empty alt */
  decorative?: boolean;
  /** Image priority (pass true for above-fold logos like navbar) */
  priority?: boolean;
}

// ─── Alt text defaults ────────────────────────────────────────────────────────

const ALT_TEXT: Record<LogoVariant, string> = {
  primary: "JR Interiors — Where Vision Meets Transformation",
  secondary: "JR Interiors",
  stacked: "JR Interiors — Where Vision Meets Transformation",
  icon: "JR Interiors",
  monogram: "JR Interiors",
  wordmark: "JR Interiors — Where Vision Meets Transformation",
  hero: "JR Interiors — Where Vision Meets Transformation",
  watermark: "JR Interiors",
  stamp: "JR Interiors Official Seal",
  social: "JR Interiors",
};

// ─── SVG Inline Variants ──────────────────────────────────────────────────────
// These variants are derived compositions built as SVG for perfect scalability.
// They faithfully reconstruct each variant from the brand guide.

/**
 * Stacked Logo SVG
 * Icon (smaller) centred above "JR" large serif + "INTERIORS" spaced caps
 * Compact — no tagline
 */
function StackedLogoSVG({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* Architectural space icon — scaled down, centered */}
      <g transform="translate(110, 62) scale(0.52)">
        <ArchitecturalIcon />
      </g>
      {/* JR large serif */}
      <text
        x="110"
        y="128"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="46"
        fontWeight="400"
        fill="#3D2314"
        letterSpacing="1"
      >
        JR
      </text>
      {/* INTERIORS small spaced caps */}
      <text
        x="110"
        y="155"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="15"
        fontWeight="400"
        fill="#3D2314"
        letterSpacing="6"
      >
        INTERIORS
      </text>
      {/* Divider line */}
      <line x1="70" y1="162" x2="150" y2="162" stroke="#3D2314" strokeWidth="0.6" opacity="0.6" />
      {/* Tagline */}
      <text
        x="110"
        y="178"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="7.5"
        fill="#3D2314"
        letterSpacing="2.5"
        opacity="0.75"
      >
        WHERE VISION MEETS TRANSFORMATION
      </text>
    </svg>
  );
}

/**
 * Wordmark SVG — text-only, horizontal
 * JR INTERIORS — WHERE VISION MEETS TRANSFORMATION
 */
function WordmarkSVG({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 340 44"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <text
        x="0"
        y="26"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="22"
        fontWeight="400"
        fill="#3D2314"
        letterSpacing="5"
      >
        JR INTERIORS
      </text>
      <text
        x="0"
        y="40"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="8"
        fill="#3D2314"
        letterSpacing="2.5"
        opacity="0.65"
      >
        WHERE VISION MEETS TRANSFORMATION
      </text>
    </svg>
  );
}

/**
 * Wordmark SVG — light version for dark backgrounds (footer)
 */
function WordmarkSVGLight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 340 44"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <text
        x="0"
        y="26"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="22"
        fontWeight="400"
        fill="rgba(251,249,248,0.85)"
        letterSpacing="5"
      >
        JR INTERIORS
      </text>
      <text
        x="0"
        y="40"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="8"
        fill="rgba(251,249,248,0.5)"
        letterSpacing="2.5"
      >
        WHERE VISION MEETS TRANSFORMATION
      </text>
    </svg>
  );
}

/**
 * Stamp / Seal SVG — circular premium seal
 */
function StampSVG({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* Outer ring */}
      <circle cx="80" cy="80" r="76" fill="none" stroke="#3D2314" strokeWidth="1.2" />
      {/* Inner ring */}
      <circle cx="80" cy="80" r="68" fill="none" stroke="#3D2314" strokeWidth="0.5" opacity="0.4" />
      {/* Top arc text */}
      <defs>
        <path id="topArc" d="M 20,80 a 60,60 0 0,1 120,0" />
        <path id="botArc" d="M 20,80 a 60,60 0 0,0 120,0" />
      </defs>
      <text fontFamily="Georgia, 'Times New Roman', serif" fontSize="10" fill="#3D2314" letterSpacing="4">
        <textPath href="#topArc" startOffset="50%" textAnchor="middle">JR INTERIORS</textPath>
      </text>
      <text fontFamily="Georgia, 'Times New Roman', serif" fontSize="7.5" fill="#3D2314" letterSpacing="2" opacity="0.75">
        <textPath href="#botArc" startOffset="50%" textAnchor="middle">WHERE VISION MEETS TRANSFORMATION</textPath>
      </text>
      {/* Center icon (small) */}
      <g transform="translate(80, 72) scale(0.32)">
        <ArchitecturalIcon />
      </g>
      {/* Stars */}
      <text x="26" y="84" fontSize="6" fill="#3D2314" opacity="0.6">✦</text>
      <text x="129" y="84" fontSize="6" fill="#3D2314" opacity="0.6">✦</text>
    </svg>
  );
}

/**
 * Watermark SVG — ultra-low-opacity icon for background decoration
 */
function WatermarkSVG({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
      style={{ opacity: 0.05 }}
    >
      <g transform="translate(100, 100) scale(0.85)">
        <ArchitecturalIcon />
      </g>
    </svg>
  );
}

/**
 * The core architectural space icon as reusable SVG group.
 * Represents a three-point room perspective — the brand mark.
 * Origin centered at (0,0).
 */
function ArchitecturalIcon() {
  return (
    <>
      {/* Left wall — dark walnut brown fill */}
      <polygon
        points="-18,-52 -18,48 2,62 2,-38"
        fill="#3D2314"
      />
      {/* Right wall — subtle outline only (white/transparent) */}
      <polygon
        points="2,-38 2,62 22,48 22,-52"
        fill="none"
        stroke="#3D2314"
        strokeWidth="1.5"
      />
      {/* Floor — warm sand */}
      <polygon
        points="-18,48 2,62 22,48 2,34"
        fill="#C9B99A"
      />
      {/* Ceiling lines — top left */}
      <line x1="-18" y1="-52" x2="-60" y2="-78" stroke="#3D2314" strokeWidth="1.2" />
      <line x1="2" y1="-38" x2="-60" y2="-78" stroke="#3D2314" strokeWidth="1.2" />
      {/* Ceiling lines — top right */}
      <line x1="22" y1="-52" x2="64" y2="-78" stroke="#3D2314" strokeWidth="1.2" />
      <line x1="2" y1="-38" x2="64" y2="-78" stroke="#3D2314" strokeWidth="1.2" />
      {/* Floor lines — bottom left */}
      <line x1="-18" y1="48" x2="-60" y2="74" stroke="#3D2314" strokeWidth="1.2" />
      <line x1="2" y1="34" x2="-60" y2="74" stroke="#3D2314" strokeWidth="1.2" />
      {/* Floor lines — bottom right */}
      <line x1="22" y1="48" x2="64" y2="74" stroke="#3D2314" strokeWidth="1.2" />
      <line x1="2" y1="34" x2="64" y2="74" stroke="#3D2314" strokeWidth="1.2" />
    </>
  );
}

// ─── Responsive wrapper (CSS media-query based via display classes) ─────────

function ResponsiveLogo({ priority }: { priority?: boolean }) {
  return (
    <>
      {/* XL (>1440px) — Primary */}
      <span className="hidden [@media(min-width:1440px)]:block">
        <Image src="/logos/primary.svg" alt={ALT_TEXT.primary} width={160} height={160} priority={priority} className="object-contain" />
      </span>
      {/* L (1024–1440px) — Secondary Horizontal */}
      <span className="hidden lg:block [@media(min-width:1440px)]:hidden">
        <Image src="/logos/secondary-horizontal.svg" alt={ALT_TEXT.secondary} width={220} height={56} priority={priority} className="object-contain" />
      </span>
      {/* M/S (480–1024px) — Stacked */}
      <span className="hidden sm:block lg:hidden">
        <StackedLogoSVG className="h-14 w-auto" />
      </span>
      {/* XS (<480px) — Monogram */}
      <span className="block sm:hidden">
        <Image src="/logos/monogram.svg" alt={ALT_TEXT.monogram} width={44} height={44} priority={priority} className="object-contain" />
      </span>
    </>
  );
}

// ─── Main Logo Component ──────────────────────────────────────────────────────

export function Logo({
  variant = "secondary",
  responsive = false,
  className = "",
  alt,
  decorative = false,
  priority = false,
}: LogoProps) {
  const ariaProps = decorative
    ? { "aria-hidden": true as const, alt: "" }
    : { alt: alt ?? ALT_TEXT[variant] };

  if (responsive) {
    return (
      <span className={`inline-flex items-center ${className}`} aria-label="JR Interiors">
        <ResponsiveLogo priority={priority} />
      </span>
    );
  }

  // ── SVG-based variants ──────────────────────────────────────────────────
  if (variant === "primary") {
    return (
      <Image
        src="/logos/primary.svg"
        {...ariaProps}
        width={200}
        height={200}
        priority={priority}
        className={`object-contain ${className}`}
      />
    );
  }

  if (variant === "secondary") {
    return (
      <Image
        src="/logos/secondary-horizontal.svg"
        {...ariaProps}
        width={260}
        height={66}
        priority={priority}
        className={`object-contain ${className}`}
      />
    );
  }

  if (variant === "icon") {
    return (
      <Image
        src="/logos/icon.svg"
        {...ariaProps}
        width={48}
        height={48}
        priority={priority}
        className={`object-contain ${className}`}
      />
    );
  }

  if (variant === "monogram") {
    return (
      <Image
        src="/logos/monogram.svg"
        {...ariaProps}
        width={56}
        height={56}
        priority={priority}
        className={`object-contain ${className}`}
      />
    );
  }

  if (variant === "social") {
    return (
      <Image
        src="/logos/og-social.png"
        {...ariaProps}
        width={400}
        height={400}
        priority={priority}
        className={`object-contain ${className}`}
      />
    );
  }

  // Hero — same asset as primary, but rendered larger with animation
  if (variant === "hero") {
    return (
      <Image
        src="/logos/primary.svg"
        {...ariaProps}
        width={240}
        height={240}
        priority={priority}
        className={`object-contain animate-[logo-fade-up_600ms_cubic-bezier(0.16,1,0.3,1)_both] hover:scale-[1.03] transition-transform duration-300 ${className}`}
      />
    );
  }

  // ── SVG-based derived variants ──────────────────────────────────────────
  if (variant === "stacked") {
    return (
      <StackedLogoSVG
        className={`${className}`}
        {...(decorative ? { "aria-hidden": true } : {})}
      />
    );
  }

  if (variant === "wordmark") {
    return (
      <WordmarkSVG
        className={`${className}`}
        {...(decorative ? { "aria-hidden": true } : {})}
      />
    );
  }

  if (variant === "watermark") {
    return (
      <WatermarkSVG
        className={`${className}`}
        {...(decorative ? { "aria-hidden": true } : {})}
      />
    );
  }

  if (variant === "stamp") {
    return (
      <StampSVG
        className={`${className}`}
        {...(decorative ? { "aria-hidden": true } : {})}
      />
    );
  }

  // Fallback
  return (
    <Image
      src="/logos/secondary-horizontal.png"
      {...ariaProps}
      width={260}
      height={66}
      priority={priority}
      className={`object-contain ${className}`}
    />
  );
}

/**
 * Light (inverted) variants for use on dark backgrounds.
 * Applies CSS filter to flip dark logo assets to white.
 */
export function LogoLight({
  variant = "secondary",
  className = "",
  ...props
}: LogoProps) {
  // For SVG variants, use the light version directly
  if (variant === "wordmark") {
    return (
      <WordmarkSVGLight
        className={`${className}`}
        {...(props.decorative ? { "aria-hidden": true } : {})}
      />
    );
  }
  // For PNG variants, use CSS filter to invert to white
  return (
    <Logo
      variant={variant}
      className={`brightness-0 invert ${className}`}
      {...props}
    />
  );
}
