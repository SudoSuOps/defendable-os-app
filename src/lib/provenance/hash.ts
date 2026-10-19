import type { VerificationReceipt } from '@/lib/schemas';
import { canon } from './canon';

/** SHA-256 hex digest. Web Crypto needs a secure context; the message says so rather than failing silently. */
export async function sha256(s: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) return 'unavailable: Web Crypto requires a secure context';
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(b))
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
}

/** Receipt hash = sha256(canon(receipt minus receipt_hash)). A hash, NOT a signature. */
export async function receiptHash(r: VerificationReceipt): Promise<string> {
  const { receipt_hash, ...body } = r;
  void receipt_hash;
  return sha256(canon(body));
}
