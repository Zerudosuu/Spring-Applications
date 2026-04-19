import { useEffect, useState } from "react";
import useAuthStore from "@/store/authStore";
import {
  isAccessTokenExpiringSoon,
  refreshAuthTokens,
} from "@/api/authRefresh";

const useAppInit = () => {
  const { accessToken, refreshToken, clearAuth } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      if (!refreshToken) {
        setIsInitializing(false);
        return;
      }

      if (accessToken && !isAccessTokenExpiringSoon(accessToken)) {
        setIsInitializing(false);
        return;
      }

      try {
        await refreshAuthTokens();
      } catch {
        clearAuth();
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, [accessToken, refreshToken, clearAuth]);

  return { isInitializing };
};

export default useAppInit;