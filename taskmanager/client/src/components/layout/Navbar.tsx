import { Link } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  //get user info from Zustand
  const { user } = useAuthStore();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="border-b bg-white px-6 py-3 flex items-center justify-between">
      {/* left side — app name */}
      <Link to="/dashboard" className="text-xl font-bold text-gray-800">
        Task Manager
      </Link>

      {/* right side — user info and logout */}
      <div className="flex items-center gap-4">
        {/* show logged in user name */}
        {user && <span className="text-sm text-gray-600">👋 {user.name}</span>}

        {/* logout button */}
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
