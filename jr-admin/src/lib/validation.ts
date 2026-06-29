import { z } from "zod";

export function normalizeString(val: unknown): string {
  if (typeof val !== "string") return "";
  return val.normalize("NFC").trim();
}

export const EmailSchema = z
  .string()
  .refine((v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), {
    message: "Invalid email format.",
  })
  .transform((v) => normalizeString(v).toLowerCase());

export const PhoneSchema = z
  .string()
  .refine((v) => /^\+?[\d\s\-()]{10,20}$/.test(v) || v === "", {
    message: "Invalid phone number format.",
  })
  .transform((v) => normalizeString(v))
  .nullable();

export const PasswordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters.")
  .refine((v) => /[A-Z]/.test(v), "Password must contain at least one uppercase letter.")
  .refine((v) => /[a-z]/.test(v), "Password must contain at least one lowercase letter.")
  .refine((v) => /\d/.test(v), "Password must contain at least one number.")
  .refine((v) => /[!@#$%^&*()_+\-=\[\]{};':",./<>?\|\\`~]/.test(v), "Password must contain at least one special character.");

export const AdminRegisterSchema = z.object({
  fullName: z
    .string()
    .refine((v) => v.length >= 2, "Full name must be at least 2 characters.")
    .transform((v) => normalizeString(v)),
  businessName: z
    .string()
    .refine((v) => v.length >= 2, "Business name must be at least 2 characters.")
    .transform((v) => normalizeString(v)),
  email: EmailSchema,
  phone: PhoneSchema,
  password: PasswordSchema,
});

export const AdminProductSchema = z.object({
  title: z
    .string()
    .refine((v) => v.length >= 2, "Product title must be at least 2 characters.")
    .transform((v) => normalizeString(v)),
  category: z
    .string()
    .refine((v) => v.length >= 2, "Category must be specified.")
    .transform((v) => normalizeString(v)),
  shortDescription: z
    .string()
    .refine((v) => v.length >= 10, "Description must be at least 10 characters.")
    .transform((v) => normalizeString(v)),
  coverImage: z
    .string()
    .url("Cover image must be a valid URL.")
    .transform((v) => normalizeString(v)),
  priceInr: z.number().int().positive("Price must be a positive integer in INR."),
  inventory: z.number().int().nonnegative("Inventory cannot be negative."),
  gallery: z.array(z.string().url("Gallery image must be a valid URL.")).default([]),
  featured: z.boolean().default(false),
});

export const AdminProfileSchema = z.object({
  fullName: z
    .string()
    .refine((v) => v.length >= 2)
    .transform((v) => normalizeString(v)),
  businessName: z
    .string()
    .refine((v) => v.length >= 2)
    .transform((v) => normalizeString(v)),
  phone: PhoneSchema,
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  nextPassword: PasswordSchema,
});
