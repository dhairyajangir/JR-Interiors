import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { price } from "@/lib/format";
import { Icon } from "@/components/Icon";
import { QuickAddButton } from "@/components/AddToCartButton";
import StructuredData from "@/components/StructuredData";
import { getAltText } from "@/lib/altText";

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
    <main className="overflow-x-hidden">
      <StructuredData />
      
      {/* Cinematic Hero */}
      <section className="relative h-[100svh] min-h-[580px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={HERO}
            alt={getAltText("room", "Luxury living room bathed in soft natural light")}
            fill
            priority
            sizes="100vw"
            className="object-cover brightness-90 ken-burns"
          />
          {/* Scrims */}
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/65 to-surface/10 md:via-surface/50 md:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface/90 via-surface/30 to-transparent md:hidden" />
        </div>
        
        <div className="relative z-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full pt-10">
          <div className="max-w-3xl md:text-left text-center">
            <span className="text-[10px] md:text-label-xs uppercase tracking-[0.3em] text-primary/60 mb-4 block reveal font-semibold">
              Artisanal Living
            </span>
            <h1 className="font-display-hero text-[34px] md:text-[64px] text-primary mb-6 leading-[1.15] font-bold reveal delay-100 max-w-xl md:max-w-none mx-auto">
              Luxury Furniture India & Spaces Designed for Calm Living
            </h1>
            <p className="text-[16px] md:text-subheading text-on-surface-variant mb-10 max-w-lg leading-relaxed reveal delay-200 mx-auto md:mx-0">
              Where warmth meets intentional, minimalist design. Handcrafted in Jaipur to curate sanctuaries for the modern home.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-5 reveal delay-300">
              <Link
                href="/furniture"
                className="w-full sm:w-auto text-center bg-primary text-on-primary px-10 py-5 rounded-full font-semibold text-label-sm hover:bg-primary/95 transition-all active:scale-95 shadow-md"
              >
                Explore the Catalog
              </Link>
              <Link 
                className="group flex items-center gap-2 text-label-sm text-primary font-bold py-2" 
                href="/about"
              >
                The Atelier Story
                <Icon name="arrow_forward" className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Swipe Hint */}
        <div className="absolute bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 opacity-70 animate-[bounce_2s_infinite]">
          <span className="text-[9px] uppercase tracking-[0.25em] text-primary font-semibold">Swipe Down</span>
          <Icon name="keyboard_arrow_down" className="text-primary text-[20px]" />
        </div>
      </section>

      {/* Trust strip - Swipable on mobile */}
      <section className="py-8 border-b border-outline-variant bg-surface-container-lowest overflow-hidden">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="flex md:grid md:grid-cols-4 gap-6 md:gap-gutter overflow-x-auto scroll-hide touch-momentum snap-x snap-mandatory">
            {[
              { icon: "verified", label: "Artisan Quality", desc: "Generations of craftsmanship" },
              { icon: "local_shipping", label: "White Glove Delivery", desc: "In-home assembly & placement" },
              { icon: "architecture", label: "Expert Curation", desc: "Designed for elegant spaces" },
              { icon: "handyman", label: "Custom Crafted", desc: "Tailored to your preferences" },
            ].map((t, i) => (
              <div 
                key={t.label} 
                className="flex items-center gap-3.5 shrink-0 w-[72vw] md:w-auto snap-start p-3 bg-surface-container-low/30 md:bg-transparent rounded-xl reveal"
              >
                <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                  <Icon name={t.icon} className="text-xl" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary">{t.label}</p>
                  <p className="text-[11px] text-on-surface-variant/80">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-margin-mobile md:px-24 bg-surface-container-lowest border-b border-outline-variant/30 max-w-[1240px] mx-auto">
        <h2 className="text-[24px] md:text-headline-section font-bold text-primary mb-10 text-center">
          Why Choose JR Interiors
        </h2>
        
        {/* Swipable cards on mobile, 4 cols on desktop */}
        <div className="flex md:grid md:grid-cols-4 gap-6 overflow-x-auto scroll-hide touch-momentum snap-x snap-mandatory pb-4">
          {[
            {
              title: "Handcrafted in Jaipur",
              desc: "Every piece of luxury furniture is built at our Jaipur atelier by master craftsmen with generations of expertise. We do not mass-produce; each piece is made to order."
            },
            {
              title: "Sustainably Sourced",
              desc: "Our materials — FSC-certified timber, soy-based foam, and natural textiles — are chosen for both beauty and responsibility. Luxury should never compromise our planet."
            },
            {
              title: "White-Glove Assembly",
              desc: "From your complimentary design consultation to in-home setup, our team handles every detail. Our furniture arrives fully assembled, placed exactly where you want it."
            },
            {
              title: "Custom Tailored",
              desc: "Working with our in-house designers, you can configure any piece to your exact dimensions, fabric, and finish. Custom design is standard, not a premium extra."
            }
          ].map((item, idx) => (
            <div 
              key={idx}
              className="shrink-0 w-[80vw] md:w-auto snap-start bg-surface-container-low/40 p-6 rounded-2xl border border-outline-variant/20 flex flex-col justify-between"
            >
              <div>
                <span className="text-[28px] font-serif text-primary/10 font-bold block mb-2">0{idx + 1}</span>
                <h3 className="text-label-sm font-bold text-primary mb-3 text-[16px]">
                  {item.title}
                </h3>
                <p className="text-[13px] text-on-surface-variant leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Room Browser - Swipable Carousel on Mobile */}
      <section className="py-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="flex justify-between items-end mb-8 reveal">
          <div className="max-w-xl">
            <span className="text-[10px] uppercase tracking-widest text-primary/60 mb-2 block font-semibold">
              Shop by Space
            </span>
            <h2 className="text-[24px] md:text-headline-section font-bold text-primary">
              Inhabiting the Home
            </h2>
          </div>
          <Link
            href="/furniture"
            className="text-label-sm font-bold text-primary border-b border-primary/20 pb-0.5 hover:border-primary transition-all shrink-0"
          >
            All Rooms
          </Link>
        </div>

        {/* Mobile View: Horizontal Scroll */}
        <div className="flex md:hidden gap-5 overflow-x-auto scroll-hide touch-momentum snap-x snap-mandatory pb-4">
          <RoomCardMobile
            href={living ? `/furniture?room=Living` : "/furniture"}
            image={living?.imageUrl ?? G(ZEN)}
            title="Living Room"
            subtitle={living ? `${living.itemCount} Items` : undefined}
          />
          <RoomCardMobile
            href="/furniture?room=Bedroom"
            image={bedroom?.imageUrl ?? G(NOOK)}
            title="Bedroom"
            subtitle={bedroom ? `${bedroom.itemCount} Items` : undefined}
          />
          <RoomCardMobile
            href="/furniture?room=Dining"
            image={dining?.imageUrl ?? G(HALL)}
            title="Dining Room"
            subtitle={dining ? `${dining.itemCount} Items` : undefined}
          />
        </div>

        {/* Desktop View: Grid */}
        <div className="hidden md:grid grid-cols-12 gap-8 h-[750px]">
          <RoomCard
            className="col-span-8 h-full"
            href={living ? `/furniture?room=Living` : "/furniture"}
            image={living?.imageUrl ?? G(ZEN)}
            title="Living Room"
            subtitle={living ? `${living.itemCount} Items in Collection` : undefined}
            large
          />
          <div className="col-span-4 flex flex-col gap-8">
            <RoomCard
              className="flex-1"
              href="/furniture?room=Bedroom"
              image={bedroom?.imageUrl ?? G(NOOK)}
              title="Bedroom"
              subtitle={bedroom ? `${bedroom.itemCount} Items` : undefined}
            />
            <RoomCard
              className="flex-1"
              href="/furniture?room=Dining"
              image={dining?.imageUrl ?? G(HALL)}
              title="Dining Room"
              subtitle={dining ? `${dining.itemCount} Items` : undefined}
            />
          </div>
        </div>
      </section>

      {/* Signature pieces - Carousel on Mobile */}
      <section className="py-16 bg-surface-container-low border-y border-outline-variant/20">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="text-center mb-10 reveal">
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary/60 mb-2 block font-semibold">
              Curated Masterpieces
            </span>
            <h2 className="text-[24px] md:text-headline-section font-bold text-primary">
              Signature Creations
            </h2>
          </div>

          {/* Mobile swipe feed */}
          <div className="flex md:grid md:grid-cols-4 gap-6 overflow-x-auto scroll-hide touch-momentum snap-x snap-mandatory pb-4">
            {signature.map((p, i) => (
              <div 
                key={p.id} 
                className="shrink-0 w-[78vw] md:w-auto snap-start group bg-surface-bright p-3 rounded-2xl border border-outline-variant/15 reveal"
              >
                <div className="aspect-[4/5] rounded-xl overflow-hidden mb-4 bg-white relative">
                  <Link href={`/product/${p.slug}`}>
                    <Image
                      src={p.imageUrl}
                      alt={getAltText("product", p.name, p.tagline || p.material)}
                      fill
                      sizes="(max-width:768px) 78vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </Link>
                  <QuickAddButton productId={p.id} />
                </div>
                <div className="flex justify-between items-start px-1">
                  <div>
                    <Link href={`/product/${p.slug}`}>
                      <h4 className="text-label-sm font-bold text-primary mb-1 hover:underline text-[14px] line-clamp-1">
                        {p.name}
                      </h4>
                    </Link>
                    <p className="text-on-surface-variant text-[14px] font-semibold">{price(p.priceCents)}</p>
                  </div>
                  <div className="flex gap-1.5 mt-1">
                    {p.colorHexes.slice(0, 2).map((hex) => (
                      <span
                        key={hex}
                        className="w-3.5 h-3.5 rounded-full border border-outline-variant/60"
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

      {/* Editorial gallery - Carousel on Mobile */}
      <section className="py-16 bg-surface">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-8 reveal text-center">
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary/60 mb-2 block font-semibold">Inspiration</span>
          <h2 className="text-[24px] md:text-headline-section font-bold text-primary">
            Spaces that Breathe
          </h2>
        </div>

        {/* Mobile Swipe Feed */}
        <div className="flex md:hidden gap-5 overflow-x-auto scroll-hide touch-momentum snap-x snap-mandatory px-margin-mobile pb-4">
          <div className="shrink-0 w-[84vw] snap-start relative h-[360px] rounded-2xl overflow-hidden group">
            <Image
              src={G(ZEN)}
              alt="Zen Attic"
              fill
              sizes="84vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-6" />
            <div className="absolute bottom-6 left-6 right-6 text-white z-10">
              <h4 className="text-xl font-medium mb-1">The Zen Attic</h4>
              <p className="text-[12px] text-white/80 font-light leading-relaxed line-clamp-2">
                A masterclass in functional minimalism, using raw textures to connect to nature.
              </p>
            </div>
          </div>

          <div className="shrink-0 w-[84vw] snap-start relative h-[360px] rounded-2xl overflow-hidden group">
            <Image
              src={G(NOOK)}
              alt="Reading nook"
              fill
              sizes="84vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6" />
            <div className="absolute bottom-6 left-6 text-white z-10">
              <h4 className="text-xl font-medium">The Solitude Nook</h4>
            </div>
          </div>

          <div className="shrink-0 w-[84vw] snap-start relative h-[360px] rounded-2xl overflow-hidden group">
            <Image
              src={G(HALL)}
              alt="Hallway detail"
              fill
              sizes="84vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6" />
            <div className="absolute bottom-6 left-6 text-white z-10">
              <h4 className="text-xl font-medium">Atelier Entryway</h4>
            </div>
          </div>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto grid-cols-12 gap-gutter h-[800px] reveal">
          <div className="col-span-7 h-full relative group overflow-hidden rounded-xl">
            <Image
              src={G(ZEN)}
              alt={getAltText("room", "The Zen Attic — functional minimalism in raw textures")}
              fill
              sizes="58vw"
              className="object-cover grayscale-[0.1] transition-transform duration-[2s] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/15" />
            <div className="absolute bottom-12 left-12 max-w-sm text-white">
              <h4 className="text-2xl font-light mb-4">The Zen Attic</h4>
              <p className="text-white/80 font-light leading-relaxed">
                A masterclass in functional minimalism, using raw textures to
                create warmth and a deep connection to nature.
              </p>
            </div>
          </div>
          <div className="col-span-5 flex flex-col gap-gutter h-full">
            <div className="flex-1 relative overflow-hidden rounded-xl group">
              <Image src={G(NOOK)} alt={getAltText("room", "Reading nook")} fill sizes="42vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/10" />
            </div>
            <div className="flex-1 relative overflow-hidden rounded-xl group">
              <Image src={G(HALL)} alt={getAltText("room", "Hallway detail")} fill sizes="42vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-surface-container-low border-y border-outline-variant/30">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto reveal">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-[10px] uppercase tracking-[0.3em] text-primary/60 mb-6 block font-semibold">
              Voices of the Atelier
            </span>
            <div className="relative px-4 md:px-24">
              <Icon name="format_quote" className="absolute -top-6 left-0 text-primary/10 text-[80px]" />
              <p className="text-[18px] md:text-2xl font-light text-primary italic leading-relaxed mb-8">
                &ldquo;The quality of the Sloane armchair is beyond what we
                expected. It has transformed our living room into a serene
                sanctuary where time seems to slow down.&rdquo;
              </p>
              <div className="flex flex-col items-center gap-3">
                <Image
                  src={G(AVATAR)}
                  alt={getAltText("customer", "Ananya Rao")}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-full object-cover border border-outline-variant shadow-sm"
                />
                <div>
                  <p className="text-label-sm font-bold text-primary">Ananya Rao</p>
                  <p className="text-[11px] text-on-surface-variant/80">Bengaluru, KA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Consultation CTA */}
      <section className="py-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto reveal">
        <div className="bg-primary rounded-2xl p-8 md:p-16 flex flex-col lg:flex-row items-center gap-10 overflow-hidden relative">
          <div className="flex-1 z-10 text-center lg:text-left">
            <h2 className="text-[26px] md:text-headline-section text-white mb-4 font-bold">
              Ready to Design Your Calm Space?
            </h2>
            <p className="text-white/80 text-[14px] md:text-body-lg mb-8 max-w-md leading-relaxed mx-auto lg:mx-0">
              Schedule a complimentary design consultation with an expert from the JR Atelier — in-home or virtual. Limited slots available this month.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start">
              <Link
                href="/contact"
                className="w-full sm:w-auto text-center bg-white text-primary px-10 py-5 rounded-full font-bold text-label-sm hover:bg-surface-bright transition-all shadow-xl active:scale-95"
              >
                Book Your Design Consultation
              </Link>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-4 text-white/70 text-[12px] items-center justify-center lg:justify-start">
              <span>✓ Expert interior curation</span>
              <span>✓ Complimentary, no commitment</span>
            </div>
          </div>
          
          <div className="flex-1 w-full z-10">
            <div className="aspect-video rounded-xl overflow-hidden shadow-xl relative max-w-lg mx-auto lg:max-w-none">
              <Image src={G(CONSULT)} alt={getAltText("atelier", "Design consultation")} fill sizes="(max-width:768px) 100vw, 40vw" className="object-cover" />
            </div>
          </div>
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/felt.png')]" />
        </div>
      </section>
    </main>
  );
}

function RoomCardMobile({
  href,
  image,
  title,
  subtitle,
}: {
  href: string;
  image: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <Link href={href} className="shrink-0 w-[78vw] snap-start relative h-[280px] rounded-2xl overflow-hidden block">
      <Image src={image} alt={title} fill sizes="78vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex flex-col justify-end p-6" />
      <div className="absolute bottom-6 left-6 text-white z-10">
        <h3 className="text-xl font-medium mb-1">{title}</h3>
        {subtitle && <p className="text-white/80 text-[12px]">{subtitle}</p>}
      </div>
    </Link>
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
    <Link href={href} className={`relative rounded-xl overflow-hidden group reveal block ${className ?? ""}`}>
      <Image src={image} alt={getAltText("room", title)} fill sizes={large ? "66vw" : "33vw"} className="object-cover transition-transform duration-1000 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent flex flex-col justify-end p-8 md:p-12" />
      <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 text-white z-10">
        <h3 className={`font-light ${large ? "text-3xl mb-2" : "text-2xl"}`}>{title}</h3>
        {subtitle && <p className="text-white/80 text-label-sm">{subtitle}</p>}
      </div>
    </Link>
  );
}
