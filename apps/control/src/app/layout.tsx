import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { QueryProvider } from "../providers/query-provider";
import { AuthProvider } from "../features/auth/providers/auth-provider";
import { getCurrentUser } from "../features/auth/utils";
import { Toaster } from "sonner";
import "./globals.css";

// Import to validate env variables immediately on startup
import "../lib/env";



const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JR Control — Atelier Business Operating System",
  description: "Central administration console for JR Interiors.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch initial user state server-side
  const user = await getCurrentUser();

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased min-h-screen bg-base">
        <QueryProvider>
          <AuthProvider initialUser={user}>
            {children}
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
