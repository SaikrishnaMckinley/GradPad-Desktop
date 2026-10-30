import axios, { type AxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@/lib/api/config";
import { getAccessToken } from "@/lib/auth/token-storage";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json; version=v1",
  },
});

export async function apiGet<T = unknown>(path: string, config?: AxiosRequestConfig) {
  const token = getAccessToken();
  return api.get<T>(path, {
    ...config,
    headers: {
      ...config?.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export async function apiPost<T = unknown>(
  path: string,
  data?: unknown,
  config?: AxiosRequestConfig,
) {
  const token = getAccessToken();
  return api.post<T>(path, data, {
    ...config,
    headers: {
      ...config?.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
