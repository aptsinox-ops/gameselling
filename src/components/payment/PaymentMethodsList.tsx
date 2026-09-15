"use client";

import { useState } from "react";

export interface PaymentProviderItem {
  id: string;
  name: string;
  category: "MFS" | "CARD" | "OTHER";
  logo: string;
  active: boolean;
}

interface PaymentMethodsProps {
  amount: number;
  selectedMethod: string;
  onSelectMethod: (id: string) => void;
  onPay: () => void;
  loading: boolean;
  primaryColor?: string;
}

export default function PaymentMethodsList({
  amount,
  selectedMethod,
  onSelectMethod,
  onPay,
  loading,
  primaryColor = "#2596be",
}: PaymentMethodsProps) {
  const [activeTab, setActiveTab] = useState<"ALL" | "MFS" | "MORE">("ALL");

  // ভবিষ্যতে পেমেন্ট মেথড ডাইনামিক বা আনলিমিটেড এড করার জন্য এই এরে তৈরি করা হয়েছে
  const providers: PaymentProviderItem[] = [
    { id: "bangla_qr", name: "Bangla QR", category: "MFS", logo: "https://uddoktapay.com/assets/images/bangla_qr.png", active: true },
    { id: "bkash", name: "Bkash", category: "MFS", logo: "https://uddoktapay.com/assets/images/bkash.png", active: true },
    { id: "nagad", name: "Nagad", category: "MFS", logo: "https://uddoktapay.com/assets/images/nagad.png", active: true },
    { id: "rocket", name: "Rocket", category: "MFS", logo: "https://uddoktapay.com/assets/images/rocket.png", active: true },
    { id: "upay", name: "Upay", category: "MFS", logo: "https://uddoktapay.com/assets/images/upay.png", active: true },
    { id: "cellfin", name: "Cellfin Personal", category: "MFS", logo: "https://uddoktapay.com/assets/images/cellfin.png", active: true },
    { id: "okwallet", name: "Ok Wallet", category: "MFS", logo: "https://uddoktapay.com/assets/images/okwallet.png", active: true },
    { id: "pathaopay", name: "Pathao Pay", category: "MFS", logo: "https://uddoktapay.com/assets/images/pathaopay.png", active: true },
    { id: "tap", name: "Tap", category: "MFS", logo: "https://uddoktapay.com/assets/images/tap.png", active: true },
    { id: "paddle", name: "Card & Paypal", category: "CARD", logo: "https://uddoktapay.com/assets/images/paddle.png", active: true },
  ];

  const filteredProviders = providers.filter((p) => {
    if (!p.active) return false;
    if (activeTab === "ALL") return true;
    if (activeTab === "MFS") return p.category === "MFS";
    if (activeTab === "MORE") return p.category === "CARD" || p.category === "OTHER";
    return true;
  });

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Header Title */}
        <h2 className="font-['Space_Grotesk'] font-bold text-[18px] leading-[28px] text-[#111111] mb-4">
          Payment Options
        </h2>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            style={activeTab === "ALL" ? { backgroundColor: `${primaryColor}15`, color: primaryColor, borderColor: primaryColor } : {}}
            className={`px-3.5 py-1.5 rounded-lg border text-[13px] font-inter font-semibold transition flex items-center gap-1.5 ${
              activeTab === "ALL"
                ? "border-[#2596be]"
                : "border-gray-200 text-[#4D4D4D] bg-white hover:bg-gray-50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            All Options
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("MFS")}
            style={activeTab === "MFS" ? { backgroundColor: `${primaryColor}15`, color: primaryColor, borderColor: primaryColor } : {}}
            className={`px-3.5 py-1.5 rounded-lg border text-[13px] font-inter font-semibold transition flex items-center gap-1.5 ${
              activeTab === "MFS"
                ? "border-[#2596be]"
                : "border-gray-200 text-[#4D4D4D] bg-white hover:bg-gray-50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            MFS
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("MORE")}
            style={activeTab === "MORE" ? { backgroundColor: `${primaryColor}15`, color: primaryColor, borderColor: primaryColor } : {}}
            className={`px-3.5 py-1.5 rounded-lg border text-[13px] font-inter font-semibold transition flex items-center gap-1.5 ${
              activeTab === "MORE"
                ? "border-[#2596be]"
                : "border-gray-200 text-[#4D4D4D] bg-white hover:bg-gray-50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            More
          </button>
        </div>

        {/* Payment Grid */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 max-h-[340px] overflow-y-auto pr-1">
          {filteredProviders.map((p) => {
            const isSelected = selectedMethod === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectMethod(p.id)}
                style={isSelected ? { borderColor: primaryColor, backgroundColor: `${primaryColor}08` } : {}}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition duration-150 ${
                  isSelected
                    ? "border-2"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <div className="h-8 flex items-center justify-center mb-1.5">
                  <img src={p.logo} alt={p.name} className="max-h-7 object-contain" />
                </div>
                <span className="font-inter font-medium text-[12px] leading-[16px] text-[#333333] text-center line-clamp-1">
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pay Button & Cancel Link */}
      <div className="mt-6 flex flex-col items-center">
        <button
          type="button"
          onClick={onPay}
          disabled={loading || !selectedMethod}
          style={{ backgroundColor: primaryColor }}
          className="w-full text-white font-inter font-bold text-[15px] py-3.5 rounded-lg shadow-sm hover:opacity-95 transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing Payment..." : `Pay ${amount} BDT`}
        </button>

        <a
          href="/add-money?status=cancelled"
          className="mt-3 text-[12px] font-inter font-normal text-gray-500 hover:text-gray-700 underline transition"
        >
          Cancel and return to merchant
        </a>
      </div>
    </div>
  );
}