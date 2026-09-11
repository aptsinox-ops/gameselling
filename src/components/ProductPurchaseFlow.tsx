"use client";

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import VariationSelector from "./VariationSelector";
import PaymentSelector from "./PaymentSelector";

interface ProductPurchaseFlowProps {
  dbVariations: any[];
  isListView: boolean;
  product: any;
  currentUserRole: string;
  resellerPercentage: number;
  fields: any[];
  isLoggedIn: boolean;
  currentBalance: number;
  takaSvg: React.ReactNode;
  primaryColor?: string;
  userId?: any;
  siteSettings?: any;
}

const SuccessIcon = React.memo(() => (
  <div className="w-5 h-5 flex items-center justify-center bg-green-500 rounded-full text-white shrink-0">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  </div>
));
SuccessIcon.displayName = "SuccessIcon";

const ErrorIcon = React.memo(() => (
  <div className="w-5 h-5 flex items-center justify-center bg-red-500 rounded-full text-white shrink-0">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  </div>
));
ErrorIcon.displayName = "ErrorIcon";

const FireIcon = () => (
  <svg className="w-4 h-4 mr-1.5 opacity-70" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.3 7.26 13 4.85 13.95 3c-.95.23-1.78.75-2.49 1.32-2.11 1.69-2.8 4.75-1.4 7.23a.47.47 0 0 1-.09.52c-.17.18-.44.2-.64.05-.2-.15-.31-.38-.34-.62-.06-.57-.22-1.12-.48-1.63-.3-.6-.73-1.13-1.28-1.51a5.6 5.6 0 0 0-.61-.37c-.15-.08-.34-.04-.45.1-.12.14-.1.35.04.47.78.68 1.33 1.62 1.5 2.66.27 1.64-.2 3.26-1.19 4.56a7.71 7.71 0 0 1-5.06 2.9c-.22.04-.37.24-.34.46.03.22.21.37.43.34a8.7 8.7 0 0 0 6.64-4.5c.08-.16.29-.22.46-.12.13.07.2.22.18.37a5.53 5.53 0 0 1-1.24 2.99 6.2 6.2 0 0 1-3.6 2.06c-.22.05-.36.26-.31.48.05.22.25.36.47.31a7.18 7.18 0 0 0 5.09-3.41c.06-.11.18-.17.3-.15.12.02.22.1.25.22.38 1.37 1.29 2.53 2.51 3.22.19.11.43.03.52-.16.08-.19.01-.42-.17-.52-1.02-.57-1.71-1.58-1.9-2.73-.03-.2.1-.38.3-.41.2-.03.39.1.42.3.26 1.45 1.13 2.7 2.41 3.42.19.11.43.03.51-.16.09-.19.01-.42-.17-.52a6.3 6.3 0 0 1-3.15-4.25c-.04-.21.09-.4.3-.44.21-.04.4.09.44.3 1.15 5.25 7.82 4.41 7.57-1.83-.02-.42-.13-.82-.31-1.21z"/>
  </svg>
);

/* 🕒 Timing/Clock Icon Non-Voucher Product এর জন্য */
const ClockTimerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

/* 🏠 Home Icon */
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

