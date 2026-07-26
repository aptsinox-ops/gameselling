"use client";
import React from 'react';

// কাস্টম টাইপ ইন্টারফেস যা আপনার ডাটাবেজ স্ট্রাকচারের সাথে সম্পূর্ণ ফিক্সড
interface SiteSettings {
  // 🎯 ফুটারের নিজস্ব স্পেশাল গ্রেডিয়েন্ট ফিল্ডস
  footerTopColor?: string | null;
  footerBottomColor?: string | null;

  // ফুটার সেকশন কার্ড ১
  isFooterCard1Visible: boolean;
  footerCard1Title1?: string | null;
  footerCard1Title2?: string | null;
  footerCard1Link?: string | null;
  footerCard1ImageUrl?: string | null;

  // ফুটার সেকশন কার্ড ২
  isFooterCard2Visible: boolean;
  footerCard2Title1?: string | null;
  footerCard2Title2?: string | null;
  footerCard2Link?: string | null;
  footerCard2ImageUrl?: string | null;
  primaryColor?: string | null;
  siteName?: string | null;
  adminEmail?: string | null;
  whatsappNumber?: string | null; // এটি হোয়াটসঅ্যাপ লিংকের জন্য ব্যবহার হবে (যেমন: 8801322104655)
  
  // 🎯 সোশ্যাল লিংক ফিল্ডস (ইন্টারফেসে যোগ করা হয়েছে)
  youtubeLink?: string | null;
  facebookLink?: string | null;
  instagramLink?: string | null;
}

interface FooterProps {
  settings?: SiteSettings | null;
}

