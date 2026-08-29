import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processFreeFireAutoTopup } from "@/lib/automation-bridge";

// 🟢 Vercel Timeout বাড়ানোর জন্য এটি অত্যন্ত জরুরি (৬০ সেকেন্ড পর্যন্ত ওয়েট করবে)
export const maxDuration = 60;

export async function POST(req: Request) {
  let createdOrderId: string | null = null;
  let currentUserId: number | null = null;
  let currentOrderAmount: number = 0;

  try {
    const body = await req.json();
    const { productId, variationId, totalPrice, inputValues, quantity, userId, paymentMethod } = body;

    // ১. প্রোডাক্ট ও ভ্যারিয়েশন ভ্যালিডেশন
    const variation = await prisma.variation.findUnique({
      where: { id: variationId },
      include: { product: true },
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
    // 🅰️ AUTO TOPUP LOGIC (FreeFire Auto)
    // ==========================================
    if (isFreeFireAuto) {
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

      // ব্যালেন্স কাটা এবং অর্ডার PROCESSING স্ট্যাটাসে তৈরি
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

      // পাইথন অটোমেশন রান করা
      const autoResult = await processFreeFireAutoTopup({
        playerUid: playerUid,
        diamondAmount: variation.title,
        voucherCode: activeVoucher.code,
      });

      // Success হলে: COMPLETED
      if (autoResult.success) {
        await prisma.voucher.update({
          where: { id: activeVoucher.id },
          data: {
            status: "USED",
            usedInOrderId: order.id,
            usedAt: new Date(),
          },
        });

        await prisma.order.update({
          where: { id: order.id },
          data: { status: "COMPLETED" },
        });

        return NextResponse.json({
          success: true,
          message: "Order placed and Topup completed successfully!",
          orderId: order.id,
          redirectUrl,
        }, { status: 200 });

      } else {
        // Auto Topup Fail হলে: FAILED, Voucher EXPIRED ও Refund
        await prisma.voucher.update({
          where: { id: activeVoucher.id },
          data: { status: "EXPIRED" },
        });

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
          message: autoResult.message || "Auto topup failed! Money refunded to balance.",
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
          status: "PENDING", // ম্যানুয়াল অর্ডারের জন্য PENDING
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

    // কোনো আনহ্যান্ডেল্ড এক্সেপশন আসলে রিফান্ড লজিক
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