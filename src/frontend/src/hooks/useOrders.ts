import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Order, OrderId, OrderItem, ContactInfo } from '../backend';

interface CreateOrderInput {
  items: OrderItem[];
  contactInfo: ContactInfo;
  promoCode?: string | null;
}

export function useCreateOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrder(
        input.items,
        input.contactInfo,
        input.promoCode || null
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
    }
  });
}

export function useGetMyOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['myOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !isFetching
  });
}

export function useGetOrder(orderId: OrderId | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!actor || orderId === undefined) throw new Error('Actor or orderId not available');
      return actor.getOrder(orderId);
    },
    enabled: !!actor && !isFetching && orderId !== undefined
  });
}
