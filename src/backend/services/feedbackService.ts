import { getSupabaseAdminClient } from '../lib/supabaseClient';
import type {
  Database,
  FeedbackSubmissionRow,
  FeedbackSubmissionStatus,
} from '../types/supabase';

export class FeedbackServiceUnavailableError extends Error {
  constructor(message = 'Feedback submissions are temporarily unavailable.') {
    super(message);
    this.name = 'FeedbackServiceUnavailableError';
  }
}

export class FeedbackServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FeedbackServiceError';
  }
}

export interface GetSubmissionHistoryParams {
  userId: string;
  statuses?: FeedbackSubmissionStatus[];
}

export type FeedbackSubmissionHistoryItem = Pick<
  FeedbackSubmissionRow,
  |
    'id'
    | 'user_id'
    | 'service_type'
    | 'status'
    | 'details'
    | 'submitted_at'
    | 'updated_at'
    | 'approved_at'
    | 'approved_by'
    | 'admin_comment'
>;

const DEFAULT_EXCLUDED_STATUSES: FeedbackSubmissionStatus[] = ['draft'];

const KNOWN_STATUSES: FeedbackSubmissionStatus[] = [
  'draft',
  'submitted',
  'in_review',
  'approved',
  'rejected',
  'needs_changes',
  'cancelled',
];

const isRecognisedStatus = (
  status: string,
): status is FeedbackSubmissionStatus => {
  return KNOWN_STATUSES.includes(status as FeedbackSubmissionStatus);
};

function sanitiseStatuses(
  statuses?: FeedbackSubmissionStatus[] | string[] | null,
): FeedbackSubmissionStatus[] | undefined {
  if (!statuses || statuses.length === 0) {
    return undefined;
  }

  const next = statuses
    .filter((status) => typeof status === 'string')
    .map((status) => status.trim().toLowerCase())
    .filter(isRecognisedStatus);

  if (next.length === 0) {
    return undefined;
  }

  return Array.from(new Set(next));
}

export async function getFeedbackSubmissionHistory({
  userId,
  statuses,
}: GetSubmissionHistoryParams): Promise<FeedbackSubmissionHistoryItem[]> {
  const supabase = getSupabaseAdminClient<Database>();

  if (!supabase) {
    throw new FeedbackServiceUnavailableError();
  }

  const statusFilter = sanitiseStatuses(statuses);

  const { data, error } = await supabase
    .from('feedback_submissions')
    .select(
      `
      id,
      user_id,
      service_type,
      status,
      details,
      submitted_at,
      updated_at,
      approved_at,
      approved_by,
      admin_comment
    `,
    )
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new FeedbackServiceError(`Failed to fetch submission history: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  const filtered = data.filter((submission) => {
    const status = submission.status as FeedbackSubmissionStatus;

    if (statusFilter?.length) {
      return statusFilter.includes(status);
    }

    return !DEFAULT_EXCLUDED_STATUSES.includes(status);
  });

  return filtered;
}
