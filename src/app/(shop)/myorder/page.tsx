import React from "react";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // আপনার authOptions এর পাথ অনুযায়ী মিলিয়ে নিন
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MyOrdersPage() {
  // 🟢 ১. লগইন করা সেশন চেক করা
  const session = await getServerSession(authOptions);

  // 🟢 ২. লগইন না থাকলে সরাসরি /login পেজে পাঠাবে
  if (!session || !session.user) {
    redirect("/login");
  }

  // 🟢 ৩. ডাটাবেজ থেকে শুধুমাত্র এই ইউজারের অর্ডারগুলো নিয়ে আসা (where কন্ডিশন দিয়ে)
  const allOrders = await db.order.findMany({
    where: {
      userId: Number((session.user as any).id), // অথবা ইমেইল দিয়ে চাইলে: user: { email: session.user.email! }
    },
    include: {
      variation: true,
      product: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // ২. শুধুমাত্র ভাউচার বাদে বাকি সব প্রোডাক্ট ফিল্টার করা হচ্ছে (Uid Topup, Subscriptions ইত্যাদি)
  const filteredOrders = allOrders.filter((order) => {
    const type = order.product?.productType?.toLowerCase();
    return type !== "vouchers" && type !== "voucher";
  });

  // 🔹 ৩. ডাটাবেজের SiteSettings মডেল থেকে ডাইনামিক প্রাইমারি কালার আনা হচ্ছে
  const config = await db.siteSettings.findFirst();
  const primaryColor = config?.primaryColor || "#00d2ff"; // ডাটাবেজে না থাকলে স্কিমার ডিফল্ট কালার পাবে

  // ফিগমা স্ক্রিনশট অনুযায়ী DD/MM/YYYY ফরম্যাটে ডেট শো করার ফাংশন
  const formatBDDate = (dateString: Date) => {
    const date = new Date(dateString);
    const localized = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
    const day = String(localized.getDate()).padStart(2, '0');
    const month = String(localized.getMonth() + 1).padStart(2, '0');
    const year = localized.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // ফিগমার স্ট্যাটাস ডট এবং ক্যাপসুল বাটনের কালার ও টেক্সট ম্যাপিং
  const getStatusMeta = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "completed" || s === "complete" || s === "compelet") {
      return { color: "#22c55e", text: "Compelet" };
    }
    if (s === "cancelled" || s === "cancel" || s === "failed") {
      return { color: "#ef4444", text: "Cancelled" };
    }
    return { color: "#eab308", text: "Proccesing" }; // Pending বা Processing এর জন্য
  };

  return (
    <div className="w-full min-h-screen text-slate-800 p-4 md:p-6 font-sans">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* 🔹 BREADCRUMB */}
        <div className="text-sm font-medium tracking-wide">
          <span className="text-slate-400 text-lg">Home</span>
          <span className="text-slate-400 mx-1 text-lg">/</span>
          <span className="inline-block relative pb-0.5 font-semibold text-xl" style={{ color: primaryColor }}>
            Order
            <span 
              className="absolute bottom-0 left-0 w-full h-[2px] rounded-full" 
              style={{ backgroundColor: primaryColor }} 
            />
          </span>
        </div>

        {/* 🔹 ORDER LIST SECTIONS */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-md text-slate-400 text-sm">
              No orders found.
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusMeta = getStatusMeta(order.status);
              
              // ⚡ ডাটাবেজ থেকে quantity রিড করা হচ্ছে (না থাকলে ডিফল্ট ১)
              const orderQuantity = (order as any).quantity || 1; 

              // ⚡ ডাটাবেজ থেকে ডাইনামিক paymentMethod রিড করা হচ্ছে
              const paymentMethod = (order as any).paymentMethod || "Wallet";

              return (
                <div 
                  key={order.id} 
                  className="w-full bg-white border border-slate-200/80 rounded-md p-5 flex flex-col justify-between relative transition-all duration-200"
                  style={{ height: "auto" }}
                >
                  
                  {/* CARD HEADER: টাইটেল এবং স্ট্যাটাস ডট */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      {/* ডায়মন্ড শেপ আইকন */}
                      <div className="w-2.5 h-2.5 bg-slate-300 transform rotate-45 shrink-0" />
                      
                      <h3 className="font-bold text-base transition-colors" style={{ color: primaryColor }}>
                        {order.variation?.title || order.product?.name || "Package Item"}
                        
                        {/* ⚡ লজিক: কোয়ান্টিটি ১ এর বেশি হলেই কেবল প্রাইমারি কালারে ডানপাশে '+ X' শো করবে */}
                        {orderQuantity > 1 && (
                          <span style={{ color: primaryColor }} className="ml-1">
                            {` x ${orderQuantity}`}
                          </span>
                        )}
                      </h3>
                    </div>
                    {/* 🔹 রাইট সাইড স্ট্যাটাস সার্কেল ডট */}
                    <div 
                      className="w-4 h-4 rounded-full transition-transform shrink-0" 
                      style={{ backgroundColor: statusMeta.color }}
                    />
                  </div>

                  {/* CARD BODY: ইনফরমেশন লিস্ট */}
                  <div className="space-y-1 text-sm text-[#475569] font-medium tracking-wide">
                    <p>Product Type - {order.product?.productType || "Uid Topup"}</p>
                    
                    <p>Order ID - {order.receiptNo || order.id.substring(0, 8)}</p>
                    
                    {/* ⚡ যদি ভ্যারিয়েশনে বোনাস থাকে এবং তা ০ থেকে বড় হয় তবেই লাইনটি শো করবে */}
                    {order.variation?.bonus && order.variation.bonus > 0 ? (
                      <p>Bonus - {order.variation.bonus}</p>
                    ) : null}

                    {/* ⚡ Total Pay ডাটাবেজ থেকে ডাইনামিক মোট টাকা শো করবে */}
                    <p>Total Pay - {order.totalPrice}BDT</p>
                    
                    {/* ⚡ ডাইনামিক পেমেন্ট টাইপ (Wallet / Instant) */}
                    <p>Payment Type - {paymentMethod}</p>
                    
                    <p>Date - {formatBDDate(order.createdAt)}</p>
                    
                    {/* ⚡ ডাইনামিক ইনপুট ফিল্ড এরিয়া (Player UID ইত্যাদি) */}
                    {order.inputValues && typeof order.inputValues === "object" && 
                      Object.entries(order.inputValues as Record<string, any>).map(([key, value]) => (
                        <p key={key} className="break-all">
                          <span className="uppercase">{key}</span> - {String(value)}
                        </p>
                      ))}
                  </div>

                  {/* CARD FOOTER: রাইট অ্যালাইনড ক্যাপসুল স্ট্যাটাস বাটন */}
                  <div className="flex justify-end mt-4">
                    <span 
                      className="px-4 py-1.5 text-white font-semibold text-xs rounded-full shadow-xs tracking-wide select-none transition-opacity"
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