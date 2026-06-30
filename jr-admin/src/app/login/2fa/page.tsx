import { redirect } from "next/navigation";
import { TwoFactorForm } from "./TwoFactorForm";

export const dynamic = "force-dynamic";

export default async function TwoFactorLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;
  if (!token) redirect("/login");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 md:px-8">
      <div className="mx-auto w-full max-w-[500px]">
        <section className="panel p-8 md:p-10">
          <p className="eyebrow">Security</p>
          <h1 className="mt-4 text-3xl font-semibold text-ink">Two-Factor Authentication</h1>
          <p className="mt-3 text-sm leading-6 text-steel">
            Enter the 6-digit verification code from your authenticator app (e.g. Google Authenticator) to enter the listing workspace.
          </p>
          <div className="mt-8">
            <TwoFactorForm tempToken={token} />
          </div>
        </section>
      </div>
    </main>
  );
}
