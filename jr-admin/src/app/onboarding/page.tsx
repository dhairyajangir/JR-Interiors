import Link from "next/link";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { reportPayment } from "@/app/actions";
import { CopyButton } from "@/components/CopyButton";
import { DashboardShell } from "@/components/DashboardShell";
import { SubmitButton } from "@/components/SubmitButton";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatInr } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;

  const payment =
    (params.ref
      ? await prisma.registrationPayment.findFirst({
          where: { reference: params.ref, userId: user.id },
          orderBy: { createdAt: "desc" },
        })
      : null) ??
    (await prisma.registrationPayment.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }));

  if (!payment) redirect("/dashboard");

  const qrDataUrl = await QRCode.toDataURL(payment.upiLink, {
    width: 280,
    margin: 1,
    color: { dark: "#111827", light: "#FFFDF8" },
  });

  return (
    <DashboardShell user={user} currentPath="/onboarding">
      <section className="panel p-6 md:p-8">
        <p className="eyebrow">UPI onboarding</p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-ink">Pay registration fee directly with UPI.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-steel">
              Use any UPI app. We generate a ready-to-pay intent link, QR code, payment note, and reference so this stays separate from storefront checkout.
            </p>
          </div>
          <Link href="/dashboard" className="rounded-full border border-line px-5 py-3 text-sm font-semibold text-steel transition hover:border-ink hover:text-ink">
            Back to dashboard
          </Link>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="panel p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="rounded-[24px] bg-ink p-5 text-white shadow-soft">
                <p className="text-xs uppercase tracking-[0.26em] text-white/70">Amount</p>
                <p className="mt-3 text-4xl font-semibold">{formatInr(payment.amountInr)}</p>
                <p className="mt-2 text-sm text-white/75">Plan: {payment.planName}</p>
              </div>

              <div className="rounded-[24px] border border-line bg-white/80 p-5 shadow-card">
                <p className="text-xs uppercase tracking-[0.26em] text-mint">Payment details</p>
                <dl className="mt-4 space-y-3 text-sm text-steel">
                  <div>
                    <dt className="font-semibold text-ink">Payee</dt>
                    <dd>{payment.payeeName}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink">UPI ID</dt>
                    <dd>{payment.payeeVpa}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink">Reference</dt>
                    <dd>{payment.reference}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink">Note</dt>
                    <dd>{payment.note}</dd>
                  </div>
                </dl>
              </div>

              <div className="flex flex-wrap gap-3">
                <a href={payment.upiLink} className="rounded-full bg-mint px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink">
                  Open UPI app
                </a>
                <CopyButton value={payment.payeeVpa} label="UPI ID" />
                <CopyButton value={payment.reference} label="reference" />
              </div>
            </div>

            <div className="rounded-[28px] border border-line bg-mist p-5 shadow-card">
              <div className="mx-auto flex max-w-[280px] items-center justify-center rounded-[24px] bg-white p-3">
                <img src={qrDataUrl} alt="UPI payment QR code" className="h-auto w-full" />
              </div>
              <p className="mt-4 text-center text-sm text-steel">Scan from Google Pay, PhonePe, Paytm, BHIM, or any UPI app.</p>
            </div>
          </div>
        </section>

        <section className="panel p-6 md:p-8">
          <p className="eyebrow">Status</p>
          <h2 className="mt-4 text-2xl font-semibold text-ink">Payment tracking</h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-[24px] border border-line bg-white/80 p-5 shadow-card">
              <p className="text-sm font-semibold text-ink">Current state</p>
              <p className="mt-2 text-3xl font-semibold text-mint">{payment.status}</p>
              <p className="mt-2 text-sm leading-6 text-steel">Created {formatDate(payment.createdAt)}. After transfer via UPI, mark the payment here so it moves into review.</p>
            </div>

            <form action={reportPayment} className="space-y-3">
              <input type="hidden" name="paymentId" value={payment.id} />
              <SubmitButton
                label={payment.status === "REPORTED" || payment.status === "CONFIRMED" ? "Payment reported" : "Mark payment as reported"}
                pendingLabel="Updating status..."
                className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-mint disabled:opacity-70"
              />
            </form>

            <div className="rounded-[24px] bg-sand px-5 py-4 text-sm leading-6 text-steel">
              Desktop fallback: copy the UPI ID and reference, pay from your phone, then return here and report the payment.
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
