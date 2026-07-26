import React from "react";
import { db } from "@/lib/db";
import ProfileClient from "./profile-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // আপনার Auth Options ফাইলের সঠিক পাথ দিন
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  // ⚡ ১. সাইট সেটিংস লোড (Footer Gradient & Primary Color)
  const siteSettings = await db.siteSettings.findFirst();
  const primaryColor = siteSettings?.primaryColor || "#00d2ff";

  // ⚡ ২. বর্তমান লগইন ইউজার সেশন
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  // ⚡ ৩. ডাটাবেজ থেকে লগইন থাকা ইউজারের ডাটা ফেস
  const user = await db.user.findUnique({
    where: {
      email: session.user.email,
    },
    include: {
      orders: true,
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-500 font-bold">
        ডাটাবেজে কোনো ইউজার পাওয়া যায়নি!
      </div>
    );
  }

  // ৪. রিয়েল হিসাব
  const totalOrders = user.orders.length;
  const totalSpent = user.orders
    .filter((o) => o.status?.toLowerCase() !== "cancelled" && o.status?.toLowerCase() !== "cancel")
    .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    balance: user.balance || 0,
    image: user.image || session.user.image || null,
    role: user.role || "User",
    createdAt: user.createdAt.toISOString(),
  };

  return (
    <ProfileClient 
      initialUser={userData} 
      totalSpent={totalSpent} 
      totalOrders={totalOrders} 
      primaryColor={primaryColor}
      settings={siteSettings} // 👈 ⚡ এই settings প্রপসটি নিশ্চিত করবে ফুটারের গ্রাডিয়েন্ট কালার লোড হওয়া
    />
  );
}