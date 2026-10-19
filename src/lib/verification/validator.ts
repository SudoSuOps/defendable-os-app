import type { Assertion, ValidationResult, ValidatorVersion } from '@/lib/schemas';

export const EVIDENCE_STORE: Record<string, string> = {
  'EV-LOAN-TERMS': 'Loan term sheet (illustrative)',
  'EV-T12-2026': 'T-12 operating statement (illustrative)',
  'EV-RR-2026Q2': 'Rent roll, Q2 2026 (illustrative)',
};

export const PIN = 'dv-validator@1.4.0';
export const V14: ValidatorVersion = { id: 'dv-validator@1.4.0', relTol: 0 };
/** Deliberately buggy: a 5% tolerance. Scenario E exists to catch it. */
export const V13_DRIFT: ValidatorVersion = { id: 'dv-validator@1.3.0-drift', relTol: 0.05 };

/** Order: evidence resolution, then record integrity, then a float recompute rounded to the claim's precision. */
export function runValidator(c: Assertion, ver: ValidatorVersion, recordOk: boolean): ValidationResult {
  for (const ref of c.evidence) {
    if (!EVIDENCE_STORE[ref]) return { verdict: 'INSUFFICIENT EVIDENCE', note: `Reference ${ref} does not resolve in the evidence store.` };
  }
  if (c.record && !recordOk) return { verdict: 'REVIEW REQUIRED', note: 'Record content hash does not match its stored hash. Record quarantined.' };
  const a = parseFloat(c.a);
  const b = parseFloat(c.b);
  const r = parseFloat(c.r);
  const s = (c.r.split('.')[1] ?? '').length;
  const comp = Number((c.op === 'mul' ? a * b : a / b).toFixed(s));
  const rel = Math.abs(comp - r) / Math.abs(comp);
  return {
    verdict: rel <= ver.relTol ? 'PASS' : 'FAIL',
    note: `recomputed ${comp} vs claimed ${c.r} · deviation ${(rel * 100).toFixed(2)}% · tolerance ${(ver.relTol * 100).toFixed(2)}%`,
  };
}
