import type { Assertion, Flightsheet, VerificationReceipt } from '@/lib/schemas';
import { canon } from '@/lib/provenance/canon';
import { sha256 } from '@/lib/provenance/hash';
import { atLeast, exactVal, isDec, oracleHolds } from '@/lib/verification/oracle';
import { PIN, V14, runValidator } from '@/lib/verification/validator';

export const FS: Flightsheet = {
  task_id: 'FS-DEMO-0007',
  purpose: 'Verify debt-coverage claims in an underwriting memo',
  domain: 'commercial-real-estate/underwriting',
  inputs: { loan_amount: '10000000', interest_rate: '0.06', noi_annual: '1240000', claimed_debt_service: '600000', claimed_dscr: 'from memo' },
  trusted_evidence: ['EV-LOAN-TERMS', 'EV-T12-2026'],
  tests: [
    { id: 'T-DS-01', check: 'loan_amount * interest_rate == claimed_debt_service', rounding_dp: 0 },
    { id: 'T-DSCR-01', check: 'noi_annual / claimed_debt_service == claimed_dscr', rounding_dp: 'as stated in claim' },
    { id: 'T-DSCR-MIN', check: 'exact(noi_annual / debt_service) >= 1.25' },
  ],
  acceptance: 'All tests PASS and all evidence references resolve',
  failure_handling: 'Mark FAIL, attach recomputed values, route to repair queue',
  escalation: 'INSUFFICIENT EVIDENCE or VALIDATOR FAILURE → human reviewer',
  approver: 'role:credit-officer',
  validator_pin: PIN,
  artifacts: ['receipt.json', 'inputs.canonical.json', 'test-log.json'],
};

export type TestResult = 'PASS' | 'FAIL' | 'INVALID INPUT';
export interface FsTest {
  id: string;
  result: TestResult;
  detail: string;
}
export interface FsRun {
  tests: FsTest[];
  outcome: 'PASS' | 'FAIL';
  body: VerificationReceipt;
  hash: string;
}

/** Run the three Flightsheet tests for a claimed DSCR and build the receipt. Re-run on every keystroke. */
export async function runFlightsheet(dscr: string): Promise<FsRun> {
  const g = (k: string) => FS.inputs[k] ?? '';
  const tests: FsTest[] = [];

  const t1: Assertion = { op: 'mul', a: g('loan_amount'), b: g('interest_rate'), r: g('claimed_debt_service'), evidence: ['EV-LOAN-TERMS'] };
  const t1ok = runValidator(t1, V14, true).verdict === 'PASS' && oracleHolds(t1.op, t1.a, t1.b, t1.r);
  tests.push({ id: 'T-DS-01', result: t1ok ? 'PASS' : 'FAIL', detail: `10000000 × 0.06 = ${exactVal('mul', '10000000', '0.06').v} · claim 600000` });

  if (!isDec(dscr)) {
    tests.push({ id: 'T-DSCR-01', result: 'INVALID INPUT', detail: 'Claimed DSCR must be a decimal number' });
  } else {
    const c: Assertion = { op: 'div', a: g('noi_annual'), b: g('claimed_debt_service'), r: dscr.trim(), evidence: ['EV-T12-2026', 'EV-LOAN-TERMS'] };
    const o = oracleHolds(c.op, c.a, c.b, c.r);
    const ok = runValidator(c, V14, true).verdict === 'PASS' && o;
    tests.push({ id: 'T-DSCR-01', result: ok ? 'PASS' : 'FAIL', detail: `1240000 ÷ 600000 = ${exactVal('div', '1240000', '600000').v}… · claim ${dscr.trim()} · oracle ${o ? 'holds' : 'rejects'}` });
  }

  tests.push({ id: 'T-DSCR-MIN', result: atLeast('1240000', '600000', 125n, 100n) ? 'PASS' : 'FAIL', detail: 'exact 2.066667… ≥ 1.25' });

  const outcome = tests.every((t) => t.result === 'PASS') ? 'PASS' : 'FAIL';
  const inputs = { ...FS.inputs, claimed_dscr: dscr.trim() };
  const body: VerificationReceipt = {
    receipt_version: '0.1-demo',
    demonstration: true,
    run_id: 'RUN-DEMO-20261019-0007',
    timestamp: '2026-10-19T14:00:00Z',
    software: { defendableos: '0.9.0-demo', agent: 'none invoked (illustrative run)', validator: PIN },
    flightsheet: FS.task_id,
    input_hashes: { flightsheet_sha256: await sha256(canon(FS)), inputs_sha256: await sha256(canon(inputs)) },
    evidence: FS.trusted_evidence,
    tests: tests.map((t) => ({ id: t.id, result: t.result })),
    validator_version: PIN,
    outcome,
    human_approval: { role: 'credit-officer', status: 'PENDING' },
    hash_method: 'sha256(canonical_json(receipt minus receipt_hash)); keys sorted, no whitespace',
  };
  return { tests, outcome, body, hash: await sha256(canon(body)) };
}
