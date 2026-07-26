import SettingsForm from "./SettingsForm"; 
import AdminHeader from "@/components/admin/Header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"; 

// 🛠️ প্রিজমা ইম্পোর্ট
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  
  // ১. সাইট সেটিংস ফেচ করা হচ্ছে
  let dbSettings = null;
  try {
    if (prisma) {
      dbSettings = await prisma.siteSettings.findFirst(); 
    }
  } catch (error) {
    console.error("Error fetching db settings:", error);
  }

  // ২. স্কিমার সাথে মিলিয়ে সব ডেটা ম্যাপ করা হলো
  const defaultData = {
    siteName: dbSettings?.siteName || "", 
    
    // 🎯 নতুন যোগ করা SEO & Google OAuth ফিল্ডস (যা মিসিং ছিল)
    siteTitle: dbSettings?.siteTitle || "",
    siteDescription: dbSettings?.siteDescription || "",
    googleClientId: dbSettings?.googleClientId || "",
    googleClientSecret: dbSettings?.googleClientSecret || "",

    logoUrl: dbSettings?.logoUrl || "",
    bannerUrl: dbSettings?.bannerUrl || "",
    faviconUrl: dbSettings?.faviconUrl || "",

    // 🎯 নতুন যোগ করা ব্যানার ও লগইন সিস্টেম
    walletPayBanner: dbSettings?.walletPayBanner || "",
    autoPaymentBanner: dbSettings?.autoPaymentBanner || "",
    loginSystem: (dbSettings?.loginSystem as "OAUTH" | "MANUAL" | "OAUTH_MANUAL") || "OAUTH_MANUAL",

    // 💳 পেমেন্ট গেটওয়ে সেটিং ডাটা
    paymentGateway: (dbSettings?.paymentGateway as "Uddokotapay" | "Piprapay" | "others") || "Uddokotapay",
    paymentBaseUrl: dbSettings?.paymentBaseUrl || "",
    paymentApiKey: dbSettings?.paymentApiKey || "",
    paymentMinAmount: dbSettings?.paymentMinAmount || "20",
    paymentMaxAmount: dbSettings?.paymentMaxAmount || "50000",

    metaKeywords: dbSettings?.metaKeywords || "", 
    noticeText: dbSettings?.noticeText || "", 
    isHeaderVisible: dbSettings?.isHeaderVisible ?? true,
    isFooterVisible: dbSettings?.isFooterVisible ?? true,
    whatsappNumber: dbSettings?.whatsappNumber || "",
    telegramUsername: dbSettings?.telegramUsername || "",
    youtubeLink: dbSettings?.youtubeLink || "",
    
    // সোশ্যাল মিডিয়া লিংকগুলো
    facebookLink: dbSettings?.facebookLink || "",
    instagramLink: dbSettings?.instagramLink || "",
    
    // ফ্লোটিং বাটন অপশন
    activeFloatingButton: (dbSettings?.activeFloatingButton as "WHATSAPP" | "TELEGRAM" | "YOUTUBE" | "FACEBOOK" | "INSTAGRAM") || "WHATSAPP",
    
    adminEmail: dbSettings?.adminEmail || "",
    primaryColor: dbSettings?.primaryColor || "#00d2ff",
    backgroundColor: dbSettings?.backgroundColor || "#0a0a0c",

    // ফুটার কালার ও কার্ড সেটিং
    footerTopColor: dbSettings?.footerTopColor || "#061124",
    footerBottomColor: dbSettings?.footerBottomColor || "#1a3b7b",
    
    isFooterCard1Visible: dbSettings?.isFooterCard1Visible ?? true,
    footerCard1Title1: dbSettings?.footerCard1Title1 || "Fast Delivery",
    footerCard1Title2: dbSettings?.footerCard1Title2 || "Within 5-10 Minutes",
    footerCard1Link: dbSettings?.footerCard1Link || "#",
    footerCard1ImageUrl: dbSettings?.footerCard1ImageUrl || "",
    
    isFooterCard2Visible: dbSettings?.isFooterCard2Visible ?? true,
    footerCard2Title1: dbSettings?.footerCard2Title1 || "Support 24/7",
    footerCard2Title2: dbSettings?.footerCard2Title2 || "Live Chat & WhatsApp",
    footerCard2Link: dbSettings?.footerCard2Link || "#",
    footerCard2ImageUrl: dbSettings?.footerCard2ImageUrl || "",
  };

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      
      <SidebarInset>
        {/* হেডারে ডাইনামিক সাইট নেম পাস করা হলো */}
        <AdminHeader siteName={dbSettings?.siteName || "Admin Panel"} />
        
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              
              {/* টাইটেল এবং ডেসক্রিপশন */}
              <div className="space-y-1">
                <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                  System Settings
                </h1>
                <p className="text-sm text-neutral-400">
                  Configure your store dynamics, payment visual components, and core systems.
                </p>
              </div>

              {/* সেটিংস ফর্ম কন্টেইনার */}
              <div className="mt-2 mr-0 sm:mr-50 md:mr-50">
                <SettingsForm initialData={defaultData} />
              </div>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}