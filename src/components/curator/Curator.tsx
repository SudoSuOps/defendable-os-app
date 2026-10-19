'use client';

import { useEffect, useReducer, useState } from 'react';
import { CUR_ACTIVE_DOMAINS, CUR_DOMAINS, CUR_INITIAL, CUR_STEPS, CUR_TEXT, FACT_TIERS, curBlocked, curHash, curReduce, curRecord } from '@/lib/demo/curator';
import { LIN, LIN_EDGES } from '@/lib/demo/content';
import { Button, DemoTag, Eyebrow, MonoLabel, Section, cx } from '@/components/ui';

const TIER_TONE = { pass: 'text-pass', gold: 'text-gold2', review: 'text-review' } as const;

export function Curator({ demoLabels = true }: { demoLabels?: boolean }) {
  const [s, dispatch] = useReducer(curReduce, CUR_INITIAL);
  const [hash, setHash] = useState('…');
  const record = curRecord(s);
  const key = JSON.stringify([s.stage, s.corrupt, s.approved, s.schema?.ok ?? null]);

  useEffect(() => {
    let live = true;
    void curHash(s).then((h) => live && setHash(h));
    return () => {
      live = false;
    };
    // `key` captures every field that feeds the record.
  }, [key]);

  const done = s.stage >= 9;
  const blocked = curBlocked(s);
  const showTiers = s.stage >= 3 && !s.corrupt;
  const sch = s.schema;
  const domains = s.stage >= 5 ? CUR_ACTIVE_DOMAINS : [];
  const tierText = (t: (typeof FACT_TIERS)[number]) => (typeof t.text === 'function' ? t.text() : t.text);

  return (
    <Section id="curator" label="Dataset curator">
      <Eyebrow>04 / DATASET CURATOR</Eyebrow>
      <h2 className="mt-4 max-w-[960px] text-balance font-display text-[clamp(36px,5.2vw,68px)] font-semibold leading-[1.02] tracking-[-0.03em]">Raw information is not trusted intelligence.</h2>
      <p className="mt-5 max-w-[620px] text-[18px] leading-[1.55] text-fg2">Transform source material into structured, traceable, testable datasets.</p>

      <div className="mt-10 flex flex-wrap gap-2">
        {CUR_DOMAINS.map((d) => {
          const on = domains.includes(d);
          return (
            <span key={d} className={cx('rounded-full border px-3 py-1.5 font-mono text-[12px]', on ? 'border-gold text-gold2' : 'border-hair text-fg2')}>
              {d}
            </span>
          );
        })}
      </div>

      <div className="mt-6 overflow-hidden rounded-[14px] border border-hair bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hair px-5 py-3.5">
          <div className="font-mono text-[12px] tracking-[0.1em] text-fg2">CURATOR CONSOLE · LEASE RECORD · UNIT 4B</div>
          {demoLabels && <DemoTag>DEMONSTRATION RECORD</DemoTag>}
        </div>
        <div className="overflow-x-auto border-b border-hair">
          <ol aria-label="Dataset pipeline" className="m-0 flex w-max min-w-full list-none gap-1.5 px-5 py-4">
            {CUR_STEPS.map((label, i) => {
              const on = i === s.stage;
              const past = i < s.stage;
              return (
                <li key={label} className="flex items-center gap-1.5">
                  <span
                    aria-current={on ? 'step' : undefined}
                    className={cx(
                      'rounded-md border px-2.5 py-[7px] font-mono text-[11px] tracking-[0.08em]',
                      on ? 'border-gold bg-[rgba(214,170,84,0.10)] text-gold2' : past ? 'border-div2 text-fg' : 'border-hair text-mute',
                    )}
                  >
                    {label}
                  </span>
                  <span aria-hidden="true" className="text-[12px] text-dash">
                    {i < 9 ? '→' : ''}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,440px),1fr))]">
          <div className="grid content-start gap-4 border-hair p-6 md:border-r">
            <div>
              <div className="font-mono text-[11px] tracking-[0.12em] text-gold">
                STEP {String(s.stage + 1).padStart(2, '0')} / 10 · {CUR_STEPS[s.stage]}
              </div>
              <p className="mt-2 text-[15px] leading-[1.55] text-fg">{CUR_TEXT[s.stage]}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="gold" disabled={blocked} onClick={() => dispatch({ type: 'advance' })}>
                {done ? 'Pipeline complete' : `Advance to ${CUR_STEPS[s.stage + 1]}`}
              </Button>
              <Button onClick={() => dispatch({ type: 'runSchema' })}>Run schema check</Button>
              {s.stage === 8 && !s.approved && (
                <Button variant="approve" onClick={() => dispatch({ type: 'approve' })}>
                  Record reviewer approval (demo)
                </Button>
              )}
              <Button variant="ghost" onClick={() => dispatch({ type: 'reset' })}>
                Reset
              </Button>
            </div>
            <label className="flex cursor-pointer items-center gap-2.5 text-[14px] text-fg2">
              <input type="checkbox" checked={s.corrupt} onChange={() => dispatch({ type: 'toggleCorrupt' })} className="h-[18px] w-[18px] accent-fail" />
              Inject corrupted source values (negative area, impossible date)
            </label>
            {s.halt && (
              <div role="alert" className="rounded-lg border border-fail bg-[rgba(241,108,108,0.06)] px-3.5 py-3 text-[14px] text-fail">
                {s.halt}
              </div>
            )}
            {sch && (
              <div className="overflow-hidden rounded-[10px] border border-hair">
                <div className="flex justify-between border-b border-hair px-3.5 py-2.5 font-mono text-[11px] tracking-[0.1em] text-mute">
                  <span>SCHEMA lease-record@2.1</span>
                  <span className={sch.ok ? 'text-pass' : 'text-fail'}>
                    {sch.rows.filter((r) => r.ok).length}/{sch.rows.length} {sch.ok ? 'PASS' : 'FAIL'}
                  </span>
                </div>
                {sch.rows.map((r) => (
                  <div key={r.rule} className="grid gap-3 border-b border-div px-3.5 py-[9px] font-mono text-[12px] [grid-template-columns:1fr_auto]">
                    <span className="text-fg2">{r.rule}</span>
                    <span className={cx('font-semibold', r.ok ? 'text-pass' : 'text-fail')}>{r.ok ? 'PASS' : 'FAIL'}</span>
                  </div>
                ))}
              </div>
            )}
            {showTiers && (
              <div className="grid gap-2">
                {FACT_TIERS.map((t) => (
                  <div key={t.kind} className="rounded-[10px] border border-hair bg-inset px-3.5 py-3">
                    <div className="flex justify-between gap-2 font-mono text-[11px] tracking-[0.1em]">
                      <span className={TIER_TONE[t.tone]}>{t.kind}</span>
                      <span className="text-mute">{t.basis}</span>
                    </div>
                    <div className="mt-1.5 text-[14px] leading-[1.5] text-fg">{tierText(t)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid min-w-0 [grid-template-rows:auto_1fr_auto]">
            <MonoLabel className="border-b border-hair px-5 py-3 tracking-[0.1em]">RECORD STATE · CANONICAL JSON</MonoLabel>
            <pre className="m-0 max-h-[520px] overflow-auto bg-inset2 p-5 font-mono text-[12.5px] leading-[1.6] text-fg">{JSON.stringify(record, null, 2)}</pre>
            <div className="break-all border-t border-hair px-5 py-3 font-mono text-[11.5px] text-fg2">
              content_sha256 <span className="text-gold2">{hash}</span>
            </div>
          </div>
        </div>
      </div>

      <Lineage />
    </Section>
  );
}

function Lineage() {
  const [idx, setIdx] = useState(2);
  const sel = LIN[idx]!;
  const aria =
    'Lineage graph. Sources EV-RR-2026Q2 and EV-T12-2026. Record DS-CRE-LSE-0042 revision 3 derives from the rent roll and revision 2. It produces calculation CALC-RENT-0042 and feeds dataset release COLDCHAIN v2.1, which also uses the T-12 statement.';
  return (
    <div className="mt-6 overflow-hidden rounded-[14px] border border-hair bg-surface">
      <div className="border-b border-hair px-5 py-3.5 font-mono text-[12px] tracking-[0.1em] text-fg2">EVIDENCE LINEAGE · SELECT A NODE</div>
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,520px),1fr))]">
        <div className="overflow-x-auto border-hair p-5 md:border-r">
          <svg viewBox="0 0 760 300" role="img" aria-label={aria} className="block h-auto w-full min-w-[560px]">
            {LIN_EDGES.map(([a, b, vert]) => {
              const A = LIN[a]!;
              const B = LIN[b]!;
              const hot = a === idx || b === idx;
              const d = vert
                ? `M${A.x + 98},${A.y} L${B.x + 98},${B.y + 60}`
                : `M${A.x + 196},${A.y + 30} C${A.x + 226},${A.y + 30} ${B.x - 30},${B.y + 30} ${B.x},${B.y + 30}`;
              return <path key={`${a}-${b}`} d={d} fill="none" stroke={hot ? '#D6AA54' : '#3A4350'} strokeWidth={1.25} strokeDasharray={vert ? '4 4' : undefined} />;
            })}
            {LIN.map((n, i) => {
              const on = i === idx;
              return (
                <g key={n.id} onClick={() => setIdx(i)} style={{ cursor: 'pointer' }}>
                  <rect x={n.x} y={n.y} width={196} height={60} rx={8} fill={on ? 'rgba(214,170,84,0.10)' : '#0D1013'} stroke={on ? '#D6AA54' : '#29313B'} strokeWidth={1} />
                  <text x={n.x + 14} y={n.y + 25} fill="#F3F5F7" fontSize={12} fontFamily="var(--font-plex), monospace">
                    {n.id}
                  </text>
                  <text x={n.x + 14} y={n.y + 44} fill={on ? '#F0C878' : '#9AA5B1'} fontSize={12} fontFamily="var(--font-inter), sans-serif">
                    {n.sub}
                  </text>
                </g>
              );
            })}
            {[['SOURCES', 28], ['RECORDS', 282], ['DERIVATIVES', 552]].map(([t, x]) => (
              <text key={t} x={x} y={290} fill="#8493A5" fontSize={11} letterSpacing="0.1em" fontFamily="var(--font-plex), monospace">
                {t}
              </text>
            ))}
          </svg>
        </div>
        <div className="grid content-start gap-4 p-5">
          <div role="group" aria-label="Lineage nodes" className="flex flex-wrap gap-1.5">
            {LIN.map((n, i) => (
              <button
                key={n.id}
                type="button"
                aria-pressed={i === idx}
                onClick={() => setIdx(i)}
                className={cx('cursor-pointer rounded-md border bg-transparent px-2.5 py-[7px] font-mono text-[11px] text-fg', i === idx ? 'border-gold' : 'border-hair')}
              >
                {n.id}
              </button>
            ))}
          </div>
          <div aria-live="polite">
            <div className="font-mono text-[13px] text-gold2">{sel.id}</div>
            <div className="mt-1.5 text-[15px] text-fg">{sel.title}</div>
            <dl className="m-0 mt-3.5 grid gap-2.5">
              {sel.rows.map(([k, v]) => (
                <div key={k} className="grid gap-3 text-[13px] [grid-template-columns:120px_1fr]">
                  <dt className="pt-0.5 font-mono text-[11px] tracking-[0.08em] text-mute">{k}</dt>
                  <dd className="m-0 leading-[1.5] text-fg2">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
