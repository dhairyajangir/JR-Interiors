import { z } from "zod";

/**
 * Perform NFC Unicode Normalization on strings to prevent multi-byte bypass vectors.
 */
export function normalizeString(val: unknown): string {
  if (typeof val !== "string") return "";
  return val.normalize("NFC").trim();
}

export const EmailSchema = z
  .string()
  .refine((v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), {
    message: "Invalid email address format.",
  })
  .transform((v) => normalizeString(v).toLowerCase());

export function cleanIndianPhone(v: string): string {
  const normalized = normalizeString(v);
  if (!normalized) return "";
  let cleaned = normalized.replace(/\D/g, "");
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.length === 11 && cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }
  return cleaned;
}

export const PhoneSchema = z
  .string()
  .transform((v) => cleanIndianPhone(v))
  .refine((v) => /^[6-9]\d{9}$/.test(v) || v === "", {
    message: "Indian mobile number must be exactly 10 digits starting with 6-9.",
  })
  .nullable();

export const PasswordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters.")
  .refine((v) => /[A-Z]/.test(v), "Password must contain at least one uppercase letter.")
  .refine((v) => /[a-z]/.test(v), "Password must contain at least one lowercase letter.")
  .refine((v) => /\d/.test(v), "Password must contain at least one number.")
  .refine((v) => /[!@#$%^&*()_+\-=\[\]{};':",./<>?\|\\`~]/.test(v), "Password must contain at least one special character.");

export const ConsultationSchema = z.object({
  name: z
    .string()
    .refine((v) => v.length >= 2, { message: "Name must be at least 2 characters." })
    .transform((v) => normalizeString(v)),
  email: EmailSchema,
  phone: PhoneSchema,
  projectType: z
    .string()
    .transform((v) => normalizeString(v))
    .default("Single room"),
  message: z
    .string()
    .max(1000, { message: "Message is limited to 1000 characters." })
    .transform((v) => normalizeString(v))
    .nullable(),
});

export const RegistrationSchema = z.object({
  fullName: z
    .string()
    .refine((v) => v.length >= 2, { message: "Full name must be at least 2 characters." })
    .transform((v) => normalizeString(v)),
  email: EmailSchema,
  password: PasswordSchema,
});

export const AddressSchema = z.object({
  label: z
    .string()
    .transform((v) => normalizeString(v))
    .default("Home"),
  fullName: z
    .string()
    .refine((v) => v.length >= 2, { message: "Full name must be at least 2 characters." })
    .transform((v) => normalizeString(v)),
  line1: z
    .string()
    .refine((v) => v.length >= 5, { message: "Address line 1 must be at least 5 characters." })
    .transform((v) => normalizeString(v)),
  line2: z
    .string()
    .transform((v) => normalizeString(v))
    .nullable(),
  city: z
    .string()
    .refine((v) => v.length >= 2, { message: "City must be at least 2 characters." })
    .transform((v) => normalizeString(v)),
  region: z
    .string()
    .refine((v) => v.length >= 2, { message: "State must be selected." })
    .transform((v) => normalizeString(v)),
  postalCode: z
    .string()
    .refine((v) => /^\d{6}$/.test(v), { message: "PIN code must be exactly 6 digits." })
    .transform((v) => normalizeString(v)),
  country: z
    .string()
    .transform((v) => normalizeString(v))
    .default("India"),
  phone: PhoneSchema,
});

export const OrderCheckoutSchema = z.object({
  email: EmailSchema,
  fullName: z
    .string()
    .refine((v) => v.length >= 2)
    .transform((v) => normalizeString(v)),
  phone: PhoneSchema,
  address1: z
    .string()
    .refine((v) => v.length >= 5)
    .transform((v) => normalizeString(v)),
  address2: z
    .string()
    .transform((v) => normalizeString(v))
    .nullable(),
  city: z
    .string()
    .refine((v) => v.length >= 2)
    .transform((v) => normalizeString(v)),
  region: z
    .string()
    .refine((v) => v.length >= 2)
    .transform((v) => normalizeString(v)),
  postalCode: z
    .string()
    .refine((v) => /^\d{6}$/.test(v))
    .transform((v) => normalizeString(v)),
  country: z
    .string()
    .transform((v) => normalizeString(v))
    .default("India"),
  shippingType: z
    .string()
    .transform((v) => normalizeString(v))
    .default("standard"),
  saveAddress: z.boolean().default(false),
});

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, "Password is required."),
});
