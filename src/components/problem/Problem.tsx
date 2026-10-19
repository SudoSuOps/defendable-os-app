'use client';

import { useState } from 'react';
import { PROB_MISSING, PROB_ROWS } from '@/lib/demo/content';
import { DemoTag, Eyebrow, Section, SegmentedTabs, StatusBadge, verdictTone } from '@/components/ui';

export function Problem({ demoLabels = true }: { demoLabels?: boolean }) {
  const [mode, setMode] = useState<'ordinary' | 'defendable'>('ordinary');
  return (
    <Section id="problem" label="The problem">
      <Eyebrow>02 / THE PROBLEM</Eyebrow>
      <h2 className="mt-4 max-w-[900px] text-balance font-display text-[clamp(36px,5.2vw,68px)] font-semibold leading-[1.02] tracking-[-0.03em]">An AI answer is not evidence.</h2>
      <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
        <SegmentedTabs
          label="Output type"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'ordinary', label: 'Ordinary AI output' },
            { value: 'defendable', label: 'Defendable execution' },
          ]}
        />
        {demoLabels && <DemoTag>ILLUSTRATIVE EXAMPLE · NOT A REAL PROPERTY</DemoTag>}
      </div>

      <div className="mt-4 overflow-hidden rounded-[14px] border border-hair bg-surface">
        <div className="border-b border-hair px-5 py-3.5 font-mono text-[12px] text-fg2">PROMPT · &quot;Does 118 Harbor Logistics Center support the acquisition at $20M?&quot;</div>
        {mode === 'ordinary' ? (
          <div className="grid gap-7 p-[clamp(24px,4vw,48px)]">
            <p className="m-0 max-w-[880px] text-pretty text-[clamp(19px,2vw,26px)] leading-[1.5] text-fg">
              Based on the documents, the property supports a value of about $20 million at a 6.2% cap rate, and debt coverage is healthy at 2.3x. This looks like a strong acquisition.
            </p>
            <div className="grid gap-px overflow-hidden rounded-[10px] border border-hair bg-hair [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
              {PROB_MISSING.map((x) => (
                <div key={x.k} className="bg-inset p-4">
                  <div className="font-mono text-[11px] tracking-[0.1em] text-mute">{x.k}</div>
                  <div className="mt-1.5 font-mono text-[14px] text-fg2">{x.v}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <div className="min-w-[760px]">
                <div className="grid gap-4 border-b border-hair px-5 py-3 font-mono text-[11px] tracking-[0.1em] text-mute [grid-template-columns:1.4fr_1fr_1.3fr_150px]">
                  <span>ASSERTION</span>
                  <span>SOURCE REFERENCE</span>
                  <span>RULE · EXECUTED CHECK</span>
                  <span>RESULT</span>
                </div>
                {PROB_ROWS.map((r) => (
                  <div key={r.claim} className="grid items-start gap-4 border-b border-div px-5 py-4 [grid-template-columns:1.4fr_1fr_1.3fr_150px]">
                    <span className="text-[15px] leading-[1.45] text-fg">{r.claim}</span>
                    <span className="font-mono text-[12px] leading-[1.5] text-fg2">{r.src}</span>
                    <span className="font-mono text-[12px] leading-[1.5] text-fg2">{r.check}</span>
                    <StatusBadge tone={verdictTone(r.verdict)} className="justify-self-start text-[12px]">
                      {r.verdict}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-3 px-5 py-4 font-mono text-[12px] text-fg2">
              <span>PROVENANCE · RUN-DEMO-20261019-0007</span>
              <span>
                EVIDENCE RECEIPT · <a href="#receipt">receipt.json ↓</a>
              </span>
            </div>
          </>
        )}
      </div>
      <p className="mt-12 max-w-[900px] font-display text-[clamp(22px,2.4vw,32px)] font-medium leading-[1.3] tracking-[-0.015em] text-fg2">
        Confidence is a model behavior. <span className="text-fg">Proof is a system property.</span>
      </p>
    </Section>
  );
}
