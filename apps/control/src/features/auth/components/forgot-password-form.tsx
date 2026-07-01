"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { forgotPasswordAction } from "../actions";
import { Mail, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", values.email);

      const result = await forgotPasswordAction(null, formData);

      if (result && !result.success) {
        setError(result.error || "Something went wrong. Please try again.");
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
          Recover Password
        </h1>
        <p className="mt-2 text-xs text-secondary text-center">
          Enter your email address and we'll send you a link to reset your password.
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
            <h2 className="text-sm font-medium text-primary">Check your email</h2>
            <p className="text-xs text-secondary leading-relaxed">
              We have sent a password reset link to your email address. Please click the link inside to set a new password.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center text-xs text-bronze hover:underline space-x-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-primary mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                <Mail className="h-4 w-4" />
              </div>
              <input
                {...register("email")}
                id="email"
                type="email"
                autoComplete="email"
                disabled={isPending}
                placeholder="name@jrinteriors.in"
                className="block w-full pl-10 pr-3 py-2 text-sm bg-base border border-heavy rounded-md focus:outline-none focus:ring-1 focus:ring-bronze focus:border-bronze disabled:opacity-50 transition-colors"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-error">{errors.email.message}</p>
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
                <span>Sending Reset Link...</span>
              </>
            ) : (
              <span>Send Reset Link</span>
            )}
          </button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center text-xs text-secondary hover:text-primary space-x-1.5 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
