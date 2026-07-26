import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Next.js-কে বাধ্য করা যাতে এই API-র কোনো রিকোয়েস্ট কোনোভাবেই ক্যাশ না করে সরাসরি DB থেকে ডাটা আনে
export const dynamic = "force-dynamic";
export const revalidate = 0;

// নো-ক্যাশ হেডার অবজেক্ট যা GET এবং PUT উভয় জায়গাতেই ব্রাউজার ও নেক্সট-জেএস ক্যাশ ব্রেক করবে
const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "Pragma": "no-cache",
  "Expires": "0",
};

// ডেটাবেজ থেকে সেটিংস ডাটা রিট্রিভ করার জন্য (GET)
export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: "STATIC" },
    });

    if (!settings) {
      // 🎯 নতুন ফিল্ডগুলোর ডিফল্ট ভ্যালুসহ তৈরি করা হবে
      settings = await prisma.siteSettings.create({
        data: {
          id: "STATIC",
          siteName: "", 
          
          // 🎯 SEO & Google Auth Defaults
          siteTitle: "",
          siteDescription: "",
          googleClientId: null,
          googleClientSecret: null,

          loginSystem: "OAUTH_MANUAL",
          
          // 💳 পেমেন্ট সেটিংস ডিফল্টস
          paymentGateway: "Uddokotapay",
          paymentBaseUrl: "",
          paymentApiKey: "",
          paymentMinAmount: "20",
          paymentMaxAmount: "50000",

          primaryColor: "#00d2ff",
          backgroundColor: "#0a0a0c",
          
          // ফুটার আলাদা গ্রাডিয়েন্ট ডিফল্ট কালার
          footerTopColor: "#061124",
          footerBottomColor: "#1a3b7b",
          
          isFooterCard1Visible: true,
          footerCard1Title1: "Fast Delivery",
          footerCard1Title2: "Within 5-10 Minutes",
          footerCard1Link: "#",
          
          isFooterCard2Visible: true,
          footerCard2Title1: "Support 24/7",
          footerCard2Title2: "Live Chat & WhatsApp",
          footerCard2Link: "#",
        },
      });
    }
    
    return NextResponse.json(settings, {
      headers: noCacheHeaders,
    });
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
}

// সেটিংস ডাটা আপডেট করার জন্য (PUT)
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // 🛠️ ফিক্সড ও সেফ ডাটা অবজেক্ট তৈরি
    const updateData = {
      siteName: body.siteName ? String(body.siteName).trim() : "",

      // 🎯 নতুন যুক্ত হওয়া SEO & Google OAuth ফিল্ডস
      siteTitle: body.siteTitle ? String(body.siteTitle).trim() : null,
      siteDescription: body.siteDescription ? String(body.siteDescription).trim() : null,
      googleClientId: body.googleClientId ? String(body.googleClientId).trim() : null,
      googleClientSecret: body.googleClientSecret ? String(body.googleClientSecret).trim() : null,

      logoUrl: body.logoUrl ? String(body.logoUrl).trim() : null,
      bannerUrl: body.bannerUrl ? String(body.bannerUrl).trim() : null,
      faviconUrl: body.faviconUrl ? String(body.faviconUrl).trim() : null,
      
      // 🎯 নতুন যুক্ত হওয়া ব্যানার ও লগইন সিস্টেম ডাটা
      walletPayBanner: body.walletPayBanner ? String(body.walletPayBanner).trim() : null,
      autoPaymentBanner: body.autoPaymentBanner ? String(body.autoPaymentBanner).trim() : null,
      loginSystem: body.loginSystem ?? "OAUTH_MANUAL",

      // 💳 পেমেন্ট সেটিং ফিল্ডস
      paymentGateway: body.paymentGateway ?? "Uddokotapay",
      paymentBaseUrl: body.paymentBaseUrl ? String(body.paymentBaseUrl).trim() : null,
      paymentApiKey: body.paymentApiKey ? String(body.paymentApiKey).trim() : null,
      paymentMinAmount: body.paymentMinAmount ? String(body.paymentMinAmount).trim() : "20",
      paymentMaxAmount: body.paymentMaxAmount ? String(body.paymentMaxAmount).trim() : "50000",

      metaKeywords: body.metaKeywords ? String(body.metaKeywords).trim() : null,
      noticeText: body.noticeText ? String(body.noticeText).trim() : null,
      isHeaderVisible: typeof body.isHeaderVisible === "boolean" ? body.isHeaderVisible : true,
      isFooterVisible: typeof body.isFooterVisible === "boolean" ? body.isFooterVisible : true,
      whatsappNumber: body.whatsappNumber ? String(body.whatsappNumber).trim() : null,
      telegramUsername: body.telegramUsername ? String(body.telegramUsername).trim() : null,
      activeFloatingButton: body.activeFloatingButton ?? "WHATSAPP",
      adminEmail: body.adminEmail ? String(body.adminEmail).trim() : null,
      youtubeLink: body.youtubeLink ? String(body.youtubeLink).trim() : null,
      
      // সোশ্যাল মিডিয়া লিংক
      facebookLink: body.facebookLink ? String(body.facebookLink).trim() : null,
      instagramLink: body.instagramLink ? String(body.instagramLink).trim() : null,
      
      // কালার ফিল্ডগুলো
      primaryColor: body.primaryColor ? String(body.primaryColor).trim() : "#00d2ff",
      backgroundColor: body.backgroundColor ? String(body.backgroundColor).trim() : "#0a0a0c",
      
      // ফুটার ব্যাকগ্রাউন্ড কালার
      footerTopColor: body.footerTopColor ? String(body.footerTopColor).trim() : "#061124",
      footerBottomColor: body.footerBottomColor ? String(body.footerBottomColor).trim() : "#1a3b7b",
      
      // ফুটার সেকশন কার্ড ১ ডাটা
      isFooterCard1Visible: typeof body.isFooterCard1Visible === "boolean" ? body.isFooterCard1Visible : true,
      footerCard1Title1: body.footerCard1Title1 ? String(body.footerCard1Title1).trim() : "Fast Delivery",
      footerCard1Title2: body.footerCard1Title2 ? String(body.footerCard1Title2).trim() : "Within 5-10 Minutes",
      footerCard1Link: body.footerCard1Link ? String(body.footerCard1Link).trim() : "#",
      footerCard1ImageUrl: body.footerCard1ImageUrl ? String(body.footerCard1ImageUrl).trim() : null,
      
      // ফুটার সেকশন কার্ড ২ ডাটা
      isFooterCard2Visible: typeof body.isFooterCard2Visible === "boolean" ? body.isFooterCard2Visible : true,
      footerCard2Title1: body.footerCard2Title1 ? String(body.footerCard2Title1).trim() : "Support 24/7",
      footerCard2Title2: body.footerCard2Title2 ? String(body.footerCard2Title2).trim() : "Live Chat & WhatsApp",
      footerCard2Link: body.footerCard2Link ? String(body.footerCard2Link).trim() : "#",
      footerCard2ImageUrl: body.footerCard2ImageUrl ? String(body.footerCard2ImageUrl).trim() : null,
    };

    // ডেটাবেজে STATIC আইডির রো-তে নতুন ভ্যালু পুশ/আপডেট করা হচ্ছে
    const updatedSettings = await prisma.siteSettings.upsert({
      where: { id: "STATIC" },
      update: updateData,
      create: {
        id: "STATIC",
        ...updateData,
      },
    });

    return NextResponse.json(updatedSettings, {
      headers: noCacheHeaders,
    });
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
}