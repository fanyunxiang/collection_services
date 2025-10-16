"use client";

import { createApprovalPage } from "../_components/createApprovalPage";

function formatSchedule(submission: any): string {
  const date =
    submission.payload.appointmentDate ?? submission.payload.preferredDate ?? "";
  const time =
    submission.payload.appointmentTime ?? submission.payload.preferredTime ?? "";

  if (!date) {
    return "—";
  }

  try {
    return new Date(`${date}T${time || "00:00"}`).toLocaleString();
  } catch (error) {
    return `${date} ${time}`.trim();
  }
}

const BookingApprovalPage = createApprovalPage({
  type: "booking",
  title: "Medical Certificate Application Reviews",
  description: "Review medical certificate applications and verify the requested schedule and purpose before making a decision.",
  emptyLabel: "There are no medical certificate applications awaiting review.",
  columns: [
    {
      header: "Patient Details",
      render: (submission) => {
        const name = submission.payload.patientName ?? submission.payload.serviceName ?? "—";
        const purpose =
          submission.payload.certificatePurpose ?? submission.payload.notes ?? "—";

        return (
          <div className="space-y-1">
            <p className="font-medium text-gray-900 dark:text-gray-100">{name}</p>
            <p className="text-xs text-gray-600 dark:text-gray-300 break-words">Purpose: {purpose}</p>
          </div>
        );
      },
    },
    {
      header: "Appointment Slot",
      className: "whitespace-nowrap",
      render: (submission) => formatSchedule(submission),
    },
    {
      header: "Submitted By",
      className: "whitespace-nowrap",
      render: (submission) => submission.submittedBy,
    },
    {
      header: "Submitted",
      className: "whitespace-nowrap",
      render: (submission) => new Date(submission.createdAt).toLocaleString(),
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
  renderDetails: (submission) => {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Patient Name</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {submission.payload.patientName ?? submission.payload.serviceName ?? "—"}
          </p>
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Appointment Slot</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">{formatSchedule(submission)}</p>
        </div>
        <div className="space-y-1 md:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Purpose</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {submission.payload.certificatePurpose ?? submission.payload.notes ?? "—"}
          </p>
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Submitted By</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">{submission.submittedBy}</p>
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Submitted</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {new Date(submission.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Status</h3>
          <p className="text-sm capitalize text-gray-700 dark:text-gray-300">{submission.status}</p>
        </div>
        {submission.decisionBy ? (
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Reviewer</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {submission.decisionBy}
              {submission.decidedAt
                ? ` · ${new Date(submission.decidedAt).toLocaleString()}`
                : ""}
            </p>
          </div>
        ) : null}
      </div>
    );
  },
});

export default BookingApprovalPage;
