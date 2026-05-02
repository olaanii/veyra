import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  /** "icon" = mark only, "lockup" = mark + Veyra wordmark */
  variant?: 'icon' | 'lockup'
  /** Pixel size of the mark (lockup scales the wordmark with it) */
  size?: number
  /** Wraps the logo in a Link */
  href?: string | null
  className?: string
  /** Render the mark inside a dark rounded "app icon" tile */
  tile?: boolean
  /** "dark" = light mark for dark backgrounds, "light" = dark mark for light backgrounds */
  tone?: 'light' | 'dark'
  showTagline?: boolean
}

/**
 * Veyra brand logo. Inline SVG mark that exactly mirrors the official
 * brand sheet at /public/veyra-logo.png — a chiseled V with an orange
 * accent stroke and a small orange 4-point star.
 */
export function Logo({
  variant = 'lockup',
  size = 28,
  href = '/',
  className,
  tile = false,
  tone = 'light',
  showTagline = false,
}: LogoProps) {
  // Mark colors flip based on tone (and tile forces dark background)
  const isOnDark = tone === 'dark' || tile
  const bodyColor = isOnDark ? '#ffffff' : '#0f172a' // white on dark, slate-900 on light
  const accentColor = '#f97316' // orange-500
  const wordmarkColor = isOnDark ? 'text-white' : 'text-zinc-900'
  const taglineColor = isOnDark ? 'text-zinc-400' : 'text-zinc-400'

  const tileSize = size
  const markSize = tile ? size * 0.62 : size

  const Mark = (
    <span
      className={cn(
        'relative inline-flex items-center justify-center shrink-0',
        tile && 'rounded-[26%] bg-zinc-900',
      )}
      style={{ width: tileSize, height: tileSize }}
    >
      <svg
        viewBox="0 0 64 64"
        width={markSize}
        height={markSize}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Left V stroke (dark body) */}
        <path
          d="M8 12 L17 12 L32 50 L27 50 Z"
          fill={bodyColor}
        />
        {/* Right V stroke (orange accent ribbon) */}
        <path
          d="M47 12 L56 12 L37 50 L32 50 Z"
          fill={accentColor}
        />
        {/* Subtle inner shadow on the dark side for depth */}
        <path
          d="M8 12 L17 12 L32 50 L27 50 Z"
          fill="url(#vShadow)"
          opacity={isOnDark ? 0 : 0.18}
        />
        {/* Orange 4-point star spark */}
        <path
          d="M40 15 L42.4 19.6 L47 22 L42.4 24.4 L40 29 L37.6 24.4 L33 22 L37.6 19.6 Z"
          fill={accentColor}
        />
        <defs>
          <linearGradient id="vShadow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="1" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  )

  const content =
    variant === 'icon' ? (
      Mark
    ) : (
      <span className="inline-flex items-center gap-2">
        {Mark}
        <span className="flex flex-col leading-none">
          <span
            className={cn('font-semibold tracking-tight', wordmarkColor)}
            style={{ fontSize: Math.max(14, size * 0.62) }}
          >
            Veyra
          </span>
          {showTagline && (
            <span className={cn('text-[9px] mt-1 tracking-[0.18em] uppercase', taglineColor)}>
              Architect <span className="text-orange-500">·</span> Prompt{' '}
              <span className="text-orange-500">·</span> Build
            </span>
          )}
        </span>
      </span>
    )

  if (href) {
    return (
      <Link href={href} className={cn('inline-flex items-center', className)} aria-label="Veyra">
        {content}
      </Link>
    )
  }
  return <span className={cn('inline-flex items-center', className)}>{content}</span>
}
