import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: বর্তমান প্রোভাইডার সেটিংস পাওয়ার জন্য
export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// POST / PUT: প্রোভাইডার ক্রেডেনশিয়াল আপডেট করার জন্য
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { providerName, providerBaseUrl, providerApiKey, isAutoTopupEnabled } = body;

    // upsert ব্যবহার করলে আগে থেকে রেকর্ড থাকলে update হবে, না থাকলে create হবে
    const updatedSettings = await prisma.siteSettings.upsert({
      where: { id: "STATIC" },
      update: {
        providerName,
        providerBaseUrl,
        providerApiKey,
        isAutoTopupEnabled,
      },
      create: {
        id: "STATIC",
        providerName,
        providerBaseUrl,
        providerApiKey,
        isAutoTopupEnabled,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Provider settings updated successfully!",
      settings: updatedSettings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to save provider settings" },
      { status: 500 }
    );
  }
}