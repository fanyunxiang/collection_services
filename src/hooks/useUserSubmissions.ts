import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CURRENT_USER_STORAGE_KEY,
  getCurrentUser,
  type CurrentUser,
} from "@/services/authService";
import {
  getSubmissionStorageKey,
  listSubmissionsForUser,
  type SubmissionRecord,
  type SubmissionType,
} from "@/services/submissionService";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

type UseUserSubmissionsResult<T extends SubmissionType> = {
  currentUser: CurrentUser | null;
  username: string;
  submissions: SubmissionRecord<T>[];
  refreshSubmissions: () => void;
};

export function useUserSubmissions<T extends SubmissionType>(
  type: T,
): UseUserSubmissionsResult<T> {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(
    () => getCurrentUser(),
  );
  const [submissions, setSubmissions] = useState<SubmissionRecord<T>[]>([]);

  const username = useMemo(() => currentUser?.username ?? "", [currentUser]);
  const storageKey = useMemo(() => getSubmissionStorageKey(type), [type]);

  const refreshSubmissions = useCallback(() => {
    if (!username) {
      setSubmissions([]);
      return;
    }

    setSubmissions(listSubmissionsForUser(type, username));
  }, [type, username]);

  useEffect(() => {
    refreshSubmissions();
  }, [refreshSubmissions]);

  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (!event.key) {
        setCurrentUser(getCurrentUser());
        refreshSubmissions();
        return;
      }

      if (event.key === CURRENT_USER_STORAGE_KEY) {
        setCurrentUser(getCurrentUser());
        return;
      }

      if (event.key === storageKey) {
        refreshSubmissions();
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [refreshSubmissions, storageKey]);

  return {
    currentUser,
    username,
    submissions,
    refreshSubmissions,
  };
}
