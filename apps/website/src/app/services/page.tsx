import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Logo, LogoLight } from "@/components/Logo";

export const metadata: Metadata = { title: "Interior Services | JR INTERIORS" };

const G = (id: string) => `https://lh3.googleusercontent.com/aida-public/${id}`;
const HERO =
  "AB6AXuBciBzPaTq6kbG9gSV_q5irWYt3iDOu7ESbw38f8KsrmxZ0jPB33hBDty-7Bf7fpJOT6TcmSV42LksFZUlhyusS2Kg1GF24SXGC9lsOXKN-NDB2tbkVjf7mCpPP67YVQURg8XxqMK92GzU-Z-WOo9W3yAj_V4p94rIw-hHRiGqsfWMdpVnpVbZQ-HqM_zgyVCOCjqvPqcn2aqOcJm9KlqB0on6YbO9o6OcupxZlkl3aqrlontZzaP6ucT7ypQ-3ITsiiNf31pbbvLqB";

const STEPS = [
  { n: "01", title: "Client Consultation", body: "Understanding customer needs, budget, and design style." },
  { n: "02", title: "Site Survey & Measurement", body: "Visiting the location and taking precise architectural measurements." },
  { n: "03", title: "Design & Planning", body: "Creating layouts, 2D/3D design models, and selecting materials." },
  { n: "04", title: "Cost Estimation & Quotation", body: "Preparing the project budget and a detailed, transparent proposal." },
  { n: "05", title: "Procurement", body: "Sourcing premium furniture, hardware, lighting, and custom decor items." },
  { n: "06", title: "Execution & Installation", body: "Civil work, painting, electrical, custom woodwork, and layout installation." },
  { n: "07", title: "Quality Check", body: "Inspecting the finished craftsmanship and correcting any minor issues." },
  { n: "08", title: "Handover & After-Sales Service", body: "Delivering the completed sanctuary and providing ongoing support." },
];

export default function ServicesPage() {
  return (
    <main className="pt-32 pb-stack-lg">
      <section className="relative h-[65vh] min-h-[460px] flex items-end overflow-hidden rounded-none">
        <Image src={G(HERO)} alt="Designed living space" fill sizes="100vw" className="object-cover brightness-90" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-stack-md w-full">
          {/* Hero Icon Only Logo — per brand spec */}
          <div className="mb-6 reveal">
            <LogoLight variant="icon" className="h-16 w-16" decorative />
          </div>
          <span className="text-label-xs uppercase tracking-[0.3em] text-white/70 mb-4 block reveal delay-100">Interior Design Services</span>
          <h1 className="font-display-hero text-display-hero-mobile md:text-display-hero text-white max-w-3xl leading-[1.1] reveal delay-200">
            We design calm, end to end.
          </h1>
        </div>
      </section>

      {/* Operational Process Section */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-stack-lg">
        <div className="max-w-2xl reveal">
          <span className="text-label-xs uppercase tracking-[0.3em] text-primary/60 mb-4 block">Our Process</span>
          <h2 className="text-headline-section-mobile md:text-headline-section text-primary mb-4">Operation Layers</h2>
          <p className="text-body-lg text-on-surface-variant">
            From initial site survey to the final quality checks and handover, our team ensures an unhurried, rigorous execution framework.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-stack-md mt-stack-md">
          {STEPS.map((s, i) => (
            <div key={s.n} className={`border-t-2 border-secondary/40 pt-6 reveal`}>
              <span className="text-label-xs font-bold text-secondary tracking-widest">{s.n}</span>
              <h3 className="text-subheading text-primary mt-2 mb-2">{s.title}</h3>
              <p className="text-body-md text-on-surface-variant leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Specializations Section */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-stack-lg">
        <div className="max-w-2xl reveal">
          <span className="text-label-xs uppercase tracking-[0.3em] text-primary/60 mb-4 block">Our Offerings</span>
          <h2 className="text-headline-section-mobile md:text-headline-section text-primary mb-4">Specialized Craft & Construction</h2>
          <p className="text-body-lg text-on-surface-variant mb-12">
            Beyond custom furniture, we deliver high-fidelity architectural detailing and structural elements for both residential and commercial spaces.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter mt-stack-md">
          {[
            { title: "Custom Furniture", body: "Bespoke residential and office furniture, custom-designed to optimize space, ergonomics, and aesthetic cohesion." },
            { title: "Architectural Facades", body: "Premium exterior cladding and architectural facade systems designed for modern structures." },
            { title: "Atelier Signage", body: "Custom metalwork, luxury identifiers, and spatial signage boards that integrate with branding." },
            { title: "Fine Metalwork", body: "Structural steel and brass railings detailed to add character and integrity to staircases and balconies." },
            { title: "Custom Decor", body: "Selected decorative pieces, curated name plaques, and handcrafted accents that breathe life into your space." },
            { title: "Turnkey Interiors", body: "From initial layout designs to site surveys, measurements, cost estimation, civil execution, and final handover." },
          ].map((item) => (
            <div key={item.title} className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/30 reveal group hover:border-primary/30 transition-colors">
              <Logo variant="icon" className="h-6 w-6 mb-4 opacity-90 group-hover:opacity-100 transition-opacity" decorative />
              <h3 className="text-subheading text-primary font-bold mb-2">{item.title}</h3>
              <p className="text-body-md text-on-surface-variant leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Consultation Callout */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-stack-lg">
        <div className="bg-primary rounded-xl p-12 md:p-20 text-center reveal relative overflow-hidden">
          {/* Subtle watermark in background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <LogoLight variant="watermark" className="w-[500px] h-[500px]" decorative />
          </div>
          
          {/* CTA header: Architectural Icon Only — per brand spec */}
          <div className="flex justify-center mb-6">
            <LogoLight variant="icon" className="h-[70px] w-[70px]" decorative />
          </div>
          <h2 className="text-headline-section-mobile md:text-headline-section text-white mb-4">Begin your project</h2>
          <p className="text-white/70 text-body-lg max-w-xl mx-auto mb-10">
            Book a complimentary 45-minute consultation with one of our designers — in studio or virtual.
          </p>
          <Link href="/contact" className="inline-block bg-white text-primary px-10 py-5 rounded-lg font-bold text-label-sm hover:bg-surface-bright transition shadow-xl relative z-10">
            Book a Consultation
          </Link>
        </div>
      </section>
    </main>
  );
}
