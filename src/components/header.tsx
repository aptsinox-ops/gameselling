"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface HeaderProps {
  siteName?: string;
  logoUrl?: string | null;
  logo?: string | null; 
  primaryColor?: string;
}

export default function Header({ 
  siteName = "Store", 
  logoUrl, 
  logo, 
  primaryColor
}: HeaderProps) {
  const { data: session, status } = useSession();
  const [liveBalance, setLiveBalance] = useState<number | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  // 🟢 কালার না পেলে বা লোড না হলে ডিফল্ট Black (#000000) সেট হবে
  const activeColor = primaryColor && primaryColor.trim() !== "" ? primaryColor : "#000000";

  // ⚡ লাইভ ব্যালেন্স ব্যাকগ্রাউন্ডে ফেচ করার লজিক
  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchLiveBalance = async () => {
      try {
        const res = await fetch('/api/users/balance', {
          cache: 'no-store'
        }); 
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.balance === 'number') {
            setLiveBalance(data.balance);
          }
        }
      } catch (err) {
        console.error("Failed to fetch live balance:", err);
      }
    };

    fetchLiveBalance();
    const interval = setInterval(fetchLiveBalance, 5000);
    return () => clearInterval(interval);
  }, [session?.user?.email]); 

  const finalLogoUrl = logoUrl || logo;
  const finalSiteName = siteName;

  useEffect(() => {
    setImageError(false);
  }, [finalLogoUrl]);

  const balance = liveBalance !== null ? liveBalance : (session?.user?.balance ?? 0);
  const currentUserName = session?.user?.name || "User";
  const currentUserEmail = session?.user?.email || "user@gmail.com";
  const firstLetter = currentUserName.trim() ? currentUserName.trim().charAt(0).toUpperCase() : "A";

  return (
    <header className="fixed top-0 w-full z-50 border-b border-gray-200 h-14 sm:h-16 md:h-20 bg-white/90 backdrop-blur-sm flex items-center">
      <div className="max-w-[1240px] w-full mx-auto px-2.5 sm:px-4 md:px-6 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Logo Section - ছোট মোবাইলের জন্য স্কেল করা হয়েছে */}
        <Link href="/" className="flex items-center shrink-0 max-w-[130px] xs:max-w-[170px] sm:max-w-[220px] md:max-w-[280px]">
          {finalLogoUrl && !imageError ? (
            <Image 
              src={finalLogoUrl} 
              alt={finalSiteName} 
              width={280} 
              height={80} 
              priority
              unoptimized={finalLogoUrl.startsWith('/')}
              onError={() => setImageError(true)} 
              className="h-8 sm:h-10 md:h-12 w-auto max-w-full object-contain object-left"
            />
          ) : (
            <span className="font-black tracking-tight text-neutral-900 text-base sm:text-xl md:text-2xl truncate">
              {finalSiteName}
            </span>
          )}
        </Link>

        {/* Navigation & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6 shrink-0">
          <nav className="hidden md:flex items-center gap-6 text-sm cursor-pointer font-semibold text-gray-700">
            <a href="/contact" className="hover:text-blue-600 transition-colors">Contact Us</a>
          </nav>

          {/* ⚡ সেশন লোডিং স্টেট */}
          {status === "loading" ? (
            <div className="h-8 w-16 sm:h-9 sm:w-20 bg-gray-100 animate-pulse rounded-full sm:rounded-lg" />
          ) : session ? (
            <div className="flex items-center gap-1.5 sm:gap-3">
              
              {/* Balance Badge - স্কেল করা সাইজ */}
              <div 
                style={{ backgroundColor: activeColor }}
                className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-black/5 min-w-[60px] sm:min-w-[75px] justify-center text-white shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wallet w-3.5 h-3.5 sm:w-4 sm:h-4"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path><path d="M3 5v14a2 2 0 0 1 2 2h15a1 1 0 0 1 1 1v-4"></path></svg> 
                <span className="text-xs sm:text-sm font-bold tracking-tight">
                  ৳{balance}
                </span>
              </div>

              {/* Controlled Sheet / Mobile Drawer */}
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <div className="relative flex items-center cursor-pointer select-none">
                    <Avatar className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border border-gray-200">
                      <AvatarImage 
                        src={session.user?.image || ""} 
                        alt={currentUserName} 
                        className="object-cover"
                      />
                      <AvatarFallback 
                        style={{ backgroundColor: activeColor }} 
                        className="text-white font-bold text-sm sm:text-base md:text-xl uppercase"
                      >
                        {firstLetter}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 block h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-green-500 ring-2 ring-white" />
                  </div>
                </SheetTrigger>

                <SheetContent side="right" className="w-[280px] xs:w-[320px] sm:w-[380px] max-w-[85vw] p-0 pt-4 sm:pt-5 bg-white border-l border-gray-100 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 pb-4 sm:pb-6 border-b border-gray-100">
                      <div className="relative select-none shrink-0">
                        <Avatar className="w-11 h-11 sm:w-14 sm:h-14 border border-gray-200">
                          <AvatarImage src={session.user?.image || ""} alt={currentUserName} className="object-cover" />
                          <AvatarFallback 
                            style={{ backgroundColor: activeColor }} 
                            className="text-white font-bold text-lg sm:text-2xl uppercase"
                          >
                            {firstLetter}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 block h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-green-500 ring-2 ring-white" />
                      </div>
                      <div className="flex flex-col truncate">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight truncate">{currentUserName}</h3>
                        <p className="text-xs text-gray-500 truncate">{currentUserEmail}</p>
                      </div>
                    </div>

                    <div className="p-2 sm:p-4 flex flex-col gap-0.5 sm:gap-1">
                      <Link 
                        href="/profile" 
                        onClick={() => setIsSheetOpen(false)}
                        className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-gray-700 font-semibold text-xs sm:text-sm hover:bg-gray-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        My Profile
                      </Link>

                      <Link 
                        href="/myorder" 
                        onClick={() => setIsSheetOpen(false)}
                        className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-gray-700 font-semibold text-xs sm:text-sm hover:bg-gray-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-bag"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                        My Order
                      </Link>

                      <Link 
                        href="/code" 
                        onClick={() => setIsSheetOpen(false)}
                        className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-gray-700 font-semibold text-xs sm:text-sm hover:bg-gray-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-code-2"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
                        My Code
                      </Link>

                      <Link 
                        href="/add-money" 
                        onClick={() => setIsSheetOpen(false)}
                        className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-gray-700 font-semibold text-xs sm:text-sm hover:bg-gray-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-plus"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                        Add Money
                      </Link>

                      <Link 
                        href="/contact" 
                        onClick={() => setIsSheetOpen(false)}
                        className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-gray-700 font-semibold text-xs sm:text-sm hover:bg-gray-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        Contact Us
                      </Link>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 border-t border-gray-100">
                    <button 
                      onClick={() => {
                        setIsSheetOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-red-600 hover:bg-red-50 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                      LOGOUT
                    </button>
                  </div>
                </SheetContent>
              </Sheet>

            </div>
          ) : (
            <Link href="/login">
              <button 
                style={{ backgroundColor: activeColor }}
                className="py-1.5 px-3 sm:py-2 sm:px-5 text-xs sm:text-sm cursor-pointer text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
              >
                Login
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}