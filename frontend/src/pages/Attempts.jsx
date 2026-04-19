import React, { useEffect, useState } from "react";
import { api, unwrap } from "../api/api";

function formatWhen(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return String(iso);
  }
}

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
      <h2>My past quiz attempts</h2>
      <p className="muted small" style={{ marginTop: 0 }}>
        Each attempt includes your score, time, and the options you selected for every question.
      </p>
      <div className="list">
        {attempts.length === 0 ? (
          <p className="muted">No attempts yet. Complete a quiz from the Categories page.</p>
        ) : (
          attempts.map((a) => (
            <details key={a.id || a._id} className="item attempt-detail">
              <summary className="attempt-summary">
                <span>
                  <b>
                    Score {a.score}
                  </b>
                  <span className="muted small"> / {a.answers?.length || 0} questions</span>
                </span>
                <span className="muted small">{formatWhen(a.createdAt)}</span>
              </summary>
              <div className="attempt-answers">
                {(a.answers || []).map((ans, i) => (
                  <div key={`${a.id || a._id}-q-${i}`} className="answer-row">
                    <div className="answer-prompt">
                      <span className="muted small">Q{i + 1}</span> {ans.prompt || "(Question no longer available)"}
                    </div>
                    <div className="answer-meta">
                      <span>Your answer: {ans.selectedText ?? "—"}</span>
                      <span className={`pill ${ans.isCorrect ? "on" : "off"}`}>
                        {ans.isCorrect ? "Correct" : "Incorrect"}
                      </span>
                    </div>
                    {!ans.isCorrect && ans.correctText != null ? (
                      <div className="muted small">Correct answer: {ans.correctText}</div>
                    ) : null}
                  </div>
                ))}
              </div>
            </details>
          ))
        )}
      </div>
    </div>
  );
}
