"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Plus, X, Shield, User, Globe, MessageCircle, Sliders, LayoutGrid, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ui/image-uploader";
import { getCurrentAdmin, updateAdminProfile } from "@/app/(admin)/auth/actions";
import { showToast } from "@/lib/toast";

interface SettingsFormProps {
  initialData: {
    siteName?: string;
    siteTitle?: string | null;
    siteDescription?: string | null;
    googleClientId?: string | null;
    googleClientSecret?: string | null;

    logoUrl?: string | null;
    faviconUrl?: string | null;
    walletPayBanner?: string | null;
    autoPaymentBanner?: string | null;
    loginSystem?: "OAUTH" | "MANUAL" | "OAUTH_MANUAL";

    paymentGateway?: "Uddokotapay" | "Piprapay" | "others";
    paymentBaseUrl?: string | null;
    paymentApiKey?: string | null;
    paymentMinAmount?: string | number | null;
    paymentMaxAmount?: string | number | null;

    metaKeywords?: string | null;
    noticeText?: string | null;
    isHeaderVisible?: boolean;
    isFooterVisible?: boolean;
    whatsappNumber?: string | null;
    telegramUsername?: string | null;
    youtubeLink?: string | null;
    facebookLink?: string | null;
    instagramLink?: string | null;
    activeFloatingButton?: "WHATSAPP" | "TELEGRAM" | "YOUTUBE" | "FACEBOOK" | "INSTAGRAM";
    adminEmail?: string | null;
    primaryColor?: string;
    backgroundColor?: string;

    footerTopColor?: string | null;
    footerBottomColor?: string | null;

    isFooterCard1Visible?: boolean;
    footerCard1Title1?: string | null;
    footerCard1Title2?: string | null;
    footerCard1Link?: string | null;
    footerCard1ImageUrl?: string | null;

    isFooterCard2Visible?: boolean;
    footerCard2Title1?: string | null;
    footerCard2Title2?: string | null;
    footerCard2Link?: string | null;
    footerCard2ImageUrl?: string | null;
  };
}

