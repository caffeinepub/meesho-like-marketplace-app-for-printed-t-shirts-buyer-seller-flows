import type { ProductId } from '../backend';

export interface CartItem {
  productId: ProductId;
  title: string;
  priceCents: number;
  size: string;
  color: string;
  quantity: number;
  imageUrl: string;
}
