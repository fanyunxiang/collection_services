"use client";

import { EmailIcon, PasswordIcon, UserIcon } from "@/assets/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import { Alert } from "@/components/ui-elements/alert";
import { Checkbox } from "@/components/FormElements/checkbox";
import { cn } from "@/lib/utils";
import { login, register } from "@/services/authService";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type AuthFormMode = "login" | "register";

type LoginState = {
  identifier: string;
  password: string;
  remember: boolean;
};

type RegisterState = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type Feedback = {
  variant: "success" | "error";
  message: string;
};

const LOGIN_INITIAL_STATE: LoginState = {
  identifier: "",
  password: "",
  remember: false,
};

const REGISTER_INITIAL_STATE: RegisterState = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

interface AuthFormProps {
  mode: AuthFormMode;
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [loginState, setLoginState] = useState<LoginState>(LOGIN_INITIAL_STATE);
  const [registerState, setRegisterState] = useState<RegisterState>(
    REGISTER_INITIAL_STATE,
  );
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setFeedback(null);

    if (mode === "login") {
      setLoginState(LOGIN_INITIAL_STATE);
      return;
    }

    setRegisterState(REGISTER_INITIAL_STATE);
  }, [mode]);

  const currentState = useMemo(
    () => (mode === "login" ? loginState : registerState),
    [mode, loginState, registerState],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;

    if (mode === "login") {
      setLoginState((previous) => ({ ...previous, [name]: value }));
      return;
    }

    setRegisterState((previous) => ({ ...previous, [name]: value }));
  };

  const handleCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    if (mode !== "login") return;

    const { checked } = event.target;
    setLoginState((previous) => ({ ...previous, remember: checked }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setFeedback(null);

    try {
      if (mode === "login") {
        if (!loginState.identifier.trim()) {
          throw new Error("Please enter a username or email.");
        }

        if (!loginState.password) {
          throw new Error("Please enter your password.");
        }

        setLoading(true);

        const response = await login({
          identifier: loginState.identifier.trim(),
          password: loginState.password,
          remember: loginState.remember,
        });

        setFeedback({
          variant: "success",
          message: response.message || "Signed in successfully.",
        });

        setLoginState(LOGIN_INITIAL_STATE);
        router.replace("/");
        return;
      }

      if (!registerState.username.trim()) {
        throw new Error("Please enter a username.");
      }

      if (!registerState.password) {
        throw new Error("Please enter your password.");
      }

      if (registerState.password !== registerState.confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      setLoading(true);

      const response = await register({
        username: registerState.username.trim(),
        password: registerState.password,
        email: registerState.email.trim() || undefined,
      });

      setFeedback({
        variant: "success",
        message: response.message || "Account created successfully.",
      });

      setRegisterState(REGISTER_INITIAL_STATE);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Submission failed.";
      setFeedback({ variant: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {feedback && (
        <Alert
          variant={feedback.variant}
          title={feedback.variant === "success" ? "Success" : "Error"}
          description={feedback.message}
        />
      )}

      {mode === "register" && (
        <InputGroup
          type="text"
          label="Username"
          placeholder="Enter your username"
          name="username"
          handleChange={handleChange}
          value={(currentState as RegisterState).username}
          iconPosition="left"
          icon={<UserIcon className="text-dark-4" />}
          required
        />
      )}

      {mode === "login" && (
        <InputGroup
          type="text"
          label="Username or email"
          placeholder="Enter your username or email"
          name="identifier"
          handleChange={handleChange}
          value={(currentState as LoginState).identifier}
          iconPosition="left"
          icon={<UserIcon className="text-dark-4" />}
          required
        />
      )}

      {mode === "register" && (
        <InputGroup
          type="email"
          label="Email (optional)"
          placeholder="Enter an email or leave blank to auto-generate"
          name="email"
          handleChange={handleChange}
          value={(currentState as RegisterState).email}
          iconPosition="left"
          icon={<EmailIcon className="text-dark-4" />}
        />
      )}

      <InputGroup
        type="password"
        label="Password"
        placeholder={
          mode === "login" ? "Enter your password" : "Create a password"
        }
        name="password"
        handleChange={handleChange}
        value={currentState.password}
        iconPosition="left"
        icon={<PasswordIcon className="text-dark-4" />}
        required
      />

      {mode === "register" && (
        <InputGroup
          type="password"
          label="Confirm password"
          placeholder="Re-enter your password"
          name="confirmPassword"
          handleChange={handleChange}
          value={(currentState as RegisterState).confirmPassword}
          iconPosition="left"
          icon={<PasswordIcon className="text-dark-4" />}
          required
        />
      )}

      {mode === "login" && (
        <div className="flex items-center justify-between text-body-sm font-medium">
          <Checkbox
            label="Remember me"
            name="remember"
            minimal
            radius="md"
            withIcon="check"
            onChange={handleCheckboxChange}
          />

          <span className="text-dark-4">Forgot password?</span>
        </div>
      )}

      <button
        type="submit"
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90",
          loading && "cursor-not-allowed opacity-80",
        )}
        disabled={loading}
      >
        {mode === "login" ? "Sign in" : "Create account"}
        {loading && (
          <span className="inline-block size-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
        )}
      </button>
    </form>
  );
}

export type { AuthFormMode };
