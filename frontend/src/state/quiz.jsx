import React, { createContext, useContext, useMemo, useReducer } from "react";
import { api, unwrap } from "../api/api";

const QuizCtx = createContext(null);

const initial = {
  loading: false,
  questions: [],
  index: 0,
  answers: [], // { questionId, selectedIndex, timeRemainingSec? }
  finished: false,
  lastScore: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "START_LOADING":
      return { ...state, loading: true };
    case "SET_QUIZ":
      return {
        ...initial,
        loading: false,
        questions: action.questions,
      };
    case "ANSWER": {
      const { questionId, selectedIndex, timeRemainingSec } = action;
      const nextAnswers = [...state.answers, { questionId, selectedIndex, timeRemainingSec }];
      const nextIndex = state.index + 1;
      const finished = nextIndex >= state.questions.length;
      return { ...state, answers: nextAnswers, index: nextIndex, finished };
    }
    case "SET_SCORE":
      return { ...state, lastScore: action.score };
    default:
      return state;
  }
}

export function QuizProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);

  const actions = useMemo(
    () => ({
      async loadQuiz(limit = 8) {
        dispatch({ type: "START_LOADING" });
        const data = await api.get(`/quiz?limit=${limit}`).then(unwrap);
        dispatch({ type: "SET_QUIZ", questions: data.questions });
      },
      answerCurrent(selectedIndex, timeRemainingSec) {
        const q = state.questions[state.index];
        if (!q) return;
        dispatch({ type: "ANSWER", questionId: q.id, selectedIndex, timeRemainingSec });
      },
      async submit() {
        const data = await api.post("/quiz/submit", { answers: state.answers }).then(unwrap);
        dispatch({ type: "SET_SCORE", score: data.score });
        return data;
      },
    }),
    [state.questions, state.index, state.answers]
  );

  const value = useMemo(() => ({ ...state, ...actions }), [state, actions]);
  return <QuizCtx.Provider value={value}>{children}</QuizCtx.Provider>;
}

export function useQuiz() {
  const ctx = useContext(QuizCtx);
  if (!ctx) throw new Error("useQuiz must be used within QuizProvider");
  return ctx;
}

