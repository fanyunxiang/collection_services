"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { CurrentUser } from "@/services/authService";
import { getCurrentUser } from "@/services/authService";
import {
  createSubmission,
  listSubmissionsForUser,
  type BookingPayload,
  type SubmissionRecord,
} from "@/services/submissionService";

export default function BookingPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => getCurrentUser());
  const [serviceName, setServiceName] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submissions, setSubmissions] = useState<SubmissionRecord<"booking">[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const username = useMemo(() => currentUser?.username ?? "", [currentUser]);

  useEffect(() => {
    if (!username) {
      setSubmissions([]);
      return;
    }

    setSubmissions(listSubmissionsForUser("booking", username));
  }, [username]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "collection-services.current-user") {
        setCurrentUser(getCurrentUser());
      }

      if (!event.key || event.key === "collection-services.booking-submissions") {
        if (username) {
          setSubmissions(listSubmissionsForUser("booking", username));
        }
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [username]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const payload: BookingPayload = {
        serviceName: serviceName.trim(),
        preferredDate,
        preferredTime,
        notes: notes.trim() || undefined,
      };

      if (!payload.serviceName) {
        throw new Error("Service name is required.");
      }

      if (!payload.preferredDate) {
        throw new Error("Preferred date is required.");
      }

      if (!payload.preferredTime) {
        throw new Error("Preferred time is required.");
      }

      const newSubmission = createSubmission("booking", payload, currentUser);
      setSubmissions((prev) => [...prev, newSubmission]);

      setServiceName("");
      setPreferredDate("");
      setPreferredTime("");
      setNotes("");
      setMessage("Booking request submitted successfully.");
    } catch (submissionError) {
      if (submissionError instanceof Error) {
        setError(submissionError.message);
      } else {
        setError("An unexpected error occurred while creating the booking request.");
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Booking Service</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          You need to sign in before scheduling a booking.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Booking Service</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Request an appointment with our team. We will confirm once it is reviewed.
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
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="serviceName">
              Service name
            </label>
            <input
              id="serviceName"
              name="serviceName"
              value={serviceName}
              onChange={(event) => setServiceName(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              placeholder="Consultation, onboarding, etc."
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="preferredDate">
                Preferred date
              </label>
              <input
                type="date"
                id="preferredDate"
                name="preferredDate"
                value={preferredDate}
                onChange={(event) => setPreferredDate(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="preferredTime">
                Preferred time
              </label>
              <input
                type="time"
                id="preferredTime"
                name="preferredTime"
                value={preferredTime}
                onChange={(event) => setPreferredTime(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="notes">
              Additional notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="h-24 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              placeholder="Share any important context for the appointment"
            />
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit booking request
          </button>
        </form>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Submission history</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Track the status of your booking requests.
        </p>

        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">Service</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">Preferred slot</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {submissions.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400" colSpan={3}>
                    You have not created any booking requests yet.
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => (
                  <tr key={submission.id} className="bg-white dark:bg-gray-950">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {submission.payload.serviceName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {new Date(`${submission.payload.preferredDate}T${submission.payload.preferredTime || "00:00"}`).toLocaleString()}
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
