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

const SUBMISSIONS_STORAGE_KEY = "collection-services.submissions";

type StoredSubmissionRecord = SubmissionRecord<SubmissionType>;

function isBrowser(): boolean {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function readStoredSubmissions(): StoredSubmissionRecord[] {
  if (!isBrowser()) {
    return [];
  }

  const rawValue = window.localStorage.getItem(SUBMISSIONS_STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);

    if (Array.isArray(parsed)) {
      return parsed as StoredSubmissionRecord[];
    }

    return [];
  } catch (error) {
    console.warn(
      `Failed to parse submissions from localStorage for key "${SUBMISSIONS_STORAGE_KEY}"`,
      error,
    );
    return [];
  }
}

function persistSubmissions(records: StoredSubmissionRecord[]): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    SUBMISSIONS_STORAGE_KEY,
    JSON.stringify(records),
  );
}

function generateSubmissionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `submission-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}


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

function cloneSubmission<T extends SubmissionType>(
  record: SubmissionRecord<T>,
): SubmissionRecord<T> {
  return JSON.parse(JSON.stringify(record)) as SubmissionRecord<T>;
}

function sortByCreatedAtDesc(
  records: StoredSubmissionRecord[],
): StoredSubmissionRecord[] {
  return [...records].sort((first, second) => {
    const firstTime = new Date(first.createdAt).getTime();
    const secondTime = new Date(second.createdAt).getTime();

    return secondTime - firstTime;
  });
}

export async function listSubmissions<T extends SubmissionType>(
  type: T,
): Promise<SubmissionRecord<T>[]> {
  const records = sortByCreatedAtDesc(readStoredSubmissions());

  return records
    .filter((record): record is SubmissionRecord<T> => record.type === type)
    .map((record) => cloneSubmission(record));
}

export async function listSubmissionsForUser<T extends SubmissionType>(
  type: T,
  username: string,
): Promise<SubmissionRecord<T>[]> {
  if (!username) {
    return [];
  }

  const records = sortByCreatedAtDesc(readStoredSubmissions());

  return records
    .filter(
      (record): record is SubmissionRecord<T> =>
        record.type === type && record.submittedBy === username,
    )
    .map((record) => cloneSubmission(record));
}

export async function createSubmission<T extends SubmissionType>(
  type: T,
  payload: SubmissionPayloadMap[T],
  user: CurrentUser | null,
): Promise<SubmissionRecord<T>> {
  requireUser(user);

  const createdAt = new Date().toISOString();
  const record: StoredSubmissionRecord = {
    id: generateSubmissionId(),
    type,
    payload: { ...payload },
    status: "pending",
    submittedBy: user.username,
    createdAt,
  } as StoredSubmissionRecord;

  const submissions = readStoredSubmissions();
  const nextRecords = [record, ...submissions];

  persistSubmissions(nextRecords);

  return cloneSubmission(record as SubmissionRecord<T>);
}

export async function updateSubmissionStatus<T extends SubmissionType>(
  type: T,
  id: string,
  status: Exclude<SubmissionStatus, "pending">,
  decisionBy: CurrentUser | null,
): Promise<SubmissionRecord<T>> {
  requireAdmin(decisionBy);

  const submissions = readStoredSubmissions();
  const index = submissions.findIndex(
    (submission) => submission.id === id && submission.type === type,
  );

  if (index === -1) {
    throw new Error("Submission not found.");
  }

  const decidedAt = new Date().toISOString();
  const updatedRecord: StoredSubmissionRecord = {
    ...submissions[index],
    status,
    decisionBy: decisionBy.username,
    decidedAt,
  } as StoredSubmissionRecord;

  const nextRecords = [...submissions];
  nextRecords[index] = updatedRecord;

  persistSubmissions(nextRecords);

  return cloneSubmission(updatedRecord as SubmissionRecord<T>);
}

export { SUBMISSIONS_STORAGE_KEY };
