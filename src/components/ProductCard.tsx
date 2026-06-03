import Image from "next/image";
import Link from "next/link";
import { price } from "@/lib/format";
import { QuickAddButton } from "@/components/AddToCartButton";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  priceCents: number;
  imageUrl: string;
  colorHexes?: string[];
};

/** Editorial product card matching the furniture / signature grid design. */
export function ProductCard({
  product,
  quickAdd = true,
  priority = false,
}: {
  product: ProductCardData;
  quickAdd?: boolean;
  priority?: boolean;
}) {
  return (
    <div className="group relative flex flex-col">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="aspect-[4/5] rounded-xl overflow-hidden bg-surface-container relative mb-4 editorial-shadow lift">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
            priority={priority}
          />
          <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/0 transition-colors duration-300" />
          {quickAdd && <QuickAddButton productId={product.id} />}
        </div>
      </Link>
      <div className="flex justify-between items-start">
        <div>
          <Link href={`/product/${product.slug}`}>
            <h3 className="text-body-md text-primary font-medium hover:underline">
              {product.name}
            </h3>
          </Link>
          {product.tagline && (
            <p className="text-label-xs text-on-surface-variant mb-1">
              {product.tagline}
            </p>
          )}
          <p className="text-body-md text-primary font-bold">
            {price(product.priceCents)}
          </p>
        </div>
        {product.colorHexes && product.colorHexes.length > 0 && (
          <div className="flex gap-1.5 mt-1">
            {product.colorHexes.slice(0, 3).map((hex) => (
              <span
                key={hex}
                className="w-3 h-3 rounded-full border border-outline-variant"
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
