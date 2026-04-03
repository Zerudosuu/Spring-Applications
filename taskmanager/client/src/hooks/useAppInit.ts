import { useEffect, useState } from "react";
import axiosInstance from "@/api/axiosInstance";
import useAuthStore from "@/store/authStore";

const useAppInit = () => {
  const { accessToken, refreshToken, setAuth, clearAuth } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      if (!refreshToken) {
        setIsInitializing(false);
        return;
      }

      if (accessToken) {
        setIsInitializing(false);
        return;
      }

      try {
        const response = await axiosInstance.post("/auth/refresh", {
          refreshToken,
        });

        const {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          ...user
        } = response.data;

        setAuth(user, newAccessToken, newRefreshToken);
      } catch (error) {
        clearAuth();
        throw error;
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, []);

  return { isInitializing };
};

export default useAppInit;