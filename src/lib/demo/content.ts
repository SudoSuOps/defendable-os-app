/** Copy and fixtures for the page. Everything here is demonstration or marketing text; nothing is live telemetry. */

export const NAV_LINKS = [
  { href: '#engine', label: 'ENGINE', full: 'The Engine' },
  { href: '#curator', label: 'CURATOR', full: 'Dataset Curator' },
  { href: '#validator', label: 'VALIDATOR', full: 'Validate the Validator' },
  { href: '#flightsheet', label: 'FLIGHTSHEET', full: 'Flightsheet' },
  { href: '#receipt', label: 'RECEIPT', full: 'Proof of Execution' },
  { href: '#edge', label: 'EDGE', full: 'Sovereign Edge' },
  { href: '#ecosystem', label: 'ECOSYSTEM', full: 'Ecosystem' },
] as const;

export const HERO_MODULES: readonly [string, string][] = [
  ['INGEST', 'Input packets enter and every artifact is hashed.'],
  ['CURATE', 'Dataset records are normalized and classified.'],
  ['EXECUTE', 'Agent actions are recorded to the execution trace.'],
  ['VERIFY', 'Exact checks evaluate every assertion.'],
  ['PROVE', 'Verified evidence is sealed into a receipt.'],
];

export const PROB_ROWS = [
  { claim: 'NOI is $1,240,000', src: 'EV-T12-2026 · p.2, line 41', check: 'value matches source field noi_annual', verdict: 'PASS' },
  { claim: 'Value ≈ $20.0M at a 6.2% cap rate', src: 'EV-T12-2026 · cap rate from memo', check: '1240000 ÷ 0.062 = 20000000 (exact)', verdict: 'PASS' },
  { claim: 'Debt coverage is 2.3x', src: 'EV-T12-2026 · EV-LOAN-TERMS', check: 'round(1240000 ÷ 600000, 2) = 2.07 ≠ 2.30', verdict: 'FAIL' },
  { claim: '"This looks like a strong acquisition."', src: 'none · interpretation', check: 'no deterministic check exists', verdict: 'REVIEW REQUIRED' },
] as const;

export const PROB_MISSING = [
  { k: 'SOURCE REFERENCE', v: 'none' },
  { k: 'EXECUTABLE CHECK', v: 'none' },
  { k: 'PASS / FAIL', v: 'not evaluated' },
  { k: 'AUDIT RECORD', v: 'none' },
];

export interface EngStage {
  n: string;
  name: string;
  purpose: string;
  value: string;
  inputs: string;
  ops: string;
  outputs: string;
  fail: string;
  req: string;
  code: string;
}

