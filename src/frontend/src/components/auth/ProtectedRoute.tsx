import { ReactNode } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../../hooks/useCurrentUser';
import AccessDeniedScreen from './AccessDeniedScreen';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: adminLoading, isFetched: adminFetched } = useIsCallerAdmin();

  const isAuthenticated = !!identity;

  // Show loading state while checking authentication
  if (isInitializing || (isAuthenticated && (profileLoading || (requireAdmin && adminLoading)))) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return <AccessDeniedScreen />;
  }

  // Check admin requirement with proper fetched state
  if (requireAdmin && adminFetched && !isAdmin) {
    return <AccessDeniedScreen />;
  }

  return <>{children}</>;
}
