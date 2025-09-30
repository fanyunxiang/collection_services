import { randomUUID } from 'crypto';
import type { FeedbackSubmissionHistoryItem, FeedbackSubmissionStatus } from '@/backend/types/feedback';

export interface LocalUser {
  id: string;
  email: string;
  password: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface CreateUserParams {
  email: string;
  password: string;
  metadata?: Record<string, unknown>;
}

const users: LocalUser[] = [
  {
    id: 'user-1',
    email: 'primary@example.com',
    password: 'changeme',
    metadata: { name: 'Primary Account' },
    created_at: '2024-01-08T10:30:00.000Z',
  },
];

export interface LocalFeedbackSubmission extends FeedbackSubmissionHistoryItem {}

const feedbackSubmissions: LocalFeedbackSubmission[] = [
  {
    id: 'submission-1',
    user_id: 'user-1',
    service_type: 'collection',
    status: 'approved',
    details: 'Request for collection schedule adjustment.',
    submitted_at: '2024-01-02T09:00:00.000Z',
    updated_at: '2024-01-04T16:15:00.000Z',
    approved_at: '2024-01-04T16:00:00.000Z',
    approved_by: 'admin-1',
    admin_comment: 'Approved after verifying address details.',
  },
  {
    id: 'submission-2',
    user_id: 'user-1',
    service_type: 'feedback',
    status: 'draft',
    details: 'Initial feedback draft awaiting completion.',
    submitted_at: '2024-01-05T11:20:00.000Z',
    updated_at: '2024-01-05T11:20:00.000Z',
    approved_at: null,
    approved_by: null,
    admin_comment: null,
  },
  {
    id: 'submission-3',
    user_id: 'user-1',
    service_type: 'feedback',
    status: 'in_review',
    details: 'Follow-up feedback awaiting admin review.',
    submitted_at: '2024-01-07T08:45:00.000Z',
    updated_at: '2024-01-07T09:00:00.000Z',
    approved_at: null,
    approved_by: null,
    admin_comment: 'Under consideration.',
  },
];

export function findUserByEmail(email: string): LocalUser | undefined {
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function createUser({ email, password, metadata }: CreateUserParams): LocalUser {
  if (findUserByEmail(email)) {
    throw new Error('A user with this email already exists.');
  }

  const now = new Date().toISOString();
  const nextUser: LocalUser = {
    id: randomUUID(),
    email,
    password,
    metadata,
    created_at: now,
  };

  users.push(nextUser);
  return nextUser;
}

export function listFeedbackSubmissionsByUser(
  userId: string,
  statuses?: FeedbackSubmissionStatus[],
): FeedbackSubmissionHistoryItem[] {
  const data = feedbackSubmissions.filter((submission) => submission.user_id === userId);
  const ordered = data.sort((a, b) => {
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  if (!statuses || statuses.length === 0) {
    return ordered.map((submission) => ({ ...submission }));
  }

  const statusSet = new Set(statuses);

  return ordered
    .filter((submission) => statusSet.has(submission.status))
    .map((submission) => ({ ...submission }));
}
