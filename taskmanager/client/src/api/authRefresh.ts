import axios from "axios";
import useAuthStore from "@/store/authStore";

type RefreshResult = {
  accessToken: string;
  refreshToken: string;
};

type JwtPayload = {
  exp?: number;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const ACCESS_TOKEN_SKEW_SECONDS = Number(
  import.meta.env.VITE_ACCESS_TOKEN_SKEW_SECONDS ?? 60,
);

let refreshPromise: Promise<RefreshResult> | null = null;

const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const [, payloadSegment] = token.split(".");
    if (!payloadSegment) return null;

    const base64 = payloadSegment
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payloadSegment.length / 4) * 4, "=");

    return JSON.parse(atob(base64)) as JwtPayload;
  } catch {
    return null;
  }
};

export const isAccessTokenExpiringSoon = (
  accessToken: string | null,
  skewSeconds: number = ACCESS_TOKEN_SKEW_SECONDS,
) => {
  if (!accessToken) return true;

  const payload = decodeJwtPayload(accessToken);
  if (!payload?.exp) return true;

  const expiryMs = payload.exp * 1000;
  return expiryMs - Date.now() <= skewSeconds * 1000;
};

export const refreshAuthTokens = async (): Promise<RefreshResult> => {
  if (refreshPromise) return refreshPromise;

  const { refreshToken, user, setAuth, clearAuth } = useAuthStore.getState();

  if (!refreshToken) {
    clearAuth();
    throw new Error("Missing refresh token");
  }

  refreshPromise = axios
    .post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
    .then((response) => {
      const {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        ...newUser
      } = response.data;

      setAuth(newUser || user!, newAccessToken, newRefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    })
    .catch((error) => {
      clearAuth();
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

