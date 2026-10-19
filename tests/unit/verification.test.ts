import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { canon } from '@/lib/provenance/canon';
import { receiptHash, sha256 } from '@/lib/provenance/hash';
import { oracleHolds } from '@/lib/verification/oracle';
import { CANARIES, metaValidate } from '@/lib/verification/meta';
import { V13_DRIFT, V14, runValidator } from '@/lib/verification/validator';
import { REC_ORIG, REC_SUB, SCENARIOS } from '@/lib/demo/scenarios';
import { runScenario } from '@/lib/demo/lab';
import { Assertion, VerificationReceipt } from '@/lib/schemas';

describe('scenarios', () => {
  for (const [i, sc] of SCENARIOS.entries()) {
    it(`scenario ${sc.key} (${sc.title}) ends as ${sc.final}`, async () => {
      const run = await runScenario(i);
      expect(run.final).toBe(sc.final);
    });
  }

  it('scenario D needs a record hash mismatch, and the hashes really differ', async () => {
    const ok = (await sha256(canon(REC_ORIG))) === (await sha256(canon(REC_SUB)));
    expect(ok).toBe(false);
    const sc = SCENARIOS[3]!;
    expect(runValidator(sc.c, sc.ver, ok).verdict).toBe('REVIEW REQUIRED');
    expect(runValidator(sc.c, sc.ver, true).verdict).toBe('PASS'); // the arithmetic alone is fine
  });

  it('scenario E: the drifted validator passes a bad claim, the oracle rejects it, and canary K2 mismatches', () => {
    const sc = SCENARIOS[4]!;
    const v = runValidator(sc.c, V13_DRIFT, true);
    expect(v.verdict).toBe('PASS');
    expect(oracleHolds(sc.c.op, sc.c.a, sc.c.b, sc.c.r)).toBe(false);
    const meta = metaValidate(sc.c, sc.expected, V13_DRIFT, v);
    expect(meta.final).toBe('VALIDATOR FAILURE');
    expect(meta.drift).toBe(true);
    expect(meta.canaries.find((c) => c.id === 'K2')?.match).toBe(false);
  });

  it('the pinned validator passes every canary', () => {
    for (const k of CANARIES) expect(runValidator(k.c, V14, true).verdict).toBe(k.expected);
  });

  it('missing evidence is INSUFFICIENT EVIDENCE even when the arithmetic is right', () => {
    const sc = SCENARIOS[2]!;
    expect(oracleHolds(sc.c.op, sc.c.a, sc.c.b, sc.c.r)).toBe(true);
    expect(runValidator(sc.c, V14, true).verdict).toBe('INSUFFICIENT EVIDENCE');
  });
});

describe('exact oracle', () => {
  it('judges at the precision the claim states', () => {
    expect(oracleHolds('div', '1240000', '600000', '2.07')).toBe(true);
    expect(oracleHolds('div', '1240000', '600000', '2.30')).toBe(false);
    expect(oracleHolds('div', '1240000', '600000', '2.1')).toBe(true); // 1 dp
  });
  it('multiplication is exact, not float', () => {
    expect(oracleHolds('mul', '0.1', '0.2', '0.02')).toBe(true);
    expect(oracleHolds('mul', '0.1', '0.2', '0.03')).toBe(false);
    expect(oracleHolds('mul', '10000000', '0.06', '600000')).toBe(true);
  });
});

describe('canonical JSON and receipt hash', () => {
  it('sorts keys recursively and emits no whitespace', () => {
    expect(canon({ b: 1, a: { d: 2, c: 3 } })).toBe('{"a":{"c":3,"d":2},"b":1}');
  });
  it('drops undefined values', () => {
    expect(canon({ a: undefined, b: 1 })).toBe('{"b":1}');
  });
  const base: VerificationReceipt = {
    receipt_version: '0.1-demo',
    demonstration: true,
    run_id: 'RUN-T',
    timestamp: '2026-10-19T14:00:00Z',
    software: { defendableos: '0', agent: 'none', validator: 'v' },
    flightsheet: 'FS',
    input_hashes: { flightsheet_sha256: 'a', inputs_sha256: 'b' },
    evidence: ['E'],
    tests: [{ id: 'T', result: 'PASS' }],
    validator_version: 'v',
    outcome: 'PASS',
    human_approval: { role: 'r', status: 'PENDING' },
    hash_method: 'm',
  };
  it('is stable across key order and ignores receipt_hash', async () => {
    const reordered = Object.fromEntries(Object.entries(base).reverse()) as VerificationReceipt;
    expect(await receiptHash(reordered)).toBe(await receiptHash(base));
    expect(await receiptHash({ ...base, receipt_hash: 'anything' })).toBe(await receiptHash(base));
  });
  it('changes when any field changes', async () => {
    const h = await receiptHash(base);
    expect(await receiptHash({ ...base, outcome: 'FAIL' })).not.toBe(h);
    expect(await receiptHash({ ...base, run_id: 'RUN-U' })).not.toBe(h);
    expect(await receiptHash({ ...base, tests: [{ id: 'T', result: 'FAIL' }] })).not.toBe(h);
  });
  it('matches a known SHA-256 vector', async () => {
    expect(await sha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });
});

describe('determinism', () => {
  it('same inputs and versions give an identical result_sha256 across runs', async () => {
    for (const i of [0, 1, 2, 3, 4]) {
      const a = await runScenario(i);
      const b = await runScenario(i);
      expect(a.hash).toBe(b.hash);
      expect(a.hash).toMatch(/^[0-9a-f]{64}$/);
    }
  });
  it('different scenarios give different hashes', async () => {
    const hs = await Promise.all([0, 1, 2, 3, 4].map(async (i) => (await runScenario(i)).hash));
    expect(new Set(hs).size).toBe(5);
  });
});

describe('meta-validator independence', () => {
  const src = readFileSync('src/lib/verification/meta.ts', 'utf8');
  const oracle = readFileSync('src/lib/verification/oracle.ts', 'utf8');
  const validator = readFileSync('src/lib/verification/validator.ts', 'utf8');
  const imports = (s: string) => [...s.matchAll(/from '([^']+)'/g)].map((m) => m[1]);

  it('meta.ts reaches the validator only through runValidator and PIN', () => {
    const m = src.match(/import \{([^}]+)\} from '\.\/validator'/);
    const names = (m?.[1] ?? '').split(',').map((s) => s.trim()).sort();
    expect(names).toEqual(['PIN', 'runValidator']);
  });
  it('the oracle and the validator import nothing from each other', () => {
    expect(imports(oracle).some((p) => p?.includes('validator'))).toBe(false);
    expect(imports(validator).some((p) => p?.includes('oracle'))).toBe(false);
  });
  it('the oracle uses no floating-point parsing', () => {
    expect(oracle).not.toMatch(/parseFloat|Number\(|toFixed|Math\./);
  });
});

describe('schemas', () => {
  it('Assertion rejects non-decimal strings', () => {
    expect(Assertion.safeParse({ op: 'mul', a: '1e3', b: '2', r: '2000', evidence: [] }).success).toBe(false);
    expect(Assertion.safeParse({ op: 'mul', a: '1000', b: '2', r: '2000', evidence: [] }).success).toBe(true);
  });
});
