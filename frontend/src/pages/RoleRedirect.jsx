import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'tutor') return <Navigate to="/tutor/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
}
