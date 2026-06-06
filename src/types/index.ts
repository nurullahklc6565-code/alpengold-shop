export type { Country, Currency, Market, MarketCountry } from "@prisma/client";
export type { Product, ProductVariant, ProductImage, InventoryItem, ProductVariantPrice } from "@prisma/client";
export type { Order, OrderItem, Customer, Address } from "@prisma/client";
export type { Payment, PaymentProvider } from "@prisma/client";
export type { ShippingZone, ShippingRate, TaxRule } from "@prisma/client";
export type { StaffUser, Role, Permission } from "@prisma/client";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CartItem {
  variantId: string;
  quantity: number;
  productName: string;
  variantOptions: Record<string, string>;
  unitPrice: number;
  currencyCode: string;
  imageUrl?: string;
}

export interface ResolvedCart {
  items: CartItem[];
  marketId: string;
  currencyId: string;
  subtotal: number;
}
