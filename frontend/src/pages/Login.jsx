import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(254),
  password: z.string().min(8).max(72),
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
    <div className="card">
      <h2>Login</h2>
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
          {isSubmitting ? "..." : "Login"}
        </button>
      </form>
    </div>
  );
}

