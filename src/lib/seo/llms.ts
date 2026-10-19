import { CUR_STEPS, CUR_TEXT } from '@/lib/demo/curator';
import { DOCTRINE, ECO_GROUPS, EDGE_NODES, ENG, FOUNDER_ROWS, LAB_DISTINCTIONS, PROB_ROWS, RECEIPT_NOTES, CONTACT_EMAIL } from '@/lib/demo/content';
import { FS } from '@/lib/demo/flightsheet';
import { SCENARIOS } from '@/lib/demo/scenarios';
import { FAQS } from './faq';
import { SITE, abs } from './site';

const SECTIONS: [string, string, string][] = [
  ['problem', 'The problem', 'An AI answer is not evidence: the same acquisition memo shown as ordinary output and as a checked, evidence-linked result.'],
  ['engine', 'Inside the Engine', 'The eight stages every run follows, from input to proof receipt, in operator and engineer views.'],
  ['curator', 'Dataset Curator', 'A ten-step pipeline that turns a raw lease line into a structured, traceable, reviewer-approved record, with an evidence lineage graph.'],
  ['validator', 'Validate the Validator', 'Five scenarios showing how a validator, an independent oracle and canary fixtures classify claims, including a validator that approves an invalid result.'],
  ['flightsheet', 'The Flightsheet', 'The machine-readable execution contract, with a runner that re-tests a claimed DSCR on every keystroke.'],
  ['receipt', 'Proof of Execution', 'A receipt that hashes itself, can be recomputed in the browser, and shows tampering as a mismatch.'],
  ['edge', 'Sovereign Edge', 'The five-part deployment architecture and the hardware scope of the edge device.'],
  ['ecosystem', 'Ecosystem', 'The planned product layers around DefendableOS. None are presented as shipped.'],
  ['founder', 'Build philosophy', 'Who builds it and the doctrine behind it.'],
  ['faq', 'Questions', 'Plain answers to the most common questions.'],
];

const CONCEPTS: [string, string][] = [
  ['Flightsheet', 'The machine-readable execution specification for a task, declared before the run. It is not a claim of model competence.'],
  ['Validator', 'Runs checks against predefined evidence, formulas, schemas, and rules.'],
  ['Meta-validator', 'Independently tests whether the validator itself behaves correctly, using an exact-decimal oracle, four canary fixtures, and a version-drift check.'],
  ['Independent oracle', 'An exact decimal checker (BigInt cross-multiplication) that shares no code path with the validator.'],
  ['Canary suite', 'Four fixtures with independently defined expected outcomes: known correct, known incorrect, missing evidence, and a precision edge.'],
  ['Classification', 'The system’s technical verdict: PASS, FAIL, INSUFFICIENT EVIDENCE, REVIEW REQUIRED, or VALIDATOR FAILURE. It is never an approval.'],
  ['Human approval', 'Always a separate field, owned by the authorized role named in the Flightsheet.'],
  ['Proof receipt', 'receipt.json: a portable record of what ran, on what, with what result, sealed with a SHA-256 hash of its canonical JSON. A hash, not a signature.'],
];

export function llmsTxt(): string {
  const l: string[] = [];
  l.push(`# ${SITE.name}`, '', `> ${SITE.description}`, '');
  l.push(`${SITE.name} is built by ${SITE.org} in ${SITE.locality}, Florida, USA. It is verification infrastructure, not an AI model. Every sample on the site is demonstration data: there are no customer metrics, certifications, or live telemetry, and ecosystem products are presented as planned, not shipped.`, '');
  l.push('## Pages', '');
  l.push(`- [Home](${abs('/')}): the full single-page site with interactive demonstrations that run in the browser`);
  l.push(`- [Full text for language models](${abs('/llms-full.txt')}): all site content as plain Markdown, including every FAQ answer`);
  l.push('', '## Sections', '');
  for (const [id, name, desc] of SECTIONS) l.push(`- [${name}](${abs('/')}#${id}): ${desc}`);
  l.push('', '## Key concepts', '');
  for (const [k, v] of CONCEPTS) l.push(`- **${k}**: ${v}`);
  l.push('', '## Questions', '');
  for (const f of FAQS) l.push(`- [${f.q}](${abs('/')}#${f.id})`);
  l.push('', '## Contact', '');
  l.push(`- Email: ${CONTACT_EMAIL}`, `- X: ${SITE.x}`, `- Location: ${SITE.locality}, Florida, USA`);
  l.push('', '## Optional', '');
  l.push(`- [Security contact](${abs('/.well-known/security.txt')})`);
  l.push('');
  return l.join('\n');
}

