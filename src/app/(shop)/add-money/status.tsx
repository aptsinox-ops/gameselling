"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function PaymentStatus() {
  const searchParams = useSearchParams();

  const status = searchParams.get("status");
  const invoiceId = searchParams.get("invoice_id") || searchParams.get("invoice") || "N/A";
  const amount = searchParams.get("amount") || "N/A";

  // 🔔 টোস্ট নোটিফিকেশন ফায়ার করা
  useEffect(() => {
    if (!status) return;

    if (status === "success" || status === "completed") {
      toast.success("🎉 পেমেন্ট সফল হয়েছে! ব্যালেন্স যোগ করা হয়েছে।");
    } else if (status === "pending") {
      toast.warning("⏳ পেমেন্ট পেন্ডিং অবস্থায় আছে।");
    } else if (status === "cancelled") {
      toast.error("❌ পেমেন্ট বাতিল করা হয়েছে।");
    } else if (status === "failed") {
      toast.error("❌ পেমেন্ট ব্যর্থ হয়েছে! আবার চেষ্টা করুন।");
    } else if (status === "error") {
      toast.error("⚠️ পেমেন্ট প্রক্রিয়াকরণে সমস্যা হয়েছে।");
    }
  }, [status]);

  if (!status) return null;

  // 🟢 ১. SUCCESS CARD
  if (status === "success" || status === "completed") {
    return (
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-md border border-emerald-100 text-center my-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-50">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-2xl font-extrabold text-gray-900">Payment successful!</h2>
        <p className="text-xs text-gray-500 mt-1">Done Check Balance।</p>

        {/* Transaction Summary */}
        <div className="mt-6 bg-emerald-50/60 border border-emerald-100 rounded-md p-4 text-left space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-gray-600">
            <span>Invoice ID:</span>
            <span className="font-mono font-bold text-gray-800">{invoiceId}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span>Amount:</span>
            <span className="font-bold text-emerald-700 text-sm">৳ {amount}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span>Status:</span>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">COMPLETED</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2.5">
          <Link
            href="/"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-md transition text-xs flex items-center justify-center gap-2 shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // 🟡 ২. PENDING CARD
  if (status === "pending") {
    return (
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-md border border-amber-100 text-center my-6">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-amber-50 animate-pulse">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h2 className="text-2xl font-extrabold text-gray-900">Pending Payment</h2>
        <p className="text-xs text-gray-500 mt-1">Please Wait for submit Your {amount}BDT</p>

        {/* Transaction Summary */}
        <div className="mt-6 bg-amber-50/60 border border-amber-100 rounded-md p-4 text-left space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-gray-600">
            <span>Invoice ID:</span>
            <span className="font-mono font-bold text-gray-800">{invoiceId}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span>Amount:</span>
            <span className="font-bold text-amber-700 text-sm">৳ {amount}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span>Status:</span>
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px]">PENDING</span>
          </div>
        </div>

        {/* Pending Explanation */}
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-3 text-left">
          <p className="text-[11px] font-bold text-gray-700 mb-1">Tips:</p>
          <ul className="text-[11px] text-gray-600 list-disc list-inside space-y-1 leading-relaxed">
            <li>মোবাইল ব্যাংকিং (bKash/Nagad/rocket) সার্ভারে দেরি হলে এটি পেন্ডিং দেখায়।</li>
            <li>কনফার্ম হতে ১-২ মিনিট লাগতে পারে, নিচে রিফ্রেশ বাটনে ক্লিক করে চেক করুন।</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 rounded-md transition text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reflase
          </button>
          <Link
            href="/"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-md transition text-xs flex items-center justify-center gap-2"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // 🔴 ৩. FAILED / CANCELLED / ERROR CARD
  return (
    <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-md border border-rose-100 text-center my-6">
      <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-rose-50">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>

      <h2 className="text-2xl font-extrabold text-gray-900">
        {status === "cancelled" ? "পেমেন্ট বাতিল করা হয়েছে" : "পেমেন্ট ব্যর্থ হয়েছে!"}
      </h2>
      <p className="text-xs text-gray-500 mt-1">পেমেন্ট প্রক্রিয়াটি সম্পন্ন করা সম্ভব হয়নি।</p>

      {/* Transaction Details */}
      <div className="mt-6 bg-rose-50/60 border border-rose-100 rounded-md p-4 text-left space-y-2.5 text-xs">
        <div className="flex justify-between items-center text-gray-600">
          <span>ইনভয়েস আইডি:</span>
          <span className="font-mono font-bold text-gray-800">{invoiceId}</span>
        </div>
        <div className="flex justify-between items-center text-gray-600">
          <span>টাকার পরিমাণ:</span>
          <span className="font-bold text-rose-700 text-sm">৳ {amount}</span>
        </div>
        <div className="flex justify-between items-center text-gray-600">
          <span>স্ট্যাটাস:</span>
          <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded-full font-bold text-[10px]">
            {status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Failure Reasons */}
      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-md p-3 text-left">
        <p className="text-[11px] font-bold text-gray-700 mb-1">❓ ব্যর্থ হওয়ার সম্ভাব্য কারণ:</p>
        <ul className="text-[11px] text-gray-600 list-disc list-inside space-y-1 leading-relaxed">
          {status === "cancelled" ? (
            <li>আপনি নিজেই পেমেন্ট গেটওয়ে পেজে গিয়ে পেমেন্ট বাতিল করেছেন।</li>
          ) : (
            <>
              <li>ভুল PIN অথবা OTP সাবমিট করা হয়েছিল।</li>
              <li>মোবাইল ওয়ালেটে পর্যালোচিত টাকার অভাব ছিল।</li>
              <li>সময় পার হওয়ার কারণে গেটওয়ে সেশন ক্লোজ হয়ে গেছে।</li>
            </>
          )}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col gap-2.5">
        <Link
          href="/add-money"
          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-md transition text-xs flex items-center justify-center gap-2 shadow-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          আবার চেষ্টা করুন
        </Link>
        <Link
          href="/"
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-md transition text-xs flex items-center justify-center gap-2"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}