export default function SettingsForm({ initialData }: SettingsFormProps) {
  const router = useRouter(); 
  const [loading, setLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  // Footer Card active tab state
  const [activeCardBar, setActiveCardBar] = useState<"card1" | "card2">("card1");

  const [keywords, setKeywords] = useState<string[]>([]);
  const [tempKeyword, setTempKeyword] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    siteName: initialData?.siteName || "",
    siteTitle: initialData?.siteTitle || "",
    siteDescription: initialData?.siteDescription || "",
    googleClientId: initialData?.googleClientId || "",
    googleClientSecret: initialData?.googleClientSecret || "",

    logoUrl: initialData?.logoUrl || "",
    faviconUrl: initialData?.faviconUrl || "",
    walletPayBanner: initialData?.walletPayBanner || "",
    autoPaymentBanner: initialData?.autoPaymentBanner || "",
    loginSystem: initialData?.loginSystem || "OAUTH_MANUAL",

    // Payment fields
    paymentGateway: initialData?.paymentGateway || "Uddokotapay",
    paymentBaseUrl: initialData?.paymentBaseUrl || "",
    paymentApiKey: initialData?.paymentApiKey || "",
    paymentMinAmount: initialData?.paymentMinAmount || "20",
    paymentMaxAmount: initialData?.paymentMaxAmount || "50000",

    noticeText: initialData?.noticeText || "",
    isHeaderVisible: initialData?.isHeaderVisible ?? true,
    isFooterVisible: initialData?.isFooterVisible ?? true,
    whatsappNumber: initialData?.whatsappNumber || "",
    telegramUsername: initialData?.telegramUsername || "",
    youtubeLink: initialData?.youtubeLink || "",
    facebookLink: initialData?.facebookLink || "",
    instagramLink: initialData?.instagramLink || "",
    activeFloatingButton: initialData?.activeFloatingButton || "WHATSAPP",
    adminEmail: initialData?.adminEmail || "",
    primaryColor: initialData?.primaryColor || "#00d2ff",
    backgroundColor: initialData?.backgroundColor || "#0a0a0c",

    footerTopColor: initialData?.footerTopColor || "#061124",
    footerBottomColor: initialData?.footerBottomColor || "#1a3b7b",

    isFooterCard1Visible: initialData?.isFooterCard1Visible ?? true,
    footerCard1Title1: initialData?.footerCard1Title1 || "",
    footerCard1Title2: initialData?.footerCard1Title2 || "",
    footerCard1Link: initialData?.footerCard1Link || "",
    footerCard1ImageUrl: initialData?.footerCard1ImageUrl || "",

    isFooterCard2Visible: initialData?.isFooterCard2Visible ?? true,
    footerCard2Title1: initialData?.footerCard2Title1 || "",
    footerCard2Title2: initialData?.footerCard2Title2 || "",
    footerCard2Link: initialData?.footerCard2Link || "",
    footerCard2ImageUrl: initialData?.footerCard2ImageUrl || "",
  });

  const [adminForm, setAdminForm] = useState({
    name: "",
    username: "",
    company: "",
    phone: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        siteName: initialData.siteName || "",
        siteTitle: initialData.siteTitle || "",
        siteDescription: initialData.siteDescription || "",
        googleClientId: initialData.googleClientId || "",
        googleClientSecret: initialData.googleClientSecret || "",

        logoUrl: initialData.logoUrl || "",
        faviconUrl: initialData.faviconUrl || "",
        walletPayBanner: initialData.walletPayBanner || "",
        autoPaymentBanner: initialData.autoPaymentBanner || "",
        loginSystem: initialData.loginSystem || "OAUTH_MANUAL",

        paymentGateway: initialData.paymentGateway || "Uddokotapay",
        paymentBaseUrl: initialData.paymentBaseUrl || "",
        paymentApiKey: initialData.paymentApiKey || "",
        paymentMinAmount: initialData.paymentMinAmount || "20",
        paymentMaxAmount: initialData.paymentMaxAmount || "50000",

        noticeText: initialData.noticeText || "",
        isHeaderVisible: initialData.isHeaderVisible ?? true,
        isFooterVisible: initialData.isFooterVisible ?? true,
        whatsappNumber: initialData.whatsappNumber || "",
        telegramUsername: initialData.telegramUsername || "",
        youtubeLink: initialData.youtubeLink || "",
        facebookLink: initialData.facebookLink || "",
        instagramLink: initialData.instagramLink || "",
        activeFloatingButton: initialData.activeFloatingButton || "WHATSAPP",
        adminEmail: initialData.adminEmail || "",
        primaryColor: initialData.primaryColor || "#00d2ff",
        backgroundColor: initialData.backgroundColor || "#0a0a0c",

        footerTopColor: initialData.footerTopColor || "#061124",
        footerBottomColor: initialData.footerBottomColor || "#1a3b7b",

        isFooterCard1Visible: initialData.isFooterCard1Visible ?? true,
        footerCard1Title1: initialData.footerCard1Title1 || "",
        footerCard1Title2: initialData.footerCard1Title2 || "",
        footerCard1Link: initialData.footerCard1Link || "",
        footerCard1ImageUrl: initialData.footerCard1ImageUrl || "",

        isFooterCard2Visible: initialData.isFooterCard2Visible ?? true,
        footerCard2Title1: initialData.footerCard2Title1 || "",
        footerCard2Title2: initialData.footerCard2Title2 || "",
        footerCard2Link: initialData.footerCard2Link || "",
        footerCard2ImageUrl: initialData.footerCard2ImageUrl || "",
      });
      
      if (initialData.metaKeywords) {
        const tags = initialData.metaKeywords.split(",").map(tag => tag.trim()).filter(Boolean);
        setKeywords(tags);
      } else {
        setKeywords([]);
      }
    }
  }, [initialData]);

  // Fetch Admin Profile
  useEffect(() => {
    async function fetchAdminProfile() {
      try {
        const admin = await getCurrentAdmin();
        if (admin) {
          setAdminForm((prev) => ({
            ...prev,
            name: admin.name || "",
            username: admin.username || "",
            company: admin.company || "",
            phone: admin.phone || "",
          }));
        }
      } catch (err) {
        console.error("Error fetching admin data in client:", err);
      }
    }
    fetchAdminProfile();
  }, []);

  const addKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempKeyword.trim() && !keywords.includes(tempKeyword.trim())) {
      setKeywords([...keywords, tempKeyword.trim()]);
      setTempKeyword("");
    }
  };

  const removeKeyword = (tag: string) => {
    setKeywords(keywords.filter((k) => k !== tag));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    const toastId = showToast.loading("Updating settings...");
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          metaKeywords: keywords.join(","),
        }),
      });

      showToast.dismiss(toastId);

      if (response.ok) {
        showToast.success("Settings updated successfully!");
        router.refresh(); 
      } else {
        const err = await response.json().catch(() => ({}));
        showToast.error(err.error || err.message || "Failed to update settings");
      }
    } catch (error) {
      console.error(error);
      showToast.dismiss(toastId);
      showToast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAdmin = async () => {
    if (adminForm.newPassword && adminForm.newPassword !== adminForm.confirmPassword) {
      showToast.error("New passwords do not match!");
      return;
    }
    
    setAdminLoading(true);
    const toastId = showToast.loading("Updating admin profile...");
    try {
      const res = await updateAdminProfile({
        name: adminForm.name,
        username: adminForm.username,
        company: adminForm.company,
        phone: adminForm.phone,
        oldPassword: adminForm.oldPassword || undefined,
        newPassword: adminForm.newPassword || undefined,
      });

      showToast.dismiss(toastId);

      if (res.success) {
        showToast.success(res.message || "Admin profile updated successfully!");
        setAdminForm((prev) => ({ 
          ...prev, 
          oldPassword: "", 
          newPassword: "", 
          confirmPassword: "" 
        }));
        router.refresh(); 
      } else {
        showToast.error(res.message || "Failed to update admin profile.");
      }
    } catch (error) {
      console.error(error);
      showToast.dismiss(toastId);
      showToast.error("Something went wrong while saving admin information.");
    } finally {
      setAdminLoading(false);
    }
  };

  const renderSaveButton = (onClickFn: () => void, isBtnLoading: boolean) => (
    <div>
      <hr className="w-full h-[1px] bg-neutral-200 dark:bg-neutral-800/60 border-none my-5" />
      <Button 
        onClick={onClickFn} 
        disabled={isBtnLoading}
        className="bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-white/90 text-white dark:text-neutral-900 px-6 py-4 rounded-lg font-bold flex gap-2 items-center text-xs shadow transition-all mb-20"
      >
        {isBtnLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {isBtnLoading ? "UPDATING..." : "UPDATE SETTINGS"}
      </Button>
    </div>
  );

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="relative mb-10 bg-neutral-100/60 dark:bg-neutral-900/40 p-1 h-12 w-full md:w-max flex flex-row justify-start items-center overflow-x-auto whitespace-nowrap gap-1 rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <TabsTrigger value="general" className="shrink-0 flex items-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-950 data-[state=active]:text-neutral-900 dark:data-[state=active]:text-white text-neutral-500 dark:text-neutral-400 text-xs font-bold px-4 py-2 rounded-lg transition-all border border-transparent data-[state=active]:border-neutral-200 dark:data-[state=active]:border-neutral-800">
          <Sliders className="w-3.5 h-3.5" /> General
        </TabsTrigger>
        <TabsTrigger value="footerSections" className="shrink-0 flex items-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-950 data-[state=active]:text-neutral-900 dark:data-[state=active]:text-white text-neutral-500 dark:text-neutral-400 text-xs font-bold px-4 py-2 rounded-lg transition-all border border-transparent data-[state=active]:border-neutral-200 dark:data-[state=active]:border-neutral-800">
          <LayoutGrid className="w-3.5 h-3.5" /> Footer Sections
        </TabsTrigger>
        <TabsTrigger value="social" className="shrink-0 flex items-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-950 data-[state=active]:text-neutral-900 dark:data-[state=active]:text-white text-neutral-500 dark:text-neutral-400 text-xs font-bold px-4 py-2 rounded-lg transition-all border border-transparent data-[state=active]:border-neutral-200 dark:data-[state=active]:border-neutral-800">
          <MessageCircle className="w-3.5 h-3.5" /> Social & Contact
        </TabsTrigger>
        <TabsTrigger value="theme" className="shrink-0 flex items-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-950 data-[state=active]:text-neutral-900 dark:data-[state=active]:text-white text-neutral-500 dark:text-neutral-400 text-xs font-bold px-4 py-2 rounded-lg transition-all border border-transparent data-[state=active]:border-neutral-200 dark:data-[state=active]:border-neutral-800">
          <Globe className="w-3.5 h-3.5" /> Theme & Assets
        </TabsTrigger>
        <TabsTrigger value="informations" className="shrink-0 flex items-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-950 data-[state=active]:text-neutral-900 dark:data-[state=active]:text-white text-neutral-500 dark:text-neutral-400 text-xs font-bold px-4 py-2 rounded-lg transition-all border border-transparent data-[state=active]:border-neutral-200 dark:data-[state=active]:border-neutral-800">
          <User className="w-3.5 h-3.5" /> Informations
        </TabsTrigger>
        <TabsTrigger value="payment" className="shrink-0 flex items-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-950 data-[state=active]:text-neutral-900 dark:data-[state=active]:text-white text-neutral-500 dark:text-neutral-400 text-xs font-bold px-4 py-2 rounded-lg transition-all border border-transparent data-[state=active]:border-neutral-200 dark:data-[state=active]:border-neutral-800">
          <CreditCard className="w-3.5 h-3.5" /> Payment
        </TabsTrigger>
        <TabsTrigger value="adminInfo" className="shrink-0 flex items-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-950 data-[state=active]:text-neutral-900 dark:data-[state=active]:text-white text-neutral-500 dark:text-neutral-400 text-xs font-bold px-4 py-2 rounded-lg transition-all border border-transparent data-[state=active]:border-neutral-200 dark:data-[state=active]:border-neutral-800">
          <Shield className="w-3.5 h-3.5" /> Admin Info
        </TabsTrigger>
      </TabsList>

      {/* ==================== GENERAL TAB ==================== */}
      <TabsContent value="general" className="space-y-6 animate-in fade-in duration-200">
        
        {/* ১. Site Name & Login System */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Site Name</Label>
            <Input 
              value={formData.siteName} 
              onChange={(e) => setFormData({...formData, siteName: e.target.value})}
              placeholder="e.g. STORE NAME"
              className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-800 text-sm h-11 rounded-xl placeholder:text-neutral-400/70" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Login System</Label>
            <select 
              value={formData.loginSystem} 
              onChange={(e) => setFormData({...formData, loginSystem: e.target.value as any})} 
              className="flex h-11 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 dark:bg-neutral-950 focus:outline-none"
            >
              <option value="OAUTH">1. OAuth</option>
              <option value="MANUAL">2. Manual</option>
              <option value="OAUTH_MANUAL">3. Manual + OAuth</option>
            </select>
          </div>
        </div>

        {/* ২. Google OAuth Credentials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Google Client ID</Label>
            <Input 
              value={formData.googleClientId} 
              onChange={(e) => setFormData({...formData, googleClientId: e.target.value})}
              placeholder="e.g. xxx-xxx.apps.googleusercontent.com"
              className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-800 text-sm h-11 rounded-xl placeholder:text-neutral-400/70" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Google Client Secret</Label>
            <Input 
              type="password"
              value={formData.googleClientSecret} 
              onChange={(e) => setFormData({...formData, googleClientSecret: e.target.value})}
              placeholder="e.g. GOCSPX-xxxxxxxxxxxx"
              className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-800 text-sm h-11 rounded-xl placeholder:text-neutral-400/70" 
            />
          </div>
        </div>

        {/* ৩. Site Title & Site Description (SEO) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Site Title</Label>
            <Input 
              value={formData.siteTitle} 
              onChange={(e) => setFormData({...formData, siteTitle: e.target.value})}
              placeholder="e.g. DEMO BAZAR | Best Online Topup Store"
              className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-800 text-sm h-11 rounded-xl placeholder:text-neutral-400/70" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Site Description</Label>
            <Input 
              value={formData.siteDescription} 
              onChange={(e) => setFormData({...formData, siteDescription: e.target.value})}
              placeholder="e.g. Best game topup store in Bangladesh with instant delivery..."
              className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-800 text-sm h-11 rounded-xl placeholder:text-neutral-400/70" 
            />
          </div>
        </div>

        {/* ৪. Meta Keywords */}
        <div className="flex flex-col gap-2.5">
          <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Meta Keywords</Label>
          <div className="flex gap-2">
            <Input 
              value={tempKeyword}
              onChange={(e) => setTempKeyword(e.target.value)}
              placeholder="Type tag (e.g. topup) & press Enter" 
              className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm h-11 rounded-xl placeholder:text-neutral-400/70"
              onKeyDown={(e) => e.key === "Enter" && addKeyword(e)}
            />
            <Button onClick={addKeyword} type="button" className="h-11 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-900 dark:text-white px-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-1.5 p-3 bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-xl min-h-[110px] content-start">
            {keywords.length === 0 && (
              <span className="text-xs text-neutral-400/60 italic self-center m-auto">No tags added yet.</span>
            )}
            {keywords.map((tag) => (
              <div key={tag} className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold flex items-center gap-1 pl-2.5 pr-1 py-1 text-[11px] rounded-lg">
                <span>{tag}</span>
                <button type="button" onClick={() => removeKeyword(tag)} className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ৫. Notice Text */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Notice Text</Label>
          <Textarea 
            value={formData.noticeText}
            onChange={(e) => setFormData({...formData, noticeText: e.target.value})}
            placeholder="Enter global website notice or scrolling announcement bar text..."
            className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 min-h-[100px] rounded-xl placeholder:text-neutral-400/70"
          />
        </div>

        {/* ৬. Header / Footer Switches */}
        <div className="w-full border-t border-b border-neutral-200/60 dark:border-neutral-800/60 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between w-full">
              <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Show Header Menu</Label>
              <Switch checked={formData.isHeaderVisible} onCheckedChange={(v) => setFormData({...formData, isHeaderVisible: v})} />
            </div>
            <div className="flex items-center justify-between w-full">
              <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Show Footer Section</Label>
              <Switch checked={formData.isFooterVisible} onCheckedChange={(v) => setFormData({...formData, isFooterVisible: v})} />
            </div>
          </div>
        </div>
        
        <div className="pt-2">{renderSaveButton(handleSaveSettings, loading)}</div>
      </TabsContent>

      {/* ==================== FOOTER SECTIONS TAB ==================== */}
      <TabsContent value="footerSections" className="space-y-6 animate-in fade-in duration-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Top Gradient Color</Label>
            <div className="flex gap-2 items-center bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 p-1.5 rounded-xl">
              <input type="color" value={formData.footerTopColor} onChange={(e) => setFormData({...formData, footerTopColor: e.target.value})} className="w-10 h-8 rounded-lg cursor-pointer border-none bg-transparent" />
              <Input value={formData.footerTopColor} onChange={(e) => setFormData({...formData, footerTopColor: e.target.value})} placeholder="#00d2ff" className="border-none bg-transparent shadow-none focus-visible:ring-0 font-mono h-8 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400/70" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Bottom Gradient Color</Label>
            <div className="flex gap-2 items-center bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 p-1.5 rounded-xl">
              <input type="color" value={formData.footerBottomColor} onChange={(e) => setFormData({...formData, footerBottomColor: e.target.value})} className="w-10 h-8 rounded-lg cursor-pointer border-none bg-transparent" />
              <Input value={formData.footerBottomColor} onChange={(e) => setFormData({...formData, footerBottomColor: e.target.value})} placeholder="#0055ff" className="border-none bg-transparent shadow-none focus-visible:ring-0 font-mono h-8 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400/70" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-2">
          <div className="flex bg-neutral-100 dark:bg-neutral-900/60 p-1 rounded-xl w-max border border-neutral-200/60 dark:border-neutral-800/60">
            <button type="button" onClick={() => setActiveCardBar("card1")} className={`px-4 py-2 text-xs rounded-lg transition-all ${activeCardBar === "card1" ? "bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white font-bold border border-neutral-200 dark:border-neutral-800" : "text-neutral-500 dark:text-neutral-400 font-medium"}`}>Card Bar 1</button>
            <button type="button" onClick={() => setActiveCardBar("card2")} className={`px-4 py-2 text-xs rounded-lg transition-all ${activeCardBar === "card2" ? "bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white font-bold border border-neutral-200 dark:border-neutral-800" : "text-neutral-500 dark:text-neutral-400 font-medium"}`}>Card Bar 2</button>
          </div>

          <div className="flex items-center justify-between max-w-md bg-neutral-50 dark:bg-neutral-900/20 p-3 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50">
            <Label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Enable {activeCardBar === "card1" ? "Card Bar 1" : "Card Bar 2"}</Label>
            {activeCardBar === "card1" ? (
              <Switch checked={formData.isFooterCard1Visible} onCheckedChange={(v) => setFormData({...formData, isFooterCard1Visible: v})} />
            ) : (
              <Switch checked={formData.isFooterCard2Visible} onCheckedChange={(v) => setFormData({...formData, isFooterCard2Visible: v})} />
            )}
          </div>
        </div>

        {activeCardBar === "card1" && (
          <div className="space-y-6 border-t border-neutral-200 dark:border-neutral-800/60 pt-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Title 1</Label>
                <Input value={formData.footerCard1Title1} onChange={(e) => setFormData({...formData, footerCard1Title1: e.target.value})} placeholder="e.g. Fast Delivery" className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm h-11 rounded-xl placeholder:text-neutral-400/70" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Title 2</Label>
                <Input value={formData.footerCard1Title2} onChange={(e) => setFormData({...formData, footerCard1Title2: e.target.value})} placeholder="e.g. Within 5-10 Minutes" className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm h-11 rounded-xl placeholder:text-neutral-400/70" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="md:col-span-2 flex flex-col gap-2">
                <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Redirect Link</Label>
                <Input value={formData.footerCard1Link} onChange={(e) => setFormData({...formData, footerCard1Link: e.target.value})} placeholder="Hint Link (e.g. /orders or #)" className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm h-11 rounded-xl placeholder:text-neutral-400/70" />
              </div>
              <div className="flex flex-col gap-2 max-w-max ">
                <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 tracking-wider">CARD BAR 512x512</Label>
                <div className="h-max overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                  <ImageUploader defaultValue={formData.footerCard1ImageUrl} onFileChange={(url: string) => setFormData({ ...formData, footerCard1ImageUrl: url })} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeCardBar === "card2" && (
          <div className="space-y-6 border-t border-neutral-200 dark:border-neutral-800/60 pt-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Title 1</Label>
                <Input value={formData.footerCard2Title1} onChange={(e) => setFormData({...formData, footerCard2Title1: e.target.value})} placeholder="e.g. Support 24/7" className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm h-11 rounded-xl placeholder:text-neutral-400/70" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Title 2</Label>
                <Input value={formData.footerCard2Title2} onChange={(e) => setFormData({...formData, footerCard2Title2: e.target.value})} placeholder="e.g. Live Chat & WhatsApp" className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm h-11 rounded-xl placeholder:text-neutral-400/70" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="md:col-span-2 flex flex-col gap-2">
                <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Redirect Link</Label>
                <Input value={formData.footerCard2Link} onChange={(e) => setFormData({...formData, footerCard2Link: e.target.value})} placeholder="Hint Link (e.g. /orders or #)" className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm h-11 rounded-xl placeholder:text-neutral-400/70" />
              </div>
              <div className="flex flex-col gap-2 max-w-max">
                <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 tracking-wider">CARD BAR 512x512</Label>
                <div className="h-max overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                  <ImageUploader defaultValue={formData.footerCard2ImageUrl} onFileChange={(url: string) => setFormData({ ...formData, footerCard2ImageUrl: url })} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2">{renderSaveButton(handleSaveSettings, loading)}</div>
      </TabsContent>

      {/* ==================== SOCIAL & CONTACT TAB ==================== */}
      <TabsContent value="social" className="space-y-6 animate-in fade-in duration-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">WhatsApp Number</Label>
            <Input 
              value={formData.whatsappNumber} 
              onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})} 
              placeholder="e.g. 88017XXXXXXXX"
              className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-11 rounded-xl placeholder:text-neutral-400/70" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Telegram Username</Label>
            <Input 
              value={formData.telegramUsername} 
              onChange={(e) => setFormData({...formData, telegramUsername: e.target.value})} 
              placeholder="e.g. https://t.me/onlyusername"
              className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-11 rounded-xl placeholder:text-neutral-400/70" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">YouTube Link</Label>
            <Input 
              value={formData.youtubeLink} 
              onChange={(e) => setFormData({...formData, youtubeLink: e.target.value})} 
              placeholder="https://youtube.com/c/YourChannel"
              className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-11 rounded-xl placeholder:text-neutral-400/70" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Facebook Link</Label>
            <Input 
              value={formData.facebookLink} 
              onChange={(e) => setFormData({...formData, facebookLink: e.target.value})} 
              placeholder="https://facebook.com/YourPage"
              className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-11 rounded-xl placeholder:text-neutral-400/70" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Instagram Link</Label>
            <Input 
              value={formData.instagramLink} 
              onChange={(e) => setFormData({...formData, instagramLink: e.target.value})} 
              placeholder="https://instagram.com/YourPage"
              className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-11 rounded-xl placeholder:text-neutral-400/70" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Active Floating Button</Label>
            <select 
              value={formData.activeFloatingButton} 
              onChange={(e) => setFormData({...formData, activeFloatingButton: e.target.value as any})} 
              className="flex h-11 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 dark:bg-neutral-950 focus:outline-none"
            >
              <option value="WHATSAPP">WhatsApp</option>
              <option value="TELEGRAM">Telegram</option>
              <option value="YOUTUBE">YouTube</option>
              <option value="FACEBOOK">Facebook</option>
              <option value="INSTAGRAM">Instagram</option>
            </select>
          </div>
        </div>
        <div className="pt-2">{renderSaveButton(handleSaveSettings, loading)}</div>
      </TabsContent>

      {/* ==================== THEME TAB ==================== */}
      <TabsContent value="theme" className="space-y-6 animate-in fade-in duration-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Primary Theme Color</Label>
            <div className="flex gap-2 items-center bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 p-1.5 rounded-xl">
              <input type="color" value={formData.primaryColor} onChange={(e) => setFormData({...formData, primaryColor: e.target.value})} className="w-10 h-8 rounded-lg cursor-pointer border-none bg-transparent" />
              <Input value={formData.primaryColor} onChange={(e) => setFormData({...formData, primaryColor: e.target.value})} placeholder="#00d2ff" className="border-none bg-transparent shadow-none focus-visible:ring-0 font-mono h-8 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400/70" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Background Color</Label>
            <div className="flex gap-2 items-center bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 p-1.5 rounded-xl">
              <input type="color" value={formData.backgroundColor} onChange={(e) => setFormData({...formData, backgroundColor: e.target.value})} className="w-10 h-8 rounded-lg cursor-pointer border-none bg-transparent" />
              <Input value={formData.backgroundColor} onChange={(e) => setFormData({...formData, backgroundColor: e.target.value})} placeholder="#0a0a0c" className="border-none bg-transparent shadow-none focus-visible:ring-0 font-mono h-8 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400/70" />
            </div>
          </div>
        </div>

        {/* 🎯 LOGO, FAVICON, WALLET PAY & AUTO PAYMENT BANNERS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 tracking-wider">LOGO 1280x512</Label>
            <ImageUploader defaultValue={formData.logoUrl} onFileChange={(url: string) => setFormData({ ...formData, logoUrl: url })} />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 tracking-wider">FAVICON 512x512</Label>
            <ImageUploader defaultValue={formData.faviconUrl} onFileChange={(url: string) => setFormData({ ...formData, faviconUrl: url })} />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 tracking-wider">WALLET PAY BANNER</Label>
            <ImageUploader defaultValue={formData.walletPayBanner} onFileChange={(url: string) => setFormData({ ...formData, walletPayBanner: url })} />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 tracking-wider">AUTO PAYMENT BANNER</Label>
            <ImageUploader defaultValue={formData.autoPaymentBanner} onFileChange={(url: string) => setFormData({ ...formData, autoPaymentBanner: url })} />
          </div>
        </div>
        <div className="pt-2">{renderSaveButton(handleSaveSettings, loading)}</div>
      </TabsContent>

      {/* ==================== INFORMATIONS TAB ==================== */}
      <TabsContent value="informations" className="space-y-6 animate-in fade-in duration-200">
        <div className="max-w-md flex flex-col gap-2">
          <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">User Facing Support Email</Label>
          <Input 
            type="email"
            value={formData.adminEmail} 
            onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
            className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-11 rounded-xl placeholder:text-neutral-400/70" 
            placeholder="support@yourstore.com"
          />
          <p className="text-[11px] text-neutral-400 italic">This email will be publicly displayed to your app users.</p>
        </div>
        <div className="pt-2">{renderSaveButton(handleSaveSettings, loading)}</div>
      </TabsContent>

      {/* ==================== PAYMENT TAB ==================== */}
      <TabsContent value="payment" className="space-y-6">
<div className=" space-y-5 transition-colors">
  
  {/* Grid 1: Payment Gateway Dropdown & API URL / Base URL */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    
    {/* 1. Payment Gateway Dropdown */}
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wider font-semibold text-neutral-700 dark:text-neutral-300">
        Payment Gateway <span className="text-red-500">*</span>
      </Label>
      <select
        value={formData.paymentGateway}
        onChange={(e) =>
          setFormData({
            ...formData,
            paymentGateway: e.target.value as "Uddokotapay" | "Piprapay" | "others",
          })
        }
        className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 text-sm text-neutral-900 dark:text-neutral-200 outline-none focus:border-amber-500 transition-colors"
      >
        <option value="Uddokotapay" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-200">Uddokotapay</option>
        <option value="Piprapay" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-200">Piprapay</option>
        <option value="others" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-200">others</option>
      </select>
    </div>

    {/* 2. API URL / Base URL (সবসময় paymentBaseUrl-এ সেভ হবে) */}
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wider font-semibold text-neutral-700 dark:text-neutral-300">
        {formData.paymentGateway === "others" ? "API URL" : "Base URL"} <span className="text-red-500">*</span>
      </Label>
      <Input
        type="text"
        placeholder={
          formData.paymentGateway === "others"
            ? "https://secure-pay.deshipay.xyz/api"
            : "https://sinoxbd.paymently.io/api"
        }
        value={formData.paymentBaseUrl || ""}
        onChange={(e) => setFormData({ ...formData, paymentBaseUrl: e.target.value })}
        className="bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 focus:border-amber-500 text-neutral-900 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-sm font-mono"
      />
    </div>

  </div>

  {/* Non-Grid: API Key / Brand Key (সবসময় paymentApiKey-তে সেভ হবে) */}
  <div className="space-y-2">
    <Label className="text-xs uppercase tracking-wider font-semibold text-neutral-700 dark:text-neutral-300">
      {formData.paymentGateway === "others" ? "Brand Key / API Key" : "API Key"}{" "}
      <span className="text-red-500">*</span>
    </Label>
    <Input
      type="text"
      placeholder={
        formData.paymentGateway === "others"
          ? "Enter Brand Key / API Key"
          : "Enter API Key"
      }
      value={formData.paymentApiKey || ""}
      onChange={(e) => setFormData({ ...formData, paymentApiKey: e.target.value })}
      className="bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 focus:border-amber-500 text-neutral-900 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-sm font-mono"
    />
  </div>

  {/* Grid 2: Min Amount & Max Amount */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wider font-semibold text-neutral-700 dark:text-neutral-300">
        Min Amount <span className="text-red-500">*</span>
      </Label>
      <Input
        type="number"
        placeholder="20"
        value={formData.paymentMinAmount}
        onChange={(e) => setFormData({ ...formData, paymentMinAmount: e.target.value })}
        className="bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 focus:border-amber-500 text-neutral-900 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-sm"
      />
    </div>

    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wider font-semibold text-neutral-700 dark:text-neutral-300">
        Max Amount <span className="text-red-500">*</span>
      </Label>
      <Input
        type="number"
        placeholder="50000"
        value={formData.paymentMaxAmount}
        onChange={(e) => setFormData({ ...formData, paymentMaxAmount: e.target.value })}
        className="bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 focus:border-amber-500 text-neutral-900 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-sm"
      />
    </div>
  </div>

</div>

  {/* Save Button */}
  {renderSaveButton(handleSaveSettings, loading)}
</TabsContent>

      {/* ==================== ADMIN INFO TAB ==================== */}
      <TabsContent value="adminInfo" className="space-y-8 animate-in fade-in duration-200 bg-transparent p-0 border-none shadow-none">
        <div className="max-w-3xl space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Admin Name</Label>
              <Input 
                value={adminForm.name} 
                onChange={(e) => setAdminForm({...adminForm, name: e.target.value})} 
                placeholder="Enter your full name"
                className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-10 rounded-xl text-xs placeholder:text-neutral-400/70" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Username</Label>
              <Input 
                value={adminForm.username} 
                onChange={(e) => setAdminForm({...adminForm, username: e.target.value})} 
                placeholder="Enter unique username"
                className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-10 rounded-xl text-xs placeholder:text-neutral-400/70" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Company</Label>
              <Input 
                value={adminForm.company} 
                onChange={(e) => setAdminForm({...adminForm, company: e.target.value})} 
                placeholder="e.g. RRR IT Solution"
                className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-10 rounded-xl text-xs placeholder:text-neutral-400/70" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Phone Number</Label>
              <Input 
                value={adminForm.phone} 
                onChange={(e) => setAdminForm({...adminForm, phone: e.target.value})} 
                placeholder="e.g. 017XXXXXXXX"
                className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-10 rounded-xl text-xs placeholder:text-neutral-400/70" 
              />
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800/60 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Security & Password Gate</h4>
              <p className="text-[11px] text-neutral-400">Keep it empty if you do not want to alter credentials.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Type Your Older Password</Label>
                <Input type="password" value={adminForm.oldPassword} onChange={(e) => setAdminForm({...adminForm, oldPassword: e.target.value})} placeholder="••••••••" className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-10 rounded-xl text-xs placeholder:text-neutral-400/70" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Type Your New Password</Label>
                <Input type="password" value={adminForm.newPassword} onChange={(e) => setAdminForm({...adminForm, newPassword: e.target.value})} placeholder="Minimum 6 characters" className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-10 rounded-xl text-xs placeholder:text-neutral-400/70" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Retype Your New Password</Label>
                <Input type="password" value={adminForm.confirmPassword} onChange={(e) => setAdminForm({...adminForm, confirmPassword: e.target.value})} placeholder="Confirm new password" className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-10 rounded-xl text-xs placeholder:text-neutral-400/70" />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button 
              onClick={handleSaveAdmin} 
              disabled={adminLoading}
              className="bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 px-6 py-5 rounded-lg font-bold flex gap-2 items-center text-xs transition-all"
            >
              {adminLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {adminLoading ? "SAVING ADMIN..." : "SAVE ADMIN INFO"}
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}