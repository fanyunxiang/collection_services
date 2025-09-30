"use client";

import { createApprovalPage } from "../_components/createApprovalPage";

const DocumentApprovalPage = createApprovalPage({
  type: "document",
  title: "Document Service Approvals",
  description:
    "Review document requests submitted by users and confirm whether the requested materials can be issued.",
  emptyLabel: "There are no document requests waiting for approval.",
  columns: [
    {
      header: "Document",
      render: (submission) => (
        <div className="space-y-1">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {submission.payload.documentType}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 break-words">
            {submission.payload.justification}
          </p>
        </div>
      ),
    },
    {
      header: "Needed by",
      className: "whitespace-nowrap",
      render: (submission) =>
        submission.payload.requiredBy
          ? new Date(`${submission.payload.requiredBy}T00:00`).toLocaleDateString()
          : "Not specified",
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
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Document</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{submission.payload.documentType}</p>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Needed by</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {submission.payload.requiredBy
            ? new Date(`${submission.payload.requiredBy}T00:00`).toLocaleDateString()
            : "Not specified"}
        </p>
      </div>
      <div className="space-y-1 md:col-span-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Justification</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{submission.payload.justification}</p>
      </div>
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

export default DocumentApprovalPage;
