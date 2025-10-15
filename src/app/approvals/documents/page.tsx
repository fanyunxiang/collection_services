"use client";

import { createApprovalPage } from "../_components/createApprovalPage";

function formatOptionalDate(value: string | undefined | null): string {
  if (!value) {
    return "Not provided";
  }

  try {
    return new Date(`${value}T00:00`).toLocaleDateString();
  } catch (error) {
    return value;
  }
}

const DocumentApprovalPage = createApprovalPage({
  type: "document",
  title: "Tax Refund Application Reviews",
  description: "Review tax refund applications and verify the taxpayer details before processing.",
  emptyLabel: "There are no tax refund applications awaiting review.",
  columns: [
    {
      header: "Taxpayer",
      render: (submission) => (
        <div className="space-y-1">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {submission.payload.taxpayerName ?? submission.payload.documentType ?? "—"}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 break-words">
            Reason: {submission.payload.refundReason ?? submission.payload.justification ?? "—"}
          </p>
        </div>
      ),
    },
    {
      header: "Filing Year",
      className: "whitespace-nowrap",
      render: (submission) => submission.payload.taxYear ?? "—",
    },
    {
      header: "Expected Payout Date",
      className: "whitespace-nowrap",
      render: (submission) =>
        formatOptionalDate(
          submission.payload.expectedPayoutDate ?? submission.payload.requiredBy,
        ),
    },
    {
      header: "Submitted By",
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
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Taxpayer</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {submission.payload.taxpayerName ?? submission.payload.documentType ?? "—"}
        </p>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Filing Year</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {submission.payload.taxYear ?? "—"}
        </p>
      </div>
      <div className="space-y-1 md:col-span-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Refund Reason</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {submission.payload.refundReason ?? submission.payload.justification ?? "—"}
        </p>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Expected Payout Date</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {formatOptionalDate(
            submission.payload.expectedPayoutDate ?? submission.payload.requiredBy,
          )}
        </p>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Submitted By</h3>
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
  ),
});

export default DocumentApprovalPage;
