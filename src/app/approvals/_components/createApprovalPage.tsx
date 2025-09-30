"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { getCurrentUser } from "@/services/authService";
import type { CurrentUser } from "@/services/authService";
import {
  listSubmissions,
  updateSubmissionStatus,
  type SubmissionRecord,
  type SubmissionStatus,
  type SubmissionType,
} from "@/services/submissionService";

type DecisionStatus = Exclude<SubmissionStatus, "pending">;

type ColumnConfig<T extends SubmissionType> = {
  header: string;
  className?: string;
  render: (submission: SubmissionRecord<T>) => ReactNode;
};

type ApprovalPageConfig<T extends SubmissionType> = {
  type: T;
  title: string;
  description: string;
  emptyLabel: string;
  columns: ColumnConfig<T>[];
  renderDetails?: (submission: SubmissionRecord<T>) => ReactNode;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function createApprovalPage<T extends SubmissionType>({
  type,
  title,
  description,
  columns,
  emptyLabel,
  renderDetails,
}: ApprovalPageConfig<T>) {
  return function SubmissionApprovalPage() {
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => getCurrentUser());
    const [submissions, setSubmissions] = useState<SubmissionRecord<T>[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);
    const submissionType = useRef(type);

    useEffect(() => {
      setSubmissions(listSubmissions(submissionType.current));
    }, []);

    useEffect(() => {
      if (!isBrowser()) {
        return;
      }

      const handleStorage = (event: StorageEvent) => {
        if (event.key === "collection-services.current-user") {
          setCurrentUser(getCurrentUser());
          return;
        }

        if (!event.key || event.key.endsWith(`${submissionType.current}-submissions`)) {
          setSubmissions(listSubmissions(submissionType.current));
        }
      };

      window.addEventListener("storage", handleStorage);

      return () => {
        window.removeEventListener("storage", handleStorage);
      };
    }, []);

    const handleDecision = (submissionId: string, decision: DecisionStatus) => {
      setError(null);

      try {
        const updatedSubmission = updateSubmissionStatus(
          submissionType.current,
          submissionId,
          decision,
          currentUser,
        );
        setSubmissions((prev) =>
          prev.map((submission) =>
            submission.id === submissionId ? updatedSubmission : submission,
          ),
        );
        setExpandedSubmissionId(null);
      } catch (decisionError) {
        if (decisionError instanceof Error) {
          setError(decisionError.message);
        } else {
          setError("Failed to update the submission status.");
        }
      }
    };

    const toggleDetails = (submissionId: string) => {
      setExpandedSubmissionId((current) => (current === submissionId ? null : submissionId));
    };

    if (!currentUser || currentUser.role !== "admin") {
      return (
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Administrator access is required to review submissions.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
          </div>

          {error && (
            <p className="mt-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
          )}
        </div>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Incoming submissions</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Review the pending requests below and record your decision.
          </p>

          <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.header}
                      className={`px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200 ${column.className ?? ""}`.trim()}
                    >
                      {column.header}
                    </th>
                  ))}
                  <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {submissions.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400" colSpan={columns.length + 1}>
                      {emptyLabel}
                    </td>
                  </tr>
                ) : (
                  submissions.map((submission) => (
                    <Fragment key={submission.id}>
                      <tr className="bg-white dark:bg-gray-950">
                        {columns.map((column) => (
                          <td
                            key={`${submission.id}-${column.header}`}
                            className={`px-4 py-3 text-sm text-gray-900 dark:text-gray-100 ${column.className ?? ""}`.trim()}
                          >
                            {column.render(submission)}
                          </td>
                        ))}
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => toggleDetails(submission.id)}
                              className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
                            >
                              {expandedSubmissionId === submission.id ? "Hide details" : "View details"}
                            </button>
                            {submission.status === "pending" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleDecision(submission.id, "approved")}
                                  className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDecision(submission.id, "rejected")}
                                  className="inline-flex items-center rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                {submission.status}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expandedSubmissionId === submission.id && (
                        <tr>
                          <td
                            colSpan={columns.length + 1}
                            className="bg-gray-50 px-4 py-5 text-sm text-gray-700 dark:bg-gray-900/60 dark:text-gray-200"
                          >
                            {renderDetails ? (
                              renderDetails(submission)
                            ) : (
                              <pre className="whitespace-pre-wrap break-words text-xs">
                                {JSON.stringify(submission.payload, null, 2)}
                              </pre>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  };
}
