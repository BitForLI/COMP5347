import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";

const passwordField = z
  .string()
  .min(8, "至少 8 个字符")
  .max(72)
  .regex(/[A-Za-z]/, "须包含至少一个字母")
  .regex(/[0-9]/, "须包含至少一个数字");

const schema = z
  .object({
    email: z.string().trim().toLowerCase().email("请输入有效邮箱").max(254),
    password: passwordField,
    confirmPassword: z.string().min(1, "请再次输入密码"),
    code: z.string().regex(/^\d{6}$/, "请输入 6 位数字验证码"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "两次密码不一致",
    path: ["confirmPassword"],
  });

export default function Register() {
  const nav = useNavigate();
  const { sendRegisterCode, registerAccount } = useAuth();
  const [serverErr, setServerErr] = useState(null);
  const [sendErr, setSendErr] = useState(null);
  const [done, setDone] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    trigger,
  } = useForm({ resolver: zodResolver(schema), mode: "onBlur" });

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const id = setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  async function onSendCode() {
    setSendErr(null);
    const ok = await trigger("email");
    if (!ok) return;
    try {
      await sendRegisterCode(getValues("email"));
      setCooldown(60);
    } catch (e) {
      setSendErr(e.message);
    }
  }

  async function onSubmit(values) {
    setServerErr(null);
    setDone(false);
    try {
      await registerAccount({
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        code: values.code,
      });
      setDone(true);
      setTimeout(() => nav("/login", { replace: true }), 900);
    } catch (e) {
      setServerErr(e.message);
    }
  }

  return (
    <div className="auth-page">
      <div className="card card--auth">
        <h2>注册</h2>
        <p className="muted small" style={{ marginTop: 0 }}>
          使用邮箱收取验证码，验证通过后即可完成注册，然后前往登录。
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <label>
            邮箱
            <div className="row" style={{ gap: "10px", alignItems: "stretch", flexWrap: "wrap" }}>
              <input
                style={{ flex: "1 1 180px", minWidth: 0 }}
                autoComplete="email"
                inputMode="email"
                {...register("email")}
              />
              <button
                className="btn btn-register-send"
                type="button"
                disabled={cooldown > 0}
                onClick={() => void onSendCode()}
              >
                {cooldown > 0 ? `${cooldown}s 后可重发` : "发送验证码"}
              </button>
            </div>
            {errors.email && <div className="error">{errors.email.message}</div>}
          </label>
          {sendErr && <div className="error">{sendErr}</div>}

          <label>
            验证码（6 位数字）
            <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} {...register("code")} />
            {errors.code && <div className="error">{errors.code.message}</div>}
          </label>

          <label>
            密码
            <input type="password" autoComplete="new-password" {...register("password")} />
            {errors.password && <div className="error">{errors.password.message}</div>}
          </label>
          <label>
            确认密码
            <input type="password" autoComplete="new-password" {...register("confirmPassword")} />
            {errors.confirmPassword && <div className="error">{errors.confirmPassword.message}</div>}
          </label>

          {serverErr && <div className="error">{serverErr}</div>}
          {done && <div className="ok">注册成功，正在跳转到登录页…</div>}
          <button className="btn primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? "…" : "完成注册"}
          </button>
        </form>
        <p className="muted small" style={{ marginBottom: 0 }}>
          已有账号？ <Link to="/login">去登录</Link>
        </p>
      </div>
    </div>
  );
}
