import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/RegisterForm";
import { getCurrentUser } from "@/lib/auth";
import { formatInr } from "@/lib/format";
import { getUpiConfig } from "@/lib/upi";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  const upi = getUpiConfig();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 md:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1fr_540px]">
        <section className="panel p-8 md:p-10">
          <p className="eyebrow">Register</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-ink">
            Create separate admin account for <span className="font-serif italic text-coral">listing management</span>.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-steel">
            This flow is intentionally isolated from ecommerce. Users register here, receive their own dashboard access, and continue into UPI payment with prefilled registration amount.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-line bg-white/80 p-5 shadow-card">
              <p className="text-xs uppercase tracking-[0.26em] text-mint">What you get</p>
              <p className="mt-3 text-lg font-semibold text-ink">Add, update, delete products</p>
              <p className="mt-2 text-sm leading-6 text-steel">Focused listing operations only. No storefront coupling, no seller moderation workflow from the existing ecommerce app.</p>
            </div>
            <div className="rounded-[24px] bg-ink p-5 text-white shadow-soft">
              <p className="text-xs uppercase tracking-[0.26em] text-white/70">UPI payment</p>
              <p className="mt-3 text-3xl font-semibold">{formatInr(upi.registrationFeeInr)}</p>
              <p className="mt-2 text-sm leading-6 text-white/75">Direct payment options appear right after registration.</p>
            </div>
          </div>
        </section>

        <section className="panel p-8 md:p-10">
          <p className="eyebrow">Account setup</p>
          <h2 className="mt-4 text-3xl font-semibold text-ink">Start now</h2>
          <p className="mt-3 text-sm leading-6 text-steel">We create the account first so the payment reference and dashboard stay tied to the right workspace owner.</p>
          <div className="mt-8">
            <RegisterForm />
          </div>
        </section>
      </div>
    </main>
  );
}
