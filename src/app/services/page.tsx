import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = { title: "Interior Services | JR INTERIORS" };

const G = (id: string) => `https://lh3.googleusercontent.com/aida-public/${id}`;
const HERO =
  "AB6AXuBciBzPaTq6kbG9gSV_q5irWYt3iDOu7ESbw38f8KsrmxZ0jPB33hBDty-7Bf7fpJOT6TcmSV42LksFZUlhyusS2Kg1GF24SXGC9lsOXKN-NDB2tbkVjf7mCpPP67YVQURg8XxqMK92GzU-Z-WOo9W3yAj_V4p94rIw-hHRiGqsfWMdpVnpVbZQ-HqM_zgyVCOCjqvPqcn2aqOcJm9KlqB0on6YbO9o6OcupxZlkl3aqrlontZzaP6ucT7ypQ-3ITsiiNf31pbbvLqB";

const STEPS = [
  { n: "01", title: "Discovery", body: "We learn how you live — your rituals, light, and the feeling you want a room to hold." },
  { n: "02", title: "Concept", body: "Mood, palette, and curated pieces come together into a single coherent vision." },
  { n: "03", title: "Curation", body: "We source and, where needed, commission bespoke furniture to fit the space exactly." },
  { n: "04", title: "Installation", body: "White-glove delivery and in-room styling. You arrive home to a finished sanctuary." },
];

export default function ServicesPage() {
  return (
    <main className="pt-32 pb-stack-lg">
      <section className="relative h-[60vh] min-h-[420px] flex items-end overflow-hidden rounded-none">
        <Image src={G(HERO)} alt="Designed living space" fill sizes="100vw" className="object-cover brightness-90" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-stack-md w-full">
          <span className="text-label-xs uppercase tracking-[0.3em] text-white/70 mb-4 block">Interior Design Services</span>
          <h1 className="font-display-hero text-display-hero-mobile md:text-display-hero text-white max-w-3xl leading-[1.1]">
            We design calm, end to end.
          </h1>
        </div>
      </section>

      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-stack-lg">
        <div className="max-w-2xl reveal">
          <h2 className="text-headline-section-mobile md:text-headline-section text-primary mb-4">A considered process</h2>
          <p className="text-body-lg text-on-surface-variant">
            From a single room to a whole home, our design studio guides you through four unhurried stages.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-stack-md mt-stack-md">
          {STEPS.map((s, i) => (
            <div key={s.n} className={`border-t-2 border-secondary/40 pt-6 reveal ${i ? `delay-${i}00` : ""}`}>
              <span className="text-label-xs font-bold text-secondary tracking-widest">{s.n}</span>
              <h3 className="text-subheading text-primary mt-2 mb-2">{s.title}</h3>
              <p className="text-body-md text-on-surface-variant leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-stack-lg">
        <div className="bg-primary rounded-xl p-12 md:p-20 text-center reveal">
          <Icon name="architecture" className="text-on-primary text-4xl mb-6" />
          <h2 className="text-headline-section-mobile md:text-headline-section text-white mb-4">Begin your project</h2>
          <p className="text-white/70 text-body-lg max-w-xl mx-auto mb-10">
            Book a complimentary 45-minute consultation with one of our designers — in studio or virtual.
          </p>
          <Link href="/contact" className="inline-block bg-white text-primary px-10 py-5 rounded-lg font-bold text-label-sm hover:bg-surface-bright transition shadow-xl">
            Book a Consultation
          </Link>
        </div>
      </section>
    </main>
  );
}
