"use client";
import React, { useState, useEffect } from "react";

interface SlideItem {
  id: string;
  type: "BANNER" | "VIDEO" | "SOCIAL";
  imageUrl: string;
  link?: string | null;
  videoUrl?: string | null;
  title?: string | null;
  socialUrl?: string | null;
  createdAt?: string | Date;
}

interface HeroSliderProps {
  noticeText?: string | null;
  initialSlides?: SlideItem[];
  siteSettings?: any;
  primaryColor?: string;
  sliders?: SlideItem[];
}

export default function HeroSlider({
  noticeText: propNoticeText,
  initialSlides = [],
  siteSettings = null,
  primaryColor: propPrimaryColor = "#2563eb",
  sliders = [],
}: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotice, setShowNotice] = useState(true);

  // 🟢 initialSlides অথবা sliders যেকোনো একটি প্রপস পেলেই কাজ করবে
  const rawSlides = initialSlides && initialSlides.length > 0 ? initialSlides : sliders;
  const slides = rawSlides.length > 0 ? [...rawSlides].reverse() : [];
  const primaryColor = siteSettings?.primaryColor || propPrimaryColor;

  // ⏱️ অটো স্লাইডার টাইমার
  useEffect(() => {
    if (slides.length <= 1) return;
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [slides.length]);

  // 🎨 Dynamic Icon Renderer Logic
  const renderIcon = (svgCode?: string | null, imageUrl?: string | null) => {
    if (svgCode && svgCode.trim() !== "") {
      return (
        <div
          className="ml-1 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shrink-0 text-white [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current [&>svg]:stroke-current"
          dangerouslySetInnerHTML={{ __html: svgCode }}
        />
      );
    }
    if (imageUrl && imageUrl.trim() !== "") {
      return (
        <img
          src={imageUrl}
          alt="Button Icon"
          className="ml-1 w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0"
        />
      );
    }
    return (
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 16 16"
        className="ml-1 text-xl sm:text-2xl text-white shrink-0"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.287 5.906q-1.168.486-4.666 2.01-.567.225-.595.442c-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294q.39.01.868-.32 3.269-2.206 3.374-2.23c.05-.012.12-.026.166.016s.042.12.037.141c-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8 8 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629q.14.092.27.187c.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.4 1.4 0 0 0-.013-.315.34.34 0 0 0-.114-.217.53.53 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09"></path>
      </svg>
    );
  };

  const finalNoticeText =
    siteSettings?.noticeText ||
    propNoticeText ||
    "অনলাইনে অর্ডার করার পর কোনো সমস্যা হলে সাপোর্ট গ্রুপে যোগাযোগ করুন।";

  const isBtn1Visible = siteSettings?.isHeroBtn1Visible ?? true;
  const isBtn2Visible = siteSettings?.isHeroBtn2Visible ?? true;

  return (
    <div className="w-full space-y-4 block clear-both select-none">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;700&display=swap');

        .noto-sans-bengali {
          font-family: 'Noto Sans Bengali', sans-serif;
          font-weight: 400;
        }

        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        @keyframes rotateGradientAngle {
          to {
            --angle: 360deg;
          }
        }

        .shimmer-pill-border {
          border-radius: 9999px;
          padding: 2px;
          background: conic-gradient(
            from var(--angle),
            transparent 20%,
            ${primaryColor} 65%,
            #ffffff 85%,
            ${primaryColor} 95%,
            transparent 100%
          );
          animation: rotateGradientAngle 3.5s linear infinite;
        }

        .liquid-glass-inner {
          border-radius: 9999px;
          background: rgba(18, 16, 28, 0.75);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.25),
            0 8px 32px 0 rgba(0, 0, 0, 0.5);
        }

        @keyframes slideUpBadge {
          0% {
            transform: translateY(50px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .badge-slide-up {
          animation: slideUpBadge 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes playPulse {
          0% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 0 0 ${primaryColor}80; }
          70% { transform: translate(-50%, -50%) scale(1.08); box-shadow: 0 0 0 15px rgba(0, 0, 0, 0); }
          100% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
        }
        .play-btn-animate {
          animation: playPulse 2s infinite ease-in-out;
        }
      `,
        }}
      />

      {/* 🔵 নোটিশ বক্স */}
      {showNotice && (
        <div
          style={{ backgroundColor: primaryColor }}
          className="relative text-white p-4 pr-9 rounded-md text-left shadow-sm"
        >
          <button
            onClick={() => setShowNotice(false)}
            aria-label="Close notice"
            className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="w-3 h-3"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <h2 className="font-hind text-[14px] sm:text-base font-bold mb-1.5 text-white">
            Notice
          </h2>
          <p className="noto-sans-bengali text-[12px] sm:text-[13px] leading-relaxed text-white/95">
            {finalNoticeText}
          </p>
        </div>
      )}

      {/* Hero Slider Container */}
      <div className="w-full aspect-[1080/512] sm:aspect-[2.4/1] rounded-xl sm:rounded-2xl relative overflow-hidden bg-slate-900 shadow-sm">
        {slides.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
            Loading Slides...
          </div>
        ) : (
          slides.map((slide, index) => {
            const isActive = index === currentSlide;

            return (
              <div
                key={slide.id || index}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                {/* BANNER */}
                {slide.type === "BANNER" && (
                  slide.link ? (
                    <a href={slide.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                      <img
                        src={slide.imageUrl}
                        alt="Banner Slide"
                        draggable="false"
                        fetchPriority={index === 0 ? "high" : "auto"}
                        className="w-full h-full object-cover select-none cursor-pointer"
                      />
                    </a>
                  ) : (
                    <img
                      src={slide.imageUrl}
                      alt="Banner Slide"
                      draggable="false"
                      fetchPriority={index === 0 ? "high" : "auto"}
                      className="w-full h-full object-cover select-none"
                    />
                  )
                )}

                {/* VIDEO */}
                {slide.type === "VIDEO" && (
                  <a
                    href={slide.videoUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block w-full h-full group"
                  >
                    <img
                      src={slide.imageUrl}
                      alt="Video Slide"
                      draggable="false"
                      fetchPriority={index === 0 ? "high" : "auto"}
                      className="w-full h-full object-cover select-none"
                    />
                    <div
                      style={{ backgroundColor: primaryColor }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 play-btn-animate px-3.5 py-2 sm:px-6 sm:py-3.5 rounded-lg flex items-center justify-center gap-2 text-white shadow-md border border-white/30 cursor-pointer"
                    >
                      <svg className="w-5 h-5 sm:w-8 sm:h-8 fill-current" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </a>
                )}

                {/* SOCIAL */}
                {slide.type === "SOCIAL" && (
                  <a
                    href={slide.socialUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block w-full h-full group"
                  >
                    <img
                      src={slide.imageUrl}
                      alt={slide.title || "Social Slide"}
                      draggable="false"
                      fetchPriority={index === 0 ? "high" : "auto"}
                      className="w-full h-full object-cover select-none"
                    />

                    {isActive && (
                      <div className="absolute bottom-4 sm:bottom-6 right-3 sm:right-6 flex justify-end items-center z-20 pointer-events-none">
                        <div className="badge-slide-up pointer-events-auto">
                          <div className="shimmer-pill-border shadow-md">
                            <div className="liquid-glass-inner text-white px-3.5 py-1.5 sm:px-6 sm:py-2.5 flex items-center justify-center">
                              <span className="text-[10px] sm:text-sm font-bold tracking-wide whitespace-nowrap drop-shadow-md">
                                {slide.title}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </a>
                )}
              </div>
            );
          })
        )}

        {/* Slider Dots */}
        {slides.length > 0 && (
          <div className="absolute bottom-2.5 sm:bottom-3.5 left-0 right-0 flex justify-center z-30 pointer-events-none">
            <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 pointer-events-auto">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                    currentSlide === index
                      ? "w-5 sm:w-6 bg-white"
                      : "w-1.5 sm:w-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 🔘 Dynamic Buttons Section */}
      {(isBtn1Visible || isBtn2Visible) && (
        <div className="flex justify-start gap-2 sm:gap-4 mt-0">
          {/* Button 1 */}
          {isBtn1Visible && (
            <a
              href={siteSettings?.heroBtn1Link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: primaryColor }}
              className="flex items-center gap-1.5 sm:gap-2 text-white rounded-md hover:opacity-90 transition"
            >
              <div className="[width:clamp(110px,32vw,225px)] [height:clamp(38px,10vw,47px)] flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2">
                {renderIcon(siteSettings?.heroBtn1Svg, siteSettings?.heroBtn1ImageUrl)}
                <div className="flex flex-col leading-tight overflow-hidden">
                  <span className="[font-size:clamp(8px,2.2vw,10px)] font-light opacity-80 uppercase p-0 truncate">
                    {siteSettings?.heroBtn1Subtitle || "SUPPORT"}
                  </span>
                  <span className="[font-size:clamp(11px,3vw,14px)] font-bold p-0 truncate">
                    {siteSettings?.heroBtn1Title || "Telegram"}
                  </span>
                </div>
              </div>
            </a>
          )}

          {/* Button 2 */}
          {isBtn2Visible && (
            <a
              href={siteSettings?.heroBtn2Link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: primaryColor }}
              className="flex items-center gap-1.5 sm:gap-2 text-white rounded-md hover:opacity-90 transition"
            >
              <div className="[width:clamp(110px,32vw,225px)] [height:clamp(38px,10vw,47px)] flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2">
                {renderIcon(siteSettings?.heroBtn2Svg, siteSettings?.heroBtn2ImageUrl)}
                <div className="flex flex-col leading-tight overflow-hidden">
                  <span className="[font-size:clamp(8px,2.2vw,10px)] font-light opacity-80 uppercase p-0 truncate">
                    {siteSettings?.heroBtn2Subtitle || "GROUP"}
                  </span>
                  <span className="[font-size:clamp(11px,3vw,14px)] font-bold p-0 truncate">
                    {siteSettings?.heroBtn2Title || "Telegram"}
                  </span>
                </div>
              </div>
            </a>
          )}
        </div>
      )}
    </div>
  );
}