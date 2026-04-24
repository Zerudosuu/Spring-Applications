import { Link } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, CheckSquare } from "lucide-react";
import { useState } from "react";
import useNotification from "@/hooks/useNotification";
import { Bell } from "lucide-react";
import NotificationList from "../notification/NotificationList";

function Navbar() {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const { notifications, handleNotificationClick } = useNotification();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <nav className="border-b bg-white shadow-sm px-6 py-4 flex items-center justify-between">
      {/* left — app name with icon */}
      <Link
        to="/dashboard"
        className="flex items-center gap-2 text-xl font-bold text-indigo-600"
      >
        <CheckSquare className="h-6 w-6" />
        Task Manager
      </Link>

      {/* right — user info, notifications, and logout */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200"
            onClick={toggleDropdown}
          >
            <Bell className="h-5 w-5 text-gray-600" />
            {notifications.some((n) => !n.isRead) && (
              <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full" />
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="p-2">
                <p className="text-sm font-medium text-gray-700">
                  Notifications
                </p>
              </div>
              <ul className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <li className="p-2 text-sm text-gray-500">
                    No notifications
                  </li>
                ) : (
                  <NotificationList
                    notifications={notifications}
                    onNotificationClick={handleNotificationClick}
                  />
                )}
              </ul>
            </div>
          )}
        </div>

        {user && (
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-800">{user.name}</p>
            <p className="text-xs text-gray-400">{user.role}</p>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="flex items-center gap-1"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </nav>
  );
}

export default Navbar;
