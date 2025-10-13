export const BOOKING_STATUS = ["pending", "approved", "rejected"] as const;

export type BookingStatus = (typeof BOOKING_STATUS)[number];

export interface BookingSubmissionPayload {
  serviceName: unknown;
  preferredDate: unknown;
  preferredTime: unknown;
  notes?: unknown;
  submittedBy?: unknown;
  submitted_by?: unknown;
  status?: unknown;
}

export interface BookingRecord {
  id: string;
  serviceName: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
  status: BookingStatus;
  submittedBy: string;
  createdAt: string;
  decisionBy?: string;
  decidedAt?: string;
}

const SUPABASE_DISABLED_MESSAGE =
  "Supabase integration is disabled for the local-only demo build.";

export async function processBooking(
  _payload: BookingSubmissionPayload,
): Promise<BookingRecord> {
  throw new Error(SUPABASE_DISABLED_MESSAGE);
}

export async function listBookings(
  _submittedBy?: string,
): Promise<BookingRecord[]> {
  throw new Error(SUPABASE_DISABLED_MESSAGE);
}

export async function updateBookingStatus(
  _id: string,
  _status: BookingStatus,
  _decisionBy: string,
): Promise<BookingRecord> {
  throw new Error(SUPABASE_DISABLED_MESSAGE);
}
