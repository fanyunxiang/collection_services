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
  title: "医疗证明申请审核",
  description: "审核用户提交的医疗证明申请，确认预约时间和用途说明后再做决定。",
  emptyLabel: "当前没有待审核的医疗证明申请。",
  columns: [
    {
      header: "患者信息",
      render: (submission) => {
        const name = submission.payload.patientName ?? submission.payload.serviceName ?? "—";
        const purpose =
          submission.payload.certificatePurpose ?? submission.payload.notes ?? "—";

        return (
          <div className="space-y-1">
            <p className="font-medium text-gray-900 dark:text-gray-100">{name}</p>
            <p className="text-xs text-gray-600 dark:text-gray-300 break-words">用途：{purpose}</p>
          </div>
        );
      },
    },
    {
      header: "预约时间",
      className: "whitespace-nowrap",
      render: (submission) => formatSchedule(submission),
    },
    {
      header: "提交账号",
      className: "whitespace-nowrap",
      render: (submission) => submission.submittedBy,
    },
    {
      header: "提交时间",
      className: "whitespace-nowrap",
      render: (submission) => new Date(submission.createdAt).toLocaleString(),
    },
    {
      header: "状态",
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
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">患者姓名</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {submission.payload.patientName ?? submission.payload.serviceName ?? "—"}
          </p>
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">预约时间</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">{formatSchedule(submission)}</p>
        </div>
        <div className="space-y-1 md:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">用途说明</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {submission.payload.certificatePurpose ?? submission.payload.notes ?? "—"}
          </p>
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">提交账号</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">{submission.submittedBy}</p>
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">提交时间</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {new Date(submission.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">状态</h3>
          <p className="text-sm capitalize text-gray-700 dark:text-gray-300">{submission.status}</p>
        </div>
        {submission.decisionBy ? (
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">审核人</h3>
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
