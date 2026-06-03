import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { price } from "@/lib/format";
import { Icon } from "@/components/Icon";
import { QuickAddButton } from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

const HERO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBciBzPaTq6kbG9gSV_q5irWYt3iDOu7ESbw38f8KsrmxZ0jPB33hBDty-7Bf7fpJOT6TcmSV42LksFZUlhyusS2Kg1GF24SXGC9lsOXKN-NDB2tbkVjf7mCpPP67YVQURg8XxqMK92GzU-Z-WOo9W3yAj_V4p94rIw-hHRiGqsfWMdpVnpVbZQ-HqM_zgyVCOCjqvPqcn2aqOcJm9KlqB0on6YbO9o6OcupxZlkl3aqrlontZzaP6ucT7ypQ-3ITsiiNf31pbbvLqB";
const G = (id: string) => `https://lh3.googleusercontent.com/aida-public/${id}`;
const ZEN =
  "AB6AXuB4EbdvSwyaKR2QfPs2u5qrjs91YmlM_N3JAAlyQZBMHZ3euTFotdcRRHL37r6wGjNEZ-DQVPGG3mZZRdOJZDzvn7L0w3EqI7ZfCH82Cc59HURVlQwadxLD8S3UWmthqiobBPv2mB7wrZLzNNJDhh8oVHJpEA679Owllht7lAk8kcyIRh4zgt5oE7D9L8myTAuinUWad81_PoWUARk3kjL2Hwj9eoli9K_2Vgeui9rZKWhHN2U-aCbySKRLXBRPokUOfkksROWXojSV";
const NOOK =
  "AB6AXuB6aWZrCuVF_yf5h-aqEJdzXwyEQ319SZYbw0W7PwJ9A36EicqVGSG7r8YWDXwWxcBaH1vvPaQKEnmZu1mDyqlTKJPVDTNdXyVa4WpxfaTV7tUsJNssOp7xhA4USHokrhvjeD23VfQNDYO2UFsH5pRFtkMm3VqryDJuS99dqKkhYspofSsnjY8TRpfbIcXvr6m-T_pLloSC9_mwn36IVc8mTS1jnuxXuArTh-zs8xKr7PGSBtZinDKM5aKXCAWX5R5nVnPQctF4SI55";
const HALL =
  "AB6AXuD0PRwbpCLcbsXX79d4TFr7LNRJmCPXM-fBoYOuy2krlAB0lGsSmGECDNfNBR4ljz4DDRKRdN1Kq3AP2MvJDUbizLE52YAaeIaIucfe_7QZjNG4sn7mvgUAvDKC3v9pP4XCRrRZQjYlyAjNpcdwCloMMAkWHIMHha1424fNS-ka_JNlrsjYMds6gJkRd1KzwKTpB98O6_7krX6S3GzoYQR1yVN2nJOoVLtON9WQZALJNpoY9FWBPcTzZOUEif9x7A59xOQneIVVsj48";
const AVATAR =
  "AB6AXuD6BtFcmhIpHz77b6QzvGT4BTKbm3Ae3wbLudFdOwfuesxiEBw69FtO954dKROsK28AGdO_f4wpE9SR31wF0hKS9NJnavP8aDA8w-Mddncp6A7z9GCu50xLbktISgbAJD2bZY9hnWMF4JnuNGz-0IEWAPnwxOQugqsztyyo-jMj-jDmXhD11R_o8xzWXyvCTZmss-l3CnLBFUC5kdgT6kI6OMc-FlLWWyIFwACx6SK7kzQZbInZNxA94z3M-dMlRbihzlDXPP_fq-gE";
const CONSULT =
  "AB6AXuBDZI4IUtfnvmNOBcHcK-yrjKXGbSpESO4hEb_YsslCx4VW2se4BWJNmumZutJ9nsTEaiGfzn2ge3voj9ytDzBanxV_EkfNptXBT5lwlfltKkli5LPi8xrHRKRAngbhblJ5-cnBHPkDvQ9MrmlLZgdw7Z4gEBypg8BlM-98VrxMFvTEeeENs-cArFQiGIv7BMfL_AmmOmeUq-QvwEeFeR-YUFJIuP9GTTBNCEne5d-VFlQyByltJjAD4lisMCCC4pQ_y_rvHiof_Jt-";

