import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { ConsultationForm } from "@/components/ConsultationForm";

export const metadata: Metadata = { title: "Contact & Consultation | JR INTERIORS" };

export default function ContactPage() {
  return (
    <main className="pt-32 pb-stack-lg min-h-screen">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-2 gap-stack-lg items-start">
        <div className="reveal">
          <span className="text-label-xs uppercase tracking-[0.3em] text-primary/60 mb-6 block">Get in touch</span>
          <h1 className="font-display-hero text-display-hero-mobile md:text-headline-section text-primary leading-[1.1] mb-6">
            Let&rsquo;s design your sanctuary.
          </h1>
          <p className="text-body-lg text-on-surface-variant leading-relaxed mb-10">
            Whether you&rsquo;re furnishing a single corner or reimagining an entire home, our designers would love to help. Book a complimentary consultation or reach us directly.
          </p>
          <div className="space-y-5">
            <ContactRow icon="mail" label="Email" value="studio@jrinteriors.in" />
            <ContactRow icon="call" label="Phone" value="+91 98765 43210" />
            <ContactRow icon="location_on" label="Atelier" value="12 Linking Road, Bandra West, Mumbai 400050" />
            <ContactRow icon="schedule" label="Hours" value="Mon–Sat · 10am – 7pm IST" />
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl editorial-shadow p-6 md:p-8 reveal delay-100">
          <h2 className="text-subheading text-primary mb-6">Book a Consultation</h2>
          <ConsultationForm />
        </div>
      </div>
    </main>
  );
}

function ContactRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0">
        <Icon name={icon} className="text-[20px]" />
      </span>
      <div>
        <p className="text-label-xs uppercase tracking-widest text-on-surface-variant">{label}</p>
        <p className="text-body-md text-primary">{value}</p>
      </div>
    </div>
  );
}
