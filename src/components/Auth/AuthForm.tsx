"use client";

import { EmailIcon, PasswordIcon, UserIcon } from "@/assets/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import { Alert } from "@/components/ui-elements/alert";
import { Checkbox } from "@/components/FormElements/checkbox";
import { cn } from "@/lib/utils";
import { login, register } from "@/services/authService";
import { useEffect, useMemo, useState } from "react";

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
  role: string;
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
  role: "user",
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
          throw new Error("请输入用户名或邮箱");
        }

        if (!loginState.password) {
          throw new Error("请输入密码");
        }

        setLoading(true);

        const response = await login({
          identifier: loginState.identifier.trim(),
          password: loginState.password,
        });

        setFeedback({
          variant: "success",
          message: response.message || "登录成功",
        });

        setLoginState(LOGIN_INITIAL_STATE);
        return;
      }

      if (!registerState.username.trim()) {
        throw new Error("请输入用户名");
      }

      if (!registerState.password) {
        throw new Error("请输入密码");
      }

      if (registerState.password !== registerState.confirmPassword) {
        throw new Error("两次输入的密码不一致");
      }

      setLoading(true);

      const response = await register({
        username: registerState.username.trim(),
        password: registerState.password,
        email: registerState.email.trim() || undefined,
        role: registerState.role.trim() || undefined,
      });

      setFeedback({
        variant: "success",
        message: response.message || "注册成功",
      });

      setRegisterState(REGISTER_INITIAL_STATE);
    } catch (error) {
      const message = error instanceof Error ? error.message : "提交失败";
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
          title={feedback.variant === "success" ? "操作成功" : "操作失败"}
          description={feedback.message}
        />
      )}

      {mode === "register" && (
        <InputGroup
          type="text"
          label="用户名"
          placeholder="请输入用户名"
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
          label="用户名或邮箱"
          placeholder="请输入用户名或邮箱"
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
          label="邮箱（可选）"
          placeholder="请输入邮箱，默认将根据用户名生成"
          name="email"
          handleChange={handleChange}
          value={(currentState as RegisterState).email}
          iconPosition="left"
          icon={<EmailIcon className="text-dark-4" />}
        />
      )}

      <InputGroup
        type="password"
        label="密码"
        placeholder={mode === "login" ? "请输入密码" : "请设置密码"}
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
          label="确认密码"
          placeholder="请再次输入密码"
          name="confirmPassword"
          handleChange={handleChange}
          value={(currentState as RegisterState).confirmPassword}
          iconPosition="left"
          icon={<PasswordIcon className="text-dark-4" />}
          required
        />
      )}

      {mode === "register" && (
        <InputGroup
          type="text"
          label="角色（可选）"
          placeholder="例如：user 或 admin"
          name="role"
          handleChange={handleChange}
          value={(currentState as RegisterState).role}
          iconPosition="left"
          icon={<UserIcon className="text-dark-4" />}
        />
      )}

      {mode === "login" && (
        <div className="flex items-center justify-between text-body-sm font-medium">
          <Checkbox
            label="记住我"
            name="remember"
            minimal
            radius="md"
            withIcon="check"
            onChange={handleCheckboxChange}
          />

          <span className="text-dark-4">忘记密码？</span>
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
        {mode === "login" ? "立即登录" : "创建账号"}
        {loading && (
          <span className="inline-block size-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
        )}
      </button>
    </form>
  );
}

export type { AuthFormMode };
