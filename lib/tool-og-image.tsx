import { ImageResponse } from 'next/og';
import { __iconNode as activity } from 'lucide-react/dist/esm/icons/activity.mjs';
import { __iconNode as calendarClock } from 'lucide-react/dist/esm/icons/calendar-clock.mjs';
import { __iconNode as calendarDays } from 'lucide-react/dist/esm/icons/calendar-days.mjs';
import { __iconNode as chartLine } from 'lucide-react/dist/esm/icons/chart-line.mjs';
import { __iconNode as gauge } from 'lucide-react/dist/esm/icons/gauge.mjs';
import { __iconNode as grid3x3 } from 'lucide-react/dist/esm/icons/grid-3x3.mjs';
import { __iconNode as hash } from 'lucide-react/dist/esm/icons/hash.mjs';
import { __iconNode as listChecks } from 'lucide-react/dist/esm/icons/list-checks.mjs';
import { __iconNode as slidersHorizontal } from 'lucide-react/dist/esm/icons/sliders-horizontal.mjs';
import { __iconNode as shieldAlert } from 'lucide-react/dist/esm/icons/shield-alert.mjs';
import { __iconNode as sparkles } from 'lucide-react/dist/esm/icons/sparkles.mjs';
import { __iconNode as spellCheck } from 'lucide-react/dist/esm/icons/spell-check.mjs';
import { __iconNode as trendingUp } from 'lucide-react/dist/esm/icons/trending-up.mjs';
import { tools } from '@/lib/tools';

// Shared social-share image for the tool pages. Each tool folder has a
// one-line opengraph-image.tsx that calls this with its own href, so the
// name, description, icon, and badge always come from lib/tools.ts.

export const toolImageSize = { width: 1200, height: 630 };

const PURPLE = '#ad94ff';

// Shape data for each tool's icon, keyed by the iconName in lib/tools.ts.
const ICONS: Record<string, [string, Record<string, string>][]> = {
  activity,
  'calendar-clock': calendarClock,
  'calendar-days': calendarDays,
  'chart-line': chartLine,
  gauge,
  'grid-3x3': grid3x3,
  hash,
  'list-checks': listChecks,
  'shield-alert': shieldAlert,
  'sliders-horizontal': slidersHorizontal,
  sparkles,
  'spell-check': spellCheck,
  'trending-up': trendingUp,
};

function ToolIcon({ name }: { name: string }) {
  const node = ICONS[name];
  if (!node) throw new Error(`Add the "${name}" icon to ICONS in lib/tool-og-image.tsx`);
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      {node.map(([tag, { key, ...attrs }]) => {
        const Tag = tag as 'path';
        return <Tag key={key} {...attrs} />;
      })}
    </svg>
  );
}

export function toolImage(href: string) {
  const tool = tools.find((t) => t.href === href);
  if (!tool) throw new Error(`No tool registered for ${href}`);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          backgroundColor: '#0c0b10',
          backgroundImage:
            'radial-gradient(circle at 85% 10%, rgba(121, 84, 222, 0.45), transparent 55%), radial-gradient(circle at 0% 100%, rgba(121, 84, 222, 0.18), transparent 50%)',
          color: '#f4f4f5',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <svg width="44" height="44" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="8" fill="#744ED7" />
            <rect x="8" y="18" width="4" height="8" rx="1.5" fill="white" />
            <rect x="14" y="13" width="4" height="13" rx="1.5" fill="white" />
            <rect x="20" y="7" width="4" height="19" rx="1.5" fill="white" />
          </svg>
          <span style={{ fontSize: 32, fontWeight: 700 }}>PBIDocs</span>
          <span style={{ fontSize: 28, color: '#71717a', marginLeft: 4 }}>/ Tools</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 104,
              height: 104,
              borderRadius: 24,
              backgroundColor: 'rgba(121, 84, 222, 0.18)',
              border: '2px solid rgba(173, 148, 255, 0.35)',
            }}
          >
            <ToolIcon name={tool.iconName} />
          </div>
          <div style={{ display: 'flex', fontSize: 76, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 }}>
            {tool.title}
          </div>
          <div style={{ display: 'flex', fontSize: 32, lineHeight: 1.4, color: '#a1a1aa', maxWidth: 1000 }}>
            {tool.description}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <div
            style={{
              display: 'flex',
              padding: '10px 22px',
              borderRadius: 999,
              backgroundColor: 'rgba(121, 84, 222, 0.2)',
              color: PURPLE,
              fontSize: 26,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {tool.ai ? 'AI-powered · 5 free requests a day' : 'Free · unlimited · runs in your browser'}
          </div>
          <span style={{ fontSize: 22, color: '#71717a', whiteSpace: 'nowrap' }}>pbidocs.com{tool.href}</span>
        </div>
      </div>
    ),
    toolImageSize,
  );
}
