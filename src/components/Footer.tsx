import Link from "next/link";
import { Icon } from "@/components/Icon";

export function Footer() {
  return (
    <footer className="bg-primary pt-24 pb-12 text-on-primary">
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
        <div>
          <h3 className="text-2xl font-bold mb-8">JR Interiors</h3>
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
            <li><Link className="text-on-primary/70 hover:text-on-primary transition-colors" href="/collections">Collections</Link></li>
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
            <li><Link className="text-on-primary/70 hover:text-on-primary transition-colors" href="/contact">Let's Create Your Space</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-label-xs uppercase tracking-widest text-on-primary/40 mb-8">
            Newsletter
          </h5>
          <p className="text-on-primary/60 text-sm mb-6">
            Subscribe to the Atelier circle for seasonal collection releases and spatial design inspiration.
          </p>
          <form className="flex border-b border-on-primary/20 pb-2">
            <input
              className="bg-transparent border-none focus:ring-0 w-full placeholder:text-on-primary/30 text-on-primary p-0 text-sm"
              placeholder="Email Address"
              type="email"
              aria-label="Email address"
            />
            <button aria-label="Subscribe" className="text-on-primary/40 hover:text-on-primary transition-colors" type="submit">
              <Icon name="arrow_forward" />
            </button>
          </form>
        </div>
      </div>

      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto pt-8 border-t border-on-primary/10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-on-primary/30 uppercase tracking-widest">
        <p>© 2024 JR Interiors. Crafted for a Life in Balance.</p>
        <div className="flex gap-10">
          <a className="hover:text-on-primary transition-colors" href="#">Privacy</a>
          <a className="hover:text-on-primary transition-colors" href="#">Terms</a>
          <a className="hover:text-on-primary transition-colors" href="#">Accessibility</a>
        </div>
      </div>
    </footer>
  );
}
