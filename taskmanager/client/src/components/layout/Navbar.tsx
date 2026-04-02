import { Link } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import useAuth from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, CheckSquare } from 'lucide-react';

function Navbar() {
    const { user } = useAuthStore();
    const { logout } = useAuth();

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

            {/* right — user info and logout */}
            <div className="flex items-center gap-4">
                {user && (
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-800">
                            {user.name}
                        </p>
                        <p className="text-xs text-gray-400">
                            {user.role}
                        </p>
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