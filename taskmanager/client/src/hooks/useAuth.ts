import axiosInstance from "@/api/axiosInstance";
import useAuthStore from "@/store/authStore";
import type { LoginFormData } from "../schemas/loginSchema";
import type { RegisterFormData } from "../schemas/registerSchema";
import { useNavigate } from "react-router-dom";

// custom hook that contains all auth logic
// keeps pages clean — pages just call functions, no API logic in pages

const useAuth = () => {
  const { setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  // ─── Register ────────────────────────────────────────────────────────────────
  const register = async (data: RegisterFormData) => {
    const reponse = await axiosInstance.post("/users", {
      name: data.name,
      email: data.email,
      password: data.password,
    });

    return reponse.data;
  };

  // ─── Login ─────────────────────────────────────────────────────────────────
  const login = async (data: LoginFormData) => {
    const response = await axiosInstance.post("/auth/login", {
      email: data.email,
      password: data.password,
    });

    const { user, accessToken, refreshToken } = response.data;

    // save auth data to store and localStorage
    setAuth(user, accessToken, refreshToken);

    // redirect to dashboard after login
    navigate("/dashboard");
  };

  // --- Logout ──────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout", {
        refreshToken: localStorage.getItem("refreshToken"),
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      clearAuth();
      navigate("/login");
    }
  };

  return { register, login, logout };
};

export default useAuth;
