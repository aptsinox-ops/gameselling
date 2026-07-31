"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import PaymentStatus from "./status";

function AddMoneyContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [dynamicColor, setDynamicColor] = useState<string>("#2563eb");

  // 🎨 সাইট সেটিংস থেকে প্রাইমারি কালার ফেচ করা
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' });
        if (res.ok) {
          const siteSettings = await res.json();
          const data = siteSettings?.data || siteSettings;
          if (data?.primaryColor) {
            setDynamicColor(data.primaryColor);
          }
        }
      } catch (error) {
        // ignore error
      }
    }
    fetchSettings();
  }, []);

  if (status) {
    return <PaymentStatus />;
  }

  const quickAmounts = [50, 100, 200, 500, 1000];

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error("দয়া করে সঠিক টাকার পরিমাণ দিন।");
      return;
    }

    const userId = (session?.user as any)?.id;
    if (!session || !userId) {
      toast.error("পেমেন্ট করার জন্য আপনাকে অবশ্যই লগইন করতে হবে!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numAmount,
          name: session?.user?.name || "Customer",
          email: session?.user?.email || "customer@gmail.com",
          userId: userId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.payment_url) {
        toast.loading("পেমেন্ট গেটওয়েতে পাঠানো হচ্ছে...");
        window.location.href = data.payment_url;
      } else {
        toast.error(data.message || "পেমেন্ট তৈরি করতে সমস্যা হয়েছে।");
        setLoading(false);
      }
    } catch (err) {
      toast.error("নেটওয়ার্ক সমস্যা! আবার চেষ্টা করুন।");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-3">
      {/* 💳 Main Card */}
      <div className="w-full bg-white p-5 sm:p-6 rounded-md border border-gray-200">
        
        {/* Header Section */}
        <div className="flex items-center gap-3.5 pb-4 mb-5 border-b border-gray-100">
          <div 
            className="w-11 h-11 rounded-md flex items-center justify-center shrink-0"
            style={{ 
              backgroundColor: `${dynamicColor}12`, 
              color: dynamicColor 
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-snug">Add Money</h1>
            <p className="text-xs text-gray-500">Recharge your wallet instantly</p>
          </div>
        </div>

        {/* Quick Amount Selectors */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Quick Select
            </label>
            <span className="text-[11px] font-medium text-gray-400">BDT (৳)</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {quickAmounts.map((amt) => {
              const isSelected = amount === String(amt);
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(String(amt))}
                  style={
                    isSelected 
                      ? { borderColor: dynamicColor, color: dynamicColor, backgroundColor: `${dynamicColor}10` } 
                      : {}
                  }
                  className={`py-2 text-xs font-bold rounded-md border transition-all ${
                    isSelected
                      ? 'border-2'
                      : 'border-gray-200 bg-gray-50/50 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  ৳{amt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleAddMoney} className="flex flex-col gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
              Enter Amount
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-gray-400 font-bold text-lg select-none">৳</span>
              <input
                type="number"
                placeholder="e.g, 500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-9 pr-9 py-3 bg-gray-50/50 border border-gray-200 rounded-md text-gray-900 font-bold text-lg placeholder:text-gray-300 placeholder:font-normal outline-none focus:bg-white focus:border-gray-400 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount("")}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: dynamicColor,
              opacity: loading ? 0.75 : 1,
            }}
            className={`w-full text-white font-bold text-sm py-3.5 rounded-md transition duration-200 flex items-center justify-center gap-2 ${
              loading ? "cursor-not-allowed" : "hover:opacity-95 active:scale-[0.99] cursor-pointer"
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <span>Proceed to Payment</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Trust & Security Tag */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 mt-4 font-medium">
          <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>100% Encrypted & Safe Payment</span>
        </div>
      </div>

      {/* 📹 Tutorial Card */}
      <div className="w-full bg-white p-4 sm:p-5 rounded-md border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-amber-50 rounded-md text-amber-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-sm font-bold text-gray-800">Need Help? Watch Tutorial</h2>
        </div>
        
        {/* Placeholder / Video Box */}
        <div className="relative aspect-video w-full rounded-md bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 group cursor-pointer hover:border-gray-300 transition">
          <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 group-hover:scale-110 transition">
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z" />
            </svg>
          </div>
          <span className="text-xs font-medium mt-2 text-gray-500">How to add money tutorial</span>
        </div>
      </div>
    </div>
  );
}

export default function AddMoneyPage() {
  return (
    <main className="min-h-[85vh] flex items-center justify-center bg-gray-50/60 px-4 py-8">
      <Suspense fallback={<div className="text-xs font-semibold text-gray-500">Loading...</div>}>
        <AddMoneyContent />
      </Suspense>
    </main>
  );
}