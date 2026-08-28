import Header from "@/components/header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/bottomNavi"; 
import { prisma } from "@/lib/prisma"; 
import { Noto_Sans_Bengali } from "next/font/google";

// বাংলা ফন্টের জন্য Variable
const notoBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-bengali",
});

export const revalidate = 0; 

// 🕒 ডায়ালগ একটিভ আছে কিনা চেক করার লজিক
function isScheduleActive(
  isEnabled?: boolean,
  endTimeStr?: string | null,
  updatedAt?: Date | string | null
): boolean {
  if (!isEnabled) return false;
  if (!endTimeStr || !endTimeStr.trim()) return true;

  try {
    let hours = 0;
    let minutes = 0;
    const cleanStr = endTimeStr.trim();
    const hasAMPM = /am|pm/i.test(cleanStr);

    if (hasAMPM) {
      const parts = cleanStr.split(/\s+/);
      const timeParts = parts[0].split(":");
      hours = parseInt(timeParts[0], 10);
      minutes = parseInt(timeParts[1] || "0", 10);
      const modifier = (parts[1] || "").toUpperCase();

      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
    } else {
      const timeParts = cleanStr.split(":");
      hours = parseInt(timeParts[0], 10);
      minutes = parseInt(timeParts[1] || "0", 10);
    }

    if (isNaN(hours) || isNaN(minutes)) return true;

    const now = new Date();
    const updatedDate = updatedAt ? new Date(updatedAt) : new Date();

    const targetDate = new Date(updatedDate);
    targetDate.setHours(hours, minutes, 0, 0);

    if (targetDate.getTime() <= updatedDate.getTime()) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    return now.getTime() < targetDate.getTime();
  } catch (err) {
    console.error("Error calculating schedule active state:", err);
    return true;
  }
}

function isBanglaText(text?: string | null): boolean {
  if (!text) return false;
  return /[\u0980-\u09FF]/.test(text);
}

// 🚀 ৩টি কুয়েরি একসাথে (Parallel) নিয়ে আসার মাধ্যমে পেজ লোড স্পিড প্রায় ২ গুণ বাড়ানো হয়েছে
async function getLayoutData() {
  try {
    const [settings, storeControl, adminCount] = await Promise.all([
      prisma.siteSettings.findFirst().catch(() => null),
      prisma.storeControl.findFirst().catch(() => null),
      prisma.admin.count().catch(() => 0),
    ]);
    return { settings, storeControl, adminCount };
  } catch (error) {
    console.error("Failed to fetch layout data:", error);
    return { settings: null, storeControl: null, adminCount: 0 };
  }
}

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const { settings, storeControl, adminCount } = await getLayoutData();

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

  // 🔴 ১. Site Closed modal শর্ত চেক
  const showSiteClosedModal = isScheduleActive(
    storeControl?.isSiteClosed,
    storeControl?.openTime,
    storeControl?.updatedAt
  );

  // 🟡 ২. Maintenance modal শর্ত চেক
  const showMaintenanceModal = !showSiteClosedModal && isScheduleActive(
    storeControl?.isMaintenance,
    storeControl?.maintEndTime,
    storeControl?.updatedAt
  );

  const primaryColor = settings?.primaryColor || "#ff0055"; 
  const backgroundColor = settings?.backgroundColor || "#ffffff"; 

  const isTelegram = settings?.activeFloatingButton === "TELEGRAM";
  const isWhatsapp = settings?.activeFloatingButton === "WHATSAPP";

  const getFloatingLink = () => {
    if (isTelegram) return `https://t.me/${settings?.telegramUsername || ""}`;
    if (isWhatsapp) return `https://wa.me/${settings?.whatsappNumber || ""}`;
    return "#";
  };

  const buttonBgColor = isTelegram ? "#229ED9" : isWhatsapp ? "#25D366" : primaryColor;
  const pulseShadowColor = isTelegram ? "rgba(34, 158, 217, 0.4)" : isWhatsapp ? "rgba(37, 211, 102, 0.4)" : "rgba(255, 0, 85, 0.4)";

  const urbanistFont = '"Urbanist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

  return (
    <div 
      className={`flex flex-col min-h-screen text-black transition-colors duration-300 ${notoBengali.variable}`}
      style={{
        fontFamily: urbanistFont,
        "--primary-color": primaryColor,
        "--bg-color": backgroundColor,
        backgroundColor: backgroundColor
      } as React.CSSProperties}
    >
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --primary-color: ${primaryColor};
          --bg-color: ${backgroundColor};
        }
        .font-bengali {
          font-family: var(--font-bengali), ${urbanistFont};
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

      {/* 🔴 SITE CLOSED DIALOG */}
      {showSiteClosedModal && (
        <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 select-none pointer-events-auto">
          <div className="w-full max-w-md rounded-md bg-red-600 overflow-hidden shadow-none">
            <div className="bg-red-950 px-5 py-2 flex items-center gap-3">
              <div className="flex items-center justify-center shrink-0">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-md font-bold text-white tracking-wide">
                Site Is Closed
              </h3>
            </div>

            <div className="p-4">
              <p className={`text-white text-base leading-relaxed ${isBanglaText(storeControl?.closeReason) ? "font-bengali" : ""}`}>
                {storeControl?.closeReason || "The site is currently closed. Please check back later during operating hours."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 🟡 MAINTENANCE MODE DIALOG */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 select-none pointer-events-auto">
          <div className="w-full max-w-md rounded-md bg-white overflow-hidden shadow-none">
            <div className="bg-neutral-900 px-5 py-2 flex items-center gap-3">
              <div className="flex items-center justify-center shrink-0 text-white">
                <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              <h3 className="text-md font-bold text-white">
                Maintenance
              </h3>
            </div>

            <div className="p-4">
              <p className={`text-gray-800 text-base leading-relaxed ${isBanglaText(storeControl?.maintNotice) ? "font-bengali" : ""}`}>
                {storeControl?.maintNotice || "We are currently performing scheduled maintenance. We will be back online shortly!"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Component */}
      {settings?.isHeaderVisible !== false && (
        <Header logo={settings?.logoUrl} siteName={settings?.siteName} /> 
      )}

      {/* Main Content Section */}
      <main className={`flex-grow ${settings?.isHeaderVisible !== false ? 'pt-17 md:pt-21' : 'pt-0'}`}>
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