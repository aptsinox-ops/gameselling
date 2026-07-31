"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import * as LucideIcons from "lucide-react";

interface NavItem {
  id: string;
  name: string;
  icon: string;
  href: string;
  slot: number;
  status: "ON" | "OFF";
  targetAudience: "ALL" | "GUEST" | "USER";
}

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session, status: authStatus } = useSession();

  const [navList, setNavList] = useState<NavItem[]>([]);
  const [primaryColor, setPrimaryColor] = useState<string>("#f97316");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Navigation Data Fetch
        const navRes = await fetch("/api/nav");
        if (navRes.ok) {
          const rawData = await navRes.json();
          const dataArray: NavItem[] = Array.isArray(rawData)
            ? rawData
            : rawData?.navigations || rawData?.data || [];

          // 2. Filter ON status and Sort by Slot
          let filtered = dataArray
            .filter((item) => item && item.status === "ON")
            .sort((a, b) => (a.slot || 0) - (b.slot || 0));

          // 3. Audience Filter
          const isLoggedIn = authStatus === "authenticated" || !!(session as any)?.user;

          filtered = filtered.filter((item) => {
            const audience = item.targetAudience || "ALL";
            if (audience === "ALL") return true;
            if (audience === "USER" && isLoggedIn) return true;
            if (audience === "GUEST" && !isLoggedIn) return true;
            return false;
          });

          setNavList(filtered);
        }

        // 4. Site Settings Color Fetch
        const settingsRes = await fetch("/api/settings");
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          const color = settings?.primaryColor || settings?.data?.primaryColor;
          if (color) setPrimaryColor(color);
        }
      } catch (error) {
        console.error("Failed to load bottom navigation:", error);
      } finally {
        setLoading(false);
      }
    };

    if (authStatus !== "loading") {
      fetchData();
    }
  }, [authStatus, session]);

  // Dynamic Icon Renderer Function
  const renderIcon = (iconStr: string, isActive: boolean) => {
    const currentColor = isActive ? primaryColor : "#64748b";
    if (!iconStr) return <LucideIcons.Circle className="w-5 h-5" style={{ color: currentColor }} />;

    const trimmed = iconStr.trim();

    // Option A: Inline SVG Code
    if (trimmed.toLowerCase().includes("<svg")) {
      return (
        <div
          className="w-5 h-5 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5 [&_svg_*]:fill-current [&_svg_*]:stroke-current"
          style={{ color: currentColor }}
          dangerouslySetInnerHTML={{ __html: trimmed }}
        />
      );
    }

    // Option B: Image URL / SVG Path
    if (trimmed.startsWith("http") || trimmed.startsWith("/")) {
      const maskStyle: React.CSSProperties = {
        backgroundColor: currentColor,
        WebkitMaskImage: `url("${trimmed}")`,
        maskImage: `url("${trimmed}")`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      };

      return <div className="w-5 h-5 transition-colors duration-200" style={maskStyle} />;
    }

    // Option C: Lucide Icon
    const IconComponent = (LucideIcons as unknown as Record<string, React.ElementType>)[trimmed];

    if (IconComponent) {
      return <IconComponent className="w-5 h-5 stroke-[2]" style={{ color: currentColor }} />;
    }

    return <LucideIcons.LayoutGrid className="w-5 h-5" style={{ color: currentColor }} />;
  };

  if (loading || navList.length === 0) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 h-17 px-1 flex items-center justify-around z-50 md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.04)] select-none">
      {navList.map((item) => {
        const isActive: boolean = Boolean(
          pathname &&
            item.href &&
            (item.href === "/"
              ? pathname === "/"
              : item.href !== "/" && pathname.startsWith(item.href))
        );

        const activeColor = isActive ? primaryColor : "#64748b";
        const isExternal = Boolean(item.href?.startsWith("http"));

        const navContent = (
          <div
            className="flex flex-col items-center justify-center gap-0.5 w-full h-full relative transition-all duration-200 active:scale-95 cursor-pointer"
            style={{ color: activeColor }}
          >
            {/* Icon */}
            <div className="flex items-center justify-center">
              {renderIcon(item.icon, isActive)}
            </div>

            {/* Label */}
            <span
              className={`text-[10px] leading-tight tracking-tight ${
                isActive ? "font-bold" : "font-medium"
              }`}
            >
              {item.name}
            </span>

            {/* Active Indicator Bar (Text er thik niche) */}
            {isActive && (
              <span
                className="w-3.5 h-[2.5px] rounded-full mt-0.5 transition-all duration-300"
                style={{ backgroundColor: primaryColor }}
              />
            )}
          </div>
        );

        if (isExternal) {
          return (
            <a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex justify-center items-center h-full"
            >
              {navContent}
            </a>
          );
        }

        return (
          <Link
            key={item.id}
            href={item.href || "/"}
            className="flex-1 flex justify-center items-center h-full"
          >
            {navContent}
          </Link>
        );
      })}
    </div>
  );
}