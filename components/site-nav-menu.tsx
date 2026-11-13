'use client';

import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, ChevronDown, CircleHelp, FlaskConical, History, Info, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { tools, type Tool } from '@/lib/tools';

// The header's Tools and More dropdowns, replacing Fumadocs' built-in menu
// item. One Radix root with a shared viewport, so moving between the two
// triggers morphs one panel instead of closing and reopening two.

const triggerClass =
  'group inline-flex items-center gap-1 rounded-md p-2 text-sm text-fd-muted-foreground outline-none transition-colors hover:text-fd-accent-foreground focus-visible:ring-2 focus-visible:ring-fd-ring data-[state=open]:text-fd-accent-foreground';

const headingClass = 'mb-2 px-2.5 font-mono text-[0.68rem] tracking-[0.14em] text-fd-muted-foreground/80 uppercase';

const moreLinks: { href: string; title: string; icon: LucideIcon }[] = [
  { href: '/changelog', title: 'Changelog', icon: History },
  { href: '/playground', title: 'Interactive Examples', icon: FlaskConical },
  { href: '/faq', title: 'FAQ', icon: CircleHelp },
  { href: '/about', title: 'About', icon: Info },
];

function MenuLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <NavigationMenu.Link asChild>
      <Link href={href} className={cn('outline-none focus-visible:ring-2 focus-visible:ring-fd-ring', className)}>
        {children}
      </Link>
    </NavigationMenu.Link>
  );
}

function ToolLink({ tool }: { tool: Tool }) {
  return (
    <li>
      <MenuLink
        href={tool.href}
        className="group/item flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm whitespace-nowrap text-fd-foreground transition-colors hover:bg-fd-accent"
      >
        <tool.icon className="size-4 shrink-0 text-fd-muted-foreground transition-colors group-hover/item:text-fd-primary" />
        {tool.title}
      </MenuLink>
    </li>
  );
}

const PANEL_WIDTH: Record<string, number> = { tools: 1008, more: 240 };
const EDGE = 16;

function ToolsPanel() {
  const ai = tools.find((t) => t.group === 'ai');
  const columns = [
    { heading: 'Build your model', items: tools.filter((t) => t.group === 'model') },
    { heading: 'Project & risk', items: tools.filter((t) => t.group === 'engineering' && t.area === 'project') },
    { heading: 'Quality & reliability', items: tools.filter((t) => t.group === 'engineering' && t.area !== 'project') },
  ];
  return (
    <div className="grid w-[min(63rem,calc(100vw-2rem))] grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_14rem]">
      {columns.map((col) => (
        <div key={col.heading} className="p-4">
          <p className={headingClass}>{col.heading}</p>
          <ul className="flex flex-col gap-0.5">
            {col.items.map((tool) => (
              <ToolLink key={tool.href} tool={tool} />
            ))}
          </ul>
        </div>
      ))}
      <div className="flex flex-col gap-3 border-fd-border p-4 max-lg:border-t sm:max-lg:col-span-1 lg:border-l">
        <p className={headingClass}>AI-powered</p>
        {ai && (
          <MenuLink
            href={ai.href}
            className="group/ai flex flex-col gap-1.5 rounded-lg border border-fd-border bg-fd-background/60 p-3 transition-colors hover:border-fd-primary/50"
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <ai.icon className="size-4 text-fd-primary" />
              {ai.title}
            </span>
            <span className="text-xs leading-relaxed text-fd-muted-foreground">
              Describe a calculation in plain English and get a working measure.
            </span>
            <span className="text-[0.7rem] font-medium text-fd-primary">5 free requests a day</span>
          </MenuLink>
        )}
        <MenuLink
          href="/tools"
          className="mt-auto inline-flex items-center gap-1.5 rounded-md px-1 py-1 text-sm font-medium text-fd-muted-foreground transition-colors hover:text-fd-primary"
        >
          All {tools.length} tools
          <ArrowRight className="size-3.5" />
        </MenuLink>
      </div>
    </div>
  );
}

