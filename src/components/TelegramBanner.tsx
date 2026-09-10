import React from "react";

interface TelegramBannerProps {
  username?: string | null;
  primaryColor?: string;
}

export default function TelegramBanner({
  username,
  primaryColor = "#2563eb",
}: TelegramBannerProps) {
  // username না থাকলে, খালি থাকলে বা '#' হলে দেখাবে না
  if (!username || username.trim() === "" || username.trim() === "#") {
    return null;
  }

  // Telegram Link ফরম্যাট করা
  const cleanUsername = username.trim().replace(/^@/, "");
  const telegramUrl = username.startsWith("http")
    ? username
    : `https://t.me/${cleanUsername}`;

  return (
    <div className="w-full max-w-7xl mx-auto my-2 sm:my-4 px-2 sm:px-4">
      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-between w-full px-3 py-2.5 xs:px-4 xs:py-3 sm:py-3.5 rounded-lg xs:rounded-xl text-white transition-all duration-300 ease-in-out hover:scale-[1.01] active:scale-[0.98] cursor-pointer overflow-hidden min-h-[56px] xs:min-h-[64px]"
        style={{ backgroundColor: primaryColor }}
      >
        {/* Left Side: Telegram Icon Box & Titles */}
        <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 z-10 min-w-0 pr-2">
          {/* Telegram Icon Container */}
          <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-lg xs:rounded-xl sm:rounded-2xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
            <svg
              className="w-4 h-4 xs:w-5 xs:h-5 sm:w-7 sm:h-7 fill-white shrink-0"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
          </div>

          {/* Text Container */}
          <div className="flex flex-col justify-center min-w-0">
            <h3 className="text-xs xs:text-sm sm:text-base md:text-lg font-extrabold text-white leading-tight truncate">
              Join Telegram
            </h3>
            <p className="text-[10px] xs:text-xs sm:text-sm font-medium text-white/80 leading-tight truncate mt-0.5">
              Offers & Updates
            </p>
          </div>
        </div>

        {/* Right Side: Action Pill Badge */}
        <div className="flex items-center gap-1 xs:gap-1.5 bg-white/20 group-hover:bg-white/30 backdrop-blur-md px-2 py-1 xs:px-3 xs:py-1.5 rounded-full text-white transition-colors duration-200 z-10 shrink-0">
          <svg className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 fill-white shrink-0" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
          </svg>
          <svg
            className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-white stroke-[3] shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </div>
      </a>
    </div>
  );
}