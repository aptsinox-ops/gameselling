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

    // ১. প্রোডাক্ট, ভ্যারিয়েশন এবং প্রোভাইডার ডাটা ফেচ
    const variation = await prisma.variation.findUnique({
      where: { id: variationId },
      include: { 
        product: true,
        provider: true, // 👈 DB থেকে Dynamic Provider Relational Data
      },
    });

    if (!variation || !variation.product) {
      return NextResponse.json({ success: false, message: "Variation or Product not found!", redirectUrl: "/myorder" }, { status: 200 });
    }

    const productType = variation.product.productType?.toLowerCase() || "";
    const redirectUrl = productType === "vouchers" || productType === "voucher" ? "/code" : "/myorder";

    // ২. User ও Balance ভ্যালিডেশন
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

    // ৩. প্লেয়ার UID চেক
    const playerUid = inputValues ? (Object.values(inputValues)[0] as string) : "";
    if (!playerUid) {
      return NextResponse.json({ success: false, message: "Player UID is required!", redirectUrl }, { status: 200 });
    }

    const receiptNo = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const isFreeFireAuto = variation.product.isFreeFireAuto;

    // ==========================================
    // 🅰️ AUTO TOPUP LOGIC (Dynamic 3rd Party Provider API)
    // ==========================================
    if (isFreeFireAuto) {
      // dynamic provider URL & Key (প্রথমে DB থেকে নিবে, না থাকলে .env থেকে)
      const providerBaseUrl = (variation as any).provider?.baseUrl || process.env.PROVIDER_BASE_URL;
      const providerApiKey = (variation as any).provider?.apiKey || process.env.PROVIDER_API_KEY;

      if (!providerBaseUrl || !providerApiKey) {
        return NextResponse.json({
          success: false,
          message: "API Provider configuration missing!",
          redirectUrl,
        }, { status: 200 });
      }

      // ১. Active Voucher চেক করা
      const activeVoucher = await prisma.voucher.findFirst({
        where: {
          variationId: variationId,
          status: "ACTIVE",
        },
      });

      if (!activeVoucher) {
        return NextResponse.json({ 
          success: false, 
          message: "Stock out! No active voucher available.", 
          redirectUrl 
        }, { status: 200 });
      }

      // ২. ইউজার ব্যালেন্স ডেবিট করা ও Order (PROCESSING) তৈরি করা
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
            quantity: Number(quantity) || 1,
            status: "PROCESSING",
            inputValues: inputValues || {},
            voucherCode: activeVoucher.code,
            paymentMethod: paymentMethod || "Wallet",
          },
        }),
      ]);

      createdOrderId = order.id;

      // ৩. 3rd Party Provider API Request Call
      const apiRes = await fetch(`${providerBaseUrl}/api/v1/user/order/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": providerApiKey,
        },
        body: JSON.stringify({
          playerid: playerUid,
          package: Number((variation as any).apiPackageId || variation.title),
          code: activeVoucher.code,
          orderid: order.receiptNo,
          callback_url: `${SITE_URL}/api/webhook/topup`,
        }),
      });

      const apiData = await apiRes.json();

      // ৪. Provider Response হ্যান্ডলিং
      if (apiData.status === "success" || apiData.success === true) {
        // Voucher Mark as USED
        await prisma.voucher.update({
          where: { id: activeVoucher.id },
          data: {
            status: "USED",
            usedInOrderId: order.id,
            usedAt: new Date(),
          },
        });

        // Provider API Order ID আপডেট
        await prisma.order.update({
          where: { id: order.id },
          data: { 
            apiOrderId: apiData.order_id || null,
            status: "PROCESSING" 
          },
        });

        return NextResponse.json({
          success: true,
          message: "Order placed successfully! Top-up is processing.",
          orderId: order.id,
          redirectUrl,
        }, { status: 200 });

      } else {
        // API Failed: Order FAILED এবং Balance Refund
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "FAILED" },
        });

        await prisma.user.update({
          where: { id: parsedUserId },
          data: { balance: { increment: orderAmount } },
        });

        return NextResponse.json({
          success: false,
          message: apiData.message || "Auto top-up failed! Money refunded to your balance.",
          orderId: order.id,
          redirectUrl,
        }, { status: 200 });
      }
    }

    // ==========================================
    // 🅱️ MANUAL ORDER LOGIC (Non-Auto Orders)
    // ==========================================
    const [_, manualOrder] = await prisma.$transaction([
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
          quantity: Number(quantity) || 1,
          status: "PENDING",
          inputValues: inputValues || {},
          paymentMethod: paymentMethod || "Wallet",
        },
      }),
    ]);

    return NextResponse.json({ 
      success: true, 
      message: "Manual order placed successfully!",
      orderId: manualOrder.id,
      redirectUrl,
    }, { status: 200 });

  } catch (error: any) {
    console.error("ORDER_API_ERROR:", error);

    if (createdOrderId && currentUserId) {
      try {
        await prisma.order.update({
          where: { id: createdOrderId },
          data: { status: "FAILED" },
        });

        await prisma.user.update({
          where: { id: currentUserId },
          data: { balance: { increment: currentOrderAmount } },
        });
      } catch (refundErr) {
        console.error("REFUND_FAILED_IN_CATCH:", refundErr);
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