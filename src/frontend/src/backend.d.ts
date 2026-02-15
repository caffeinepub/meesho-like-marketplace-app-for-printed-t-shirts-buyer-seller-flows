import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface ReferralSummaryView {
    totalCommissions: bigint;
    referrer: Principal;
    availableBalance: bigint;
    referredUsers: Array<Principal>;
}
export interface MarketplaceSettings {
    displayName: string;
    tagline: string;
    logo?: ExternalBlob;
}
export interface UserProfile {
    name: string;
    email: string;
    address?: ShippingAddress;
    phone: string;
}
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
export interface Order {
    status: OrderStatus;
    contactInfo: ContactInfo;
    promoApplied: boolean;
    createdAt: bigint;
    totalCents: bigint;
    orderId: OrderId;
    promoCode?: string;
    buyer: Principal;
    items: Array<OrderItem>;
}
export type ProductId = number;
export interface ContactInfo {
    email: string;
    shippingAddress: ShippingAddress;
}
export interface Product {
    title: string;
    description: string;
    productId: ProductId;
    sizes: Array<string>;
    imageRef: ExternalBlob;
    colors: Array<string>;
    priceCents: bigint;
}
export type OrderId = number;
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
    applyReferralCode(code: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrder(items: Array<OrderItem>, contactInfo: ContactInfo, promoCode: string | null): Promise<Order>;
    createProduct(title: string, description: string, priceCents: bigint, sizes: Array<string>, colors: Array<string>, image: ExternalBlob): Promise<Product>;
    deleteCallerUserProfile(): Promise<void>;
    deleteProduct(productId: ProductId): Promise<void>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMarketplaceSettings(): Promise<MarketplaceSettings>;
    getMyOrders(): Promise<Array<Order>>;
    getOrCreateReferralCode(): Promise<string>;
    getOrder(orderId: OrderId): Promise<Order>;
    getOwnReferralSummary(): Promise<ReferralSummaryView>;
    getProduct(productId: ProductId): Promise<Product>;
    getReferralSummary(user: Principal): Promise<ReferralSummaryView>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    grantAdminRole(user: Principal): Promise<void>;
    grantUserRole(user: Principal): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isFounderEmail(email: string): Promise<boolean>;
    revokeAdminRole(user: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveMarketplaceLogo(logo: ExternalBlob): Promise<void>;
    saveMarketplaceName(newName: string): Promise<void>;
    updateOrderStatus(orderId: OrderId, status: OrderStatus): Promise<void>;
    updateProduct(productId: ProductId, title: string, description: string, priceCents: bigint, sizes: Array<string>, colors: Array<string>, image: ExternalBlob): Promise<Product>;
    updateTagline(newTagline: string): Promise<void>;
}
