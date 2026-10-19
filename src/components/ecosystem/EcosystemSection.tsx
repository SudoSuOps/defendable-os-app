import { ECO_GROUPS } from '@/lib/demo/content';
import { Eyebrow, Section } from '@/components/ui';

/** Every product is PLANNED and unlinked until its domain is live and verified. */
export function EcosystemSection() {
  return (
    <Section id="ecosystem" label="Ecosystem">
      <Eyebrow>09 / DEFENDABLE ECOSYSTEM</Eyebrow>
      <h2 className="mt-4 text-balance font-display text-[clamp(36px,5.2vw,68px)] font-semibold leading-[1.02] tracking-[-0.03em]">One doctrine. Multiple infrastructure layers.</h2>
      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-gold p-6 [background:linear-gradient(180deg,rgba(214,170,84,0.06),transparent)]">
        <div>
          <div className="font-display text-[24px] font-semibold">DefendableOS</div>
          <div className="mt-1.5 text-[15px] text-fg2">Verification doctrine and execution proof</div>
        </div>
        <span className="rounded-[4px] border border-gold px-2 py-1 font-mono text-[11px] tracking-[0.1em] text-gold2">DEMONSTRATED ON THIS PAGE</span>
      </div>
      <div aria-hidden="true" className="ml-10 h-6 border-l border-dashed border-hair" />
      <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))]">
        {ECO_GROUPS.map((g) => (
          <div key={g.layer} className="overflow-hidden rounded-xl border border-hair bg-surface">
            <div className="border-b border-hair px-[18px] py-3 font-mono text-[11px] tracking-[0.12em] text-mute">{g.layer}</div>
            {g.items.map((i) => (
              <div key={i.name} className="grid gap-1 border-b border-div px-[18px] py-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-display text-[16px] font-semibold">{i.name}</span>
                  <span className="font-mono text-[10.5px] tracking-[0.08em] text-mute">PLANNED</span>
                </div>
                <div className="text-[14px] leading-[1.5] text-fg2">{i.desc}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <p className="m-0 mt-4 text-[13px] text-mute">Planned components are architecture, not shipped capabilities. Links will be added once each destination is live and verified.</p>
    </Section>
  );
}
