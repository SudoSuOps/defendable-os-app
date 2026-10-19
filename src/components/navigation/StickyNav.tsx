'use client';

import Image from 'next/image';
import { NAV_LINKS } from '@/lib/demo/content';
import { useDial } from '@/state/providers';

export function StickyNav() {
  const { openDial } = useDial();
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
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="whitespace-nowrap rounded-md px-2.5 py-2 font-mono text-[12px] tracking-[0.08em] text-fg2 hover:bg-surface hover:text-fg">
                {l.label}
              </a>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={openDial}
          className="ml-auto shrink-0 cursor-pointer rounded-lg border border-hair bg-transparent px-3.5 py-[9px] sm:ml-0 text-[13px] font-medium text-fg hover:border-ti"
        >
          Make the Dial
        </button>
      </nav>
    </header>
  );
}
