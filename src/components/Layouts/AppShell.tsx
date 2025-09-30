"use client";

import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";
import {
  CURRENT_USER_STORAGE_KEY,
  type CurrentUser,
  getCurrentUser,
} from "@/services/authService";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { getDefaultRouteForRole } from "./sidebar/data";

const AUTH_ROUTE_PREFIXES = ["/login"];

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const isAuthRoute = pathname
    ? AUTH_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    : false;

  const defaultRoute = useMemo(() => {
    return getDefaultRouteForRole(currentUser?.role ?? null);
  }, [currentUser]);

  useEffect(() => {
    const user = getCurrentUser();
    const authenticated = Boolean(user);

    setIsAuthenticated(authenticated);
    setCurrentUser(user);
    setHydrated(true);

    if (!authenticated && !isAuthRoute) {
      router.replace("/login");
      return;
    }

    if (!user) {
      return;
    }

    if (isAuthRoute && pathname !== defaultRoute) {
      router.replace(defaultRoute);
      return;
    }

    if (pathname === "/" && pathname !== defaultRoute) {
      router.replace(defaultRoute);
    }
  }, [defaultRoute, isAuthRoute, pathname, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key && event.key !== CURRENT_USER_STORAGE_KEY) {
        return;
      }

      const user = getCurrentUser();
      const authenticated = Boolean(user);

      setIsAuthenticated(authenticated);
      setCurrentUser(user);

      if (!authenticated && !isAuthRoute) {
        router.replace("/login");
        return;
      }

      if (!user) {
        return;
      }

      const nextDefaultRoute = getDefaultRouteForRole(user.role);

      if (isAuthRoute && pathname !== nextDefaultRoute) {
        router.replace(nextDefaultRoute);
        return;
      }

      if (pathname === "/" && pathname !== nextDefaultRoute) {
        router.replace(nextDefaultRoute);
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [isAuthRoute, pathname, router]);

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
