"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSellerUser } from "@/lib/auth";
import { slugify } from "@/lib/catalog";

function str(fd: FormData, k: string): string {
  return ((fd.get(k) as string) ?? "").trim();
}

/** Build product data from the seller form. Price entered in whole ₹ -> paise. */
function parseProduct(fd: FormData) {
  const rupees = Math.max(0, Math.round(Number(str(fd, "priceRupees")) || 0));
  const stock = Math.max(0, Math.round(Number(str(fd, "stock")) || 0));
  const images = str(fd, "images")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const imageUrl = str(fd, "imageUrl") || images[0] || "";
  const colorHexes = str(fd, "colorHexes")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    name: str(fd, "name"),
    tagline: str(fd, "tagline") || null,
    description: str(fd, "description"),
    priceCents: rupees * 100,
    material: str(fd, "material") || "Other",
    room: str(fd, "room") || "Living",
    type: str(fd, "type") || "Decor",
    imageUrl,
    images: images.length ? images : imageUrl ? [imageUrl] : [],
    colorHexes,
    stock,
    inStock: stock > 0,
  };
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const root = slugify(base) || "item";
  let slug = root;
  for (let i = 0; i < 50; i++) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${root}-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  return `${root}-${Date.now()}`;
}

export async function createSellerProduct(fd: FormData): Promise<void> {
  const seller = await getSellerUser();
  if (!seller?.sellerId) redirect("/account/login");

  const data = parseProduct(fd);
  if (!data.name || !data.description || data.priceCents <= 0 || !data.imageUrl) {
    redirect("/seller/products/new?error=missing");
  }
  const slug = await uniqueSlug(data.name);

  await prisma.product.create({
    data: {
      ...data,
      slug,
      sellerId: seller.sellerId,
      status: "PENDING", // awaits admin approval
      finishes: [],
      upholstery: [],
    },
  });
  revalidatePath("/seller");
  redirect("/seller?created=1");
}

export async function updateSellerProduct(fd: FormData): Promise<void> {
  const seller = await getSellerUser();
  if (!seller?.sellerId) redirect("/account/login");
  const id = str(fd, "id");

  const owned = await prisma.product.findFirst({ where: { id, sellerId: seller.sellerId } });
  if (!owned) redirect("/seller");

  const data = parseProduct(fd);
  await prisma.product.update({
    where: { id },
    data: {
      ...data,
      // Any edit re-enters the moderation queue.
      status: "PENDING",
      reviewNote: null,
    },
  });
  revalidatePath("/seller");
  redirect("/seller?updated=1");
}

export async function deleteSellerProduct(fd: FormData): Promise<void> {
  const seller = await getSellerUser();
  if (!seller?.sellerId) redirect("/account/login");
  const id = str(fd, "id");
  await prisma.product.deleteMany({ where: { id, sellerId: seller.sellerId } });
  revalidatePath("/seller");
}

export async function fulfillOrderItem(fd: FormData): Promise<void> {
  const seller = await getSellerUser();
  if (!seller?.sellerId) redirect("/account/login");
  const id = str(fd, "id");
  await prisma.orderItem.updateMany({
    where: { id, sellerId: seller.sellerId },
    data: { itemStatus: "fulfilled" },
  });
  revalidatePath("/seller/orders");
}
