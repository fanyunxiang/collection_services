import { NextResponse } from 'next/server'

import {
  handleDocumentRequest,
  listDocumentRequests,
  updateDocumentStatus,
} from '@/backend/services/documentService'
import {
  createErrorResponse,
  createSuccessResponse,
} from '@/backend/utils/responses'

const SUCCESS_MESSAGE = 'Document request submitted successfully'
const ERROR_MESSAGE = 'Failed to handle document request.'
const FETCH_SUCCESS_MESSAGE = 'Document requests retrieved successfully'
const UPDATE_SUCCESS_MESSAGE = 'Document status updated successfully'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const record = await handleDocumentRequest(body)
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

    const records = await listDocumentRequests(submittedBy ?? undefined)
    const response = createSuccessResponse(
      FETCH_SUCCESS_MESSAGE,
      records,
    )

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

    const record = await updateDocumentStatus(
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
