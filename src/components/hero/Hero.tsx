'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { HERO_MODULES } from '@/lib/demo/content';
import { useReducedMotion } from '@/state/providers';
import { Button, cx } from '@/components/ui';

const EngineCanvas = dynamic(() => import('./EngineCanvas'), { ssr: false, loading: () => <div className="h-full w-full" aria-hidden="true" /> });

export function Hero() {
  const rm = useReducedMotion();
  const [stage, setStage] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto || rm) return;
    const t = setInterval(() => setStage((s) => (s + 1) % 5), 2600);
    return () => clearInterval(t);
  }, [auto, rm]);

  const [name, text] = HERO_MODULES[stage] ?? HERO_MODULES[0]!;
  const aria = `Five-layer Defendable Engine: Ingest, Curate, Execute, Verify, Prove. Data packets descend through each layer to a receipt. Currently highlighted: ${name}.`;
  const motionOn = auto && !rm;

  return (
    <section
      id="top"
      aria-label="Hero"
      className="relative overflow-hidden px-[clamp(20px,4vw,48px)] pb-[clamp(56px,7vw,96px)] pt-[clamp(48px,7vw,96px)] [background:radial-gradient(ellipse_60%_50%_at_70%_40%,rgba(214,170,84,0.07),transparent_70%)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.55] [background-image:linear-gradient(#11151A_1px,transparent_1px),linear-gradient(90deg,#11151A_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_60%_40%,#000_20%,transparent_75%)]"
      />
      <div className="relative mx-auto grid max-w-[1360px] items-center gap-[clamp(32px,5vw,72px)] [grid-template-columns:repeat(auto-fit,minmax(min(100%,500px),1fr))]">
        <div>
          <div className="font-mono text-[12px] tracking-[0.18em] text-gold">SOVEREIGN AI VERIFICATION INFRASTRUCTURE</div>
          <h1 className="mt-6 text-balance font-display text-[clamp(44px,6.4vw,92px)] font-bold leading-[0.98] tracking-[-0.035em]">
            <span className="block text-fg">AI makes the claim.</span>
            <span className="block text-ti">
              Defendable demands <span className="text-gold2">the proof.</span>
            </span>
          </h1>
          <p className="mt-7 max-w-[560px] text-pretty text-[clamp(17px,1.4vw,20px)] leading-[1.55] text-fg2">
            DefendableOS turns agent execution, proprietary datasets, mathematical verification, and human oversight into portable proof.
          </p>
          <p className="mt-4 max-w-[560px] text-[clamp(17px,1.4vw,20px)] leading-[1.55] text-fg">
            Not another AI model.
            <br />
            The infrastructure for knowing what your AI actually did.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button href="#engine" variant="gold" size="lg" className="font-semibold">
              Explore the Engine
            </Button>
            <Button href="#validator" variant="outline" size="lg">
              Validate the Validator
            </Button>
          </div>
          <div className="mt-7 font-mono text-[13px] tracking-[0.04em] text-fg2">Evidence → Execution → Verification → Verdict → Receipt</div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-hair [background:linear-gradient(180deg,#0B0E11,#07090B)]">
          <div className="flex items-center justify-between border-b border-hair px-4 py-3 font-mono text-[11px] tracking-[0.12em] text-fg2">
            <span>DEFENDABLE ENGINE · MODEL VIEW</span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              DEMO SEQUENCE
            </span>
          </div>
          <div role="img" aria-label={aria} className="flex h-[clamp(380px,46vw,560px)] flex-col">
            <EngineCanvas stage={stage} paused={!motionOn} reducedMotion={rm} />
          </div>
          <div className="grid gap-3 border-t border-hair px-4 py-3.5">
            <div role="group" aria-label="Engine modules" className="grid grid-cols-5 gap-1.5">
              {HERO_MODULES.map(([label], i) => {
                const on = i === stage;
                return (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      setStage(i);
                      setAuto(false);
                    }}
                    className={cx(
                      'min-h-10 cursor-pointer rounded-md border px-1 py-[9px] font-mono text-[11px] tracking-[0.08em]',
                      on ? 'border-gold bg-[rgba(214,170,84,0.12)] text-gold2' : 'border-hair bg-transparent text-fg2',
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div aria-live="polite" className="font-mono text-[12px] text-fg">
                <span className="text-gold">STATE 0{stage + 1}/05</span> · {name} — {text}
              </div>
              <button
                type="button"
                onClick={() => setAuto((a) => !a)}
                className="cursor-pointer rounded-md border border-hair bg-transparent px-2.5 py-1.5 font-mono text-[11px] text-fg2 hover:text-fg"
              >
                {auto ? 'Hold sequence' : 'Resume sequence'}
              </button>
            </div>
            <div className="text-[12px] text-mute">Deterministic demonstration sequence. Not live system telemetry.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
