import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🟢 GET Method
export async function GET(): Promise<NextResponse> {
  try {
    const setting = await (prisma as any).siteSettings.findUnique({
      where: { id: "STATIC" },
    });

    return NextResponse.json(setting || {}, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// 🟢 POST Method
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();

    const updatedSetting = await (prisma as any).siteSettings.upsert({
      where: { id: "STATIC" },
      update: body,
      create: {
        id: "STATIC",
        ...body,
      },
    });

    return NextResponse.json(updatedSetting, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}