import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "@/components/AuthForm";
import { Logo } from "@/components/Logo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sign In | JR INTERIORS" };

type Params = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function LoginPage({ searchParams }: { searchParams: Params }) {
  const params = await searchParams;
  const redirectTo = typeof params.redirect === "string" ? params.redirect : "/account";

  if (await getCurrentUser()) redirect(redirectTo);
  return (
    <main className="min-h-screen flex items-center justify-center pt-24 pb-12 bg-surface">
      <div className="w-full max-w-md px-margin-mobile">
        <div className="text-center mb-stack-md reveal">
          {/* Authentication page logo: Monogram — per brand spec (increased size) */}
          <div className="flex justify-center mb-6">
            <Logo variant="monogram" className="h-20 w-auto" />
          </div>
          <span className="text-label-xs uppercase tracking-[0.2em] text-primary/60 mb-3 block">Welcome back</span>
          <h1 className="text-headline-section-mobile text-primary font-serif">Sign in to your account</h1>
        </div>
        <div className="bg-surface-container-lowest rounded-xl editorial-shadow p-6 md:p-8 reveal delay-100">
          <AuthForm mode="login" redirectTo={redirectTo} />
        </div>
      </div>
    </main>
  );
}
