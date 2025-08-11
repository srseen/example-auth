import axios from 'axios';
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
} from 'axios';

let accessToken: string | null = null;
let refreshToken: string | null = null;
let logoutHandler: (() => void | Promise<void>) | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const setRefreshToken = (token: string | null) => {
  refreshToken = token;
};

export const setLogoutHandler = (fn: () => void | Promise<void>) => {
  logoutHandler = fn;
};

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers = (config.headers ?? {}) as AxiosRequestHeaders;
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest =
      error.config as AxiosRequestConfig & { _retry?: boolean };
    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      originalRequest?.url !== '/auth/login' &&
      originalRequest?.url !== '/auth/register' &&
      originalRequest?.url !== '/auth/refresh' &&
      originalRequest?.url !== '/auth/logout'
    ) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await api.post<{ accessToken: string }>(
          '/auth/refresh',
          undefined,
          {
            headers: {
              Authorization: refreshToken
                ? `Bearer ${refreshToken}`
                : undefined,
            },
          }
        );
        const newToken = refreshResponse.data.accessToken;
        setAccessToken(newToken);
        if (newToken) {
          localStorage.setItem('accessToken', newToken);
        }
        originalRequest.headers = (
          originalRequest.headers ?? {}
        ) as AxiosRequestHeaders;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        if (logoutHandler) {
          await logoutHandler();
        }
        return Promise.reject(refreshError);
      }
    }
    if (
      logoutHandler &&
      error.response?.status === 401 &&
      originalRequest?.url !== '/auth/logout'
    ) {
      await logoutHandler();
    }
    return Promise.reject(error);
  }
);

export default api;
