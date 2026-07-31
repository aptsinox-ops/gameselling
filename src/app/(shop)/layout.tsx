import Header from "@/components/header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/bottomNavi"; 
import { prisma } from "@/lib/prisma"; 
import { Noto_Sans_Bengali } from "next/font/google";

// বাংলা ফন্টের জন্য Variable তৈরি করা হয়েছে
const notoBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-bengali",
});

export const revalidate = 0; 

async function getSiteSettings() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "STATIC" },
    });
    return settings;
  } catch (error) {
    console.error("Failed to fetch settings in layout:", error);
    return null;
  }
}

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  let adminCount = 0;
  try {
    adminCount = await prisma.admin.count();
  } catch (error) {
    console.error("Failed to fetch admin configuration status:", error);
  }

  if (adminCount === 0) {
    return (
      <div className={`fixed inset-0 bg-[#0c0c0e] flex items-center justify-center p-4 z-[9999] ${notoBengali.variable}`}>
        <div className="max-w-md w-full text-center border border-zinc-800/80 bg-[#16161a] p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-80" />
          <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800/60 flex items-center justify-center mx-auto mb-5 text-rose-500 shadow-inner">
            <svg className="w-7 h-7 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-slate-200 mb-2">System Unconfigured</h2>
          <p className="text-sm text-zinc-400 leading-relaxed font-medium">
            This site is unconfigured.
          </p>
        </div>
      </div>
    );
  }

  const primaryColor = settings?.primaryColor || "#ff0055"; 
  const backgroundColor = settings?.backgroundColor || "#ffffff"; 

  const isTelegram = settings?.activeFloatingButton === "TELEGRAM";
  const isWhatsapp = settings?.activeFloatingButton === "WHATSAPP";

  const getFloatingLink = () => {
    if (isTelegram) return `https://t.me/${settings.telegramUsername || ""}`;
    if (isWhatsapp) return `https://wa.me/${settings.whatsappNumber || ""}`;
    return "#";
  };

  const buttonBgColor = isTelegram ? "#229ED9" : isWhatsapp ? "#25D366" : primaryColor;
  const pulseShadowColor = isTelegram ? "rgba(34, 158, 217, 0.4)" : isWhatsapp ? "rgba(37, 211, 102, 0.4)" : "rgba(255, 0, 85, 0.4)";

  // SF Pro ফন্ট স্ট্যাক ডিফাইন করা হয়েছে
  const sfProFont = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", "Helvetica Neue", Helvetica, Arial, sans-serif';

  return (
    <div 
      className={`flex flex-col min-h-screen text-black transition-colors duration-300 ${notoBengali.variable}`}
      style={{
        fontFamily: sfProFont,
        "--primary-color": primaryColor,
        "--bg-color": backgroundColor,
        backgroundColor: backgroundColor
      } as React.CSSProperties}
    >
      <style dangerouslySetInnerHTML={{__html: `
        /* বাংলা ফন্টের জন্য ইউটিলিটি ক্লাস */
        .font-bengali {
          font-family: var(--font-bengali), ${sfProFont};
        }

        @keyframes fabPulse {
          0% { box-shadow: 0 0 0 0 ${pulseShadowColor}, 0 10px 25px -5px rgba(0,0,0,0.3); transform: scale(1); }
          70% { box-shadow: 0 0 0 20px rgba(0, 0, 0, 0), 0 20px 35px -5px rgba(0,0,0,0.2); transform: scale(1.04); }
          100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0), 0 10px 25px -5px rgba(0,0,0,0.3); transform: scale(1); }
        }
        @keyframes bubbleFloat {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          20% { opacity: 0.9; }
          80% { opacity: 0.8; }
          100% { transform: translateY(-40px) scale(1); opacity: 0; }
        }
        .iconic-fab-animate {
          animation: fabPulse 2.5s infinite ease-in-out;
        }
        .sms-bubble {
          position: absolute;
          background: ${buttonBgColor};
          border: 1.5px solid rgba(255,255,255,0.8);
          border-radius: 50%;
          pointer-events: none;
          opacity: 0;
        }
        .bubble-1 { width: 10px; height: 10px; bottom: 10px; left: -8px; animation: bubbleFloat 3s infinite ease-in-out 0s; }
        .bubble-2 { width: 14px; height: 14px; top: -5px; right: 2px; animation: bubbleFloat 3.5s infinite ease-in-out 0.8s; }
        .bubble-3 { width: 8px; height: 8px; bottom: 2px; right: -10px; animation: bubbleFloat 2.8s infinite ease-in-out 1.5s; }
        .bubble-4 { width: 11px; height: 11px; top: 15px; left: -12px; animation: bubbleFloat 3.2s infinite ease-in-out 2.2s; }
      `}} />
      
      {/* Header Component */}
      {settings?.isHeaderVisible !== false && (
        <Header logo={settings?.logoUrl} siteName={settings?.siteName} /> 
      )}

      {/* Main Content Section */}
      <main className={`flex-grow pb-15 md:pb-18 ${settings?.isHeaderVisible !== false ? 'pt-17 md:pt-21' : 'pt-0'}`}>
        {children}
      </main>

      {/* Footer */}
      {settings?.isFooterVisible !== false && <Footer settings={settings} />}

      {/* FAB Floating Action Button */}
      {settings?.activeFloatingButton && (settings?.whatsappNumber || settings?.telegramUsername) && (
        <div className="fixed bottom-20 md:bottom-8 right-6 z-50 flex items-center justify-center">
          <div className="sms-bubble bubble-1"></div>
          <div className="sms-bubble bubble-2"></div>
          <div className="sms-bubble bubble-3"></div>
          <div className="sms-bubble bubble-4"></div>

          <a
            href={getFloatingLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-16 h-16 rounded-full text-white flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 iconic-fab-animate border border-white/20 select-none cursor-pointer"
            style={{ backgroundColor: buttonBgColor }}
          >
            {isWhatsapp && (
              <svg className="w-9 h-9 fill-current drop-shadow-md" viewBox="0 0 24 24">
                <path d="M12.004 2c-5.517 0-9.994 4.476-9.994 9.994 0 1.764.46 3.422 1.265 4.877L2 22l5.308-1.393c1.4.76 2.99 1.192 4.69 1.192 5.52 0 10.003-4.476 10.003-9.994S17.522 2 12.004 2zm5.735 14.331c-.247.694-1.428 1.325-1.996 1.41-.51.077-1.155.11-1.724-.117-.342-.136-.9-.319-1.606-.624-2.97-1.283-4.912-4.48-5.06-4.678-.148-.198-1.209-1.607-1.209-3.067 0-1.459.761-2.176 1.033-2.472.272-.297.593-.371.79-.371.198 0 .396.002.57.01.182.01.427-.072.668.506.248.594.843 2.053.918 2.202.075.149.124.321.025.52-.099.197-.149.32-.297.495-.149.173-.311.385-.445.518-.149.149-.304.312-.13.61.173.297.767 1.264 1.645 2.048.17.151.343.3.514.444.821.688 1.455.918 1.751 1.066.297.148.471.124.644-.074.173-.198.767-.89 1.04-1.287.272-.396.544-.321.916-.173.371.148 2.355 1.11 2.479 1.259.124.148.124.742.025 1.436z"/>
              </svg>
            )}
            {isTelegram && (
              <svg className="w-9 h-9 fill-current drop-shadow-md pr-1" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.75-1.41 6.63-1.41 6.63-.1.46-.37.57-.76.35l-2.15-1.58-1.04 1c-.11.11-.21.21-.43.21l.15-2.2 4.01-3.62c.17-.16-.04-.24-.26-.1l-4.96 3.12-2.13-.67c-.46-.14-.47-.46.1-.68l8.32-3.21c.39-.14.72.1.57.75z"/>
              </svg>
            )}
          </a>
        </div>
      )}

      <BottomNav />
    </div>
  );
}