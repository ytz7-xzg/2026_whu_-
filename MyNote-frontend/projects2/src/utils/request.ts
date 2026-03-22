import axios from "axios";

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:9311",
  withCredentials: true,
  timeout: 10000,
});

request.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error),
);

export const getErrorMessage = (error: unknown, fallback = "请求失败，请稍后重试") => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: unknown; error?: unknown } | undefined;

    if (!error.response || error.code === "ERR_NETWORK") {
      return fallback;
    }

    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }

    if (typeof data?.error === "string" && data.error.trim()) {
      return data.error;
    }

    if (typeof error.message === "string" && error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

export default request;
