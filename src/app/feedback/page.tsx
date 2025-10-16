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
  type FeedbackPayload,
  type SubmissionRecord,
  SUBMISSIONS_STORAGE_KEY,
} from "@/services/submissionService";

export default function FeedbackPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() =>
    getCurrentUser(),
  );
  const [submissions, setSubmissions] = useState<SubmissionRecord<"feedback">[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [applicantName, setApplicantName] = useState("");
  const [licenseType, setLicenseType] = useState("");
  const [applicationReason, setApplicationReason] = useState("");
  const [contactNumber, setContactNumber] = useState("");
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
      const records = await listSubmissionsForUser("feedback", username);
      setSubmissions(records);
    } catch (submissionError) {
      if (submissionError instanceof Error) {
        setError(submissionError.message);
      } else {
        setError("Unable to load driver's license applications.");
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

  const handleApplicantNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setApplicantName(event.target.value);
    },
    [],
  );

  const handleLicenseTypeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setLicenseType(event.target.value);
    },
    [],
  );

  const handleApplicationReasonChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setApplicationReason(event.target.value);
    },
    [],
  );

  const handleContactNumberChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setContactNumber(event.target.value);
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
          applicantName: applicantName.trim(),
          licenseType: licenseType.trim(),
          applicationReason: applicationReason.trim(),
          contactNumber: contactNumber.trim() || undefined,
        };

        if (!payload.applicantName) {
          throw new Error("Please enter the applicant's name.");
        }

        if (!payload.licenseType) {
          throw new Error("Please specify the license class.");
        }

        if (!payload.applicationReason) {
          throw new Error("Please describe the reason for applying.");
        }

        const record = await createSubmission(
          "feedback",
          payload,
          currentUser,
        );
        setSubmissions((previous) => [record, ...previous]);

        setApplicantName("");
        setLicenseType("");
        setApplicationReason("");
        setContactNumber("");
        setMessage("Driver's license application submitted successfully.");
        void refreshSubmissions();
      } catch (submissionError) {
        if (submissionError instanceof Error) {
          setError(submissionError.message);
        } else {
          setError("An unknown error occurred while submitting the driver's license application.");
        }
      }
    },
    [applicantName, applicationReason, contactNumber, currentUser, licenseType, refreshSubmissions],
  );

  if (!currentUser) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Driver&apos;s License Application</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Please sign in before submitting a driver&apos;s license application.
          </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Driver&apos;s License Application</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Provide your personal details and application reason and we will review your driver&apos;s license request as soon as
            possible.
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
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="applicantName">
              Applicant Name
            </label>
            <input
              id="applicantName"
              name="applicantName"
              value={applicantName}
              onChange={handleApplicantNameChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              placeholder="Enter the name shown on your ID"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="licenseType">
              License Class
            </label>
            <input
              id="licenseType"
              name="licenseType"
              value={licenseType}
              onChange={handleLicenseTypeChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              placeholder="For example: Class C, Class D"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="applicationReason">
              Application Reason
            </label>
            <textarea
              id="applicationReason"
              name="applicationReason"
              value={applicationReason}
              onChange={handleApplicationReasonChange}
              className="h-32 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              placeholder="Explain why you are applying for a driver's license"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="contactNumber">
              Contact Number (optional)
            </label>
            <input
              id="contactNumber"
              name="contactNumber"
              value={contactNumber}
              onChange={handleContactNumberChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              placeholder="Phone number for status updates"
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
          Review your previous driver&apos;s license applications and their approval status.
        </p>

        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">Applicant</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">License Class</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">Reason</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">Submitted</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                    colSpan={5}
                  >
                    Loading applications…
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                    colSpan={5}
                  >
                    You have not submitted any driver&apos;s license applications yet.
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => {
                  const applicant =
                    submission.payload.applicantName ??
                    submission.payload.subject ??
                    "—";
                  const license = submission.payload.licenseType ?? "—";
                  const reason =
                    submission.payload.applicationReason ??
                    submission.payload.details ??
                    "—";

                  return (
                    <tr key={submission.id} className="bg-white dark:bg-gray-950">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {applicant}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {license}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {reason}
                      </td>
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