export const ENG: EngStage[] = [
  { n: '01', name: 'Input', purpose: 'Accept the task, its Flightsheet, and the submitted evidence as one unit of work.', value: 'You can always say exactly what the AI was given.', inputs: 'Flightsheet, source documents, task parameters', ops: 'Envelope creation; SHA-256 of every submitted artifact', outputs: 'Run envelope with input hashes', fail: 'Missing Flightsheet · unreadable artifact', req: 'Every artifact is hashed before any processing', code: 'run.envelope = {\n  run_id: "RUN-DEMO-20261019-0007",\n  flightsheet: sha256(canon(fs)),\n  artifacts: [{ id, media_type, sha256 }]\n}' },
  { n: '02', name: 'Normalization', purpose: 'Convert heterogeneous inputs into typed, comparable values.', value: 'Figures from different documents can be compared without re-keying.', inputs: 'Run envelope, raw artifacts', ops: 'Parsing; unit, date, and currency canonicalization', outputs: 'Normalized values with source offsets', fail: 'Unparseable field · ambiguous unit', req: 'Each value keeps a pointer to its source location', code: 'normalize("42,000 SF") → {\n  value: 42000, unit: "sqft",\n  source: { artifact: "EV-RR-2026Q2", page: 3 }\n}' },
  { n: '03', name: 'Dataset Curation', purpose: 'Match normalized values to versioned, reviewed dataset records.', value: 'Work is grounded in data with known origin and usage rights.', inputs: 'Normalized values, dataset registry', ops: 'Deduplication, domain classification, lineage linking', outputs: 'Curated records with dataset ID and revision', fail: 'Duplicate conflict · unknown license', req: 'Usage-rights status must be recorded', code: 'DatasetRecord {\n  id: "DS-CRE-LSE-0042", schema_version: "2.1",\n  lineage: { parents: ["…@r2"], revision: 3 },\n  license: "licensed" | "restricted" | "unknown"\n}' },
  { n: '04', name: 'Agent Execution', purpose: 'The agent performs the task while every action is recorded.', value: 'Nothing the agent did is off the record.', inputs: 'Curated records, instructions, tool permissions', ops: 'Tool calls, intermediate assertions, output drafting', outputs: 'Execution trace and candidate output', fail: 'Tool error · unauthorized tool call · timeout', req: 'Every assertion cites evidence or is marked interpretation', code: 'trace.append({\n  step: 14, tool: "calc.div",\n  args: ["1240000", "600000"], result: "2.07",\n  evidence: ["EV-T12-2026", "EV-LOAN-TERMS"]\n})' },
  { n: '05', name: 'Deterministic Validation', purpose: 'Re-execute every checkable assertion under exact, pre-declared rules.', value: 'Calculation errors are caught before anyone relies on them.', inputs: 'Execution trace, Flightsheet tests', ops: 'Exact arithmetic, schema checks, evidence resolution', outputs: 'Per-test PASS · FAIL · INSUFFICIENT EVIDENCE', fail: 'Assertion mismatch · unresolved evidence', req: 'Tests are defined in the Flightsheet before execution', code: 'T-DSCR-01: round(noi / debt_service, 2) == claim.dscr\n  round(1240000 / 600000, 2) = 2.07\n  2.07 == 2.07 → PASS' },
  { n: '06', name: 'Independent Verification', purpose: 'Test the validator itself against an independent oracle and canary fixtures.', value: 'A broken checker cannot quietly approve bad work.', inputs: 'Validator results, canaries, pinned validator version', ops: 'Canary replay, oracle comparison, version drift check', outputs: 'Meta-validation result', fail: 'Validator disagrees with oracle · version drift', req: 'The oracle shares no code path with the validator', code: 'meta.check(validator, canaries[4], oracle)\n  pinned:   dv-validator@1.4.0\n  observed: dv-validator@1.4.0\n  canaries: 4/4 match → CONSISTENT' },
  { n: '07', name: 'Human Authority', purpose: 'Route the evidence package to an authorized person for the decision.', value: 'Accountability stays with a named role in your organization.', inputs: 'Verification results, escalation rules', ops: 'Reviewer assignment; approval or rejection with reason', outputs: 'Decision record', fail: 'No authorized approver · review expired', req: 'System classification never substitutes for approval', code: 'approval = {\n  role: "credit-officer",\n  status: "PENDING",\n  decided_at: null\n}' },
  { n: '08', name: 'Proof Receipt', purpose: 'Emit a portable record of what ran, on what, with what result.', value: 'The record of the work outlives the session that produced it.', inputs: 'All prior artifacts and hashes', ops: 'Canonical serialization; SHA-256 receipt hash', outputs: 'receipt.json', fail: 'Hash mismatch on recomputation', req: 'The receipt must recompute byte-for-byte from its contents', code: 'body = omit(receipt, "receipt_hash")\nreceipt_hash = sha256(canon(body))\n// a hash, not a signature' },
];

export interface LinNode {
  id: string;
  sub: string;
  x: number;
  y: number;
  title: string;
  rows: [string, string][];
}
export const LIN: LinNode[] = [
  { id: 'EV-RR-2026Q2', sub: 'Rent roll · source', x: 28, y: 30, title: 'Rent roll, Q2 2026 (illustrative)', rows: [['type', 'Source document'], ['license', 'Licensed for internal use'], ['used by', 'DS-CRE-LSE-0042@r3'], ['note', 'Facts only. No interpretation stored at source level.']] },
  { id: 'EV-T12-2026', sub: 'Operating statement', x: 28, y: 180, title: 'T-12 operating statement (illustrative)', rows: [['type', 'Source document'], ['license', 'Licensed for internal use'], ['used by', 'DS-COLDCHAIN-LSE v2.1'], ['note', 'Provides NOI used in underwriting checks.']] },
  { id: 'LSE-0042@r3', sub: 'Current record', x: 282, y: 30, title: 'DS-CRE-LSE-0042, revision 3', rows: [['schema', 'lease-record@2.1'], ['parents', 'EV-RR-2026Q2, LSE-0042@r2'], ['validation', 'Schema PASS'], ['review', 'Pending data steward']] },
  { id: 'LSE-0042@r2', sub: 'Prior revision', x: 282, y: 180, title: 'DS-CRE-LSE-0042, revision 2', rows: [['schema', 'lease-record@2.0'], ['status', 'Superseded'], ['change', 'Lease expiry corrected after source re-read'], ['retained', 'Yes. Revisions are never overwritten.']] },
  { id: 'CALC-RENT-0042', sub: 'Derived calculation', x: 536, y: 30, title: 'Annual base rent, Unit 4B', rows: [['formula', 'area_sqft × base_rent_psf_annual'], ['inputs', '42000 × 14.25'], ['result', '598500 (exact)'], ['class', 'Derived calculation, not a source fact']] },
  { id: 'COLDCHAIN v2.1', sub: 'Dataset release', x: 536, y: 180, title: 'DS-COLDCHAIN-LSE, release 2.1', rows: [['contains', 'Curated cold-chain lease records'], ['parents', 'LSE-0042@r3, EV-T12-2026'], ['purpose', 'Evaluation and retrieval material'], ['status', 'Demonstration release']] },
];
/** [from, to, vertical-dashed revision edge] */
export const LIN_EDGES: [number, number, boolean][] = [[0, 2, false], [3, 2, true], [1, 5, false], [2, 4, false], [2, 5, false]];

