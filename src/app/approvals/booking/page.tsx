"use client";

import { createApprovalPage } from "../_components/createApprovalPage";

const BookingApprovalPage = createApprovalPage({
  type: "booking",
  title: "Booking Service Approvals",
  description:
    "Review appointment requests from users and confirm whether the requested slot can be honored.",
  emptyLabel: "There are no booking requests waiting for approval.",
  columns: [
    {
      header: "Request",
      render: (submission) => (
        <div className="space-y-1">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {submission.payload.serviceName}
          </p>
          {submission.payload.notes ? (
            <p className="text-xs text-gray-600 dark:text-gray-300 break-words">
              {submission.payload.notes}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      header: "Preferred slot",
      className: "whitespace-nowrap",
      render: (submission) =>
        new Date(
          `${submission.payload.preferredDate}T${submission.payload.preferredTime || "00:00"}`,
        ).toLocaleString(),
    },
    {
      header: "Requested by",
      className: "whitespace-nowrap",
      render: (submission) => submission.submittedBy,
    },
    {
      header: "Status",
      className: "whitespace-nowrap",
      render: (submission) => (
        <span className="capitalize text-gray-900 dark:text-gray-100">
          {submission.status}
        </span>
      ),
    },
  ],
  renderDetails: (submission) => (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Service</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{submission.payload.serviceName}</p>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Preferred schedule</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {new Date(`${submission.payload.preferredDate}T${submission.payload.preferredTime || "00:00"}`).toLocaleString()}
        </p>
      </div>
      {submission.payload.notes ? (
        <div className="space-y-1 md:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Additional notes</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">{submission.payload.notes}</p>
        </div>
      ) : null}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Requested by</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{submission.submittedBy}</p>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Submitted</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{new Date(submission.createdAt).toLocaleString()}</p>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Status</h3>
        <p className="text-sm capitalize text-gray-700 dark:text-gray-300">{submission.status}</p>
      </div>
      {submission.decisionBy ? (
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Reviewed by</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {submission.decisionBy}
            {submission.decidedAt
              ? ` · ${new Date(submission.decidedAt).toLocaleString()}`
              : ""}
          </p>
        </div>
      ) : null}
    </div>
  ),
});

export default BookingApprovalPage;
