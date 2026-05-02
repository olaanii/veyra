import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  /** "icon" = mark only, "lockup" = mark + Veyra wordmark */
  variant?: 'icon' | 'lockup'
  /** Pixel size of the mark (lockup scales the wordmark with it) */
  size?: number
  /** Wraps the logo in a Link. Pass null to disable. */
  href?: string | null
  className?: string
  /** Render the mark inside a soft rounded tile (helpful on photographic / colored bgs) */
  tile?: boolean
  /** Tone affects the wordmark color only (the mark itself is full-color). */
  tone?: 'light' | 'dark'
  showTagline?: boolean
}

/**
 * Veyra brand logo.
 *
 * Uses the official mark stored at /public/veyra-mark.png — a chiseled V
 * with a dark left stroke, an orange right stroke, and a small orange
 * 4-point star spark in the negative space.
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
  const wordmarkColor = tone === 'dark' ? 'text-white' : 'text-zinc-900'
  const taglineColor = tone === 'dark' ? 'text-zinc-400' : 'text-zinc-500'

  // When tiled, the mark itself is rendered slightly smaller inside the tile
  const tileSize = size
  const markSize = tile ? Math.round(size * 0.78) : size

  const Mark = (
    <span
      className={cn(
        'relative inline-flex items-center justify-center shrink-0',
        tile && 'rounded-[22%] bg-white border border-zinc-200 shadow-sm',
      )}
      style={{ width: tileSize, height: tileSize }}
    >
      <Image
        src="/veyra-mark.png"
        alt="Veyra"
        width={markSize}
        height={markSize}
        priority
        className="select-none"
        style={{ width: markSize, height: markSize, objectFit: 'contain' }}
      />
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
            style={{ fontSize: Math.max(14, size * 0.6) }}
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
