import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../state/auth";

export default function TopBar() {
  const { user, token, logout } = useAuth();

  return (
    <div className="topbar">
      <div className="left">
        <Link to="/homepage" className="brand">
          Quiz Game
        </Link>
      </div>
      <div className="right">
        {token ? (
          <>
            <span className="muted small">{user?.name || user?.email}</span>
            <button className="btn" type="button" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </div>
  );
}

