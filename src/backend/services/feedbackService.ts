import {
  ensureEnumField,
  ensureIsoDateField,
  ensureStringField,
} from '@/backend/utils/validators'

export const FEEDBACK_STATUS = ['pending', 'in_progress', 'resolved'] as const

export type FeedbackStatus = (typeof FEEDBACK_STATUS)[number]

export interface FeedbackPayload {
  id: unknown
  title: unknown
  description: unknown
  status: unknown
  created_at: unknown
}

export interface FeedbackRecord {
  id: string
  title: string
  description: string
  status: FeedbackStatus
  created_at: string
}

export async function submitFeedback(
  payload: FeedbackPayload,
): Promise<FeedbackRecord> {
  const id = ensureStringField(payload.id, 'id')
  const title = ensureStringField(payload.title, 'title')
  const description = ensureStringField(payload.description, 'description')
  const status = ensureEnumField(payload.status, 'status', FEEDBACK_STATUS)
  const createdAt = ensureIsoDateField(payload.created_at, 'created_at')

  return {
    id,
    title,
    description,
    status,
    created_at: createdAt,
  }
}
