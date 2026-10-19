import { EDGE_NODES, EDGE_OPTIONS } from '@/lib/demo/content';
import { Eyebrow, Section, cx } from '@/components/ui';

export function EdgeSection() {
  return (
    <Section id="edge" alt label="Sovereign edge">
      <Eyebrow>08 / SOVEREIGN EDGE INFRASTRUCTURE</Eyebrow>
      <h2 className="mt-4 text-balance font-display text-[clamp(36px,5.2vw,68px)] font-semibold leading-[1.02] tracking-[-0.03em]">Your data. Your node. Your authority.</h2>
      <ol aria-label="Deployment architecture" className="m-0 mt-12 grid list-none gap-3 p-0 [grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr))]">
        {EDGE_NODES.map((n) => {
          const onSite = n.loc === 'ON-SITE';
          return (
            <li key={n.n} className={cx('relative grid content-start gap-3 rounded-xl border bg-surface p-5', onSite ? 'border-div2' : 'border-hair')}>
              <div className="flex justify-between font-mono text-[11px] tracking-[0.1em] text-mute">
                <span>{n.n}</span>
                <span className={onSite ? 'text-gold2' : 'text-mute'}>{n.loc}</span>
              </div>
              <div className="flex h-[72px] items-end rounded-lg border border-hair p-[8px_10px] font-mono text-[11px] text-ti [background:repeating-linear-gradient(90deg,#0D1013_0_10px,#11151A_10px_11px)]">{n.hw}</div>
              <div className="font-display text-[16px] font-semibold tracking-[0.02em]">{n.name}</div>
              <div className="text-[14px] leading-[1.55] text-fg2">{n.desc}</div>
            </li>
          );
        })}
      </ol>
      <div className="mt-8 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))]">
        <div className="rounded-xl border border-hair p-6">
          <div className="font-mono text-[11px] tracking-[0.12em] text-mute">DEPLOYMENT POSSIBILITIES</div>
          <ul className="m-0 mt-4 grid list-none gap-x-6 gap-y-2.5 p-0 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
            {EDGE_OPTIONS.map((o) => (
              <li key={o} className="flex items-baseline gap-2.5 text-[15px] text-fg">
                <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 -translate-y-0.5 bg-gold" />
                {o}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-hair bg-surface p-6">
          <div className="font-mono text-[11px] tracking-[0.12em] text-review">HARDWARE SCOPE</div>
          <p className="m-0 mt-3 text-[15px] leading-[1.6] text-fg2">
            A Jetson Orin Nano-class module handles capture, hashing, schema checks, and small-model inference at the edge. It does not run large language models. Compute-intensive workloads run on authorized remote Blackwell-class GPU infrastructure. What leaves the node depends on the controls configured and verified for each deployment.
          </p>
        </div>
      </div>
    </Section>
  );
}
