import { supabaseServerClient } from '@/backend/lib/supabaseClient'
import {
  ensureEnumField,
  ensureIsoDateField,
  ensureOptionalStringField,
  ensureStringField,
} from '@/backend/utils/validators'

export const FEEDBACK_STATUS = ['pending', 'approved', 'rejected'] as const

export type FeedbackStatus = (typeof FEEDBACK_STATUS)[number]

export interface FeedbackSubmissionPayload {
  subject: unknown
  details: unknown
  contactMethod?: unknown
  contact_method?: unknown
  submittedBy?: unknown
  submitted_by?: unknown
}

export interface FeedbackRecord {
  id: string
  subject: string
  details: string
  contactMethod?: string
  status: FeedbackStatus
  submittedBy: string
  createdAt: string
  decisionBy?: string
  decidedAt?: string
}

const TABLE_NAME =
  process.env.FEEDBACK_TABLE_NAME || process.env.NEXT_PUBLIC_FEEDBACK_TABLE_NAME || 'feedback_requests'

function normalizeFeedbackRecord(row: Record<string, unknown>): FeedbackRecord {
  const id = ensureStringField(row.id, 'id')
  const subject = ensureStringField(row.subject ?? row.title, 'subject')
  const details = ensureStringField(row.details ?? row.description, 'details')
  const contactMethod = ensureOptionalStringField(
    row.contactMethod ?? row.contact_method,
    'contactMethod',
  )
  const status = ensureEnumField(
    row.status ?? 'pending',
    'status',
    FEEDBACK_STATUS,
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
    subject,
    details,
    contactMethod,
    status,
    submittedBy,
    createdAt,
    decisionBy,
    decidedAt,
  }
}

export async function submitFeedback(
  payload: FeedbackSubmissionPayload,
): Promise<FeedbackRecord> {
  const subject = ensureStringField(payload.subject, 'subject')
  const details = ensureStringField(payload.details, 'details')
  const contactMethod = ensureOptionalStringField(
    payload.contactMethod ?? payload.contact_method,
    'contactMethod',
  )
  const submittedBy = ensureStringField(
    payload.submittedBy ?? payload.submitted_by,
    'submittedBy',
  )

  const { data, error } = await supabaseServerClient
    .from(TABLE_NAME)
    .insert({
      subject,
      details,
      contact_method: contactMethod ?? null,
      status: 'pending',
      submitted_by: submittedBy,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message || 'Failed to submit feedback.')
  }

  return normalizeFeedbackRecord(data as Record<string, unknown>)
}

export async function listFeedback(
  submittedBy?: string,
): Promise<FeedbackRecord[]> {
  const query = supabaseServerClient
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false })

  if (submittedBy) {
    query.eq('submitted_by', submittedBy)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message || 'Failed to load feedback history.')
  }

  if (!data) {
    return []
  }

  return data.map((row) => normalizeFeedbackRecord(row as Record<string, unknown>))
}

export async function updateFeedbackStatus(
  id: string,
  status: FeedbackStatus,
  decisionBy: string,
): Promise<FeedbackRecord> {
  const normalizedId = ensureStringField(id, 'id')
  const normalizedStatus = ensureEnumField(status, 'status', FEEDBACK_STATUS)
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
    throw new Error(error.message || 'Failed to update feedback status.')
  }

  return normalizeFeedbackRecord(data as Record<string, unknown>)
}
