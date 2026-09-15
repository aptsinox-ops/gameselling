"use client";

import Image from "next/image";

interface CustomerSummaryProps {
  siteName: string;
  logoUrl?: string;
  trxId: string;
  expiresIn: string;
  amount: number;
  userName: string;
  userEmail: string;
  userPhone: string;
}

export default function CustomerSummary({
  siteName,
  logoUrl,
  trxId,
  expiresIn,
  amount,
  userName,
  userEmail,
  userPhone,
}: CustomerSummaryProps) {
  // ফোন নম্বর না থাকলে বা # / -- থাকলে "Not Provided" দেখাবে
  const formattedPhone =
    !userPhone || userPhone.trim() === "" || userPhone === "#" || userPhone === "---"
      ? "Not Provided"
      : userPhone;

  return (
    <div className="w-full flex flex-col h-full justify-between">
      <div>
        {/* Header Branding */}
        <div className="flex items-center justify-between pb-5 border-b border-[#2596be]/20">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <Image src={logoUrl} alt="Logo" width={40} height={40} className="rounded-md object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#2596be]/10 flex items-center justify-center text-[#2596be] font-bold text-lg">
                {siteName.charAt(0)}
              </div>
            )}
            <div>
              <h1
                className="font-inter font-semibold text-[15px] leading-[22.5px] text-[#111111]"
              >
                {siteName}
              </h1>
              <p className="text-[11px] text-gray-400 font-normal truncate max-w-[180px]">
                Trx ID: {trxId}
              </p>
              <p className="text-[11px] text-amber-600 font-medium mt-0.5">
                Expires in {expiresIn}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span
              className="font-inter font-bold text-[17px] leading-[25.5px] text-[#111111]"
            >
              {amount} BDT
            </span>
          </div>
        </div>

        {/* Pricing Subtotal / Total */}
        <div className="py-4 border-b border-[#2596be]/15 space-y-2">
          <div className="flex justify-between items-center font-inter font-normal text-[14px] leading-[20px] text-[#4D4D4D]">
            <span>Subtotal</span>
            <span>{amount} BDT</span>
          </div>
          <div className="flex justify-between items-center font-inter font-medium text-[15px] leading-[21.4px] text-[#4D4D4D]">
            <span>Total</span>
            <span>{amount} BDT</span>
          </div>
        </div>

        {/* Customer Details */}
        <div className="pt-5">
          <h3 className="font-inter font-normal text-[12px] leading-[16px] text-[#848484] uppercase tracking-wider mb-3">
            Customer Details
          </h3>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="font-inter font-normal text-[13px] leading-[19.5px] text-[#4D4D4D]">Name</span>
              <span className="font-inter font-medium text-[13px] leading-[19.5px] text-[#111111]">{userName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-inter font-normal text-[13px] leading-[19.5px] text-[#4D4D4D]">Email</span>
              <span className="font-inter font-medium text-[13px] leading-[19.5px] text-[#111111]">{userEmail}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-inter font-normal text-[13px] leading-[19.5px] text-[#4D4D4D]">Phone</span>
              <span className="font-inter font-medium text-[13px] leading-[19.5px] text-[#111111]">{formattedPhone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Support & Language */}
      <div className="flex items-center justify-between pt-8 text-[13px] font-inter font-normal text-[#949494]">
        <div className="flex items-center gap-1.5 hover:text-gray-700 cursor-pointer transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m2.829 2.829L18 18M12 12a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
          <span>Support</span>
        </div>
        <div className="flex items-center gap-1 hover:text-gray-700 cursor-pointer transition">
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.083 9h11.834a1 1 0 01.8 1.6l-5.917 7.889a1 1 0 01-1.6 0L3.283 10.6A1 1 0 014.083 9z" clipRule="evenodd" />
          </svg>
          <span>English</span>
        </div>
      </div>
    </div>
  );
}