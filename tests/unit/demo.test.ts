import { describe, expect, it } from 'vitest';
import { CUR_INITIAL, curBlocked, curHash, curReduce, curRecord, schemaCheck, type CurFull } from '@/lib/demo/curator';
import { runFlightsheet } from '@/lib/demo/flightsheet';
import { receiptHash } from '@/lib/provenance/hash';

const step = (s: CurFull, n: number) => Array.from({ length: n }).reduce<CurFull>((x) => curReduce(x, { type: 'advance' }), s);

describe('curator pipeline gating', () => {
  it('a clean record passes the schema check and reaches APPROVE, where it blocks until approved', () => {
    let s = step(CUR_INITIAL, 6); // -> VALIDATE
    expect(s.stage).toBe(6);
    expect(s.schema?.ok).toBe(true);
    s = step(s, 2); // -> APPROVE (index 8)
    expect(s.stage).toBe(8);
    expect(curBlocked(s)).toBe(true);
    expect(curReduce(s, { type: 'advance' }).stage).toBe(8);
    s = curReduce(s, { type: 'approve' });
    s = step(s, 1);
    expect(s.stage).toBe(9);
    expect(curBlocked(s)).toBe(true); // finished
  });
  it('a corrupted record halts at VALIDATE and cannot advance', () => {
    let s = curReduce(CUR_INITIAL, { type: 'toggleCorrupt' });
    s = step(s, 6);
    expect(s.schema?.ok).toBe(false);
    expect(s.halt).toMatch(/halted at VALIDATE/);
    expect(curReduce(s, { type: 'advance' }).stage).toBe(6);
  });
  it('toggling corruption after VALIDATE drops the pipeline back to VALIDATE', () => {
    let s = step(CUR_INITIAL, 8);
    s = curReduce(s, { type: 'toggleCorrupt' });
    expect(s.stage).toBe(6);
    expect(s.schema).toBeNull();
  });
  it('schema check names the failing rules for corrupt input', () => {
    const r = schemaCheck(true);
    expect(r.rows.filter((x) => !x.ok).map((x) => x.rule)).toEqual(['area_sqft: integer > 0', 'lease_expiry: valid ISO-8601 date']);
  });
  it('the content hash changes as the record grows', async () => {
    const a = await curHash(CUR_INITIAL);
    const b = await curHash(step(CUR_INITIAL, 1));
    expect(a).not.toBe(b);
    expect(Object.keys(curRecord(step(CUR_INITIAL, 3)))).toContain('normalized');
  });
});

describe('flightsheet runner', () => {
  it('2.07 passes all three tests', async () => {
    const r = await runFlightsheet('2.07');
    expect(r.tests.map((t) => t.result)).toEqual(['PASS', 'PASS', 'PASS']);
    expect(r.outcome).toBe('PASS');
  });
  it('2.30 fails the DSCR test only', async () => {
    const r = await runFlightsheet('2.30');
    expect(r.tests.map((t) => t.result)).toEqual(['PASS', 'FAIL', 'PASS']);
    expect(r.outcome).toBe('FAIL');
  });
  it('2.1 passes at one decimal place', async () => {
    expect((await runFlightsheet('2.1')).outcome).toBe('PASS');
  });
  it('non-decimal input is INVALID INPUT and the outcome is FAIL', async () => {
    const r = await runFlightsheet('abc');
    expect(r.tests[1]?.result).toBe('INVALID INPUT');
    expect(r.outcome).toBe('FAIL');
  });
  it('the receipt hash recomputes, and tampering is detected', async () => {
    const r = await runFlightsheet('2.07');
    expect(await receiptHash(r.body)).toBe(r.hash);
    expect(await receiptHash({ ...r.body, outcome: 'FAIL' })).not.toBe(r.hash);
  });
  it('changing the claimed DSCR changes the receipt hash', async () => {
    expect((await runFlightsheet('2.07')).hash).not.toBe((await runFlightsheet('2.30')).hash);
  });
  it('the receipt says demonstration and never claims a signature', async () => {
    const r = await runFlightsheet('2.07');
    expect(r.body.demonstration).toBe(true);
    expect(JSON.stringify(r.body).toLowerCase()).not.toContain('signature');
  });
});
