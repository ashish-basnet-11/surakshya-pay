import { useAuthStore } from "@/store/use-auth-store";
import axios, { AxiosRequestConfig } from "axios";
import Constants from "expo-constants";

// Automatically detect the dev machine's IP from Expo's dev server.
// No more manual IP changes when switching networks!
const getBaseUrl = (): string => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const host = debuggerHost.split(":")[0]; // extract IP, drop the port
    return `http://${host}:8000/api/v1`;
  }
  // Fallback for production or when hostUri isn't available
  return "http://localhost:8000/api/v1";
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json"
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export async function apiGet<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.get<T>(url, config);
  return response.data;
}

export async function apiPost<T = any>(
  url: string,
  data?: any,
  config: AxiosRequestConfig = {}
): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

  const headers = {
    ...config.headers,
    ...(isFormData ? { "Content-Type": "multipart/form-data" } : {}),
  };

  const response = await api.post<T>(url, data, {
    ...config,
    headers,
  });

  return response.data;
}

export async function apiPut<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.put<T>(url, data, config);
  return response.data;
}

export async function apiDelete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.delete<T>(url, config);
  return response.data;
}

export async function apiPatch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.patch<T>(url, data, config);
  return response.data;
}

export default api; 