"use client";

import AuthForm, { type AuthFormMode } from "@/components/Auth/AuthForm";
import { cn } from "@/lib/utils";
import { useState } from "react";

const tabs: { key: AuthFormMode; label: string }[] = [
  {
    key: "login",
    label: "Sign in",
  },
  {
    key: "register",
    label: "Create account",
  },
];

export default function Signin() {
  const [activeTab, setActiveTab] = useState<AuthFormMode>("login");

  return (
    <div>
      <div className="mb-7 flex flex-col gap-2">
        <div className="flex gap-2 rounded-lg bg-gray-2 p-1 text-body-sm font-medium dark:bg-dark-3">
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "group flex-1 rounded-md px-5 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isActive
                    ? "bg-white shadow-1 dark:bg-dark-2"
                    : "bg-transparent",
                )}
              >
                <span
                  className={cn(
                    "block text-base font-semibold",
                    isActive ? "text-primary" : "text-dark dark:text-white",
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <AuthForm mode={activeTab} />
    </div>
  );
}
