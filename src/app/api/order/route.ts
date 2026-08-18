import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processFreeFireAutoTopup } from "@/lib/automation-bridge";

export async function POST(req: Request) {
  let createdOrderId: string | null = null; // 🟢 number এর জায়গায় string হবে
  let currentUserId: number | null = null;
  let currentOrderAmount: number = 0;

  try {
    const body = await req.json();
    const { productId, variationId, unitPrice, totalPrice, inputValues, quantity, userId, paymentMethod } = body;

    // ১. প্রোডাক্ট ও ভ্যারিয়েশন চেক করে শুরুতেই Redirect URL নির্ধারণ
    const variation = await prisma.variation.findUnique({
      where: { id: variationId },
      include: { product: true },
    });

    const productType = variation?.product?.productType?.toLowerCase() || "";
    const redirectUrl = productType === "vouchers" || productType === "voucher" ? "/code" : "/myorder";

    if (!variation || !variation.product) {
      return NextResponse.json({ success: false, error: "Variation or Product not found!", redirectUrl: "/myorder" }, { status: 200 });
    }

    // ২. userId ভ্যালিডেশন
    const parsedUserId = Number(userId);
    if (!userId || isNaN(parsedUserId)) {
      return NextResponse.json({ success: false, error: "Invalid User ID!", redirectUrl }, { status: 200 });
    }
    currentUserId = parsedUserId;

    const user = await prisma.user.findUnique({
      where: { id: parsedUserId },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found!", redirectUrl }, { status: 200 });
    }

    const orderAmount = Number(totalPrice);
    currentOrderAmount = orderAmount;

    if (user.balance < orderAmount) {
      return NextResponse.json({ success: false, error: "Insufficient wallet balance!", redirectUrl }, { status: 200 });
    }

    // ৩. প্লেয়ার UID চেক
    const playerUid = inputValues ? (Object.values(inputValues)[0] as string) : "";
    if (!playerUid) {
      return NextResponse.json({ success: false, error: "Player UID is required!", redirectUrl }, { status: 200 });
    }

    const receiptNo = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const isFreeFireAuto = variation.product?.isFreeFireAuto;

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
          message: "No active voucher available in stock!", 
          redirectUrl 
        }, { status: 200 });
      }

      // ৪. ব্যালেন্স কাটা এবং অর্ডার PROCESSING হিসেবে ক্রিয়েট করা
      const [updatedUser, order] = await prisma.$transaction([
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

      createdOrderId = order.id; // 🟢 এখন আর লাল দাগ থাকবে না

      // ৫. পাইথন অটোমেশন রান করা
      const autoResult = await processFreeFireAutoTopup({
        playerUid: playerUid,
        diamondAmount: variation.title,
        voucherCode: activeVoucher.code,
      });

      // ৬. Success হলে: COMPLETED
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
        // 🔴 Auto Topup Fail হলে: FAILED, Voucher EXPIRED ও Refund
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
          message: autoResult.message || "Auto topup failed! Refunded.",
          orderId: order.id,
          redirectUrl,
        }, { status: 200 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Manual order placed!",
      redirectUrl,
    }, { status: 200 });

  } catch (error: any) {
    console.error("ORDER_API_ERROR:", error);

    if (createdOrderId && currentUserId) {
      try {
        await prisma.order.update({
          where: { id: createdOrderId }, // 🟢 লাল দাগ দূর হয়ে যাবে
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
      message: "Server error occurred. Refunded.",
      orderId: createdOrderId,
      redirectUrl: "/myorder",
    }, { status: 200 });
  }
}