export const FEEDBACK_STATUS = ["pending", "approved", "rejected"] as const;

export type FeedbackStatus = (typeof FEEDBACK_STATUS)[number];

export interface FeedbackSubmissionPayload {
  subject: unknown;
  details: unknown;
  contactMethod?: unknown;
  contact_method?: unknown;
  submittedBy?: unknown;
  submitted_by?: unknown;
}

export interface FeedbackRecord {
  id: string;
  subject: string;
  details: string;
  contactMethod?: string;
  status: FeedbackStatus;
  submittedBy: string;
  createdAt: string;
  decisionBy?: string;
  decidedAt?: string;
}

const SUPABASE_DISABLED_MESSAGE =
  "Supabase integration is disabled for the local-only demo build.";

export async function submitFeedback(
  _payload: FeedbackSubmissionPayload,
): Promise<FeedbackRecord> {
  throw new Error(SUPABASE_DISABLED_MESSAGE);
}

export async function listFeedback(
  _submittedBy?: string,
): Promise<FeedbackRecord[]> {
  throw new Error(SUPABASE_DISABLED_MESSAGE);
}

export async function updateFeedbackStatus(
  _id: string,
  _status: FeedbackStatus,
  _decisionBy: string,
): Promise<FeedbackRecord> {
  throw new Error(SUPABASE_DISABLED_MESSAGE);
}
