"use client";

import { createApprovalPage } from "../_components/createApprovalPage";

function formatOptionalDate(value: string | undefined | null): string {
  if (!value) {
    return "未填写";
  }

  try {
    return new Date(`${value}T00:00`).toLocaleDateString();
  } catch (error) {
    return value;
  }
}

const DocumentApprovalPage = createApprovalPage({
  type: "document",
  title: "退税申请审核",
  description: "审核用户提交的退税申请，确认纳税信息与退款原因后再进行处理。",
  emptyLabel: "当前没有待审核的退税申请。",
  columns: [
    {
      header: "纳税人",
      render: (submission) => (
        <div className="space-y-1">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {submission.payload.taxpayerName ?? submission.payload.documentType ?? "—"}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 break-words">
            原因：{submission.payload.refundReason ?? submission.payload.justification ?? "—"}
          </p>
        </div>
      ),
    },
    {
      header: "申请年份",
      className: "whitespace-nowrap",
      render: (submission) => submission.payload.taxYear ?? "—",
    },
    {
      header: "预计到账日期",
      className: "whitespace-nowrap",
      render: (submission) =>
        formatOptionalDate(
          submission.payload.expectedPayoutDate ?? submission.payload.requiredBy,
        ),
    },
    {
      header: "提交账号",
      className: "whitespace-nowrap",
      render: (submission) => submission.submittedBy,
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
  renderDetails: (submission) => (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">纳税人</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {submission.payload.taxpayerName ?? submission.payload.documentType ?? "—"}
        </p>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">申请年份</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {submission.payload.taxYear ?? "—"}
        </p>
      </div>
      <div className="space-y-1 md:col-span-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">退款原因</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {submission.payload.refundReason ?? submission.payload.justification ?? "—"}
        </p>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">预计到账日期</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {formatOptionalDate(
            submission.payload.expectedPayoutDate ?? submission.payload.requiredBy,
          )}
        </p>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">提交账号</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{submission.submittedBy}</p>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">提交时间</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{new Date(submission.createdAt).toLocaleString()}</p>
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
  ),
});

export default DocumentApprovalPage;
