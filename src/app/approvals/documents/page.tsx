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
});

export default DocumentApprovalPage;
