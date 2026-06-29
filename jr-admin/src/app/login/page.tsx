import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { getCurrentUser, isDemoModeEnabled } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 md:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1fr_520px]">
        <section className="panel hero-grid flex flex-col justify-between p-8 md:p-10">
          <div>
            <p className="eyebrow">Login</p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight text-ink">Open your listing workspace.</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-steel">
              Separate dashboard, separate workflow, separate identity from storefront checkout and customer accounts.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {["Track live products", "Update inventory fast", "Jump back to UPI billing"].map((item) => (
              <div key={item} className="rounded-[24px] border border-line bg-white/80 px-5 py-4 text-sm text-steel shadow-card">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="panel p-8 md:p-10">
          <p className="eyebrow">Access</p>
          <h2 className="mt-4 text-3xl font-semibold text-ink">Sign in</h2>
          <p className="mt-3 text-sm leading-6 text-steel">Use your admin-service account. This is not tied to the ecommerce customer login.</p>
          <div className="mt-8">
            <LoginForm demoEnabled={isDemoModeEnabled()} />
          </div>
        </section>
      </div>
    </main>
  );
}
