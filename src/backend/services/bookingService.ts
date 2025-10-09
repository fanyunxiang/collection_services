import { supabaseServerClient } from '@/backend/lib/supabaseClient'
import {
  ensureEnumField,
  ensureIsoDateField,
  ensureOptionalStringField,
  ensureStringField,
} from '@/backend/utils/validators'

export const BOOKING_STATUS = ['pending', 'approved', 'rejected'] as const

export type BookingStatus = (typeof BOOKING_STATUS)[number]

export interface BookingSubmissionPayload {
  serviceName: unknown
  preferredDate: unknown
  preferredTime: unknown
  notes?: unknown
  submittedBy?: unknown
  submitted_by?: unknown
  status?: unknown
}

export interface BookingRecord {
  id: string
  serviceName: string
  preferredDate: string
  preferredTime: string
  notes?: string
  status: BookingStatus
  submittedBy: string
  createdAt: string
  decisionBy?: string
  decidedAt?: string
}

const TABLE_NAME =
  process.env.BOOKING_TABLE_NAME || process.env.NEXT_PUBLIC_BOOKING_TABLE_NAME || 'booking_requests'

function normalizeBookingRecord(row: Record<string, unknown>): BookingRecord {
  const id = ensureStringField(row.id, 'id')
  const serviceName = ensureStringField(
    row.serviceName ?? row.service ?? row.service_name,
    'serviceName',
  )
  const preferredDate = ensureIsoDateField(
    row.preferredDate ?? row.preferred_date ?? row.date,
    'preferredDate',
  )
  const preferredTime = ensureStringField(
    row.preferredTime ?? row.preferred_time ?? row.time ?? '',
    'preferredTime',
  )
  const notes = ensureOptionalStringField(row.notes, 'notes')
  const status = ensureEnumField(
    row.status ?? 'pending',
    'status',
    BOOKING_STATUS,
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
    serviceName,
    preferredDate,
    preferredTime,
    notes,
    status,
    submittedBy,
    createdAt,
    decisionBy,
    decidedAt,
  }
}

export async function processBooking(
  payload: BookingSubmissionPayload,
): Promise<BookingRecord> {
  const serviceName = ensureStringField(
    payload.serviceName ?? payload.service,
    'serviceName',
  )
  const preferredDate = ensureIsoDateField(
    payload.preferredDate ?? payload.date,
    'preferredDate',
  )
  const preferredTime = ensureStringField(
    payload.preferredTime ?? payload.time,
    'preferredTime',
  )
  const notes = ensureOptionalStringField(payload.notes, 'notes')
  const submittedBy = ensureStringField(
    payload.submittedBy ?? payload.submitted_by,
    'submittedBy',
  )

  const { data, error } = await supabaseServerClient
    .from(TABLE_NAME)
    .insert({
      service_name: serviceName,
      preferred_date: preferredDate,
      preferred_time: preferredTime,
      notes: notes ?? null,
      status: 'pending',
      submitted_by: submittedBy,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message || 'Failed to submit booking request.')
  }

  return normalizeBookingRecord(data as Record<string, unknown>)
}

export async function listBookings(
  submittedBy?: string,
): Promise<BookingRecord[]> {
  const query = supabaseServerClient
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false })

  if (submittedBy) {
    query.eq('submitted_by', submittedBy)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message || 'Failed to load booking history.')
  }

  if (!data) {
    return []
  }

  return data.map((row) => normalizeBookingRecord(row as Record<string, unknown>))
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
  decisionBy: string,
): Promise<BookingRecord> {
  const normalizedId = ensureStringField(id, 'id')
  const normalizedStatus = ensureEnumField(status, 'status', BOOKING_STATUS)
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
    throw new Error(error.message || 'Failed to update booking status.')
  }

  return normalizeBookingRecord(data as Record<string, unknown>)
}
