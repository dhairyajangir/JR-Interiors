import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";
import { RevealObserver } from "@/components/RevealObserver";
import { ScrollProgress } from "@/components/ScrollProgress";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getCartCount } from "@/lib/cart";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "JR Interiors | Calm Luxury Furniture & Interior Design in India",
    template: "%s | JR Interiors",
  },
  description:
    "Artisanal furniture and interior design for the modern Indian home. Handcrafted pieces in warm, natural materials — delivered across India with white-glove service.",
  keywords: [
    "luxury furniture India",
    "designer furniture",
    "interior design",
    "handcrafted furniture",
    "premium home decor",
    "JR Interiors",
  ],
  applicationName: "JR Interiors",
  authors: [{ name: "JR Interiors" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "JR Interiors",
    title: "JR Interiors | Calm Luxury Furniture & Interior Design",
    description:
      "Artisanal furniture and interior design for the modern Indian home.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "JR Interiors | Calm Luxury Furniture",
    description:
      "Artisanal furniture and interior design for the modern Indian home.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fbf9f8",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cartCount = await getCartCount();

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface font-sans text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
        <CartProvider initialCount={cartCount}>
          <ScrollProgress />
          <Navbar />
          {children}
          <Footer />
        </CartProvider>
        <RevealObserver />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
