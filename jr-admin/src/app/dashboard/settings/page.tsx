import { updateAdminProfile } from "@/app/actions";
import { DashboardShell } from "@/components/DashboardShell";
import { PasswordChangeForm } from "@/components/PasswordChangeForm";
import { TwoFactorSettings } from "@/components/TwoFactorSettings";
import { requireDashboardAdmin } from "@/lib/dashboard";
import { getUpiConfig } from "@/lib/upi";
import { SubmitButton } from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

const fieldClass =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-steel/60 focus:border-mint";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireDashboardAdmin();
  const upi = getUpiConfig();
  const params = await searchParams;

  return (
    <DashboardShell user={user} currentPath="/dashboard/settings">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-mint">Settings</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink font-serif">Profile & System Configuration</h1>
        <p className="mt-1 text-sm text-steel">
          Keep admin profile current, rotate password, and verify billing details used by seller onboarding.
        </p>
        {params.error ? (
          <div className="mt-4 rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">
            Fill required fields before saving profile changes.
          </div>
        ) : null}
      </div>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="space-y-6">
          <section className="panel p-6">
            <h2 className="text-xl font-semibold text-ink">Profile</h2>
            <form action={updateAdminProfile} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-ink" htmlFor="fullName">
                  Full name
                </label>
                <input id="fullName" name="fullName" defaultValue={user.fullName} className={fieldClass} required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-ink" htmlFor="businessName">
                  Business name
                </label>
                <input id="businessName" name="businessName" defaultValue={user.businessName} className={fieldClass} required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-ink" htmlFor="phone">
                  Phone
                </label>
                <input id="phone" name="phone" defaultValue={user.phone ?? ""} className={fieldClass} />
              </div>
              <SubmitButton
                label="Save profile"
                pendingLabel="Saving..."
                className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-mint disabled:opacity-70"
              />
            </form>
          </section>

          <section className="panel p-6">
            <h2 className="text-xl font-semibold text-ink">Password</h2>
            <PasswordChangeForm />
          </section>

          <section className="panel p-6">
            <h2 className="text-xl font-semibold text-ink">Two-Factor Authentication</h2>
            <div className="mt-5">
              <TwoFactorSettings initialEnabled={user.twoFactorEnabled} />
            </div>
          </section>
        </div>

        <section className="panel p-6">
          <h2 className="text-xl font-semibold text-ink">UPI billing config</h2>
          <div className="mt-5 space-y-4">
            <div className="rounded-[22px] bg-sand px-4 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-mint">Registration fee</p>
              <p className="mt-2 text-3xl font-semibold text-ink">INR {upi.registrationFeeInr.toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-[22px] border border-line bg-white/80 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-coral">Payee</p>
              <p className="mt-2 font-semibold text-ink">{upi.payeeName}</p>
              <p className="mt-1 text-sm text-steel">{upi.payeeVpa}</p>
            </div>
            <div className="rounded-[22px] border border-line bg-white/80 px-4 py-4 text-sm leading-6 text-steel">
              Environment-driven only. This page is visibility for operators, not secret editing in-browser.
            </div>
          </div>
        </section>
      </section>
    </DashboardShell>
  );
}
