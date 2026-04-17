import React, { useEffect, useState } from "react";
import { api, unwrap } from "../api/api";

export default function Attempts() {
  const [attempts, setAttempts] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api
      .get("/quiz/attempts")
      .then(unwrap)
      .then((d) => setAttempts(d.attempts || []))
      .catch((e) => setErr(e.message));
  }, []);

  if (err) return <div className="card error">{err}</div>;

  return (
    <div className="card">
      <h2>My Attempts</h2>
      <div className="list">
        {attempts.map((a) => (
          <div key={a._id} className="item">
            <div>
              <b>Score:</b> {a.score}
            </div>
            <div className="muted small">{a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}</div>
            <div className="muted small">Answers saved: {a.answers?.length || 0}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

