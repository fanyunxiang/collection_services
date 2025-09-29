import { createApprovalPage } from "../_components/createApprovalPage";

const FeedbackApprovalPage = createApprovalPage({
  type: "feedback",
  title: "Feedback Service Approvals",
  description:
    "Review feedback submissions from end users and approve them once they have been addressed.",
  emptyLabel: "There are no feedback submissions waiting for review.",
  columns: [
    {
      header: "Feedback",
      render: (submission) => (
        <div className="space-y-1">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {submission.payload.subject}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 break-words">
            {submission.payload.details}
          </p>
        </div>
      ),
    },
    {
      header: "Submitted by",
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
});

export default FeedbackApprovalPage;
