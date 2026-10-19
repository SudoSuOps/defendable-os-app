'use client';

import Image from 'next/image';
import { CONTACT_EMAIL, DOCTRINE, NAV_LINKS } from '@/lib/demo/content';
import { useDial } from '@/state/providers';

export function FooterNav() {
  const { openDial } = useDial();
  return (
    <footer id="contact" className="border-t border-hair px-[clamp(20px,4vw,48px)] pb-10 pt-14">
      <div className="mx-auto grid max-w-[1360px] gap-8 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
        <div className="grid content-start gap-2.5">
          <Image src="/brand/defendable-lockup.png" alt="Defendable" width={200} height={67} className="h-auto w-[200px]" />
          <div className="font-mono text-[12px] leading-[1.7] text-fg2">
            DefendableOS
            <br />
            Proof of Execution
            <br />
            Swarm &amp; Bee AI
          </div>
        </div>
        <nav aria-label="Footer" className="grid content-start gap-2">
          <div className="font-mono text-[11px] tracking-[0.12em] text-mute">SITE</div>
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-[14px] text-fg2 hover:text-fg">
              {l.full}
            </a>
          ))}
          <a href="#faq" className="text-[14px] text-fg2 hover:text-fg">
            Questions
          </a>
        </nav>
        <div className="grid content-start gap-2">
          <div className="font-mono text-[11px] tracking-[0.12em] text-mute">CONTACT</div>
          <button type="button" onClick={openDial} className="cursor-pointer justify-self-start border-none bg-transparent p-0 text-left text-[14px] text-gold2 hover:text-fg">
            Make the Dial →
          </button>
          <a href="https://x.com/defendableos" target="_blank" rel="noopener noreferrer" className="text-[14px] text-fg2 hover:text-fg">
            X · @defendableos ↗
          </a>
          <span className="text-[14px] text-fg2">Jupiter, Florida, USA</span>
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-[14px] text-fg2 hover:text-fg">
            {CONTACT_EMAIL}
          </a>
          <span className="text-[13px] text-mute">Privacy policy: pending publication</span>
        </div>
        <div className="grid content-start gap-2">
          <div className="font-mono text-[11px] tracking-[0.12em] text-mute">DOCTRINE</div>
          {DOCTRINE.map((d) => (
            <span key={d} className="text-[14px] text-fg2">
              {d}
            </span>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-[1360px] flex-wrap justify-between gap-3 border-t border-div pt-5 font-mono text-[11.5px] text-mute">
        <span>© 2026 Swarm &amp; Bee AI · defendableos.com</span>
        <span>DefendableOS provides technical evidence. It does not replace professional judgment or legal authority.</span>
      </div>
    </footer>
  );
}
