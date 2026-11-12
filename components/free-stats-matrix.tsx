'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

// A dot-matrix display for the homepage "Free from day one" section. It cycles
// through real site counts (passed in from the server, so they stay true), and
// each change wipes across the grid column by column. Drawn on a canvas: a few
// hundred dots easing every frame is cheap there and janky as SVG nodes.

export interface MatrixStat {
  value: string;
  label: string;
}

const GLYPHS: Record<string, string[]> = {
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  '+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'],
};

const COLS = 31;
const ROWS = 13;
const CYCLE_MS = 3400;

// Which cells a value lights, centered in the grid.
function litCells(value: string): Set<number> {
  const chars = [...value].filter((ch) => GLYPHS[ch]);
  const width = chars.length * 6 - 1;
  const left = Math.floor((COLS - width) / 2);
  const top = Math.floor((ROWS - 7) / 2);
  const lit = new Set<number>();
  chars.forEach((ch, k) => {
    GLYPHS[ch].forEach((row, r) => {
      [...row].forEach((bit, c) => {
        if (bit === '1') lit.add((top + r) * COLS + left + k * 6 + c);
      });
    });
  });
  return lit;
}

interface Dot {
  v: number; // 0 = background, 1 = lit
  target: number;
  start: number; // when this dot starts moving toward its target
  phase: number; // twinkle offset
  speed: number;
}

// Stable pseudo-random numbers per dot, so server and client render alike.
const hash = (i: number, salt: number) => {
  let h = Math.imul(i + 1, 2654435761) ^ Math.imul(salt, 1597334677);
  h = Math.imul(h ^ (h >>> 15), 2246822519);
  return ((h ^ (h >>> 13)) >>> 0) / 4294967296;
};

function makeDots(value: string): Dot[] {
  const lit = litCells(value);
  return Array.from({ length: COLS * ROWS }, (_, i) => ({
    v: lit.has(i) ? 1 : 0,
    target: lit.has(i) ? 1 : 0,
    start: 0,
    phase: hash(i, 1) * Math.PI * 2,
    speed: 0.6 + hash(i, 2) * 0.9,
  }));
}

export function FreeStatsMatrix({ stats }: { stats: MatrixStat[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  const [initialDots] = useState(() => makeDots(stats[0].value));
  const dots = useRef<Dot[]>(initialDots);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const colors = useRef({ primary: '#a78bfa', dim: '#a78bfa' });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Only animate while the display is on screen.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Follow the theme: read the site's primary color, and re-read on a theme switch.
  useEffect(() => {
    const read = () => {
      const s = getComputedStyle(document.documentElement);
      const primary = s.getPropertyValue('--color-fd-primary').trim() || '#a78bfa';
      const dim = s.getPropertyValue('--color-fd-muted-foreground').trim() || primary;
      colors.current = { primary, dim };
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] });
    return () => mo.disconnect();
  }, []);

  // Retarget the dots whenever the stat changes: a left-to-right wipe.
  useEffect(() => {
    const lit = litCells(stats[index].value);
    const now = performance.now();
    dots.current.forEach((d, i) => {
      const target = lit.has(i) ? 1 : 0;
      if (target === d.target) return;
      d.target = target;
      d.start = reduced ? 0 : now + (i % COLS) * 18 + Math.random() * 60;
      if (reduced) d.v = target;
    });
  }, [index, stats, reduced]);

  // Auto-advance.
  useEffect(() => {
    if (reduced || paused || !visible || stats.length < 2) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % stats.length), CYCLE_MS);
    return () => clearTimeout(t);
  }, [index, paused, visible, reduced, stats.length]);

  // Draw loop.
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let cell = 0;
    const resize = () => {
      width = wrap.clientWidth;
      cell = width / COLS;
      const height = cell * ROWS;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const ease = 1 - Math.exp(-dt / 70);
      const { primary, dim } = colors.current;
      const size = cell * 0.62;
      const radius = cell * 0.16;
      const p = pointer.current;
      const reach = cell * 4.5;

      ctx.clearRect(0, 0, width, cell * ROWS);
      const litDots: { x: number; y: number; v: number; glow: number }[] = [];

      // Background dots in one pass, in the muted color.
      ctx.fillStyle = dim;
      for (let i = 0; i < dots.current.length; i++) {
        const d = dots.current[i];
        if (now >= d.start) d.v += (d.target - d.v) * ease;
        const c = i % COLS;
        const r = (i - c) / COLS;
        const x = c * cell + (cell - size) / 2;
        const y = r * cell + (cell - size) / 2;

        let glow = 0;
        if (p) {
          const dist = Math.hypot(p.x - (x + size / 2), p.y - (y + size / 2));
          glow = Math.max(0, 1 - dist / reach) ** 2;
        }
        const twinkle = reduced ? 0 : Math.max(0, Math.sin(now / 1000 * d.speed + d.phase)) ** 12 * 0.22;
        const bg = 0.12 + twinkle;

        if (d.v > 0.02 || glow > 0.02) litDots.push({ x, y, v: d.v, glow });
        if (d.v < 0.98) {
          ctx.globalAlpha = bg * (1 - d.v);
          ctx.beginPath();
          ctx.roundRect(x, y, size, size, radius);
          ctx.fill();
        }
      }

      // Lit and pointer-lit dots on top, in the primary color with a glow.
      ctx.fillStyle = primary;
      ctx.shadowColor = primary;
      for (const d of litDots) {
        const a = Math.min(1, d.v + d.glow * 0.45);
        ctx.globalAlpha = a;
        ctx.shadowBlur = d.v > 0.5 ? cell * 0.7 : 0;
        ctx.beginPath();
        ctx.roundRect(d.x, d.y, size, size, radius);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      if (visible) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [visible, reduced]);

  const stat = stats[index];

  return (
    <div
      className="flex w-full flex-col items-center gap-4"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => {
        setPaused(false);
        pointer.current = null;
      }}
    >
      <div className="relative w-full">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[12%] inset-y-[18%] rounded-full bg-fd-primary/15 blur-3xl"
        />
        <div
          ref={wrapRef}
          className="relative w-full [mask-image:radial-gradient(ellipse_75%_70%_at_center,black_45%,transparent_100%)]"
          onPointerMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            pointer.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
          }}
        >
          <canvas ref={canvasRef} className="block w-full" aria-hidden />
        </div>
      </div>

      <p key={stat.label} className="animate-in fade-in slide-in-from-bottom-1 text-sm text-fd-muted-foreground duration-500">
        <span className="font-mono font-semibold text-fd-foreground">{stat.value}</span> {stat.label}
      </p>

      <div className="flex gap-1.5" role="group" aria-label="Site stats">
        {stats.map((s, i) => (
          <button
            key={s.label}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`${s.value} ${s.label}`}
            aria-pressed={i === index}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === index ? 'w-6 bg-fd-primary' : 'w-1.5 bg-fd-muted-foreground/30 hover:bg-fd-muted-foreground/60',
            )}
          />
        ))}
      </div>

      <p className="sr-only">{stats.map((s) => `${s.value} ${s.label}`).join(', ')}</p>
    </div>
  );
}
