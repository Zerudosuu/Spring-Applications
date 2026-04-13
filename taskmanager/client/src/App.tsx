import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import NotFoundPage from "./pages/NotFoundPage";
import Layout from "./components/layout/Layout";
import GuestRoute from "./components/auth/GuestRoute";
import useAppInit from "./hooks/useAppInit";
import useAuthStore from "./store/authStore";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import TriageDashboard from "./pages/Triage/TriageDashboard";
import AnalystDashboard from "./pages/Analyst/AnalystDashboard";


function App() {
  const { isInitializing } = useAppInit();
  const { user } = useAuthStore();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/** public routes */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />

        {/* protected routes — wrapped with Layout for Navbar */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                {/* {user?.role === "ADMIN" ? (<AdminDashboard />) 
                : user?.role ==="TRIAGE" ? (<TriageDashboard />) 
                : user?.role === "USER" ? (<AnalystDashboard />) 
                : ( <DashboardPage />)
                } */}

                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/** catch-all route to redirect to login if no other route matches */}
        <Route path="*" element={<Navigate to="/login" />} />

        {/** 404 page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
