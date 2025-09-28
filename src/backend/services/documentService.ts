import {
  ensureEnumField,
  ensureIsoDateField,
  ensureStringField,
} from '@/backend/utils/validators'

export const DOCUMENT_STATUS = ['pending', 'approved', 'rejected'] as const

export type DocumentStatus = (typeof DOCUMENT_STATUS)[number]

export interface DocumentRequestPayload {
  id: unknown
  type: unknown
  status: unknown
  requested_at: unknown
  processed_at?: unknown
}

export interface DocumentRequestRecord {
  id: string
  type: string
  status: DocumentStatus
  requested_at: string
  processed_at?: string
}

export async function handleDocumentRequest(
  payload: DocumentRequestPayload,
): Promise<DocumentRequestRecord> {
  const id = ensureStringField(payload.id, 'id')
  const type = ensureStringField(payload.type, 'type')
  const status = ensureEnumField(payload.status, 'status', DOCUMENT_STATUS)
  const requestedAt = ensureIsoDateField(payload.requested_at, 'requested_at')
  const processedAt = ensureIsoDateField(payload.processed_at, 'processed_at', {
    optional: true,
  })

  return {
    id,
    type,
    status,
    requested_at: requestedAt,
    processed_at: processedAt,
  }
}
