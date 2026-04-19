import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { api, setAuthToken, unwrap } from "../api/api";

const AuthCtx = createContext(null);

const initial = {
  token: localStorage.getItem("token") || null,
  user: JSON.parse(localStorage.getItem("user") || "null"),
};

function reducer(state, action) {
  switch (action.type) {
    case "LOGIN": {
      return { ...state, token: action.token, user: action.user };
    }
    case "LOGOUT": {
      return { ...state, token: null, user: null };
    }
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    setAuthToken(state.token);
    if (state.token) localStorage.setItem("token", state.token);
    else localStorage.removeItem("token");
  }, [state.token]);

  useEffect(() => {
    if (state.user) localStorage.setItem("user", JSON.stringify(state.user));
    else localStorage.removeItem("user");
  }, [state.user]);

  const actions = useMemo(
    () => ({
      async login(email, password) {
        const data = await api.post("/auth/login", { email, password }).then(unwrap);
        dispatch({ type: "LOGIN", token: data.token, user: data.user });
      },
      async sendRegisterCode(email) {
        await api.post("/auth/register/send-code", { email }).then(unwrap);
      },
      async registerAccount({ email, password, confirmPassword, code }) {
        await api.post("/auth/register", { email, password, confirmPassword, code }).then(unwrap);
      },
      logout() {
        dispatch({ type: "LOGOUT" });
      },
    }),
    []
  );

  const value = useMemo(() => ({ ...state, ...actions }), [state, actions]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

