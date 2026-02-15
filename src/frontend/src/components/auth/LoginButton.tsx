import { useAuthActions } from '../../hooks/useAuthActions';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

export default function LoginButton() {
  const { logout, isAuthenticated, isLoggingIn } = useAuthActions();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Error already handled in useAuthActions
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoggingIn}
      variant="ghost"
      size="sm"
      className="w-full justify-start"
    >
      {isLoggingIn ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Logging out...
        </>
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </>
      )}
    </Button>
  );
}
