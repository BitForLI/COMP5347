import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { QuizProvider, useQuiz } from "../state/quiz";
import { useSearchParams } from "react-router-dom";

function QuizInner() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");

  const {
    loading,
    questions,
    index,
    finished,
    lastScore,
    attemptId,
    loadQuiz,
    answerCurrent,
    submitLastAnswer,
  } = useQuiz();
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!category) {
      setErr("No category selected.");
      return;
    }

    setErr(null);
    loadQuiz(category, 8).catch((e) => setErr(e.message));
  }, [category]);

  useEffect(() => setSelected(null), [index]);

  const q = questions[index];
  const progress = useMemo(
    () => ({
      cur: Math.min(index + 1, questions.length),
      total: questions.length,
    }),
    [index, questions.length],
  );

  const isLastQuestion = questions.length > 0 && index === questions.length - 1;

  async function onSubmitAnswer() {
    if (selected === null) return;
    setErr(null);
    if (!isLastQuestion) {
      answerCurrent(selected);
      return;
    }
    setSubmitting(true);
    try {
      await submitLastAnswer(selected);
    } catch (e) {
      setErr(e.message || "Could not save attempt.");
    } finally {
      setSubmitting(false);
    }
  }

  if (err) return <div className="card error">{err}</div>;
  if (loading) return <div className="card">Loading…</div>;
  if (!questions.length)
    return (
      <div className="card">
        No questions available (need admin to add active questions).
      </div>
    );

  if (finished && lastScore !== null) {
    return (
      <div className="card">
        <h2>Quiz complete</h2>
        <p className="score">
          Final score: <b>{lastScore}</b> / {questions.length}
        </p>
        <p className="muted small">
          Your attempt has been saved to the database
          {attemptId ? ` (attempt id: ${attemptId})` : ""}.
        </p>
        <div className="row" style={{ gap: "12px", marginTop: "16px", flexWrap: "wrap" }}>
          <Link className="btn primary" to="/attempts">
            View past attempts
          </Link>
          <Link className="btn" to="/quiz">
            Choose another category
          </Link>
        </div>
      </div>
    );
  }

  if (submitting && isLastQuestion && lastScore === null) {
    return (
      <div className="card">
        <p>Saving your attempt…</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="row space">
        <h2>Current category: {category}</h2>
        <h2>
          Q{progress.cur}/{progress.total}
        </h2>
      </div>
      <p>{q.prompt}</p>
      {q.imageUrl ? (
        <img className="qimg" src={q.imageUrl} alt="question" />
      ) : null}
      <div className="options">
        {q.options.map((opt, i) => (
          <button
            key={i}
            className={`opt ${selected === i ? "selected" : ""}`}
            type="button"
            onClick={() => setSelected(i)}
          >
            {opt}
          </button>
        ))}
      </div>
      <button
        className="btn primary"
        onClick={() => void onSubmitAnswer()}
        disabled={selected === null || submitting}
        type="button"
      >
        {submitting && isLastQuestion ? "Saving…" : "Lock answer"}
      </button>
      <div className="muted small">Locked answers cannot be changed.</div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <QuizProvider>
      <QuizInner />
    </QuizProvider>
  );
}
