"use client";

import React from "react";

interface DeveloperPageProps {
  siteName?: string;
}

export default function DeveloperPage({ siteName = "DEMO BAZAR" }: DeveloperPageProps) {
  // Pre-filled message configuration
  const defaultMessage = `I want to buy a website like this ${siteName}`;
  const encodedMessage = encodeURIComponent(defaultMessage);

  const whatsappUrl = `https://wa.me/8801322104655?text=${encodedMessage}`;
  const mailtoUrl = `mailto:aptsinox@gmail.com?subject=${encodeURIComponent(
    `Website Inquiry - ${siteName}`
  )}&body=${encodedMessage}`;

  const buildFeatures = [
    {
      subtitle: "Automation System",
      title: "FreeFire Auto Topup Robot",
      desc: "High-speed API integration for instant, automated diamond delivery directly to user IDs.",
      badge: "Fast Delivery",
      borderColor: "hover:border-amber-400",
      accentBg: "bg-amber-50 text-amber-600 border-amber-200",
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      subtitle: "User Experience",
      title: "Ultra-Fast & Intuitive Navigation",
      desc: "Lightweight, highly optimized architecture built for seamless mobile & desktop browsing.",
      badge: "High Performance",
      borderColor: "hover:border-blue-400",
      accentBg: "bg-blue-50 text-blue-600 border-blue-200",
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      subtitle: "E-Commerce Architecture",
      title: "Digital Gaming Store & Voucher Hub",
      desc: "Complete digital storefront with automatic payment gateways, stock, and live invoice system.",
      badge: "Full Storefront",
      borderColor: "hover:border-emerald-400",
      accentBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      subtitle: "Modern Interface",
      title: "Clean Modern Aesthetics",
      desc: "Pixel-perfect visual design featuring crisp contrast, clean layouts, and sleek user interface.",
      badge: "Mobile First",
      borderColor: "hover:border-indigo-400",
      accentBg: "bg-indigo-50 text-indigo-600 border-indigo-200",
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
    {
      subtitle: "Management Hub",
      title: "Advanced Admin Control Panel",
      desc: "Comprehensive back-office dashboard to track live orders, users, revenue, and system logs.",
      badge: "Full Control",
      borderColor: "hover:border-rose-400",
      accentBg: "bg-rose-50 text-rose-600 border-rose-200",
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      subtitle: "Custom Engineering",
      title: "Tailor-Made Enterprise Solutions",
      desc: "Custom web development engineered specifically to adapt to your exact business workflow.",
      badge: "Bespoke Code",
      borderColor: "hover:border-purple-400",
      accentBg: "bg-purple-50 text-purple-600 border-purple-200",
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
  ];

  const techLogos = [
    { name: "Next.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
    { name: "PostgreSQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
    { name: "PHP", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg" },
    { name: "Laravel", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg" },
    { name: "React", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
    { name: "MongoDB", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
    { name: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
    { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
    { name: "TypeScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
    { name: "Vercel", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg" },
    { name: "GitHub", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" },
    { name: "GitLab", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg" },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-blue-600 selection:text-white overflow-x-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background-color: #f8fafc;
        }
        .font-hind {
          font-family: 'Hind Siliguri', sans-serif;
        }

        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-marquee-fast {
          display: flex;
          width: 200%;
          animation: marquee 10s linear infinite;
          will-change: transform;
        }
        .animate-marquee-fast:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="relative w-full max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-12 space-y-6 sm:space-y-12">
        
        {/* 1. PROFESSIONAL NOTICE BANNER */}
        <div className="rounded-md bg-red-50 border border-red-200/80 p-3 sm:p-4 shadow-none">
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3.5">
            <div className="p-1.5 sm:p-2 rounded-md bg-red-100 text-red-600 border border-red-200 shrink-0 mt-0.5 sm:mt-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="font-hind text-[11px] sm:text-xs md:text-sm text-slate-700 leading-relaxed font-medium min-w-0 break-words">
              <span className="inline-block bg-red-600 text-white font-bold px-1.5 py-0.5 rounded text-[10px] sm:text-xs mr-1.5 align-middle">
                বিশেষ বিজ্ঞপ্তি
              </span>
              এটি প্রোডাক্ট সাপোর্টের জন্য নয়। এই পেজটি শুধুমাত্র ব্যবসায়িক মালিকদের জন্য যারা এই ধরনের প্রিমিয়াম ওয়েবসাইট তৈরি করতে চান। প্রোডাক্ট সাপোর্টের জন্য কন্টাক্ট পেজ ব্যবহার করুন।
            </p>
          </div>
        </div>

        {/* 2. HERO SECTION */}
        <div className="text-center space-y-2.5 sm:space-y-3 px-2">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[10px] sm:text-xs font-semibold tracking-wide uppercase">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-600 animate-pulse" />
            Modern Web Architecture
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight break-words">
            Want a Website <span className="text-blue-600">Like This?</span>
          </h1>
          
          <p className="text-[11px] sm:text-sm md:text-base text-slate-600 max-w-xl mx-auto font-normal leading-relaxed">
            High-performance, automated, and bespoke web solutions tailored specifically for growing businesses.
          </p>
        </div>

        {/* 3. DEVELOPER CARD & STATS CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          
          {/* Developer Card */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-md p-4 sm:p-6 md:p-8 flex flex-col justify-between shadow-none relative overflow-hidden group hover:border-blue-400 transition-all duration-300">
            <div className="space-y-4 sm:space-y-6 relative z-10 text-center">
              {/* Profile Image */}
              <div className="relative w-20 h-20 sm:w-28 sm:h-28 mx-auto">
                <img
                  src="developer.png"
                  alt="SINOX"
                  className="relative w-full h-full object-cover rounded-md border-2 border-slate-100 shadow-none"
                />
                <span className="absolute -bottom-1 -right-1 sm:-bottom-1.5 sm:-right-1.5 bg-emerald-500 border-2 border-white text-white p-0.5 sm:p-1 rounded-full shadow-none" title="Available for projects">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </div>

              {/* Info */}
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">SINOX</h3>
                <p className="text-[11px] sm:text-xs md:text-sm font-semibold text-blue-600">Full Stack Software Engineer</p>
                <p className="text-[10px] sm:text-xs text-slate-500 font-normal">Specialized in Automated Commerce & APIs</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 sm:space-y-3 pt-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm transition-all shadow-none active:scale-95"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  Chat on WhatsApp
                </a>

                <a
                  href={mailtoUrl}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs sm:text-sm transition-all shadow-none active:scale-95"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Email Inquiry
                </a>
              </div>
            </div>
          </div>

          {/* Stats & Quality Highlights */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            
            {/* Stat Box 1 */}
            <div className="bg-white border border-slate-200 hover:border-blue-400 rounded-md p-3.5 sm:p-5 flex flex-col justify-between space-y-3 sm:space-y-4 shadow-none transition-all">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg sm:text-2xl font-black text-slate-900">Ultra Fast</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 leading-normal">Optimized code execution & instant server response times.</p>
              </div>
            </div>

            {/* Stat Box 2 */}
            <div className="bg-white border border-slate-200 hover:border-emerald-400 rounded-md p-3.5 sm:p-5 flex flex-col justify-between space-y-3 sm:space-y-4 shadow-none transition-all">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg sm:text-2xl font-black text-slate-900">24/7 Uptime</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 leading-normal">Continuous monitoring, zero-downtime architecture.</p>
              </div>
            </div>

            {/* Stat Box 3 */}
            <div className="bg-white border border-slate-200 hover:border-amber-400 rounded-md p-3.5 sm:p-5 flex flex-col justify-between space-y-3 sm:space-y-4 shadow-none transition-all">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg sm:text-2xl font-black text-slate-900">100% Secure</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 leading-normal">Bank-grade encryption & bulletproof security protocols.</p>
              </div>
            </div>

            {/* Stat Box 4 */}
            <div className="bg-white border border-slate-200 hover:border-indigo-400 rounded-md p-3.5 sm:p-5 flex flex-col justify-between space-y-3 sm:space-y-4 shadow-none transition-all">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg sm:text-2xl font-black text-slate-900">Custom Build</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 leading-normal">Tailored features matching your business requirements.</p>
              </div>
            </div>

          </div>

        </div>

        {/* 4. WHAT WE CAN BUILD (FEATURE GRID) */}
        <div className="space-y-4 sm:space-y-6 pt-2">
          <div className="text-center space-y-1.5 sm:space-y-2">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900">
              What We Can Build
            </h2>
            <div className="w-10 sm:w-12 h-1 bg-blue-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
            {buildFeatures.map((item, idx) => (
              <div
                key={idx}
                className={`group relative bg-white border border-slate-200 ${item.borderColor} rounded-md p-4 sm:p-6 transition-all duration-300 flex flex-col justify-between shadow-none hover:-translate-y-0.5`}
              >
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className={`p-2 sm:p-2.5 rounded-md border ${item.accentBg} shrink-0`}>
                      {item.icon}
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md shrink-0">
                      {item.badge}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] sm:text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                      {item.subtitle}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-normal pt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs font-semibold text-slate-500 group-hover:text-blue-600 transition-colors">
                  <span>Explore Architecture</span>
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. TECH STACK MARQUEE SLIDER */}
        <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-none">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-center">
            <span className="text-blue-600 text-xs sm:text-sm">⚡</span>
            <h3 className="text-xs sm:text-base font-bold text-slate-800 uppercase tracking-wider">
              Powered By Modern Tech Stack
            </h3>
          </div>

          <div className="overflow-hidden py-2.5 sm:py-3 relative rounded-md bg-slate-50 border border-slate-200/80">
            <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-12 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-8 sm:w-12 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

            <div className="animate-marquee-fast gap-2.5 sm:gap-4">
              {[...techLogos, ...techLogos].map((tech, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md bg-white border border-slate-200 hover:border-blue-400 shadow-none transition-all shrink-0 cursor-pointer"
                >
                  <img
                    src={tech.icon}
                    alt={tech.name}
                    className="w-4 h-4 sm:w-5 sm:h-5 object-contain shrink-0"
                    loading="lazy"
                  />
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-700 whitespace-nowrap">
                    {tech.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6. CALL TO ACTION */}
        <div className="bg-white border border-slate-200 rounded-md p-5 sm:p-10 md:p-12 text-center space-y-4 sm:space-y-6 shadow-none">
          <div className="space-y-2">
            <span className="inline-block text-[10px] sm:text-xs font-extrabold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-md uppercase tracking-wider">
              Let's Work Together
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight break-words">
              Ready to Start Your Project?
            </h2>
            <p className="text-[11px] sm:text-sm md:text-base text-slate-600 max-w-md mx-auto leading-relaxed">
              Send us a direct message with your requirements and let's turn your idea into reality.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 max-w-md mx-auto pt-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-7 sm:py-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm transition-all shadow-none active:scale-95"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              Start Project Now →
            </a>

            <a
              href={mailtoUrl}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-7 sm:py-3 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 transition-all shadow-none active:scale-95"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Email
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}