"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { clsx } from "@/lib/clsx";

export function FloatingConsultationButton() {
  const [visible, setVisible] = useState(true);
  const prevScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Always show when near the top
      if (currentScrollY < 120) {
        setVisible(true);
      } else if (currentScrollY > prevScrollY.current + 10) {
        // Scrolling down - hide
        setVisible(false);
      } else if (currentScrollY < prevScrollY.current - 10) {
        // Scrolling up - show
        setVisible(true);
      }
      
      prevScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Link
      href="/contact"
      className={clsx(
        "fixed z-40 bg-primary text-on-primary px-5 py-3.5 rounded-full flex items-center gap-2 shadow-xl hover:bg-primary/95 transition-all active:scale-95 duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        // Positioned above the mobile bottom navigation bar on small screens
        "bottom-20 right-4 md:bottom-8 md:right-8",
        // Hide/show translations
        visible 
          ? "translate-y-0 opacity-100 scale-100" 
          : "translate-y-12 opacity-0 scale-90 pointer-events-none"
      )}
      style={{
        boxShadow: "0 10px 30px -10px rgba(81, 55, 38, 0.4)",
      }}
    >
      <Icon name="event" className="text-[18px]" />
      <span className="text-label-xs uppercase tracking-widest font-semibold">
        Book Consultation
      </span>
    </Link>
  );
}
