import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';

const FOUNDER_EMAIL = 'mercutiose369@gmail.com';

export function useFounderAccess() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const verifyFounder = useMutation({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error('Actor not available');
      
      const isFounder = await actor.isFounderEmail(email.trim());
      
      if (!isFounder) {
        throw new Error('Invalid founder email');
      }
      
      return true;
    },
    onSuccess: () => {
      // Invalidate admin status to refresh access
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    }
  });

  return {
    verifyFounder,
    isVerifying: verifyFounder.isPending,
    FOUNDER_EMAIL
  };
}
