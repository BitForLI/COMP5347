import React from "react";
import { useAuth } from "../state/auth";

export default function Homepage() {
  const { user } = useAuth();

  return (
    <div className="stack">
      <div className="card">
        <div className="row space">
          <div>
            <h2 style={{ margin: "6px 0 0" }}>Q1/8</h2>
          </div>
          <div className="row">
            {user?.role === "admin" ? <span className="pill">admin</span> : null}
          </div>
        </div>

        <p style={{ marginTop: 12 }}>
          Which option best describes the MERN stack used in this project?
        </p>

        <img
          className="qimg"
          src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=60"
          alt="question"
        />

        <div className="options">
          <button className="opt selected" type="button">
            MongoDB + Express + React + Node.js
          </button>
          <button className="opt" type="button">
            MySQL + Ember + Redis + Nginx
          </button>
          <button className="opt" type="button">
            MongoDB + Electron + Rust + Next.js
          </button>
          <button className="opt" type="button">
            MariaDB + Express + Rails + Node.js
          </button>
        </div>

        {/* action area intentionally omitted in template */}
      </div>
    </div>
  );
}

