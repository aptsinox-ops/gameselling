import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"], // এডমিন ও API সিকিউরিটির জন্য গুগলে হাইড থাকবে
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}