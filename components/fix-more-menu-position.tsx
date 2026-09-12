'use client';

import { useEffect } from 'react';

// fumadocs-ui's desktop "More" nav dropdown positions its popup via
// `anchor: listRef` (the whole nav row) inside its own header.js -- not
// something exposed through our layout.tsx props. That produces a real,
// continuous horizontal drift between the popup and its own trigger:
// measured directly (Playwright, at the same page/content), the offset
// runs from about -56px at a 1150px viewport, crosses near zero around
// 1250-1300px (pure coincidence -- there's nothing special about that
// width), then grows to +76px by ~1420px and plateaus there. It's a
// function of the nav row's actual rendered width, not a step function
// tied to any single breakpoint, so no constant CSS offset (or even a
// single media-query breakpoint) can correct it everywhere -- this
// measures the trigger and popup's real on-screen positions each time the
// menu opens (and on resize while it's open) and applies whatever
// corrective translateX actually closes the gap.
const TRIGGER_SELECTOR = '[data-base-ui-navigation-menu-trigger]';
const POSITIONER_SELECTOR = '[class*="z-40"][class*="w-(--anchor-width)"]';

export function FixMoreMenuPosition() {
  useEffect(() => {
    const trigger = document.querySelector<HTMLElement>(TRIGGER_SELECTOR);
    if (!trigger) return;

    let rafId: number | null = null;
    let lastCorrection = 0;

    function measureAndCorrect() {
      const positioner = document.querySelector<HTMLElement>(POSITIONER_SELECTOR);
      if (!positioner) return;

      // getBoundingClientRect() reflects our own previously-applied
      // transform too, so back it out first to recover the library's raw
      // (uncorrected) position before computing a fresh correction --
      // avoids a reset-then-remeasure round trip on every frame.
      const rawLeft = positioner.getBoundingClientRect().left - lastCorrection;
      const triggerLeft = trigger!.getBoundingClientRect().left;
      const correction = triggerLeft - rawLeft;

      if (Math.abs(correction - lastCorrection) > 0.5) {
        positioner.style.transform = `translateX(${correction}px)`;
        lastCorrection = correction;
      }
    }

    function loop() {
      if (trigger!.getAttribute('aria-expanded') === 'true') {
        measureAndCorrect();
      } else {
        lastCorrection = 0;
      }
      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}
