import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../state/auth";

export default function Home() {
  const { token } = useAuth();
  return (
    <div className="card hero">
      <h2>Single-player Quiz</h2>
      <p className="muted">
        Answer questions in order (4 options each). Once you lock an answer, it cannot be changed. Your
        attempt will be saved when you submit.
      </p>
      {token ? (
        <div className="row">
          <Link className="btn primary" to="/quiz">
            Start Quiz
          </Link>
          <Link className="btn" to="/leaderboard">
            Leaderboard
          </Link>
        </div>
      ) : (
        <div className="row">
          <Link className="btn primary" to="/login">
            Login
          </Link>
          <Link className="btn" to="/register">
            Register
          </Link>
        </div>
      )}
    </div>
  );
}

