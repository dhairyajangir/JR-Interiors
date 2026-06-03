import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Collections | JR INTERIORS" };

export default async function CollectionsPage() {
  const rooms = await prisma.category.findMany({
    where: { kind: "room" },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <main className="pt-32 pb-stack-lg">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="text-center max-w-2xl mx-auto mb-stack-lg reveal">
          <span className="text-label-xs uppercase tracking-[0.2em] text-primary/60 mb-4 block">Curated by Room</span>
          <h1 className="text-headline-section-mobile md:text-headline-section text-primary mb-4">Our Collections</h1>
          <p className="text-body-lg text-on-surface-variant">
            Each collection is composed of pieces that speak the same quiet language — warm materials, honest construction, and timeless silhouettes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {rooms.map((c, i) => (
            <Link
              key={c.id}
              href={`/furniture?room=${roomQuery(c.slug)}`}
              className={`group relative rounded-xl overflow-hidden reveal ${i % 3 === 0 ? "md:col-span-2 h-[420px]" : "h-[360px]"}`}
            >
              {c.imageUrl && (
                <Image src={c.imageUrl} alt={c.name} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 md:p-10 text-white">
                <h2 className="text-headline-section-mobile font-medium mb-2">{c.name}</h2>
                {c.description && <p className="text-white/80 max-w-md mb-3">{c.description}</p>}
                <span className="text-label-sm uppercase tracking-widest">{c.itemCount} pieces →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

function roomQuery(slug: string): string {
  switch (slug) {
    case "living-room": return "Living";
    case "bedroom": return "Bedroom";
    case "dining-room": return "Dining";
    case "studio-office": return "Studio";
    default: return "";
  }
}
