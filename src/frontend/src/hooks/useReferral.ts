import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ReferralSummaryView } from '../backend';

export function useGetOrCreateReferralCode() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ['referralCode'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getOrCreateReferralCode();
    },
    enabled: !!actor && !isFetching,
    retry: false
  });
}

export function useApplyReferralCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.applyReferralCode(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referralSummary'] });
    }
  });
}

export function useGetOwnReferralSummary() {
  const { actor, isFetching } = useActor();

  return useQuery<ReferralSummaryView>({
    queryKey: ['referralSummary'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getOwnReferralSummary();
    },
    enabled: !!actor && !isFetching,
    retry: false
  });
}
