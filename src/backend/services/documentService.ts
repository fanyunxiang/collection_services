import { supabaseServerClient } from '@/backend/lib/supabaseClient'
import {
  ensureEnumField,
  ensureIsoDateField,
  ensureOptionalStringField,
  ensureStringField,
} from '@/backend/utils/validators'

export const DOCUMENT_STATUS = ['pending', 'approved', 'rejected'] as const

export type DocumentStatus = (typeof DOCUMENT_STATUS)[number]

export interface DocumentSubmissionPayload {
  documentType: unknown
  justification: unknown
  requiredBy?: unknown
  required_by?: unknown
  submittedBy?: unknown
  submitted_by?: unknown
  status?: unknown
}

export interface DocumentRecord {
  id: string
  documentType: string
  justification: string
  requiredBy?: string
  status: DocumentStatus
  submittedBy: string
  createdAt: string
  decisionBy?: string
  decidedAt?: string
}

const TABLE_NAME =
  process.env.DOCUMENT_TABLE_NAME || process.env.NEXT_PUBLIC_DOCUMENT_TABLE_NAME || 'document_requests'

function normalizeDocumentRecord(row: Record<string, unknown>): DocumentRecord {
  const id = ensureStringField(row.id, 'id')
  const documentType = ensureStringField(
    row.documentType ?? row.document_type ?? row.type,
    'documentType',
  )
  const justification = ensureStringField(
    row.justification ?? row.reason ?? row.description,
    'justification',
  )
  const requiredBy = ensureIsoDateField(
    row.requiredBy ?? row.required_by,
    'requiredBy',
    { optional: true },
  )
  const status = ensureEnumField(
    row.status ?? 'pending',
    'status',
    DOCUMENT_STATUS,
  )
  const submittedBy = ensureStringField(
    row.submittedBy ?? row.submitted_by,
    'submittedBy',
  )
  const createdAt = ensureIsoDateField(
    row.createdAt ?? row.created_at ?? new Date().toISOString(),
    'created_at',
  )
  const decisionBy = ensureOptionalStringField(
    row.decisionBy ?? row.decision_by,
    'decisionBy',
  )
  const decidedAt = ensureIsoDateField(
    row.decidedAt ?? row.decided_at,
    'decided_at',
    { optional: true },
  )

  return {
    id,
    documentType,
    justification,
    requiredBy,
    status,
    submittedBy,
    createdAt,
    decisionBy,
    decidedAt,
  }
}

export async function handleDocumentRequest(
  payload: DocumentSubmissionPayload,
): Promise<DocumentRecord> {
  const documentType = ensureStringField(
    payload.documentType ?? payload.type,
    'documentType',
  )
  const justification = ensureStringField(
    payload.justification ?? payload.reason,
    'justification',
  )
  const requiredBy = ensureIsoDateField(
    payload.requiredBy ?? payload.required_by,
    'requiredBy',
    { optional: true },
  )
  const submittedBy = ensureStringField(
    payload.submittedBy ?? payload.submitted_by,
    'submittedBy',
  )

  const { data, error } = await supabaseServerClient
    .from(TABLE_NAME)
    .insert({
      document_type: documentType,
      justification,
      required_by: requiredBy ?? null,
      status: 'pending',
      submitted_by: submittedBy,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message || 'Failed to submit document request.')
  }

  return normalizeDocumentRecord(data as Record<string, unknown>)
}

export async function listDocumentRequests(
  submittedBy?: string,
): Promise<DocumentRecord[]> {
  const query = supabaseServerClient
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false })

  if (submittedBy) {
    query.eq('submitted_by', submittedBy)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message || 'Failed to load document requests.')
  }

  if (!data) {
    return []
  }

  return data.map((row) => normalizeDocumentRecord(row as Record<string, unknown>))
}

export async function updateDocumentStatus(
  id: string,
  status: DocumentStatus,
  decisionBy: string,
): Promise<DocumentRecord> {
  const normalizedId = ensureStringField(id, 'id')
  const normalizedStatus = ensureEnumField(status, 'status', DOCUMENT_STATUS)
  const decisionOwner = ensureStringField(decisionBy, 'decisionBy')

  const { data, error } = await supabaseServerClient
    .from(TABLE_NAME)
    .update({
      status: normalizedStatus,
      decision_by: decisionOwner,
      decided_at: new Date().toISOString(),
    })
    .eq('id', normalizedId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message || 'Failed to update document status.')
  }

  return normalizeDocumentRecord(data as Record<string, unknown>)
}
