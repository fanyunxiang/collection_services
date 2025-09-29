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
});

export default BookingApprovalPage;
