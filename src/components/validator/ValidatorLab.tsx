'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LAB_DISTINCTIONS } from '@/lib/demo/content';
import { runScenario, type LabRun } from '@/lib/demo/lab';
import { SCENARIOS } from '@/lib/demo/scenarios';
import { PIN } from '@/lib/verification/validator';
import { Eyebrow, Section, StatusBadge, TONE_BORDER, TONE_TEXT, cx, verdictTone, type Tone } from '@/components/ui';
import { useReducedMotion } from '@/state/providers';

const sym = (op: 'mul' | 'div') => (op === 'mul' ? '×' : '÷');

interface Row {
  n: string;
  k: string;
  body: string;
  sub: string;
  badge: string;
  tone: Tone;
  /** Neutral badges (subject/fixture) keep the hairline border. */
  neutral?: boolean;
}

function buildRows(L: LabRun): Row[] {
  const c = L.sc.c;
  const check = `exact: |${c.r} − ${c.a} ${sym(c.op)} ${c.b}| ≤ ½ unit of stated precision → ${L.holds ? 'holds' : 'does not hold'}`;
  let checkSub = 'Exact decimal arithmetic by BigInt cross-multiplication. Deterministic, not heuristic.';
  if (L.missing.length) checkSub = `Evidence resolution: ${L.missing.join(', ')} not found in store. ` + checkSub;
  if (L.rec) checkSub = `Record integrity: stored sha256 ${L.rec.h1.slice(0, 16)}… vs recomputed ${L.rec.h2.slice(0, 16)}… → ${L.rec.h1 === L.rec.h2 ? 'match' : 'MISMATCH'}. ` + checkSub;
  const metaBody = L.consistent
    ? `Validator agrees with the fixture and the oracle. Canaries ${4 - L.mism}/4 matched.`
    : `Validator returned ${L.v.verdict}; fixture expects ${L.sc.expected}. Canaries ${4 - L.mism}/4 matched.`;
  return [
    { n: '01', k: 'SUBMITTED CLAIM', body: L.sc.claim, sub: `${c.a} ${sym(c.op)} ${c.b} = ${c.r} · evidence [${c.evidence.join(', ')}]`, badge: 'SUBJECT', tone: 'ti', neutral: true },
    { n: '02', k: 'GROUND-TRUTH FIXTURE', body: `Expected classification: ${L.sc.expected}`, sub: `${L.sc.why} Exact value ${L.ex.approx ? '≈ ' : ''}${L.ex.v}.`, badge: 'FIXTURE', tone: 'ti', neutral: true },
    { n: '03', k: 'DETERMINISTIC CHECK', body: check, sub: checkSub, badge: L.holds ? 'HOLDS' : 'REJECTS', tone: L.holds ? 'pass' : 'fail' },
    { n: '04', k: 'VALIDATOR RESPONSE', body: `${L.sc.ver.id} → ${L.v.verdict}`, sub: L.v.note, badge: L.v.verdict, tone: verdictTone(L.v.verdict) },
    { n: '05', k: 'INDEPENDENT VERIFICATION', body: metaBody, sub: L.drift ? `Version drift: Flightsheet pins ${PIN}, observed ${L.sc.ver.id}.` : `Pinned version ${PIN} confirmed.`, badge: L.consistent ? 'CONSISTENT' : 'FAILED', tone: L.consistent ? 'pass' : 'fail' },
    { n: '06', k: 'FINAL TECHNICAL CLASSIFICATION', body: L.final, sub: 'System classification only. Human approval: PENDING.', badge: L.final, tone: verdictTone(L.final) },
  ];
}

