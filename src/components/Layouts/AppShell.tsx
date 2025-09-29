"use client";

import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";
import {
  CURRENT_USER_STORAGE_KEY,
  getCurrentUser,
} from "@/services/authService";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type PropsWithChildren } from "react";

const AUTH_ROUTE_PREFIXES = ["/login"];

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isAuthRoute = pathname
    ? AUTH_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    : false;

  useEffect(() => {
    const user = getCurrentUser();
    const authenticated = Boolean(user);

    setIsAuthenticated(authenticated);
    setHydrated(true);

    if (!authenticated && !isAuthRoute) {
      router.replace("/login");
      return;
    }

    if (authenticated && isAuthRoute) {
      router.replace("/");
    }
  }, [isAuthRoute, pathname, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key !== CURRENT_USER_STORAGE_KEY) {
        return;
      }

      const user = getCurrentUser();
      const authenticated = Boolean(user);

      setIsAuthenticated(authenticated);

      if (!authenticated && !isAuthRoute) {
        router.replace("/login");
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [isAuthRoute, router]);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (!hydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="w-full bg-gray-2 dark:bg-[#020d1a]">
        <Header />

        <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
