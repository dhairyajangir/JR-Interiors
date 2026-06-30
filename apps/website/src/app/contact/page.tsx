import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { ConsultationForm } from "@/components/ConsultationForm";

export const metadata: Metadata = { title: "Contact & Consultation | JR INTERIORS" };

export default function ContactPage() {
  return (
    <main className="pt-32 pb-16 bg-surface">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack-lg items-start w-full mb-16">
          <div className="reveal">
            <span className="text-label-xs uppercase tracking-[0.3em] text-primary/60 mb-6 block">Get in touch</span>
            <h1 className="font-display-hero text-display-hero-mobile md:text-headline-section text-primary leading-[1.1] mb-6">
              Let&rsquo;s design your sanctuary.
            </h1>
            <p className="text-body-lg text-on-surface-variant leading-relaxed mb-10">
              Whether you&rsquo;re furnishing a single corner or reimagining an entire home, our designers would love to help. Book a complimentary consultation or reach us directly.
            </p>
            <div className="space-y-5">
              <ContactRow icon="mail" label="Email" value="concierge@jrinteriors.in" href="mailto:concierge@jrinteriors.in" />
              <ContactRow icon="call" label="Phone" value="+91 94603 00750" href="tel:+919460300750" />
              <ContactRow icon="chat" label="WhatsApp Chat" value="+91 94603 00750 (Click to Chat)" href="https://wa.me/919460300750" />
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

        {/* Embedded Google Map */}
        <div className="reveal delay-200 border-t border-outline-variant/20 pt-16">
          <h2 className="text-headline-section-mobile md:text-headline-section font-serif text-primary mb-6">Visit our Jaipur Atelier</h2>
          <p className="text-body-lg text-on-surface-variant mb-8 max-w-2xl">
            We welcome visitors to our Jhotwara workshop by appointment. Browse raw timber selections, view master woodworkers at their benches, and feel our textile finishes in person.
          </p>
          <div className="w-full h-[450px] rounded-2xl overflow-hidden border border-outline-variant/30 shadow-xl bg-surface-container-low">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3556.7865910398485!2d75.74836691157156!3d26.94200787653556!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db37996c56b7f%3A0xea5f4f16ef009943!2sJhotwara%2C%20Jaipur%2C%20Rajasthan%20302012!5e0!3m2!1sen!2sin!4v1719748000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="JR Interiors Jaipur Showroom Map"
            />
          </div>
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
