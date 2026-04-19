import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../state/auth";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (requireAdmin && user?.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

/** 已登录才显示（如侧栏），不触发跳页；供 /login、/register 等公开页与受保护内容同用一版布局 */
export function ShowWhenAuthed({ children }) {
  const { token } = useAuth();
  if (!token) return null;
  return children;
}

