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
}

export default function PaymentMethodsList({
  amount,
  selectedMethod,
  onSelectMethod,
  onPay,
  loading,
}: PaymentMethodsProps) {
  const [activeTab, setActiveTab] = useState<"ALL" | "MFS" | "MORE">("ALL");

  const providers: PaymentProviderItem[] = [
    { id: "bangla_qr", name: "Bangla QR", category: "MFS", logo: "/banglaqr.png", active: true },
    { id: "bkash", name: "Bkash", category: "MFS", logo: "/bkashpersonal.png", active: true },
    { id: "nagad", name: "Nagad", category: "MFS", logo: "/nagadpersonal.png", active: true },
    { id: "rocket", name: "Rocket", category: "MFS", logo: "/rocketpersonal.png", active: true },
    { id: "upay", name: "Upay", category: "MFS", logo: "/upaypersonal.png", active: true },
    { id: "cellfin", name: "Cellfin Personal", category: "MFS", logo: "/cellfinpersonal.png", active: true },
    { id: "okwallet", name: "Ok Wallet", category: "MFS", logo: "/okwalletpersonal.png", active: true },
    { id: "pathaopay", name: "Pathao Pay", category: "MFS", logo: "/pathaopaypersonal.png", active: true },
    { id: "tap", name: "Tap", category: "MFS", logo: "/tappersonal.png", active: true },
    { id: "paddle", name: "Card & Paypal", category: "CARD", logo: "/paddle.png", active: true },
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
        {/* Header Title (Hidden on Mobile) */}
        <h2 className="hidden md:block font-['Space_Grotesk'] font-bold text-[18px] leading-[28px] text-[#111111] mb-4">
          Payment Options
        </h2>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 mb-4 md:mb-5">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`px-3.5 py-1.5 rounded-lg border text-[13px] font-inter font-semibold transition flex items-center gap-1.5 ${
              activeTab === "ALL"
                ? "border-blue-600 text-blue-600 bg-blue-50/50"
                : "border-[#ededed] text-[#4D4D4D] bg-white hover:bg-gray-50"
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
            className={`px-3.5 py-1.5 rounded-lg border text-[13px] font-inter font-semibold transition flex items-center gap-1.5 ${
              activeTab === "MFS"
                ? "border-blue-600 text-blue-600 bg-blue-50/50"
                : "border-[#ededed] text-[#4D4D4D] bg-white hover:bg-gray-50"
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
            className={`px-3.5 py-1.5 rounded-lg border text-[13px] font-inter font-semibold transition flex items-center gap-1.5 ${
              activeTab === "MORE"
                ? "border-blue-600 text-blue-600 bg-blue-50/50"
                : "border-[#ededed] text-[#4D4D4D] bg-white hover:bg-gray-50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            More
          </button>
        </div>

        {/* Payment Grid - Mobile 2 cols, PC 3 cols */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filteredProviders.map((p) => {
            const isSelected = selectedMethod === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectMethod(p.id)}
                className={`flex flex-col items-center justify-between rounded-xl border transition duration-150 cursor-pointer overflow-hidden ${
                  isSelected
                    ? "border-2 border-blue-600 bg-blue-50/20 shadow-xs"
                    : "border-[#ededed] bg-white hover:border-gray-300 hover:shadow-xs"
                }`}
              >
                {/* Logo Section */}
                <div className="h-16 w-full flex items-center justify-center p-2.5">
                  <img
                    src={p.logo}
                    alt={p.name}
                    className="max-h-10 sm:max-h-11 w-auto max-w-full object-contain"
                  />
                </div>

                {/* Divider Line */}
                <hr className="w-full border-t border-[#ededed] m-0" />

                {/* Text Section */}
                <div className="w-full py-2 px-1 text-center bg-white">
                  <span className="font-inter font-medium text-[12px] sm:text-[13px] text-[#333333] line-clamp-1">
                    {p.name}
                  </span>
                </div>
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
          className={`w-full font-inter font-semibold text-[15px] py-3.5 rounded-xl transition duration-200 ${
            selectedMethod && !loading
              ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm"
              : "bg-[#e2e8f0] text-gray-500 cursor-not-allowed"
          }`}
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