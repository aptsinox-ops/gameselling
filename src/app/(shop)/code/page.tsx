import React from "react";
import { db } from "@/lib/db";
import CopyButton from "./CopyButton"; // সেম ফোল্ডারে থাকা কপি বাটন কম্পোনেন্ট

export const dynamic = "force-dynamic";

export default async function VoucherCodesListPage() {
  // ১. ডাটাবেজ থেকে শুধু মাত্র "vouchers" টাইপের সব অর্ডার লেটেস্ট অনুযায়ী আনা হচ্ছে
  const voucherOrders = await db.order.findMany({
    where: {
      product: {
        productType: {
          equals: "vouchers",
          mode: "insensitive",
        },
      },
    },
    include: {
      variation: true,
      product: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // ২. ডাটাবেজের SiteSettings মডেল থেকে ডাইনামিক প্রাইমারি কালার আনা হচ্ছে
  const config = await db.siteSettings.findFirst();
  const primaryColor = config?.primaryColor || "#00d2ff";

  const formatBDDate = (dateString: Date) => {
    const date = new Date(dateString);
    const localized = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
    const day = String(localized.getDate()).padStart(2, '0');
    const month = String(localized.getMonth() + 1).padStart(2, '0');
    const year = localized.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusMeta = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "completed" || s === "complete" || s === "compelet") {
      return { color: "#22c55e", text: "Compelet", isComplete: true };
    }
    if (s === "cancelled" || s === "cancel" || s === "failed") {
      return { color: "#ef4444", text: "Cancelled", isCancelled: true };
    }
    return { color: "#eab308", text: "Proccesing", isProcessing: true };
  };

  return (
    <div className="w-full min-h-screen text-slate-800 p-4 md:p-6 font-sans">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* 🔹 BREADCRUMB */}
        <div className="text-sm font-medium tracking-wide">
          <span className="text-slate-400 text-lg">Home</span>
          <span className="text-slate-400 mx-1 text-lg">/</span>
          <span className="inline-block relative pb-0.5 font-semibold text-xl" style={{ color: primaryColor }}>
            Codes
            <span 
              className="absolute bottom-0 left-0 w-full h-[2px] rounded-full" 
              style={{ backgroundColor: primaryColor }} 
            />
          </span>
        </div>

        {/* 🔹 ORDER LIST SECTIONS */}
        <div className="space-y-4">
          {voucherOrders.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-md text-slate-400 text-sm">
              No purchased vouchers found.
            </div>
          ) : (
            voucherOrders.map((order) => {
              const statusMeta = getStatusMeta(order.status);
              
              // ⚡ কোড না থাকলে "No Voucher code Avalibale" দেখানোর লজিক
              let voucherBoxText = "Proccing Please Wait for Code"; 
              if (statusMeta.isComplete) {
                voucherBoxText = order.voucherCode || "No Voucher code Avalibale";
              } else if (statusMeta.isCancelled) {
                voucherBoxText = "CANCELLED";
              }

              return (
                <div 
                  key={order.id} 
                  className="w-full bg-white border border-slate-200/80 rounded-md p-5 flex flex-col justify-between relative transition-all duration-200 shadow-xs"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-slate-300 transform rotate-45 shrink-0" />
                      <h3 className="font-bold text-base" style={{ color: primaryColor }}>
                        {order.variation?.title || order.product?.name || "Game Voucher Pack"}
                      </h3>
                    </div>
                    <div 
                      className="w-4 h-4 rounded-full shrink-0" 
                      style={{ backgroundColor: statusMeta.color }}
                    />
                  </div>

                  <div className="space-y-1 text-sm text-[#475569] font-medium tracking-wide">
                    <p>Product Type - {order.product?.productType || "Vouchers"}</p>
                    <p>Order ID - {order.receiptNo || order.id.substring(0, 8)}</p>
                    <p>Total Pay - {order.totalPrice}BDT</p>
                    <p>Payment Type - Wallet</p>
                    <p>Date - {formatBDDate(order.createdAt)}</p>
                  </div>

                  {/* 🔹 ভাউচার কোড বক্স */}
                  <div className="w-full rounded-xl overflow-hidden border border-slate-300/40 mt-4 shadow-2xs">
                    <div className="bg-[#2d3748] px-3 py-1 text-[10px] font-bold text-slate-300 tracking-wider uppercase">
                      Your Voucher Code
                    </div>
                    <div className="bg-[#e2e8f0] px-3 py-2 flex justify-between items-center text-xs font-mono font-bold text-slate-700 min-h-[38px]">
                      <span className="truncate select-all max-w-[85%]">
                        {voucherBoxText}
                      </span>
                      {/* ⚡ শুধুমাত্র কমপ্লিট হলে এবং আসলেই কোড থাকলে কপি বাটন দেখাবে */}
                      {statusMeta.isComplete && order.voucherCode && (
                        <div className="scale-90 transition-transform hover:scale-100 origin-right">
                          <CopyButton text={order.voucherCode} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <span 
                      className="px-4 py-1.5 text-white font-semibold text-xs rounded-full tracking-wide"
                      style={{ backgroundColor: statusMeta.color }}
                    >
                      {statusMeta.text}
                    </span>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}