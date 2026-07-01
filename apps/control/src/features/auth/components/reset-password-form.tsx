"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { resetPasswordAction } from "../actions";
import { KeyRound, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ResetPasswordValues) => {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("password", values.password);
      formData.append("confirmPassword", values.confirmPassword);

      const result = await resetPasswordAction(null, formData);

      if (result && !result.success) {
        setError(result.error || "Password update failed. The reset token might have expired.");
      } else {
        setSuccess(true);
      }
    });
  };

  return (
    <div className="w-full max-w-md p-8 bg-panel rounded-md border border-muted luxury-shadow-md animate-fade-in">
      <div className="flex flex-col items-center mb-8">
        <span className="text-xs uppercase tracking-widest text-bronze font-semibold mb-2">
          Atelier Control
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-primary text-center">
          Reset Password
        </h1>
        <p className="mt-2 text-xs text-secondary text-center">
          Choose a new password for your JR Control administrator account.
        </p>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-3 mb-6 bg-error-bg border border-error-border text-error text-xs rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="text-center space-y-6">
          <div className="flex justify-center text-success">
            <CheckCircle2 className="h-12 w-12 text-success" />
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-primary">Password updated</h2>
            <p className="text-xs text-secondary leading-relaxed">
              Your password has been reset successfully. You can now use your new credentials to sign in.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center py-2 px-4 bg-bronze hover:bg-[#865335] text-white text-xs font-medium rounded-md w-full space-x-1.5 transition-colors cursor-pointer"
            >
              <span>Go to Login</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-primary mb-1.5"
            >
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                <KeyRound className="h-4 w-4" />
              </div>
              <input
                {...register("password")}
                id="password"
                type="password"
                disabled={isPending}
                placeholder="••••••••"
                className="block w-full pl-10 pr-3 py-2 text-sm bg-base border border-heavy rounded-md focus:outline-none focus:ring-1 focus:ring-bronze focus:border-bronze disabled:opacity-50 transition-colors"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-error">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-medium text-primary mb-1.5"
            >
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                <KeyRound className="h-4 w-4" />
              </div>
              <input
                {...register("confirmPassword")}
                id="confirmPassword"
                type="password"
                disabled={isPending}
                placeholder="••••••••"
                className="block w-full pl-10 pr-3 py-2 text-sm bg-base border border-heavy rounded-md focus:outline-none focus:ring-1 focus:ring-bronze focus:border-bronze disabled:opacity-50 transition-colors"
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-error">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 px-4 bg-bronze hover:bg-[#865335] text-white text-sm font-medium rounded-md shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bronze disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
          >
            {isPending ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Resetting Password...</span>
              </>
            ) : (
              <span>Reset Password</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
