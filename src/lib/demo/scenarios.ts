import type { Assertion, Classification, ValidatorVersion } from '@/lib/schemas';
import { V13_DRIFT, V14 } from '@/lib/verification/validator';

/** All fixtures are DEMONSTRATION DATA. Real integration contracts stay out of src/lib/demo. */
export const REC_ORIG = { id: 'DS-CRE-LSE-0042', unit: '4B', area_sqft: 42000, base_rent_psf_annual: '14.25', source: 'EV-RR-2026Q2' };
/** Scenario D corruption: one field altered in transit. */
export const REC_SUB = { ...REC_ORIG, base_rent_psf_annual: '41.25' };

export interface Scenario {
  key: 'A' | 'B' | 'C' | 'D' | 'E';
  title: string;
  claim: string;
  c: Assertion;
  ver: ValidatorVersion;
  expected: Classification;
  final: Classification;
  why: string;
}

export const SCENARIOS: Scenario[] = [
  {
    key: 'A',
    title: 'Correct mathematical assertion',
    claim: 'Interest-only debt service on a $10,000,000 loan at 6.00% is $600,000 per year.',
    c: { op: 'mul', a: '10000000', b: '0.06', r: '600000', evidence: ['EV-LOAN-TERMS'] },
    ver: V14,
    expected: 'PASS',
    final: 'PASS',
    why: 'Fixture: claim matches the exact product.',
  },
  {
    key: 'B',
    title: 'Incorrect financial calculation',
    claim: 'DSCR is 2.30x (NOI $1,240,000 ÷ debt service $600,000).',
    c: { op: 'div', a: '1240000', b: '600000', r: '2.30', evidence: ['EV-T12-2026', 'EV-LOAN-TERMS'] },
    ver: V14,
    expected: 'FAIL',
    final: 'FAIL',
    why: 'Fixture: exact DSCR rounds to 2.07.',
  },
  {
    key: 'C',
    title: 'Missing supporting evidence',
    claim: 'Value of $20,000,000 at a 6.20% cap rate is supported by the 2026 appraisal.',
    c: { op: 'div', a: '1240000', b: '0.062', r: '20000000', evidence: ['EV-T12-2026', 'EV-APPR-2026'] },
    ver: V14,
    expected: 'INSUFFICIENT EVIDENCE',
    final: 'INSUFFICIENT EVIDENCE',
    why: 'Fixture: EV-APPR-2026 was never filed. Correct arithmetic does not substitute for evidence.',
  },
  {
    key: 'D',
    title: 'Corrupted dataset record',
    claim: 'Annual base rent for Unit 4B is $598,500 (42,000 SF × $14.25/SF).',
    c: { op: 'mul', a: '42000', b: '14.25', r: '598500', evidence: ['EV-RR-2026Q2'], record: true },
    ver: V14,
    expected: 'REVIEW REQUIRED',
    final: 'REVIEW REQUIRED',
    why: 'Fixture: record field base_rent_psf_annual was altered in transit (14.25 → 41.25).',
  },
  {
    key: 'E',
    title: 'Validator approves an invalid result',
    claim: 'Implied value is $20,800,000 (NOI $1,240,000 ÷ 6.20% cap rate).',
    c: { op: 'div', a: '1240000', b: '0.062', r: '20800000', evidence: ['EV-T12-2026'] },
    ver: V13_DRIFT,
    expected: 'FAIL',
    final: 'VALIDATOR FAILURE',
    why: 'Fixture: exact value is 20,000,000. The claim is 4.00% high.',
  },
];
