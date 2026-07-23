import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

export interface ApiErrorResponse {
  status: number;
  message: string;
  fieldErrors?: Record<string, string[]>;
  isConflict?: boolean;
  isForbidden?: boolean;
}

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Single inflight promise for silent refresh deduplication
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach JWT Bearer Token
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Silent Refresh, 409 Concurrency, and 400 Field Errors
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<Record<string, unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 Unauthorized -> Attempt Silent Refresh once
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => client(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post<{ accessToken: string }>('/api/auth/refresh', {}, { withCredentials: true });
        const newAccessToken = refreshResponse.data.accessToken;
        useAuthStore.getState().setToken(newAccessToken);
        processQueue(null);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return client(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr as Error);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Normalize Error Response Object
    const normalizedError: ApiErrorResponse = {
      status: error.response?.status ?? 500,
      message: (error.response?.data?.detail as string) || (error.response?.data?.title as string) || (error.response?.data?.message as string) || error.message || 'An unexpected error occurred',
      isConflict: error.response?.status === 409,
      isForbidden: error.response?.status === 403,
    };

    // Extract ProblemDetails field validation errors (400 Bad Request)
    if (error.response?.status === 400 && error.response.data?.errors) {
      normalizedError.fieldErrors = error.response.data.errors as Record<string, string[]>;
    }

    return Promise.reject(normalizedError);
  }
);

export default client;
