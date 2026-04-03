import axiosInstance from "@/api/axiosInstance";
import useAuthStore from "@/store/authStore";
import type { LoginFormData } from "../schemas/loginSchema";
import type { RegisterFormData } from "../schemas/registerSchema";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
    toast.success("Account created! Please login.");
    return reponse.data;
  };

  const login = async (data: LoginFormData) => {
    const response = await axiosInstance.post("/auth/login", data);

    const { accessToken, refreshToken, ...user } = response.data;

    setAuth(user, accessToken, refreshToken);

    toast.success(`Welcome back, ${user.name}!`);
    navigate("/dashboard");
  };

  // --- Logout ──────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        await axiosInstance.post("/auth/logout", { refreshToken });
      }
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
