import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ExternalBlob } from '../backend';
import type { Product, ProductId } from '../backend';

interface CreateProductInput {
  title: string;
  description: string;
  priceCents: bigint;
  sizes: string[];
  colors: string[];
  imageBlob: Uint8Array;
}

interface UpdateProductInput extends CreateProductInput {
  productId: ProductId;
}

export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProductInput) => {
      if (!actor) throw new Error('Actor not available');
      const imageRef = ExternalBlob.fromBytes(new Uint8Array(input.imageBlob));
      return actor.createProduct(
        input.title,
        input.description,
        input.priceCents,
        input.sizes,
        input.colors,
        imageRef
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProductInput) => {
      if (!actor) throw new Error('Actor not available');
      const imageRef = ExternalBlob.fromBytes(new Uint8Array(input.imageBlob));
      return actor.updateProduct(
        input.productId,
        input.title,
        input.description,
        input.priceCents,
        input.sizes,
        input.colors,
        imageRef
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
    }
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: ProductId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
}
