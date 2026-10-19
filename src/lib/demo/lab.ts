import type { Classification, CanaryResult } from '@/lib/schemas';
import { canon } from '@/lib/provenance/canon';
import { sha256 } from '@/lib/provenance/hash';
import { exactVal, oracleHolds } from '@/lib/verification/oracle';
import { metaValidate } from '@/lib/verification/meta';
import { EVIDENCE_STORE, runValidator } from '@/lib/verification/validator';
import { REC_ORIG, REC_SUB, SCENARIOS, type Scenario } from './scenarios';

export interface LabRun {
  sc: Scenario;
  v: { verdict: Classification; note: string };
  holds: boolean;
  ex: { v: string; approx: boolean };
  missing: string[];
  rec: { h1: string; h2: string } | null;
  canaries: CanaryResult[];
  mism: number;
  drift: boolean;
  agrees: boolean;
  consistent: boolean;
  final: Classification;
  hash: string;
}

/** Run one scenario end to end. Deterministic: same scenario, same result_sha256. */
export async function runScenario(i: number): Promise<LabRun> {
  const sc = SCENARIOS[i];
  if (!sc) throw new RangeError(`no scenario at index ${i}`);
  let recordOk = true;
  let rec: LabRun['rec'] = null;
  if (sc.c.record) {
    const h1 = await sha256(canon(REC_ORIG));
    const h2 = await sha256(canon(REC_SUB));
    recordOk = h1 === h2;
    rec = { h1, h2 };
  }
  const v = runValidator(sc.c, sc.ver, recordOk);
  const holds = oracleHolds(sc.c.op, sc.c.a, sc.c.b, sc.c.r);
  const ex = exactVal(sc.c.op, sc.c.a, sc.c.b);
  const missing = sc.c.evidence.filter((r) => !EVIDENCE_STORE[r]);
  const meta = metaValidate(sc.c, sc.expected, sc.ver, v);
  const mism = meta.canaries.filter((c) => !c.match).length;
  const agrees = v.verdict === sc.expected;
  const hash = await sha256(
    canon({
      scenario: sc.key,
      claim: sc.c,
      validator: sc.ver.id,
      validator_verdict: v.verdict,
      expected: sc.expected,
      oracle_holds: holds,
      canaries: meta.canaries,
      final: meta.final,
    }),
  );
  return { sc, v, holds, ex, missing, rec, canaries: meta.canaries, mism, drift: meta.drift, agrees, consistent: meta.consistent, final: meta.final, hash };
}
