"use client";

import Link from "next/link";
import { useState } from "react";
import { createSellerProduct, updateSellerProduct } from "@/app/seller-actions";
import { PRODUCT_TYPES, PRODUCT_ROOMS, PRODUCT_MATERIALS } from "@/lib/catalog";

const FIELD =
  "w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition";
const LABEL = "text-label-sm text-primary block mb-2";

export type ProductDefaults = {
  id?: string;
  name?: string;
  tagline?: string | null;
  description?: string;
  priceCents?: number;
  material?: string;
  room?: string;
  type?: string;
  imageUrl?: string;
  images?: string[];
  colorHexes?: string[];
  stock?: number;
};

export function SellerProductForm({
  mode,
  product,
}: {
  mode: "create" | "edit";
  product?: ProductDefaults;
}) {
  const [submitting, setSubmitting] = useState(false);
  const action = mode === "create" ? createSellerProduct : updateSellerProduct;
  const p = product ?? {};

  return (
    <form action={action} onSubmit={() => setSubmitting(true)} className="space-y-5">
      {mode === "edit" && <input type="hidden" name="id" value={p.id} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL} htmlFor="name">Product name *</label>
          <input id="name" name="name" required defaultValue={p.name ?? ""} placeholder="Aurelius Lounge Chair" className={FIELD} />
        </div>
        <div>
          <label className={LABEL} htmlFor="tagline">Tagline</label>
          <input id="tagline" name="tagline" defaultValue={p.tagline ?? ""} placeholder="Walnut / Linen" className={FIELD} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={LABEL} htmlFor="priceRupees">Price (₹) *</label>
          <input id="priceRupees" name="priceRupees" type="number" min={1} required defaultValue={p.priceCents ? Math.round(p.priceCents / 100) : ""} placeholder="85000" className={FIELD} />
        </div>
        <div>
          <label className={LABEL} htmlFor="stock">Stock</label>
          <input id="stock" name="stock" type="number" min={0} defaultValue={p.stock ?? 10} placeholder="10" className={FIELD} />
        </div>
        <div>
          <label className={LABEL} htmlFor="material">Material</label>
          <select id="material" name="material" defaultValue={p.material ?? "Solid Walnut"} className={FIELD}>
            {PRODUCT_MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL} htmlFor="room">Room</label>
          <select id="room" name="room" defaultValue={p.room ?? "Living"} className={FIELD}>
            {PRODUCT_ROOMS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL} htmlFor="type">Category</label>
          <select id="type" name="type" defaultValue={p.type ?? "Seating"} className={FIELD}>
            {PRODUCT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor="imageUrl">Main image URL *</label>
        <input id="imageUrl" name="imageUrl" required defaultValue={p.imageUrl ?? ""} placeholder="https://…/photo.jpg" className={FIELD} />
      </div>
      <div>
        <label className={LABEL} htmlFor="images">Gallery image URLs (one per line)</label>
        <textarea id="images" name="images" rows={3} defaultValue={(p.images ?? []).join("\n")} placeholder={"https://…/1.jpg\nhttps://…/2.jpg"} className={FIELD} />
      </div>
      <div>
        <label className={LABEL} htmlFor="colorHexes">Colour swatches (hex, comma-separated)</label>
        <input id="colorHexes" name="colorHexes" defaultValue={(p.colorHexes ?? []).join(", ")} placeholder="#513726, #F8F6F2" className={FIELD} />
      </div>
      <div>
        <label className={LABEL} htmlFor="description">Description *</label>
        <textarea id="description" name="description" rows={5} required defaultValue={p.description ?? ""} placeholder="Tell the story of this piece — materials, craft, dimensions…" className={FIELD} />
      </div>

      <div className="flex items-center gap-2 text-label-xs text-on-surface-variant bg-secondary-container/40 rounded-lg px-4 py-3">
        Saving submits this listing for admin approval before it appears in the store.
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={submitting} className="bg-primary text-on-primary px-8 py-3 rounded-lg font-label-sm hover:opacity-90 transition disabled:opacity-70">
          {submitting ? "Saving…" : mode === "create" ? "Submit for review" : "Save & resubmit"}
        </button>
        <Link href="/seller" className="px-8 py-3 rounded-lg font-label-sm text-on-surface-variant hover:bg-surface-container transition">
          Cancel
        </Link>
      </div>
    </form>
  );
}
