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

  const login = async (data: LoginFormData) => {
    const response = await axiosInstance.post("/auth/login", {
      email: data.email,
      password: data.password,
    });

    // check what your Spring Boot actually returns
    console.log("Login response:", response.data);

    const { accessToken, refreshToken, message, ...user } = response.data;

    // this saves user to Zustand AND localStorage
    setAuth(user, accessToken, refreshToken);
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
