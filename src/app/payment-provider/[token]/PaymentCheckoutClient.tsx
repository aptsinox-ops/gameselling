"use client";

import { useState } from "react";
import { toast } from "sonner";
import CustomerSummary from "@/components/payment/CustomerSummary";
import PaymentMethodsList from "@/components/payment/PaymentMethodsList";

interface PaymentCheckoutClientProps {
  invoice: any;
  settings: any;
}

export default function PaymentCheckoutClient({
  invoice,
  settings,
}: PaymentCheckoutClientProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("bkash");
  const [loading, setLoading] = useState<boolean>(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState<boolean>(false);

  const siteName = settings?.siteName || "UddoktaPay";
  const logoUrl = settings?.faviconUrl || undefined;
  const primaryColor = settings?.primaryColor || "#2596be";

  const handlePay = async () => {
    if (!selectedMethod) {
      toast.error("দয়া করে একটি পেমেন্ট মেথড নির্বাচন করুন।");
      return;
    }

    setLoading(true);

    try {
      // লোকাল এপিআই দিয়ে পেমেন্ট ভেরিফাই বা প্রসেস করা
      const res = await fetch("/api/payment/verify-local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: invoice.token,
          method: selectedMethod,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("পেমেন্ট সফল হয়েছে!");
        window.location.href = `/add-money?status=success&invoice_id=${invoice.invoiceId}&amount=${invoice.amount}`;
      } else {
        toast.error(data.message || "পেমেন্ট ব্যর্থ হয়েছে।");
        setLoading(false);
      }
    } catch (err) {
      toast.error("নেটওয়ার্ক সমস্যা! আবার চেষ্টা করুন।");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f6f9] flex flex-col items-center justify-center p-3 sm:p-6 font-[Inter,sans-serif]">
      {/* 📱 Mobile Collapsible Summary Header */}
      <div className="w-full max-w-[860px] md:hidden bg-white border border-gray-200 rounded-lg mb-3 overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
          className="w-full p-4 flex items-center justify-between bg-white"
        >
          <div className="flex items-center gap-2.5 text-left">
            <span className="font-semibold text-sm text-gray-900">{siteName}</span>
            <span className="text-xs text-gray-400">({invoice.invoiceId.slice(-8)})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-gray-900">{invoice.amount} BDT</span>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${mobileSummaryOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {mobileSummaryOpen && (
          <div className="px-4 pb-5 pt-1 border-t border-gray-100 bg-gray-50/50">
            <CustomerSummary
              siteName={siteName}
              logoUrl={logoUrl}
              trxId={invoice.invoiceId}
              expiresIn="8m 33s"
              amount={invoice.amount}
              userName={invoice.user?.name || "Customer"}
              userEmail={invoice.user?.email || "customer@gmail.com"}
              userPhone={invoice.user?.phone || ""}
            />
          </div>
        )}
      </div>

      {/* 💻 Main Checkout Card (Desktop & Mobile view) */}
      <div className="w-full max-w-[860px] bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
        {/* Left Section - Customer & Invoice Details (Desktop) */}
        <div className="hidden md:block md:col-span-5 p-6 border-r border-gray-100 bg-[#fbfcfd]">
          <CustomerSummary
            siteName={siteName}
            logoUrl={logoUrl}
            trxId={invoice.invoiceId}
            expiresIn="8m 33s"
            amount={invoice.amount}
            userName={invoice.user?.name || "Customer"}
            userEmail={invoice.user?.email || "customer@gmail.com"}
            userPhone={invoice.user?.phone || ""}
          />
        </div>

        {/* Right Section - Payment Methods */}
        <div className="col-span-1 md:col-span-7 p-5 sm:p-7 bg-white">
          <PaymentMethodsList
            amount={invoice.amount}
            selectedMethod={selectedMethod}
            onSelectMethod={setSelectedMethod}
            onPay={handlePay}
            loading={loading}
            primaryColor={primaryColor}
          />
        </div>
      </div>
    </main>
  );
}