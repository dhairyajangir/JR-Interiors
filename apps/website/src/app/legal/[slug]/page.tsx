import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { LEGAL_DATA } from "@/lib/legal-data";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const doc = LEGAL_DATA[slug];
  if (!doc) return { title: "Legal Policy Not Found" };
  return {
    title: `${doc.title} | JR INTERIORS`,
    description: doc.description,
    alternates: {
      canonical: `/legal/${slug}`,
    },
  };
}

export default async function LegalPage({ params }: { params: Params }) {
  const { slug } = await params;
  const doc = LEGAL_DATA[slug];
  if (!doc) notFound();

  // Legal menu items
  const menuItems = [
    { slug: "privacy", label: "Privacy Policy" },
    { slug: "terms", label: "Terms & Conditions" },
    { slug: "cookies", label: "Cookie Policy" },
    { slug: "refund", label: "Refund Policy" },
    { slug: "cancellation", label: "Cancellation Policy" },
    { slug: "disclaimer", label: "Disclaimer Notice" },
    { slug: "copyright", label: "Copyright Notice" },
    { slug: "accessibility", label: "Accessibility Statement" },
  ];

  return (
    <main className="min-h-screen pt-32 pb-stack-lg bg-surface">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-label-xs uppercase tracking-wider text-on-surface-variant/60 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <Icon name="chevron_right" className="text-[12px]" />
          <span className="text-on-surface-variant/80">Legal</span>
          <Icon name="chevron_right" className="text-[12px]" />
          <span className="text-primary font-semibold">{doc.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-stack-md items-start">
          
          {/* Left Sidebar Navigation */}
          <aside className="lg:col-span-1 bg-surface-container-low border border-outline-variant/30 rounded-xl p-6 lg:sticky lg:top-28">
            <h2 className="text-label-xs uppercase tracking-widest text-primary/50 mb-6 font-bold">
              Legal Atelier
            </h2>
            <nav aria-label="Legal documents navigation">
              <ul className="space-y-4">
                {menuItems.map((item) => {
                  const active = item.slug === slug;
                  return (
                    <li key={item.slug}>
                      <Link
                        href={`/legal/${item.slug}`}
                        className={`block text-body-md transition-colors ${
                          active
                            ? "text-primary font-bold border-l-2 border-primary pl-3"
                            : "text-on-surface-variant hover:text-primary pl-3 border-l border-transparent"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* Main Legal Content Column */}
          <article className="lg:col-span-3 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 md:p-10 editorial-shadow">
            <header className="border-b border-outline-variant/20 pb-6 mb-8">
              <h1 className="font-serif text-headline-section-mobile md:text-headline-section text-primary mb-2">
                {doc.title}
              </h1>
              <p className="text-label-xs text-on-surface-variant/60 uppercase tracking-widest">
                Last updated · {doc.lastUpdated}
              </p>
            </header>

            <div className="space-y-8 text-body-md text-on-surface-variant leading-relaxed">
              {doc.sections.map((section) => (
                <section key={section.heading} className="space-y-3">
                  <h2 className="font-serif text-subheading text-primary font-semibold">
                    {section.heading}
                  </h2>
                  <p className="whitespace-pre-line text-on-surface-variant/90">
                    {section.content}
                  </p>
                </section>
              ))}
            </div>
            
            <footer className="mt-12 pt-6 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between gap-4 text-xs text-on-surface-variant/60">
              <p>JR Interiors · Jaipur, India</p>
            </footer>
          </article>

        </div>
      </div>
    </main>
  );
}
