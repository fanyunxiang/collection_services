import {
  listFeedbackSubmissionsByUser,
} from '@/backend/data/localDatabase';
import type {
  FeedbackSubmissionHistoryItem,
  FeedbackSubmissionStatus,
} from '@/backend/types/feedback';

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
  const statusFilter = sanitiseStatuses(statuses);

  const submissions = listFeedbackSubmissionsByUser(userId, statusFilter);

  if (!submissions.length) {
    return [];
  }

  if (statusFilter?.length) {
    return submissions;
  }

  return submissions.filter(
    (submission) => !DEFAULT_EXCLUDED_STATUSES.includes(submission.status),
  );
}
