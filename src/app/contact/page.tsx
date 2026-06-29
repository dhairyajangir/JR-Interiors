import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { ConsultationForm } from "@/components/ConsultationForm";

export const metadata: Metadata = { title: "Contact & Consultation | JR INTERIORS" };

export default function ContactPage() {
  return (
    <main className="min-h-screen flex items-center pt-28 pb-12">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-2 gap-stack-lg items-center w-full">
        <div className="reveal">
          <span className="text-label-xs uppercase tracking-[0.3em] text-primary/60 mb-6 block">Get in touch</span>
          <h1 className="font-display-hero text-display-hero-mobile md:text-headline-section text-primary leading-[1.1] mb-6">
            Let&rsquo;s design your sanctuary.
          </h1>
          <p className="text-body-lg text-on-surface-variant leading-relaxed mb-10">
            Whether you&rsquo;re furnishing a single corner or reimagining an entire home, our designers would love to help. Book a complimentary consultation or reach us directly.
          </p>
          <div className="space-y-5">
            <ContactRow icon="mail" label="Email" value="studio@jrinteriors.in" href="mailto:studio@jrinteriors.in" />
            <ContactRow icon="call" label="Phone" value="+91 96678 64262" href="tel:+919667864262" />
            <ContactRow icon="chat" label="WhatsApp Chat" value="+91 96678 64262 (Click to Chat)" href="https://wa.me/919667864262" />
            <ContactRow icon="location_on" label="Jaipur Atelier" value="Pno. 251 Nirmal Vihar, Dadi Ka Phatak, Jhotwara, Jaipur 302012" href="https://maps.google.com/?q=Pno.+251+Nirmal+Vihar,+Dadi+Ka+Phatak,+Jhotwara,+Jaipur+302012" />
            <ContactRow icon="instagram" label="Instagram" value="@jr_interiors_2024" href="https://instagram.com/jr_interiors_2024" />
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

function ContactRow({ 
  icon, 
  label, 
  value, 
  href,
  isImage 
}: { 
  icon: string; 
  label: string; 
  value: string; 
  href?: string;
  isImage?: boolean 
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0">
        {isImage ? (
          <img src={icon} alt={label} className="w-5 h-5 object-contain" />
        ) : (
          <Icon name={icon} className="text-[20px]" />
        )}
      </span>
      <div>
        <p className="text-label-xs uppercase tracking-widest text-on-surface-variant">{label}</p>
        {href ? (
          <a 
            href={href} 
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="text-body-md text-primary font-bold hover:underline hover:text-primary/80 transition-colors"
          >
            {value}
          </a>
        ) : (
          <p className="text-body-md text-primary font-bold">{value}</p>
        )}
      </div>
    </div>
  );
}
