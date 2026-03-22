import axiosInstance from "@/api/axiosInstance";
import useAuthStore from "@/store/authStore";
import { LoginFormData } from "../schemas/loginSchema";
import { RegisterFormData } from "../schemas/registerSchema";
import { useNavigate } from "react-router-dom";

// custom hook that contains all auth logic
// keeps pages clean — pages just call functions, no API logic in pages

const useAuth = () => {
  const { setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  // ─── Register ────────────────────────────────────────────────────────────────
  const register = async (data: RegisterFormData) => {
    const reponse = await axiosInstance.post("/auth/register", {
      name: data.name,
      email: data.email,
      password: data.password,
    });

    return reponse.data;
  };
};
