import { NextResponse } from 'next/server'

import { submitFeedback } from '@/backend/services/feedbackService'
import {
  createErrorResponse,
  createSuccessResponse,
} from '@/backend/utils/responses'

const SUCCESS_MESSAGE = 'Feedback submitted successfully'
const ERROR_MESSAGE = 'Failed to submit feedback.'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const record = await submitFeedback(body)

    return NextResponse.json(
      createSuccessResponse(SUCCESS_MESSAGE, record),
      { status: 201 },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : ERROR_MESSAGE

    return NextResponse.json(createErrorResponse(message), {
      status: 400,
    })
  }
}
