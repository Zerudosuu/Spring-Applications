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

// ─── WHAT IS CREATE() ────────────────────────────────────────────────────────
// create() from zustand creates a custom React hook
// the function you pass to create() receives a set() function
// set() is how you update the state — similar to setState in React
// whenever set() is called all components using this store re-render

const useAuthStore = create<AuthState>((set) => ({
  // ─── INITIAL STATE ───────────────────────────────────────────────────────
  // we check localStorage on startup so state persists after page refresh
  // if accessToken exists in localStorage the user is still logged in
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null,
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),

  // !! converts a value to boolean
  // !!null = false, !!"sometoken" = true
  isAuthenticated: !!localStorage.getItem("accessToken"),

  // ─── ACTIONS ─────────────────────────────────────────────────────────────

  // called after successful login
  // saves tokens to localStorage so they survive page refresh
  // set() updates the store state — only specify what changed
  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
    });
  },

  // called after logout
  // removes tokens from localStorage and resets all state to defaults
  clearAuth: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  // called when we need to update user info without changing tok  ens
  // example: after fetching /api/users/me to get current user details
  setUser: (user) => set({ user }),
}));

// export as default so components can import it
// usage in any component:
// const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
export default useAuthStore;
