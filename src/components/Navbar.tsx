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
    <>
      {/* Top Header Navigation */}
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

          {/* Desktop Links (>= md) */}
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

          {/* Actions - Desktop and Mobile (Optimized) */}
          <div className="flex items-center gap-4 md:gap-8 text-primary">
            {/* Quick Contact Icons (Mobile Only) */}
            <a
              href="https://wa.me/919667864262"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Contact"
              className="flex md:hidden w-8 h-8 items-center justify-center text-[22px] hover:opacity-70 transition active:scale-95 text-secondary"
            >
              <Icon name="chat" className="text-[20px]" />
            </a>

            <Link
              href="/search"
              aria-label="Search"
              className="hidden md:flex w-8 h-8 items-center justify-center hover:opacity-70 transition active:scale-95"
            >
              <Icon name="search" className="text-[22px]" />
            </Link>

            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="w-8 h-8 flex items-center justify-center hover:opacity-70 transition active:scale-95"
            >
              <Icon name="favorite" fill={pathname === "/wishlist"} className="text-[22px]" />
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
              className="hidden md:flex w-8 h-8 items-center justify-center hover:opacity-70 transition active:scale-95"
            >
              <Icon name="person" className="text-[22px]" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Sticky Bottom Navigation (Mobile Only, < md) */}
      <nav
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-bright/90 backdrop-blur-md border-t border-outline-variant/30 px-4 py-2 shadow-premium-bottom-nav pb-[env(safe-area-inset-bottom,16px)] transition-all duration-300"
      >
        <div className="flex justify-around items-center h-12">
          {[
            { href: "/", label: "Home", icon: "home" },
            { href: "/collections", label: "Collections", icon: "view_cozy" },
            { href: "/furniture", label: "Furniture", icon: "chair" },
            { href: "/search", label: "Search", icon: "search" },
            { href: "/account", label: "Profile", icon: "person" },
            { href: "/cart", label: "Cart", icon: "shopping_bag", isCart: true },
          ].map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "relative flex flex-col items-center justify-center w-14 h-12 text-center transition-colors active:scale-95",
                  active ? "text-primary" : "text-on-surface-variant/70 hover:text-primary"
                )}
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    name={item.icon}
                    fill={active}
                    className={clsx("text-[20px] transition-transform duration-300", active && "scale-110")}
                  />
                  {item.isCart && count > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 bg-primary text-on-primary text-[9px] min-w-[14px] h-3.5 px-0.5 rounded-full flex items-center justify-center font-bold">
                      {count}
                    </span>
                  )}
                </div>
                <span className="text-[9px] mt-1 font-medium tracking-wide">
                  {item.label}
                </span>
                {active && (
                  <span className="absolute bottom-0 w-1 h-1 bg-primary rounded-full transition-all" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
