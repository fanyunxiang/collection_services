"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  CURRENT_USER_STORAGE_KEY,
  getCurrentUser,
  type CurrentUser,
} from "@/services/authService";
import {
  createSubmission,
  listSubmissionsForUser,
  type FeedbackPayload,
  type SubmissionRecord,
  SUBMISSIONS_STORAGE_KEY,
} from "@/services/submissionService";

export default function FeedbackPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() =>
    getCurrentUser(),
  );
  const [submissions, setSubmissions] = useState<SubmissionRecord<"feedback">[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [applicantName, setApplicantName] = useState("");
  const [licenseType, setLicenseType] = useState("");
  const [applicationReason, setApplicationReason] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const username = useMemo(() => currentUser?.username ?? "", [currentUser]);

  const refreshSubmissions = useCallback(async () => {
    if (!username) {
      setSubmissions([]);
      return;
    }

    setIsLoading(true);

    try {
      setError(null);
      const records = await listSubmissionsForUser("feedback", username);
      setSubmissions(records);
    } catch (submissionError) {
      if (submissionError instanceof Error) {
        setError(submissionError.message);
      } else {
        setError("无法加载驾照申请记录。");
      }
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    void refreshSubmissions();
  }, [refreshSubmissions]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleStorageChange = (event: StorageEvent) => {
      const isUserChange =
        event.key === CURRENT_USER_STORAGE_KEY || event.key === null;
      const isSubmissionChange =
        event.key === SUBMISSIONS_STORAGE_KEY || event.key === null;

      if (isUserChange) {
        setCurrentUser(getCurrentUser());
      }

      if (isSubmissionChange || isUserChange) {
        void refreshSubmissions();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refreshSubmissions]);

  const handleApplicantNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setApplicantName(event.target.value);
    },
    [],
  );

  const handleLicenseTypeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setLicenseType(event.target.value);
    },
    [],
  );

  const handleApplicationReasonChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setApplicationReason(event.target.value);
    },
    [],
  );

  const handleContactNumberChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setContactNumber(event.target.value);
    },
    [],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setMessage(null);
      setError(null);

      try {
        const payload: FeedbackPayload = {
          applicantName: applicantName.trim(),
          licenseType: licenseType.trim(),
          applicationReason: applicationReason.trim(),
          contactNumber: contactNumber.trim() || undefined,
        };

        if (!payload.applicantName) {
          throw new Error("请填写申请人姓名。");
        }

        if (!payload.licenseType) {
          throw new Error("请填写申请驾照类型。");
        }

        if (!payload.applicationReason) {
          throw new Error("请填写申请原因。");
        }

        const record = await createSubmission(
          "feedback",
          payload,
          currentUser,
        );
        setSubmissions((previous) => [record, ...previous]);

        setApplicantName("");
        setLicenseType("");
        setApplicationReason("");
        setContactNumber("");
        setMessage("驾照申请提交成功。");
        void refreshSubmissions();
      } catch (submissionError) {
        if (submissionError instanceof Error) {
          setError(submissionError.message);
        } else {
          setError("提交驾照申请时发生未知错误。");
        }
      }
    },
    [applicantName, applicationReason, contactNumber, currentUser, licenseType, refreshSubmissions],
  );

  if (!currentUser) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">驾照申请</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">请先登录后再提交驾照申请。</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">驾照申请</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            填写个人信息和申请原因，我们会尽快审核您的驾照申请。
          </p>
        </div>

        {message && (
          <p className="mb-4 rounded-md bg-green-50 px-4 py-2 text-sm text-green-700">
            {message}
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="applicantName">
              申请人姓名
            </label>
            <input
              id="applicantName"
              name="applicantName"
              value={applicantName}
              onChange={handleApplicantNameChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              placeholder="请输入身份证上的姓名"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="licenseType">
              申请驾照类型
            </label>
            <input
              id="licenseType"
              name="licenseType"
              value={licenseType}
              onChange={handleLicenseTypeChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              placeholder="例如 C1、C2 等"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="applicationReason">
              申请原因
            </label>
            <textarea
              id="applicationReason"
              name="applicationReason"
              value={applicationReason}
              onChange={handleApplicationReasonChange}
              className="h-32 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              placeholder="请说明申请驾照的原因"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="contactNumber">
              联系电话（选填）
            </label>
            <input
              id="contactNumber"
              name="contactNumber"
              value={contactNumber}
              onChange={handleContactNumberChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              placeholder="用于通知审核结果的联系方式"
            />
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            提交申请
          </button>
        </form>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">申请记录</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          查看以往的驾照申请及审核进度。
        </p>

        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">申请人</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">驾照类型</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">申请原因</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">提交时间</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                    colSpan={5}
                  >
                    正在加载申请记录…
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                    colSpan={5}
                  >
                    目前还没有提交过驾照申请。
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => {
                  const applicant =
                    submission.payload.applicantName ??
                    submission.payload.subject ??
                    "—";
                  const license = submission.payload.licenseType ?? "—";
                  const reason =
                    submission.payload.applicationReason ??
                    submission.payload.details ??
                    "—";

                  return (
                    <tr key={submission.id} className="bg-white dark:bg-gray-950">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {applicant}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {license}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {reason}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {new Date(submission.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium capitalize text-gray-900 dark:text-gray-100">
                        {submission.status}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
