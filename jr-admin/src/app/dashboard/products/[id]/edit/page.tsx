import { redirect } from "next/navigation";
import { updateProduct } from "@/app/actions";
import { DashboardShell } from "@/components/DashboardShell";
import { ProductForm } from "@/components/ProductForm";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const query = await searchParams;
  const product = await prisma.product.findFirst({
    where: { id, ownerId: user.id },
  });

  if (!product) redirect("/dashboard");

  return (
    <DashboardShell user={user} currentPath="/dashboard/products">
      <section className="panel p-6 md:p-8">
        <p className="eyebrow">Edit listing</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">{product.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-steel">
          Update product data, keep listing isolated from ecommerce, and publish changes directly from this service.
        </p>
        {query.error ? (
          <p className="mt-4 rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">
            {query.error === "invalid-url" ? "Use only http or https URLs for product images." : "Fill all required fields before saving."}
          </p>
        ) : null}
      </section>

      <section className="panel p-6 md:p-8">
        <ProductForm
          action={updateProduct}
          mode="edit"
          product={{
            id: product.id,
            title: product.title,
            category: product.category,
            priceInr: product.priceInr,
            inventory: product.inventory,
            status: product.status,
            shortDescription: product.shortDescription,
            coverImage: product.coverImage,
            gallery: product.gallery,
            featured: product.featured,
          }}
        />
      </section>
    </DashboardShell>
  );
}
