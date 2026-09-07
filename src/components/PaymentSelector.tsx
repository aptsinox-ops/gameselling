"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Info, RefreshCw, Lock, Wallet, Zap, CheckCircle2 } from "lucide-react";
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
  const [quantity, setQuantity] = useState<number>(1);
  const [livePrice, setLivePrice] = useState<number>(propBasePrice || 0);
  
  // 🟢 সেটিংসের জন্য স্টেট
  const [siteSettings, setSiteSettings] = useState<{
    walletPayBanner?: string | null;
    autoPaymentBanner?: string | null;
  } | null>(propSettings || null);

  const maxStock = 5; 

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
    <div className="px-3 pb-6 space-y-5 bg-white rounded-2xl will-change-transform">
      
      {/* 🚀 Professional & Unique Payment Method Grid */}
      <div className="grid grid-cols-2 gap-3.5 max-w-xl">
        
        {/* Wallet Pay Card */}
        <div
          onClick={() => setSelectedMethod("wallet")}
          style={{
            borderColor: selectedMethod === "wallet" ? primaryColor : undefined,
            boxShadow: selectedMethod === "wallet" ? `0 8px 20px -4px ${primaryColor}25` : undefined
          }}
          className={`relative group cursor-pointer rounded-2xl p-4 flex flex-col justify-between h-[115px] border-2 transition-all duration-300 select-none bg-gradient-to-br from-white to-slate-50/50 ${
            selectedMethod === "wallet" 
              ? "bg-blue-50/10 scale-[1.02]" 
              : "border-slate-100 hover:border-slate-300 hover:shadow-md"
          }`}
        >
          {/* Active indicator dot/icon */}
          <div className="flex items-center justify-between w-full">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: `${primaryColor}15` }}>
              <Wallet className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
              selectedMethod === "wallet" ? "border-transparent" : "border-slate-300 bg-white"
            }`} style={selectedMethod === "wallet" ? { backgroundColor: primaryColor } : {}}>
              {selectedMethod === "wallet" && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-bold text-slate-800 tracking-tight">Wallet Pay</span>
            {siteSettings?.walletPayBanner && (
              <img 
                src={siteSettings.walletPayBanner} 
                alt="Wallet" 
                className="h-5 object-contain" 
              />
            )}
          </div>
        </div>

        {/* Instant Pay Card */}
        <div
          onClick={() => setSelectedMethod("instant")}
          style={{
            borderColor: selectedMethod === "instant" ? primaryColor : undefined,
            boxShadow: selectedMethod === "instant" ? `0 8px 20px -4px ${primaryColor}25` : undefined
          }}
          className={`relative group cursor-pointer rounded-2xl p-4 flex flex-col justify-between h-[115px] border-2 transition-all duration-300 select-none bg-gradient-to-br from-white to-slate-50/50 ${
            selectedMethod === "instant" 
              ? "bg-blue-50/10 scale-[1.02]" 
              : "border-slate-100 hover:border-slate-300 hover:shadow-md"
          }`}
        >
          {/* Active indicator dot/icon */}
          <div className="flex items-center justify-between w-full">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: `${primaryColor}15` }}>
              <Zap className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
              selectedMethod === "instant" ? "border-transparent" : "border-slate-300 bg-white"
            }`} style={selectedMethod === "instant" ? { backgroundColor: primaryColor } : {}}>
              {selectedMethod === "instant" && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-bold text-slate-800 tracking-tight">Instant Pay</span>
            {siteSettings?.autoPaymentBanner && (
              <img 
                src={siteSettings.autoPaymentBanner} 
                alt="Instant" 
                className="h-5 object-contain" 
              />
            )}
          </div>
        </div>

      </div>

      {/* Quantity Selector */}
      <div className="flex items-center justify-between p-3.5 bg-slate-50/80 border border-slate-100 rounded-xl max-w-5xl shadow-sm">
        <span className="text-xs md:text-sm font-semibold text-slate-700">
          Quantity
        </span>
        <div className="flex items-center space-x-3 bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 select-none shadow-sm">
          <button
            type="button"
            onClick={() => quantity > 1 && setQuantity(q => q - 1)}
            style={quantity > 1 ? { color: primaryColor } : {}}
            className="text-slate-400 font-bold px-1 text-sm md:text-base transition-colors disabled:opacity-30 cursor-pointer"
            disabled={quantity <= 1}
          >
            -
          </button>
          <span 
            style={{ color: primaryColor }}
            className="text-xs md:text-sm font-bold min-w-[20px] text-center"
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => quantity < maxStock && setQuantity(q => q + 1)}
            style={quantity < maxStock ? { color: primaryColor } : {}}
            className="text-slate-400 font-bold px-1 text-sm md:text-base transition-colors disabled:opacity-30 cursor-pointer"
            disabled={quantity >= maxStock}
          >
            +
          </button>
        </div>
      </div>

      {/* Info & Notification Section */}
      <div className="space-y-2.5 pt-1">
        {isLoggedIn ? (
          <div className="flex items-center justify-between p-3 bg-slate-50/80 border border-slate-100 rounded-xl text-xs md:text-sm text-slate-700 shadow-sm">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-white shadow-sm">
                <Info style={{ color: primaryColor }} className="w-4 h-4 flex-shrink-0" />
              </div>
              <span className="flex items-center space-x-1">
                <span>Account Balance:</span>
                <span style={{ color: primaryColor }} className="font-bold flex items-center space-x-0.5 ml-1">
                  {takaSvg}
                  <span>{isLoadingBalance ? "..." : Number(userBalance || 0).toFixed(2)}</span>
                </span>
              </span>
            </div>
            <button 
              type="button" 
              onClick={fetchLiveBalance}
              disabled={isLoadingBalance}
              className="text-slate-400 hover:text-blue-600 transition-colors p-1.5 rounded-lg bg-white shadow-sm hover:bg-slate-100 disabled:opacity-50"
            >
              <RefreshCw style={isLoadingBalance ? { color: primaryColor } : {}} className={`w-3.5 h-3.5 ${isLoadingBalance ? "animate-spin" : ""}`} />
            </button>
          </div>
        ) : (
          <div onClick={() => router.push("/login")} className="flex items-center justify-between p-3.5 bg-amber-50/80 border border-amber-200/80 hover:border-amber-300 rounded-xl text-xs md:text-sm text-amber-800 cursor-pointer transition-all shadow-sm group">
            <div className="flex items-center space-x-2.5">
              <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="font-medium">Please login now to place an order!</span>
            </div>
            <span className="text-[11px] bg-amber-600 text-white font-bold px-3 py-1 rounded-lg shadow-sm">Login</span>
          </div>
        )}

        <div className="flex items-center space-x-2.5 p-3 bg-slate-50/80 border border-slate-100 rounded-xl text-xs md:text-sm text-slate-700 shadow-sm">
          <div className="p-1.5 rounded-lg bg-white shadow-sm">
            <Info style={{ color: primaryColor }} className="w-4 h-4 flex-shrink-0" />
          </div>
          <span className="flex items-center space-x-1">
            <span>Total Payable Amount:</span>
            <span style={{ color: primaryColor }} className="font-bold flex items-center space-x-0.5 ml-1">
              {takaSvg}
              <span className="tracking-wide">{Number(totalPrice || 0).toFixed(2)}</span>
            </span>
          </span>
        </div>

        {!isLoadingBalance && isLoggedIn && selectedMethod === "wallet" && userBalance < totalPrice && (
          <div onClick={() => router.push("/add-money")} className="flex items-center justify-between p-3.5 bg-red-50/80 border border-red-200/80 hover:border-red-300 rounded-xl text-xs md:text-sm text-red-800 cursor-pointer transition-all shadow-sm group">
            <div className="flex items-center space-x-2.5">
              <Info className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="font-medium">You do not have enough balance!</span>
            </div>
            <span className="text-[11px] bg-red-600 text-white font-bold px-3 py-1 rounded-lg shadow-sm">Add Money</span>
          </div>
        )}
      </div>
    </div>
  );
});

export default PaymentSelector;