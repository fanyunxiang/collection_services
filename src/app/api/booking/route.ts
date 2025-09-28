import { NextResponse } from 'next/server'

import { processBooking } from '@/backend/services/bookingService'
import {
  createErrorResponse,
  createSuccessResponse,
} from '@/backend/utils/responses'

const SUCCESS_MESSAGE = 'Booking processed successfully'
const ERROR_MESSAGE = 'Failed to process booking.'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const record = await processBooking(body)

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
