"use client";

import React, { useState, useCallback, useMemo } from "react";
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
  userId?: any; // 👈 এটি যোগ করুন
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

function ProductPurchaseFlow({
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
  userId, // 👈 এখানে রিসিভ করুন
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
    quantity: 1, // ⚡ কোয়ান্টিটি ট্র্যাক করার জন্য স্টেট ডিফাইন করা হলো
  });

  // Dialog System States
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [dialogStep, setDialogStep] = useState<"loading" | "insufficient" | "success">("loading");
  const [errorMessage, setErrorMessage] = useState<string>(""); 
  const [progress, setProgress] = useState<number>(0);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [orderTime, setOrderTime] = useState<string>("");

  const showNameChecker = useMemo(() => {
    return product?.productType === "UID" || product?.isUidNameChecker === true;
  }, [product]);

  const cleanFields = useMemo(() => {
    if (fields && Array.isArray(fields) && fields.length > 0) {
      return fields.map(f => (typeof f === "object" && f !== null) ? (f.label || f.name || "Field") : String(f));
    } else if (fields && typeof fields === "string") {
      return [fields];
    }
    return ["Player UID"];
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
    setBasePrice(price);
    if (variationObj) {
      setSelectedVariation(variationObj);
    }
  }, []);

  const handlePaymentChange = useCallback((details: any) => {
    const nextMethod = details.paymentMethod === "wallet" ? "Wallet" : "Instant";
    
    // ⚡ টোটাল প্রাইস ও বেস প্রাইস ভাগ করে অটোমেটিক কোয়ান্টিটি বের করার সবচেয়ে নিরাপদ মেথড
    const calculatedQty = details.quantity || (basePrice > 0 ? Math.round(details.totalPrice / basePrice) : 1);

    setPaymentDetails((prev) => ({
      ...prev,
      paymentMethod: nextMethod,
      totalPrice: details.totalPrice,
      userBalance: details.userBalance,
      isLoadingBalance: details.isLoadingBalance,
      quantity: calculatedQty > 0 ? calculatedQty : 1
    }));
  }, [basePrice]); // basePrice ডিপেন্ডেন্সি যোগ করা হলো

  const isVariationSelected = basePrice > 0;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("ভাউচার কোডটি সফলভাবে কপি হয়েছে!");
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
  setErrorMessage("");
  setProgress(0);

  const intervalTime = 30; 
  const totalDuration = 2000; 
  const step = (intervalTime / totalDuration) * 100;

  const timer = setInterval(() => {
    setProgress((prev) => {
      if (prev >= 100) {
        clearInterval(timer);
        return 100;
      }
      return prev + step;
    });
  }, intervalTime);

  try {
    
// ⚡ handleBuyNowSubmit ফাংশনের ভেতরের Instant Payment এর অংশটি:

if (paymentDetails.paymentMethod === "Instant") {
  const response = await fetch("/api/instant-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productId: product.id,
      variationId: selectedVariation.id,
      inputValues: inputValues,
      quantity: paymentDetails.quantity,
      userId: userId || null, // 👈 নিশ্চিত করা হলো ইউজার আইডি পাস হচ্ছে
    }),
  });

  const resData = await response.json();

  if (response.ok && resData.payment_url) {
    // সরাসরি গেটওয়ে পেজে রিডাইরেক্ট
    window.location.href = resData.payment_url;
  } else {
    setErrorMessage(resData.message || "পেমেন্ট গেটওয়েতে সমস্যা হয়েছে!");
    setDialogStep("insufficient");
    setIsSubmitting(false);
  }
  return;
}

    // ⚡ ২. যদি Wallet Payment সিলেক্ট করা থাকে
    const response = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        variationId: selectedVariation.id,
        inputValues: inputValues,
        quantity: paymentDetails.quantity,
        paymentMethod: "Wallet",
      }),
    });

    const resData = await response.json();

    setTimeout(() => {
      const bdTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
      setOrderTime(bdTime);

      if (response.ok && resData.success) {
        setApiResponse(resData.data);
        toast("অর্ডার সফলভাবে সম্পন্ন হয়েছে!", { icon: <SuccessIcon /> });

        const normalizedType = product?.productType?.toLowerCase();

        // 🎯 শর্ত অনুযায়ী অটোমেটিক রিডাইরেক্ট
        if (normalizedType === "vouchers" || normalizedType === "voucher") {
          router.push(`/code`);
        } else {
          router.push(`/myorder`);
        }
      } else {
        setErrorMessage(resData.error || "পর্যাপ্ত ব্যালেন্স নেই!");
        setDialogStep("insufficient");
        setIsSubmitting(false);
      }
    }, 2000);

  } catch (error: any) {
    console.error(error);
    setTimeout(() => {
      setErrorMessage("সিস্টেম নেটওয়ার্ক কানেকশন এরর!");
      setDialogStep("insufficient");
      setIsSubmitting(false);
    }, 2000);
  }
};

  const displayProductType = useMemo(() => {
    if (product?.productType === "UID" || product?.productType === "UID Topup") return "FreeFire";
    return product?.productType || "Topup";
  }, [product]);

  return (
    <div className="space-y-8 pt-4 pb-24 lg:pb-8">
      {/* ১. ভ্যারিয়েশন সেকশন */}
      <section className="relative bg-white rounded-md border border-slate-200 pt-5 shadow-none">
        <div style={{ backgroundColor: primaryColor }} className="absolute -top-5 left-3 z-10 flex items-center justify-center [width:clamp(42px,11vw,52px)] [height:clamp(34px,9vw,40px)] text-white rounded-full [font-size:clamp(15px,4vw,20px)] font-bold border-2 border-white ">1</div>
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
          nextStepId="step-2" // 👈 ক্লিক করলে অটো ২য় ধাপে স্ক্রোল করবে
        />
      </section>

      {/* ২. অ্যাকাউন্ট সেকশন */}
      <section className="relative bg-white rounded-md border border-slate-200 pt-5 shadow-none">
        <div style={{ backgroundColor: primaryColor }} className="absolute -top-5 left-3 z-10 flex items-center justify-center [width:clamp(42px,11vw,52px)] [height:clamp(34px,9vw,40px)] text-white rounded-full [font-size:clamp(15px,4vw,20px)] font-bold border-2 border-white">2</div>
        <div className="w-full pb-3">
          <h2 style={{ color: primaryColor }} className="[font-size:clamp(15px,4vw,20px)] mt-1 font-bold px-5">Account Info</h2>
          <hr className="mt-3 border-slate-200 w-full" />
        </div>
        
        <div className="px-2.5 pb-5 space-y-4">
          {cleanFields.map((labelName, index) => (
            <div key={index} className="space-y-1">
              <label className="[font-size:clamp(11px,2.8vw,14px)] font-medium text-slate-600">Enter {labelName}</label>
              <input 
                type="text" 
                value={inputValues[labelName] || ""}
                onChange={(e) => handleInputChange(labelName, e.target.value)}
                onFocus={(e) => (e.target.style.outlineColor = primaryColor)} 
                className="w-full px-3 py-2.5 rounded-md border border-slate-200 focus:outline [font-size:clamp(13px,3.2vw,16px)]" 
                placeholder={`Enter your ${labelName}`}
              />
            </div>
          ))}

          {showNameChecker && (
            <div className="pt-1">
              <button
                type="button"
                onClick={handleCheckUIDName}
                disabled={ffNameLoading}
                style={{ backgroundColor: primaryColor }}
                className="w-full px-6 py-2.5 rounded-md font-semibold [font-size:clamp(11px,2.8vw,14px)] text-white tracking-wide hover:opacity-90 transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed uppercase shadow-sm"
              >
                {ffNameLoading ? "Processing..." : "CLICK TO CHECK"}
              </button>

              {playerData && (
                <div className="mt-4 border border-slate-200 rounded-md overflow-hidden bg-slate-50/50 shadow-sm transition-all duration-300">
                  <div style={{ backgroundColor: primaryColor }} className="px-4 py-2 text-white text-xs font-bold uppercase tracking-wider flex items-center">
                    <FireIcon /> Player Account Details
                  </div>
                  
                  <div className="p-4 grid grid-cols-1 gap-3 sm:grid-cols-2 [font-size:clamp(12px,3.2vw,14px)]">
                    <div className="bg-white p-2.5 rounded-md border border-slate-100 min-w-0">
                      <span className="block text-[11px] text-slate-400 font-bold uppercase tracking-wide">Name</span>
                      <span style={{ color: primaryColor }} className="font-bold [font-size:clamp(13px,3.5vw,16px)] block mt-0.5 truncate">
                        {playerData.username}
                      </span>
                    </div>
                    
                    <div className="bg-white p-2.5 rounded-md border border-slate-100 min-w-0">
                      <span className="block text-[11px] text-slate-400 font-bold uppercase tracking-wide">UID</span>
                      <span className="font-bold text-slate-700 [font-size:clamp(13px,3.5vw,16px)] block mt-0.5 truncate">
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
        <div style={{ backgroundColor: primaryColor }} className="absolute -top-5 left-3 z-10 flex items-center justify-center [width:clamp(42px,11vw,52px)] [height:clamp(34px,9vw,40px)] text-white rounded-full [font-size:clamp(15px,4vw,20px)] font-bold border-2 border-white">3</div>
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

      {/* 💻 ডেস্কটপ (Large Screens) BUY NOW বাটন */}
      <div className=" lg:block space-y-3 pt-2">
        <button
          onClick={handleBuyNowSubmit}
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
              <span>Processing...</span>
            </>
          ) : (
            <span>BUY NOW</span>
          )}
        </button>
      </div>

      {/* Rules & Conditions সেকশন */}
      {product?.description && (
        <section className="bg-white border border-slate-200 rounded-md pt-5 pb-5 shadow-none transition-all">
        <div className="w-full pb-3 ">
          <div className="flex items-stretch pl-3 ">
            <svg fill="red" width="20px" height="20px" viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg"><path d="M116,136V104a12,12,0,0,1,24,0v32a12,12,0,0,1-24,0Zm124.23242,77.979a27.71154,27.71154,0,0,1-24.25586,14.01319H40.02344A28.00034,28.00034,0,0,1,15.79,185.96582L103.7666,33.97314v.00049a27.99988,27.99988,0,0,1,48.4668,0L240.21,185.96533A27.71359,27.71359,0,0,1,240.23242,213.979Zm-20.79394-15.99072L131.46191,45.99609a4.00012,4.00012,0,0,0-6.92382,0h0L36.56152,197.98828a4.0004,4.0004,0,0,0,3.46192,6.00391H215.97656a4.0004,4.0004,0,0,0,3.46192-6.00391ZM128,160a16,16,0,1,0,16,16A16.00016,16.00016,0,0,0,128,160Z"/></svg>
            
            <h2 className="font-bold text-red-500 [font-size:clamp(15px,4vw,20px)] pl-2 ">
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

      {/* ========================================================== */}
      {/* 🟢 WALLET DIALOG/MODAL COMPONENT (CLEAN SHADOW-LESS DESIGN) 🟢 */}
      {/* ========================================================== */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 animate-fade-in backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-md p-4 sm:p-6 shadow-none border border-slate-100 transition-all duration-300 overflow-hidden max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => { if (!isSubmitting) setIsDialogOpen(false); }}
              disabled={isSubmitting}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition disabled:opacity-30 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            {/* ১. ৩-স্টেপ প্রোগ্রেসবার */}
            {dialogStep === "loading" && (
              <div className="py-6 flex flex-col items-center justify-center text-center">
                <h3 className="[font-size:clamp(16px,4.5vw,20px)] font-black text-slate-800 uppercase tracking-wide mb-2">Processing Order</h3>
                <p className="text-xs text-slate-400 font-medium max-w-xs mb-10">Please hold on while we safely route your wallet checkout request.</p>
                
                <div className="w-full px-2 sm:px-4 relative flex items-center justify-between mb-12 shadow-none">
                  <div className="absolute left-5 sm:left-6 right-5 sm:right-6 top-3.5 h-[3px] bg-slate-100 rounded-full z-0" />
                  <div 
                    style={{ width: `calc(${progress}% - 12px)` }}
                    className="absolute left-5 sm:left-6 top-3.5 h-[3px] bg-green-500 rounded-full z-0 transition-all duration-300 ease-out origin-left"
                  />

                  {/* Step Node 1 */}
                  <div className="flex flex-col items-center relative z-10 shadow-none">
                    <div className={`[width:clamp(28px,7.5vw,32px)] [height:clamp(28px,7.5vw,32px)] rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-none ${
                      progress >= 0 ? "bg-green-500 border-green-500 text-white" : "bg-white border-slate-200 text-slate-400"
                    }`}>
                      {progress > 15 ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <span className="text-xs font-bold font-mono">1</span>
                      )}
                    </div>
                    <span className={`text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase mt-2.5 ${progress >= 0 ? "text-green-600" : "text-slate-400"}`}>Select</span>
                  </div>

                  {/* Step Node 2 */}
                  <div className="flex flex-col items-center relative z-10 shadow-none">
                    <div className={`[width:clamp(28px,7.5vw,32px)] [height:clamp(28px,7.5vw,32px)] rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-none ${
                      progress >= 50 ? "bg-green-500 border-green-500 text-white" : "bg-white border-slate-200 text-slate-400"
                    }`}>
                      {progress > 65 ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <span className="text-xs font-bold font-mono">2</span>
                      )}
                    </div>
                    <span className={`text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase mt-2.5 ${progress >= 50 ? "text-green-600" : "text-slate-400"}`}>Review</span>
                  </div>

                  {/* Step Node 3 */}
                  <div className="flex flex-col items-center relative z-10 shadow-none">
                    <div className={`[width:clamp(28px,7.5vw,32px)] [height:clamp(28px,7.5vw,32px)] rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-none ${
                      progress >= 95 ? "bg-green-500 border-green-500 text-white" : "bg-white border-slate-200 text-slate-400"
                    }`}>
                      <span className="text-xs font-bold font-mono">3</span>
                    </div>
                    <span className={`text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase mt-2.5 ${progress >= 95 ? "text-green-600" : "text-slate-400"}`}>Payment</span>
                  </div>
                </div>

                <span className="text-[11px] sm:text-xs font-bold font-mono px-3 sm:px-4 py-1.5 bg-slate-50 text-slate-500 rounded-full border border-slate-100 animate-pulse text-center">
                  {progress < 45 && "Checking balance info..."}
                  {progress >= 45 && progress < 90 && "Verifying system variation details..."}
                  {progress >= 90 && "Finalizing database records..."}
                </span>
                <span className="text-xs font-bold text-slate-400 mt-4 tracking-wider">1 --- 2 --- 3</span>
              </div>
            )}

            {/* ২. ডাইনামিক রিয়েল-টাইম এরর হ্যান্ডেল স্ক্রিন */}
            {dialogStep === "insufficient" && (
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="[width:clamp(52px,14vw,64px)] [height:clamp(52px,14vw,64px)] bg-red-100 rounded-full flex items-center justify-center text-red-500 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                </div>
                <div>
                  <h3 className="[font-size:clamp(16px,4.5vw,20px)] font-bold text-red-600">
                    {errorMessage === "This Method are not allow This Time" ? "Action Blocked" : "Order Cancelled"}
                  </h3>
                  <p className="text-[13px] sm:text-sm font-semibold text-slate-600 mt-1 bg-red-50 px-3 py-1 rounded-full border border-red-100 inline-block">
                    Reason: {errorMessage === "Insufficient Balance" ? "Insufficient Wallet Balance" : errorMessage === "Out of Stock" ? "Product Out of Stock (Stock 0)" : errorMessage}
                  </p>
                </div>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  {errorMessage === "Insufficient Balance" 
                    ? "আপনার ওয়ালেট ব্যালেন্স পর্যাপ্ত নয়। দয়া করে অ্যাকাউন্টে ব্যালেন্স রিচার্জ করে পুনরায় চেষ্টা করুন।" 
                    : errorMessage === "Out of Stock" 
                    ? "দুঃখিত, এই ভ্যারিয়েশনটি বর্তমানে স্টকআউট! অ্যাডমিন প্যানেল থেকে এর স্টক বাড়িয়ে পুনরায় চেষ্টা করুন।" 
                    : errorMessage === "This Method are not allow This Time"
                    ? "This Method are not allow This Time"
                    : "ইউজার ওয়ালেট ব্যালেন্স কম অথবা প্রোডাক্টটি আউট অব স্টক। দয়া করে ব্যালেন্স রিচার্জ করে পুনরায় চেষ্টা করুন।"}
                </p>
                <button 
                  onClick={() => setIsDialogOpen(false)}
                  className="mt-2 px-6 py-2 bg-slate-800 text-white font-semibold rounded-full text-sm hover:bg-slate-700 transition"
                >
                  Close & Retry
                </button>
              </div>
            )}

            {/* ৩. সফল পারচেজ ও ডাইনামিক ডেটা প্রদর্শন স্ক্রিন (ফিক্সড ও কমপ্লিট) */}
            {dialogStep === "success" && (
              <div className="flex flex-col items-center text-center shadow-none">
                <div className="relative my-4 flex items-center justify-center">
                  <div className="absolute inset-0 bg-green-200/40 rounded-full blur-xl scale-150 animate-pulse" />
                  <div className="relative [width:clamp(64px,17vw,80px)] [height:clamp(64px,17vw,80px)] rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-white border-4 border-white shadow-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>

                <h2 className="[font-size:clamp(16px,4.5vw,20px)] font-extrabold text-slate-800 tracking-wide uppercase mt-2">
                  PAYMENT SUCCESSFUL!
                </h2>
                <p className="text-xs text-slate-400 font-medium px-4 mt-1 leading-relaxed">
                  Thank you for your purchase. Your order has been successfully placed.
                </p>

                <div className="w-full bg-slate-50 border border-slate-100 rounded-md p-3 sm:p-4 my-5 text-left text-xs space-y-3 shadow-none">
                  <h4 className="text-sm font-bold text-slate-700 mb-1">Order Summary</h4>
                  
                  <div className="flex justify-between items-center gap-2 border-b border-dashed border-slate-200 pb-1.5">
                    <span className="text-slate-400 font-medium shrink-0">Order ID</span>
                    <span className="font-mono font-bold text-slate-700 truncate">#{apiResponse?.orderId ? apiResponse.orderId.substring(0, 12).toUpperCase() : "ROOTS-ORDER"}</span>
                  </div>

                  <div className="flex justify-between items-center gap-2 border-b border-dashed border-slate-200 pb-1.5">
                    <span className="text-slate-400 font-medium shrink-0">Product Type</span>
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md truncate">{displayProductType}</span>
                  </div>

                  {/* লজিক ১: UID টাইপ */}
                  {(product?.productType === "UID" || product?.productType === "UID Topup") && (
                    <div className="flex justify-between items-center gap-2 border-b border-dashed border-slate-200 pb-1.5 bg-green-50/40 p-2 rounded-xl">
                      <span className="text-slate-500 font-semibold shrink-0">Player UID</span>
                      <span className="font-bold text-green-700 text-sm truncate">{inputValues[cleanFields[0]] || "N/A"}</span>
                    </div>
                  )}

                  {/* লজিক ২: Voucher টাইপ */}
                  {product?.productType === "Voucher" && apiResponse?.voucherCode && (
                    <div className="border-b border-dashed border-slate-200 pb-2 bg-amber-50/50 p-2.5 rounded-md space-y-1.5">
                      <span className="text-slate-500 font-bold block">Voucher Code</span>
                      <div className="flex items-center justify-between gap-2 bg-white border border-amber-200 px-2 py-1.5 rounded-md">
                        <span className="font-mono text-xs font-extrabold text-amber-800 tracking-wide select-all truncate">{apiResponse.voucherCode}</span>
                        <button 
                          onClick={() => copyToClipboard(apiResponse.voucherCode)}
                          className="text-amber-600 hover:text-amber-800 p-1 bg-amber-100 rounded transition shrink-0"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* লজিক ৩: অন্যান্য ডাইনামিক ফিল্ডস */}
                  {product?.productType !== "UID" && product?.productType !== "UID Topup" && product?.productType !== "Voucher" && (
                    <div className="bg-slate-100/80 p-2.5 rounded-md space-y-1.5">
                      {cleanFields.map((label, idx) => (
                        <div key={idx} className="flex justify-between items-center gap-2 text-[11px]">
                          <span className="text-slate-500 font-medium shrink-0">{label}</span>
                          <span className="font-bold text-slate-700 truncate max-w-[55%]">{inputValues[label] || "N/A"}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center gap-2 border-b border-dashed border-slate-200 pb-1.5">
                    <span className="text-slate-400 font-medium shrink-0">Order Place Time</span>
                    <span className="font-medium text-slate-600 text-[11px] truncate">{orderTime}</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-1.5">
                    <span className="text-slate-400 font-medium">Order Status</span>
                    <span className="font-bold uppercase tracking-wider text-[11px] text-green-600">
                      • {apiResponse?.status || "Complete"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-700 font-bold text-sm">TOTAL Paid</span>
                    <span style={{ color: primaryColor }} className="font-extrabold text-base">
                      ৳{apiResponse?.totalPrice || basePrice}
                    </span>
                  </div>
                </div>

                {/* ডায়ালগ ফুটার বাটনসমূহ */}
                <div className="w-full grid grid-cols-2 gap-3 mt-1 shadow-none">
                  <button
                    onClick={() => setIsDialogOpen(false)}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm transition-colors duration-200"
                  >
                    Close
                  </button>
                  <Link
                    href={
                      product?.productType?.toLowerCase() === "vouchers" || product?.productType?.toLowerCase() === "voucher"
                        ? "/code"
                        : "/myorder"
                    }
                    style={{ backgroundColor: primaryColor }}
                    className="w-full py-2.5 text-white font-semibold rounded-md text-xs sm:text-sm text-center flex items-center justify-center hover:opacity-95 transition-opacity"
                  >
                    View Order
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

export default ProductPurchaseFlow;