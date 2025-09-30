import Signin from "@/components/Auth/Signin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen bg-gray-2 dark:bg-[#020d1a]">
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-primary/10 p-12 text-white dark:bg-primary/20 lg:flex">
        <div className="max-w-xl text-left">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/70">
            Collection Services
          </p>
          <h1 className="mb-6 text-4xl font-bold leading-tight">
            Your data operations dashboard
          </h1>
          <p className="text-base text-white/80">
            Sign in to continue where you left off or create a new account to
            unlock analytics, automation, and more.
          </p>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(87,80,241,0.3),transparent_60%)]" />
      </div>

      <div className="flex w-full flex-col justify-center px-6 py-16 sm:px-12 lg:w-[480px] lg:px-16 xl:w-[520px]">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="space-y-3 text-left">
            <h2 className="text-3xl font-semibold text-dark dark:text-white">
              Welcome back
            </h2>
            <p className="text-base text-dark-4 dark:text-dark-6">
              Sign in to access your workspace or create a new account in a few
              steps.
            </p>
          </div>

          <Signin />
        </div>
      </div>
    </div>
  );
}
