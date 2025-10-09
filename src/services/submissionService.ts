"use client";

import type { CurrentUser } from "@/services/authService";
import { get, patch, post } from "@/services/httpClient";

export type SubmissionType = "feedback" | "booking" | "document";

export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface FeedbackPayload {
  subject: string;
  details: string;
  contactMethod?: string;
}

export interface BookingPayload {
  serviceName: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
}

export interface DocumentPayload {
  documentType: string;
  justification: string;
  requiredBy?: string;
}

export type SubmissionPayloadMap = {
  feedback: FeedbackPayload;
  booking: BookingPayload;
  document: DocumentPayload;
};

export interface SubmissionRecord<T extends SubmissionType> {
  id: string;
  type: T;
  payload: SubmissionPayloadMap[T];
  status: SubmissionStatus;
  submittedBy: string;
  createdAt: string;
  decisionBy?: string;
  decidedAt?: string;
}

interface FeedbackApiRecord {
  id: string;
  subject: string;
  details: string;
  contactMethod?: string;
  status: SubmissionStatus;
  submittedBy: string;
  createdAt: string;
  decisionBy?: string;
  decidedAt?: string;
}

interface BookingApiRecord {
  id: string;
  serviceName: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
  status: SubmissionStatus;
  submittedBy: string;
  createdAt: string;
  decisionBy?: string;
  decidedAt?: string;
}

interface DocumentApiRecord {
  id: string;
  documentType: string;
  justification: string;
  requiredBy?: string;
  status: SubmissionStatus;
  submittedBy: string;
  createdAt: string;
  decisionBy?: string;
  decidedAt?: string;
}

type ApiRecordMap = {
  feedback: FeedbackApiRecord;
  booking: BookingApiRecord;
  document: DocumentApiRecord;
};

function requireUser(user: CurrentUser | null): asserts user is CurrentUser {
  if (!user) {
    throw new Error("You must be signed in to submit a request.");
  }
}

function requireAdmin(user: CurrentUser | null): asserts user is CurrentUser {
  requireUser(user);

  if (user.role !== "admin") {
    throw new Error("Only administrators can update submission status.");
  }
}

function getEndpoint(type: SubmissionType): string {
  switch (type) {
    case "feedback":
      return "/api/feedback";
    case "booking":
      return "/api/booking";
    case "document":
      return "/api/documents";
    default:
      return "";
  }
}

function normalizeSubmissionRecord<T extends SubmissionType>(
  type: T,
  record: ApiRecordMap[T],
): SubmissionRecord<T> {
  if (type === "feedback") {
    const feedbackRecord = record as FeedbackApiRecord;

    return {
      id: feedbackRecord.id,
      type,
      payload: {
        subject: feedbackRecord.subject,
        details: feedbackRecord.details,
        contactMethod: feedbackRecord.contactMethod,
      },
      status: feedbackRecord.status,
      submittedBy: feedbackRecord.submittedBy,
      createdAt: feedbackRecord.createdAt,
      decisionBy: feedbackRecord.decisionBy,
      decidedAt: feedbackRecord.decidedAt,
    } as SubmissionRecord<T>;
  }

  if (type === "booking") {
    const bookingRecord = record as BookingApiRecord;

    return {
      id: bookingRecord.id,
      type,
      payload: {
        serviceName: bookingRecord.serviceName,
        preferredDate: bookingRecord.preferredDate,
        preferredTime: bookingRecord.preferredTime,
        notes: bookingRecord.notes,
      },
      status: bookingRecord.status,
      submittedBy: bookingRecord.submittedBy,
      createdAt: bookingRecord.createdAt,
      decisionBy: bookingRecord.decisionBy,
      decidedAt: bookingRecord.decidedAt,
    } as SubmissionRecord<T>;
  }

  const documentRecord = record as DocumentApiRecord;

  return {
    id: documentRecord.id,
    type,
    payload: {
      documentType: documentRecord.documentType,
      justification: documentRecord.justification,
      requiredBy: documentRecord.requiredBy,
    },
    status: documentRecord.status,
    submittedBy: documentRecord.submittedBy,
    createdAt: documentRecord.createdAt,
    decisionBy: documentRecord.decisionBy,
    decidedAt: documentRecord.decidedAt,
  } as SubmissionRecord<T>;
}

async function fetchRecords<T extends SubmissionType>(
  type: T,
  url: string,
): Promise<SubmissionRecord<T>[]> {
  const response = await get<ApiRecordMap[T][]>(url);

  if (!response.success) {
    throw new Error(response.message || "Failed to load submissions.");
  }

  return response.data.map((record) => normalizeSubmissionRecord(type, record));
}

export async function listSubmissions<T extends SubmissionType>(
  type: T,
): Promise<SubmissionRecord<T>[]> {
  return fetchRecords(type, getEndpoint(type));
}

export async function listSubmissionsForUser<T extends SubmissionType>(
  type: T,
  username: string,
): Promise<SubmissionRecord<T>[]> {
  if (!username) {
    return [];
  }

  const endpoint = `${getEndpoint(type)}?submittedBy=${encodeURIComponent(username)}`;

  return fetchRecords(type, endpoint);
}

export async function createSubmission<T extends SubmissionType>(
  type: T,
  payload: SubmissionPayloadMap[T],
  user: CurrentUser | null,
): Promise<SubmissionRecord<T>> {
  requireUser(user);

  const endpoint = getEndpoint(type);
  const response = await post<ApiRecordMap[T]>(endpoint, {
    ...payload,
    submittedBy: user.username,
  });

  if (!response.success) {
    throw new Error(response.message || "Submission failed.");
  }

  return normalizeSubmissionRecord(type, response.data);
}

export async function updateSubmissionStatus<T extends SubmissionType>(
  type: T,
  id: string,
  status: Exclude<SubmissionStatus, "pending">,
  decisionBy: CurrentUser | null,
): Promise<SubmissionRecord<T>> {
  requireAdmin(decisionBy);

  const endpoint = getEndpoint(type);
  const response = await patch<ApiRecordMap[T]>(endpoint, {
    id,
    status,
    decisionBy: decisionBy.username,
  });

  if (!response.success) {
    throw new Error(response.message || "Failed to update submission status.");
  }

  return normalizeSubmissionRecord(type, response.data);
}
