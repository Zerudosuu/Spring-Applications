// zustand is a state management library
// it lets you store data globally so any component can access it
// think of it like a global variable that React components can subscribe to
// when the data changes all components using it automatically re-render
import { create } from "zustand";

// ─── TYPE DEFINITIONS ─────────────────────────────────────────────────────────
// TypeScript interfaces define the shape of objects
// similar to Java classes but just for type checking, no logic

// matches the User data your Spring Boot API returns
interface User {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN"; // union type — can only be one of these two values
}

// defines everything the auth store contains
// state (the data) and actions (the functions that change the data)
interface AuthState {
  // ─── STATE ───────────────────────────────────────────────────────────────
  user: User | null; // null means not logged in
  accessToken: string | null; // JWT access token, null if not logged in
  refreshToken: string | null; // refresh token, null if not logged in
  isAuthenticated: boolean; // true if user is logged in

  // ─── ACTIONS ─────────────────────────────────────────────────────────────
  // function type syntax: (parameters) => return type
  // void means the function returns nothing (like void in Java)
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setUser: (user: User) => void;
}

// safe JSON parse — returns null if parsing fails
const safeParse = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === "undefined" || item === "null") return null;
    return JSON.parse(item) as T;
  } catch {
    return null;
  }
};

/*─── WHAT IS CREATE() ────────────────────────────────────────────────────────
// create() from zustand creates a custom React hook
// the function you pass to create() receives a set() function
// set() is how you update the state — similar to setState in React
// whenever set() is called all components using this store re-render8*/

const useAuthStore = create<AuthState>((set) => ({
  // use safeParse instead of direct JSON.parse
  user: safeParse<User>("user"),
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  isAuthenticated: !!localStorage.getItem("accessToken"),

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    set({ user, accessToken, refreshToken, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  setUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },
}));

// export as default so components can import it
// usage in any component:
// const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
export default useAuthStore;
