import { NextResponse } from 'next/server'

import { handleDocumentRequest } from '@/backend/services/documentService'
import {
  createErrorResponse,
  createSuccessResponse,
} from '@/backend/utils/responses'

const SUCCESS_MESSAGE = 'Document request submitted successfully'
const ERROR_MESSAGE = 'Failed to handle document request.'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const record = await handleDocumentRequest(body)

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
