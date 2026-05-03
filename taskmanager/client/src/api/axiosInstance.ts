import axios from "axios";
import useAuthStore from "@/store/authStore";
import {
  isAccessTokenExpiringSoon,
  refreshAuthTokens,
} from "@/api/authRefresh";

/**
 * base axios instance for pointing to Spring Boot API
 * axios.create() creates a custom axios instance
 * instead of configuring headers on every request we set defaults here once
 * every API call in your app will use this instance
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
 
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
  /**
   * @param config
   *  config is the request configuration object
   * it contains the URL, method, headers, body etc
   * @returns
   */

  async (config) => {
    // localStorage is the browser's built-in key-value storage
    // we store the token here after login so it persists on page refresh
    const { accessToken } = useAuthStore.getState(); // getState() allows us to access the current state of the auth store without using the hook
    const isAuthRequest =
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/logout") ||
      config.url?.includes("/auth/refresh");

    // Never attach Authorization to public auth endpoints.
    if (isAuthRequest && config.headers?.Authorization) {
      delete config.headers.Authorization;
    }

    // if a token exists attach it to the Authorization header
    // Spring Boot's JwtAuthFilter reads this header on every request
    if (
      !isAuthRequest &&
      accessToken &&
      isAccessTokenExpiringSoon(accessToken)
    ) {
      const { accessToken: renewedAccessToken } = await refreshAuthTokens();
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${renewedAccessToken}`;
      return config;
    }

    if (!isAuthRequest && accessToken) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    // must return config so the request can continue
    return config;
  },

  // if something goes wrong building the request
  // Promise.reject(error) passes the error forward so it can be caught in the component that made the API call
  (error) => Promise.reject(error),
);

//response interceptor - handles 401 errors by attempting token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // prevent infinite loop
    if (originalRequest?.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    // don't try to refresh tokens for auth endpoints (login, logout)
    const isAuthEndpoint = originalRequest?.url?.includes("/auth/login") || originalRequest?.url?.includes("/auth/logout");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      // Attempt token refresh
      originalRequest._retry = true;

      try {
        const { accessToken: newAccessToken } = await refreshAuthTokens();

        // update original request with new token and retry
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails while trying to recover from an authenticated request,
        // redirect to login so the user can authenticate again.
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
