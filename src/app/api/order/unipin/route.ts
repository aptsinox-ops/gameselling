import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId } = body; // ফ্রন্টএন্ড থেকে অর্ডার ID আসবে

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    // ১. অর্ডার ডাটা রিট্রাইভ করা (User, Product & Variation সহ)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        variation: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // ২. inputValues (Json) থেকে Player UID বের করা
    const inputData = order.inputValues as Record<string, any>;
    const playerId = inputData?.uid || inputData?.["Enter UID"] || inputData?.playerid;

    if (!playerId) {
      return NextResponse.json(
        { success: false, message: "Player UID not found in order data" },
        { status: 400 }
      );
    }

    // ৩. Variation title থেকে শুধুমাত্র সংখ্যা বের করা (Regex)
    // উদাহরণ: "25 Diamond" -> 25, "115 Diamonds Pack" -> 115
    const extractedNumber = order.variation.title.replace(/\D/g, "");
    const packageId = extractedNumber ? parseInt(extractedNumber, 10) : null;

    if (!packageId) {
      return NextResponse.json(
        { success: false, message: "Invalid package number in variation title" },
        { status: 400 }
      );
    }

    // ৪. Voucher টেবিল থেকে ১টি ACTIVE ভাউচার নির্বাচন ও লক (Transaction) করা
    const voucher = await prisma.voucher.findFirst({
      where: {
        variationId: order.variationId,
        status: "ACTIVE",
      },
    });

    if (!voucher) {
      return NextResponse.json(
        { success: false, message: "No active voucher codes available for this item" },
        { status: 400 }
      );
    }

    // ৫. Provider API Credentials রিট্রাইভ করা
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "STATIC" },
    });

    if (!settings?.providerBaseUrl || !settings?.providerApiKey) {
      return NextResponse.json(
        { success: false, message: "Provider credentials missing in settings" },
        { status: 400 }
      );
    }

    const cleanBaseUrl = settings.providerBaseUrl.replace(/\/+$/, "");
    const providerEndpoint = `${cleanBaseUrl}/api/v1/user/order/create`;

    // 🏆 ৬. Provider API-তে রিকোয়েস্ট পাঠানো
    const providerResponse = await fetch(providerEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": settings.providerApiKey,
      },
      body: JSON.stringify({
        playerid: String(playerId),
        package: packageId,
        code: voucher.code,
        orderid: order.receiptNo || order.id,
      }),
    });

    const resData = await providerResponse.json();

    if (!providerResponse.ok || resData.status !== "success") {
      return NextResponse.json(
        {
          success: false,
          message: resData.message || "Provider order creation failed",
          details: resData,
        },
        { status: 400 }
      );
    }

    // 🎯 ৭. প্রসেসিং সফল হলে ডাটাবেজে ভাউচার স্টেটাস USED করা ও অর্ডার আপডেট করা
    await prisma.$transaction([
      prisma.voucher.update({
        where: { id: voucher.id },
        data: {
          status: "USED",
          usedInOrderId: order.id,
          usedAt: new Date(),
        },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: "COMPLETED",
          voucherCode: voucher.code,
          apiOrderId: resData.order_id || null,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "UniPin Order completed successfully!",
      apiOrderId: resData.order_id,
    });

  } catch (error: any) {
    console.error("UniPin Process Error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}