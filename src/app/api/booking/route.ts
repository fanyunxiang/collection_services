import { NextResponse } from 'next/server'

import {
  listBookings,
  processBooking,
  updateBookingStatus,
} from '@/backend/services/bookingService'
import {
  createErrorResponse,
  createSuccessResponse,
} from '@/backend/utils/responses'

const SUCCESS_MESSAGE = 'Booking processed successfully'
const ERROR_MESSAGE = 'Failed to process booking.'
const FETCH_SUCCESS_MESSAGE = 'Bookings retrieved successfully'
const UPDATE_SUCCESS_MESSAGE = 'Booking status updated successfully'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const record = await processBooking(body)
    const response = createSuccessResponse(SUCCESS_MESSAGE, record)

    return NextResponse.json(response, { status: response.code })
  } catch (error) {
    const message = error instanceof Error ? error.message : ERROR_MESSAGE

    const response = createErrorResponse(message)

    return NextResponse.json(response, { status: response.code })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const submittedBy = searchParams.get('submittedBy') ?? undefined

    const records = await listBookings(submittedBy ?? undefined)
    const response = createSuccessResponse(FETCH_SUCCESS_MESSAGE, records)

    return NextResponse.json(response, { status: response.code })
  } catch (error) {
    const message = error instanceof Error ? error.message : ERROR_MESSAGE
    const response = createErrorResponse(message)

    return NextResponse.json(response, { status: response.code })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()

    const record = await updateBookingStatus(
      body.id,
      body.status,
      body.decisionBy,
    )
    const response = createSuccessResponse(UPDATE_SUCCESS_MESSAGE, record)

    return NextResponse.json(response, { status: response.code })
  } catch (error) {
    const message = error instanceof Error ? error.message : ERROR_MESSAGE
    const response = createErrorResponse(message)

    return NextResponse.json(response, { status: response.code })
  }
}
