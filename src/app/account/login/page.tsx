import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "@/components/AuthForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sign In | JR INTERIORS" };

type Params = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function LoginPage({ searchParams }: { searchParams: Params }) {
  const params = await searchParams;
  const redirectTo = typeof params.redirect === "string" ? params.redirect : "/account";

  if (await getCurrentUser()) redirect(redirectTo);
  return (
    <main className="min-h-screen flex items-center justify-center pt-24 pb-12">
      <div className="w-full max-w-md px-margin-mobile">
        <div className="text-center mb-stack-md">
          <span className="text-label-xs uppercase tracking-[0.2em] text-primary/60 mb-3 block">Welcome back</span>
          <h1 className="text-headline-section-mobile text-primary">Sign in to your account</h1>
        </div>
        <div className="bg-surface-container-lowest rounded-xl editorial-shadow p-6 md:p-8">
          <AuthForm mode="login" redirectTo={redirectTo} />
        </div>
      </div>
    </main>
  );
}
