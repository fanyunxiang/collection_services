export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      feedback_submissions: {
        Row: {
          id: string;
          user_id: string;
          service_type: string;
          details: string | null;
          status: Database['public']['Enums']['feedback_submission_status'];
          submitted_at: string;
          updated_at: string;
          approved_at: string | null;
          approved_by: string | null;
          admin_comment: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          service_type: string;
          details?: string | null;
          status?: Database['public']['Enums']['feedback_submission_status'];
          submitted_at?: string;
          updated_at?: string;
          approved_at?: string | null;
          approved_by?: string | null;
          admin_comment?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          service_type?: string;
          details?: string | null;
          status?: Database['public']['Enums']['feedback_submission_status'];
          submitted_at?: string;
          updated_at?: string;
          approved_at?: string | null;
          approved_by?: string | null;
          admin_comment?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'feedback_submissions_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'feedback_submissions_approved_by_fkey';
            columns: ['approved_by'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      service_requests: {
        Row: {
          id: string;
          user_id: string;
          service_type: string;
          status: string;
          submitted_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          service_type: string;
          status?: string;
          submitted_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          service_type?: string;
          status?: string;
          submitted_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'service_requests_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      feedback_submission_status:
        | 'draft'
        | 'submitted'
        | 'in_review'
        | 'approved'
        | 'rejected'
        | 'needs_changes'
        | 'cancelled';
    };
    CompositeTypes: {};
  };
}

export type FeedbackSubmissionRow =
  Database['public']['Tables']['feedback_submissions']['Row'];
export type FeedbackSubmissionStatus =
  Database['public']['Enums']['feedback_submission_status'];
