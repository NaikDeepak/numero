import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/profile", "/reports/premium"],
    },
    sitemap: "https://numero-nextgen.vercel.app/sitemap.xml",
  }
}
