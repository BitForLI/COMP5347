import React, { useEffect, useState } from "react";
import { api, unwrap } from "../api/api";

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api
      .get("/quiz/leaderboard")
      .then(unwrap)
      .then((d) => setRows(d.leaderboard || []))
      .catch((e) => setErr(e.message));
  }, []);

  if (err) return <div className="card error">{err}</div>;

  return (
    <div className="card">
      <h2>Leaderboard</h2>
      <div className="muted small">
        Current behavior: shows all attempts (you may change this to “best attempt per user” and document it in
        the README).
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>User</th>
            <th>Score</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx}>
              <td>{r.name || r.email || "Unknown"}</td>
              <td>{r.score}</td>
              <td className="muted small">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

