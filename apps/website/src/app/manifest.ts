import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JR Interiors",
    short_name: "JR Interiors",
    description: "Luxury furniture & interior design. Where Vision Meets Transformation.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf9f8",
    theme_color: "#3D2314",
    orientation: "portrait-primary",
    categories: ["lifestyle", "shopping"],
    icons: [
      {
        src: "/favicons/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/favicons/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/favicons/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
  };
}
