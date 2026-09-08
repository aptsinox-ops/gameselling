"use client";

import { useState, useEffect, useMemo } from "react";

function TakaSvg({ className = "h-3.5 w-auto" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 220 270"
      className={`inline-block select-none pointer-events-none fill-current ${className}`}
      style={{ verticalAlign: "middle" }}
    >
      <g transform="translate(-345.19429,-399.56217)">
        <path d="m 392.33418,406.42427 c 10.74527,2.9e-4 19.16243,4.4775 25.2515,13.43164 6.44712,8.59653 10.02889,20.41637 10.74531,35.45955 l 0,56.41291 15.04344,0 25.2515,25.78876 -40.29494,0 0,73.06815 c -7e-5,5.73092 2.14899,10.92448 6.44719,15.5807 4.29805,4.65638 11.2825,6.98453 20.95337,6.98446 12.53609,7e-5 25.78863,-6.98438 39.75767,-20.95337 14.32693,-14.32698 21.84865,-29.01223 22.56516,-44.05579 l -6.44719,0.53726 c -22.92347,1.4e-4 -34.38513,-12.17788 -34.38501,-36.53407 -1.2e-4,-8.2379 2.68621,-15.58053 8.05899,-22.0279 5.37252,-6.44699 14.32694,-9.67058 26.86329,-9.67078 13.25239,2e-4 24.35587,5.73103 33.31048,17.1925 9.31241,11.46184 13.96871,25.43074 13.96891,41.90673 -1.9e-4,24.35617 -10.38733,47.63767 -31.16142,69.84456 -20.41625,22.20704 -44.77227,33.31052 -73.06815,33.31048 -10.38722,4e-5 -21.49071,-4.47717 -33.31048,-13.43165 -11.46172,-9.31254 -18.26708,-18.26696 -20.41609,-26.86329 l 0,-84.88799 -25.78877,0 -24.71422,-25.78876 50.50298,0 0,-51.04025 c -4e-5,-10.38689 -6.26814,-16.4759 -18.8043,-18.26704 -5.73086,2.6e-4 -9.49171,0.8957 -11.28258,2.68633 -3.22361,-5.3724 -6.26811,-11.81958 -9.13352,-19.34157 l 0,-2.68633 c -10e-6,-4.65602 3.58176,-8.59597 10.74531,-11.81985 7.16353,-3.2233 13.61071,-4.8351 19.34157,-4.83539" />
      </g>
    </svg>
  );
}

interface Variation {
  id: string;
  productId: string;
  title: string;
  amount: number;
  price: number;
  offerPrice: number | null;
  bonus?: number | null;
  image: string | null;
  status: string;
  sortOrder: number;
  stock: number;
}

interface VariationSelectorProps {
  variations: Variation[];
  isListView: boolean;
  variationIcon?: string | null;
  resellerPercentage?: number;
  userRole?: string;
  onChange?: (price: number, variation: Variation | null) => void;
  primaryColor?: string;
  userBalance?: number;
  onAddBalance?: () => void;
  isInstantPayment?: boolean;
  paymentMethod?: string;
  nextStepId?: string;
  onNextStep?: () => void;
}

