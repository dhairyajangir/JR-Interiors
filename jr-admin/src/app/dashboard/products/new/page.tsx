import { redirect } from "next/navigation";
import { createProduct } from "@/app/actions";
import { DashboardShell } from "@/components/DashboardShell";
import { ProductForm } from "@/components/ProductForm";
import { getCurrentUser } from "@/lib/auth";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const params = await searchParams;

  return (
    <DashboardShell user={user} currentPath="/dashboard/products">
      <section className="panel p-6 md:p-8">
        <p className="eyebrow">New listing</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">Add product to platform.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-steel">
          This creates a listing only inside the standalone admin service. It does not wire into the storefront seller flow.
        </p>
        {params.error ? (
          <p className="mt-4 rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">
            {params.error === "invalid-url" ? "Use only http or https URLs for product images." : "Fill all required fields before saving."}
          </p>
        ) : null}
      </section>

      <section className="panel p-6 md:p-8">
        <ProductForm action={createProduct} mode="create" />
      </section>
    </DashboardShell>
  );
}
