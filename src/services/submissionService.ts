"use client";

import type { CurrentUser } from "@/services/authService";

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

const STORAGE_KEYS: Record<SubmissionType, string> = {
  feedback: "collection-services.feedback-submissions",
  booking: "collection-services.booking-submissions",
  document: "collection-services.document-submissions",
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readFromStorage<T>(key: string, fallback: T): T {
  if (!isBrowser()) {
    return fallback;
  }

  const rawValue = window.localStorage.getItem(key);

  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch (error) {
    console.warn(`Unable to parse submissions for key "${key}"`, error);
    return fallback;
  }
}

function writeToStorage<T>(key: string, value: T): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function buildIdentifier(type: SubmissionType): string {
  const fallback = `${type}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

  if (typeof crypto === "undefined" || typeof crypto.randomUUID !== "function") {
    return fallback;
  }

  return `${type}-${crypto.randomUUID()}`;
}

function getAllSubmissions<T extends SubmissionType>(type: T): SubmissionRecord<T>[] {
  return readFromStorage<SubmissionRecord<T>[]>(STORAGE_KEYS[type], []);
}

function persistSubmissions<T extends SubmissionType>(
  type: T,
  submissions: SubmissionRecord<T>[],
): void {
  writeToStorage(STORAGE_KEYS[type], submissions);
}

function requireUser(user: CurrentUser | null): asserts user is CurrentUser {
  if (!user) {
    throw new Error("You must be signed in to submit a request.");
  }
}

export function getSubmissionStorageKey(type: SubmissionType): string {
  return STORAGE_KEYS[type];
}

export function listSubmissions<T extends SubmissionType>(type: T): SubmissionRecord<T>[] {
  return getAllSubmissions(type);
}

export function listSubmissionsForUser<T extends SubmissionType>(
  type: T,
  username: string,
): SubmissionRecord<T>[] {
  return getAllSubmissions(type).filter(
    (submission) => submission.submittedBy.toLowerCase() === username.toLowerCase(),
  );
}

export function createSubmission<T extends SubmissionType>(
  type: T,
  payload: SubmissionPayloadMap[T],
  user: CurrentUser | null,
): SubmissionRecord<T> {
  requireUser(user);

  const submissions = getAllSubmissions(type);
  const now = new Date().toISOString();

  const newSubmission: SubmissionRecord<T> = {
    id: buildIdentifier(type),
    type,
    payload,
    status: "pending",
    submittedBy: user.username,
    createdAt: now,
  };

  persistSubmissions(type, [...submissions, newSubmission]);

  return newSubmission;
}

export function updateSubmissionStatus<T extends SubmissionType>(
  type: T,
  id: string,
  status: Exclude<SubmissionStatus, "pending">,
  decisionBy: CurrentUser | null,
): SubmissionRecord<T> {
  requireUser(decisionBy);

  if (decisionBy.role !== "admin") {
    throw new Error("Only administrators can update submission status.");
  }

  const submissions = getAllSubmissions(type);

  const submissionIndex = submissions.findIndex((submission) => submission.id === id);

  if (submissionIndex === -1) {
    throw new Error("Submission could not be found.");
  }

  const now = new Date().toISOString();

  const updatedSubmission: SubmissionRecord<T> = {
    ...submissions[submissionIndex],
    status,
    decisionBy: decisionBy.username,
    decidedAt: now,
  };

  const nextSubmissions = [...submissions];
  nextSubmissions.splice(submissionIndex, 1, updatedSubmission);

  persistSubmissions(type, nextSubmissions);

  return updatedSubmission;
}
