import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JR Interiors",
    short_name: "JR Interiors",
    description: "Calm luxury furniture & interior design for the modern Indian home.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf9f8",
    theme_color: "#513726",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
