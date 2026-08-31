import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "Pragma": "no-cache",
  "Expires": "0",
};

const parseString = (val: any): string | null => {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  return str.length > 0 ? str : null;
};

// GET: সেটিংস ডাটা রিট্রিভ করার জন্য
export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: "STATIC" },
    });

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: "STATIC",
          siteName: "DEMO BAZAR",

          // SEO & Auth
          siteTitle: "DEMO BAZAR | Best Online Topup Store",
          siteDescription: null,
          googleClientId: null,
          googleClientSecret: null,
          loginSystem: "OAUTH_MANUAL",

          // Payment
          paymentGateway: "Uddokotapay",
          paymentBaseUrl: null,
          paymentApiKey: null,
          paymentMinAmount: "20",
          paymentMaxAmount: "50000",

          // 🤖 শুধুমাত্র Provider Base URL এবং API Key
          providerBaseUrl: null,
          providerApiKey: null,

          primaryColor: "#00d2ff",
          backgroundColor: "#0a0a0c",

          // Hero Buttons
          isHeroBtn1Visible: true,
          heroBtn1Subtitle: "SUPPORT",
          heroBtn1Title: "Telegram",
          heroBtn1Link: "#",
          heroBtn1ImageUrl: null,
          heroBtn1Svg: null,

          isHeroBtn2Visible: true,
          heroBtn2Subtitle: "GROUP",
          heroBtn2Title: "Telegram",
          heroBtn2Link: "#",
          heroBtn2ImageUrl: null,
          heroBtn2Svg: null,

          // Footer
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

    return NextResponse.json(settings, { headers: noCacheHeaders });
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT: সেটিংস ডাটা আপডেট করার জন্য
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const updateData = {
      siteName: parseString(body.siteName) || "DEMO BAZAR",

      siteTitle: parseString(body.siteTitle),
      siteDescription: parseString(body.siteDescription),
      googleClientId: parseString(body.googleClientId),
      googleClientSecret: parseString(body.googleClientSecret),

      logoUrl: parseString(body.logoUrl),
      bannerUrl: parseString(body.bannerUrl),
      faviconUrl: parseString(body.faviconUrl),

      walletPayBanner: parseString(body.walletPayBanner),
      autoPaymentBanner: parseString(body.autoPaymentBanner),
      loginSystem: body.loginSystem ?? "OAUTH_MANUAL",

      paymentGateway: body.paymentGateway ?? "Uddokotapay",
      paymentBaseUrl: parseString(body.paymentBaseUrl),
      paymentApiKey: parseString(body.paymentApiKey),
      paymentMinAmount: parseString(body.paymentMinAmount) || "20",
      paymentMaxAmount: parseString(body.paymentMaxAmount) || "50000",

      // 🤖 শুধুমাত্র Provider Base URL এবং API Key
      providerBaseUrl: parseString(body.providerBaseUrl),
      providerApiKey: parseString(body.providerApiKey),

      metaKeywords: parseString(body.metaKeywords),
      noticeText: parseString(body.noticeText),
      isHeaderVisible: typeof body.isHeaderVisible === "boolean" ? body.isHeaderVisible : true,
      isFooterVisible: typeof body.isFooterVisible === "boolean" ? body.isFooterVisible : true,
      whatsappNumber: parseString(body.whatsappNumber),
      telegramUsername: parseString(body.telegramUsername),
      activeFloatingButton: body.activeFloatingButton ?? "WHATSAPP",
      adminEmail: parseString(body.adminEmail),
      youtubeLink: parseString(body.youtubeLink),

      facebookLink: parseString(body.facebookLink),
      instagramLink: parseString(body.instagramLink),

      primaryColor: parseString(body.primaryColor) || "#00d2ff",
      backgroundColor: parseString(body.backgroundColor) || "#0a0a0c",

      isHeroBtn1Visible: typeof body.isHeroBtn1Visible === "boolean" ? body.isHeroBtn1Visible : true,
      heroBtn1Subtitle: parseString(body.heroBtn1Subtitle) || "SUPPORT",
      heroBtn1Title: parseString(body.heroBtn1Title) || "Telegram",
      heroBtn1Link: parseString(body.heroBtn1Link),
      heroBtn1ImageUrl: parseString(body.heroBtn1ImageUrl),
      heroBtn1Svg: parseString(body.heroBtn1Svg),

      isHeroBtn2Visible: typeof body.isHeroBtn2Visible === "boolean" ? body.isHeroBtn2Visible : true,
      heroBtn2Subtitle: parseString(body.heroBtn2Subtitle) || "GROUP",
      heroBtn2Title: parseString(body.heroBtn2Title) || "Telegram",
      heroBtn2Link: parseString(body.heroBtn2Link),
      heroBtn2ImageUrl: parseString(body.heroBtn2ImageUrl),
      heroBtn2Svg: parseString(body.heroBtn2Svg),

      footerTopColor: parseString(body.footerTopColor) || "#061124",
      footerBottomColor: parseString(body.footerBottomColor) || "#1a3b7b",

      isFooterCard1Visible: typeof body.isFooterCard1Visible === "boolean" ? body.isFooterCard1Visible : true,
      footerCard1Title1: parseString(body.footerCard1Title1) || "Fast Delivery",
      footerCard1Title2: parseString(body.footerCard1Title2) || "Within 5-10 Minutes",
      footerCard1Link: parseString(body.footerCard1Link) || "#",
      footerCard1ImageUrl: parseString(body.footerCard1ImageUrl),

      isFooterCard2Visible: typeof body.isFooterCard2Visible === "boolean" ? body.isFooterCard2Visible : true,
      footerCard2Title1: parseString(body.footerCard2Title1) || "Support 24/7",
      footerCard2Title2: parseString(body.footerCard2Title2) || "Live Chat & WhatsApp",
      footerCard2Link: parseString(body.footerCard2Link) || "#",
      footerCard2ImageUrl: parseString(body.footerCard2ImageUrl),
    };

    const updatedSettings = await prisma.siteSettings.upsert({
      where: { id: "STATIC" },
      update: updateData,
      create: {
        id: "STATIC",
        ...updateData,
      },
    });

    return NextResponse.json(updatedSettings, { headers: noCacheHeaders });
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}