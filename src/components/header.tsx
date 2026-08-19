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
  primaryColor = "#00d2ff" 
}: HeaderProps) {
  const { data: session, status } = useSession();
  const [liveBalance, setLiveBalance] = useState<number | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  // ⚡ লাইভ ব্যালেন্স ব্যাকগ্রাউন্ডে ফেচ করার লজিক (ইনিশিয়াল ব্যালেন্স সেশন থেকে সাথে সাথে দেখাবে)
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

  // 🟢 সরাসরি প্রপস থেকে ডাটা সেট করা হচ্ছে (কোনো ক্লায়েন্ট ফেচিং ডিলে থাকবে না)
  const finalLogoUrl = logoUrl || logo;
  const finalSiteName = siteName;

  useEffect(() => {
    setImageError(false);
  }, [finalLogoUrl]);

  if (status === "loading") {
    return (
      <header className="fixed top-0 w-full h-16 md:h-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 flex items-center z-50">
        <div className="max-w-[1240px] w-full mx-auto px-4 md:px-6 flex items-center justify-between">
        </div>
      </header>
    );
  }

  const balance = liveBalance !== null ? liveBalance : (session?.user?.balance ?? 0);
  const currentUserName = session?.user?.name || "User";
  const currentUserEmail = session?.user?.email || "user@gmail.com";
  const firstLetter = currentUserName.trim() ? currentUserName.trim().charAt(0).toUpperCase() : "A";

  return (
    <header className="fixed top-0 w-full z-50 border-b border-gray-200 h-16 md:h-20 bg-white/90 backdrop-blur-sm flex items-center">
      <div className="max-w-[1240px] w-full mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center shrink-0 max-w-[180px] md:max-w-[280px]">
          {finalLogoUrl && !imageError ? (
            <Image 
              src={finalLogoUrl} 
              alt={finalSiteName} 
              width={280} 
              height={80} 
              priority
              unoptimized={finalLogoUrl.startsWith('/')}
              onError={() => setImageError(true)} 
              className="h-10 md:h-12 w-auto max-w-full object-contain object-left"
            />
          ) : (
            <span className="font-black tracking-tight text-neutral-900 text-xl md:text-2xl">
              {finalSiteName}
            </span>
          )}
        </Link>

        {/* Navigation & Action Buttons */}
        <div className="flex items-center gap-4 md:gap-6 shrink-0">
          <nav className="hidden md:flex items-center gap-6 text-sm cursor-pointer font-semibold text-gray-700">
            <a href="/contact" className="hover:text-blue-600">Contact Us</a>
          </nav>

          {session ? (
            <div className="flex items-center gap-3">
              
              {/* Balance Layout */}
              <div 
                style={{ backgroundColor: primaryColor }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-black/5 min-w-[75px] justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wallet w-4 h-4"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path></svg> 
                <span className="text-sm font-bold text-white tracking-tight">
                  ৳{balance}
                </span>
              </div>

              {/* Controlled Sheet */}
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <div className="relative flex items-center cursor-pointer select-none">
                    <Avatar className="w-11 h-11 md:w-12 md:h-12 border border-gray-200">
                      <AvatarImage 
                        src={session.user?.image || ""} 
                        alt={currentUserName} 
                        className="object-cover"
                      />
                      <AvatarFallback 
                        style={{ backgroundColor: primaryColor }} 
                        className="text-white font-bold text-xl uppercase"
                      >
                        {firstLetter}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
                  </div>
                </SheetTrigger>

                <SheetContent side="right" className="w-[320px] sm:w-[380px] p-0 pt-[20px] bg-white border-l border-gray-100 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 px-6 pb-6 border-b border-gray-100">
                      <div className="relative select-none">
                        <Avatar className="w-14 h-14 border border-gray-200">
                          <AvatarImage src={session.user?.image || ""} alt={currentUserName} className="object-cover" />
                          <AvatarFallback 
                            style={{ backgroundColor: primaryColor }} 
                            className="text-white font-bold text-2xl uppercase"
                          >
                            {firstLetter}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-white" />
                      </div>
                      <div className="flex flex-col truncate">
                        <h3 className="text-lg font-bold text-gray-900 tracking-tight truncate">{currentUserName}</h3>
                        <p className="text-xs text-gray-500 truncate">{currentUserEmail}</p>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col gap-1">
                      <Link 
                        href="/profile" 
                        onClick={() => setIsSheetOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 font-semibold text-sm hover:bg-gray-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        My Profile
                      </Link>

                      <Link 
                        href="/myorder" 
                        onClick={() => setIsSheetOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 font-semibold text-sm hover:bg-gray-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-bag"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                        My Order
                      </Link>

                      <Link 
                        href="/code" 
                        onClick={() => setIsSheetOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 font-semibold text-sm hover:bg-gray-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-code-2"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
                        My Code
                      </Link>

                      <Link 
                        href="/add-money" 
                        onClick={() => setIsSheetOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 font-semibold text-sm hover:bg-gray-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-plus"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                        Add Money
                      </Link>

                      <Link 
                        href="/contact" 
                        onClick={() => setIsSheetOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 font-semibold text-sm hover:bg-gray-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        Contact Us
                      </Link>
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-100">
                    <button 
                      onClick={() => {
                        setIsSheetOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-bold text-sm cursor-pointer"
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
                style={{ backgroundColor: primaryColor }}
                className="py-2 px-5 text-sm cursor-pointer text-white font-bold rounded-lg"
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