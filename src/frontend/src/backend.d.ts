import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type OrderId = number;
export interface ShippingAddress {
    zip: string;
    city: string;
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    phone: string;
}
export interface OrderItem {
    color: string;
    size: string;
    productId: ProductId;
    quantity: bigint;
}
export type ProductId = number;
export interface Order {
    status: OrderStatus;
    createdAt: bigint;
    totalCents: bigint;
    orderId: OrderId;
    shippingAddress: ShippingAddress;
    buyer: Principal;
    items: Array<OrderItem>;
}
export interface Product {
    title: string;
    imageBlob: Uint8Array;
    description: string;
    productId: ProductId;
    sizes: Array<string>;
    colors: Array<string>;
    priceCents: bigint;
}
export interface UserProfile {
    name: string;
}
export enum OrderStatus {
    shipped = "shipped",
    cancelled = "cancelled",
    placed = "placed",
    delivered = "delivered",
    confirmed = "confirmed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrder(items: Array<OrderItem>, shippingAddress: ShippingAddress): Promise<Order>;
    createProduct(title: string, description: string, priceCents: bigint, sizes: Array<string>, colors: Array<string>, imageBlob: Uint8Array): Promise<Product>;
    deleteProduct(productId: ProductId): Promise<void>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyOrders(): Promise<Array<Order>>;
    getOrder(orderId: OrderId): Promise<Order>;
    getProduct(productId: ProductId): Promise<Product>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateOrderStatus(orderId: OrderId, status: OrderStatus): Promise<void>;
    updateProduct(productId: ProductId, title: string, description: string, priceCents: bigint, sizes: Array<string>, colors: Array<string>, imageBlob: Uint8Array): Promise<Product>;
}
