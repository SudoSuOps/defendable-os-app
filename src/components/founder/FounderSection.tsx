import { FOUNDER_PILLARS, FOUNDER_ROWS } from '@/lib/demo/content';
import { Eyebrow, Section } from '@/components/ui';

export function FounderSection() {
  return (
    <Section id="founder" alt label="Build philosophy">
      <div className="grid gap-[clamp(32px,5vw,72px)] [grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))]">
        <div>
          <Eyebrow>10 / BUILD PHILOSOPHY</Eyebrow>
          <h2 className="mt-4 text-balance font-display text-[clamp(36px,5.2vw,68px)] font-semibold leading-[1.02] tracking-[-0.03em]">Built from operations. Not slide decks.</h2>
          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-hair bg-hair">
            {FOUNDER_PILLARS.map((p) => (
              <div key={p} className="bg-surface p-5 font-display text-[18px] font-semibold">
                {p}
              </div>
            ))}
          </div>
        </div>
        <div className="grid content-start gap-5">
          <p className="m-0 text-pretty text-[clamp(18px,1.6vw,21px)] leading-[1.6] text-fg">
            DefendableOS was founded by an operator with three decades of commercial real estate experience and direct exposure to real-world data, underwriting, accountability, and execution.
          </p>
          <p className="m-0 text-[17px] leading-[1.6] text-fg2">
            The infrastructure is independently financed and developed with privately acquired GPU compute. That perspective shapes the product: real workflows, real evidence, executable verification, operator authority.
          </p>
          <div className="mt-2 grid gap-3.5 rounded-xl border border-hair bg-surface p-6">
            <div>
              <div className="font-display text-[22px] font-semibold">Donovan Mackey</div>
              <div className="mt-1 text-[14px] text-fg2">Founder &amp; Builder · Swarm &amp; Bee AI</div>
            </div>
            <dl className="m-0 grid gap-2.5">
              {FOUNDER_ROWS.map((r) => (
                <div key={r.k} className="grid gap-3 [grid-template-columns:110px_1fr]">
                  <dt className="pt-0.5 font-mono text-[11px] tracking-[0.08em] text-mute">{r.k}</dt>
                  <dd className="m-0 text-[14px] leading-[1.5] text-fg">{r.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </Section>
  );
}
