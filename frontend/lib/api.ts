import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig, isAxiosError } from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { useAuthStore } from "@/store/use-auth-store";
import { queryClient } from "./query-client";

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

/**
 * The backend runs on port 8000 of the same machine as the Expo dev server, so derive
 * its host from wherever this bundle was served. EXPO_PUBLIC_API_URL overrides it.
 */
function resolveBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  const devHost = Constants.expoConfig?.hostUri?.split(":")[0];
  const webHost = Platform.OS === "web" && typeof window !== "undefined" ? window.location.hostname : undefined;
  return `http://${devHost || webHost || "localhost"}:8000/api/v1`;
}

export const API_BASE_URL = resolveBaseUrl();

const http = axios.create({ baseURL: API_BASE_URL, timeout: 60_000 });

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, setTokens } = useAuthStore.getState();
  if (!refreshToken) return null;
  try {
    const res = await axios.post<ApiEnvelope<{ access_token: string; refresh_token: string }>>(
      `${API_BASE_URL}/auth/refresh`,
      null,
      { params: { refresh_token: refreshToken } }
    );
    if (!res.data.success) return null;
    setTokens(res.data.data.access_token, res.data.data.refresh_token);
    return res.data.data.access_token;
  } catch {
    return null;
  }
}

export function signOut() {
  useAuthStore.getState().clear();
  queryClient.clear();
}

// Access tokens live 30 minutes: refresh once on 401, otherwise end the session.
http.interceptors.response.use(undefined, async (error: AxiosError) => {
  const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
  const isAuthCall = original?.url?.startsWith("/auth/");
  const detail = (error.response?.data as { detail?: unknown } | undefined)?.detail;
  if (error.response?.status === 403 && typeof detail === "string" && detail.includes("deactivated")) {
    signOut();
    throw error;
  }
  if (error.response?.status !== 401 || !original || original._retried || isAuthCall) throw error;

  original._retried = true;
  refreshing ??= refreshAccessToken().finally(() => (refreshing = null));
  const token = await refreshing;
  if (!token) {
    signOut();
    throw error;
  }
  original.headers.Authorization = `Bearer ${token}`;
  return http(original);
});

async function request<T>(config: AxiosRequestConfig): Promise<ApiEnvelope<T>> {
  const res = await http.request<ApiEnvelope<T>>(config);
  // Several endpoints report failures as 200 + success:false.
  if (res.data && res.data.success === false) throw new ApiError(res.data.message || "Request failed", res.status);
  return res.data;
}

export const api = {
  get: <T>(url: string, params?: object) => request<T>({ method: "GET", url, params }),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ method: "POST", url, data, ...config }),
  put: <T>(url: string, data?: unknown) => request<T>({ method: "PUT", url, data }),
  delete: <T>(url: string) => request<T>({ method: "DELETE", url }),
};

/** Turn any thrown value into a sentence a user can act on. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof ApiError) return error.message;
  if (isAxiosError(error)) {
    if (!error.response) return "Can't reach the server. Check your connection and try again.";
    const detail = (error.response.data as any)?.detail ?? (error.response.data as any)?.message;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg).replace(/^Value error, /, "");
    if (error.response.status >= 500) return "The server ran into a problem. Please try again shortly.";
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function isNotFound(error: unknown) {
  return isAxiosError(error) && error.response?.status === 404;
}
