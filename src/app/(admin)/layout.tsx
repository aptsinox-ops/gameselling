import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ActiveThemeProvider } from "@/components/active-theme";
import { cookies } from "next/headers";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import { Metadata } from "next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const META_THEME_COLORS = {
  light: "ffffff",
  dark: "09090b",
};

// 🟢 ডায়নামিক টাইটেল (ADMINISTOR | sitename) তৈরি করার জন্য generateMetadata
export async function generateMetadata(): Promise<Metadata> {
  let siteName = "AvixTopup"; // ডিফল্ট নাম

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/settings`, { cache: "no-store" });
    
    if (res.ok) {
      const siteSettings = await res.json();
      const data = siteSettings?.data || siteSettings;
      siteName = data?.siteName || data?.site_title || siteName;
    }
  } catch (error) {
    console.error("Failed to fetch site settings for metadata:", error);
  }

  return {
    title: `ADMINISTOR | ${siteName}`,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get("active_theme")?.value;
  const isScaled = activeThemeValue?.endsWith("-scaled");

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background overscroll-none font-sans antialiased",
          inter.variable,
          inter.className,
          activeThemeValue ? `theme-${activeThemeValue}` : "",
          isScaled ? "theme-scaled" : ""
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          enableColorScheme
        >
          <TooltipProvider delayDuration={0}>
            <div className="relative flex min-h-screen flex-col bg-white dark:bg-[#121212] antialiased">
              <div className="flex flex-1">
                <main className="flex-1">
                  <ActiveThemeProvider initialTheme={activeThemeValue}>
                    {children}
                  </ActiveThemeProvider>
                </main>
              </div>
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}