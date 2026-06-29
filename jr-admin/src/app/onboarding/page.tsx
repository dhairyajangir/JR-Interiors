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
      <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-mint">UPI onboarding</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink font-serif">Pay Registration Fee</h1>
          <p className="mt-1 text-sm text-steel max-w-2xl">
            Use any UPI app. Scan QR or copy payment note to proceed with your onboarding payment.
          </p>
        </div>
        <Link href="/dashboard" className="rounded-full border border-line bg-white px-5 py-2.5 text-xs font-semibold text-steel transition hover:bg-mist hover:border-ink hover:text-ink whitespace-nowrap">
          Back to dashboard
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="panel p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="rounded-[24px] bg-ink p-5 text-white shadow-soft">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Amount due</p>
                <p className="mt-2 text-3xl font-bold tracking-tight">{formatInr(payment.amountInr)}</p>
                <p className="mt-1 text-xs text-white/75">Plan: {payment.planName}</p>
              </div>

              <div className="rounded-[24px] border border-line bg-white/80 p-5 shadow-card">
                <p className="text-[10px] font-bold uppercase tracking-widest text-mint">Payment details</p>
                <dl className="mt-4 space-y-3 text-xs text-steel font-semibold">
                  <div className="flex justify-between border-b border-line pb-2">
                    <dt className="text-steel/70">Payee</dt>
                    <dd className="text-ink">{payment.payeeName}</dd>
                  </div>
                  <div className="flex justify-between border-b border-line pb-2">
                    <dt className="text-steel/70">UPI ID</dt>
                    <dd className="text-ink">{payment.payeeVpa}</dd>
                  </div>
                  <div className="flex justify-between border-b border-line pb-2">
                    <dt className="text-steel/70">Reference</dt>
                    <dd className="text-ink">{payment.reference}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-steel/70">Note</dt>
                    <dd className="text-ink">{payment.note}</dd>
                  </div>
                </dl>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <a href={payment.upiLink} className="rounded-full bg-mint px-5 py-3 text-xs font-semibold text-white transition hover:bg-ink text-center">
                  Open UPI app
                </a>
                <CopyButton value={payment.payeeVpa} label="UPI ID" />
                <CopyButton value={payment.reference} label="reference" />
              </div>
            </div>

            <div className="rounded-[28px] border border-line bg-mist p-5 flex flex-col justify-between shadow-card">
              <div className="mx-auto flex max-w-[240px] items-center justify-center rounded-[24px] bg-white p-4 shadow-sm border border-line">
                <img src={qrDataUrl} alt="UPI payment QR code" className="h-auto w-full" />
              </div>
              <p className="mt-4 text-center text-xs text-steel leading-normal font-semibold">Scan from Google Pay, PhonePe, Paytm, BHIM, or any UPI app.</p>
            </div>
          </div>
        </section>

        <section className="panel p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-mint">Status</p>
          <h2 className="mt-2 text-xl font-bold text-ink">Payment tracking</h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-[24px] border border-line bg-white/80 p-5 shadow-card">
              <p className="text-xs font-semibold text-steel/70">Current state</p>
              <p className="mt-1 text-2xl font-bold text-mint">{payment.status}</p>
              <p className="mt-2 text-xs leading-relaxed text-steel font-semibold">Created {formatDate(payment.createdAt)}. After transfer via UPI, mark the payment here so it moves into review.</p>
            </div>

            <form action={reportPayment} className="space-y-3">
              <input type="hidden" name="paymentId" value={payment.id} />
              <SubmitButton
                label={payment.status === "REPORTED" || payment.status === "CONFIRMED" ? "Payment reported" : "Mark payment as reported"}
                pendingLabel="Updating status..."
                className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-mint disabled:opacity-70"
              />
            </form>

            <div className="rounded-[24px] bg-sand px-5 py-4 text-xs font-semibold leading-relaxed text-steel">
              Desktop fallback: copy the UPI ID and reference, pay from your phone, then return here and report the payment.
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
