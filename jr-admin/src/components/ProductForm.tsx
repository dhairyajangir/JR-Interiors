import Link from "next/link";
import { PRODUCT_TYPES } from "@/lib/catalog";
import { SubmitButton } from "@/components/SubmitButton";

const fieldClass =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-steel/60 focus:border-mint";

export type ProductDefaults = {
  id?: string;
  title?: string;
  category?: string;
  priceInr?: number;
  inventory?: number;
  status?: string;
  shortDescription?: string;
  coverImage?: string;
  gallery?: string[];
  featured?: boolean;
};

export function ProductForm({
  action,
  mode,
  product,
}: {
  action: (formData: FormData) => Promise<void>;
  mode: "create" | "edit";
  product?: ProductDefaults;
}) {
  const current = product ?? {};

  return (
    <form action={action} className="space-y-5">
      {mode === "edit" ? <input type="hidden" name="id" value={current.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-ink" htmlFor="title">
            Product title
          </label>
          <input id="title" name="title" required defaultValue={current.title ?? ""} className={fieldClass} placeholder="Contour Sofa" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-ink" htmlFor="category">
            Category
          </label>
          <select id="category" name="category" defaultValue={current.category ?? PRODUCT_TYPES[0]} className={fieldClass}>
            {PRODUCT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-ink" htmlFor="priceInr">
            Price in INR
          </label>
          <input id="priceInr" name="priceInr" type="number" min={1} required defaultValue={current.priceInr ?? ""} className={fieldClass} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-ink" htmlFor="inventory">
            Inventory
          </label>
          <input id="inventory" name="inventory" type="number" min={0} required defaultValue={current.inventory ?? 0} className={fieldClass} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-ink" htmlFor="status">
            Listing status
          </label>
          <select id="status" name="status" defaultValue={current.status ?? "LIVE"} className={fieldClass}>
            <option value="LIVE">Live</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-ink" htmlFor="coverImage">
          Cover image URL
        </label>
        <input
          id="coverImage"
          name="coverImage"
          type="url"
          required
          defaultValue={current.coverImage ?? ""}
          className={fieldClass}
          placeholder="https://images.example.com/item.jpg"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-ink" htmlFor="gallery">
          Gallery URLs
        </label>
        <textarea
          id="gallery"
          name="gallery"
          rows={4}
          defaultValue={(current.gallery ?? []).join("\n")}
          className={fieldClass}
          placeholder={"https://images.example.com/angle-1.jpg\nhttps://images.example.com/angle-2.jpg"}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-ink" htmlFor="shortDescription">
          Product summary
        </label>
        <textarea
          id="shortDescription"
          name="shortDescription"
          rows={5}
          required
          defaultValue={current.shortDescription ?? ""}
          className={fieldClass}
          placeholder="Short, clear description for the listing card and detail preview."
        />
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-line bg-sand/70 px-4 py-3 text-sm text-steel">
        <input type="checkbox" name="featured" defaultChecked={current.featured ?? false} className="h-4 w-4 accent-ink" />
        Mark as featured listing
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SubmitButton
          label={mode === "create" ? "Save product" : "Update product"}
          pendingLabel={mode === "create" ? "Saving..." : "Updating..."}
          className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-mint disabled:opacity-70"
        />
        <Link
          href="/dashboard"
          className="rounded-full border border-line px-6 py-3 text-center text-sm font-semibold text-steel transition hover:border-ink hover:text-ink"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
