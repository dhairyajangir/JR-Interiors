import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { formatInr } from "@/lib/format";
import { getUpiConfig } from "@/lib/upi";

export const dynamic = "force-dynamic";

const highlights = [
  "Completely separate from storefront ecommerce flow",
  "Dedicated product listing workspace with CRUD only",
  "Direct UPI onboarding for registration payments",
];

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const upi = getUpiConfig();

  return (
    <main className="px-4 py-4 md:px-8">
      <section className="hero-grid panel mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col justify-between overflow-hidden p-8 md:p-12">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">JR Admin</p>
            <p className="mt-2 text-sm text-steel">Separate product service. No ecommerce coupling.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/login" className="rounded-full border border-line px-5 py-3 text-sm font-semibold text-steel transition hover:border-ink hover:text-ink">
              Log in
            </Link>
            <Link href="/register" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-mint">
              Register
            </Link>
          </div>
        </div>

        <div className="grid gap-10 py-12 lg:grid-cols-[1.3fr_0.9fr] lg:items-end">
          <div>
            <p className="eyebrow">Fresh visual language</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-tight text-ink md:text-7xl">
              Run product listings from{" "}
              <span className="font-serif italic text-coral">another service</span>, not from the ecommerce app.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-steel">
              This admin is shaped like a focused catalog console. Create accounts, pay registration with UPI, and manage product listings with add, update, and delete actions in one isolated workspace.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/register" className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-mint">
                Start registration
              </Link>
              <Link href="/login" className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-steel transition hover:border-ink hover:text-ink">
                I already have access
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] bg-ink p-6 text-white shadow-soft">
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">Registration fee</p>
              <p className="mt-4 text-4xl font-semibold">{formatInr(upi.registrationFeeInr)}</p>
              <p className="mt-3 text-sm leading-6 text-white/75">UPI-ready setup amount. Users register first, then land on direct pay screen with UPI reference and payee details.</p>
            </div>

            {highlights.map((item) => (
              <div key={item} className="rounded-[24px] border border-line bg-white/80 px-5 py-4 text-sm text-steel shadow-card">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
