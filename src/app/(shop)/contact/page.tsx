import React from "react";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ContractsPage() {
  // ⚡ ডাটাবেজের SiteSettings থেকে Whatsapp & Telegram তথ্য ফেস
  const settings = await db.siteSettings.findFirst();

  // লিঙ্ক তৈরি
  const whatsappNumber = settings?.whatsappNumber?.replace(/[^0-9]/g, "") || "";
  const telegramUsername = settings?.telegramUsername?.replace("@", "") || "";

  const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}` : "#";
  const telegramUrl = telegramUsername ? `https://t.me/${telegramUsername}` : "#";

  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-start pt-12 pb-16 px-4 bg-slate-50/30 dark:bg-[#09090b]">
      
      {/* 📄 কন্টাক্ট ইউএস কার্ড (ছবি অনুযায়ী হুবহু ডিজাইন) */}
      <div className="w-full max-w-3xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 rounded-md p-8 sm:p-10 text-left transition-all">
        
        {/* টাইটেল */}
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight mb-4">
          Contract Us
        </h1>

        {/* সাবটাইটেল / ডেসক্রিপশন */}
        <p className="text-sm sm:text-base font-medium text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8">
          amader theke jekono website nite obbosoy whatsapp ba teleram e message diben obosoy ay website gula open soures noy
        </p>

        {/* 🔘 হোয়াটসঅ্যাপ এবং টেলিগ্রাম বাটন কন্টেইনার */}
        <div className="flex flex-wrap items-center gap-4">
          
          {/* WhatsApp Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 px-8 py-3.5 rounded-md border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all duration-200 group cursor-pointer"
          >
            {/* WhatsApp Icon */}
            <svg className="w-5 h-5 fill-emerald-500" viewBox="0 0 24 24">
              <path d="M12.004 2c-5.517 0-9.994 4.476-9.994 9.994 0 1.764.46 3.422 1.265 4.877L2 22l5.308-1.393c1.4.76 2.99 1.192 4.69 1.192 5.52 0 10.003-4.476 10.003-9.994S17.522 2 12.004 2zm5.735 14.331c-.247.694-1.428 1.325-1.996 1.41-.51.077-1.155.11-1.724-.117-.342-.136-.9-.319-1.606-.624-2.97-1.283-4.912-4.48-5.06-4.678-.148-.198-1.209-1.607-1.209-3.067 0-1.459.761-2.176 1.033-2.472.272-.297.593-.371.79-.371.198 0 .396.002.57.01.182.01.427-.072.668.506.248.594.843 2.053.918 2.202.075.149.124.321.025.52-.099.197-.149.32-.297.495-.149.173-.311.385-.445.518-.149.149-.304.312-.13.61.173.297.767 1.264 1.645 2.048.17.151.343.3.514.444.821.688 1.455.918 1.751 1.066.297.148.471.124.644-.074.173-.198.767-.89 1.04-1.287.272-.396.544-.321.916-.173.371.148 2.355 1.11 2.479 1.259.124.148.124.742.025 1.436z"/>
            </svg>
            <span className="text-base font-bold text-emerald-500">
              Whatsapp
            </span>
          </a>

          {/* Telegram Button */}
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 px-8 py-3.5 rounded-md border border-neutral-200 dark:border-neutral-800 hover:border-sky-500/50 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 transition-all duration-200 group cursor-pointer"
          >
            {/* Telegram Icon */}
            <svg className="w-5 h-5 fill-sky-500" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.75-1.41 6.63-1.41 6.63-.1.46-.37.57-.76.35l-2.15-1.58-1.04 1c-.11.11-.21.21-.43.21l.15-2.2 4.01-3.62c.17-.16-.04-.24-.26-.1l-4.96 3.12-2.13-.67c-.46-.14-.47-.46.1-.68l8.32-3.21c.39-.14.72.1.57.75z"/>
            </svg>
            <span className="text-base font-bold text-sky-500">
              Telegram
            </span>
          </a>

        </div>

      </div>

    </div>
  );
}