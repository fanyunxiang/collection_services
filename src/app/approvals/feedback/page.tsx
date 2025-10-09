"use client";

import { createApprovalPage } from "../_components/createApprovalPage";
import { formatDate } from "@/lib/tools";

// Helper render functions
const renderFeedbackInfo = (submission: any) => (
  <div className="space-y-1">
    <p className="font-medium text-gray-900 dark:text-gray-100">
      {submission.payload.subject}
    </p>
    <p className="text-xs text-gray-600 dark:text-gray-300 break-words">
      {submission.payload.details}
    </p>
  </div>
);

const renderSubmittedInfo = (submission: any) => (
  <div className="space-y-1">
    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
      Submitted
    </h3>
    <p className="text-sm text-gray-700 dark:text-gray-300">
      {formatDate(submission.createdAt)}
    </p>
  </div>
);

const renderReviewerInfo = (submission: any) =>
  submission.decisionBy ? (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        Reviewed by
      </h3>
      <p className="text-sm text-gray-700 dark:text-gray-300">
        {submission.decisionBy}
        {submission.decidedAt ? ` · ${formatDate(submission.decidedAt)}` : ""}
      </p>
    </div>
  ) : null;

// Main component
const FeedbackApprovalPage = createApprovalPage({
  type: "feedback",
  title: "Feedback Service Approvals",
  description:
    "Review feedback submissions from end users and approve them once they have been addressed.",
  emptyLabel: "There are no feedback submissions waiting for review.",
  columns: [
    {
      header: "Feedback",
      render: renderFeedbackInfo,
    },
    {
      header: "Submitted by",
      className: "whitespace-nowrap",
      render: (submission) => submission.submittedBy,
    },
    {
      header: "Submitted",
      className: "whitespace-nowrap",
      render: (submission) => formatDate(submission.createdAt),
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
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Feedback details</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{submission.payload.details}</p>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Subject</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {submission.payload.subject}
        </p>
      </div>

      {submission.payload.contactMethod && (
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Preferred contact</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {submission.payload.contactMethod}
          </p>
        </div>
      )}

      {renderSubmittedInfo(submission)}

      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Status
        </h3>
        <p className="text-sm capitalize text-gray-700 dark:text-gray-300">
          {submission.status}
        </p>
      </div>

      {renderReviewerInfo(submission)}
    </div>
  ),
});

export default FeedbackApprovalPage;