export const LAB_DISTINCTIONS = [
  { t: 'A pass is not a guarantee.', b: 'PASS means this claim satisfied these tests against this evidence under this validator version. It says nothing beyond that scope.' },
  { t: 'Deterministic proof vs. heuristic evaluation.', b: 'The oracle uses exact decimal arithmetic and returns the same answer every time. Interpretive statements are routed to REVIEW REQUIRED, never scored.' },
  { t: 'Classification is not approval.', b: 'Every result above is a system classification. Approval belongs to the authorized human named in the Flightsheet.' },
];

export const RECEIPT_NOTES = [
  'A SHA-256 hash shows whether contents changed. It is not a cryptographic signature and does not identify who issued the receipt.',
  'This example is not tamper-proof or independently certified. Signing and external anchoring are separate controls.',
  'The receipt is regenerated live from the Flightsheet run above. Change the claimed DSCR and the hash changes with it.',
];

export const EDGE_NODES = [
  { n: '01', name: 'EDGE APPLIANCE', hw: 'Jetson Orin Nano-class', loc: 'ON-SITE', desc: 'Captures source data, hashes artifacts, runs schema checks and small-model inference.' },
  { n: '02', name: 'SECURE CONTROL PLANE', hw: 'policy · identity · dispatch', loc: 'OPERATOR', desc: 'Authenticates nodes, dispatches tasks, and enforces what may leave the site.' },
  { n: '03', name: 'AUTHORIZED COMPUTE', hw: 'Blackwell-class GPU', loc: 'AUTHORIZED', desc: 'Runs compute-intensive model workloads only on infrastructure you authorize.' },
  { n: '04', name: 'VERIFICATION ENGINE', hw: 'validator · meta-validator', loc: 'OPERATOR', desc: 'Deterministic validation and meta-validation against pinned versions.' },
  { n: '05', name: 'LOCAL EVIDENCE STORE', hw: 'receipts · traces · sources', loc: 'ON-SITE', desc: 'Retains source data, traces, and receipts under your retention policy.' },
];
export const EDGE_OPTIONS = ['Edge-node workflows', 'Controlled private compute', 'Locally retained source data', 'Selective task offload', 'Configurable retention', 'Portable verification artifacts'];

export const ECO_GROUPS = [
  { layer: 'PRIMITIVES', items: [{ name: 'DefendableCore', desc: 'Execution and verification primitives' }, { name: 'DefendableLedger', desc: 'Structured receipt and provenance records' }] },
  { layer: 'DATA & LINEAGE', items: [{ name: 'DefendableDatasets', desc: 'Curation, lineage, and evaluation material' }, { name: 'DefendableGraph', desc: 'Relationships and evidence lineage' }] },
  { layer: 'INFRASTRUCTURE & DOCS', items: [{ name: 'DefendableCloud', desc: 'Controlled compute and data infrastructure' }, { name: 'DefendableDocs', desc: 'Technical documentation' }] },
  { layer: 'PUBLIC & DOMAIN', items: [{ name: 'OpenDefendable', desc: 'Public standards and interoperability' }, { name: 'Mr Defendable', desc: 'Domain-facing commercial real estate experience' }] },
];

export const FOUNDER_PILLARS = ['Real workflows.', 'Real evidence.', 'Executable verification.', 'Operator authority.'];
export const FOUNDER_ROWS = [
  { k: 'BACKGROUND', v: '30 years in commercial real estate, industrial investment sales, and capital markets' },
  { k: 'FOCUS', v: 'Sovereign AI infrastructure and proprietary datasets' },
  { k: 'BASED', v: 'Jupiter, Florida, USA' },
];
export const DOCTRINE = ['Evidence before confidence.', 'Math before narrative.', 'Verification before authority.', 'No evidence. No pass.', 'Human authority remains final.'];

export const DIAL_OPTIONS = [
  { title: 'Schedule a Founder Call', desc: 'A conversation about DefendableOS, datasets, or verification in your workflow.' },
  { title: 'Technical Walkthrough', desc: 'Engineer-to-engineer review of the Flightsheet, validator, and receipt model.' },
  { title: 'Send a Direct Message', desc: 'A written note. Read by the founder.' },
] as const;

/** Single place for the contact address: the spelling in the brief was corrected to the defendableos.com domain. Confirm with the founder. */
export const CONTACT_EMAIL = 'build@defendableos.com';
