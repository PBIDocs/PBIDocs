'use client';

import { useRef, type ReactNode, type MouseEvent } from 'react';
import { cn } from '@/lib/cn';

// The glow position and visibility live in CSS variables set directly on the
// element, not in React state, so moving the mouse never re-renders the card
// (or anything interactive inside it, like the homepage's live DIVIDE example).
// Which effect shows is decided by a CSS media query, so there's no flash of
// the touch fallback on desktop before JavaScript runs. (Class names are
// written out in full so Tailwind can find them.)

export function SpotlightCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--spot-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
    el.style.setProperty('--spot-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => ref.current?.style.setProperty('--spot-o', '1')}
      onMouseLeave={() => ref.current?.style.setProperty('--spot-o', '0')}
      className={cn('relative overflow-hidden', className)}
    >
      {/* Mouse-tracked spotlight: fine-pointer devices only, visible while hovered */}
      <div
        aria-hidden
        className={cn('pointer-events-none absolute inset-0 hidden transition-opacity duration-300', '[@media(hover:hover)_and_(pointer:fine)]:block')}
        style={{
          opacity: 'var(--spot-o, 0)',
          background:
            'radial-gradient(500px circle at var(--spot-x, 50%) var(--spot-y, 50%), color-mix(in srgb, var(--color-fd-primary) 22%, transparent), transparent 70%)',
        }}
      />
      {/* Border highlight: same tracked position, masked so only the nearby edge segment shows */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 hidden rounded-[inherit] transition-opacity duration-300',
          '[@media(hover:hover)_and_(pointer:fine)]:block',
        )}
        style={{
          opacity: 'var(--spot-o, 0)',
          border: '2px solid var(--color-fd-primary)',
          maskImage: 'radial-gradient(140px circle at var(--spot-x, 50%) var(--spot-y, 50%), black, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(140px circle at var(--spot-x, 50%) var(--spot-y, 50%), black, transparent 80%)',
        }}
      />
      {/* Touch devices: no cursor, so a slow ambient pulse instead */}
      <div
        aria-hidden
        className={cn('pointer-events-none absolute inset-0 animate-pulse [animation-duration:5s]', '[@media(hover:hover)_and_(pointer:fine)]:hidden')}
        style={{
          background:
            'radial-gradient(500px circle at 30% 20%, color-mix(in srgb, var(--color-fd-primary) 14%, transparent), transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 rounded-[inherit] animate-pulse [animation-duration:5s]',
          '[@media(hover:hover)_and_(pointer:fine)]:hidden',
        )}
        style={{
          border: '2px solid var(--color-fd-primary)',
          maskImage: 'radial-gradient(140px circle at 30% 20%, black, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(140px circle at 30% 20%, black, transparent 80%)',
        }}
      />
      {children}
    </div>
  );
}
