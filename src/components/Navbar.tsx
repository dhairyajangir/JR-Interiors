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

  const isActive = (href: string) =>
    href === "/furniture" ? pathname.startsWith("/furniture") : pathname === href;

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={clsx(
        "fixed top-0 w-full z-50 transition-all duration-500",
        scrolled ? "scrolled-nav shadow-sm" : "glass-nav"
      )}
    >
      <div className="flex justify-between items-center h-20 md:h-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
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
            aria-label={`Cart, ${count} items`}
            className="relative w-8 h-8 flex items-center justify-center hover:opacity-70 transition active:scale-95"
          >
            <Icon name="shopping_bag" className="text-[22px]" />
            {count > 0 && (
              <span
                key={count}
                className="absolute -top-1 -right-1 bg-primary text-on-primary text-[10px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-bold animate-[scale-in_var(--dur-fast)_var(--ease-out-soft)]"
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

      {/* Mobile menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          role="navigation"
          aria-label="Mobile navigation"
          className="md:hidden bg-surface-container-lowest border-t border-outline-variant px-margin-mobile py-6 space-y-4 shadow-md"
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={clsx(
                "block text-label-sm uppercase tracking-widest",
                isActive(l.href) ? "text-primary font-bold" : "text-on-surface-variant"
              )}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/wishlist"
            onClick={() => setMenuOpen(false)}
            className="block text-label-sm uppercase tracking-widest text-on-surface-variant"
          >
            Wishlist
          </Link>
          <Link
            href="/account"
            onClick={() => setMenuOpen(false)}
            className="block text-label-sm uppercase tracking-widest text-on-surface-variant"
          >
            Account
          </Link>
        </div>
      )}
    </nav>
  );
}
