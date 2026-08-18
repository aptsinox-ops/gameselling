"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "next-themes";
import { 
  Sun, 
  Moon, 
  HelpCircle, 
  User, 
  LayoutDashboardIcon, 
  SettingsIcon, 
  BoxIcon, 
  User2 
} from "lucide-react";
import { ThemeSelector } from "../theme-selector";

interface HeaderProps {
  initialSiteName?: string;
  initialLogoUrl?: string | null;
}

const profileMenuItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboardIcon },
  { title: "Website Setting", url: "/admin/settings", icon: SettingsIcon },
  { title: "Orders", url: "/admin/orders", icon: BoxIcon },
  { title: "Users", url: "/admin/users", icon: User2 },
];

export default function Header({ initialSiteName, initialLogoUrl }: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [siteName, setSiteName] = useState<string>(initialSiteName || "DEMO BAZAR");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!initialSiteName) {
      const fetchSiteSettings = async () => {
        try {
          const res = await fetch("/api/settings");
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
  }, [initialSiteName]);

  // Dynamic WhatsApp Support Link Generator
  const whatsappNumber = "8801322104655";
  const supportMessage = `I want Help my Website My Website is ${siteName} Can You Help me?`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(supportMessage)}`;

  return (
    <header className="sticky top-0 z-40 h-16 md:h-20 w-full shrink-0 border-b border-neutral-200/60 bg-white/80 backdrop-blur-md transition-all duration-300 dark:border-neutral-800/60 dark:bg-neutral-950/80 font-sans">
      <div className="flex h-full w-full items-center justify-between gap-2 px-2.5 sm:px-6 overflow-hidden">
        
        {/* Left Side: Sidebar Trigger & Site Name */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
          <SidebarTrigger className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white transition-all duration-200" />
          <h1 className="min-w-0 truncate [font-size:clamp(12px,3.6vw,18px)] font-bold tracking-tight leading-tight text-neutral-900 dark:text-white">
            {siteName}
          </h1>
        </div>
        
        {/* Right Side: Theme Selector, Day/Night Toggle & User Options */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          
          {/* ThemeSelector */}
          <div className="shrink-0 [&_button]:text-[11px] sm:[&_button]:text-xs [&_button]:px-2 sm:[&_button]:px-3.5">
            <ThemeSelector />
          </div>

          {/* Day / Night Toggle Switch */}
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="relative flex h-8 sm:h-9 items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100/80 px-2.5 sm:px-3.5 text-[11px] sm:text-xs font-semibold text-neutral-800 transition-all duration-300 hover:bg-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 cursor-pointer shrink-0"
              aria-label="Toggle Theme"
            >
              <div className="relative h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0">
                <Sun className="absolute inset-0 h-3.5 w-3.5 sm:h-4 sm:w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-neutral-900 dark:text-neutral-100" />
                <Moon className="absolute inset-0 h-3.5 w-3.5 sm:h-4 sm:w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-neutral-900 dark:text-neutral-100" />
              </div>
              <span className="hidden xs:inline">{resolvedTheme === "dark" ? "Night" : "Day"}</span>
            </button>
          )}

          {/* WhatsApp Support Direct Link */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 sm:h-9 sm:w-auto items-center justify-center gap-1.5 rounded-lg px-0 sm:px-3 text-xs font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white transition-all shrink-0"
          >
            <HelpCircle className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Support</span>
          </a>

          {/* User Profile Avatar with Hover & Click Dropdown */}
          <div 
            className="relative shrink-0"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button 
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all"
            >
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>

            {/* Profile Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-1.5 shadow-xl transition-all duration-200 z-50 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1.5 text-[10px] font-semibold tracking-wider uppercase text-neutral-400 dark:text-neutral-500 border-b border-neutral-100 dark:border-neutral-800/60 mb-1">
                  User Menu
                </div>
                {profileMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.url;

                  return (
                    <Link
                      key={item.url}
                      href={item.url}
                      onClick={() => setIsDropdownOpen(false)}
                      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-primary/30 text-primary font-semibold border border-primary/20 backdrop-blur-sm"
                          : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 hover:text-neutral-900 dark:hover:text-white"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-neutral-400"}`} />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}