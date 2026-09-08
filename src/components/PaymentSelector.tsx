"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Info, RefreshCw, Lock, Wallet, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; 

interface PaymentSelectorProps {
  takaSvg: React.ReactNode;
  basePrice: number; 
  onChange?: (data: { paymentMethod: "wallet" | "instant"; totalPrice: number; userBalance: number; isLoadingBalance: boolean; quantity: number }) => void;
  primaryColor?: string;
  settings?: {
    walletPayBanner?: string | null;
    autoPaymentBanner?: string | null;
  };
}

const PaymentSelector = memo(function PaymentSelector({ 
  takaSvg, 
  basePrice: propBasePrice, 
  onChange,
  primaryColor = "#2563eb",
  settings: propSettings 
}: PaymentSelectorProps) {
  const router = useRouter();
  const { status } = useSession(); 
  const isLoggedIn = status === "authenticated";
  
  const [userBalance, setUserBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<"wallet" | "instant">("wallet");
  
  // 🟢 Quantity আপাতত ১ হিসেবে ফিক্সড রাখা হয়েছে
  const quantity = 1;
  const [livePrice, setLivePrice] = useState<number>(propBasePrice || 0);
  
  // 🟢 সেটিংসের জন্য স্টেট
  const [siteSettings, setSiteSettings] = useState<{
    walletPayBanner?: string | null;
    autoPaymentBanner?: string | null;
  } | null>(propSettings || null);

  // 🟢 প্রপ্স পরিবর্তন হলে সরাসরি স্টেট আপডেট
  useEffect(() => {
    if (propSettings) {
      setSiteSettings(propSettings);
    }
  }, [propSettings]);

  // 🟢 প্রপ্স না থাকলে ব্যাকগ্রাউন্ডে সেটিংস ফেচ
  useEffect(() => {
    if (propSettings) return;

    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings", { cache: "force-cache" });
        if (res.ok) {
          const data = await res.json();
          setSiteSettings(data);
        }
      } catch (err) {
        console.error("Failed to load site settings:", err);
      }
    };

    fetchSettings();
  }, [propSettings]);

  useEffect(() => {
    setLivePrice(propBasePrice);
  }, [propBasePrice]);

  useEffect(() => {
    const handlePriceChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.price !== undefined) {
        setLivePrice(customEvent.detail.price);
      }
    };
    window.addEventListener("variationPriceChange", handlePriceChange);
    return () => window.removeEventListener("variationPriceChange", handlePriceChange);
  }, []);

  const fetchLiveBalance = useCallback(async () => {
    if (!isLoggedIn) return;
    setIsLoadingBalance(true);
    try {
      const res = await fetch("/api/users/profile", { cache: "no-store" });
      const data = await res.json();
      if (data?.balance !== undefined) setUserBalance(data.balance);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) fetchLiveBalance();
  }, [isLoggedIn, fetchLiveBalance]);

  const totalPrice = useMemo(() => livePrice * quantity, [livePrice, quantity]);

  useEffect(() => {
    onChange?.({ paymentMethod: selectedMethod, totalPrice, userBalance, isLoadingBalance, quantity });
  }, [selectedMethod, totalPrice, userBalance, isLoadingBalance, quantity, onChange]);

  return (
    <div className="px-2 sm:px-3 pb-4 space-y-3 sm:space-y-4 bg-white rounded-b-md will-change-transform text-slate-800">
      
      {/* Payment Method Cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 max-w-xl mx-auto">
        
        {/* Wallet Pay Card */}
        <div
          onClick={() => setSelectedMethod("wallet")}
          style={selectedMethod === "wallet" ? { borderColor: primaryColor } : {}}
          className={`relative border rounded-md overflow-hidden cursor-pointer bg-white flex flex-col justify-between h-24 sm:h-28 md:h-[115px] transition-all duration-200 select-none ${
            selectedMethod === "wallet" ? "shadow-sm" : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="p-2 sm:p-2.5 flex flex-col items-center justify-center flex-1 overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              {siteSettings?.walletPayBanner ? (
                <img 
                  src={siteSettings.walletPayBanner} 
                  alt="Wallet Pay" 
                  loading="eager"
                  decoding="async"
                  // @ts-ignore
                  fetchPriority="high"
                  className="w-full h-full object-contain" 
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <Wallet className="w-6 h-6 sm:w-7 sm:h-7 mb-0.5" style={{ color: primaryColor }} />
                  <span className="text-[11px] sm:text-xs font-bold text-slate-700">Wallet</span>
                </div>
              )}
            </div>
          </div>
          
          <div 
            style={selectedMethod === "wallet" ? { backgroundColor: primaryColor } : {}}
            className={`relative text-[10px] sm:text-[11px] font-medium h-6 sm:h-7.5 flex items-center transition-colors duration-200 overflow-hidden ${
              selectedMethod === "wallet" ? "text-white" : "bg-slate-50 text-slate-400 border-t border-slate-100"
            }`}
          >
            <span className={`absolute transition-all duration-300 ease-in-out whitespace-nowrap ${
              selectedMethod === "wallet" ? "left-2.5 sm:left-3 translate-x-0 font-semibold" : "left-1/2 -translate-x-1/2"
            }`}>
              Wallet
            </span>
            <span className={`absolute right-2 sm:right-3 font-bold transition-all duration-300 ease-out flex items-center justify-center ${
              selectedMethod === "wallet" ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-75"
            }`}>
              <svg viewBox="-3.5 0 19 19" xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white">
                <path d="M4.63 15.638a1.028 1.028 0 0 1-.79-.37L.36 11.09a1.03 1.03 0 1 1 1.58-1.316l2.535 3.043L9.958 3.32a1.029 1.029 0 0 1 1.783 1.03L5.52 15.122a1.03 1.03 0 0 1-.803.511.89.89 0 0 1-.088.004z"/>
              </svg>
            </span>
          </div>
        </div>

        {/* Instant Pay Card */}
        <div
          onClick={() => setSelectedMethod("instant")}
          style={selectedMethod === "instant" ? { borderColor: primaryColor } : {}}
          className={`relative border rounded-md overflow-hidden cursor-pointer bg-white flex flex-col justify-between h-24 sm:h-28 md:h-[115px] transition-all duration-200 select-none ${
            selectedMethod === "instant" ? "shadow-sm" : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="p-2 sm:p-2.5 flex flex-col items-center justify-center flex-1 bg-slate-50/10 overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              {siteSettings?.autoPaymentBanner ? (
                <img 
                  src={siteSettings.autoPaymentBanner} 
                  alt="Instant Pay" 
                  loading="eager"
                  decoding="async"
                  // @ts-ignore
                  fetchPriority="high"
                  className="w-full h-full object-contain" 
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <Zap className="w-6 h-6 sm:w-7 sm:h-7 mb-0.5" style={{ color: primaryColor }} />
                  <span className="text-[11px] sm:text-xs font-bold text-slate-700">Instant Pay</span>
                </div>
              )}
            </div>
          </div>

          <div 
            style={selectedMethod === "instant" ? { backgroundColor: primaryColor } : {}}
            className={`relative text-[10px] sm:text-[11px] font-medium h-6 sm:h-7.5 flex items-center transition-colors duration-200 overflow-hidden ${
              selectedMethod === "instant" ? "text-white" : "bg-white text-slate-400 border-t border-slate-200"
            }`}
          >
            <span className={`absolute transition-all duration-300 ease-in-out whitespace-nowrap ${
              selectedMethod === "instant" ? "left-2.5 sm:left-3 translate-x-0 font-semibold" : "left-1/2 -translate-x-1/2"
            }`}>
              Instant Pay
            </span>
            <span className={`absolute right-2 sm:right-3 font-bold transition-all duration-300 ease-out flex items-center justify-center ${
              selectedMethod === "instant" ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-75"
            }`}>
              <svg viewBox="-3.5 0 19 19" xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white">
                <path d="M4.63 15.638a1.028 1.028 0 0 1-.79-.37L.36 11.09a1.03 1.03 0 1 1 1.58-1.316l2.535 3.043L9.958 3.32a1.029 1.029 0 0 1 1.783 1.03L5.52 15.122a1.03 1.03 0 0 1-.803.511.89.89 0 0 1-.088.004z"/>
              </svg>
            </span>
          </div>
        </div>

      </div>

      {/* Info & Balance Section */}
      <div className="space-y-2 pt-1">
        {isLoggedIn ? (
          <div className="flex items-center justify-between text-[11px] sm:text-xs md:text-sm text-slate-600">
            <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
              <Info style={{ color: primaryColor }} className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="flex items-center space-x-1 truncate">
                <span className="truncate">Account Balance</span>
                <span style={{ color: primaryColor }} className="font-bold flex items-center space-x-0.5 ml-1 flex-shrink-0">
                  {takaSvg}
                  <span>{isLoadingBalance ? "..." : Number(userBalance || 0).toFixed(2)}</span>
                </span>
              </span>
            </div>
            <button 
              type="button" 
              onClick={fetchLiveBalance}
              disabled={isLoadingBalance}
              className="text-slate-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-slate-200/50 disabled:opacity-50 flex-shrink-0 ml-1"
            >
              <RefreshCw style={isLoadingBalance ? { color: primaryColor } : {}} className={`w-3.5 h-3.5 ${isLoadingBalance ? "animate-spin" : ""}`} />
            </button>
          </div>
        ) : (
          <div onClick={() => router.push("/login")} className="flex items-center justify-between p-2.5 sm:p-3 bg-amber-50 border border-amber-200 hover:border-amber-300 rounded-lg text-[11px] sm:text-xs md:text-sm text-amber-800 cursor-pointer transition-all group">
            <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 flex-shrink-0" />
              <span className="font-medium truncate">Please Login Now For Place Order!</span>
            </div>
            <span className="text-[10px] sm:text-[11px] bg-amber-600 text-white font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded flex-shrink-0 ml-2">Login</span>
          </div>
        )}

        {/* Product Total Price Information */}
        <div className="flex items-center justify-between text-[11px] sm:text-xs md:text-sm text-slate-600">
          <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
            <Info style={{ color: primaryColor }} className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="flex items-center space-x-1 truncate">
              <span className="truncate">You need to buy the product</span>
              <span style={{ color: primaryColor }} className="font-bold flex items-center space-x-0.5 ml-1 flex-shrink-0">
                {takaSvg}
                <span className="tracking-wide">{Number(totalPrice || 0).toFixed(2)}</span>
              </span>
            </span>
          </div>
        </div>

        {/* Insufficient Balance Notice */}
        {!isLoadingBalance && isLoggedIn && selectedMethod === "wallet" && userBalance < totalPrice && (
          <div onClick={() => router.push("/add-money")} className="flex items-center justify-between p-2.5 sm:p-3 bg-red-50 border border-red-200 hover:border-red-300 rounded-lg text-[11px] sm:text-xs md:text-sm text-red-800 cursor-pointer transition-all group">
            <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
              <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
              <span className="font-medium truncate">You not have enough balance to Place order!</span>
            </div>
            <span className="text-[10px] sm:text-[11px] bg-red-600 text-white font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded flex-shrink-0 ml-2">Add Money</span>
          </div>
        )}
      </div>

    </div>
  );
});

export default PaymentSelector;