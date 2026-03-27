import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import ProtectedRoute from './ProtectedRoute';

const AdminRoute = ({ children }) => {
    const { user } = useAuthStore();

    return (
        <ProtectedRoute>
            {user?.isAdmin ? children : <Navigate to="/dashboard" replace />}
        </ProtectedRoute>
    );
};

export default AdminRoute;