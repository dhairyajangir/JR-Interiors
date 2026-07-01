"use server";

import { createServerClientInstance } from "../../lib/supabase/server";
import { prisma } from "@jr/database";
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from "@jr/validation";
import { logSecurityEvent } from "./utils";
import type { UserRole } from "@jr/types";

/** Roles permitted to access JR Control. */
const CONTROL_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN", "SELLER"];

// ─────────────────────────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────────────────────────

export async function loginAction(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validated = loginSchema.safeParse({ email, password });
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.errors[0].message,
    };
  }

  try {
    const supabase = await createServerClientInstance();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validated.data.email,
      password: validated.data.password,
    });

    if (error || !data.user) {
      await logSecurityEvent("LOGIN_FAILED", null, {
        email: validated.data.email,
        reason: error?.message ?? "No user returned",
      });
      return {
        success: false,
        error: "Invalid email or password.",
      };
    }

    const supabaseUid = data.user.id;

    // ── Primary lookup: by Supabase UUID ──────────────────────────────────────
    let userRecord = await prisma.user.findUnique({
      where: { supabaseId: supabaseUid },
      include: { seller: true },
    });

    // ── Backfill: first login for a user created before supabaseId existed ────
    if (!userRecord) {
      const emailRecord = await prisma.user.findUnique({
        where: { email: validated.data.email },
        include: { seller: true },
      });

      if (emailRecord && !emailRecord.supabaseId) {
        userRecord = await prisma.user.update({
          where: { id: emailRecord.id },
          data: { supabaseId: supabaseUid },
          include: { seller: true },
        });
      }
    }

    const role = userRecord?.role as UserRole | undefined;

    if (!userRecord || !role || !CONTROL_ROLES.includes(role)) {
      // User exists in Supabase auth but is not authorized for JR Control
      await supabase.auth.signOut();
      await logSecurityEvent("LOGIN_FAILED", userRecord?.id ?? null, {
        email: validated.data.email,
        supabaseId: supabaseUid,
        reason: "Role not authorized for JR Control",
        role: role ?? "none",
      });
      return {
        success: false,
        error: "You are not authorized to access JR Control.",
      };
    }

    await logSecurityEvent("LOGIN_SUCCESS", userRecord.id, {
      email: userRecord.email,
      supabaseId: supabaseUid,
      role,
    });

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────────────────────────────────────

export async function logoutAction() {
  try {
    const supabase = await createServerClientInstance();

    // Capture user before signing out so we can log the event
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    await supabase.auth.signOut();

    if (supabaseUser) {
      const userRecord = await prisma.user.findUnique({
        where: { supabaseId: supabaseUser.id },
        select: { id: true, email: true, role: true },
      });
      if (userRecord) {
        await logSecurityEvent("LOGOUT", userRecord.id, {
          email: userRecord.email,
          role: userRecord.role,
        });
      }
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Logout failed.";
    return { success: false, error: message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Forgot Password
// ─────────────────────────────────────────────────────────────────────────────

export async function forgotPasswordAction(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;

  const validated = forgotPasswordSchema.safeParse({ email });
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }

  try {
    const supabase = await createServerClientInstance();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
    const redirectTo = `${siteUrl}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(validated.data.email, {
      redirectTo,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Log the event — resolve user by email as UUID is not available pre-auth
    const userRecord = await prisma.user.findUnique({
      where: { email: validated.data.email },
      select: { id: true },
    });

    await logSecurityEvent("PASSWORD_RESET_REQUEST", userRecord?.id ?? null, {
      email: validated.data.email,
    });

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Reset Password
// ─────────────────────────────────────────────────────────────────────────────

export async function resetPasswordAction(prevState: unknown, formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const validated = resetPasswordSchema.safeParse({ password, confirmPassword });
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }

  try {
    const supabase = await createServerClientInstance();

    // Get the current session user before the password update
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    const { error } = await supabase.auth.updateUser({
      password: validated.data.password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (supabaseUser) {
      const userRecord = await prisma.user.findUnique({
        where: { supabaseId: supabaseUser.id },
        select: { id: true, email: true },
      });
      if (userRecord) {
        await logSecurityEvent("PASSWORD_RESET_SUCCESS", userRecord.id, {
          email: userRecord.email,
        });
      }
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}
