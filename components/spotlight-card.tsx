'use client';

import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from 'react';
import { cn } from '@/lib/cn';

export function SpotlightCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [opacity, setOpacity] = useState(0);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    setCanHover(window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  }, []);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  return (
    <div
      ref={ref}
      onMouseMove={canHover ? handleMouseMove : undefined}
      onMouseEnter={canHover ? () => setOpacity(1) : undefined}
      onMouseLeave={canHover ? () => setOpacity(0) : undefined}
      className={cn('relative overflow-hidden', className)}
    >
      {/* Mouse-tracked spotlight: only visible on proximity/hover, fine-pointer devices */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: canHover ? opacity : 0,
          background: `radial-gradient(500px circle at ${pos.x}% ${pos.y}%, color-mix(in srgb, var(--color-fd-primary) 22%, transparent), transparent 70%)`,
        }}
      />
      {/* Border highlight: same tracked position, masked so only the nearby edge segment is visible */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: canHover ? opacity : 0,
          border: '2px solid var(--color-fd-primary)',
          maskImage: `radial-gradient(140px circle at ${pos.x}% ${pos.y}%, black, transparent 80%)`,
          WebkitMaskImage: `radial-gradient(140px circle at ${pos.x}% ${pos.y}%, black, transparent 80%)`,
        }}
      />
      {/* Ambient fallback for touch devices: no hover/cursor, so a slow drift instead */}
      {!canHover && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 animate-pulse [animation-duration:5s]"
            style={{
              background:
                'radial-gradient(500px circle at 30% 20%, color-mix(in srgb, var(--color-fd-primary) 14%, transparent), transparent 70%)',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] animate-pulse [animation-duration:5s]"
            style={{
              border: '2px solid var(--color-fd-primary)',
              maskImage: 'radial-gradient(140px circle at 30% 20%, black, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(140px circle at 30% 20%, black, transparent 80%)',
            }}
          />
        </>
      )}
      {children}
    </div>
  );
}
