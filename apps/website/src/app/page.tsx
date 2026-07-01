import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Icon } from "@/components/Icon";
import { ProductCard } from "@/components/ProductCard";
import StructuredData from "@/components/StructuredData";
import { getAltText } from "@/lib/altText";
import { Logo } from "@/components/Logo";

export const revalidate = 3600;

const HERO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBciBzPaTq6kbG9gSV_q5irWYt3iDOu7ESbw38f8KsrmxZ0jPB33hBDty-7Bf7fpJOT6TcmSV42LksFZUlhyusS2Kg1GF24SXGC9lsOXKN-NDB2tbkVjf7mCpPP67YVQURg8XxqMK92GzU-Z-WOo9W3yAj_V4p94rIw-hHRiGqsfWMdpVnpVbZQ-HqM_zgyVCOCjqvPqcn2aqOcJm9KlqB0on6YbO9o6OcupxZlkl3aqrlontZzaP6ucT7ypQ-3ITsiiNf31pbbvLqB";
const G = (id: string) => `https://lh3.googleusercontent.com/aida-public/${id}`;
const BLUR_DATA_URL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNGNUYyRUIiLz48L3N2Zz4=";
const ZEN =
  "AB6AXuB4EbdvSwyaKR2QfPs2u5qrjs91YmlM_N3JAAlyQZBMHZ3euTFotdcRRHL37r6wGjNEZ-DQVPGG3mZZRdOJZDzvn7L0w3EqI7ZfCH82Cc59HURVlQwadxLD8S3UWmthqiobBPv2mB7wrZLzNNJDhh8oVHJpEA679Owllht7lAk8kcyIRh4zgt5oE7D9L8myTAuinUWad81_PoWUARk3kjL2Hwj9eoli9K_2Vgeui9rZKWhHN2U-aCbySKRLXBRPokUOfkksROWXojSV";
const NOOK =
  "AB6AXuB6aWZrCuVF_yf5h-aqEJdzXwyEQ319SZYbw0W7PwJ9A36EicqVGSG7r8YWDXwWxcBaH1vvPaQKEnmZu1mDyqlTKJPVDTNdXyVa4WpxfaTV7tUsJNssOp7xhA4USHokrhvjeD23VfQNDYO2UFsH5pRFtkMm3VqryDJuS99dqKkhYspofSsnjY8TRpfbIcXvr6m-T_pLloSC9_mwn36IVc8mTS1jnuxXuArTh-zs8xKr7PGSBtZinDKM5aKXCAWX5R5nVnPQctF4SI55";
const HALL =
  "AB6AXuD0PRwbpCLcbsXX79d4TFr7LNRJmCPXM-fBoYOuy2krlAB0lGsSmGECDNfNBR4ljz4DDRKRdN1Kq3AP2MvJDUbizLE52YAaeIaIucfe_7QZjNG4sn7mvgUAvDKC3v9pP4XCRrRZQjYlyAjNpcdwCloMMAkWHIMHha1424fNS-ka_JNlrsjYMds6gJkRd1KzwKTpB98O6_7krX6S3GzoYQR1yVN2nJOoVLtON9WQZALJNpoY9FWBPcTzZOUEif9x7A59xOQneIVVsj48";
const CONSULT =
  "AB6AXuBDZI4IUtfnvmNOBcHcK-yrjKXGbSpESO4hEb_YsslCx4VW2se4BWJNmumZutJ9nsTEaiGfzn2ge3voj9ytDzBanxV_EkfNptXBT5lwlfltKkli5LPi8xrHRKRAngbhblJ5-cnBHPkDvQ9MrmlLZgdw7Z4gEBypg8BlM-98VrxMFvTEeeENs-cArFQiGIv7BMfL_AmmOmeUq-QvwEeFeR-YUFJIuP9GTTBNCEne5d-VFlQyByltJjAD4lisMCCC4pQ_y_rvHiof_Jt-";

