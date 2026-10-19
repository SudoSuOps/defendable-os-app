/**
 * Exact oracle. MUST share no code path with the validator: this file imports nothing from validator.ts, and
 * validator.ts imports nothing from here. BigInt cross-multiplication, half-unit tolerance at the claim's stated precision.
 */
const p10 = (k: number) => 10n ** BigInt(k);
const babs = (x: bigint) => (x < 0n ? -x : x);

export const isDec = (s: string) => /^-?\d+(\.\d+)?$/.test(s.trim());

export function dec(input: string): { n: bigint; s: number } {
  let s = input.trim();
  const neg = s[0] === '-';
  if (neg) s = s.slice(1);
  const [i = '0', f = ''] = s.split('.');
  return { n: BigInt((neg ? '-' : '') + i + f), s: f.length };
}

export function oracleHolds(op: 'mul' | 'div', a: string, b: string, r: string): boolean {
  const A = dec(a);
  const B = dec(b);
  const R = dec(r);
  if (op === 'mul') return 2n * babs(R.n * p10(A.s + B.s) - A.n * B.n * p10(R.s)) <= p10(A.s + B.s);
  return 2n * babs(R.n * B.n * p10(A.s) - A.n * p10(R.s + B.s)) <= babs(B.n) * p10(A.s);
}

function fmtFixed(n: bigint, scale: number): string {
  const neg = n < 0n;
  const s = babs(n).toString().padStart(scale + 1, '0');
  let out = scale ? s.slice(0, -scale) + '.' + s.slice(-scale) : s;
  if (out.includes('.')) out = out.replace(/0+$/, '').replace(/\.$/, '');
  return (neg ? '-' : '') + out;
}

/** Exact value for display. Division is truncated to 6 dp and flagged approximate when not exact. */
export function exactVal(op: 'mul' | 'div', a: string, b: string): { v: string; approx: boolean } {
  const A = dec(a);
  const B = dec(b);
  if (op === 'mul') return { v: fmtFixed(A.n * B.n, A.s + B.s), approx: false };
  const num = A.n * p10(B.s + 6);
  const den = B.n * p10(A.s);
  return { v: fmtFixed(num / den, 6), approx: num % den !== 0n };
}

/** Exact comparison used by the Flightsheet minimum-coverage test: a/b >= num/den, no floats. */
export function atLeast(a: string, b: string, num: bigint, den: bigint): boolean {
  const A = dec(a);
  const B = dec(b);
  // a/b >= num/den  <=>  A.n * 10^B.s * den >= num * B.n * 10^A.s   (b > 0)
  return A.n * p10(B.s) * den >= num * B.n * p10(A.s);
}
