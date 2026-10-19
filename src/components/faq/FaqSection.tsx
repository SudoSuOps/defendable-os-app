import { FAQS } from '@/lib/seo/faq';
import { Eyebrow, Section } from '@/components/ui';

/**
 * Server-rendered, native <details>: every answer is in the HTML for crawlers and answer engines, and it needs no JavaScript.
 * The text comes from src/lib/seo/faq.ts, the same source as the FAQPage JSON-LD and llms.txt.
 */
export function FaqSection() {
  return (
    <Section id="faq" label="Frequently asked questions">
      <div className="grid gap-[clamp(32px,5vw,72px)] [grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr))]">
        <div>
          <Eyebrow>11 / QUESTIONS</Eyebrow>
          <h2 className="mt-4 text-balance font-display text-[clamp(36px,5.2vw,68px)] font-semibold leading-[1.02] tracking-[-0.03em]">Questions, answered plainly.</h2>
          <p className="mt-5 max-w-[460px] text-[18px] leading-[1.55] text-fg2">What DefendableOS is, what it proves, and what it does not claim.</p>
        </div>
        <div className="md:col-span-1">
          {FAQS.map((f, i) => (
            <details key={f.id} id={f.id} open={i === 0} className="group border-b border-hair py-1 first:border-t">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-left font-display text-[clamp(18px,1.6vw,21px)] font-semibold leading-[1.3] tracking-[-0.01em] text-fg marker:content-none [&::-webkit-details-marker]:hidden">
                <span>{f.q}</span>
                <span aria-hidden="true" className="mt-1 shrink-0 font-mono text-[18px] leading-none text-gold transition-transform duration-150 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="m-0 max-w-[760px] pb-6 pr-8 text-[16px] leading-[1.65] text-fg2">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
