"use client";

import { createApprovalPage } from "../_components/createApprovalPage";
import { formatDate } from "@/lib/tools";

// Helper render functions
const renderApplicationInfo = (submission: any) => {
  const applicant =
    submission.payload.applicantName ?? submission.payload.subject ?? "—";
  const reason =
    submission.payload.applicationReason ?? submission.payload.details ?? "—";

  return (
    <div className="space-y-1">
      <p className="font-medium text-gray-900 dark:text-gray-100">{applicant}</p>
      <p className="text-xs text-gray-600 dark:text-gray-300 break-words">
        Reason: {reason}
      </p>
    </div>
  );
};

const renderSubmittedInfo = (submission: any) => (
  <div className="space-y-1">
    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Submitted</h3>
    <p className="text-sm text-gray-700 dark:text-gray-300">
      {formatDate(submission.createdAt)}
    </p>
  </div>
);

const renderReviewerInfo = (submission: any) =>
  submission.decisionBy ? (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Reviewer</h3>
      <p className="text-sm text-gray-700 dark:text-gray-300">
        {submission.decisionBy}
        {submission.decidedAt ? ` · ${formatDate(submission.decidedAt)}` : ""}
      </p>
    </div>
  ) : null;

// Main component
const FeedbackApprovalPage = createApprovalPage({
  type: "feedback",
  title: "Driver's License Application Reviews",
  description: "Review driver's license applications and confirm the details before approving.",
  emptyLabel: "There are no driver's license applications awaiting review.",
  columns: [
    {
      header: "Applicant",
      render: renderApplicationInfo,
    },
    {
      header: "License Class",
      className: "whitespace-nowrap",
      render: (submission) => submission.payload.licenseType ?? "—",
    },
    {
      header: "Contact Number",
      className: "whitespace-nowrap",
      render: (submission) =>
        submission.payload.contactNumber ?? submission.payload.contactMethod ?? "—",
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
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Applicant</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {submission.payload.applicantName ?? submission.payload.subject ?? "—"}
        </p>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">License Class</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {submission.payload.licenseType ?? "—"}
        </p>
      </div>

      <div className="space-y-1 md:col-span-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Application Reason</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {submission.payload.applicationReason ?? submission.payload.details ?? "—"}
        </p>
      </div>

      {submission.payload.contactNumber || submission.payload.contactMethod ? (
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Contact Number</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {submission.payload.contactNumber ?? submission.payload.contactMethod}
          </p>
        </div>
      ) : null}

      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Submitted By</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{submission.submittedBy}</p>
      </div>

      {renderSubmittedInfo(submission)}

      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Status</h3>
        <p className="text-sm capitalize text-gray-700 dark:text-gray-300">
          {submission.status}
        </p>
      </div>

      {renderReviewerInfo(submission)}
    </div>
  ),
});

export default FeedbackApprovalPage;
