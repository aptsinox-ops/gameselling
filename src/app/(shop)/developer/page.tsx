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
      color: "from-amber-500/10 via-amber-500/5 to-transparent",
      borderColor: "hover:border-amber-500/40",
      accentBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      subtitle: "User Experience",
      title: "Ultra-Fast & Intuitive Navigation",
      desc: "Lightweight, highly optimized architecture built for seamless mobile & desktop browsing.",
      badge: "High Performance",
      color: "from-cyan-500/10 via-cyan-500/5 to-transparent",
      borderColor: "hover:border-cyan-500/40",
      accentBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      subtitle: "E-Commerce Architecture",
      title: "Digital Gaming Store & Voucher Hub",
      desc: "Complete digital storefront with automatic payment gateways, stock, and live invoice system.",
      badge: "Full Storefront",
      color: "from-emerald-500/10 via-emerald-500/5 to-transparent",
      borderColor: "hover:border-emerald-500/40",
      accentBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      subtitle: "Modern Interface",
      title: "Glassmorphism & Dark Aesthetics",
      desc: "Pixel-perfect visual design featuring glowing accents, glass effects, and sleek themes.",
      badge: "Mobile First",
      color: "from-indigo-500/10 via-indigo-500/5 to-transparent",
      borderColor: "hover:border-indigo-500/40",
      accentBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
    {
      subtitle: "Management Hub",
      title: "Advanced Admin Control Panel",
      desc: "Comprehensive back-office dashboard to track live orders, users, revenue, and system logs.",
      badge: "Full Control",
      color: "from-rose-500/10 via-rose-500/5 to-transparent",
      borderColor: "hover:border-rose-500/40",
      accentBg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      subtitle: "Custom Engineering",
      title: "Tailor-Made Enterprise Solutions",
      desc: "Custom web development engineered specifically to adapt to your exact business workflow.",
      badge: "Bespoke Code",
      color: "from-purple-500/10 via-purple-500/5 to-transparent",
      borderColor: "hover:border-purple-500/40",
      accentBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    <div className="w-full min-h-screen bg-[#070a12] text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-black overflow-x-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background-color: #070a12;
        }
        .font-hind {
          font-family: 'Hind Siliguri', sans-serif;
        }

        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-marquee-smooth {
          display: flex;
          width: 200%;
          animation: marquee 25s linear infinite;
          will-change: transform;
        }
        .animate-marquee-smooth:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Ambient Radial Background Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-indigo-600/15 via-cyan-500/10 to-transparent rounded-full blur-[120px] opacity-70" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-t from-cyan-600/10 to-transparent rounded-full blur-[100px] opacity-50" />
      </div>

      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-12">
        
        {/* 1. PROFESSIONAL NOTICE BANNER */}
        <div className="relative rounded-2xl bg-gradient-to-r from-red-500/20 via-amber-500/20 to-slate-800/20 p-[1px] shadow-2xl backdrop-blur-md">
          <div className="bg-[#0b0f19]/80 rounded-[15px] p-4 flex items-start sm:items-center gap-3.5 border border-white/10">
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 shrink-0 mt-0.5 sm:mt-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="font-hind text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              <span className="inline-block bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded text-xs mr-2 border border-red-500/30">
                বিশেষ বিজ্ঞপ্তি
              </span>
              এটি প্রোডাক্ট সাপোর্টের জন্য নয়। এই পেজটি শুধুমাত্র ব্যবসায়িক মালিকদের জন্য যারা এই ধরনের প্রিমিয়াম ওয়েবসাইট তৈরি করতে চান। প্রোডাক্ট সাপোর্টের জন্য কন্টাক্ট পেজ ব্যবহার করুন।
            </p>
          </div>
        </div>

        {/* 2. HERO SECTION */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Modern Web Architecture
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Want a Website <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-400 bg-clip-text text-transparent">Like This?</span>
          </h1>
          
          <p className="text-xs sm:text-base text-slate-400 max-w-xl mx-auto font-normal">
            High-performance, automated, and bespoke web solutions tailored specifically for growing businesses.
          </p>
        </div>

        {/* 3. DEVELOPER CARD & STATS BENTO CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Developer Card (SINOX) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#101626] to-[#0a0d16] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-6 relative z-10 text-center">
              {/* Profile Image */}
              <div className="relative w-28 h-28 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-indigo-500 rounded-2xl blur opacity-40 group-hover:opacity-70 transition-opacity" />
                <img
                  src="/developer.png"
                  alt="SINOX"
                  className="relative w-full h-full object-cover rounded-2xl border-2 border-white/20 shadow-xl"
                />
                <span className="absolute -bottom-1.5 -right-1.5 bg-[#00c261] border-2 border-[#070a12] text-white p-1 rounded-full shadow-md" title="Available for projects">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </div>

              {/* Info */}
              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">SINOX</h3>
                <p className="text-xs sm:text-sm font-semibold text-cyan-400">Full Stack Software Engineer</p>
                <p className="text-xs text-slate-400 font-normal">Specialized in Automated Commerce & APIs</p>
              </div>

              {/* Direct Action Buttons */}
              <div className="space-y-3 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-[#00c261] hover:bg-[#00d96d] text-white font-extrabold text-sm transition-all shadow-[0_0_25px_rgba(0,194,97,0.25)] active:scale-98"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  Chat on WhatsApp
                </a>

                <a
                  href={mailtoUrl}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold text-sm transition-all active:scale-98"
                >
                  <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Email Inquiry
                </a>
              </div>
            </div>
          </div>

          {/* Stats & Quality Highlights */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Stat Box 1 */}
            <div className="bg-[#0f1422] border border-white/10 hover:border-cyan-500/30 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="text-2xl font-black text-white">Ultra Fast</h4>
                <p className="text-xs text-slate-400 mt-1">Optimized code execution & instant server response times.</p>
              </div>
            </div>

            {/* Stat Box 2 */}
            <div className="bg-[#0f1422] border border-white/10 hover:border-emerald-500/30 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-2xl font-black text-white">24/7 Uptime</h4>
                <p className="text-xs text-slate-400 mt-1">Continuous monitoring, zero-downtime architecture.</p>
              </div>
            </div>

            {/* Stat Box 3 */}
            <div className="bg-[#0f1422] border border-white/10 hover:border-amber-500/30 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="text-2xl font-black text-white">100% Secure</h4>
                <p className="text-xs text-slate-400 mt-1">Bank-grade encryption & bulletproof security protocols.</p>
              </div>
            </div>

            {/* Stat Box 4 */}
            <div className="bg-[#0f1422] border border-white/10 hover:border-indigo-500/30 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <h4 className="text-2xl font-black text-white">Custom Build</h4>
                <p className="text-xs text-slate-400 mt-1">Tailored features matching your business requirements.</p>
              </div>
            </div>

          </div>

        </div>

        {/* 4. WHAT WE CAN BUILD (FEATURE GRID) */}
        <div className="space-y-6 pt-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              What We Can Build
            </h2>
            <div className="w-12 h-1 bg-gradient-to-r from-cyan-400 to-indigo-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {buildFeatures.map((item, idx) => (
              <div
                key={idx}
                className={`group relative overflow-hidden bg-[#0c101b] border border-white/10 ${item.borderColor} rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl`}
              >
                <div className={`absolute inset-0 bg-gradient-to-b ${item.color} opacity-50 pointer-events-none`} />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl border ${item.accentBg} shrink-0`}>
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
                      {item.badge}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                      {item.subtitle}
                    </span>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-200 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-normal pt-1">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-cyan-400 transition-colors">
                  <span>Explore Architecture</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. TECH STACK MARQUEE SLIDER */}
        <div className="bg-gradient-to-b from-[#0c101b] to-[#080b13] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-center gap-2 text-center">
            <span className="text-cyan-400 text-sm">⚡</span>
            <h3 className="text-sm sm:text-base font-bold text-slate-200 uppercase tracking-wider">
              Powered By Modern Tech Stack
            </h3>
          </div>

          <div className="overflow-hidden py-3 relative rounded-xl bg-[#05070e] border border-white/5">
            <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-[#05070e] to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-[#05070e] to-transparent z-10 pointer-events-none" />

            <div className="animate-marquee-smooth gap-4">
              {[...techLogos, ...techLogos].map((tech, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 hover:bg-white/10 transition-all shrink-0 cursor-pointer"
                >
                  <img
                    src={tech.icon}
                    alt={tech.name}
                    className="w-5 h-5 object-contain"
                    loading="lazy"
                  />
                  <span className="text-xs font-semibold text-slate-300">
                    {tech.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6. CALL TO ACTION (START YOUR PROJECT) */}
        <div className="relative bg-gradient-to-br from-[#0c1322] via-[#09101d] to-[#060a14] border border-cyan-500/20 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <span className="inline-block text-xs font-extrabold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3.5 py-1 rounded-full uppercase tracking-wider">
              ✨ Let's Work Together
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Ready to Start Your Project?
            </h2>
            <p className="text-xs sm:text-base text-slate-400 max-w-md mx-auto">
              Send us a direct message with your requirements and let's turn your idea into reality.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 max-w-md mx-auto">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#00c261] hover:bg-[#00d96d] text-white font-extrabold text-sm transition-all shadow-[0_0_30px_rgba(0,194,97,0.3)] active:scale-95"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              Start Project Now →
            </a>

            <a
              href={mailtoUrl}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-100 font-bold text-sm border border-white/10 transition-all active:scale-95"
            >
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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