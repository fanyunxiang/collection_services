import {
  ensureArrayField,
  ensureEnumField,
  ensureIsoDateField,
  ensureOptionalStringField,
  ensureStringField,
} from '@/backend/utils/validators'

export const BOOKING_STATUS = ['pending', 'confirmed', 'cancelled'] as const

export type BookingStatus = (typeof BOOKING_STATUS)[number]

export interface BookingItemPayload {
  name: unknown
  description: unknown
  status: unknown
}

export interface BookingPayload {
  id: unknown
  service: unknown
  date: unknown
  status: unknown
  notes?: unknown
  items: unknown
}

export interface BookingItemRecord {
  name: string
  description: string
  status: string
}

export interface BookingRecord {
  id: string
  service: string
  date: string
  status: BookingStatus
  notes?: string
  items: BookingItemRecord[]
}

function normalizeBookingItems(items: unknown): BookingItemRecord[] {
  const rawItems = ensureArrayField(items, 'items')

  if (rawItems.length === 0) {
    throw new Error('items must contain at least one entry.')
  }

  return rawItems.map((item, index) => {
    if (typeof item !== 'object' || item === null) {
      throw new Error(`items[${index}] must be an object.`)
    }

    const payload = item as BookingItemPayload

    return {
      name: ensureStringField(payload.name, `items[${index}].name`),
      description: ensureStringField(
        payload.description,
        `items[${index}].description`,
      ),
      status: ensureStringField(payload.status, `items[${index}].status`),
    }
  })
}

export async function processBooking(
  payload: BookingPayload,
): Promise<BookingRecord> {
  const id = ensureStringField(payload.id, 'id')
  const service = ensureStringField(payload.service, 'service')
  const date = ensureIsoDateField(payload.date, 'date')
  const status = ensureEnumField(payload.status, 'status', BOOKING_STATUS)
  const notes = ensureOptionalStringField(payload.notes, 'notes')
  const items = normalizeBookingItems(payload.items)

  return {
    id,
    service,
    date,
    status,
    notes,
    items,
  }
}
