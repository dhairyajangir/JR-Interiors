import type { Metadata, Viewport } from "next";
import { DM_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";
import { RevealObserver } from "@/components/RevealObserver";
import { ScrollProgress } from "@/components/ScrollProgress";

import { ClientOnlyComponents } from "@/components/ClientOnlyComponents";
import { getCartCount } from "@/lib/cart";
import SkipToContent from "@/components/SkipToContent";
import { ContactWidget } from "@/components/ContactWidget";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const siteUrl = "https://jrinteriors.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "JR Interiors | Luxury Furniture India — Spaces Designed for Calm Living",
    template: "%s | JR Interiors",
  },
  description:
    "Discover premium luxury furniture India handcrafted for calm, elegant living. Artisanal pieces, white-glove delivery, custom design consultations. Shop now.",
  keywords: [
    "luxury furniture India",
    "premium furniture Jaipur",
    "artisanal home decor",
    "custom furniture design",
    "interior design services",
    "calm living spaces",
    "handcrafted furniture",
  ],
  applicationName: "JR Interiors",
  authors: [{ name: "JR Interiors" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "JR Interiors",
    title: "JR Interiors | Luxury Furniture India — Spaces Designed for Calm Living",
    description:
      "Discover premium handcrafted luxury furniture India. Artisanal pieces, white-glove delivery, free design consultations.",
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/logos/og-social.png`,
        width: 1080,
        height: 1080,
        alt: "JR Interiors | Luxury Furniture India — Where Vision Meets Transformation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JR Interiors | Luxury Furniture India",
    description:
      "Premium handcrafted furniture for calm, elegant living. Free design consultations.",
    images: [`${siteUrl}/logos/og-social.png`],
    creator: "@jr_interiors_2024",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/logos/icon.svg" },
      { rel: "msapplication-TileImage", url: "/favicons/mstile-150x150.png" },
    ],
  },
  manifest: "/manifest.webmanifest",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1C1C1E",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cartCount = await getCartCount();

  return (
    <html lang="en" className={`${dmSans.variable} ${cormorant.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface font-sans text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
        <SkipToContent />
        <CartProvider initialCount={cartCount}>
          <ScrollProgress />
          <Navbar />
          <div id="main-content" className="outline-none" tabIndex={-1}>
            {children}
          </div>
          <Footer />
        </CartProvider>
        <RevealObserver />
        <ClientOnlyComponents />
        <ContactWidget />
      </body>
    </html>
  );
}
