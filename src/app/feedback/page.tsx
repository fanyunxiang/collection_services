"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { getCurrentUser, type CurrentUser } from "@/services/authService";
import {
  createSubmission,
  listSubmissionsForUser,
  type FeedbackPayload,
  type SubmissionRecord,
} from "@/services/submissionService";

export default function FeedbackPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() =>
    getCurrentUser(),
  );
  const [submissions, setSubmissions] = useState<SubmissionRecord<"feedback">[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const username = useMemo(() => currentUser?.username ?? "", [currentUser]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleStorageChange = () => {
      setCurrentUser(getCurrentUser());
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const refreshSubmissions = useCallback(async () => {
    if (!username) {
      setSubmissions([]);
      return;
    }

    setIsLoading(true);

    try {
      setError(null);
      const records = await listSubmissionsForUser("feedback", username);
      setSubmissions(records);
    } catch (submissionError) {
      if (submissionError instanceof Error) {
        setError(submissionError.message);
      } else {
        setError("Unable to load feedback history.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    void refreshSubmissions();
  }, [refreshSubmissions]);

  const handleSubjectChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSubject(event.target.value);
    },
    [],
  );

  const handleDetailsChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setDetails(event.target.value);
    },
    [],
  );

  const handleContactMethodChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setContactMethod(event.target.value);
    },
    [],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setMessage(null);
      setError(null);

      try {
        const payload: FeedbackPayload = {
          subject: subject.trim(),
          details: details.trim(),
          contactMethod: contactMethod.trim() || undefined,
        };

        if (!payload.subject) {
          throw new Error("Subject is required.");
        }

        if (!payload.details) {
          throw new Error("Details are required.");
        }

        const record = await createSubmission(
          "feedback",
          payload,
          currentUser,
        );
        setSubmissions((previous) => [record, ...previous]);

        setSubject("");
        setDetails("");
        setContactMethod("");
        setMessage("Feedback submitted successfully.");
        void refreshSubmissions();
      } catch (submissionError) {
        if (submissionError instanceof Error) {
          setError(submissionError.message);
        } else {
          setError("An unexpected error occurred while submitting feedback.");
        }
      }
    },
    [contactMethod, currentUser, details, refreshSubmissions, subject],
  );

  if (!currentUser) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Feedback Service</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          You need to sign in before submitting feedback.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Feedback Service</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Share your thoughts or report an issue. We review every submission carefully.
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
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="subject">
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              value={subject}
              onChange={handleSubjectChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              placeholder="Let us know how we can help"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="details">
              Details
            </label>
            <textarea
              id="details"
              name="details"
              value={details}
              onChange={handleDetailsChange}
              className="h-32 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              placeholder="Please provide as much detail as possible"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="contactMethod">
              Preferred contact method (optional)
            </label>
            <input
              id="contactMethod"
              name="contactMethod"
              value={contactMethod}
              onChange={handleContactMethodChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              placeholder="Email, phone number, or other"
            />
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit feedback
          </button>
        </form>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Submission history</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Track the status of your previous feedback submissions.
        </p>

        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">Subject</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">Submitted at</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                    colSpan={3}
                  >
                    Loading submissions...
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400" colSpan={3}>
                    You have not submitted any feedback yet.
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => (
                  <tr key={submission.id} className="bg-white dark:bg-gray-950">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {submission.payload.subject}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {new Date(submission.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium capitalize text-gray-900 dark:text-gray-100">
                      {submission.status}
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
