import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = { title: "About | JR INTERIORS" };

const G = (id: string) => `https://lh3.googleusercontent.com/aida-public/${id}`;
const HERO =
  "AB6AXuB4EbdvSwyaKR2QfPs2u5qrjs91YmlM_N3JAAlyQZBMHZ3euTFotdcRRHL37r6wGjNEZ-DQVPGG3mZZRdOJZDzvn7L0w3EqI7ZfCH82Cc59HURVlQwadxLD8S3UWmthqiobBPv2mB7wrZLzNNJDhh8oVHJpEA679Owllht7lAk8kcyIRh4zgt5oE7D9L8myTAuinUWad81_PoWUARk3kjL2Hwj9eoli9K_2Vgeui9rZKWhHN2U-aCbySKRLXBRPokUOfkksROWXojSV";
const WORKSHOP =
  "AB6AXuB6aWZrCuVF_yf5h-aqEJdzXwyEQ319SZYbw0W7PwJ9A36EicqVGSG7r8YWDXwWxcBaH1vvPaQKEnmZu1mDyqlTKJPVDTNdXyVa4WpxfaTV7tUsJNssOp7xhA4USHokrhvjeD23VfQNDYO2UFsH5pRFtkMm3VqryDJuS99dqKkhYspofSsnjY8TRpfbIcXvr6m-T_pLloSC9_mwn36IVc8mTS1jnuxXuArTh-zs8xKr7PGSBtZinDKM5aKXCAWX5R5nVnPQctF4SI55";

export default function AboutPage() {
  return (
    <main className="pt-32 pb-stack-lg">
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="max-w-3xl reveal">
          <span className="text-label-xs uppercase tracking-[0.3em] text-primary/60 mb-6 block">Our Heritage</span>
          <h1 className="font-display-hero text-display-hero-mobile md:text-display-hero text-primary leading-[1.1] mb-8">
            Craft as a quiet act of devotion.
          </h1>
          <p className="text-subheading text-on-surface-variant leading-relaxed">
            Established in 2024, JR Interiors has pursued a single belief: that the spaces we live and work in should be functional, beautiful, and made with intention. Based in Jaipur, we specialize in custom furniture design, architectural facades, bespoke metalwork, and turnkey luxury interior transformations.
          </p>
        </div>
      </section>

      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-stack-lg">
        <div className="relative h-[480px] rounded-xl overflow-hidden reveal">
          <Image src={G(HERO)} alt="A calm, light-filled interior" fill sizes="100vw" className="object-cover" />
        </div>
      </section>

      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-stack-lg grid grid-cols-1 md:grid-cols-3 gap-stack-md">
        {[
          { icon: "forest", title: "Responsibly Sourced", body: "FSC-certified hardwoods and natural fibres, chosen for longevity over fashion." },
          { icon: "handyman", title: "Made by Hand", body: "Traditional joinery and hand-finishing by makers who sign their work." },
          { icon: "favorite", title: "Built to Outlive Trends", body: "Timeless silhouettes and a 10-year structural guarantee on every piece." },
        ].map((v, i) => (
          <div key={v.title} className={`reveal ${i ? `delay-${i}00` : ""}`}>
            <Icon name={v.icon} className="text-primary text-3xl mb-4" />
            <h3 className="text-subheading text-primary mb-2">{v.title}</h3>
            <p className="text-body-md text-on-surface-variant leading-relaxed">{v.body}</p>
          </div>
        ))}
      </section>

      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-stack-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center reveal">
          <div className="relative h-[420px] rounded-xl overflow-hidden">
            <Image src={G(WORKSHOP)} alt="Inside the atelier" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
          </div>
          <div>
            <h2 className="text-headline-section-mobile md:text-headline-section text-primary mb-6">The Atelier</h2>
            <p className="text-body-md text-on-surface-variant leading-relaxed mb-6">
              Every commission begins as a conversation and ends as a custom solution for your space. Located in Jaipur, our design studio and workshop sit under one roof, allowing us to seamlessly manage everything from custom residential decor and fine metal finishes to major architectural design installations.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 text-label-sm font-bold text-primary border-b border-primary/30 pb-1 hover:border-primary transition">
              Book a Consultation <Icon name="arrow_forward" className="text-[18px]" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