export default function Footer({ settings }: FooterProps) {
  // ফুটারের ব্যাকগ্রাউন্ড গ্রেডিয়েন্ট এবং প্রাইমারি কালার অ্যাসাইনমেন্ট
  const topGradientColor = settings?.footerTopColor || "#061124";
  const bottomGradientColor = settings?.footerBottomColor || "#1a3b7b";
  const primaryColor = settings?.primaryColor || "#00d2ff";

  // লিংক ভ্যালিডেশন ফাংশন: লিংক যদি না থাকে বা শুধু '#' হয়, তবে false রিটার্ন করবে
  const isValidLink = (link: string | null | undefined): boolean => {
    if (!link) return false;
    if (link.trim() === "" || link.trim() === "#") return false;
    return true;
  };

  return (
    <>
      {/* Global CSS Injector with Dynamic Database Primary Color */}
      <style jsx global>{`
        :root {
          --primary-color: ${primaryColor};
        }
        @keyframes shimmerEffect {
          0% { transform: translateX(-150%) skewX(-25deg); }
          100% { transform: translateX(150%) skewX(-25deg); }
        }
        .shimmer-hover {
          position: relative;
          overflow: hidden;
        }
        .shimmer-hover::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2) 20%,
            rgba(255, 255, 255, 0.4) 60%,
            transparent
          );
          transform: translateX(-150%) skewX(-25deg);
          transition: none;
        }
        .shimmer-hover:hover::after {
          animation: shimmerEffect 1s ease-in-out forwards;
        }
        
        /* কাস্টম ডাইনামিক হোভার ও বর্ডার ক্লাস */
        .custom-hover-text:hover {
          color: var(--primary-color) !important;
        }
        .custom-hover-border:hover {
          border-color: rgba(60, 165, 250, 0.4) !important; /* fallback */
          border-color: var(--primary-color) !important;
        }
        .custom-bg-primary {
          background-color: var(--primary-color) !important;
        }
        .custom-via-primary {
          background-image: linear-gradient(to right, transparent, var(--primary-color), transparent) !important;
        }
        /* Hide scrollbar for chrome/safari/edge */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for firefox */
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>

      {/* Footer with updated gradient: ডাটাবেজের আলাদা ফুটার টপ এবং বটম কালার */}
      <footer 
        className="relative text-slate-100 pt-14 pb-24 md:pb-12 select-none font-sans overflow-hidden border-t border-white/[0.06]"
        style={{
          background: `linear-gradient(to bottom, ${topGradientColor}, ${bottomGradientColor})`
        }}
      >
        
        {/* Top clean layout divider line - Now using primaryColor */}
        <div className="absolute top-0 left-0 w-full h-[1px] opacity-40 custom-via-primary"></div>

        <div className="max-w-[1240px] mx-auto px-6 relative z-10">
          
          {/* UPPER FOOTER GRID WITH ADAPTIVE RESPONSIVENESS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start pb-10">
            
            {/* ================= CUSTOMER SUPPORT ================= */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-[18px] font-normal uppercase tracking-wider text-white">
                  Customer Support
                </h4>
                <div className="w-12 h-[2.5px] rounded-full custom-bg-primary"></div>
              </div>

              <div className="space-y-5">
                {/* Card 1 - সুইচ অন থাকলেই শুধু শো করবে */}
                {settings?.isFooterCard1Visible !== false && (
                  <a href={settings?.footerCard1Link || "#"} className="shimmer-hover group flex items-center gap-4 bg-gradient-to-br from-white/[0.07] to-white/[0.01] backdrop-blur-xl border border-white/[0.08] p-1 rounded-xl transition-all duration-300 custom-hover-border">
                    <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/[0.06]">
                      <div style={{ borderColor: primaryColor }} className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 overflow-hidden">
                        {settings?.footerCard1ImageUrl ? (
                          <img 
                            src={settings.footerCard1ImageUrl} 
                            alt="Card 1 Icon" 
                            className="w-7 h-7 object-contain" 
                          />
                        ) : (
                          <svg className="w-6 h-6 fill-current text-[#229ED9]" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.41 6.63c-.1.46-.37.57-.76.35l-2.15-1.58-1.04 1c-.11.11-.21.21-.43.21l.15-2.2 4.01-3.62c.17-.16-.04-.24-.26-.1l-4.96 3.12-2.13-.67c-.46-.14-.47-.46.1-.68l8.32-3.21c.39-.14.72.1.57.75z"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="leading-tight">
                      <p className="text-[12px] text-slate-400 font-normal uppercase tracking-wider">
                        {settings?.footerCard1Title1 || "9AM - 11PM Daily"}
                      </p>
                      <p className="text-[16px] font-normal text-white transition-colors mt-0.5 custom-hover-text group-hover:text-[var(--primary-color)]">
                        {settings?.footerCard1Title2 || "Telegram Support"}
                      </p>
                    </div>
                  </a>
                )}

                {/* Card 2 - সুইচ অন থাকলেই শুধু শো করবে */}
                {settings?.isFooterCard2Visible !== false && (
                  <a href={settings?.footerCard2Link || "#"} className="shimmer-hover group flex items-center gap-4 bg-gradient-to-br from-white/[0.07] to-white/[0.01] backdrop-blur-xl border border-white/[0.08] p-1 rounded-xl transition-all duration-300 custom-hover-border">
                    <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/[0.06]">
                      <div style={{ borderColor: primaryColor }} className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 overflow-hidden">
                        {settings?.footerCard2ImageUrl ? (
                          <img 
                            src={settings.footerCard2ImageUrl} 
                            alt="Card 2 Icon" 
                            className="w-7 h-7 object-contain" 
                          />
                        ) : (
                          <svg className="w-6 h-6 fill-current text-[#229ED9]" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.41 6.63c-.1.46-.37.57-.76.35l-2.15-1.58-1.04 1c-.11.11-.21.21-.43.21l.15-2.2 4.01-3.62c.17-.16-.04-.24-.26-.1l-4.96 3.12-2.13-.67c-.46-.14-.47-.46.1-.68l8.32-3.21c.39-.14.72.1.57.75z"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="leading-tight">
                      <p className="text-[12px] text-slate-400 font-normal uppercase tracking-wider">
                        {settings?.footerCard2Title1 || "Community Group"}
                      </p>
                      <p className="text-[16px] font-normal text-white transition-colors mt-0.5 custom-hover-text group-hover:text-[var(--primary-color)]">
                        {settings?.footerCard2Title2 || "Join Telegram Group"}
                      </p>
                    </div>
                  </a>
                )}
              </div>
            </div>

            {/* ================= INFORMATION ================= */}
            <div className="space-y-4 md:pl-8 pt-2 md:pt-0">
              <div className="space-y-2">
                <h4 className="text-[18px] font-normal uppercase tracking-wider text-white">
                  Information
                </h4>
                <div className="w-12 h-[2.5px] rounded-full custom-bg-primary"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-[15px] text-slate-300 pt-1">
                <div className="space-y-3">
                  <a href="#" className="block transform transition-transform duration-200 ease-out hover:translate-x-2 custom-hover-text py-0.5 rounded">Terms & Conditions</a>
                  <a href="#" className="block transform transition-transform duration-200 ease-out hover:translate-x-2 custom-hover-text py-0.5 rounded">Privacy Policy</a>
                  <a href="#" className="block transform transition-transform duration-200 ease-out hover:translate-x-2 custom-hover-text py-0.5 rounded">Shipping Info</a>
                  <a href="#" className="block transform transition-transform duration-200 ease-out hover:translate-x-2 custom-hover-text py-0.5 rounded">Refund & Returns</a>
                </div>
                <div className="space-y-3">
                  <a href="#" className="block transform transition-transform duration-200 ease-out hover:translate-x-2 custom-hover-text py-0.5 rounded">Contact Us</a>
                  <a href="#" className="block transform transition-transform duration-200 ease-out hover:translate-x-2 custom-hover-text py-0.5 rounded">About Us</a>
                </div>
              </div>
            </div>

            {/* ================= STAY CONNECTED ================= */}
            <div className="space-y-4 pt-2 md:pt-0">
              <div className="space-y-2">
                <h4 className="text-[18px] font-normal uppercase tracking-wider text-white">
                  Stay Connected
                </h4>
                <div className="w-12 h-[2.5px] rounded-full custom-bg-primary"></div>
              </div>
              
              {/* Liquid-Glass Stay Connected Card */}
              <div className="bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-xl border border-white/[0.08] p-5 rounded-2xl space-y-4">
                <div className="space-y-1">
                  <span className="text-[16px] font-medium text-white tracking-wide block">
                    {settings?.siteName || "DEMO BAZAR"}
                  </span>
                  {/* ফোন নম্বর যদি ডাইনামিক হয় */}
                  {settings?.whatsappNumber && (
                    <div className="text-[14px] text-slate-300 flex items-center gap-2">
                      <p className="shrink-0">Phone :</p>
                      <span className="truncate">{settings.whatsappNumber}</span>
                    </div>
                  )}
                  {/* হোয়াটসঅ্যাপ নম্বর যদি ডাইনামিক হয় */}
                  {settings?.whatsappNumber && (
                    <div className="text-[14px] text-slate-300 flex items-center gap-2">
                      <p className="shrink-0">Whatsapp :</p>
                      <span className="truncate">{settings.whatsappNumber}</span>
                    </div>
                  )}
                  <div className="text-[14px] text-slate-300 flex items-center gap-2">
                    <p className="shrink-0">Address :</p>
                    <span className="truncate">Naraynganj Jalkuri Home 112</span>
                  </div>
                </div>
                
                {/* ================= SOCIAL BUTTONS (Updated Logic) ================= */}
                {/* চেক করা হচ্ছে অন্তত একটি সোশ্যাল লিংক ভ্যালিড কিনা */}
                {(isValidLink(settings?.youtubeLink) || 
                  isValidLink(settings?.facebookLink) || 
                  isValidLink(settings?.instagramLink) || 
                  isValidLink(settings?.whatsappNumber)) && (
                  
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                    {/* YouTube - ডাইনামিক ডাটা এবং কন্ডিশনাল রেন্ডারিং */}
                    {isValidLink(settings?.youtubeLink) && (
                      <a href={settings!.youtubeLink!} target="_blank" rel="noopener noreferrer" className="shimmer-hover w-10 h-10 bg-[#ff0000ce] hover:opacity-90 transition-opacity rounded-[10px] flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-600/20">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                          <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </a>
                    )}

                    {/* Facebook - ডাইনামিক ডাটা এবং কন্ডিশনাল রেন্ডারিং */}
                    {isValidLink(settings?.facebookLink) && (
                      <a href={settings!.facebookLink!} target="_blank" rel="noopener noreferrer" className="shimmer-hover w-10 h-10 bg-[#1877F2] hover:opacity-90 transition-opacity rounded-[10px] flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-600/20">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    )}

                    {/* Instagram - ডাইনামিক ডাটা এবং কন্ডিশনাল রেন্ডারিং */}
                    {isValidLink(settings?.instagramLink) && (
                      <a href={settings!.instagramLink!} target="_blank" rel="noopener noreferrer" className="shimmer-hover w-10 h-10 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90 transition-opacity rounded-[10px] flex items-center justify-center text-white shrink-0 shadow-lg">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204 013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                        </svg>
                      </a>
                    )}

                    {/* WhatsApp - ডাইনামিক ডাটা এবং কন্ডিশনাল রেন্ডারিং */}
                    {isValidLink(settings?.whatsappNumber) && (
                      <a href={`https://wa.me/${settings!.whatsappNumber!.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="shimmer-hover w-10 h-10 bg-[#25D366] hover:opacity-90 transition-opacity rounded-[10px] flex items-center justify-center text-white shrink-0 shadow-lg shadow-green-500/20">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.454 5.709 1.455h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ================= COPYRIGHT LOWER SECTION ================= */}
          <div className="pt-5 border-t border-white/[0.05] flex flex-row items-center justify-between text-[11px] sm:text-[14px] text-slate-400 font-semibold overflow-x-auto no-scrollbar">
            <div>© Copyright 2026. All Rights Reserved.</div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span>Developed by</span>
              <a
                href="https://t.me/The_Linuxuser"
                target="_blank"
                rel="noopener noreferrer"
                className="shimmer-hover text-white font-bold transition-colors cursor-pointer uppercase tracking-wider px-1 rounded custom-hover-text no-underline inline-block"
              >
                SINOX
              </a>
            </div>
          </div>

        </div>
      </footer>
    </>
  );
}