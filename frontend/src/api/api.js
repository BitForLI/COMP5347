import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
});

export class ApiRequestError extends Error {
  constructor(message, status, apiData) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.apiData = apiData;
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const rawUser = localStorage.getItem("user");
  if (rawUser) {
    try {
      const u = JSON.parse(rawUser);
      if (u?.id != null) config.headers["X-User-Id"] = String(u.id);
    } catch {
      // ignore
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel?.(error)) return Promise.reject(error);
    const ax = error;
    if (ax?.code === "ERR_CANCELED" || ax?.name === "CanceledError" || ax?.name === "AbortError")
      return Promise.reject(error);

    const status = error?.response?.status;
    const data = error?.response?.data;
    const o = typeof data === "object" && data !== null ? data : null;

    const extracted =
      (typeof data === "string" ? data : null) ||
      (o && typeof o.error === "string" ? o.error : null) ||
      (o && typeof o.message === "string" ? o.message : null) ||
      (o && typeof o.detail === "string" ? o.detail : null) ||
      error?.message ||
      "Request failed";

    return Promise.reject(new ApiRequestError(extracted, status, data));
  }
);

export function setAuthToken(token) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

export function unwrap(resp) {
  const payload = resp?.data;
  if (payload?.success) return payload.data;
  throw new Error(payload?.error || "Request failed");
}

