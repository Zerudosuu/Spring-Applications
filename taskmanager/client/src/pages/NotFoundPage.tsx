import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

function NotFoundPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <FileQuestion className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
                <p className="text-gray-500 mb-6">
                    The page you're looking for doesn't exist.
                </p>
                <Button asChild>
                    <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
            </div>
        </div>
    );
}

export default NotFoundPage;