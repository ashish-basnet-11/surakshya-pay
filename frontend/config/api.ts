import { useAuthStore } from "@/store/use-auth-store";
import axios, { AxiosRequestConfig } from "axios";

const api = axios.create({
  // baseURL: "http://192.168.1.106:8000/api/v1",
  baseURL: "http://192.168.0.102:8000/api/v1",
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