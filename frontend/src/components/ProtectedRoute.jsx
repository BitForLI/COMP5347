import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../state/auth";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (requireAdmin && user?.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

