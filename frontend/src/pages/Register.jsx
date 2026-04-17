import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(254),
  password: z.string().min(8).max(72),
});

export default function Register() {
  const nav = useNavigate();
  const { register: doRegister } = useAuth();
  const [serverErr, setServerErr] = useState(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    setServerErr(null);
    setDone(false);
    try {
      await doRegister(values.name, values.email, values.password);
      setDone(true);
      setTimeout(() => nav("/login"), 600);
    } catch (e) {
      setServerErr(e.message);
    }
  }

  return (
    <div className="card">
      <h2>Register</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="form">
        <label>
          Name
          <input autoComplete="name" {...register("name")} />
          {errors.name && <div className="error">{errors.name.message}</div>}
        </label>
        <label>
          Email
          <input autoComplete="email" inputMode="email" {...register("email")} />
          {errors.email && <div className="error">{errors.email.message}</div>}
        </label>
        <label>
          Password
          <input type="password" autoComplete="new-password" {...register("password")} />
          {errors.password && <div className="error">{errors.password.message}</div>}
        </label>
        {serverErr && <div className="error">{serverErr}</div>}
        {done && <div className="ok">Registered. Redirecting to login…</div>}
        <button className="btn primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? "..." : "Create account"}
        </button>
      </form>
    </div>
  );
}

