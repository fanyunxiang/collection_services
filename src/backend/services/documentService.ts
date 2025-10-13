export const DOCUMENT_STATUS = ["pending", "approved", "rejected"] as const;

export type DocumentStatus = (typeof DOCUMENT_STATUS)[number];

export interface DocumentSubmissionPayload {
  documentType: unknown;
  justification: unknown;
  requiredBy?: unknown;
  submittedBy?: unknown;
  submitted_by?: unknown;
}

export interface DocumentRecord {
  id: string;
  documentType: string;
  justification: string;
  requiredBy?: string;
  status: DocumentStatus;
  submittedBy: string;
  createdAt: string;
  decisionBy?: string;
  decidedAt?: string;
}

const SUPABASE_DISABLED_MESSAGE =
  "Supabase integration is disabled for the local-only demo build.";

export async function requestDocument(
  _payload: DocumentSubmissionPayload,
): Promise<DocumentRecord> {
  throw new Error(SUPABASE_DISABLED_MESSAGE);
}

export async function listDocuments(
  _submittedBy?: string,
): Promise<DocumentRecord[]> {
  throw new Error(SUPABASE_DISABLED_MESSAGE);
}

export async function updateDocumentStatus(
  _id: string,
  _status: DocumentStatus,
  _decisionBy: string,
): Promise<DocumentRecord> {
  throw new Error(SUPABASE_DISABLED_MESSAGE);
}
