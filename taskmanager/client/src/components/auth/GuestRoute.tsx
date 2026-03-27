import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

// opposite of ProtectedRoute
// if user IS logged in redirect to dashboard
// if user is NOT logged in let them see the page
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default GuestRoute;
