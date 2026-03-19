import axios from "axios";

/**
 * base axios instance for pointing to Spring Boot API
 * axios.create() creates a custom axios instance
 * instead of configuring headers on every request we set defaults here once
 * every API call in your app will use this instance
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

//request interceptor - attaches access token to every request

/**
 * ─── WHAT ARE INTERCEPTORS ────────────────────────────────────────────────────
 * Interceptors are middleware that run before every request or response
 * Think of them like JwtAuthFilter in Spring Boot
 * Request interceptor  → runs before every outgoing request
 * Response interceptor → runs after every incoming response

 *─── REQUEST INTERCEPTOR ─────────────────────────────────────────────────────
* runs automatically before EVERY request your app makes
* its job is to attach the JWT access token to the Authorization header
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

//response interceptor - handles 401 errors by attempting token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Attempt token refresh
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          // No refresh token, redirect to login
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(error);
        }

        //call refresh endpoint
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:8080/api"}/auth/refresh`,
          {
            refreshToken,
          },
        );

        const newAccessToken = response.data.accessToken;
        // Update local storage and retry original request
        localStorage.setItem("accessToken", newAccessToken);

        //retry original request with new token
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // refresh failed — force logout
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
