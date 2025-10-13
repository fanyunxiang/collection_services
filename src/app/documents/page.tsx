"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  CURRENT_USER_STORAGE_KEY,
  getCurrentUser,
  type CurrentUser,
} from "@/services/authService";
import {
  createSubmission,
  listSubmissionsForUser,
  type DocumentPayload,
  type SubmissionRecord,
  SUBMISSIONS_STORAGE_KEY,
} from "@/services/submissionService";

export default function DocumentRequestPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() =>
    getCurrentUser(),
  );
  const [submissions, setSubmissions] = useState<SubmissionRecord<"document">[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [documentType, setDocumentType] = useState("");
  const [justification, setJustification] = useState("");
  const [requiredBy, setRequiredBy] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const username = useMemo(() => currentUser?.username ?? "", [currentUser]);

  const refreshSubmissions = useCallback(async () => {
    if (!username) {
      setSubmissions([]);
      return;
    }

    setIsLoading(true);

    try {
      setError(null);
      const records = await listSubmissionsForUser("document", username);
      setSubmissions(records);
    } catch (submissionError) {
      if (submissionError instanceof Error) {
        setError(submissionError.message);
      } else {
        setError("Unable to load document history.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    void refreshSubmissions();
  }, [refreshSubmissions]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleStorageChange = (event: StorageEvent) => {
      const isUserChange =
        event.key === CURRENT_USER_STORAGE_KEY || event.key === null;
      const isSubmissionChange =
        event.key === SUBMISSIONS_STORAGE_KEY || event.key === null;

      if (isUserChange) {
        setCurrentUser(getCurrentUser());
      }

      if (isSubmissionChange || isUserChange) {
        void refreshSubmissions();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refreshSubmissions]);

  const handleDocumentTypeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setDocumentType(event.target.value);
    },
    [],
  );

  const handleJustificationChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setJustification(event.target.value);
    },
    [],
  );

  const handleRequiredByChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setRequiredBy(event.target.value);
    },
    [],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setMessage(null);
      setError(null);

      try {
        const payload: DocumentPayload = {
          documentType: documentType.trim(),
          justification: justification.trim(),
          requiredBy: requiredBy || undefined,
        };

        if (!payload.documentType) {
          throw new Error("Document type is required.");
        }

        if (!payload.justification) {
          throw new Error("Justification is required.");
        }

        const record = await createSubmission("document", payload, currentUser);
        setSubmissions((previous) => [record, ...previous]);

        setDocumentType("");
        setJustification("");
        setRequiredBy("");
        setMessage("Document request submitted successfully.");
        void refreshSubmissions();
      } catch (submissionError) {
        if (submissionError instanceof Error) {
          setError(submissionError.message);
        } else {
          setError(
            "An unexpected error occurred while submitting the document request.",
          );
        }
      }
    },
    [currentUser, documentType, justification, refreshSubmissions, requiredBy],
  );

  if (!currentUser) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Document Request Service</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          You need to sign in before requesting documents.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Document Request Service</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Request certificates, letters, or other documents from our team.
          </p>
        </div>

        {message && (
          <p className="mb-4 rounded-md bg-green-50 px-4 py-2 text-sm text-green-700">
            {message}
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="documentType">
              Document type
            </label>
            <input
              id="documentType"
              name="documentType"
              value={documentType}
              onChange={handleDocumentTypeChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              placeholder="Enrollment letter, transcript, etc."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="justification">
              Justification
            </label>
            <textarea
              id="justification"
              name="justification"
              value={justification}
              onChange={handleJustificationChange}
              className="h-28 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              placeholder="Explain why you need this document"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="requiredBy">
              Required by (optional)
            </label>
            <input
              type="date"
              id="requiredBy"
              name="requiredBy"
              value={requiredBy}
              onChange={handleRequiredByChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            />
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit document request
          </button>
        </form>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Submission history</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Track the status of your document requests.
        </p>

        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">Document</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">Status</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">Required by</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">Submitted at</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                    colSpan={4}
                  >
                    Loading submissions...
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                    colSpan={4}
                  >
                    You have not submitted any document requests yet.
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => (
                  <tr key={submission.id} className="bg-white dark:bg-gray-950">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {submission.payload.documentType}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium capitalize text-gray-900 dark:text-gray-100">
                      {submission.status}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {submission.payload.requiredBy
                        ? new Date(submission.payload.requiredBy).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {new Date(submission.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
