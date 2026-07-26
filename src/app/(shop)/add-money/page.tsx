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

  // 🎯 ১. যদি URL-এ status (pending / success / failed) থাকে, তবে শুধু Status Card দেখাবে
  if (status) {
    return <PaymentStatus />;
  }

  // 🎯 ২. যদি URL-এ status না থাকে, তবে সাধারণ Add Money Form দেখাবে
  const quickAmounts = [50, 100, 200, 500, 1000];

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = Number(amount);
    if (!numAmount) {
      toast.error("দয়া করে সঠিক টাকার পরিমাণ দিন।");
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
    <div>
        <div className="w-full max-w-md bg-white px-3 py-5 sm:p-5 rounded-md border border-gray-200">
        {/* Header */}
        <div className="text-center mb-6">
            <h1 className="flex items-stretch text-2xl font-bold text-gray-800">Add Money</h1>
            <p className="flex items-stretch text-[12px] sm:text-[13px]">Add Money to buy Anytings eles.</p>
        </div>

        {/* Quick Amount Selectors */}
        <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
            Quick Select 
            </label>
            <div className="grid grid-cols-5 gap-2">
            {quickAmounts.map((amt) => (
                <button
                key={amt}
                type="button"
                onClick={() => setAmount(String(amt))}
                className={`py-2 text-xs font-bold rounded-md border transition-all ${
                    amount === String(amt)
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
                >
                ৳{amt}
                </button>
            ))}
            </div>
        </div>

        {/* Form */}
        <form onSubmit={handleAddMoney} className="flex flex-col gap-4">
            <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                Enter Amount
            </label>
            <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-lg">৳</span>
                <input
                type="number"
                placeholder="e.g, 500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-md outline-none text-gray-800 font-semibold focus:border-blue-600 transition"
                />
            </div>
            </div>


            {/* Submit Button */}
            <button
            type="submit"
            disabled={loading}
            style={{
                backgroundColor: dynamicColor,
                opacity: loading ? 0.7 : 1,
            }}
            className={`w-full text-white font-bold py-3.5 rounded-md transition duration-200 flex items-center justify-center gap-2 ${
                loading ? "cursor-not-allowed" : "hover:opacity-90 cursor-pointer"
            }`}
            >
            {loading ? (
                <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
                </>
            ) : (
                "Proceed to Payment"
            )}
            </button>
        </form>
        </div>

        {/* second bar */}
        <div className="w-full max-w-md mt-3 bg-white px-3 py-5 sm:p-5 rounded-md border border-gray-200">
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="flex items-stretch text-2xl font-bold text-gray-800">Tutorial</h1>
            </div>
            {/* video */}
        </div>
    </div>
  );
}

export default function AddMoneyPage() {
  return (
    <main className="min-h-[85vh] flex items-center justify-center bg-gray-50 px-4 py-10">
      <Suspense fallback={<div className="text-xs font-semibold text-gray-500">Loading...</div>}>
        <AddMoneyContent />
      </Suspense>
    </main>
  );
}