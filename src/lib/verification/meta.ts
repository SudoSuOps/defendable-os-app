import type { Assertion, Classification, MetaValidationResult, ValidationResult, ValidatorVersion } from '@/lib/schemas';
import { oracleHolds } from './oracle';
import { PIN, runValidator } from './validator';

export interface Canary {
  id: string;
  label: string;
  expected: Classification;
  c: Assertion;
}

/** Expected outcomes are defined here, independently of anything the validator returns. */
export const CANARIES: Canary[] = [
  { id: 'K1', label: 'known correct', expected: 'PASS', c: { op: 'mul', a: '2500000', b: '0.055', r: '137500', evidence: ['EV-LOAN-TERMS'] } },
  { id: 'K2', label: 'known incorrect (+3%)', expected: 'FAIL', c: { op: 'div', a: '900000', b: '0.075', r: '12360000', evidence: ['EV-T12-2026'] } },
  { id: 'K3', label: 'missing evidence', expected: 'INSUFFICIENT EVIDENCE', c: { op: 'mul', a: '100', b: '2', r: '200', evidence: ['EV-NOT-FILED'] } },
  { id: 'K4', label: 'precision edge (2 dp)', expected: 'PASS', c: { op: 'div', a: '1240000', b: '600000', r: '2.07', evidence: ['EV-T12-2026'] } },
];

export function metaValidate(claim: Assertion, expected: Classification, ver: ValidatorVersion, v: ValidationResult): MetaValidationResult {
  const oracle = oracleHolds(claim.op, claim.a, claim.b, claim.r);
  const canaries = CANARIES.map((k) => {
    const r = runValidator(k.c, ver, true);
    return { id: k.id, label: k.label, expected: k.expected, got: r.verdict, match: r.verdict === k.expected };
  });
  const drift = ver.id !== PIN;
  const consistent = v.verdict === expected && canaries.every((c) => c.match) && !drift;
  return { expected, oracleHolds: oracle, canaries, drift, consistent, final: consistent ? v.verdict : 'VALIDATOR FAILURE' };
}
