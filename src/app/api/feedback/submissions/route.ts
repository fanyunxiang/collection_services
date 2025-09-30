import { NextRequest, NextResponse } from 'next/server';
import {
  FeedbackServiceError,
  FeedbackServiceUnavailableError,
  getFeedbackSubmissionHistory,
} from '@/backend/services/feedbackService';
import type { FeedbackSubmissionStatus } from '@/backend/types/feedback';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId parameter.' }, { status: 400 });
  }

  const statusesParam = searchParams.getAll('status');
  const statuses = statusesParam.length
    ? (statusesParam as FeedbackSubmissionStatus[])
    : undefined;

  try {
    const submissions = await getFeedbackSubmissionHistory({
      userId,
      statuses,
    });

    return NextResponse.json({ submissions });
  } catch (error: unknown) {
    if (error instanceof FeedbackServiceUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    if (error instanceof FeedbackServiceError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.error('Unexpected error while fetching submission history', error);
    return NextResponse.json(
      { error: 'Unable to fetch submission history. Please try again later.' },
      { status: 500 },
    );
  }
}
