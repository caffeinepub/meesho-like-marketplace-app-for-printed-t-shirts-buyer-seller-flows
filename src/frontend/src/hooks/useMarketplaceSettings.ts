import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { MarketplaceSettings } from '../backend';
import { ExternalBlob } from '../backend';

export function useGetMarketplaceSettings() {
  const { actor, isFetching } = useActor();

  return useQuery<MarketplaceSettings>({
    queryKey: ['marketplaceSettings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMarketplaceSettings();
    },
    enabled: !!actor && !isFetching
  });
}

export function useSaveMarketplaceName() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveMarketplaceName(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplaceSettings'] });
    }
  });
}

export function useSaveMarketplaceTagline() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tagline: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTagline(tagline);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplaceSettings'] });
    }
  });
}

export function useSaveMarketplaceLogo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageData: Uint8Array) => {
      if (!actor) throw new Error('Actor not available');
      const externalBlob = ExternalBlob.fromBytes(new Uint8Array(imageData));
      return actor.saveMarketplaceLogo(externalBlob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplaceSettings'] });
    }
  });
}
