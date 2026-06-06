import { z } from "zod";

export const createOrderSchema = z.object({
  customerId: z.string().cuid(),
  marketId: z.string().cuid(),
  currencyId: z.string().cuid(),
  shippingAddressId: z.string().cuid(),
  billingAddressId: z.string().cuid().optional(),
  items: z
    .array(
      z.object({
        variantId: z.string().cuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
  couponCode: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
