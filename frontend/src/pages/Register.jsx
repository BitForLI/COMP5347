import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";

const passwordField = z
  .string()
  .min(8, "At least 8 characters.")
  .max(72)
  .regex(/[A-Za-z]/, "Include at least one letter.")
  .regex(/[0-9]/, "Include at least one number.");

const schema = z
  .object({
    email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(254),
    password: passwordField,
    confirmPassword: z.string().min(1, "Confirm your password."),
    code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match.",
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
        <h2>Register</h2>
        <p className="muted small" style={{ marginTop: 0 }}>
          We’ll email you a verification code. Enter it below with your password to create your account.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <label>
            Email
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
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Send code"}
              </button>
            </div>
            {errors.email && <div className="error">{errors.email.message}</div>}
          </label>
          {sendErr && <div className="error">{sendErr}</div>}

          <label>
            Verification code (6 digits)
            <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} {...register("code")} />
            {errors.code && <div className="error">{errors.code.message}</div>}
          </label>

          <label>
            Password
            <input type="password" autoComplete="new-password" {...register("password")} />
            {errors.password && <div className="error">{errors.password.message}</div>}
          </label>
          <label>
            Confirm password
            <input type="password" autoComplete="new-password" {...register("confirmPassword")} />
            {errors.confirmPassword && <div className="error">{errors.confirmPassword.message}</div>}
          </label>

          {serverErr && <div className="error">{serverErr}</div>}
          {done && <div className="ok">Success. Redirecting to log in…</div>}
          <button className="btn primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? "…" : "Create account"}
          </button>
        </form>
        <p className="muted small" style={{ marginBottom: 0 }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