export function llmsFullTxt(): string {
  const l: string[] = [];
  const h = (n: number, t: string) => l.push('', `${'#'.repeat(n)} ${t}`, '');
  l.push(`# ${SITE.name}: full site text`, '', `> ${SITE.description}`, '', `Source: ${abs('/')} · Updated: ${SITE.updated} · Publisher: ${SITE.org}`);
  h(2, 'Key facts');
  l.push(
    `- ${SITE.name} turns agent execution, proprietary datasets, mathematical verification, and human oversight into portable proof.`,
    '- The pipeline is Evidence → Execution → Verification → Verdict → Receipt.',
    '- It is not another AI model. It is the infrastructure for knowing what your AI actually did.',
    '- Verdicts come from pre-declared deterministic checks and an independent oracle, not from a model’s opinion.',
    '- Human approval is always separate from system classification.',
    '- All samples on the site are demonstration data. No customer metrics, certifications, funding claims, or live telemetry appear on it.',
  );
  h(2, 'The problem');
  l.push('Prompt: "Does 118 Harbor Logistics Center support the acquisition at $20M?" (illustrative example, not a real property).', '');
  l.push('An ordinary AI answer states a value near $20 million at a 6.2% cap rate and 2.3x debt coverage, with no source reference, no executable check, no pass/fail, and no audit record. Under Defendable execution each assertion is checked:', '');
  for (const r of PROB_ROWS) l.push(`- ${r.claim} | source: ${r.src} | check: ${r.check} | result: ${r.verdict}`);
  l.push('', 'Confidence is a model behavior. Proof is a system property.');
  h(2, 'The Engine: eight stages');
  for (const e of ENG) {
    l.push(`### ${e.n}. ${e.name}`, '', e.purpose, '', `- Inputs: ${e.inputs}`, `- Operations: ${e.ops}`, `- Outputs: ${e.outputs}`, `- Failure states: ${e.fail}`, `- Requirement: ${e.req}`, `- Why it matters: ${e.value}`, '');
  }
  h(2, 'Dataset Curator');
  l.push('Raw information is not trusted intelligence. A demonstration lease record moves through ten steps; the schema check runs at VALIDATE and a failure halts the pipeline; APPROVE needs a data steward and the system cannot self-approve.', '');
  CUR_STEPS.forEach((s, i) => l.push(`${i + 1}. ${s}: ${CUR_TEXT[i]}`));
  l.push('', 'Facts are kept in three tiers: source fact, derived calculation, and interpretation (unverified, requires a reviewer).');
  h(2, 'Validate the Validator');
  l.push('A passing grade means nothing if the grading system cannot be tested. Five demonstration scenarios:', '');
  for (const s of SCENARIOS) l.push(`- Scenario ${s.key}, ${s.title}: "${s.claim}" Validator ${s.ver.id}; fixture expects ${s.expected}; final classification ${s.final}. ${s.why}`);
  l.push('');
  for (const d of LAB_DISTINCTIONS) l.push(`- ${d.t} ${d.b}`);
  h(2, 'The Flightsheet');
  l.push(`Flightsheet ${FS.task_id}: ${FS.purpose} (${FS.domain}).`, '', `- Trusted evidence: ${FS.trusted_evidence.join(', ')}`);
  for (const t of FS.tests) l.push(`- Test ${t.id}: ${t.check}`);
  l.push(`- Acceptance: ${FS.acceptance}`, `- Failure handling: ${FS.failure_handling}`, `- Escalation: ${FS.escalation}`, `- Approver: ${FS.approver}; validator pinned to ${FS.validator_pin}`, `- Artifacts: ${FS.artifacts.join(', ')}`);
  h(2, 'Proof of Execution');
  for (const n of RECEIPT_NOTES) l.push(`- ${n}`);
  l.push('- Hash method: sha256(canonical JSON of the receipt without receipt_hash); keys sorted, no whitespace.');
  h(2, 'Sovereign Edge');
  for (const n of EDGE_NODES) l.push(`- ${n.n} ${n.name} (${n.hw}, ${n.loc}): ${n.desc}`);
  l.push('', 'Hardware scope: a Jetson Orin Nano-class module handles capture, hashing, schema checks, and small-model inference at the edge. It does not run large language models. Compute-intensive workloads run on authorized remote Blackwell-class GPU infrastructure. What leaves the node depends on the controls configured and verified for each deployment.');
  h(2, 'Ecosystem (all planned)');
  for (const g of ECO_GROUPS) for (const i of g.items) l.push(`- ${i.name} (${g.layer}, PLANNED): ${i.desc}`);
  l.push('', 'Planned components are architecture, not shipped capabilities.');
  h(2, 'Who builds it');
  l.push(`${SITE.org}, ${SITE.locality}, Florida, USA. Founder: ${SITE.founder}, ${SITE.founderTitle}.`, '');
  for (const r of FOUNDER_ROWS) l.push(`- ${r.k.toLowerCase()}: ${r.v}`);
  h(2, 'Doctrine');
  for (const d of DOCTRINE) l.push(`- ${d}`);
  h(2, 'Frequently asked questions');
  for (const f of FAQS) l.push(`### ${f.q}`, '', f.a, '');
  h(2, 'Contact');
  l.push(`- Email: ${CONTACT_EMAIL}`, `- X: ${SITE.x}`, '', 'DefendableOS provides technical evidence. It does not replace professional judgment or legal authority.', '');
  return l.join('\n');
}
