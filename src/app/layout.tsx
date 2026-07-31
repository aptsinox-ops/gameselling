import "./globals.css";
import { Noto_Sans_Bengali } from "next/font/google";
import Providers from "@/components/Providers"; 
import { Toaster } from "sonner"; 
import { db } from "@/lib/db";
import type { Metadata } from "next";

// 🇧🇩 বাংলা নোটিশের জন্য ফন্ট
const notoBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-bengali",
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await db.siteSettings.findFirst();

    // 🎯 ডাটাবেজ থেকে ভ্যালুগুলো নেওয়া হচ্ছে (না থাকলে ফলব্যাক ডিফল্ট ভ্যালু)
    const title = settings?.siteTitle || settings?.siteName || "DEMO Bazar";
    const description = settings?.siteDescription || "Premium Gaming Top-Up Platform";
    const favicon = settings?.faviconUrl || "/favicon.ico";
    const keywords = settings?.metaKeywords 
      ? settings.metaKeywords.split(",").map((k) => k.trim()).filter(Boolean)
      : [];

    return {
      title: title,
      description: description,
      keywords: keywords.length > 0 ? keywords : undefined,
      icons: {
        icon: favicon,
        shortcut: favicon,
        apple: favicon,
      },
      openGraph: {
        title: title,
        description: description,
        images: settings?.logoUrl ? [{ url: settings.logoUrl }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: title,
        description: description,
        images: settings?.logoUrl ? [settings.logoUrl] : undefined,
      },
    };
  } catch (error) {
    console.error("Error loading metadata settings:", error);
    return {
      title: "DEMO Bazar",
      description: "Premium Gaming Top-Up Platform",
    };
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={notoBengali.variable}>
      <body className="bg-white text-black antialiased min-h-screen">
        <Providers>
          {children}
        </Providers>

        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}