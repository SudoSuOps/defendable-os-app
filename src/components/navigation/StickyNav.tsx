'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { NAV_LINKS } from '@/lib/demo/content';
import { cx } from '@/components/ui';
import { useDial } from '@/state/providers';

/** Which nav section is under the reading line (about a third of the way down the viewport). */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-35% 0px -60% 0px' },
    );
    els.forEach((e) => io.observe(e));
    // Above the first section (hero) or past the last one, nothing is highlighted.
    const clear = () => {
      const first = els[0];
      if (first && first.getBoundingClientRect().top > window.innerHeight * 0.35) setActive(null);
    };
    window.addEventListener('scroll', clear, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', clear);
    };
  }, [ids]);
  return active;
}

const IDS = NAV_LINKS.map((l) => l.href.slice(1));

export function StickyNav() {
  const { openDial } = useDial();
  const active = useActiveSection(IDS);
  return (
    <header className="sticky top-0 z-50 border-b border-hair bg-[rgba(7,9,11,0.86)] px-[clamp(20px,4vw,48px)] backdrop-blur-[14px]">
      <nav aria-label="Primary" className="mx-auto flex max-w-[1360px] flex-wrap items-center gap-x-6 sm:h-16 sm:flex-nowrap">
        <a href="#top" aria-label="DefendableOS home" className="flex h-14 shrink-0 items-center gap-2.5 text-fg sm:h-auto">
          <Image src="/brand/defendable-shield.png" alt="" width={36} height={36} priority className="h-9 w-9 rounded-[4px] object-cover" />
          <span className="font-display text-[17px] font-semibold tracking-[0.02em]">
            Defendable<span className="text-gold">OS</span>
          </span>
        </a>
        <div className="order-last -mx-1 w-full min-w-0 overflow-x-auto pb-1.5 [scrollbar-width:none] sm:order-none sm:mx-0 sm:w-auto sm:flex-1 sm:pb-0">
          <div className="flex w-max gap-1 sm:ml-auto">
            {NAV_LINKS.map((l) => {
              const on = active === l.href.slice(1);
              return (
                <a
                  key={l.href}
                  href={l.href}
                  aria-current={on ? 'location' : undefined}
                  className={cx(
                    'whitespace-nowrap rounded-md px-2.5 py-2 font-mono text-[12px] tracking-[0.08em] transition-colors duration-150 hover:bg-surface hover:text-fg',
                    on ? 'bg-surface text-gold2' : 'text-fg2',
                  )}
                >
                  {l.label}
                </a>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          onClick={openDial}
          className="ml-auto shrink-0 cursor-pointer rounded-lg border border-hair bg-transparent px-3.5 py-[9px] text-[13px] font-medium text-fg hover:border-ti sm:ml-0"
        >
          Make the Dial
        </button>
      </nav>
    </header>
  );
}
