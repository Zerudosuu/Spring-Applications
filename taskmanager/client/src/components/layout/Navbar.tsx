import { Link } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, CheckSquare } from "lucide-react";
import { useState } from "react";
import useNotification from "@/hooks/useNotification";
import { Bell } from "lucide-react";

function Navbar() {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const { notifications, markAsRead } = useNotification();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  //TODO: Implement the handleMarkAsRead and fix the authorization on getting the ticket via ID to show the details in the notification dropdown. Also, consider adding a link to the ticket details page in the notification message for better user experience.

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
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
                  notifications.map((notification) => (
                    <li
                      key={notification.id}
                      className="p-2 text-sm hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <p className="font-medium text-gray-800">
                        {notification.ticketTitle}
                      </p>
                      <p className="text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </li>
                  ))
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