export default function ProductPurchaseFlow({
  dbVariations,
  isListView,
  product,
  currentUserRole,
  resellerPercentage,
  fields,
  isLoggedIn,
  currentBalance,
  takaSvg,
  primaryColor = "#2563eb",
  userId,
}: ProductPurchaseFlowProps) {
  
  const router = useRouter();
  const [selectedVariation, setSelectedVariation] = useState<any>(null);
  const [basePrice, setBasePrice] = useState<number>(0);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [ffNameLoading, setFfNameLoading] = useState<boolean>(false);
  const [playerData, setPlayerData] = useState<{ username: string; uid: string; } | null>(null);

  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod: "Wallet" as "Wallet" | "Instant",
    totalPrice: 0,
    userBalance: currentBalance,
    isLoadingBalance: false,
    quantity: 1,
  });

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [dialogStep, setDialogStep] = useState<"loading" | "insufficient" | "success">("loading");
  const [errorMessage, setErrorMessage] = useState<string>(""); 
  const [progress, setProgress] = useState<number>(0);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [orderTime, setOrderTime] = useState<string>("");

  const animFrameRef = useRef<number | null>(null);

  /* 🔹 চেক প্রোডাক্ট টাইপ ভাউচার কিনা */
  const isVoucherProduct = useMemo(() => {
    const pType = product?.productType?.toLowerCase() || "";
    return pType === "voucher" || pType === "vouchers";
  }, [product]);

  /* 🎯 offerPrice ক্যালকুলেশন লজিক */
  const calculateEffectivePrice = useCallback((varObj: any) => {
    if (!varObj) return 0;

    const regularPrice = Number(varObj.price) || 0;
    const offerPrice = varObj.offerPrice != null && Number(varObj.offerPrice) > 0 ? Number(varObj.offerPrice) : null;
    const resellerPrice = varObj.resellerPrice != null && Number(varObj.resellerPrice) > 0 ? Number(varObj.resellerPrice) : null;

    let unitPrice = (offerPrice !== null) ? offerPrice : regularPrice;

    const isReseller = currentUserRole?.toLowerCase()?.includes("reseller");
    if (isReseller) {
      if (resellerPrice !== null) {
        unitPrice = resellerPrice;
      } else if (resellerPercentage > 0) {
        unitPrice = unitPrice - (unitPrice * resellerPercentage / 100);
      }
    }

    return Math.round(unitPrice * 100) / 100;
  }, [currentUserRole, resellerPercentage]);

  /* 🔄 basePrice বা quantity পাল্টালে totalPrice অটো আপডেট */
  useEffect(() => {
    if (basePrice > 0) {
      setPaymentDetails((prev) => ({
        ...prev,
        totalPrice: Math.round(basePrice * prev.quantity * 100) / 100,
      }));
    }
  }, [basePrice]);

  const showNameChecker = useMemo(() => {
    return product?.productType === "UID" || product?.isUidNameChecker === true;
  }, [product]);

  /* 🧹 ক্লিন ফিল্ড নেম (অতিরিক্ত "Enter " টেক্সট বাদ দেওয়া) */
  const cleanFields = useMemo(() => {
    let rawFields: string[] = [];
    if (fields && Array.isArray(fields) && fields.length > 0) {
      rawFields = fields.map(f => (typeof f === "object" && f !== null) ? (f.label || f.name || "Field") : String(f));
    } else if (fields && typeof fields === "string") {
      rawFields = [fields];
    } else {
      rawFields = ["Player UID"];
    }

    return rawFields.map((f) => f.replace(/^enter\s+/i, "").trim());
  }, [fields]);

  const handleInputChange = useCallback((fieldName: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [fieldName]: value }));
    setPlayerData(null); 
  }, []);

  const handleAddBalance = useCallback(() => {
    router.push("/add-money");
  }, [router]);

  const handleCheckUIDName = async () => {
    const firstFieldName = cleanFields[0];
    const uid = inputValues[firstFieldName];
    
    if (!uid || uid.trim() === "") {
      toast(`দয়া করে প্রথমে "${firstFieldName}" ফিল্ডটি লিখুন!`, { icon: <ErrorIcon /> });
      return;
    }

    setFfNameLoading(true);
    setPlayerData(null);

    try {
      const response = await fetch(`/api/check-uid?uid=${encodeURIComponent(uid.trim())}`);
      const data = await response.json();
      const resData = data.data || data;

      if (resData && resData.username) {
        setPlayerData({ username: resData.username, uid: resData.uid });
        toast("প্লেয়ার ডাটা ফেচ করা হয়েছে!", { icon: <SuccessIcon /> });
      } else {
        setPlayerData({ username: `ID: ${uid.trim()}`, uid: uid.trim() });
        toast("অফলাইন মোড অ্যাক্টিভেটেড।", { icon: <SuccessIcon /> });
      }
    } catch (error) {
      setPlayerData({ username: `ID: ${uid.trim()}`, uid: uid.trim() });
      toast("অর্ডার করার জন্য রেডি।", { icon: <SuccessIcon /> });
    } finally {
      setFfNameLoading(false);
    }
  };

  const handleVariationChange = useCallback((price: number, variationObj?: any) => {
    if (variationObj) {
      const finalUnitPrice = calculateEffectivePrice(variationObj);
      setBasePrice(finalUnitPrice);
      setSelectedVariation(variationObj);
    } else {
      setBasePrice(price);
    }
  }, [calculateEffectivePrice]);

  const handlePaymentChange = useCallback((details: any) => {
    const nextMethod = details.paymentMethod === "wallet" ? "Wallet" : "Instant";
    const calculatedQty = details.quantity || (basePrice > 0 ? Math.round(details.totalPrice / basePrice) : 1);
    const finalCalculatedQty = calculatedQty > 0 ? calculatedQty : 1;

    setPaymentDetails((prev) => ({
      ...prev,
      paymentMethod: nextMethod,
      quantity: finalCalculatedQty,
      totalPrice: Math.round(basePrice * finalCalculatedQty * 100) / 100,
      userBalance: details.userBalance,
      isLoadingBalance: details.isLoadingBalance,
    }));
  }, [basePrice]);

  const isVariationSelected = basePrice > 0;

  /* 🔴 ব্যালেন্স কম আছে কিনা চেক করার লজিক (Wallet পেমেন্টের ক্ষেত্রে) */
  const isInsufficientBalance = useMemo(() => {
    if (!isLoggedIn) return false;
    if (paymentDetails.paymentMethod === "Instant") return false;
    if (!isVariationSelected) return false;
    return paymentDetails.userBalance < paymentDetails.totalPrice;
  }, [isLoggedIn, paymentDetails.paymentMethod, paymentDetails.userBalance, paymentDetails.totalPrice, isVariationSelected]);

  /* 🎯 বাটনে ক্লিক হ্যান্ডলার */
  const handleMainButtonClick = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    if (isInsufficientBalance) {
      router.push("/add-money");
      return;
    }

    handleBuyNowSubmit();
  };

  /* ⚡ 120 FPS Ultra Smooth Progress Bar Animation Helper */
  const startSmoothProgress = (targetPercent: number, durationMs: number, onComplete?: () => void) => {
    let startVal = progress;
    let startTime: number | null = null;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progressRatio = Math.min(timeElapsed / durationMs, 1);

      // Smooth Ease-Out Cubic Curve for 120 FPS
      const easeValue = 1 - Math.pow(1 - progressRatio, 3);
      const currentVal = Math.min(startVal + (targetPercent - startVal) * easeValue, 100);

      setProgress(currentVal);

      if (timeElapsed < durationMs) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else if (onComplete) {
        onComplete();
      }
    };

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(animate);
  };

  const handleBuyNowSubmit = async () => {
    if (isSubmitting) return;

    if (!isLoggedIn) {
      toast("দয়া করে ক্রয় করতে প্রথমে লগইন করুন!", { icon: <ErrorIcon /> });
      return;
    }

    if (!isVariationSelected || !selectedVariation) {
      toast("দয়া করে আইটেম ভ্যারিয়েশন সিলেক্ট করুন!", { icon: <ErrorIcon /> });
      return;
    }

    for (const labelName of cleanFields) {
      if (!inputValues[labelName] || inputValues[labelName].trim() === "") {
        toast(`দয়া করে "${labelName}" ফিল্ডটি পূরণ করুন!`, { icon: <ErrorIcon /> });
        return;
      }
    }

    setIsSubmitting(true);
    setIsDialogOpen(true);
    setDialogStep("loading");
    setProgress(5);

    const calculatedTotalPrice = Math.round(basePrice * paymentDetails.quantity * 100) / 100;
    const validUserId = userId ? Number(userId) : null;

    // ১. Instant Payment Flow
    if (paymentDetails.paymentMethod === "Instant") {
      try {
        const response = await fetch("/api/instant-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            variationId: selectedVariation.id,
            unitPrice: basePrice,
            totalPrice: calculatedTotalPrice,
            inputValues,
            quantity: paymentDetails.quantity,
            userId: validUserId,
          }),
        });
        const resData = await response.json();
        if (response.ok && resData.payment_url) {
          window.location.href = resData.payment_url;
          return;
        }
      } catch (error) {
        console.error(error);
      }
      setIsDialogOpen(false);
      setIsSubmitting(false);
      return;
    }

    // ২. Wallet Payment Flow
    startSmoothProgress(75, 800);

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          variationId: selectedVariation.id,
          unitPrice: basePrice,
          totalPrice: calculatedTotalPrice,
          inputValues,
          quantity: paymentDetails.quantity,
          userId: validUserId,
          paymentMethod: "Wallet",
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        setErrorMessage(resData.message || "Order Failed");
        setDialogStep("insufficient");
        setIsSubmitting(false);
        return;
      }

      setApiResponse(resData);
      
      const bdFormattedTime = new Date().toLocaleString("en-US", { 
        timeZone: "Asia/Dhaka",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
      setOrderTime(bdFormattedTime);

      // Smooth progress to 100% and show success dialog without auto redirecting
      startSmoothProgress(100, 400, () => {
        setTimeout(() => {
          setDialogStep("success");
          setIsSubmitting(false);
        }, 150);
      });

    } catch (err: any) {
      console.error("Order submission error:", err);
      setErrorMessage("অর্ডার প্রসেস করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।");
      setDialogStep("insufficient");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pt-4 pb-24 lg:pb-8">
      {/* Side by Side Grid Wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Step 1 */}
        <div className="lg:col-span-7 space-y-6">
          {/* ১. ভ্যারিয়েশন সেকশন */}
          <section className="relative bg-white rounded-md border border-slate-200 pt-5 shadow-none">
            <div style={{ backgroundColor: primaryColor }} className="absolute -top-6 left-3 z-10 flex items-center justify-center [width:clamp(38px,10vw,50px)] [height:clamp(38px,10vw,50px)] text-white rounded-full [font-size:clamp(18px,5vw,22px)] font-bold border-5 border-white ">1</div>
            <div className="w-full pb-3">
              <h2 style={{ color: primaryColor }} className="[font-size:clamp(15px,4vw,20px)] mt-1 font-bold px-5">Select Recharge</h2>
              <hr className="mt-3 border-slate-200 w-full" />
            </div>
            
            <VariationSelector 
              variations={dbVariations || []} 
              isListView={isListView} 
              variationIcon={product?.variationIcon} 
              resellerPercentage={resellerPercentage}
              userRole={currentUserRole}
              onChange={handleVariationChange}
              primaryColor={primaryColor} 
              userBalance={paymentDetails.userBalance}
              isInstantPayment={paymentDetails.paymentMethod === "Instant"} 
              onAddBalance={handleAddBalance}
              nextStepId="step-2"
            />
          </section>
        </div>

        {/* Right Side: Step 2, Step 3 & Buy Now Button */}
        <div className="lg:col-span-5 space-y-6">
          {/* ২. অ্যাকাউন্ট সেকশন */}
          <section className="relative bg-white rounded-md border border-slate-200 pt-5 sm:pt-6">
            <div 
              style={{ backgroundColor: primaryColor }} 
              className="absolute -top-5 sm:-top-6 left-3.5 sm:left-4 z-10 flex items-center justify-center text-white rounded-full [width:clamp(34px,8vw,44px)] [height:clamp(34px,8vw,44px)] [font-size:clamp(15px,4.5vw,20px)] font-bold"
            >
              2
            </div>

            <div className="w-full pb-2.5 sm:pb-3">
              <h2 
                style={{ color: primaryColor }} 
                className="[font-size:clamp(14px,3.8vw,18px)] mt-0.5 font-bold px-3.5 sm:px-5"
              >
                Account Info
              </h2>
              <hr className="mt-2.5 border-slate-200 w-full" />
            </div>
            
            {/* Input Fields & Content Area */}
            <div className="px-3.5 sm:px-5 pb-5 sm:pb-6 space-y-3.5 sm:space-y-4">
              {cleanFields.map((labelName, index) => (
                <div key={index} className="space-y-1 sm:space-y-1.5">
                  <label className="[font-size:clamp(11px,2.7vw,13.5px)] font-semibold text-slate-600 block capitalize">
                    Enter {labelName}
                  </label>
                  <input 
                    type="text" 
                    value={inputValues[labelName] || ""}
                    onChange={(e) => handleInputChange(labelName, e.target.value)}
                    onFocus={(e) => (e.target.style.outlineColor = primaryColor)} 
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 [font-size:clamp(12px,3vw,15px)] transition-all bg-slate-50/30 focus:bg-white text-slate-800 placeholder:text-slate-400" 
                    placeholder={`Enter your ${labelName}`}
                  />
                </div>
              ))}

              {/* UID Checker Section */}
              {showNameChecker && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleCheckUIDName}
                    disabled={ffNameLoading}
                    style={{ backgroundColor: primaryColor }}
                    className="w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold [font-size:clamp(11px,2.8vw,13.5px)] text-white tracking-wider hover:opacity-90 transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed uppercase shadow-sm flex items-center justify-center"
                  >
                    {ffNameLoading ? "Processing..." : "CLICK TO CHECK"}
                  </button>

                  {/* Player Details Result Card */}
                  {playerData && (
                    <div className="mt-3.5 sm:mt-4 border border-slate-200 rounded-lg overflow-hidden bg-slate-50/60 shadow-sm transition-all duration-300">
                      <div 
                        style={{ backgroundColor: primaryColor }} 
                        className="px-3.5 sm:px-4 py-2 sm:py-2.5 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <FireIcon /> Player Account Details
                      </div>
                      
                      <div className="p-3 sm:p-4 grid grid-cols-1 gap-2.5 sm:gap-3 sm:grid-cols-2">
                        <div className="bg-white p-2.5 sm:p-3 rounded-md border border-slate-100 min-w-0 shadow-2xs">
                          <span className="block text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                            Name
                          </span>
                          <span 
                            style={{ color: primaryColor }} 
                            className="font-bold [font-size:clamp(12.5px,3.2vw,15px)] block mt-0.5 truncate"
                          >
                            {playerData.username}
                          </span>
                        </div>
                        
                        <div className="bg-white p-2.5 sm:p-3 rounded-md border border-slate-100 min-w-0 shadow-2xs">
                          <span className="block text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                            UID
                          </span>
                          <span className="font-bold text-slate-700 [font-size:clamp(12.5px,3.2vw,15px)] block mt-0.5 truncate">
                            {playerData.uid}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* ৩. পেমেন্ট সেকশন */}
          <section className="relative bg-white rounded-md border border-slate-200 pt-5 shadow-none">
            <div style={{ backgroundColor: primaryColor }} className="absolute -top-6 left-3 z-10 flex items-center justify-center [width:clamp(38px,10vw,50px)] [height:clamp(38px,10vw,50px)] text-white rounded-full [font-size:clamp(18px,5vw,22px)] font-bold border-5 border-white ">3</div>
            <div className="w-full pb-3">
              <h2 style={{ color: primaryColor }} className="[font-size:clamp(14px,3.5vw,18px)] font-bold mt-1 px-5">Select Payment</h2>
              <hr className="mt-3 border-slate-200 w-full" />
            </div>
            
            <PaymentSelector 
              takaSvg={takaSvg} 
              basePrice={basePrice}
              onChange={handlePaymentChange}
              primaryColor={primaryColor} 
            />
          </section>

          {/* BUY NOW বাটন */}
          <div className="lg:block space-y-3 pt-2">
            <button
              onClick={handleMainButtonClick}
              disabled={isSubmitting}
              style={{ backgroundColor: isSubmitting ? "#94a3b8" : primaryColor }}
              className="w-full py-3 rounded-md font-bold transition-all duration-300 tracking-wider text-md text-white uppercase select-none hover:opacity-90 cursor-pointer active:scale-[0.99] flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing</span>
                </>
              ) : !isLoggedIn ? (
                <span>LOGIN</span>
              ) : isInsufficientBalance ? (
                <span>ADD MONEY</span>
              ) : (
                <span>Buy Now</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Rules & Conditions */}
      {product?.description && (
        <section className="bg-white border border-slate-200 rounded-md pt-5 pb-5 shadow-none transition-all">
          <div className="w-full pb-3">
            <div className="flex items-stretch pl-3">
              <svg fill="red" width="20px" height="20px" viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg"><path d="M116,136V104a12,12,0,0,1,24,0v32a12,12,0,0,1-24,0Zm124.23242,77.979a27.71154,27.71154,0,0,1-24.25586,14.01319H40.02344A28.00034,28.00034,0,0,1,15.79,185.96582L103.7666,33.97314v.00049a27.99988,27.99988,0,0,1,48.4668,0L240.21,185.96533A27.71359,27.71359,0,0,1,240.23242,213.979Zm-20.79394-15.99072L131.46191,45.99609a4.00012,4.00012,0,0,0-6.92382,0h0L36.56152,197.98828a4.0004,4.0004,0,0,0,3.46192,6.00391H215.97656a4.0004,4.0004,0,0,0,3.46192-6.00391ZM128,160a16,16,0,1,0,16,16A16.00016,16.00016,0,0,0,128,160Z"/></svg>
              <h2 className="font-bold text-red-500 [font-size:clamp(15px,4vw,20px)] pl-2">
                Rules & Conditions:
              </h2>
            </div>
            <hr className="mt-3 border-slate-200 w-full" />
          </div>
            
          <div 
            className="text-slate-600 leading-relaxed font-medium prose prose-slate max-w-none px-5 [font-size:clamp(13px,3.2vw,16px)] product-description"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </section>
      )}

      {/* 🚀 120 FPS ULTRA-SMOOTH PROCESS & RESULT DIALOG MODAL */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-[380px] sm:max-w-md bg-white rounded-2xl p-5 sm:p-7 shadow-2xl border border-slate-100 transition-all duration-300 overflow-hidden max-h-[92vh] overflow-y-auto scale-95 sm:scale-100 origin-center">
            
            {/* ক্লোজ বাটন */}
            <button 
              onClick={() => { if (!isSubmitting) setIsDialogOpen(false); }}
              disabled={isSubmitting}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition disabled:opacity-20 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            {/* ১. প্রোগ্রেস ও অ্যানিমেটেড লোডিং স্ক্রিন */}
            {dialogStep === "loading" && (
              <div className="py-4 flex flex-col items-center justify-center text-center">
                
                {/* 🌀 অ্যানিমেটেড টপ আইকন */}
                <div className="relative mb-4 flex items-center justify-center min-h-[64px]">
                  {progress < 40 && (
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-sm transition-all duration-300 animate-in zoom-in-75">
                      <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                  )}

                  {progress >= 40 && progress < 80 && (
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shadow-sm transition-all duration-300 animate-in zoom-in-75">
                      <svg className="w-8 h-8 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  )}

                  {progress >= 80 && (
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-sm transition-all duration-300 animate-in zoom-in-75">
                      <svg className="w-8 h-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Processing Order</h3>
                <p className="text-xs text-slate-500 font-medium max-w-xs mt-1 mb-6 leading-relaxed">
                  Please wait a moment while we process your request securely.
                </p>
                
                {/* 🚀 Ultra 120 FPS Hardware-Accelerated Smooth Progress Bar */}
                <div className="w-full px-1 relative flex items-center justify-between mb-6">
                  <div className="absolute left-5 right-5 top-3.5 h-1.5 bg-slate-100 rounded-full z-0" />
                  
                  <div 
                    style={{ 
                      width: `calc(${Math.min(Math.max(progress, 0), 100)}% - 20px)`,
                      transition: "width 120ms cubic-bezier(0.25, 0.1, 0.25, 1)"
                    }}
                    className="absolute left-5 top-3.5 h-1.5 bg-emerald-500 rounded-full z-0 origin-left shadow-xs"
                  />

                  {/* Step 1 */}
                  <div className="flex flex-col items-center relative z-10">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-200 ring-4 ring-white ${
                      progress >= 0 ? "bg-emerald-500 text-white shadow-xs" : "bg-slate-100 text-slate-400"
                    }`}>
                      {progress > 15 ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : "1"}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider mt-1.5 ${progress >= 0 ? "text-emerald-600" : "text-slate-400"}`}>Select</span>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center relative z-10">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-200 ring-4 ring-white ${
                      progress >= 50 ? "bg-emerald-500 text-white shadow-xs" : "bg-slate-100 text-slate-400"
                    }`}>
                      {progress > 65 ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : "2"}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider mt-1.5 ${progress >= 50 ? "text-emerald-600" : "text-slate-400"}`}>Review</span>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center relative z-10">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-200 ring-4 ring-white ${
                      progress >= 95 ? "bg-emerald-500 text-white shadow-xs" : "bg-slate-100 text-slate-400"
                    }`}>
                      3
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider mt-1.5 ${progress >= 95 ? "text-emerald-600" : "text-slate-400"}`}>Payment</span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-semibold text-slate-600">
                    {progress < 40 && "Processing account info..."}
                    {progress >= 40 && progress < 80 && "Packaging variation items..."}
                    {progress >= 80 && "Finalizing wallet payment..."}
                  </span>
                </div>
              </div>
            )}

            {/* ২. এরর স্ক্রিন */}
            {dialogStep === "insufficient" && (
              <div className="py-4 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 ring-8 ring-rose-50/50 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="18" y2="18"></line></svg>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    {errorMessage === "This Method are not allow This Time" ? "Action Blocked" : "Order Failed"}
                  </h3>
                  <div className="mt-1.5 inline-block bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold px-3 py-1 rounded-full">
                    {errorMessage === "Insufficient Balance" ? "Insufficient Wallet Balance" : errorMessage === "Out of Stock" ? "Product Out of Stock" : errorMessage}
                  </div>
                </div>

                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  {errorMessage === "Insufficient Balance" 
                    ? "আপনার ওয়ালেট ব্যালেন্স পর্যাপ্ত নয়। দয়া করে অ্যাকাউন্টে ব্যালেন্স রিচার্জ করে পুনরায় চেষ্টা করুন।" 
                    : errorMessage === "Out of Stock" 
                    ? "দুঃখিত, এই ভ্যারিয়েশনটি বর্তমানে স্টকআউট! অ্যাডমিন প্যানেল থেকে এর স্টক বাড়িয়ে পুনরায় চেষ্টা করুন।" 
                    : errorMessage === "This Method are not allow This Time"
                    ? "This Method are not allow This Time"
                    : "অর্ডারটি সম্পন্ন করা সম্ভব হয়নি। দয়া করে ব্যালেন্স রিচার্জ অথবা পুনরায় চেষ্টা করুন।"}
                </p>

                <button 
                  onClick={() => setIsDialogOpen(false)}
                  className="w-full mt-2 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs tracking-wide transition shadow-sm active:scale-[0.98]"
                >
                  Close & Retry
                </button>
              </div>
            )}

            {/* ৩. সফল পারচেজ ও ইনভয়েস স্ক্রিন (No BG, No Border Layout) */}
            {dialogStep === "success" && (
              <div className="flex flex-col items-center text-center pt-2">
                
                {/* 🎯 dynamic Icon & Color (Voucher vs Non-Voucher) */}
                <div className="my-1 flex items-center justify-center">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white ring-8 shadow-lg transition-all duration-300 animate-in zoom-in-75 ${
                    isVoucherProduct 
                      ? "bg-emerald-500 ring-emerald-50 shadow-emerald-500/20" 
                      : "bg-amber-500 ring-amber-50 shadow-amber-500/20"
                  }`}>
                    {isVoucherProduct ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <ClockTimerIcon />
                    )}
                  </div>
                </div>

                {/* 🎯 Title (Order Processing / Order Complete) */}
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-3">
                  {isVoucherProduct ? "Order Complete" : "Order Processing"}
                </h2>

                {/* 🎯 "Check Your Order History" Link */}
                <div className="mt-1">
                  <Link 
                    href={isVoucherProduct ? "/code" : "/myorder"} 
                    className="text-xs text-slate-500 hover:text-blue-600 hover:underline font-semibold transition-colors duration-150 inline-block cursor-pointer"
                  >
                    Check Your Order History
                  </Link>
                </div>

                {/* 📄 Clean Invoice Content Area (No Outer BG, No Border) */}
                <div className="w-full my-5 text-left text-xs sm:text-sm space-y-2.5 text-slate-700 font-medium">
                  
                  {/* Order ID */}
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500">Order ID:</span>
                    <span className="font-mono font-bold text-slate-800 break-all select-all">
                      {apiResponse?.orderId || apiResponse?.receiptNo || apiResponse?.order?.id || "N/A"}
                    </span>
                  </div>

                  {/* Product */}
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500">Product:</span>
                    <span className="font-bold text-slate-800">{product?.name || "N/A"}</span>
                  </div>

                  {/* Item */}
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500">Item:</span>
                    <span className="font-bold text-slate-800">
                      {selectedVariation?.title || selectedVariation?.name || "N/A"}
                      {paymentDetails.quantity > 1 ? ` x ${paymentDetails.quantity}` : ""}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500">Amount:</span>
                    <span className="font-extrabold text-slate-900">
                      ৳{apiResponse?.totalPrice || paymentDetails.totalPrice || (basePrice * paymentDetails.quantity)}
                    </span>
                  </div>

                  {/* Payment by */}
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500">Payment by:</span>
                    <span className="font-semibold text-slate-800">{paymentDetails.paymentMethod}</span>
                  </div>

                  {/* Voucher Code ( if Voucher ) OR JSON Input Values ( if Non-Voucher ) */}
                  {isVoucherProduct ? (
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-500">Voucher Code:</span>
                      <span className="font-mono font-bold text-emerald-600 break-all select-all">
                        {apiResponse?.voucherCode || apiResponse?.code || "N/A"}
                      </span>
                    </div>
                  ) : (
                    inputValues && Object.keys(inputValues).length > 0 && (
                      Object.entries(inputValues).map(([key, val]) => (
                        <div key={key} className="flex justify-between items-center py-0.5">
                          <span className="text-slate-500 capitalize">{key}:</span>
                          <span className="font-bold text-slate-800 break-all">{String(val)}</span>
                        </div>
                      ))
                    )
                  )}

                  {/* Date */}
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500">Date:</span>
                    <span className="text-slate-700">{orderTime}</span>
                  </div>

                </div>

                {/* 🔘 Bottom Action Buttons */}
                <div className="w-full grid grid-cols-2 gap-3 pt-2">
                  <Link
                    href="/"
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm text-center flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
                  >
                    <HomeIcon /> Back to Home
                  </Link>

                  <Link
                    href={isVoucherProduct ? "/code" : "/myorder"}
                    style={{ backgroundColor: isVoucherProduct ? "#10b981" : (primaryColor || "#f59e0b") }}
                    className="w-full py-2.5 text-white font-semibold rounded-xl text-xs sm:text-sm text-center flex items-center justify-center gap-1 hover:opacity-90 transition shadow-sm active:scale-[0.98]"
                  >
                    Order List
                  </Link>
                </div>

              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}