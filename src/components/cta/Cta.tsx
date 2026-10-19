'use client';

import Image from 'next/image';
import { Button } from '@/components/ui';
import { useDial } from '@/state/providers';

export function Cta() {
  const { openDial } = useDial();
  return (
    <section
      id="cta"
      aria-label="Get started"
      className="border-t border-hair px-[clamp(20px,4vw,48px)] py-[clamp(88px,12vw,180px)] text-center [background:radial-gradient(ellipse_50%_60%_at_50%_100%,rgba(214,170,84,0.08),transparent_70%)]"
    >
      <div className="mx-auto grid max-w-[960px] justify-items-center gap-7">
        <Image src="/brand/defendable-shield.png" alt="Defendable shield mark" width={96} height={96} className="h-24 w-24 rounded-lg object-cover" />
        <h2 className="m-0 text-balance font-display text-[clamp(40px,6vw,84px)] font-bold leading-none tracking-[-0.035em]">
          If AI is doing the work, <span className="text-gold2">demand the proof.</span>
        </h2>
        <p className="m-0 max-w-[640px] text-[clamp(17px,1.5vw,20px)] leading-[1.55] text-fg2">
          Explore the Defendable Engine and see how executable verification can transform opaque AI output into reviewable evidence.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button href="#validator" variant="gold" size="lg" className="px-6 font-semibold">
            Validate the Validator
          </Button>
          <Button onClick={openDial} variant="outline" size="lg" className="px-6">
            Make the Dial
          </Button>
        </div>
      </div>
    </section>
  );
}
