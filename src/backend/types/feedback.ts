export type FeedbackSubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'needs_changes'
  | 'cancelled';

export interface FeedbackSubmissionHistoryItem {
  id: string;
  user_id: string;
  service_type: string;
  status: FeedbackSubmissionStatus;
  details: string | null;
  submitted_at: string;
  updated_at: string;
  approved_at: string | null;
  approved_by: string | null;
  admin_comment: string | null;
}
