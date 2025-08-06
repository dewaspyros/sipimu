import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const RoleProtectedRoute = ({ children, allowedRoles }: RoleProtectedRouteProps) => {
  const { user, userRole, loading } = useAuth();

  console.log('RoleProtectedRoute - User:', user?.id, 'UserRole:', userRole, 'AllowedRoles:', allowedRoles, 'Loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    console.log('RoleProtectedRoute - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    console.log('RoleProtectedRoute - Access denied. UserRole:', userRole, 'AllowedRoles:', allowedRoles);
    return <Navigate to="/dashboard" replace />;
  }

  console.log('RoleProtectedRoute - Access granted');
  return <>{children}</>;
};