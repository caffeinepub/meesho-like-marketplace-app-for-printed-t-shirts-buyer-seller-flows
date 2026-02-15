import { useInternetIdentity } from './useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useAuthActions() {
  const { login: iiLogin, clear: iiClear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const login = async () => {
    try {
      await iiLogin();
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle "already authenticated" error gracefully
      if (error.message === 'User is already authenticated') {
        try {
          await iiClear();
          // Wait a bit for cleanup
          await new Promise(resolve => setTimeout(resolve, 300));
          await iiLogin();
        } catch (retryError: any) {
          console.error('Login retry error:', retryError);
          toast.error('Login failed. Please try again.');
          throw retryError;
        }
      } else {
        toast.error(error.message || 'Login failed. Please try again.');
        throw error;
      }
    }
  };

  const logout = async () => {
    try {
      await iiClear();
      // Clear all cached application data including user profile
      queryClient.clear();
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
      throw error;
    }
  };

  return {
    login,
    logout,
    loginStatus,
    identity,
    isAuthenticated: !!identity,
    isLoggingIn: loginStatus === 'logging-in'
  };
}
