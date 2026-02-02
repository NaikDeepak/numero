import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Numero - Next Gen Numerology",
    short_name: "Numero",
    description:
      "AI-driven numerological insights in a visually stunning, friction-free experience.",
    start_url: "/",
    display: "standalone",
    background_color: "#111827",
    theme_color: "#f59e0b",
    icons: [
      {
        src: "/opengraph-image", // Reusing the OG image generation for now as a high-res icon
        sizes: "any",
        type: "image/png",
      },
    ],
  }
}
