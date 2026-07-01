import Link from "next/link";
import { Icon } from "@/components/Icon";
import { NewsletterForm } from "@/components/NewsletterForm";
import { Logo, LogoLight } from "@/components/Logo";


export function Footer() {
  return (
    <footer className="bg-primary pt-24 pb-12 text-on-primary">
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
        <div>
          {/* Footer body: Secondary Horizontal logo — inverted white on dark background */}
          <div className="mb-6">
            <Link href="/" aria-label="JR Interiors — Home">
              <LogoLight
                variant="secondary"
                className="w-[180px] sm:w-[220px] md:w-[280px] lg:w-[340px] xl:w-[380px] h-auto logo-hover"
              />
            </Link>
          </div>
          <p className="text-on-primary/60 mb-6 leading-relaxed max-w-xs text-sm">
            Crafting modern sanctuaries and artisanal furniture designed to become part of your story.
          </p>
          <div className="flex gap-6 mb-6">
            <a href="https://instagram.com/jr_interiors_2024" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-on-primary/40 hover:text-on-primary transition-colors flex items-center gap-2 text-sm">
              <Icon name="instagram" className="w-5 h-5" /> <span className="uppercase tracking-widest text-[10px]">@jr_interiors_2024</span>
            </a>
          </div>
          <div className="text-on-primary/50 text-xs leading-relaxed max-w-xs border-t border-on-primary/10 pt-4">
            <p className="font-bold uppercase tracking-wider mb-1">Jaipur Atelier</p>
            <p>Pno. 251 Nirmal Vihar, Dadi Ka Phatak,</p>
            <p>Jhotwara, Jaipur, Rajasthan 302012</p>
            <p className="mt-2">Ph: +91 94603 00750</p>
          </div>
        </div>

        <div>
          <h5 className="text-label-xs uppercase tracking-widest text-on-primary/40 mb-8">
            Navigation
          </h5>
          <ul className="space-y-4">
            <li><Link className="text-on-primary/70 hover:text-on-primary transition-colors" href="/furniture">Curated Collections</Link></li>
            <li><Link className="text-on-primary/70 hover:text-on-primary transition-colors" href="/services">Design Experiences</Link></li>
            <li><Link className="text-on-primary/70 hover:text-on-primary transition-colors" href="/about">About Us</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-label-xs uppercase tracking-widest text-on-primary/40 mb-8">
            Concierge
          </h5>
          <ul className="space-y-4">
            <li><Link className="text-on-primary/70 hover:text-on-primary transition-colors" href="/services">White Glove Delivery</Link></li>
            <li><Link className="text-on-primary/70 hover:text-on-primary transition-colors" href="/contact">Schedule a Design Call</Link></li>
            <li><Link className="text-on-primary/70 hover:text-on-primary transition-colors" href="/about">Sustainability</Link></li>
            <li><Link className="text-on-primary/70 hover:text-on-primary transition-colors" href="/contact">Let&apos;s Create Your Space</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-label-xs uppercase tracking-widest text-on-primary/40 mb-8">
            Newsletter
          </h5>
          <p className="text-on-primary/60 text-sm mb-6">
            Subscribe to the Atelier circle for seasonal collection releases and spatial design inspiration.
          </p>
          <NewsletterForm />
        </div>
      </div>

      {/* Footer bottom bar — clean text baseline alignment */}
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto pt-8 border-t border-on-primary/10 flex flex-col md:flex-row justify-between items-baseline gap-6 text-on-primary/40 text-[11px] uppercase tracking-[0.18em]">
        <div className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-8">
          <span className="font-serif font-medium text-sm text-on-primary/80 tracking-[0.15em] uppercase">JR Interiors</span>
          <span>©2024 Crafted for a Life in Balance</span>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link className="hover:text-on-primary transition-colors" href="/legal/privacy">Privacy</Link>
          <Link className="hover:text-on-primary transition-colors" href="/legal/terms">Terms</Link>
          <Link className="hover:text-on-primary transition-colors" href="/legal/accessibility">Accessibility</Link>
          <Link className="hover:text-on-primary transition-colors" href="/legal/cookies">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}
