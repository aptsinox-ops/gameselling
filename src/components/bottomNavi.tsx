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
  const [primaryColor, setPrimaryColor] = useState<string>("#00d2ff");
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

          // 2. Status: ON Filter & Sorting
          let filtered = dataArray
            .filter((item) => item && item.status === "ON")
            .sort((a, b) => (a.slot || 0) - (b.slot || 0));

          // 3. TargetAudience Filter (ALL, USER, GUEST)
          const isLoggedIn = authStatus === "authenticated" || !!session?.user;

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

  // Dynamic Icon Renderer Function (Lucide + SVG + Image URL)
  const renderIcon = (iconStr: string) => {
    if (!iconStr) return <LucideIcons.Circle className="w-5 h-5" />;

    const trimmed = iconStr.trim();

    // Option A: Raw SVG Code
    if (trimmed.toLowerCase().includes("<svg")) {
      return (
        <div
          className="w-5 h-5 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5 [&>svg]:fill-current"
          dangerouslySetInnerHTML={{ __html: trimmed }}
        />
      );
    }

    // Option B: Image URL / Path
    if (trimmed.startsWith("http") || trimmed.startsWith("/")) {
      return (
        <img
          src={trimmed}
          alt="nav-icon"
          className="w-5 h-5 object-contain"
        />
      );
    }

    // Option C: Lucide Icon Name (e.g. "Home", "ShoppingBag", "User")
    const IconComponent = (LucideIcons as Record<string, React.ElementType>)[trimmed];

    if (IconComponent) {
      return <IconComponent className="w-5 h-5 stroke-[2]" />;
    }

    // Fallback Icon
    return <LucideIcons.LayoutGrid className="w-5 h-5" />;
  };

  if (loading) return null;
  if (navList.length === 0) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-4 flex justify-start items-center gap-6 z-50 md:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.06)] overflow-x-auto">
      {navList.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname && item.href && pathname.startsWith(item.href);

        return (
          <Link
            key={item.id}
            href={item.href || "/"}
            className="flex flex-col items-center gap-1 min-w-[50px] transition-all duration-200"
            style={{
              color: isActive ? primaryColor : "#64748b",
            }}
          >
            <div className="transition-transform duration-200 active:scale-90">
              {renderIcon(item.icon)}
            </div>

            <span
              className={`text-[10px] sm:text-[11px] leading-none tracking-tight ${
                isActive ? "font-bold" : "font-medium"
              }`}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}