function MorePanel() {
  return (
    <div className="w-60 p-4">
      <p className={headingClass}>Resources</p>
      <ul className="flex flex-col gap-0.5">
        {moreLinks.map((link) => (
          <li key={link.href}>
            <MenuLink
              href={link.href}
              className="group/item flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-fd-accent"
            >
              <link.icon className="size-4 shrink-0 text-fd-muted-foreground transition-colors group-hover/item:text-fd-primary" />
              {link.title}
            </MenuLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

const contentClass = 'nav-menu-content absolute top-0 left-0';

function TopLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <NavigationMenu.Item>
      <NavigationMenu.Link asChild active={active}>
        <Link href={href} className={cn(triggerClass, 'data-[active]:text-fd-primary')}>
          {children}
        </Link>
      </NavigationMenu.Link>
    </NavigationMenu.Item>
  );
}

export function SiteNavMenu() {
  const pathname = usePathname();
  const onTools = pathname === '/tools' || pathname.startsWith('/tools/');
  const [value, setValue] = useState('');
  const [left, setLeft] = useState<number | null>(null);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const anchor = useRef<HTMLDivElement>(null);
  const previous = useRef('');
  // Slide only when moving from one open menu to the other, not on first open.
  const [slide, setSlide] = useState(false);

  // Put the panel under the trigger that opened it (a little to its left, so
  // moving the pointer straight down lands inside it), clamped to the window.
  // Positions are relative to the fixed wrapper's containing block, which is
  // the header rather than the window, because the header has a backdrop blur.
  useLayoutEffect(() => {
    const wasOpen = previous.current !== '';
    previous.current = value;
    const trigger = triggers.current[value];
    if (!trigger || !anchor.current) return;
    setSlide(wasOpen);
    const origin = anchor.current.getBoundingClientRect().left - (left ?? 0);
    const width = Math.min(PANEL_WIDTH[value] ?? 0, window.innerWidth - EDGE * 2);
    const desired = trigger.getBoundingClientRect().left - 24;
    const clamped = Math.max(EDGE, Math.min(desired, window.innerWidth - width - EDGE));
    setLeft(clamped - origin);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-place when a different menu opens
  }, [value]);

  return (
    <li className="list-none">
      <NavigationMenu.Root value={value} onValueChange={setValue} delayDuration={80} skipDelayDuration={300}>
        <NavigationMenu.List className="flex items-center gap-2 text-sm">
          <NavigationMenu.Item value="tools">
            <NavigationMenu.Trigger
              ref={(el) => {
                triggers.current.tools = el;
              }}
              className={cn(triggerClass, onTools && 'text-fd-primary')}
            >
              Tools
              <ChevronDown
                aria-hidden
                className="size-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180"
              />
            </NavigationMenu.Trigger>
            <NavigationMenu.Content className={contentClass}>
              <ToolsPanel />
            </NavigationMenu.Content>
          </NavigationMenu.Item>
          <TopLink href="/blog">Blog</TopLink>
          <TopLink href="/pricing">Pricing</TopLink>
          <NavigationMenu.Item value="more">
            <NavigationMenu.Trigger
              ref={(el) => {
                triggers.current.more = el;
              }}
              className={triggerClass}
            >
              More
              <ChevronDown
                aria-hidden
                className="size-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180"
              />
            </NavigationMenu.Trigger>
            <NavigationMenu.Content className={contentClass}>
              <MorePanel />
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>

        {/* Sized to whichever panel is open, and slid between the two triggers. */}
        <div
          ref={anchor}
          style={{ left: left ?? 0 }}
          className={cn('pointer-events-none fixed top-14 z-50', slide && 'nav-menu-anchor')}
        >
          <NavigationMenu.Viewport className="nav-menu-viewport pointer-events-auto relative mt-1 h-(--radix-navigation-menu-viewport-height) w-(--radix-navigation-menu-viewport-width) overflow-hidden rounded-xl border border-fd-border bg-fd-popover text-fd-popover-foreground shadow-2xl shadow-black/20" />
        </div>
      </NavigationMenu.Root>
    </li>
  );
}
