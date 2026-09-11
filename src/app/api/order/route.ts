import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://zebotopup.store";

export async function POST(req: Request) {
  let createdOrderId: string | null = null;
  let currentUserId: number | null = null;
  let currentOrderAmount: number = 0;

  try {
    const body = await req.json();
    const { productId, variationId, totalPrice, inputValues, quantity, userId, paymentMethod } = body;

    // ১. inputValues সুরক্ষিতভাবে অবজেক্টে পার্স করা
    let parsedInputValues = {};
    if (typeof inputValues === "string") {
      try {
        parsedInputValues = JSON.parse(inputValues);
      } catch {
        parsedInputValues = { input: inputValues };
      }
    } else if (inputValues && typeof inputValues === "object") {
      parsedInputValues = inputValues;
    }

    // ২. প্রোডাক্ট ও ভ্যারিয়েশন ফেচ
    const variation = await prisma.variation.findUnique({
      where: { id: variationId },
      include: { product: true },
    });

    if (!variation || !variation.product) {
      return NextResponse.json({ success: false, message: "Variation or Product not found!", redirectUrl: "/myorder" }, { status: 200 });
    }

    const productType = variation.product.productType?.toLowerCase() || "";
    const redirectUrl = productType === "vouchers" || productType === "voucher" ? "/code" : "/myorder";

    // ৩. ইউজার ও ব্যালেন্স ভ্যালিডেশন
    const parsedUserId = Number(userId);
    if (!userId || isNaN(parsedUserId)) {
      return NextResponse.json({ success: false, message: "Invalid User ID!", redirectUrl }, { status: 200 });
    }
    currentUserId = parsedUserId;

    const user = await prisma.user.findUnique({
      where: { id: parsedUserId },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found!", redirectUrl }, { status: 200 });
    }

    const orderAmount = Number(totalPrice);
    currentOrderAmount = orderAmount;

    if (user.balance < orderAmount) {
      return NextResponse.json({ success: false, message: "Insufficient wallet balance!", redirectUrl }, { status: 200 });
    }

    const orderQty = Math.max(1, Number(quantity) || 1);
    const receiptNo = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const isFreeFireAuto = variation.product.isFreeFireAuto;

    // ==========================================
    // 🅰️ AUTO TOPUP LOGIC
    // ==========================================
    if (isFreeFireAuto) {
      const playerUid = Object.values(parsedInputValues)[0] ? String(Object.values(parsedInputValues)[0]).trim() : "";

      if (!playerUid) {
        return NextResponse.json({ success: false, message: "Player UID is required for Auto Topup!", redirectUrl }, { status: 200 });
      }

      const settings = await prisma.siteSettings.findUnique({ where: { id: "STATIC" } });
      const providerBaseUrl = settings?.providerBaseUrl || process.env.PROVIDER_BASE_URL;
      const providerApiKey = settings?.providerApiKey || process.env.PROVIDER_API_KEY;

      if (!providerBaseUrl || !providerApiKey) {
        return NextResponse.json({ success: false, message: "API Provider configuration missing!", redirectUrl }, { status: 200 });
      }

      const activeVoucher = await prisma.voucher.findFirst({
        where: { variationId: variationId, status: "ACTIVE" },
      });

      if (!activeVoucher) {
        return NextResponse.json({ success: false, message: "Stock out! No active voucher available.", redirectUrl }, { status: 200 });
      }

      const [_, order] = await prisma.$transaction([
        prisma.user.update({
          where: { id: parsedUserId },
          data: { balance: { decrement: orderAmount } },
        }),
        prisma.order.create({
          data: {
            receiptNo,
            userId: parsedUserId,
            productId,
            variationId,
            totalPrice: orderAmount,
            quantity: orderQty,
            status: "PROCESSING",
            inputValues: parsedInputValues,
            voucherCode: activeVoucher.code,
            paymentMethod: paymentMethod || "Wallet",
          },
        }),
      ]);

      createdOrderId = order.id;

      let finalPackageId: number;
      if (variation.apiPackageId) {
        finalPackageId = Number(variation.apiPackageId);
      } else {
        const extractedDigits = variation.title.replace(/\D/g, "");
        finalPackageId = extractedDigits ? parseInt(extractedDigits, 10) : 0;
      }

      const cleanBaseUrl = providerBaseUrl.replace(/\/+$/, "");

      const apiRes = await fetch(`${cleanBaseUrl}/api/v1/user/order/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": providerApiKey,
        },
        body: JSON.stringify({
          playerid: playerUid,
          package: finalPackageId,
          code: activeVoucher.code,
          orderid: order.receiptNo,
          callback_url: `${SITE_URL}/api/webhook/topup`,
        }),
      });

      const apiData = await apiRes.json();

      if (apiData.status === "success" || apiData.success === true) {
        await prisma.voucher.update({
          where: { id: activeVoucher.id },
          data: { status: "USED", usedInOrderId: order.id, usedAt: new Date() },
        });

        await prisma.order.update({
          where: { id: order.id },
          data: { apiOrderId: apiData.order_id || null, status: "PROCESSING" },
        });

        return NextResponse.json({ success: true, message: "Order placed successfully!", orderId: order.id, redirectUrl }, { status: 200 });
      } else {
        await prisma.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
        await prisma.user.update({ where: { id: parsedUserId }, data: { balance: { increment: orderAmount } } });

        return NextResponse.json({ success: false, message: apiData.message || "Auto top-up failed!", orderId: order.id, redirectUrl }, { status: 200 });
      }
    }

    // ==========================================
    // 🅱️ MANUAL ORDER LOGIC (Non-Auto Orders)
    // ==========================================

    // ১. ভ্যারিয়েশন স্টক আউট চেক
    if (typeof variation.stock === "number" && variation.stock < orderQty) {
      return NextResponse.json({ success: false, message: "Stock out! Item is out of stock.", redirectUrl }, { status: 200 });
    }

    // ২. ট্রানজ্যাকশন অ্যারে (User Balance Decrement + Order Create)
    const transactionCalls: any[] = [
      prisma.user.update({
        where: { id: parsedUserId },
        data: { balance: { decrement: orderAmount } },
      }),
      prisma.order.create({
        data: {
          receiptNo,
          userId: parsedUserId,
          productId,
          variationId,
          totalPrice: orderAmount,
          quantity: orderQty,
          status: "PENDING",
          inputValues: parsedInputValues,
          paymentMethod: paymentMethod || "Wallet",
        },
      }),
    ];

    // ৩. স্টক কাটাকুটি (Variation Stock Decrement)
    if (typeof variation.stock === "number") {
      transactionCalls.push(
        prisma.variation.update({
          where: { id: variationId },
          data: { stock: { decrement: orderQty } },
        })
      );
    }

    const results = await prisma.$transaction(transactionCalls);
    const manualOrder = results[1];

    return NextResponse.json({
      success: true,
      message: "Manual order placed successfully!",
      orderId: manualOrder.id,
      redirectUrl,
    }, { status: 200 });

  } catch (error: any) {
    console.error("ORDER_API_ERROR:", error);

    // ফেইল্ড অর্ডারে ইউজার রিফান্ড
    if (createdOrderId && currentUserId) {
      try {
        await prisma.order.update({ where: { id: createdOrderId }, data: { status: "FAILED" } });
        await prisma.user.update({ where: { id: currentUserId }, data: { balance: { increment: currentOrderAmount } } });
      } catch (refundErr) {
        console.error("REFUND_FAILED:", refundErr);
      }
    }

    return NextResponse.json({
      success: false,
      message: error?.message || "Server error occurred. Please try again.",
      orderId: createdOrderId,
      redirectUrl: "/myorder",
    }, { status: 200 });
  }
}