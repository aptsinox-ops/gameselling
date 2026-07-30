import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ActiveThemeProvider } from "@/components/active-theme";
import { cookies } from "next/headers";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google"; // 👈 ১. Google Font ইম্পোর্ট করা হলো

// 👈 ২. Inter ফন্ট কনফিগারেশন
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const META_THEME_COLORS = {
  light: "ffffff",
  dark: "09090b",
};

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
          inter.variable,  // 👈 ৩. CSS Variable যুক্ত করা হলো
          inter.className, // 👈 ৪. ফন্ট ক্লাস বডিতে অ্যাপ্লাই করা হলো
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