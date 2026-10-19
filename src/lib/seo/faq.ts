/**
 * Questions people (and answer engines) ask about DefendableOS. Answers are written answer-first and use only facts the page already
 * states. They feed the visible FAQ, the FAQPage JSON-LD, llms.txt and llms-full.txt, so the three can never drift apart.
 * Content rules: no fabricated metrics or customers; a hash is never a signature; ecosystem products are planned; the edge device does not run LLMs.
 */
export interface Faq {
  id: string;
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  {
    id: 'what-is-defendableos',
    q: 'What is DefendableOS?',
    a: 'DefendableOS is verification infrastructure for AI work. It turns agent execution, proprietary datasets, mathematical verification, and human oversight into portable proof. Every run is checked against a pre-declared Flightsheet, tested by an independent oracle, routed to an authorized human, and sealed into a hash receipt. It is not another AI model. The demonstrations on this page run in your browser with sample data.',
  },
  {
    id: 'how-is-it-different',
    q: 'How is this different from asking an AI to check another AI?',
    a: 'Verdicts come from pre-declared, deterministic checks, not from a model’s opinion. Calculations are re-executed with exact decimal arithmetic, and the validator itself is tested against an independent oracle and canary fixtures. Statements that cannot be checked deterministically, such as “this looks like a strong acquisition,” are routed to REVIEW REQUIRED instead of being scored.',
  },
  {
    id: 'what-is-a-flightsheet',
    q: 'What is a Flightsheet?',
    a: 'A Flightsheet is the machine-readable execution specification for a task. It declares the purpose, inputs, trusted evidence, executable tests, acceptance criteria, failure handling, escalation path, authorized approver, pinned validator version, and artifact manifest before the run starts. A Flightsheet is not a claim of model competence.',
  },
  {
    id: 'what-does-pass-mean',
    q: 'What does PASS mean?',
    a: 'PASS means a claim satisfied these tests, against this evidence, under this validator version. It says nothing beyond that scope. Every result is a system classification, not an approval. Approval belongs to the authorized human named in the Flightsheet, and the page always shows it as a separate field.',
  },
  {
    id: 'who-validates-the-validator',
    q: 'Who validates the validator?',
    a: 'A meta-validator does. It checks the validator against an independent oracle that uses exact decimal arithmetic and shares no code with the validator, replays four canary fixtures with independently defined expected outcomes, and flags version drift from the pinned release. In the demonstration, a deliberately drifted validator approves a claim that is 4% too high, and the run is reclassified as VALIDATOR FAILURE.',
  },
  {
    id: 'is-the-receipt-a-signature',
    q: 'Is the proof receipt a digital signature?',
    a: 'No. The receipt records the run ID, timestamp, software versions, input hashes, evidence, test results, validator version, outcome, and approval status, sealed with a SHA-256 hash of its canonical JSON. A hash shows whether contents changed. It is not a cryptographic signature and does not identify who issued the receipt. The example on this page is not tamper-proof or independently certified.',
  },
  {
    id: 'does-the-edge-device-run-llms',
    q: 'Does the edge device run large language models?',
    a: 'No. A Jetson Orin Nano-class module handles capture, hashing, schema checks, and small-model inference at the edge. Compute-intensive workloads run on authorized remote Blackwell-class GPU infrastructure. What leaves the node depends on the controls configured and verified for each deployment.',
  },
  {
    id: 'is-the-data-real',
    q: 'Is the data on this page real?',
    a: 'No. Every sample on this page is demonstration data: an illustrative property, fixed fixtures, and an example run ID. The page contains no customer metrics, certifications, funding claims, or live telemetry, and the hero sequence is a deterministic demonstration, not system monitoring.',
  },
  {
    id: 'which-products-exist',
    q: 'Which products in the ecosystem are available?',
    a: 'None are presented as shipped. DefendableCore, DefendableLedger, DefendableDatasets, DefendableGraph, DefendableCloud, DefendableDocs, OpenDefendable, and Mr Defendable are planned architecture. Links will be added once each destination is live and verified.',
  },
  {
    id: 'who-builds-it',
    q: 'Who builds DefendableOS, and how do I reach them?',
    a: 'DefendableOS is built by Swarm & Bee AI in Jupiter, Florida, USA. It was founded by Donovan Mackey, an operator with three decades of commercial real estate experience. Use the Make the Dial form on this page, write to build@defendableos.com, or follow @defendableos on X.',
  },
];
