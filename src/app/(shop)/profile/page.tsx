import React from "react";
import { db } from "@/lib/db";
import ProfileClient from "./profile-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  // ১. সাইট সেটিংস এবং সেশন ফেচ
  const [session, siteSettings] = await Promise.all([
    getServerSession(authOptions),
    db.siteSettings.findFirst().catch(() => null),
  ]);

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  // ২. ইউজার ডাটা এবং অর্ডার ডাটা ফেচ
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: { orders: true },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 font-bold bg-gray-50">
        ডাটাবেজে কোনো ইউজার পাওয়া যায়নি!
      </div>
    );
  }

  // ৩. রিয়েল হিসাব (ক্যান্সেলড অর্ডার বাদ দিয়ে)
  const CANCELLED_STATUSES = new Set(["cancelled", "cancel", "failed", "rejected"]);
  const totalOrders = user.orders?.length || 0;
  const totalSpent = (user.orders || [])
    .filter((o) => !CANCELLED_STATUSES.has((o.status || "").toLowerCase()))
    .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

  const primaryColor = siteSettings?.primaryColor || "#00d2ff";

  // ৪. সিরিয়ালাইজড ডাটা (Next.js Props Issue ফিক্স)
  const userData = {
    id: user.id,
    name: user.name || "User",
    email: user.email,
    phone: user.phone || "",
    balance: user.balance || 0,
    image: user.image || session.user?.image || null,
    role: user.role || "User",
    createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
  };

  const safeSettings = siteSettings ? JSON.parse(JSON.stringify(siteSettings)) : null;

  return (
    <ProfileClient 
      initialUser={userData} 
      totalSpent={totalSpent} 
      totalOrders={totalOrders} 
      primaryColor={primaryColor}
      settings={safeSettings}
    />
  );
}