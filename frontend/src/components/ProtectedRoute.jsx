import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ children }) => {
    const { user, token } = useAuthStore();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (!user) {
        // Show loading while user data is being fetched
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;