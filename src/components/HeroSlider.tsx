"use client";
import React, { useState, useEffect, useRef } from "react";

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

  const rawSlides = initialSlides && initialSlides.length > 0 ? initialSlides : sliders;
  const slides = rawSlides.length > 0 ? [...rawSlides].reverse() : [];
  const primaryColor = siteSettings?.primaryColor || propPrimaryColor;

  const footerTopColor = siteSettings?.footerTopColor || "#061124";
  const footerBottomColor = siteSettings?.footerBottomColor || "#1a3b7b";

  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;

    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    } else if (isRightSwipe) {
      setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  useEffect(() => {
    if (slides.length <= 1) return;
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [slides.length]);

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
    <div className="w-full space-y-3 block clear-both select-none">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;700&display=swap');

        .noto-sans-bengali {
          font-family: 'Noto Sans Bengali', sans-serif;
          font-weight: 400;
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

        @keyframes playShadowExpand {
          0% {
            transform: scale(0.92);
            opacity: 0.65;
          }
          100% {
            transform: scale(1.48);
            opacity: 0;
          }
        }
        .play-shadow-pulse {
          animation: playShadowExpand 1.8s infinite cubic-bezier(0.2, 0.8, 0.2, 1);
        }
      `,
        }}
      />

      {/* Notice Box */}
      {showNotice && (
        <div
          style={{ 
            backgroundColor: primaryColor,
            borderColor: 'rgba(255, 255, 255, 0.2)' 
          }}
          className="relative text-white p-2.5 pr-8 xs:p-3 xs:pr-9 sm:p-3.5 sm:pr-10 rounded-lg border text-left transition-all backdrop-blur-sm"
        >
          <button
            onClick={() => setShowNotice(false)}
            aria-label="Close notice"
            className="absolute top-2.5 right-2.5 xs:top-3 xs:right-3 w-5 h-5 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 active:scale-95 transition-all shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="w-3 h-3 text-white"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-1.5 mb-1">
            <h2 className="font-hind text-xs xs:text-[13px] sm:text-sm font-bold text-white leading-none uppercase tracking-wide">
              Notice
            </h2>
          </div>

          <p className="noto-sans-bengali text-[11px] xs:text-[12px] sm:text-[13px] leading-relaxed text-white/90 break-words font-normal">
            {finalNoticeText}
          </p>
        </div>
      )}

      {/* Hero Slider Container */}
      <div className="w-full flex flex-col gap-1.5">
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full aspect-[1080/512] sm:aspect-[2.4/1] rounded-xl sm:rounded-2xl relative overflow-hidden bg-slate-900 shadow-sm touch-pan-y"
        >
          {slides.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
              Loading Slides...
            </div>
          ) : (
            slides.map((slide, index) => {
              const isActive = index === currentSlide;
              const offsetPercentage = (index - currentSlide) * 100;

              return (
                <div
                  key={slide.id || index}
                  style={{
                    transform: `translateX(${offsetPercentage}%)`,
                    transition: "transform 400ms cubic-bezier(0.25, 1, 0.5, 1)",
                    willChange: "transform",
                  }}
                  className="absolute inset-0 w-full h-full transform-gpu"
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

                  {/* VIDEO SLIDE */}
                  {slide.type === "VIDEO" && (
                    <a
                      href={slide.videoUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative w-full h-full flex items-center justify-center group"
                    >
                      <img
                        src={slide.imageUrl}
                        alt="Video Slide"
                        draggable="false"
                        fetchPriority={index === 0 ? "high" : "auto"}
                        className="w-full h-full object-cover select-none"
                      />

                      {/* Play Button Container */}
                      <div className="absolute flex items-center justify-center">
                        <div
                          style={{
                            background: `linear-gradient(to bottom, ${footerTopColor}, ${footerBottomColor})`,
                          }}
                          className="absolute inset-0 rounded-full play-shadow-pulse pointer-events-none"
                        />

                        {/* Outer Circle Container */}
                        <div
                          style={{
                            background: `linear-gradient(to bottom, ${footerTopColor}, ${footerBottomColor})`,
                          }}
                          className="relative w-[50px] h-[50px] xs:w-[50px] xs:h-[50px] sm:w-[68px] sm:h-[68px] rounded-full flex items-center justify-center text-white shadow-xl cursor-pointer transition-transform duration-200 group-hover:scale-105 shrink-0"
                        >
                          <svg
                            viewBox="0 0 448 512"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                            className="w-[18px] h-[20px] xs:w-[20px] xs:h-[22px] sm:w-[22px] sm:h-[25px] fill-current text-white translate-x-[1.5px] shrink-0"
                          >
                            <path d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z" />
                          </svg>
                        </div>
                      </div>
                    </a>
                  )}

                  {/* SOCIAL SLIDE */}
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
                        <div className="absolute bottom-3 sm:bottom-6 right-3 sm:right-6 flex justify-end items-center z-20 pointer-events-none">
                          <div className="badge-slide-up pointer-events-auto">
                            <div 
                              style={{
                                background: `linear-gradient(to bottom, ${footerTopColor}, ${footerBottomColor})`,
                              }}
                              className="rounded-full text-white px-3.5 py-1.5 sm:px-6 sm:py-2.5 flex items-center justify-center shadow-lg"
                            >
                              <span className="[font-size:clamp(10px,2.5vw,14px)] font-bold tracking-wide whitespace-nowrap">
                                {slide.title}
                              </span>
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
        </div>

        {/* Indicators */}
        {slides.length > 0 && (
          <div className="flex justify-center items-center gap-2 py-0 my-0.5">
            {slides.map((_, index) => {
              const isSelected = currentSlide === index;

              return (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  style={{
                    willChange: "transform, opacity, background",
                    transition: "transform 250ms ease, opacity 250ms ease, background 250ms ease",
                    background: isSelected
                      ? `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}CC 100%)`
                      : `linear-gradient(135deg, ${primaryColor}40 0%, ${primaryColor}20 100%)`,
                  }}
                  className={`w-3 h-3 rounded-full cursor-pointer transform-gpu shrink-0 ${
                    isSelected
                      ? "scale-110 opacity-100 shadow-sm"
                      : "scale-75 opacity-50 hover:opacity-80"
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Buttons */}
      {(isBtn1Visible || isBtn2Visible) && (
        <div className="flex justify-start gap-2 sm:gap-4 mt-0">
          {isBtn1Visible && (
            <a
              href={siteSettings?.heroBtn1Link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: primaryColor }}
              className="flex items-center gap-1.5 sm:gap-2 text-white rounded-md hover:opacity-90 transition"
            >
              <div className="[width:clamp(110px,32vw,225px)] [height:clamp(37px,10vw,47px)] flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2">
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