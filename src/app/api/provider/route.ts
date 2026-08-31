import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
        },
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const updatedSettings = await prisma.siteSettings.upsert({
      where: { id: "STATIC" },
      update: {
        providerBaseUrl: body.providerBaseUrl || null,
        providerApiKey: body.providerApiKey || null,
      },
      create: {
        id: "STATIC",
        providerBaseUrl: body.providerBaseUrl || null,
        providerApiKey: body.providerApiKey || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Provider settings updated successfully!",
      settings: updatedSettings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to save settings" },
      { status: 500 }
    );
  }
}