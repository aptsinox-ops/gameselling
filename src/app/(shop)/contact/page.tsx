import React from "react";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  // ⚡ ডাটাবেজের SiteSettings থেকে সমস্ত প্রয়োজনীয় তথ্য ফেচ
  const settings = await db.siteSettings.findFirst();

  // ডাটা নিষ্কাশন
  const whatsappNumber = settings?.whatsappNumber?.replace(/[^0-9]/g, "") || "";
  const telegramUsername = settings?.telegramUsername?.replace("@", "") || "";
  const adminEmail = settings?.adminEmail || "";
  const primaryColor = settings?.primaryColor || "#2563eb";

  const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}` : "#";
  const telegramUrl = telegramUsername ? `https://t.me/${telegramUsername}` : "#";
  const mailtoUrl = adminEmail ? `mailto:${adminEmail}` : "#";

  return (
    <div className="w-full min-h-[85vh] py-6 sm:py-10 px-3 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-[#09090b] flex justify-center items-center overflow-hidden">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* 👈 বাম পাশ: যোগাযোগের মাধ্যমসমূহ (WhatsApp, Telegram, Email, Social) */}
        <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-6 w-full min-w-0">
          <div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1.5 sm:mb-2 block">
              Get In Touch
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight leading-tight">
              Contact Us
            </h1>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm lg:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
              আপনার যেকোনো প্রশ্ন, সাপোর্ট বা ওয়েবসাইটের বিষয়ে সরাসরি আমাদের সাথে যোগাযোগ করুন।
            </p>
          </div>

          {/* কন্টাক্ট চ্যানেল কার্ডসমূহ */}
          <div className="flex flex-col gap-3 sm:gap-3.5 w-full">
            {/* WhatsApp */}
            {whatsappNumber && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 hover:border-emerald-500/50 transition-all duration-200 group shadow-none min-w-0"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12.004 2c-5.517 0-9.994 4.476-9.994 9.994 0 1.764.46 3.422 1.265 4.877L2 22l5.308-1.393c1.4.76 2.99 1.192 4.69 1.192 5.52 0 10.003-4.476 10.003-9.994S17.522 2 12.004 2zm5.735 14.331c-.247.694-1.428 1.325-1.996 1.41-.51.077-1.155.11-1.724-.117-.342-.136-.9-.319-1.606-.624-2.97-1.283-4.912-4.48-5.06-4.678-.148-.198-1.209-1.607-1.209-3.067 0-1.459.761-2.176 1.033-2.472.272-.297.593-.371.79-.371.198 0 .396.002.57.01.182.01.427-.072.668.506.248.594.843 2.053.918 2.202.075.149.124.321.025.52-.099.197-.149.32-.297.495-.149.173-.311.385-.445.518-.149.149-.304.312-.13.61.173.297.767 1.264 1.645 2.048.17.151.343.3.514.444.821.688 1.455.918 1.751 1.066.297.148.471.124.644-.074.173-.198.767-.89 1.04-1.287.272-.396.544-.321.916-.173.371.148 2.355 1.11 2.479 1.259.124.148.124.742.025 1.436z"/>
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-400">WhatsApp Support</h3>
                  <p className="text-sm sm:text-base font-bold text-neutral-800 dark:text-neutral-100 group-hover:text-emerald-500 transition-colors truncate">
                    +{whatsappNumber}
                  </p>
                </div>
              </a>
            )}

            {/* Telegram */}
            {telegramUsername && (
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 hover:border-sky-500/50 transition-all duration-200 group shadow-none min-w-0"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 flex items-center justify-center text-sky-500 shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.75-1.41 6.63-1.41 6.63-.1.46-.37.57-.76.35l-2.15-1.58-1.04 1c-.11.11-.21.21-.43.21l.15-2.2 4.01-3.62c.17-.16-.04-.24-.26-.1l-4.96 3.12-2.13-.67c-.46-.14-.47-.46.1-.68l8.32-3.21c.39-.14.72.1.57.75z"/>
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-400">Telegram Channel</h3>
                  <p className="text-sm sm:text-base font-bold text-neutral-800 dark:text-neutral-100 group-hover:text-sky-500 transition-colors truncate">
                    @{telegramUsername}
                  </p>
                </div>
              </a>
            )}

            {/* Admin Email */}
            {adminEmail && (
              <a
                href={mailtoUrl}
                className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 hover:border-indigo-500/50 transition-all duration-200 group shadow-none min-w-0"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-400">Email Address</h3>
                  <p className="text-sm sm:text-base font-bold text-neutral-800 dark:text-neutral-100 group-hover:text-indigo-500 transition-colors truncate break-all">
                    {adminEmail}
                  </p>
                </div>
              </a>
            )}
          </div>

          {/* Social Media Links */}
          {(settings?.facebookLink || settings?.youtubeLink || settings?.instagramLink) && (
            <div className="pt-1 sm:pt-2">
              <span className="text-[10px] sm:text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2 sm:mb-3">Follow Us</span>
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                {settings?.facebookLink && (
                  <a href={settings.facebookLink} target="_blank" rel="noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-none">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                )}
                {settings?.youtubeLink && (
                  <a href={settings.youtubeLink} target="_blank" rel="noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-none">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                )}
                {settings?.instagramLink && (
                  <a href={settings.instagramLink} target="_blank" rel="noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-pink-600 hover:bg-pink-600 hover:text-white transition-all shadow-none">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 👉 ডান পাশ: Send us a Message */}
        <div className="lg:col-span-7 w-full min-w-0">
          <div className="w-full bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-none">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-4 sm:mb-6">
              Send us a Message
            </h2>

            <form className="space-y-3.5 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                {/* Full Name */}
                <div className="w-full min-w-0">
                  <label className="block text-[11px] sm:text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 sm:mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#18181b] text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-none"
                  />
                </div>

                {/* Email Address */}
                <div className="w-full min-w-0">
                  <label className="block text-[11px] sm:text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 sm:mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#18181b] text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-none"
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="w-full min-w-0">
                <label className="block text-[11px] sm:text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 sm:mb-1.5">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="What's this about?"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#18181b] text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-none"
                />
              </div>

              {/* Message */}
              <div className="w-full min-w-0">
                <label className="block text-[11px] sm:text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 sm:mb-1.5">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us how we can help you..."
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#18181b] text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none shadow-none"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                style={{ backgroundColor: primaryColor }}
                className="w-full py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-none"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Send Message
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}