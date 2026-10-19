'use client';

import { useState } from 'react';
import { FS } from '@/lib/demo/flightsheet';
import { Eyebrow, KV, Section, SegmentedTabs, StatusBadge, verdictTone } from '@/components/ui';
import { useDemo } from '@/state/providers';

const ROWS: [string, string][] = [
  ['TASK ID', FS.task_id],
  ['PURPOSE', FS.purpose],
  ['DOMAIN', FS.domain],
  ['INPUT REQUIREMENTS', 'loan_amount, interest_rate, noi_annual, claimed_debt_service, claimed_dscr (decimal strings)'],
  ['TRUSTED EVIDENCE', FS.trusted_evidence.join(', ')],
  ['EXECUTABLE TESTS', FS.tests.map((t) => `${t.id}: ${t.check}`).join(' · ')],
  ['ACCEPTANCE CRITERIA', FS.acceptance],
  ['FAILURE HANDLING', FS.failure_handling],
  ['ESCALATION', FS.escalation],
  ['AUTHORIZED APPROVER', `${FS.approver} · validator pinned to ${FS.validator_pin}`],
  ['ARTIFACT MANIFEST', FS.artifacts.join(', ')],
];

export function FlightsheetSection() {
  const { dscr, setDscr, run } = useDemo();
  const [mode, setMode] = useState<'readable' | 'json'>('readable');
  const outcome = run?.outcome ?? '—';

  return (
    <Section id="flightsheet" alt label="The Flightsheet">
      <div className="grid items-start gap-[clamp(32px,5vw,64px)] [grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))]">
        <div>
          <Eyebrow>06 / THE FLIGHTSHEET</Eyebrow>
          <h2 className="mt-4 text-balance font-display text-[clamp(36px,5.2vw,68px)] font-semibold leading-[1.02] tracking-[-0.03em]">Every task begins with a contract.</h2>
          <p className="mt-5 max-w-[520px] text-[18px] leading-[1.55] text-fg2">
            The Flightsheet is the machine-readable execution specification. It defines the expected behavior and how that behavior will be evaluated.
          </p>
          <p className="mt-4 max-w-[520px] text-[15px] leading-[1.55] text-mute">A Flightsheet is not a claim of model competence.</p>

          <div className="mt-9 grid gap-4 rounded-xl border border-hair bg-surface p-5">
            <div className="font-mono text-[11px] tracking-[0.12em] text-mute">EXECUTE FS-DEMO-0007 AGAINST A SUBMITTED MEMO</div>
            <label className="grid gap-2 text-[14px] text-fg2">
              Claimed DSCR in the memo
              <input
                value={dscr}
                onChange={(e) => setDscr(e.target.value)}
                inputMode="decimal"
                aria-describedby="fs-hint"
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-lg border border-hair bg-canvas px-3.5 py-3 font-mono text-[16px] text-fg"
              />
            </label>
            <div id="fs-hint" className="text-[12px] text-mute">
              Try 2.07 (correct to 2 dp), 2.30, or 2.1. Tests re-run on every keystroke.
            </div>
            <div className="grid gap-1.5" aria-live="polite">
              {(run?.tests ?? []).map((t) => (
                <div key={t.id} className="grid items-center gap-3 rounded-lg border border-div bg-inset px-3 py-2.5 [grid-template-columns:minmax(0,1fr)_auto]">
                  <div className="min-w-0">
                    <div className="font-mono text-[12px] text-fg">{t.id}</div>
                    <div className="mt-[3px] break-words font-mono text-[11.5px] text-fg2">{t.detail}</div>
                  </div>
                  <StatusBadge tone={verdictTone(t.result)}>{t.result}</StatusBadge>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-hair pt-3.5 font-mono text-[12px]">
              <span className="text-fg2">SYSTEM OUTCOME · approval PENDING</span>
              <span className={`font-semibold ${outcome === 'PASS' ? 'text-pass' : outcome === 'FAIL' ? 'text-fail' : 'text-mute'}`}>{outcome}</span>
            </div>
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-[14px] border border-hair bg-surface">
          <div className="flex items-center justify-between gap-3 border-b border-hair py-2.5 pl-5 pr-3">
            <span className="font-mono text-[12px] text-fg2">flightsheet/FS-DEMO-0007</span>
            <SegmentedTabs
              size="sm"
              label="Flightsheet format"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'readable', label: 'Readable' },
                { value: 'json', label: 'JSON' },
              ]}
            />
          </div>
          {mode === 'readable' ? (
            <dl className="m-0">
              {ROWS.map(([k, v]) => (
                <KV key={k} k={k} v={v} />
              ))}
            </dl>
          ) : (
            <pre className="m-0 max-h-[640px] overflow-auto bg-inset2 p-5 font-mono text-[12.5px] leading-[1.6] text-fg">{JSON.stringify(FS, null, 2)}</pre>
          )}
        </div>
      </div>
    </Section>
  );
}
