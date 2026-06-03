import Link from "next/link";
import { Icon } from "@/components/Icon";

export function Footer() {
  return (
    <footer className="bg-primary pt-24 pb-12 text-on-primary">
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
        <div>
          <h3 className="text-2xl font-bold mb-8">JR Interiors</h3>
          <p className="text-on-primary/60 mb-8 leading-relaxed max-w-xs">
            Elevating modern living through curated luxury and artisanal
            craftsmanship since 2012.
          </p>
          <div className="flex gap-6">
            <a href="#" aria-label="Website" className="text-on-primary/40 hover:text-on-primary transition-colors">
              <Icon name="public" />
            </a>
            <a href="#" aria-label="Share" className="text-on-primary/40 hover:text-on-primary transition-colors">
              <Icon name="share" />
            </a>
          </div>
        </div>

        <div>
          <h5 className="text-label-xs uppercase tracking-widest text-on-primary/40 mb-8">
            Navigation
          </h5>
          <ul className="space-y-4">
            <li><Link className="text-on-primary/70 hover:text-on-primary transition-colors" href="/furniture">Our Collection</Link></li>
            <li><Link className="text-on-primary/70 hover:text-on-primary transition-colors" href="/collections">Collections</Link></li>
            <li><Link className="text-on-primary/70 hover:text-on-primary transition-colors" href="/services">Design Services</Link></li>
            <li><Link className="text-on-primary/70 hover:text-on-primary transition-colors" href="/about">About Us</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-label-xs uppercase tracking-widest text-on-primary/40 mb-8">
            Concierge
          </h5>
          <ul className="space-y-4">
            <li><Link className="text-on-primary/70 hover:text-on-primary transition-colors" href="/services">White Glove Delivery</Link></li>
            <li><Link className="text-on-primary/70 hover:text-on-primary transition-colors" href="/contact">Book a Consultation</Link></li>
            <li><Link className="text-on-primary/70 hover:text-on-primary transition-colors" href="/about">Sustainability</Link></li>
            <li><Link className="text-on-primary/70 hover:text-on-primary transition-colors" href="/contact">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-label-xs uppercase tracking-widest text-on-primary/40 mb-8">
            Newsletter
          </h5>
          <p className="text-on-primary/60 text-sm mb-6">
            Join our circle for exclusive seasonal releases and interior
            inspiration.
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
