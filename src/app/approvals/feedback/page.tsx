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
        原因：{reason}
      </p>
    </div>
  );
};

const renderSubmittedInfo = (submission: any) => (
  <div className="space-y-1">
    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">提交时间</h3>
    <p className="text-sm text-gray-700 dark:text-gray-300">
      {formatDate(submission.createdAt)}
    </p>
  </div>
);

const renderReviewerInfo = (submission: any) =>
  submission.decisionBy ? (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">审核人</h3>
      <p className="text-sm text-gray-700 dark:text-gray-300">
        {submission.decisionBy}
        {submission.decidedAt ? ` · ${formatDate(submission.decidedAt)}` : ""}
      </p>
    </div>
  ) : null;

// Main component
const FeedbackApprovalPage = createApprovalPage({
  type: "feedback",
  title: "驾照申请审核",
  description: "审核用户提交的驾照申请，确认信息无误后再进行批准。",
  emptyLabel: "当前没有待审核的驾照申请。",
  columns: [
    {
      header: "申请人",
      render: renderApplicationInfo,
    },
    {
      header: "驾照类型",
      className: "whitespace-nowrap",
      render: (submission) => submission.payload.licenseType ?? "—",
    },
    {
      header: "联系电话",
      className: "whitespace-nowrap",
      render: (submission) =>
        submission.payload.contactNumber ?? submission.payload.contactMethod ?? "—",
    },
    {
      header: "提交时间",
      className: "whitespace-nowrap",
      render: (submission) => formatDate(submission.createdAt),
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
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">申请人</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {submission.payload.applicantName ?? submission.payload.subject ?? "—"}
        </p>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">驾照类型</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {submission.payload.licenseType ?? "—"}
        </p>
      </div>

      <div className="space-y-1 md:col-span-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">申请原因</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {submission.payload.applicationReason ?? submission.payload.details ?? "—"}
        </p>
      </div>

      {submission.payload.contactNumber || submission.payload.contactMethod ? (
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">联系电话</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {submission.payload.contactNumber ?? submission.payload.contactMethod}
          </p>
        </div>
      ) : null}

      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">提交账号</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{submission.submittedBy}</p>
      </div>

      {renderSubmittedInfo(submission)}

      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">状态</h3>
        <p className="text-sm capitalize text-gray-700 dark:text-gray-300">
          {submission.status}
        </p>
      </div>

      {renderReviewerInfo(submission)}
    </div>
  ),
});

export default FeedbackApprovalPage;