export default async function HomePage() {
  const [signature, rooms] = await Promise.all([
    prisma.product.findMany({
      where: { signature: true, status: "PUBLISHED" },
      take: 4,
      orderBy: { priceCents: "desc" },
    }),
    prisma.category.findMany({ where: { kind: "room" }, orderBy: { sortOrder: "asc" } }),
  ]);

  const living = rooms.find((r) => r.slug === "living-room");
  const bedroom = rooms.find((r) => r.slug === "bedroom");
  const dining = rooms.find((r) => r.slug === "dining-room");

  return (
    <main>
      {/* Cinematic Hero */}
      <section className="relative h-[100svh] min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={HERO}
            alt="Luxury living room bathed in soft natural light"
            fill
            priority
            sizes="100vw"
            className="object-cover brightness-95 ken-burns"
          />
          {/* Legibility scrim — strong cream on the left (text column), clearing to the image on the right. */}
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/70 to-surface/10 md:via-surface/55 md:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface/40 to-transparent md:hidden" />
        </div>
        <div className="relative z-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
          <div className="max-w-3xl">
            <span className="text-label-xs uppercase tracking-[0.3em] text-primary/60 mb-6 block reveal">
              Artisanal Living
            </span>
            <h1 className="font-display-hero text-display-hero-mobile md:text-display-hero text-primary mb-8 leading-[1.1] reveal delay-100">
              Spaces designed <br /> for calm living.
            </h1>
            <p className="text-subheading text-on-surface-variant mb-12 max-w-lg leading-relaxed reveal delay-200">
              Discover a collection where warmth meets intentional simplicity.
              Curating sanctuaries for the modern soul.
            </p>
            <div className="flex flex-wrap items-center gap-8 reveal delay-300">
              <Link
                href="/furniture"
                className="bg-primary text-on-primary px-10 py-5 rounded-lg font-label-sm text-label-sm hover:bg-primary/90 transition-all active:scale-95 shadow-md"
              >
                Explore Collection
              </Link>
              <Link className="group flex items-center gap-2 text-label-sm text-primary font-bold" href="/about">
                The Atelier Story
                <Icon name="arrow_forward" className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-12 border-b border-outline-variant bg-surface-container-lowest">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
            {[
              { icon: "verified", label: "Artisan Quality" },
              { icon: "local_shipping", label: "White Glove Service" },
              { icon: "architecture", label: "Expert Curation" },
              { icon: "handyman", label: "Custom Crafted" },
            ].map((t, i) => (
              <div key={t.label} className={`flex items-center gap-4 reveal ${i ? `delay-${i}00` : ""}`}>
                <Icon name={t.icon} className="text-primary text-2xl" />
                <span className="text-label-xs uppercase tracking-widest text-on-surface-variant">
                  {t.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Room browser */}
      <section className="py-stack-lg px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6 reveal">
          <div className="max-w-xl">
            <h2 className="text-headline-section-mobile md:text-headline-section font-bold text-primary mb-4">
              Inhabiting the Home
            </h2>
            <p className="text-body-lg text-on-surface-variant">
              Functional art for every corner of your life.
            </p>
          </div>
          <Link
            href="/furniture"
            className="text-label-sm font-bold text-primary border-b border-primary/20 pb-1 hover:border-primary transition-all"
          >
            Full Catalog
          </Link>
        </div>
        <div className="grid grid-cols-12 gap-8 md:h-[900px]">
          <RoomCard
            className="col-span-12 md:col-span-8 h-[400px] md:h-auto"
            href={living ? `/furniture?room=Living` : "/furniture"}
            image={living?.imageUrl ?? G(ZEN)}
            title="Living Room"
            subtitle={living ? `${living.itemCount} Items in Collection` : undefined}
            large
          />
          <div className="col-span-12 md:col-span-4 flex flex-col gap-8">
            <RoomCard
              className="flex-1 h-[300px] md:h-auto"
              href="/furniture?room=Bedroom"
              image={bedroom?.imageUrl ?? G(NOOK)}
              title="Bedroom"
            />
            <RoomCard
              className="flex-1 h-[300px] md:h-auto"
              href="/furniture?room=Dining"
              image={dining?.imageUrl ?? G(HALL)}
              title="Dining Room"
            />
          </div>
        </div>
      </section>

      {/* Signature pieces */}
      <section className="py-stack-lg bg-surface-container-low">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="text-center mb-16 reveal">
            <span className="text-label-xs uppercase tracking-[0.2em] text-primary/60 mb-4 block">
              The Signature Pieces
            </span>
            <h2 className="text-headline-section-mobile md:text-headline-section font-bold text-primary">
              Icons of Craft
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {signature.map((p, i) => (
              <div key={p.id} className={`group reveal ${i ? `delay-${i}00` : ""}`}>
                <div className="aspect-[4/5] rounded-lg overflow-hidden mb-6 bg-white editorial-shadow relative">
                  <Link href={`/product/${p.slug}`}>
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      fill
                      sizes="(max-width:640px) 100vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </Link>
                  <QuickAddButton productId={p.id} />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <Link href={`/product/${p.slug}`}>
                      <h4 className="text-label-sm font-bold text-primary mb-1 hover:underline">
                        {p.name}
                      </h4>
                    </Link>
                    <p className="text-on-surface-variant text-body-md">{price(p.priceCents)}</p>
                  </div>
                  <div className="flex gap-1.5 mt-1">
                    {p.colorHexes.slice(0, 2).map((hex) => (
                      <span
                        key={hex}
                        className="w-3 h-3 rounded-full border border-outline-variant"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial gallery */}
      <section className="py-stack-lg bg-surface">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-16 reveal text-center">
          <h2 className="text-headline-section-mobile md:text-headline-section font-bold text-primary">
            Living with JR
          </h2>
          <p className="text-on-surface-variant mt-2">Glimpses into spaces that breathe.</p>
        </div>
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto grid grid-cols-12 gap-gutter md:h-[1000px] reveal">
          <div className="col-span-12 md:col-span-7 h-[400px] md:h-full relative group overflow-hidden rounded-lg">
            <Image
              src={G(ZEN)}
              alt="The Zen Attic — functional minimalism in raw textures"
              fill
              sizes="(max-width:768px) 100vw, 58vw"
              className="object-cover grayscale-[0.2] transition-transform duration-[2s] group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute bottom-12 left-12 max-w-sm text-white">
              <h4 className="text-2xl font-light mb-4">The Zen Attic</h4>
              <p className="text-white/80 font-light leading-relaxed">
                A masterclass in functional minimalism, using raw textures to
                create warmth and a deep connection to nature.
              </p>
            </div>
          </div>
          <div className="col-span-12 md:col-span-5 flex flex-col gap-gutter h-full">
            <div className="flex-1 h-[250px] md:h-auto relative overflow-hidden rounded-lg group">
              <Image src={G(NOOK)} alt="Reading nook" fill sizes="(max-width:768px) 100vw, 42vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/10" />
            </div>
            <div className="flex-1 h-[250px] md:h-auto relative overflow-hidden rounded-lg group">
              <Image src={G(HALL)} alt="Hallway detail" fill sizes="(max-width:768px) 100vw, 42vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-stack-lg bg-surface-container-low border-y border-outline-variant">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto reveal">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-label-xs uppercase tracking-[0.3em] text-primary/60 mb-8 block">
              Voices of the Atelier
            </span>
            <div className="relative px-8 md:px-24">
              <Icon name="format_quote" className="absolute -top-4 left-0 text-primary/20 text-6xl" />
              <p className="text-subheading md:text-3xl font-light text-primary italic leading-relaxed mb-12">
                &ldquo;The quality of the Sloane armchair is beyond what we
                expected. It has transformed our living room into a serene
                sanctuary where time seems to slow down.&rdquo;
              </p>
              <div className="flex flex-col items-center gap-4">
                <Image
                  src={G(AVATAR)}
                  alt="Ananya Rao"
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                />
                <div className="text-center">
                  <p className="text-label-sm font-bold text-primary">Ananya Rao</p>
                  <p className="text-label-xs text-on-surface-variant">Bengaluru, KA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-stack-lg px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto reveal">
        <div className="bg-primary rounded-lg p-12 md:p-20 flex flex-col md:flex-row items-center gap-16 overflow-hidden relative">
          <div className="flex-1 z-10">
            <h2 className="text-headline-section-mobile md:text-headline-section text-white mb-6">
              Ready to find your calm?
            </h2>
            <p className="text-white/70 text-body-lg mb-10 max-w-md leading-relaxed">
              Book a complimentary design consultation to start your journey
              towards a more balanced home.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-white text-primary px-10 py-5 rounded-lg font-bold text-label-sm hover:bg-surface-bright transition-all shadow-xl"
            >
              Book Your Consultation
            </Link>
          </div>
          <div className="flex-1 w-full z-10">
            <div className="aspect-video rounded-lg overflow-hidden shadow-2xl relative">
              <Image src={G(CONSULT)} alt="Design consultation" fill sizes="(max-width:768px) 100vw, 40vw" className="object-cover" />
            </div>
          </div>
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/felt.png')]" />
        </div>
      </section>
    </main>
  );
}

function RoomCard({
  href,
  image,
  title,
  subtitle,
  large,
  className,
}: {
  href: string;
  image: string;
  title: string;
  subtitle?: string;
  large?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} className={`relative rounded-lg overflow-hidden group reveal block ${className ?? ""}`}>
      <Image src={image} alt={title} fill sizes={large ? "66vw" : "33vw"} className="object-cover transition-transform duration-1000 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex flex-col justify-end p-8 md:p-12">
        <h3 className={`text-white font-light ${large ? "text-3xl mb-2" : "text-2xl"}`}>{title}</h3>
        {subtitle && <p className="text-white/80 text-label-sm">{subtitle}</p>}
      </div>
    </Link>
  );
}