export default function VariationSelector({
  variations = [],
  isListView,
  variationIcon,
  resellerPercentage = 0,
  userRole = "User",
  onChange,
  primaryColor = "#2563eb",
  userBalance = 0,
  onAddBalance,
  isInstantPayment = false,
  paymentMethod,
  nextStepId = "step-2",
  onNextStep,
}: VariationSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeVariations = useMemo(() => {
    return variations
      .filter((v) => v.status === "ON")
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [variations]);

  /* 🎯 রিসেলার ও ডিসকাউন্ট প্রাইস হিসেব করার লজিক */
  const calculateFinalPrice = (basePrice: number) => {
    const isReseller = userRole?.toLowerCase()?.includes("reseller");
    if (isReseller && resellerPercentage > 0) {
      return basePrice - (basePrice * resellerPercentage) / 100;
    }
    return basePrice;
  };

  const selectedVar = useMemo(() => {
    return activeVariations.find((v) => v.id === selectedId) || null;
  }, [selectedId, activeVariations]);

  const currentSelectedPrice = useMemo(() => {
    if (!selectedVar) return 0;
    const hasOffer = selectedVar.offerPrice != null && Number(selectedVar.offerPrice) > 0;
    const basePriceToUse = hasOffer ? Number(selectedVar.offerPrice) : Number(selectedVar.price);
    return Math.round(calculateFinalPrice(basePriceToUse) * 100) / 100;
  }, [selectedVar, resellerPercentage, userRole]);

  const isInstant = isInstantPayment || paymentMethod === "instant";

  const isBalanceInsufficient = useMemo(() => {
    if (isInstant) return false;
    if (!selectedVar || selectedVar.stock <= 0) return false;
    return userBalance < currentSelectedPrice;
  }, [selectedVar, userBalance, currentSelectedPrice, isInstant]);

  const handleSelectVariation = (id: string) => {
    setSelectedId(id);

    if (onNextStep) {
      onNextStep();
    } else if (nextStepId) {
      setTimeout(() => {
        const nextElement = document.getElementById(nextStepId);
        if (nextElement) {
          nextElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  useEffect(() => {
    if (!selectedId) {
      if (onChange) onChange(0, null);
      return;
    }

    if (!selectedVar || selectedVar.stock <= 0) return;

    if (onChange) {
      onChange(currentSelectedPrice, selectedVar);
    }
  }, [selectedId, activeVariations, resellerPercentage, userRole, selectedVar, currentSelectedPrice]);

  if (activeVariations.length === 0) {
    return <div className="px-3 pb-4 text-slate-400 text-xs font-sans">No variations available.</div>;
  }

  return (
    <div className="p-2 sm:p-3 mb-4 sm:mb-5 bg-white rounded-b-md text-slate-800">
      
      {/* 1. ভ্যারিয়েশন বাটনগুলোর গ্রিড */}
      <div
        className={`grid gap-2 sm:gap-2.5 ${
          isListView ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-3"
        }`}
      >
        {activeVariations.map((item) => {
          const isSelected = selectedId === item.id;
          const isStockOut = item.stock <= 0;

          const hasDiscount = item.offerPrice != null && Number(item.offerPrice) > 0;
          const originalPrice = Math.round(calculateFinalPrice(item.price) * 100) / 100;
          const currentPrice = hasDiscount ? Math.round(calculateFinalPrice(Number(item.offerPrice)) * 100) / 100 : originalPrice;

          return (
            <button
              key={item.id}
              type="button"
              disabled={isStockOut}
              onClick={() => !isStockOut && handleSelectVariation(item.id)}
              style={
                isStockOut
                  ? { borderColor: "#ff8a8a" }
                  : isSelected
                  ? { borderColor: primaryColor }
                  : {}
              }
              className={`group relative flex items-center justify-between p-2.5 sm:p-3 min-h-[50px] sm:min-h-[56px] rounded-lg border text-left gap-1.5 sm:gap-2.5 w-full transition-all duration-150 ease-out outline-none overflow-hidden ${
                isStockOut
                  ? "bg-white cursor-not-allowed select-none"
                  : isSelected
                  ? "shadow-2xs"
                  : "border-slate-200 bg-white hover:border-slate-300 cursor-pointer active:scale-[0.98]"
              }`}
            >
              {/* 🔴 কোণাকুণি দাগ (স্টক আউট হলে) */}
              {isStockOut && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" preserveAspectRatio="none">
                  <line x1="0" y1="0" x2="100%" y2="100%" stroke="#ff8a8a" strokeWidth="1.2" />
                </svg>
              )}

              {/* 🔴 "STOCK OUT" ব্যাজ */}
              {isStockOut && (
                <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                  <span className="bg-[#ff8a8a] text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap shadow-xs">
                    STOCK OUT
                  </span>
                </div>
              )}

              {/* বাম পাশের কন্টেনার: আইকন/ডট এবং টাইটেল */}
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 z-10 flex-1">
                {variationIcon ? (
                  <img
                    src={variationIcon}
                    alt="icon"
                    className={`w-4 h-4 sm:w-4.5 sm:h-4.5 object-contain flex-shrink-0 rounded-md ${
                      isStockOut ? "grayscale opacity-30" : ""
                    }`}
                  />
                ) : isSelected && !isStockOut ? (
                  <span
                    style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 border transition-all duration-150"
                  />
                ) : null}

                <div className="flex flex-wrap items-center gap-1 min-w-0 [font-size:clamp(11px,2.8vw,13.5px)] font-medium font-sans">
                  <span
                    style={isSelected && !isStockOut ? { color: primaryColor } : {}}
                    className={`transition-colors leading-tight truncate ${
                      isStockOut ? "text-slate-400/50 font-normal" : isSelected ? "font-bold" : "text-slate-600"
                    }`}
                  >
                    {item.title}
                  </span>

                  {item.bonus && item.bonus > 0 ? (
                    <span
                      className={`font-semibold flex-shrink-0 [font-size:clamp(9.5px,2.4vw,11.5px)] ${
                        isStockOut ? "text-slate-400/40" : "text-orange-500"
                      }`}
                    >
                      +{item.bonus}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* ⚡ প্রাইস কন্টেনার */}
              <div
                className={`flex items-center justify-end flex-shrink-0 select-none transition-all duration-200 ease-out z-10 whitespace-nowrap ${
                  isSelected && !isStockOut ? "mr-3.5 sm:mr-4" : "mr-0"
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {/* অফার প্রাইস থাকলে মূল প্রাইস কেটে দেখানো */}
                  {hasDiscount && (
                    <span className="text-slate-400 text-[9.5px] sm:text-[11px] font-medium line-through decoration-red-500/60 leading-none">
                      {originalPrice}
                    </span>
                  )}

                  {/* মেইন প্রাইস */}
                  <span
                    className={`[font-size:clamp(11px,2.8vw,13.5px)] font-bold flex items-center space-x-0.5 font-sans leading-none ${
                      isStockOut ? "text-yellow-500/40" : "text-orange-500"
                    }`}
                  >
                    <span>{currentPrice}</span>
                    <TakaSvg
                      className={`h-2.5 sm:h-3 w-auto ${
                        isStockOut ? "fill-yellow-500/40" : "fill-orange-500"
                      }`}
                    />
                  </span>
                </div>
              </div>

              {/* সিলেক্টেড টিক মার্ক ব্যাজ */}
              <div
                style={isSelected && !isStockOut ? { backgroundColor: primaryColor } : {}}
                className={`absolute top-0 right-0 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center transition-all duration-150 transform origin-top-right rounded-bl-lg ${
                  isSelected && !isStockOut ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="3.5"
                  stroke="white"
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. 🔴 অপর্যাপ্ত ব্যালেন্স অ্যালার্ট বক্স */}
      {isBalanceInsufficient && (
        <div className="mt-3.5 sm:mt-4 rounded-lg border border-red-200 overflow-hidden bg-[#fff5f5] shadow-xs">
          <div className="bg-[#f04438] text-white px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Insufficient balance</span>
          </div>

          <div className="p-2.5 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 text-red-700">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium">
              <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                You do not have sufficient balance to purchase this package. Please choose another package or add balance.
              </span>
            </div>

            <button
              type="button"
              onClick={onAddBalance}
              className="w-full sm:w-auto bg-[#f04438] hover:bg-red-600 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-md transition-all flex items-center justify-center gap-1 whitespace-nowrap shadow-xs cursor-pointer"
            >
              <span>+</span>
              <span>Add Money</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}