import { z } from "zod";

export const createMarketSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).optional(),
  defaultCurrencyId: z.string().cuid(),
  isDefault: z.boolean().default(false),
  active: z.boolean().default(true),
  fallbackPricing: z
    .enum(["BLOCK", "USE_BASE_PRICE", "USE_DEFAULT"])
    .default("BLOCK"),
  countryIds: z.array(z.string().cuid()).optional(),
});

export const createCurrencySchema = z.object({
  code: z.string().length(3).toUpperCase(),
  name: z.string().min(1),
  symbol: z.string().min(1),
  decimalDigits: z.number().int().min(0).max(4).default(2),
  active: z.boolean().default(false),
});

export const createCountrySchema = z.object({
  name: z.string().min(1),
  codeIso2: z.string().length(2).toUpperCase(),
  codeIso3: z.string().length(3).toUpperCase(),
  phoneCode: z.string().min(1),
  flagEmoji: z.string().optional(),
  active: z.boolean().default(false),
});

export type CreateMarketInput = z.infer<typeof createMarketSchema>;
export type CreateCurrencyInput = z.infer<typeof createCurrencySchema>;
export type CreateCountryInput = z.infer<typeof createCountrySchema>;
