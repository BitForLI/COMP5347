import React, { useEffect, useMemo, useState } from "react";
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
    loadQuiz,
    answerCurrent,
    submit,
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

  async function onSubmitAnswer() {
    if (selected === null) return;
    answerCurrent(selected);
  }

  async function onFinish() {
    setSubmitting(true);
    setErr(null);
    try {
      await submit();
    } catch (e) {
      setErr(e.message);
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

  if (finished) {
    return (
      <div className="card">
        <h2>Finished</h2>
        <p className="muted">
          Your score will be saved to the database after you submit.
        </p>
        {lastScore === null ? (
          <button
            className="btn primary"
            onClick={onFinish}
            disabled={submitting}
            type="button"
          >
            {submitting ? "Submitting…" : "Submit & See Score"}
          </button>
        ) : (
          <div className="score">
            Final Score: <b>{lastScore}</b>
          </div>
        )}
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
        onClick={onSubmitAnswer}
        disabled={selected === null}
        type="button"
      >
        Lock answer
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
