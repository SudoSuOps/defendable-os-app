import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = { title: 'Page not found — DefendableOS', robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-screen place-items-center px-[clamp(20px,4vw,48px)] py-24 text-center">
      <div className="grid justify-items-center gap-6">
        <Image src="/brand/defendable-shield.png" alt="" width={72} height={72} className="h-[72px] w-[72px] rounded-md object-cover" />
        <div className="font-mono text-[12px] tracking-[0.18em] text-gold">404 / NO EVIDENCE FOUND</div>
        <h1 className="m-0 max-w-[720px] text-balance font-display text-[clamp(36px,5.2vw,64px)] font-semibold leading-[1.05] tracking-[-0.03em]">That page does not exist.</h1>
        <p className="m-0 max-w-[480px] text-[17px] leading-[1.55] text-fg2">No evidence, no pass. Head back to the Engine and start from a page that does.</p>
        <a href="/" className="rounded-lg bg-gold px-6 py-[15px] text-[15px] font-semibold text-canvas hover:bg-gold2 hover:text-canvas">
          Back to DefendableOS
        </a>
      </div>
    </main>
  );
}
