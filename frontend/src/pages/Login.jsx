import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("请输入有效邮箱").max(254),
  password: z.string().min(8, "至少 8 个字符").max(72),
});

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [serverErr, setServerErr] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    setServerErr(null);
    try {
      await login(values.email, values.password);
      nav("/");
    } catch (e) {
      setServerErr(e.message);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-banner" role="note">
        <strong>新用户？</strong>请前往「注册」：需邮箱验证码、两次密码一致；当前页仅用于已有账号登录。
      </div>
      <div className="card card--auth">
        <h2>登录</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <label>
            邮箱
            <input autoComplete="email" inputMode="email" {...register("email")} />
            {errors.email && <div className="error">{errors.email.message}</div>}
          </label>
          <label>
            密码
            <input type="password" autoComplete="current-password" {...register("password")} />
            {errors.password && <div className="error">{errors.password.message}</div>}
          </label>
          {serverErr && <div className="error">{serverErr}</div>}
          <button className="btn primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? "…" : "登录"}
          </button>
        </form>
        <p className="muted small" style={{ marginBottom: 0 }}>
          没有账号？ <Link to="/register">前往注册（邮箱验证码）</Link>
        </p>
      </div>
    </div>
  );
}

