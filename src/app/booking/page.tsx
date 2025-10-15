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
  type BookingPayload,
  type SubmissionRecord,
  SUBMISSIONS_STORAGE_KEY,
} from "@/services/submissionService";

function formatAppointmentSlot(date: string, time: string): string {
  if (!date) {
    return "";
  }

  try {
    const datePart = new Date(date).toLocaleDateString();
    if (!time) {
      return datePart;
    }

    return `${datePart} ${time}`;
  } catch (error) {
        return `${date} ${time}`.trim();
  }
}

export default function BookingPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() =>
    getCurrentUser(),
  );
  const [submissions, setSubmissions] = useState<SubmissionRecord<"booking">[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [certificatePurpose, setCertificatePurpose] = useState("");
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
      const records = await listSubmissionsForUser("booking", username);
      setSubmissions(records);
    } catch (submissionError) {
      if (submissionError instanceof Error) {
        setError(submissionError.message);
      } else {
        setError("无法加载医疗证明申请记录。");
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

  const handlePatientNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setPatientName(event.target.value);
    },
    [],
  );

  const handleAppointmentDateChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setAppointmentDate(event.target.value);
    },
    [],
  );

  const handleAppointmentTimeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setAppointmentTime(event.target.value);
    },
    [],
  );

  const handleCertificatePurposeChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setCertificatePurpose(event.target.value);
    },
    [],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setMessage(null);
      setError(null);

      try {
        const payload: BookingPayload = {
          patientName: patientName.trim(),
          appointmentDate,
          appointmentTime,
          certificatePurpose: certificatePurpose.trim(),
        };

        if (!payload.patientName) {
          throw new Error("请填写患者姓名。");
        }

        if (!payload.appointmentDate) {
          throw new Error("请选择希望开具日期。");
        }

        if (!payload.appointmentTime) {
          throw new Error("请选择希望时间。");
        }

        if (!payload.certificatePurpose) {
          throw new Error("请填写开具用途说明。");
        }

        const record = await createSubmission("booking", payload, currentUser);
        setSubmissions((previous) => [record, ...previous]);

        setPatientName("");
        setAppointmentDate("");
        setAppointmentTime("");
        setCertificatePurpose("");
        setMessage("医疗证明申请提交成功。");
        void refreshSubmissions();
      } catch (submissionError) {
        if (submissionError instanceof Error) {
          setError(submissionError.message);
        } else {
          setError("提交医疗证明申请时发生未知错误。");
        }
      }
    },
    [appointmentDate, appointmentTime, certificatePurpose, currentUser, patientName, refreshSubmissions],
  );

  if (!currentUser) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">医疗证明申请</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">请先登录后再提交医疗证明申请。</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">医疗证明申请</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            填写患者信息与开具用途，我们会在审核后尽快反馈结果。
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
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="patientName">
              患者姓名
            </label>
            <input
              id="patientName"
              name="patientName"
              value={patientName}
              onChange={handlePatientNameChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              placeholder="请输入患者姓名"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="appointmentDate">
                希望开具日期
              </label>
              <input
                type="date"
                id="appointmentDate"
                name="appointmentDate"
                value={appointmentDate}
                onChange={handleAppointmentDateChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="appointmentTime">
                希望时间
              </label>
              <input
                type="time"
                id="appointmentTime"
                name="appointmentTime"
                value={appointmentTime}
                onChange={handleAppointmentTimeChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="certificatePurpose">
              开具用途说明
            </label>
            <textarea
              id="certificatePurpose"
              name="certificatePurpose"
              value={certificatePurpose}
              onChange={handleCertificatePurposeChange}
              className="h-24 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              placeholder="请描述需要医疗证明的原因"
              required
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
          查看以往的医疗证明申请与审核状态。
        </p>

        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">患者姓名</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">预约时间</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">用途说明</th>
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
                    目前还没有提交过医疗证明申请。
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => {
                  const patient =
                    submission.payload.patientName ??
                    submission.payload.serviceName ??
                    "—";
                  const appointment = formatAppointmentSlot(
                    submission.payload.appointmentDate ??
                      submission.payload.preferredDate ??
                      "",
                    submission.payload.appointmentTime ??
                      submission.payload.preferredTime ??
                      "",
                  );
                  const purpose =
                    submission.payload.certificatePurpose ??
                    submission.payload.notes ??
                    "—";

                  return (
                    <tr key={submission.id} className="bg-white dark:bg-gray-950">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {patient}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {appointment}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {purpose}
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
