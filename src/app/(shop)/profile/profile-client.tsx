"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Copy, 
  Wallet, 
  ShoppingBag, 
  TrendingUp, 
  Phone, 
  Mail, 
  User as UserIcon, 
  BadgeCheck, 
  ShieldCheck, 
  Calendar,
  Pencil,
  X,
  Loader2,
  PlusCircle
} from "lucide-react";
import { toast } from "react-hot-toast";

interface SiteSettings {
  footerTopColor?: string | null;
  footerBottomColor?: string | null;
}

interface UserType {
  id: number | string;
  name: string;
  email: string;
  phone?: string | null;
  balance: number;
  image?: string | null;
  role: string;
  createdAt: string;
}

interface ProfileClientProps {
  initialUser: UserType;
  totalSpent?: number;
  totalOrders?: number;
  primaryColor?: string;
  settings?: SiteSettings | null;
}

export default function ProfileClient({ 
  initialUser, 
  totalSpent = 0, 
  totalOrders = 0, 
  primaryColor = "#00d2ff",
  settings
}: ProfileClientProps) {
  // ⚡ ডাটাবেজ থেকে initialUser না আসলে নিরাপদে ক্র্যাশ হ্যান্ডলিং
  if (!initialUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-500 font-bold bg-[#f8fafc] dark:bg-[#09090b]">
        ইউজার ডাটা পাওয়া যায়নি, পেজ রিফ্রেশ দিন!
      </div>
    );
  }

  const [user, setUser] = useState(initialUser);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPhone, setNewPhone] = useState(user.phone || "");
  const [loading, setLoading] = useState(false);

  // ব্যানারের গ্রাডিয়েন্ট কালার সেটিংস
  const topGradientColor = settings?.footerTopColor || "#061124";
  const bottomGradientColor = settings?.footerBottomColor || "#1a3b7b";

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id.toString());
    toast.success("User ID Copied!");
  };

  const handleSavePhone = async () => {
    if (!newPhone.trim()) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/update-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, phone: newPhone }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update phone number");
      }

      setUser((prev) => ({ ...prev, phone: newPhone }));
      toast.success("Phone number updated successfully!");
      setIsDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const firstLetter = user.name ? user.name.charAt(0).toUpperCase() : "U";
  const primaryLightBg = `${primaryColor}1A`; 

  return (
    <div className="min-h-screen pb-12 font-sans">
      
      {/* 🟣 ব্যানার */}
      <div 
        style={{
          background: `linear-gradient(to bottom, ${topGradientColor}, ${bottomGradientColor})`
        }}
        className="relative h-44 sm:h-56 w-full border-b border-neutral-200 dark:border-neutral-800"
      >
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
      </div>

      {/* 👤 প্রোফাইল হেডার */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="relative -mt-16 sm:-mt-20 mb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Profile Avatar (Rounded-full) */}
            <div className="relative pl-1 sm:pl-2">
              <div 
                style={{ backgroundColor: primaryColor }} 
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white dark:border-[#09090b] flex items-center justify-center overflow-hidden transition-transform duration-200 hover:scale-[1.02]"
              >
                {user.image ? (
                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-4xl sm:text-5xl font-black tracking-wider">
                    {firstLetter}
                  </span>
                )}
              </div>
              <span className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-[#09090b] rounded-full" title="Online" />
            </div>

            <div className="mt-2 sm:mt-0 pl-1 sm:pl-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {user.name}
                </h1>

                {user.role === "Reseller" && (
                  <span title="Verified Reseller">
                    <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-500/10 stroke-[2.5]" />
                  </span>
                )}

                {user.role === "Premium" && (
                  <span title="Premium Member">
                    <ShieldCheck className="w-6 h-6 text-amber-500 fill-amber-500/20 stroke-[2.5]" />
                  </span>
                )}
              </div>

              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                {user.email}
              </p>
            </div>
          </div>

          {/* Quick Header Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto mt-2 sm:mt-0">
            <Link
              href="/add-money"
              style={{ backgroundColor: primaryColor }}
              className="flex-1 sm:flex-initial h-11 px-5 rounded-md text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all duration-200"
            >
              <PlusCircle className="w-4 h-4" />
              অ্যাড মানি
            </Link>
            <Link
              href="/myorder"
              className="flex-1 sm:flex-initial h-11 px-5 rounded-md bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 text-sm font-bold flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-900 active:scale-[0.98] transition-all duration-200"
            >
              আমার অর্ডার
            </Link>
          </div>

        </div>

        {/* 📊 ৪টি স্ট্যাট কার্ড */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-8">
          
          {/* USER ID Card */}
          <div className="bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 rounded-md p-4 flex flex-col items-center justify-center text-center transition-all duration-200 hover:border-neutral-300 dark:hover:border-neutral-700">
            <div 
              className="w-10 h-10 rounded-md flex items-center justify-center mb-2.5"
              style={{ backgroundColor: primaryLightBg, color: primaryColor }}
            >
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5 cursor-pointer group active:scale-95 transition-transform" onClick={handleCopyId}>
              <span className="font-bold text-lg">{user.id}</span>
              <Copy className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors" />
            </div>
            <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mt-0.5">
              USER ID
            </span>
          </div>

          {/* TOTAL WALLET Card with Add Money Direct Redirection */}
          <div className="bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 rounded-md p-4 flex flex-col items-center justify-between text-center transition-all duration-200 hover:border-neutral-300 dark:hover:border-neutral-700">
            <div className="flex flex-col items-center w-full">
              <div className="w-10 h-10 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">৳{user.balance.toLocaleString()}</span>
              <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mt-0.5">
                TOTAL WALLET
              </span>
            </div>

            <Link
              href="/add-money"
              style={{ color: primaryColor, borderColor: primaryColor }}
              className="mt-3 w-full py-1.5 rounded-md border text-xs font-bold hover:bg-neutral-50 dark:hover:bg-neutral-900 active:scale-[0.97] transition-all flex items-center justify-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              অ্যাড মানি
            </Link>
          </div>

          {/* TOTAL SPENT Card */}
          <div className="bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 rounded-md p-4 flex flex-col items-center justify-center text-center transition-all duration-200 hover:border-neutral-300 dark:hover:border-neutral-700">
            <div className="w-10 h-10 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2.5">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">৳{totalSpent.toLocaleString()}</span>
            <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mt-0.5">
              TOTAL SPENT
            </span>
          </div>

          {/* TOTAL ORDERS Card */}
          <div className="bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 rounded-md p-4 flex flex-col items-center justify-center text-center transition-all duration-200 hover:border-neutral-300 dark:hover:border-neutral-700">
            <div className="w-10 h-10 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2.5">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">{totalOrders}</span>
            <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mt-0.5">
              TOTAL ORDERS
            </span>
          </div>

        </div>

        {/* ℹ️ ইউজার ইনফরমেশন কার্ড */}
        <div className="bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 rounded-md p-6 space-y-6 transition-all duration-200 hover:border-neutral-300 dark:hover:border-neutral-700">
          
          <div className="flex items-center gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div 
              className="w-10 h-10 rounded-md flex items-center justify-center"
              style={{ backgroundColor: primaryLightBg, color: primaryColor }}
            >
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                User Information
              </h2>
              <p className="text-xs text-neutral-400">Secure contact & account details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            {/* PHONE NUMBER */}
            <div className="flex items-center justify-between p-3.5 rounded-md bg-neutral-50/70 dark:bg-neutral-900/40 border border-neutral-200/70 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div 
                  className="w-9 h-9 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: primaryLightBg, color: primaryColor }}
                >
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
                    PHONE NUMBER
                  </span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {user.phone || "Not provided"}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setNewPhone(user.phone || "");
                  setIsDialogOpen(true);
                }}
                className="p-2 rounded-md hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                style={{ color: primaryColor }}
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>

            {/* EMAIL ADDRESS */}
            <div className="flex items-center gap-3 p-3.5 rounded-md bg-neutral-50/70 dark:bg-neutral-900/40 border border-neutral-200/70 dark:border-neutral-800">
              <div 
                className="w-9 h-9 rounded-md flex items-center justify-center"
                style={{ backgroundColor: primaryLightBg, color: primaryColor }}
              >
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
                  EMAIL ADDRESS
                </span>
                <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate block max-w-[200px] sm:max-w-none">
                  {user.email}
                </span>
              </div>
            </div>

            {/* ACCOUNT TYPE */}
            <div className="flex items-center gap-3 p-3.5 rounded-md bg-neutral-50/70 dark:bg-neutral-900/40 border border-neutral-200/70 dark:border-neutral-800">
              <div 
                className="w-9 h-9 rounded-md flex items-center justify-center"
                style={{ backgroundColor: primaryLightBg, color: primaryColor }}
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
                  ACCOUNT TYPE
                </span>
                <span className="text-sm font-bold capitalize text-neutral-900 dark:text-neutral-100">
                  {user.role} Member
                </span>
              </div>
            </div>

            {/* MEMBER SINCE */}
            <div className="flex items-center gap-3 p-3.5 rounded-md bg-neutral-50/70 dark:bg-neutral-900/40 border border-neutral-200/70 dark:border-neutral-800">
              <div 
                className="w-9 h-9 rounded-md flex items-center justify-center"
                style={{ backgroundColor: primaryLightBg, color: primaryColor }}
              >
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
                  MEMBER SINCE
                </span>
                <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 📱 USER PHONE NUMBER SET DIALOG */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 rounded-md p-6 w-full max-w-md space-y-5 relative text-left transition-all duration-200">
            
            <button 
              onClick={() => setIsDialogOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                User Phone Number Set
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Update your primary contact number for order updates and account security.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="017XXXXXXXX"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full h-11 px-3.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-sm font-medium focus:outline-none focus:border-neutral-500 transition-all"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={loading}
                onClick={handleSavePhone}
                className="h-10 px-5 rounded-md font-bold text-sm flex items-center gap-2 transition-all cursor-pointer text-white hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: primaryColor }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>

              <button
                onClick={() => setIsDialogOpen(false)}
                className="h-10 px-5 rounded-md bg-white dark:bg-[#18181b] border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold text-sm transition-all cursor-pointer active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}