import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(254),
  password: z.string().min(8, "At least 8 characters.").max(72),
});

export default function AdminLogin() {
  const nav = useNavigate();
  const { login, logout } = useAuth();
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
      const stored = JSON.parse(localStorage.getItem("user") || "null");
      if (stored?.role !== "admin") {
        logout();
        setServerErr("This account is not an admin.");
        return;
      }
      nav("/admin");
    } catch (e) {
      setServerErr(e.message);
    }
  }

  return (
    <div className="auth-page">
      <div className="card card--auth">
        <h2>Admin sign in</h2>
        <p className="muted small">Restricted to admin accounts.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <label>
            Email
            <input autoComplete="email" inputMode="email" {...register("email")} />
            {errors.email && <div className="error">{errors.email.message}</div>}
          </label>
          <label>
            Password
            <input type="password" autoComplete="current-password" {...register("password")} />
            {errors.password && <div className="error">{errors.password.message}</div>}
          </label>
          {serverErr && <div className="error">{serverErr}</div>}
          <button className="btn primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? "…" : "Sign in"}
          </button>
        </form>
        <p className="muted small" style={{ marginBottom: 0 }}>
          Not an admin? <Link to="/login">Player login</Link>
        </p>
      </div>
    </div>
  );
}
