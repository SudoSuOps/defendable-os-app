'use client';

import { useState } from 'react';
import { ENG } from '@/lib/demo/content';
import { Eyebrow, Section, SegmentedTabs, cx } from '@/components/ui';

export function EngineSection({ defaultMode = 'operator' }: { defaultMode?: 'operator' | 'engineer' }) {
  const [idx, setIdx] = useState(4);
  const [mode, setMode] = useState<'operator' | 'engineer'>(defaultMode);
  const st = ENG[idx]!;
  const fields: [string, string][] =
    mode === 'operator'
      ? [['OUTPUT ARTIFACTS', st.outputs], ['POSSIBLE FAILURE STATES', st.fail], ['SOURCE / VALIDATION REQUIREMENT', st.req], ['REQUIRED INPUTS', st.inputs], ['EXECUTED OPERATIONS', st.ops]]
      : [['REQUIRED INPUTS', st.inputs], ['EXECUTED OPERATIONS', st.ops], ['OUTPUT ARTIFACTS', st.outputs], ['POSSIBLE FAILURE STATES', st.fail], ['VALIDATION REQUIREMENT', st.req]];

  return (
    <Section id="engine" alt label="Inside the engine">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>03 / THE DEFENDABLE ENGINE</Eyebrow>
          <h2 className="mt-4 font-display text-[clamp(36px,5.2vw,68px)] font-semibold leading-[1.02] tracking-[-0.03em]">Inside the Engine.</h2>
          <p className="mt-5 max-w-[620px] text-[18px] leading-[1.55] text-fg2">Every run follows a structured path from submitted evidence to a reviewable outcome.</p>
        </div>
        <SegmentedTabs
          label="View mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'operator', label: 'Operator View' },
            { value: 'engineer', label: 'Engineer View' },
          ]}
        />
      </div>

      <ol aria-label="Engine stages" className="m-0 mt-12 grid list-none gap-2 p-0 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
        {ENG.map((e, i) => {
          const on = i === idx;
          return (
            <li key={e.n} className="flex">
              <button
                type="button"
                aria-pressed={on}
                onClick={() => setIdx(i)}
                className={cx(
                  'grid min-h-24 flex-1 cursor-pointer gap-2.5 rounded-[10px] border p-[16px_14px] text-left text-fg hover:border-ti',
                  on ? 'border-gold bg-[rgba(214,170,84,0.10)]' : 'border-hair bg-surface',
                )}
              >
                <span className={cx('flex justify-between font-mono text-[11px] tracking-[0.1em]', on ? 'text-gold2' : 'text-mute')}>
                  <span>{e.n}</span>
                  <span aria-hidden="true">{i < 7 ? '→' : '■'}</span>
                </span>
                <span className="font-display text-[15px] font-semibold uppercase leading-[1.2] tracking-[0.02em]">{e.name}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div aria-live="polite" className="mt-4 grid rounded-[14px] border border-hair bg-surface [grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))]">
        <div className="border-hair p-[clamp(24px,3vw,40px)] md:border-r">
          <div className="font-mono text-[12px] tracking-[0.12em] text-gold">STAGE {st.n} / 08</div>
          <h3 className="mt-3 font-display text-[clamp(26px,3vw,38px)] font-semibold tracking-[-0.02em]">{st.name}</h3>
          <p className="mt-4 text-pretty text-[17px] leading-[1.55] text-fg">{st.purpose}</p>
          {mode === 'operator' ? (
            <p className="mt-4 text-[15px] leading-[1.55] text-gold2">{st.value}</p>
          ) : (
            <pre className="mt-5 overflow-x-auto whitespace-pre rounded-lg border border-hair bg-canvas p-4 font-mono text-[12.5px] leading-[1.65] text-fg">{st.code}</pre>
          )}
        </div>
        <dl className="m-0 grid [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
          {fields.map(([k, v]) => (
            <div key={k} className="border-b border-r border-div px-6 py-5">
              <dt className="font-mono text-[11px] tracking-[0.12em] text-mute">{k}</dt>
              <dd className={cx('m-0 mt-2 text-[14px] leading-[1.55]', k.includes('FAILURE') ? 'text-fg' : 'text-fg2')}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