export function ValidatorLab({ demoLabels = true }: { demoLabels?: boolean }) {
  const rm = useReducedMotion();
  const [idx, setIdx] = useState(4);
  const [lab, setLab] = useState<LabRun | null>(null);
  const [step, setStep] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const seq = useRef(0);

  const run = useCallback(
    async (i: number) => {
      const my = ++seq.current;
      const r = await runScenario(i);
      if (my !== seq.current) return;
      if (timer.current) clearInterval(timer.current);
      setIdx(i);
      setLab(r);
      if (rm) {
        setStep(6);
        return;
      }
      setStep(0);
      timer.current = setInterval(() => {
        setStep((s) => {
          if (s >= 6) {
            if (timer.current) clearInterval(timer.current);
            return s;
          }
          return s + 1;
        });
      }, 380);
    },
    [rm],
  );

  useEffect(() => {
    void run(4);
    return () => {
      seq.current++;
      if (timer.current) clearInterval(timer.current);
    };
    // Initial scenario only; later runs come from user actions.
  }, []);

  const rows = lab ? buildRows(lab) : [];
  const vStatus = lab ? (step >= 4 ? (step >= 5 && !lab.consistent ? 'FAILED' : lab.v.verdict) : '—') : '—';
  const mStatus = lab ? (step >= 5 ? (lab.consistent ? 'CONSISTENT' : 'FLAGGED') : '—') : '—';
  const entities = lab
    ? [
        { name: 'SUBJECT', desc: 'The model, agent, dataset, or output being evaluated.', id: `claim · scenario ${lab.sc.key}`, status: step >= 6 ? lab.final : 'UNDER TEST', tone: (step >= 6 ? verdictTone(lab.final) : 'ti') as Tone, alert: false },
        { name: 'VALIDATOR', desc: 'Runs checks against predefined evidence, formulas, schemas, and rules.', id: lab.sc.ver.id, status: vStatus, tone: (vStatus === 'FAILED' ? 'fail' : vStatus === '—' ? 'ti' : verdictTone(vStatus)) as Tone, alert: vStatus === 'FAILED' },
        { name: 'META-VALIDATOR', desc: 'Independently tests whether the validator itself behaves correctly.', id: 'oracle: exact-decimal · canaries ×4', status: mStatus, tone: (mStatus === 'FLAGGED' ? 'fail' : mStatus === 'CONSISTENT' ? 'pass' : 'ti') as Tone, alert: mStatus === 'FLAGGED' },
      ]
    : [];
  const failedCanaries = lab ? lab.canaries.filter((x) => !x.match).map((x) => `${x.id} (${x.label})`).join(', ') : '';
  const discovery =
    lab && lab.final === 'VALIDATOR FAILURE' && step >= 6
      ? `${lab.sc.ver.id} approved a claim the exact oracle rejects: ${lab.sc.c.r} versus an exact value of ${lab.ex.v}. Its tolerance of ${(lab.sc.ver.relTol * 100).toFixed(0)}% lets a 4.00% error through.${failedCanaries ? ` It also passed canary ${failedCanaries}.` : ''} The validator's PASS is discarded and the run is classified VALIDATOR FAILURE.`
      : '';

  return (
    <Section id="validator" label="Validate the validator" className="[background:radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(214,170,84,0.06),transparent_70%),#07090B]">
      <Eyebrow>05 / VALIDATE THE VALIDATOR</Eyebrow>
      <h2 className="mt-4 max-w-[1000px] font-display text-[clamp(40px,6.4vw,88px)] font-bold leading-[0.98] tracking-[-0.035em]">Who validates the validator?</h2>
      <p className="mt-6 max-w-[640px] text-[clamp(17px,1.5vw,20px)] leading-[1.55] text-fg2">A passing grade means nothing if the grading system cannot be tested.</p>

      <div className="mt-12 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))]">
        {entities.map((e) => (
          <div key={e.name} className={cx('grid gap-2.5 rounded-xl border bg-surface p-5 transition-colors duration-200', e.alert ? 'border-fail' : 'border-hair')}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[12px] font-semibold tracking-[0.14em] text-fg">{e.name}</span>
              <StatusBadge tone={e.tone}>{e.status}</StatusBadge>
            </div>
            <div className="text-[14px] leading-[1.5] text-fg2">{e.desc}</div>
            <div className="font-mono text-[12px] text-ti">{e.id}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid items-start gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))]">
        <div role="radiogroup" aria-label="Test scenarios" className="grid gap-2">
          {SCENARIOS.map((sc, i) => {
            const on = i === idx;
            return (
              <button
                key={sc.key}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => void run(i)}
                className={cx('grid cursor-pointer gap-1.5 rounded-[10px] border p-4 text-left text-fg hover:border-ti', on ? 'border-gold bg-[rgba(214,170,84,0.08)]' : 'border-hair bg-surface')}
              >
                <span className={cx('font-mono text-[11px] tracking-[0.12em]', on ? 'text-gold2' : 'text-mute')}>SCENARIO {sc.key}</span>
                <span className="text-[15px] font-medium leading-[1.35]">{sc.title}</span>
              </button>
            );
          })}
          {demoLabels && <div className="px-0.5 py-1 text-[12px] leading-[1.5] text-mute">All scenarios use demonstration fixtures. Arithmetic, hashing, and classification execute in your browser on every run.</div>}
        </div>

        <div className="min-w-0 overflow-hidden rounded-[14px] border border-hair bg-surface md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-hair px-5 py-3.5">
            <span className="font-mono text-[12px] tracking-[0.1em] text-fg2">VERIFICATION LAB · SCENARIO {SCENARIOS[idx]?.key}</span>
            <button type="button" onClick={() => void run(idx)} className="cursor-pointer rounded-md border-none bg-gold px-3.5 py-2 text-[13px] font-semibold text-canvas hover:bg-gold2">
              Run again
            </button>
          </div>
          <ol aria-live="polite" className="m-0 list-none p-0">
            {rows.map((r, i) => (
              <li
                key={r.n}
                style={{ opacity: step >= i + 1 ? 1 : 0.12 }}
                className="grid gap-x-4 gap-y-2 border-b border-div px-5 py-[18px] transition-opacity duration-[220ms] ease-def [grid-template-columns:28px_minmax(0,1fr)] sm:[grid-template-columns:44px_minmax(0,1fr)_auto]"
              >
                <span className="pt-0.5 font-mono text-[12px] text-gold">{r.n}</span>
                <div className="min-w-0">
                  <div className="font-mono text-[11px] tracking-[0.12em] text-mute">{r.k}</div>
                  <div className="mt-1.5 break-words text-[15px] leading-[1.5] text-fg">{r.body}</div>
                  <div className="mt-1.5 break-words font-mono text-[12px] leading-[1.55] text-fg2">{r.sub}</div>
                </div>
                <span className={cx('col-start-2 self-start justify-self-start whitespace-nowrap rounded-[4px] border px-2 py-1 font-mono text-[11px] font-semibold sm:col-start-3', TONE_TEXT[r.tone], r.neutral ? 'border-hair' : TONE_BORDER[r.tone])}>{r.badge}</span>
              </li>
            ))}
          </ol>
          {lab && step >= 5 && (
            <div className="border-b border-div px-5 py-4">
              <div className="font-mono text-[11px] tracking-[0.12em] text-mute">META-VALIDATOR CANARY SUITE · EXPECTED OUTCOMES DEFINED INDEPENDENTLY</div>
              <div className="mt-2.5 grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
                {lab.canaries.map((c) => (
                  <div key={c.id} className={cx('rounded-lg border px-3 py-2.5 font-mono text-[11.5px] leading-[1.55]', c.match ? 'border-hair' : 'border-fail')}>
                    <div className="text-fg">
                      {c.id} · {c.label}
                    </div>
                    <div className="text-fg2">expected {c.expected}</div>
                    <div className={c.match ? 'text-pass' : 'text-fail'}>returned {c.got}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {discovery && (
            <div role="alert" className="m-5 grid gap-2 rounded-xl border border-fail bg-[rgba(241,108,108,0.07)] p-5">
              <div className="font-mono text-[12px] font-semibold tracking-[0.14em] text-fail">FALSE APPROVAL DETECTED · VALIDATOR FAILED</div>
              <div className="text-[15px] leading-[1.55] text-fg">{discovery}</div>
            </div>
          )}
          <div className="break-all px-5 py-4 font-mono text-[11.5px] text-fg2">
            result_sha256 <span className="text-gold2">{lab?.hash ?? '…'}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-px overflow-hidden rounded-xl border border-hair bg-hair [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))]">
        {LAB_DISTINCTIONS.map((d) => (
          <div key={d.t} className="bg-inset p-5">
            <div className="font-display text-[16px] font-semibold text-fg">{d.t}</div>
            <div className="mt-2 text-[14px] leading-[1.55] text-fg2">{d.b}</div>
          </div>
        ))}
      </div>
      <p className="mt-16 font-display text-[clamp(28px,3.6vw,48px)] font-semibold leading-[1.1] tracking-[-0.025em] text-fg">
        Even the validator must <span className="text-gold2">produce evidence.</span>
      </p>
    </Section>
  );
}
