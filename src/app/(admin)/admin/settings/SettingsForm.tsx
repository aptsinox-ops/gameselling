"use client";

import React, { useState, useEffect } from "react";
import {
  Loader2,
  Shield,
  Globe,
  MessageCircle,
  Sliders,
  LayoutGrid,
  CreditCard,
  Info,
  Cpu,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { getCurrentAdmin, updateAdminProfile } from "@/app/(admin)/auth/actions";
import { showToast } from "@/lib/toast";

import GeneralTab from "./components/GeneralTab";
import FooterTab from "./components/FooterTab";
import SocialTab from "./components/SocialTab";
import ThemeTab from "./components/ThemeTab";
import InformationsTab from "./components/InformationsTab";
import PaymentTab from "./components/PaymentTab";
import AdminInfoTab from "./components/AdminInfoTab";
import AutoProviderTab from "./components/Autoprovider";

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

    // Social Links
    whatsappNumber?: string | null;
    telegramUsername?: string | null;
    youtubeLink?: string | null;
    facebookLink?: string | null;
    instagramLink?: string | null;
    activeFloatingButton?: "WHATSAPP" | "TELEGRAM" | "YOUTUBE" | "FACEBOOK" | "INSTAGRAM";

    // Hero Button 1
    isHeroBtn1Visible?: boolean;
    heroBtn1Subtitle?: string | null;
    heroBtn1Title?: string | null;
    heroBtn1Link?: string | null;
    heroBtn1ImageUrl?: string | null;
    heroBtn1Svg?: string | null;

    // Hero Button 2
    isHeroBtn2Visible?: boolean;
    heroBtn2Subtitle?: string | null;
    heroBtn2Title?: string | null;
    heroBtn2Link?: string | null;
    heroBtn2ImageUrl?: string | null;
    heroBtn2Svg?: string | null;

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

  const [keywords, setKeywords] = useState<string[]>([]);

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

    // Social Links
    whatsappNumber: initialData?.whatsappNumber || "",
    telegramUsername: initialData?.telegramUsername || "",
    youtubeLink: initialData?.youtubeLink || "",
    facebookLink: initialData?.facebookLink || "",
    instagramLink: initialData?.instagramLink || "",
    activeFloatingButton: initialData?.activeFloatingButton || "WHATSAPP",

    // Hero Button 1
    isHeroBtn1Visible: initialData?.isHeroBtn1Visible ?? true,
    heroBtn1Subtitle: initialData?.heroBtn1Subtitle || "",
    heroBtn1Title: initialData?.heroBtn1Title || "",
    heroBtn1Link: initialData?.heroBtn1Link || "",
    heroBtn1ImageUrl: initialData?.heroBtn1ImageUrl || "",
    heroBtn1Svg: initialData?.heroBtn1Svg || "",

    // Hero Button 2
    isHeroBtn2Visible: initialData?.isHeroBtn2Visible ?? true,
    heroBtn2Subtitle: initialData?.heroBtn2Subtitle || "",
    heroBtn2Title: initialData?.heroBtn2Title || "",
    heroBtn2Link: initialData?.heroBtn2Link || "",
    heroBtn2ImageUrl: initialData?.heroBtn2ImageUrl || "",
    heroBtn2Svg: initialData?.heroBtn2Svg || "",

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

        isHeroBtn1Visible: initialData.isHeroBtn1Visible ?? true,
        heroBtn1Subtitle: initialData.heroBtn1Subtitle || "",
        heroBtn1Title: initialData.heroBtn1Title || "",
        heroBtn1Link: initialData.heroBtn1Link || "",
        heroBtn1ImageUrl: initialData.heroBtn1ImageUrl || "",
        heroBtn1Svg: initialData.heroBtn1Svg || "",

        isHeroBtn2Visible: initialData.isHeroBtn2Visible ?? true,
        heroBtn2Subtitle: initialData.heroBtn2Subtitle || "",
        heroBtn2Title: initialData.heroBtn2Title || "",
        heroBtn2Link: initialData.heroBtn2Link || "",
        heroBtn2ImageUrl: initialData.heroBtn2ImageUrl || "",
        heroBtn2Svg: initialData.heroBtn2Svg || "",

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
        const tags = initialData.metaKeywords.split(",").map((tag) => tag.trim()).filter(Boolean);
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
      const res = (await updateAdminProfile(adminForm)) as { success?: boolean; error?: string };
      showToast.dismiss(toastId);

      if (res?.success) {
        showToast.success("Admin profile updated successfully!");
        setAdminForm((prev) => ({
          ...prev,
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        router.refresh();
      } else {
        showToast.error(res?.error || "Failed to update admin profile");
      }
    } catch (error) {
      console.error(error);
      showToast.dismiss(toastId);
      showToast.error("Something went wrong!");
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
        <TabsTrigger
          value="general"
          className="shrink-0 flex items-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-950 data-[state=active]:text-neutral-900 dark:data-[state=active]:text-white text-neutral-500 dark:text-neutral-400 text-xs font-bold px-4 py-2 rounded-lg transition-all border border-transparent data-[state=active]:border-neutral-200 dark:data-[state=active]:border-neutral-800"
        >
          <Sliders className="w-3.5 h-3.5" /> General
        </TabsTrigger>
        <TabsTrigger
          value="footerSections"
          className="shrink-0 flex items-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-950 data-[state=active]:text-neutral-900 dark:data-[state=active]:text-white text-neutral-500 dark:text-neutral-400 text-xs font-bold px-4 py-2 rounded-lg transition-all border border-transparent data-[state=active]:border-neutral-200 dark:data-[state=active]:border-neutral-800"
        >
          <LayoutGrid className="w-3.5 h-3.5" /> Footer Sections
        </TabsTrigger>
        <TabsTrigger
          value="social"
          className="shrink-0 flex items-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-950 data-[state=active]:text-neutral-900 dark:data-[state=active]:text-white text-neutral-500 dark:text-neutral-400 text-xs font-bold px-4 py-2 rounded-lg transition-all border border-transparent data-[state=active]:border-neutral-200 dark:data-[state=active]:border-neutral-800"
        >
          <MessageCircle className="w-3.5 h-3.5" /> Social Links
        </TabsTrigger>
        <TabsTrigger
          value="theme"
          className="shrink-0 flex items-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-950 data-[state=active]:text-neutral-900 dark:data-[state=active]:text-white text-neutral-500 dark:text-neutral-400 text-xs font-bold px-4 py-2 rounded-lg transition-all border border-transparent data-[state=active]:border-neutral-200 dark:data-[state=active]:border-neutral-800"
        >
          <Globe className="w-3.5 h-3.5" /> Theme & Assets
        </TabsTrigger>
        <TabsTrigger
          value="informations"
          className="shrink-0 flex items-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-950 data-[state=active]:text-neutral-900 dark:data-[state=active]:text-white text-neutral-500 dark:text-neutral-400 text-xs font-bold px-4 py-2 rounded-lg transition-all border border-transparent data-[state=active]:border-neutral-200 dark:data-[state=active]:border-neutral-800"
        >
          <Info className="w-3.5 h-3.5" /> Information
        </TabsTrigger>
        <TabsTrigger
          value="payment"
          className="shrink-0 flex items-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-950 data-[state=active]:text-neutral-900 dark:data-[state=active]:text-white text-neutral-500 dark:text-neutral-400 text-xs font-bold px-4 py-2 rounded-lg transition-all border border-transparent data-[state=active]:border-neutral-200 dark:data-[state=active]:border-neutral-800"
        >
          <CreditCard className="w-3.5 h-3.5" /> Payment
        </TabsTrigger>
        <TabsTrigger
          value="autoprovider"
          className="shrink-0 flex items-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-950 data-[state=active]:text-neutral-900 dark:data-[state=active]:text-white text-neutral-500 dark:text-neutral-400 text-xs font-bold px-4 py-2 rounded-lg transition-all border border-transparent data-[state=active]:border-neutral-200 dark:data-[state=active]:border-neutral-800"
        >
          <Cpu className="w-3.5 h-3.5" /> Auto Provider
        </TabsTrigger>
        <TabsTrigger
          value="adminInfo"
          className="shrink-0 flex items-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-950 data-[state=active]:text-neutral-900 dark:data-[state=active]:text-white text-neutral-500 dark:text-neutral-400 text-xs font-bold px-4 py-2 rounded-lg transition-all border border-transparent data-[state=active]:border-neutral-200 dark:data-[state=active]:border-neutral-800"
        >
          <Shield className="w-3.5 h-3.5" /> Admin Info
        </TabsTrigger>
      </TabsList>

      {/* ==================== GENERAL TAB ==================== */}
      <TabsContent value="general">
        <GeneralTab
          formData={formData}
          setFormData={setFormData}
          handleSaveSettings={handleSaveSettings}
          loading={loading}
          renderSaveButton={renderSaveButton}
        />
      </TabsContent>

      {/* ==================== FOOTER SECTIONS TAB ==================== */}
      <TabsContent value="footerSections">
        <FooterTab
          formData={formData}
          setFormData={setFormData}
          handleSaveSettings={handleSaveSettings}
          loading={loading}
          renderSaveButton={renderSaveButton}
        />
      </TabsContent>

      {/* ==================== SOCIAL & CONTACT ==================== */}
      <TabsContent value="social">
        <SocialTab
          formData={formData}
          setFormData={setFormData}
          handleSaveSettings={handleSaveSettings}
          loading={loading}
          renderSaveButton={renderSaveButton}
        />
      </TabsContent>

      {/* ==================== THEME TAB ==================== */}
      <TabsContent value="theme">
        <ThemeTab
          formData={formData}
          setFormData={setFormData}
          onSave={handleSaveSettings}
          loading={loading}
        />
      </TabsContent>

      {/* ==================== INFORMATIONS TAB ==================== */}
      <TabsContent value="informations">
        <InformationsTab
          formData={formData}
          setFormData={setFormData}
          onSave={handleSaveSettings}
          loading={loading}
        />
      </TabsContent>

      {/* ==================== PAYMENT TAB ==================== */}
      <TabsContent value="payment">
        <PaymentTab
          formData={formData}
          setFormData={setFormData}
          onSave={handleSaveSettings}
          loading={loading}
        />
      </TabsContent>

      {/* ==================== AUTOPROVIDER TAB ==================== */}
      <TabsContent value="autoprovider">
        <AutoProviderTab
          formData={formData}
          setFormData={setFormData}
          onSave={handleSaveSettings}
          loading={loading}
        />
      </TabsContent>

      {/* ==================== ADMIN INFO TAB ==================== */}
      <TabsContent value="adminInfo">
        <AdminInfoTab
          adminForm={adminForm}
          setAdminForm={setAdminForm}
          onSaveAdmin={handleSaveAdmin}
          adminLoading={adminLoading}
        />
      </TabsContent>
    </Tabs>
  );
}