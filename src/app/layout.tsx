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
  const siteUrl = "https://avixtopup.com"; // সঠিক ডোমেইন

  try {
    const settings = await db.siteSettings.findFirst();

    const title = settings?.siteTitle || "Avix Topup - Free Fire Diamond Top Up bKash BD";
    const description = settings?.siteDescription || "100% Trusted Gaming Top Up platform in Bangladesh. Buy Free Fire Diamond, PUBG UC at lowest prices.";
    const favicon = settings?.faviconUrl || "/favicon.ico";
    const keywords = settings?.metaKeywords 
      ? settings.metaKeywords.split(",").map((k) => k.trim()).filter(Boolean)
      : [];

    return {
      metadataBase: new URL(siteUrl),
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
        url: siteUrl,
        siteName: settings?.siteName || "Avix Topup",
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
      metadataBase: new URL(siteUrl),
      title: "Avix Topup - Free Fire Diamond Top Up bKash BD",
      description: "100% Trusted Gaming Top Up platform in Bangladesh.",
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