const TESTIMONIALS = [
  {
    rating: 5,
    quote: "Designed our dream home. The team captured exactly the warmth and serenity we wanted for the villa. The craftsmanship is flawless.",
    project: "3200 sq ft Villa",
    location: "Jaipur, RJ",
    completed: "2025",
    author: "Priya Sharma",
  },
  {
    rating: 5,
    quote: "Every piece of furniture tells a story. The Sloane armchairs have transformed our study into a quiet sanctuary where time slows down.",
    project: "Premium Apartment",
    location: "Bengaluru, KA",
    completed: "2024",
    author: "Ananya Rao",
  },
  {
    rating: 5,
    quote: "Our experience with JR Interiors was seamless from concept to completion. The white-glove setup was immaculate, and the solid walnut table is a masterpiece.",
    project: "2400 sq ft Penthouse",
    location: "New Delhi, DL",
    completed: "2025",
    author: "Vikram Malhotra",
  },
  {
    rating: 5,
    quote: "The Japanese minimalist aesthetic combined with Indian craftsmanship is exceptional. Our living room feels incredibly calm and grounded.",
    project: "Modern Duplex",
    location: "Mumbai, MH",
    completed: "2024",
    author: "Meera Patel",
  }
];

export default async function HomePage() {
  const [signature, rooms] = await Promise.all([
    prisma.product.findMany({
      where: { signature: true, status: "PUBLISHED" },
      take: 4,
      orderBy: { priceCents: "desc" },
    }),
    prisma.taxonomy.findMany({ where: { kind: "ROOM" }, orderBy: { sortOrder: "asc" } }),
  ]);

  const living = rooms.find((r) => r.slug === "living-room");
  const bedroom = rooms.find((r) => r.slug === "bedroom");
  const dining = rooms.find((r) => r.slug === "dining-room");

  return (
    <main className="bg-surface overflow-x-hidden">
      <StructuredData />
      
      {/* Cinematic Hero */}
      <section className="relative flex min-h-[clamp(38rem,88dvh,52rem)] items-center overflow-hidden py-28 md:py-32">
        <div className="absolute inset-0 z-0">
          <Image
            src={HERO}
            alt={getAltText("room", "Luxury living room bathed in soft natural light")}
            fill
            priority
            sizes="100vw"
            className="object-cover brightness-[0.9] ken-burns"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
          {/* Legibility scrim — strong cream on the left (text column), clearing to the image on the right. */}
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface/50 to-transparent md:hidden" />
        </div>
        <div className="relative z-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
          <div className="max-w-3xl">

            <span className="text-label-xs uppercase tracking-[0.3em] text-primary/60 mb-6 block reveal delay-100 font-medium">
              Artisanal Atelier
            </span>
            <h1 className="font-serif text-display-hero-mobile md:text-display-hero text-primary mb-8 leading-[1.05] reveal delay-100">
              Spaces Designed <br />
              for Calm Living.
            </h1>
            <p className="text-body-lg text-on-surface-variant mb-12 max-w-md leading-relaxed reveal delay-200">
              Discover luxury handcrafted furniture and custom interior designs. We create architectural sanctuaries tailored to your story.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 reveal delay-300 max-w-md sm:max-w-none">
              <Link
                href="/furniture"
                className="bg-primary text-on-primary text-center px-10 py-5 rounded-full font-bold text-label-xs uppercase tracking-widest hover:opacity-95 transition-all active:scale-95 shadow-md"
              >
                Explore Curated Collections
              </Link>
              <Link className="group flex items-center justify-center sm:justify-start gap-2 text-label-xs uppercase tracking-widest text-primary font-bold py-3" href="/about">
                Our Atelier Heritage
                <Icon name="arrow_forward" className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Case Study (Before/After & Storytelling) */}
      <section className="py-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto border-b border-outline-variant/20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 reveal">
            <span className="text-label-xs uppercase tracking-[0.3em] text-primary/60 mb-4 block font-medium">
              Featured Success Story
            </span>
            <h2 className="text-headline-section-mobile md:text-headline-section font-serif text-primary mb-6 leading-tight">
              The Jaipur Villa
            </h2>
            <p className="text-body-lg text-primary italic font-light mb-8">
              "Transforming a 3200 sq ft concrete frame into a warm, grounded sanctuary that breathes."
            </p>
            <div className="space-y-6 text-body-md text-on-surface-variant leading-relaxed">
              <p>
                <strong>The Challenge:</strong> The client wanted a space that felt open and connected to nature, avoiding the cold, cluttered feel of modern city apartments.
              </p>
              <p>
                <strong>The Response:</strong> We curated a material palette of solid local teakwood, hand-finished natural oils, and raw stone tiles. By implementing custom-crafted low-profile seating and architectural room separators, we created distinct functional zones while maintaining a fluid, airy layout.
              </p>
            </div>
            <div className="mt-10">
              <Link href="/services" className="inline-flex items-center gap-2 text-label-xs font-bold text-primary uppercase tracking-widest hover:opacity-75 transition-opacity">
                Explore Our Design Experiences
                <Icon name="arrow_forward" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-7 reveal delay-150">
            <div className="aspect-[16/10] rounded-2xl overflow-hidden relative shadow-xl bg-surface-container">
              <Image
                src={G(ZEN)}
                alt="High-fidelity photograph of the completed Jaipur Villa living space"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover hover:scale-102 transition-transform duration-1000"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Metrics Section */}
      <section className="py-24 bg-surface-container-low border-b border-outline-variant/20">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-12 text-center lg:text-left">
            <div className="reveal">
              <h3 className="text-4xl font-serif text-primary mb-2 font-light">300+</h3>
              <p className="text-label-xs uppercase tracking-widest text-on-surface-variant/80">Sanctuaries Designed</p>
            </div>
            <div className="reveal delay-100">
              <h3 className="text-4xl font-serif text-primary mb-2 font-light">20+</h3>
              <p className="text-label-xs uppercase tracking-widest text-on-surface-variant/80">Years of Craft Heritage</p>
            </div>
            <div className="reveal delay-200">
              <h3 className="text-4xl font-serif text-primary mb-2 font-light">500+</h3>
              <p className="text-label-xs uppercase tracking-widest text-on-surface-variant/80">Atelier Pieces Delivered</p>
            </div>
            <div className="reveal delay-300">
              <h3 className="text-4xl font-serif text-primary mb-2 font-light">India</h3>
              <p className="text-label-xs uppercase tracking-widest text-on-surface-variant/80">White-Glove Delivery</p>
            </div>
            <div className="reveal delay-400 col-span-2 lg:col-span-1">
              <h3 className="text-4xl font-serif text-primary mb-2 font-light">Lifetime</h3>
              <p className="text-label-xs uppercase tracking-widest text-on-surface-variant/80">Structural Guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Collections Room Browser */}
      <section className="py-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6 reveal">
          <div className="max-w-xl">
            <span className="text-label-xs uppercase tracking-[0.3em] text-primary/60 mb-4 block font-medium">
              Curated Collections
            </span>
            <h2 className="text-headline-section-mobile md:text-headline-section font-serif text-primary leading-tight">
              Inhabiting the Home
            </h2>
          </div>
          <Link
            href="/furniture"
            className="text-label-xs font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-1 hover:border-primary transition-all"
          >
            Full Collection Catalog →
          </Link>
        </div>
        <div className="grid grid-cols-12 gap-8 md:h-[760px]">
          <RoomCard
            className="col-span-12 md:col-span-8 h-[400px] md:h-auto"
            href={living ? `/furniture?room=Living` : "/furniture"}
            image={living?.coverImage ?? G(ZEN)}
            title="Living Room"
            subtitle={living ? `${living.productCount} Curated Pieces` : undefined}
            large
          />
          <div className="col-span-12 md:col-span-4 flex flex-col gap-8">
            <RoomCard
              className="flex-1 h-[300px] md:h-auto"
              href="/furniture?room=Bedroom"
              image={bedroom?.coverImage ?? G(NOOK)}
              title="Bedroom"
            />
            <RoomCard
              className="flex-1 h-[300px] md:h-auto"
              href="/furniture?room=Dining"
              image={dining?.coverImage ?? G(HALL)}
              title="Dining Room"
            />
          </div>
        </div>
      </section>

      {/* Signature Pieces Grid (Selections) */}
      <section className="py-32 bg-surface-container-low border-y border-outline-variant/20">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="text-center mb-20 reveal">
            <span className="text-label-xs uppercase tracking-[0.2em] text-primary/60 mb-4 block font-medium">
              The Signature Pieces
            </span>
            <h2 className="text-headline-section-mobile md:text-headline-section font-serif text-primary">
              Icons of Craft
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {signature.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* Craftsmanship & Heritage Section */}
      <section className="py-32 bg-surface border-b border-outline-variant/20">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7 order-last lg:order-first reveal">
              <div className="aspect-[16/10] rounded-2xl overflow-hidden relative shadow-xl bg-surface-container">
                <Image
                  src={G(CONSULT)}
                  alt="Master craftsman hand finishing custom timber joints at our Jaipur atelier"
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover hover:scale-102 transition-transform duration-1000"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                />
              </div>
            </div>
            <div className="lg:col-span-5 reveal">
              <span className="text-label-xs uppercase tracking-[0.3em] text-primary/60 mb-4 block font-medium">
                Artisanal Provenance
              </span>
              <h2 className="text-headline-section-mobile md:text-headline-section font-serif text-primary mb-6 leading-tight">
                Handcrafted in Jaipur
              </h2>
              <div className="space-y-6 text-body-md text-on-surface-variant leading-relaxed">
                <p>
                  Every piece of JR Interiors furniture is designed and hand-built at our Jaipur atelier by master woodworkers with generations of experience. We do not believe in mass production.
                </p>
                <p>
                  Our workshop merges traditional joinery techniques with modern structural refinement. We hand-select every piece of timber, matching the wood grains to ensure each item is a unique work of art.
                </p>
              </div>
              <div className="mt-10">
                <Link href="/about" className="inline-flex items-center gap-2 text-label-xs font-bold text-primary uppercase tracking-widest hover:opacity-75 transition-opacity">
                  Read The Atelier Story
                  <Icon name="arrow_forward" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Material Library Macro Explorer */}
      <section className="py-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto border-b border-outline-variant/20">
        <div className="text-center mb-20 reveal">
          <span className="text-label-xs uppercase tracking-[0.2em] text-primary/60 mb-4 block font-medium">
            Atelier Resources
          </span>
          <h2 className="text-headline-section-mobile md:text-headline-section font-serif text-primary">
            The Material Library
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="reveal">
            <h3 className="text-subheading font-serif text-primary mb-3">Sustainably Sourced Wood</h3>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              We exclusively use FSC-certified solid teak and American walnut. Every log is verified for ethical harvesting, selected for structural integrity, and hand-finished with natural oils to reveal its deep, organic grain.
            </p>
          </div>
          <div className="reveal delay-100">
            <h3 className="text-subheading font-serif text-primary mb-3">Natural Quarried Stone</h3>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              Our table surfaces and accents feature locally quarried Indian marble and slate. We celebrate the natural fissures and color variations that make every slab completely unique.
            </p>
          </div>
          <div className="reveal delay-200">
            <h3 className="text-subheading font-serif text-primary mb-3">Tactile Upholstery</h3>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              Our textiles are woven from 100% natural Belgian linen, raw cotton fibers, and premium bouclé. Free from harsh chemical backings, they breathe naturally and wear beautifully over time.
            </p>
          </div>
          <div className="reveal delay-300">
            <h3 className="text-subheading font-serif text-primary mb-3">Bespoke Finishes</h3>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              From matte hardware detailing to hand-rubbed zero-VOC wood seals, our finishes are chosen for longevity and health, ensuring your pieces are safe for generations.
            </p>
          </div>
        </div>
      </section>

      {/* GPU Horizontal Testimonials Loop */}
      <section className="py-32 bg-surface-container-lowest border-b border-outline-variant/20 overflow-hidden">
        <div className="text-center mb-20 reveal">
          <span className="text-label-xs uppercase tracking-[0.3em] text-primary/60 mb-4 block font-medium">
            Project Success Stories
          </span>
          <h2 className="text-headline-section-mobile md:text-headline-section font-serif text-primary">
            Voices of the Atelier
          </h2>
        </div>
        
        <div className="marquee-container py-4">
          <div className="marquee-content">
            {TESTIMONIALS.map((t, idx) => (
              <TestimonialCard key={`t1-${idx}`} testimonial={t} />
            ))}
          </div>
          <div className="marquee-content" aria-hidden="true">
            {TESTIMONIALS.map((t, idx) => (
              <TestimonialCard key={`t2-${idx}`} testimonial={t} />
            ))}
          </div>
        </div>
      </section>

      {/* The Design Experience (Process) */}
      <section className="py-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto border-b border-outline-variant/20">
        <div className="text-center mb-20 reveal">
          <span className="text-label-xs uppercase tracking-[0.3em] text-primary/60 mb-4 block font-medium">
            Spatial Journey
          </span>
          <h2 className="text-headline-section-mobile md:text-headline-section font-serif text-primary">
            From Concept to Completion
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { step: "01", title: "Atelier Consultation", desc: "We host a complimentary call or showroom visit to understand your architectural layout, aesthetic goals, and lifestyle requirements." },
            { step: "02", title: "Bespoke Moodboards", desc: "Our team generates tailored material layouts, spatial floorplans, and fabric swatch sets matching the lighting conditions of your home." },
            { step: "03", title: "Atelier Crafting", desc: "Each piece is hand-built to order by our master craftsmen in Jaipur. We share occasional crafting updates directly from the workbench." },
            { step: "04", title: "White-Glove Placement", desc: "Our dedicated delivery team transports, installs, and styles each piece in your space, disposing of all packing material." }
          ].map((item, idx) => (
            <div key={idx} className="p-8 bg-surface-container-low rounded-2xl border border-outline-variant/25 reveal">
              <span className="text-label-xs font-serif text-primary/40 block mb-4 font-bold">{item.step}</span>
              <h3 className="text-subheading font-serif text-primary mb-2">{item.title}</h3>
              <p className="text-body-md text-on-surface-variant/80 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="text-center mb-20 reveal">
          <span className="text-label-xs uppercase tracking-[0.3em] text-primary/60 mb-4 block font-medium">
            Frequently Asked Questions
          </span>
          <h2 className="text-headline-section-mobile md:text-headline-section font-serif text-primary">
            Design & Curation Inquiries
          </h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-6">
          {[
            { q: "What materials does JR Interiors use for luxury furniture?", a: "We use solid teakwood and American walnut, combined with natural Belgian linens, custom organic finishes, and locally sourced stone. All materials are responsibly harvested and built to last generations." },
            { q: "Do you offer custom furniture design services in Jaipur?", a: "Yes. Custom interior design is standard at our atelier. We offer complete custom configurations for dimensions, finishes, and fabric materials to fit your specific room requirements." },
            { q: "How long does delivery take for luxury furniture orders?", a: "Standard delivery for ready-made atelier selections is 7–14 business days across India. Custom bespoke commissions require 4–6 weeks for handcrafting and finishing." },
            { q: "Can I visit the JR Interiors showroom in Jaipur?", a: "Yes. Our Jaipur Atelier is located at Pno. 251 Nirmal Vihar, Dadi Ka Phatak, Jhotwara, Jaipur. We recommend booking a complimentary showroom consultation in advance." }
          ].map((faq, idx) => (
            <div key={idx} className="border-b border-outline-variant/20 pb-6 reveal">
              <h3 className="text-body-md text-primary font-bold mb-2">{faq.q}</h3>
              <p className="text-body-md text-on-surface-variant leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA (Invitation to Begin a Project) */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto reveal">
        <div className="bg-primary rounded-2xl p-8 md:p-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 overflow-hidden relative text-center lg:text-left">
          <div className="flex-1 z-10 w-full">
            <h2 className="text-headline-section-mobile md:text-headline-section text-white font-serif mb-4">
              Let's Create Your Space.
            </h2>
            <p className="text-white/80 text-body-lg mb-8 max-w-md leading-relaxed mx-auto lg:mx-0 font-light">
              Schedule a complimentary design consultation with an expert from the JR Atelier — in-home, showroom, or virtual.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start">
              <Link
                href="/contact"
                className="w-full sm:w-auto text-center bg-white text-primary px-10 py-5 rounded-full font-bold text-label-xs uppercase tracking-widest hover:bg-surface-bright transition-all shadow-xl active:scale-95"
              >
                Book Your Design Consultation
              </Link>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 text-white/70 text-[12px] leading-normal font-light">
              <span>✓ Expert designers (10+ years in luxury)</span>
              <span>✓ Free consultation, no commitment</span>
              <span>✓ Trusted by 200+ homes across India</span>
            </div>
          </div>
          <div className="flex-1 w-full z-10">
            <div className="aspect-video rounded-xl overflow-hidden shadow-2xl relative max-w-lg mx-auto lg:max-w-none">
              <Image src={G(CONSULT)} alt="A spatial interior designer walking through material selections with a client" fill sizes="(max-width:768px) 100vw, 40vw" className="object-cover" placeholder="blur" blurDataURL={BLUR_DATA_URL} />
            </div>
          </div>
          {/* Decorative watermark background — significantly visible */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
            <Logo variant="watermark" className="w-[480px] h-[480px] opacity-[0.06]" decorative />
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
      <Image src={image} alt={getAltText("room", title)} fill sizes={large ? "66vw" : "33vw"} className="object-cover transition-transform duration-1000 group-hover:scale-105" placeholder="blur" blurDataURL={BLUR_DATA_URL} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex flex-col justify-end p-8 md:p-12">
        <h3 className={`text-white font-serif font-light ${large ? "text-3xl mb-2" : "text-2xl"}`}>{title}</h3>
        {subtitle && <p className="text-white/80 text-label-sm">{subtitle}</p>}
      </div>
    </Link>
  );
}

function TestimonialCard({ testimonial }: { testimonial: typeof TESTIMONIALS[number] }) {
  return (
    <div className="w-[380px] sm:w-[440px] shrink-0 bg-surface-container-low p-8 rounded-2xl border border-outline-variant/20 flex flex-col justify-between h-[280px]">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-0.5 text-primary">
            {Array.from({ length: testimonial.rating }).map((_, i) => (
              <Icon key={i} name="star" fill className="text-sm" />
            ))}
          </div>
          {/* Subtle architectural icon accent — per brand card rule */}
          <Logo variant="icon" decorative className="h-8 w-8 ml-auto opacity-20" />
        </div>
        <p className="text-body-md text-primary italic font-light leading-relaxed mb-6">
          &ldquo;{testimonial.quote}&rdquo;
        </p>
      </div>
      <div className="flex justify-between items-end border-t border-outline-variant/20 pt-4 text-label-xs">
        <div>
          <p className="text-primary font-bold">{testimonial.author}</p>
          <p className="text-on-surface-variant/70 mt-0.5">{testimonial.project} · {testimonial.location}</p>
        </div>
        <span className="text-on-surface-variant/50 uppercase tracking-widest text-[9px]">Completed {testimonial.completed}</span>
      </div>
    </div>
  );
}
