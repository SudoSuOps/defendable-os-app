import { canon } from '@/lib/provenance/canon';
import { sha256 } from '@/lib/provenance/hash';
import { exactVal } from '@/lib/verification/oracle';
import { EVIDENCE_STORE } from '@/lib/verification/validator';

export const CUR_STEPS = ['SOURCE', 'INGEST', 'PARSE', 'NORMALIZE', 'DEDUPLICATE', 'CLASSIFY', 'VALIDATE', 'VERSION', 'APPROVE', 'EXPORT'] as const;

export const CUR_TEXT = [
  'A line from an illustrative rent roll, exactly as received.',
  'The source line is accepted, timestamped, and tied to its artifact ID.',
  'Fields are split out as strings. Nothing is interpreted yet.',
  'Values become typed: integer area, ISO date, decimal rent. Each keeps its source pointer.',
  'Checked against existing records on property + unit key.',
  'Assigned to domain categories used for retrieval and evaluation.',
  'The schema check runs automatically. A failure halts the pipeline.',
  'Assigned a dataset ID, revision, parent lineage, and usage-rights status.',
  'Awaiting an authorized data steward. The system cannot self-approve.',
  'Packaged as an evidence bundle with a content hash.',
];

export const CUR_DOMAINS = ['Commercial real estate', 'Capital markets', 'Industrial logistics', 'Cold-chain infrastructure', 'Leases and contracts', 'Financial underwriting', 'AI execution traces'];
export const CUR_ACTIVE_DOMAINS = ['Cold-chain infrastructure', 'Leases and contracts'];

export interface SchemaRow {
  rule: string;
  ok: boolean;
}
export interface SchemaReport {
  rows: SchemaRow[];
  ok: boolean;
}
export interface CurState {
  stage: number;
  corrupt: boolean;
  approved: boolean;
  schema: SchemaReport | null;
}

function normalized(corrupt: boolean) {
  return {
    unit: '4B',
    area_sqft: corrupt ? -42000 : 42000,
    lease_expiry: corrupt ? '2031-02-30' : '2031-03-31',
    base_rent_psf_annual: 14.25,
    lease_type: 'NNN' as const,
  };
}

export function schemaCheck(corrupt: boolean): SchemaReport {
  const n = normalized(corrupt);
  const d = new Date(n.lease_expiry + 'T00:00:00Z');
  const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(n.lease_expiry) && !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === n.lease_expiry;
  const checks: [string, boolean][] = [
    ['unit: non-empty string', n.unit.length > 0],
    ['area_sqft: integer > 0', Number.isInteger(n.area_sqft) && n.area_sqft > 0],
    ['lease_expiry: valid ISO-8601 date', dateOk],
    ['base_rent_psf_annual: 0 < x < 1000', n.base_rent_psf_annual > 0 && n.base_rent_psf_annual < 1000],
    ['lease_type ∈ {NNN, Gross, Modified Gross}', ['NNN', 'Gross', 'Modified Gross'].includes(n.lease_type)],
    ['source.artifact resolves', !!EVIDENCE_STORE['EV-RR-2026Q2']],
  ];
  const rows = checks.map(([rule, ok]) => ({ rule, ok }));
  return { rows, ok: rows.every((r) => r.ok) };
}

/** The record as it grows through the pipeline. */
export function curRecord({ stage: st, corrupt: bad, approved, schema }: CurState): Record<string, unknown> {
  const r: Record<string, unknown> = {
    raw: bad ? 'Unit 4B | Cold storage | -42,000 SF | Exp 02/30/2031 | $14.25/SF/yr NNN' : 'Unit 4B | Cold storage | 42,000 SF | Exp 03/31/2031 | $14.25/SF/yr NNN',
    source: { artifact: 'EV-RR-2026Q2', page: 3 },
  };
  if (st >= 1) r.ingest = { received: '2026-10-19T14:00:00Z', media_type: 'text/plain' };
  if (st >= 2) r.parsed = { unit: '4B', use: 'Cold storage', area: bad ? '-42,000 SF' : '42,000 SF', expiry: bad ? '02/30/2031' : '03/31/2031', rent: '$14.25/SF/yr NNN' };
  if (st >= 3) r.normalized = normalized(bad);
  if (st >= 4) r.dedupe = { key: 'property:P-118|unit:4B', candidates_checked: 1, duplicates: 0 };
  if (st >= 5) r.domain = ['cold-chain-infrastructure', 'leases-and-contracts'];
  if (st >= 6) r.validation = { schema: 'lease-record@2.1', status: schema ? (schema.ok ? 'PASS' : 'FAIL') : 'NOT RUN' };
  if (st >= 7) Object.assign(r, { id: 'DS-CRE-LSE-0042', revision: 3, parents: ['DS-CRE-LSE-0042@r2', 'EV-RR-2026Q2'], license: 'licensed-internal' });
  if (st >= 8) r.human_review = approved ? { status: 'APPROVED', role: 'data-steward', note: 'demonstration approval' } : { status: 'PENDING', role: 'data-steward' };
  if (st >= 9) r.export = { files: ['record.json', 'source-excerpt.txt', 'validation.json'] };
  return r;
}

export const curHash = (s: CurState) => sha256(canon(curRecord(s)));
export const rentExact = () => exactVal('mul', '42000', '14.25').v;

export const FACT_TIERS = [
  { kind: 'SOURCE FACT', basis: 'EV-RR-2026Q2 · p.3', text: '42,000 SF · $14.25/SF/yr NNN · expires 2031-03-31', tone: 'pass' as const },
  { kind: 'DERIVED CALCULATION', basis: 'exact arithmetic', text: () => `Annual base rent = 42000 × 14.25 = ${rentExact()}`, tone: 'gold' as const },
  { kind: 'INTERPRETATION', basis: 'unverified · requires reviewer', text: 'Rent may be below the submarket median for cold storage.', tone: 'review' as const },
];

/** Pure reducer for the curator console: gating rules live here so they can be tested. */
export type CurAction = { type: 'advance' } | { type: 'runSchema' } | { type: 'approve' } | { type: 'reset' } | { type: 'toggleCorrupt' };
export interface CurFull extends CurState {
  halt: string;
}
export const CUR_INITIAL: CurFull = { stage: 0, corrupt: false, approved: false, schema: null, halt: '' };
const HALT = 'Pipeline halted at VALIDATE: schema check failed. Fix the source or reset.';

export function curBlocked(s: CurFull): boolean {
  const blockedAtValidate = s.stage === 6 && !(s.schema && s.schema.ok);
  const blockedAtApprove = s.stage === 8 && !s.approved;
  return s.stage >= 9 || blockedAtValidate || blockedAtApprove;
}

export function curReduce(s: CurFull, a: CurAction): CurFull {
  switch (a.type) {
    case 'advance': {
      if (curBlocked(s)) return s;
      const next = s.stage + 1;
      if (next === 6) {
        const schema = schemaCheck(s.corrupt);
        return { ...s, stage: next, schema, halt: schema.ok ? '' : HALT };
      }
      return { ...s, stage: next, halt: '' };
    }
    case 'runSchema': {
      const schema = schemaCheck(s.corrupt);
      return { ...s, schema, halt: !schema.ok && s.stage >= 6 ? HALT : '' };
    }
    case 'approve':
      return { ...s, approved: true };
    case 'reset':
      return { ...s, stage: 0, schema: null, approved: false, halt: '' };
    case 'toggleCorrupt':
      return { ...s, corrupt: !s.corrupt, schema: null, halt: s.stage > 6 ? '' : s.halt, stage: s.stage > 6 ? 6 : s.stage };
  }
}
