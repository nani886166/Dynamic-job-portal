import axios from "axios";

const api = axios.create({
  // Deployed Django API: https://job-portal-production-60c4.up.railway.app/api
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("profile");
    }
    return Promise.reject(error);
  },
);

export default api;
