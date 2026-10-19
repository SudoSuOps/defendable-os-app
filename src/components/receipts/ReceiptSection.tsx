'use client';

import { RECEIPT_NOTES } from '@/lib/demo/content';
import { Button, DemoTag, Eyebrow, KV, Section, type Tone } from '@/components/ui';
import { CopyButton } from '@/components/ui/CopyButton';
import { useDemo } from '@/state/providers';

export function ReceiptSection({ demoLabels = true }: { demoLabels?: boolean }) {
  const { shown, run, tampered, toggleTamper, check, recompute } = useDemo();

  const download = () => {
    if (!run) return;
    const full = { ...run.body, receipt_hash: run.hash };
    const url = URL.createObjectURL(new Blob([JSON.stringify(full, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'defendable-receipt-RUN-DEMO-20261019-0007.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const rows: [string, string, Tone?][] = shown
    ? [
        ['RUN ID', shown.run_id],
        ['TIMESTAMP', shown.timestamp],
        ['SOFTWARE', `defendableos ${shown.software.defendableos} · agent: ${shown.software.agent}`],
        ['INPUT HASHES', `flightsheet ${shown.input_hashes.flightsheet_sha256.slice(0, 24)}… · inputs ${shown.input_hashes.inputs_sha256.slice(0, 24)}…`],
        ['EVIDENCE', shown.evidence.join(', ')],
        ['TESTS', shown.tests.map((t) => `${t.id} ${t.result}`).join(' · ')],
        ['VALIDATOR', shown.validator_version],
        ['OUTCOME', shown.outcome, tampered ? 'review' : shown.outcome === 'PASS' ? 'pass' : 'fail'],
        ['HUMAN APPROVAL', `${shown.human_approval.status} · ${shown.human_approval.role}`],
      ]
    : [];

  return (
    <Section id="receipt" label="Proof of execution">
      <Eyebrow>07 / PROOF OF EXECUTION</Eyebrow>
      <h2 className="mt-4 max-w-[1000px] text-balance font-display text-[clamp(36px,5.2vw,68px)] font-semibold leading-[1.02] tracking-[-0.03em]">An answer can disappear. Evidence should survive.</h2>

      <div className="mt-12 grid items-start gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))]">
        <div className="min-w-0 overflow-hidden rounded-[14px] border border-hair bg-surface">
          <div className="flex items-center justify-between gap-2 border-b border-hair px-5 py-3.5">
            <span className="font-mono text-[12px] text-fg2">receipt · RUN-DEMO-20261019-0007</span>
            {demoLabels && <DemoTag>EXAMPLE RECEIPT</DemoTag>}
          </div>
          <dl className="m-0">
            {rows.map(([k, v, tone]) => (
              <KV key={k} k={k} v={v} mono kw="minmax(120px,170px)" tone={tone} />
            ))}
          </dl>
          <div className="bg-inset px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="font-mono text-[11px] tracking-[0.12em] text-mute">RECEIPT_HASH · SHA-256</div>
              {run && <CopyButton text={run.hash} label="Copy hash" />}
            </div>
            <div className="mt-1.5 break-all font-mono text-[13px] text-gold2">{run?.hash ?? '…'}</div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-4 rounded-[14px] border border-hair bg-surface p-6">
            <div className="font-display text-[20px] font-semibold">Recompute it yourself</div>
            <p className="m-0 text-[14px] leading-[1.6] text-fg2">
              The receipt is serialized as canonical JSON (keys sorted, no insignificant whitespace, receipt_hash excluded) and hashed with SHA-256 in your browser. Edit a field and the hash no longer matches.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="gold" onClick={() => void recompute()}>
                Recompute hash
              </Button>
              <Button pressed={tampered} onClick={toggleTamper}>
                {tampered ? 'Restore original field' : 'Edit outcome field'}
              </Button>
              <Button onClick={download}>Download receipt.json</Button>
            </div>
            {check && (
              <div role="status" className={`grid gap-1.5 rounded-lg border px-3.5 py-3 ${check.ok ? 'border-pass' : 'border-fail'}`}>
                <div className={`font-mono text-[12px] font-semibold ${check.ok ? 'text-pass' : 'text-fail'}`}>
                  {check.ok ? 'MATCH · contents are unchanged since the hash was computed' : 'MISMATCH · contents differ from what was hashed'}
                </div>
                <div className="break-all font-mono text-[11.5px] text-fg2">recomputed {check.hash}</div>
              </div>
            )}
          </div>
          <div className="grid gap-2.5 rounded-[14px] border border-hair p-6">
            <div className="font-mono text-[11px] tracking-[0.12em] text-mute">WHAT THIS RECEIPT IS, AND IS NOT</div>
            {RECEIPT_NOTES.map((n) => (
              <div key={n} className="grid gap-2 text-[14px] leading-[1.55] text-fg2 [grid-template-columns:16px_1fr]">
                <span className="text-gold">—</span>
                <span>{n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
