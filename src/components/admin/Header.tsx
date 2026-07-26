"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "next-themes";
import { ModeToggle } from "../ui/mode-toggle";
import { ThemeSelector } from "../theme-selector";

interface HeaderProps {
  initialSiteName?: string;
  initialLogoUrl?: string | null;
}

export default function Header({ initialSiteName, initialLogoUrl }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Dynamic Site Settings State
  const [siteName, setSiteName] = useState<string>(initialSiteName || "DEMO BAZAR");
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl || null);

  // ক্লায়েন্ট সাইড রেন্ডারিং ও সাইট সেটিংস ফেচ করা
  useEffect(() => {
    setMounted(true);

    // Site Settings Fetch (যদি props না পাঠানো হয়ে থাকে)
    if (!initialSiteName) {
      const fetchSiteSettings = async () => {
        try {
          const res = await fetch("/api/settings"); // আপনার সেটিংস API রুট অনুযায়ী পরিবর্তন করতে পারেন
          if (res.ok) {
            const data = await res.json();
            if (data?.siteName) setSiteName(data.siteName);
          }
        } catch (error) {
          console.error("Failed to fetch site settings:", error);
        }
      };

      fetchSiteSettings();
    }

    // Scroll Handler
    const scrollContainer = document.querySelector("[data-sidebar-inset='true']") || window;

    const handleScroll = () => {
      const scrollY = scrollContainer === window ? window.scrollY : (scrollContainer as HTMLElement).scrollTop;
      setIsScrolled(scrollY > 20);
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    window.addEventListener("scroll", handleScroll);

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [initialSiteName]);

  return (
    <header 
      className="w-full bg-white/75 dark:bg-[#080708]/80 backdrop-blur-md border-b border-neutral-200/50 dark:border-white/10 sticky top-0 z-40 shrink-0 transition-all duration-300 ease-in-out font-sans"
      style={{ height: isScrolled ? "60px" : "80px" }}
    >
      <div className="w-full px-6 h-full flex items-center justify-between">
        
        {/* Left Side: Sidebar Trigger, Dynamic Logo & Site Name */}
        <div className="flex items-center gap-3">
          <SidebarTrigger 
            className={`bg-neutral-50 dark:bg-neutral-900/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-xl transition-all duration-300 ${
              isScrolled ? "w-[36px] h-[36px]" : "w-[44px] h-[44px]"
            }`} 
          />
          
          <div className="flex items-center gap-2">

            {/* Dynamic Site Name */}
            <h1 
              className={`font-bold text-neutral-900 dark:text-white tracking-tighter transition-all duration-300 ${
                isScrolled ? "text-lg" : "text-xl"
              }`}
            >
              {siteName}
            </h1>
          </div>
        </div>
        
        {/* Right Side: Theme Toggle & Profile */}
        <div className="flex items-center gap-4 text-neutral-900 dark:text-white [&_svg]:text-neutral-900 dark:[&_svg]:text-white">
          <ThemeSelector />
          <ModeToggle />

          {/* Profile Circle */}
          <div 
            className={`rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-900 dark:text-white font-bold border border-neutral-200 dark:border-neutral-800 transition-all duration-300 ${
              isScrolled ? "w-8 h-8 text-xs" : "w-9 h-9 text-sm"
            }`}
          >
            A
          </div>
        </div>

      </div>
    </header>
  );
}