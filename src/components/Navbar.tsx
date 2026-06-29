"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { useCart } from "@/components/CartProvider";
import { clsx } from "@/lib/clsx";

const LINKS = [
  { href: "/furniture", label: "Furniture" },
  { href: "/services", label: "Interiors" },
  { href: "/collections", label: "Collections" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const { count } = useCart();
  const transparentStart = pathname === "/";
  const [scrolled, setScrolled] = useState(!transparentStart);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!transparentStart) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparentStart]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === "/furniture" ? pathname.startsWith("/furniture") : pathname === href;

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={clsx(
        "fixed top-0 w-full z-[100] transition-all duration-300",
        menuOpen
          ? "bg-surface text-primary border-b border-outline-variant/30"
          : scrolled
          ? "scrolled-nav shadow-sm"
          : "glass-nav"
      )}
    >
      {/* Main Top Header Bar */}
      <div className="relative z-50 flex justify-between items-center h-20 md:h-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <Link
          href="/"
          className="text-subheading font-bold text-primary tracking-tight"
        >
          JR INTERIORS
        </Link>

        <ul id="main-menu" role="menubar" className="hidden md:flex items-center gap-10">
          {LINKS.map((l) => (
            <li key={l.href} role="none">
              <Link
                href={l.href}
                role="menuitem"
                className={clsx(
                  "text-label-xs uppercase tracking-widest transition-colors",
                  isActive(l.href)
                    ? "text-primary font-bold border-b border-primary/40 pb-1"
                    : "text-on-surface-variant hover:text-primary link-underline"
                )}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-6 md:gap-8 text-primary">
          <Link
            href="/search"
            aria-label="Search"
            className="w-8 h-8 flex items-center justify-center hover:opacity-70 transition active:scale-95"
          >
            <Icon name="search" className="text-[22px]" />
          </Link>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="hidden sm:flex w-8 h-8 items-center justify-center hover:opacity-70 transition active:scale-95"
          >
            <Icon name="favorite" className="text-[22px]" />
          </Link>
          <Link
            href="/cart"
            aria-label={`Selections, ${count} items`}
            className="relative flex items-center gap-1.5 hover:opacity-70 transition active:scale-95 text-primary"
          >
            <Icon name="shopping_bag" className="text-[20px]" />
            <span className="hidden md:inline text-label-xs uppercase tracking-widest font-medium">Selections</span>
            {count > 0 && (
              <span
                key={count}
                className="bg-primary/10 text-primary text-[10px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-bold animate-[scale-in_var(--dur-fast)_var(--ease-out-soft)]"
              >
                {count}
              </span>
            )}
          </Link>
          <Link
            href="/account"
            aria-label="Account"
            className="hidden sm:flex w-8 h-8 items-center justify-center hover:opacity-70 transition active:scale-95"
          >
            <Icon name="person" className="text-[22px]" />
          </Link>
          <button
            className="md:hidden w-8 h-8 flex items-center justify-center hover:opacity-70 transition"
            aria-label="Menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Icon name={menuOpen ? "close" : "menu"} className="text-[22px]" />
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Drawer Navigation Menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          role="navigation"
          aria-label="Mobile navigation"
          className="md:hidden absolute top-20 left-0 right-0 z-40 bg-surface border-b border-outline-variant/30 px-margin-mobile py-8 shadow-xl flex flex-col gap-6 overflow-y-auto max-h-[calc(80vh)] animate-slide-down scroll-hide"
        >
          {/* Search Box in Menu */}
          <div className="relative">
            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant" />
            <input
              type="search"
              placeholder="Search the collection..."
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-full pl-12 pr-4 py-3 text-body-md text-on-surface outline-none focus:border-primary transition"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const q = e.currentTarget.value.trim();
                  if (q) {
                    setMenuOpen(false);
                    window.location.href = `/search?q=${encodeURIComponent(q)}`;
                  }
                }
              }}
            />
          </div>

          {/* Menu Links */}
          <div className="flex flex-col gap-4">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className={clsx(
                  "text-body-lg uppercase tracking-[0.15em] font-medium transition-colors py-1.5 block",
                  isActive(l.href) ? "text-primary font-bold" : "text-on-surface-variant hover:text-primary"
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/wishlist"
              onClick={() => setMenuOpen(false)}
              className="text-body-lg uppercase tracking-[0.15em] font-medium text-on-surface-variant hover:text-primary py-1.5 block"
            >
              Wishlist
            </Link>
            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="text-body-lg uppercase tracking-[0.15em] font-medium text-on-surface-variant hover:text-primary py-1.5 block"
            >
              Account
            </Link>
          </div>

          {/* Consultation CTA button */}
          <div className="pt-2">
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="w-full h-12 flex items-center justify-center bg-primary text-on-primary rounded-full font-bold text-label-xs uppercase tracking-widest hover:bg-primary/90 transition shadow-md active:scale-[0.98]"
            >
              Book Consultation
            </Link>
          </div>

          {/* Contact details at bottom */}
          <div className="border-t border-outline-variant/30 pt-6 mt-2 space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-outline">Jaipur Atelier</p>
            <p className="text-body-md text-primary font-medium">Ph: +91 94603 00750</p>
            <p className="text-body-md text-primary font-medium">Email: adityajangid1409@gmail.com</p>
          </div>
        </div>
      )}
    </nav>
  );
}
