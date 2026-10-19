import { z } from 'zod';

export const Classification = z.enum(['PASS', 'FAIL', 'INSUFFICIENT EVIDENCE', 'REVIEW REQUIRED', 'VALIDATOR FAILURE']);
export type Classification = z.infer<typeof Classification>;

/** Always decimal strings, never JS floats, at the contract boundary. */
export const DecimalString = z.string().regex(/^-?\d+(\.\d+)?$/, 'must be a decimal number');
export type DecimalString = z.infer<typeof DecimalString>;

export const EvidenceReference = z.object({ id: z.string(), title: z.string(), page: z.number().int().optional(), sha256: z.string().optional() });
export type EvidenceReference = z.infer<typeof EvidenceReference>;

export const ValidationRule = z.object({
  id: z.string(),
  check: z.string(),
  op: z.enum(['mul', 'div']).optional(),
  rounding_dp: z.union([z.number().int(), z.literal('as stated in claim')]).optional(),
});
export type ValidationRule = z.infer<typeof ValidationRule>;

/** The claim under test. */
export const Assertion = z.object({
  op: z.enum(['mul', 'div']),
  a: DecimalString,
  b: DecimalString,
  r: DecimalString,
  evidence: z.array(z.string()),
  /** Claim depends on a DatasetRecord whose hash must verify. */
  record: z.boolean().optional(),
});
export type Assertion = z.infer<typeof Assertion>;

export const ValidatorVersion = z.object({ id: z.string(), relTol: z.number().min(0) });
export type ValidatorVersion = z.infer<typeof ValidatorVersion>;

export const ValidationResult = z.object({ verdict: Classification, note: z.string() });
export type ValidationResult = z.infer<typeof ValidationResult>;

export const CanaryResult = z.object({ id: z.string(), label: z.string(), expected: Classification, got: Classification, match: z.boolean() });
export type CanaryResult = z.infer<typeof CanaryResult>;

export const MetaValidationResult = z.object({
  /** Independently specified fixture. */
  expected: Classification,
  /** Exact BigInt oracle. */
  oracleHolds: z.boolean(),
  canaries: z.array(CanaryResult),
  /** Observed validator id differs from the Flightsheet pin. */
  drift: z.boolean(),
  consistent: z.boolean(),
  /** Validator verdict, or VALIDATOR FAILURE. */
  final: Classification,
});
export type MetaValidationResult = z.infer<typeof MetaValidationResult>;

export const Flightsheet = z.object({
  task_id: z.string(),
  purpose: z.string(),
  domain: z.string(),
  inputs: z.record(z.string(), z.string()),
  trusted_evidence: z.array(z.string()),
  tests: z.array(ValidationRule),
  acceptance: z.string(),
  failure_handling: z.string(),
  escalation: z.string(),
  approver: z.string(),
  validator_pin: z.string(),
  artifacts: z.array(z.string()),
});
export type Flightsheet = z.infer<typeof Flightsheet>;

export const DatasetRecord = z.object({
  id: z.string(),
  revision: z.number().int(),
  schema_version: z.string(),
  source: EvidenceReference,
  parents: z.array(z.string()),
  license: z.enum(['licensed-internal', 'restricted', 'unknown']),
  domain: z.array(z.string()),
  normalized: z.object({
    unit: z.string(),
    area_sqft: z.number(),
    lease_expiry: z.string(),
    base_rent_psf_annual: z.number(),
    lease_type: z.enum(['NNN', 'Gross', 'Modified Gross']),
  }),
  validation: z.object({ schema: z.string(), status: z.enum(['PASS', 'FAIL', 'NOT RUN']) }),
  human_review: z.object({ status: z.enum(['PENDING', 'APPROVED']), role: z.string() }),
});
export type DatasetRecord = z.infer<typeof DatasetRecord>;

export const TestOutcome = z.object({ id: z.string(), result: z.union([Classification, z.literal('INVALID INPUT')]) });

export const ExecutionRun = z.object({
  run_id: z.string(),
  timestamp: z.string(),
  flightsheet: z.string(),
  tests: z.array(TestOutcome),
  outcome: z.enum(['PASS', 'FAIL']),
});
export type ExecutionRun = z.infer<typeof ExecutionRun>;

export const VerificationReceipt = z.object({
  receipt_version: z.string(),
  demonstration: z.literal(true),
  run_id: z.string(),
  timestamp: z.string(),
  software: z.object({ defendableos: z.string(), agent: z.string(), validator: z.string() }),
  flightsheet: z.string(),
  input_hashes: z.object({ flightsheet_sha256: z.string(), inputs_sha256: z.string() }),
  evidence: z.array(z.string()),
  tests: z.array(z.object({ id: z.string(), result: z.string() })),
  validator_version: z.string(),
  outcome: z.enum(['PASS', 'FAIL']),
  human_approval: z.object({ role: z.string(), status: z.enum(['PENDING', 'APPROVED']) }),
  hash_method: z.string(),
  /** SHA-256 of canon(receipt minus receipt_hash). A hash, NOT a signature. */
  receipt_hash: z.string().optional(),
});
export type VerificationReceipt = z.infer<typeof VerificationReceipt>;
