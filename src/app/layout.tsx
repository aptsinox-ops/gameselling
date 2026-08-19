import "./globals.css";
import { Noto_Sans_Bengali, Urbanist } from "next/font/google";
import Providers from "@/components/Providers"; 
import { Toaster } from "sonner"; 
import { db } from "@/lib/db";
import type { Metadata } from "next";

// বাংলা ফন্ট কনফিগারেশন
const notoBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-bengali",
});

// Urbanist ফন্ট কনফিগারেশন
const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-urbanist",
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await db.siteSettings.findFirst();

    const title = settings?.siteTitle || settings?.siteName || "Zebo Topup";
    const description = settings?.siteDescription || "Premium Gaming Top-Up Platform";
    const favicon = settings?.faviconUrl || "/favicon.ico";
    const keywords = settings?.metaKeywords 
      ? settings.metaKeywords.split(",").map((k) => k.trim()).filter(Boolean)
      : [];

    return {
      metadataBase: new URL("https://zebotopup.store"),
      title: title,
      description: description,
      keywords: keywords.length > 0 ? keywords : undefined,
      
      verification: {
        google: "L3H4jnfIz3abChAr1u3-cu7jvZ77kCzLnaboR6wI148",
      },

      icons: {
        icon: favicon,
        shortcut: favicon,
        apple: favicon,
      },
      openGraph: {
        title: title,
        description: description,
        url: "https://zebotopup.store",
        siteName: title,
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
      metadataBase: new URL("https://zebotopup.store"),
      title: "Zebo Topup",
      description: "Premium Gaming Top-Up Platform",
      verification: {
        google: "L3H4jnfIz3abChAr1u3-cu7jvZ77kCzLnaboR6wI148",
      },
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🟢 সার্ভার রেন্ডারিংয়ের সময় সাইট কালার তুলে আনা
  let primaryColor = "#2563eb";
  let backgroundColor = "#ffffff";

  try {
    const settings = await db.siteSettings.findFirst();
    if (settings?.primaryColor) primaryColor = settings.primaryColor;
    if (settings?.backgroundColor) backgroundColor = settings.backgroundColor;
  } catch (err) {
    console.error("Error fetching root layout settings:", err);
  }

  return (
    <html 
      lang="en" 
      className={`${notoBengali.variable} ${urbanist.variable}`}
      style={{
        "--primary-color": primaryColor,
        "--bg-color": backgroundColor,
      } as React.CSSProperties}
    >
      <head>
        {/* ⚡ ফার্স্ট রেন্ডারেই CSS Variable ইঞ্জেকশন (Zero Color Flash / Instant Load) */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --primary-color: ${primaryColor};
                --bg-color: ${backgroundColor};
              }
            `,
          }}
        />
      </head>
      <body 
        className="text-black antialiased min-h-screen font-sans" 
        style={{ 
          fontFamily: 'var(--font-urbanist), sans-serif',
          backgroundColor: backgroundColor,
        }}
      >
        <Providers>
          {children}
        </Providers>

        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}