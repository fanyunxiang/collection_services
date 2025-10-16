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
  const [taxpayerName, setTaxpayerName] = useState("");
  const [taxYear, setTaxYear] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [expectedPayoutDate, setExpectedPayoutDate] = useState("");
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
        setError("Unable to load tax refund applications.");
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

  const handleTaxpayerNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setTaxpayerName(event.target.value);
    },
    [],
  );

  const handleTaxYearChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setTaxYear(event.target.value);
    },
    [],
  );

  const handleRefundReasonChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setRefundReason(event.target.value);
    },
    [],
  );

  const handleExpectedPayoutDateChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setExpectedPayoutDate(event.target.value);
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
          taxpayerName: taxpayerName.trim(),
          taxYear: taxYear.trim(),
          refundReason: refundReason.trim(),
          expectedPayoutDate: expectedPayoutDate || undefined,
        };

        if (!payload.taxpayerName) {
          throw new Error("Please enter the taxpayer's name.");
        }

        if (!payload.taxYear) {
          throw new Error("Please enter the filing year.");
        }

        if (!payload.refundReason) {
          throw new Error("Please describe the reason for the refund.");
        }

        const record = await createSubmission("document", payload, currentUser);
        setSubmissions((previous) => [record, ...previous]);

        setTaxpayerName("");
        setTaxYear("");
        setRefundReason("");
        setExpectedPayoutDate("");
        setMessage("Tax refund application submitted successfully.");
        void refreshSubmissions();
      } catch (submissionError) {
        if (submissionError instanceof Error) {
          setError(submissionError.message);
        } else {
          setError("An unknown error occurred while submitting the tax refund application.");
        }
      }
    },
    [currentUser, expectedPayoutDate, refundReason, refreshSubmissions, taxpayerName, taxYear],
  );

  if (!currentUser) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tax Refund Application</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">Please sign in before submitting a tax refund application.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tax Refund Application</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Provide the taxpayer details and refund justification so we can review your request quickly.
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
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="taxpayerName">
              Taxpayer Name
            </label>
            <input
              id="taxpayerName"
              name="taxpayerName"
              value={taxpayerName}
              onChange={handleTaxpayerNameChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              placeholder="Enter the taxpayer name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="taxYear">
              Filing Year
            </label>
            <input
              id="taxYear"
              name="taxYear"
              value={taxYear}
              onChange={handleTaxYearChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              placeholder="For example: 2023"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="refundReason">
              Refund Reason
            </label>
            <textarea
              id="refundReason"
              name="refundReason"
              value={refundReason}
              onChange={handleRefundReasonChange}
              className="h-28 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              placeholder="Describe why you are requesting a refund"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="expectedPayoutDate">
              Expected Payout Date (optional)
            </label>
            <input
              type="date"
              id="expectedPayoutDate"
              name="expectedPayoutDate"
              value={expectedPayoutDate}
              onChange={handleExpectedPayoutDateChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            />
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit Application
          </button>
        </form>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Application History</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Review your previous tax refund applications and their approval status.
        </p>

        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">Taxpayer</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">Filing Year</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">Refund Reason</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">Expected Payout Date</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">Submitted</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                    colSpan={6}
                  >
                    Loading applications…
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                    colSpan={6}
                  >
                    You have not submitted any tax refund applications yet.
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => {
                  const payload = submission.payload;
                  const taxpayer = payload.taxpayerName ?? payload.documentType ?? "—";
                  const year = payload.taxYear ?? "—";
                  const reason = payload.refundReason ?? payload.justification ?? "—";
                  const expectedDate = payload.expectedPayoutDate ?? payload.requiredBy ?? "";
                  const formattedDate = expectedDate
                    ? new Date(
                        expectedDate + (expectedDate.includes('T') ? '' : 'T00:00'),
                      ).toLocaleDateString()
                    : "—";

                  return (
                    <tr key={submission.id} className="bg-white dark:bg-gray-950">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{taxpayer}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{year}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{reason}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{formattedDate}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {new Date(submission.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium capitalize text-gray-900 dark:text-gray-100">
                        {submission.status}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
