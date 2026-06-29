import type { SafeUser } from "@/lib/auth";

export function DemoBanner({ user }: { user: SafeUser }) {
  if (!user.isDemo) return null;

  return (
    <div className="rounded-[24px] border border-coral/30 bg-coral/10 px-5 py-4 text-sm text-ink">
      <p className="font-semibold tracking-[0.12em] uppercase text-coral">Demo mode</p>
      <p className="mt-2 text-steel">
        Signed in with demo admin account. Use this workspace to test flows before deployment.
      </p>
    </div>
  );
}
