"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction } from "../actions";
import { KeyRound, Mail, AlertCircle, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const nextUrl = searchParams.get("next") || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", values.email);
      formData.append("password", values.password);

      const result = await loginAction(null, formData);

      if (result && !result.success) {
        setError(result.error || "Login failed");
      } else {
        router.push(nextUrl);
        router.refresh();
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
          JR Interiors
        </h1>
        <p className="mt-2 text-xs text-secondary text-center">
          Sign in to manage catalog, orders, and consultations.
        </p>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-3 mb-6 bg-error-bg border border-error-border text-error text-xs rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

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

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-medium text-primary"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-bronze hover:underline transition-all"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
              <KeyRound className="h-4 w-4" />
            </div>
            <input
              {...register("password")}
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              disabled={isPending}
              placeholder="••••••••"
              className="block w-full pl-10 pr-10 py-2 text-sm bg-base border border-heavy rounded-md focus:outline-none focus:ring-1 focus:ring-bronze focus:border-bronze disabled:opacity-50 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary hover:text-primary transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-error">{errors.password.message}</p>
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
              <span>Signing In...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>
    </div>
  );
}
