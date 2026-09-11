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

    // ১. প্রোডাক্ট ও ভ্যারিয়েশন ডাটা ফেচ
    const variation = await prisma.variation.findUnique({
      where: { id: variationId },
      include: {
        product: true,
      },
    });

    if (!variation || !variation.product) {
      return NextResponse.json(
        { success: false, message: "Variation or Product not found!", redirectUrl: "/myorder" },
        { status: 200 }
      );
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

    const orderQty = Math.max(1, Number(quantity) || 1);

    // ✅ Debug log — আপনার schema-তে আসল field name ও value কী আসছে দেখার জন্য
    // (একবার console/log চেক করে নিশ্চিত হয়ে নিন, পরে চাইলে মুছে দেবেন)
    console.log("VARIATION_STOCK_DEBUG:", {
      variationId: variation.id,
      stockValue: (variation as any).stock,
      stockType: typeof (variation as any).stock,
    });

    // ৩. প্লেয়ার UID চেক
    const playerUid = inputValues && typeof inputValues === "object" && Object.keys(inputValues).length > 0
      ? String(Object.values(inputValues)[0] || "").trim()
      : "";

    const receiptNo = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const isFreeFireAuto = variation.product.isFreeFireAuto;

    if (isFreeFireAuto && !playerUid) {
      return NextResponse.json({ success: false, message: "Player UID is required for Auto Topup!", redirectUrl }, { status: 200 });
    }

    // ==========================================
    // 🅰️ AUTO TOPUP LOGIC (Dynamic 3rd Party Provider API)
    // ==========================================
    if (isFreeFireAuto) {
      const settings = await prisma.siteSettings.findUnique({
        where: { id: "STATIC" },
      });

      const providerBaseUrl = settings?.providerBaseUrl || process.env.PROVIDER_BASE_URL;
      const providerApiKey = settings?.providerApiKey || process.env.PROVIDER_API_KEY;

      if (!providerBaseUrl || !providerApiKey) {
        return NextResponse.json({
          success: false,
          message: "API Provider configuration missing in Admin Settings!",
          redirectUrl,
        }, { status: 200 });
      }

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
          redirectUrl,
        }, { status: 200 });
      }

      // ✅ Auto-তেও variation.stock ট্র্যাক করা হলে সেটাও কাটবে (safe conditional decrement)
      const hasStockField = typeof (variation as any).stock === "number";

      if (hasStockField && (variation as any).stock < orderQty) {
        return NextResponse.json({
          success: false,
          message: "Stock out! Available stock is lower than requested quantity.",
          redirectUrl,
        }, { status: 200 });
      }

      const autoTxOps: any[] = [
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
            inputValues: inputValues || {},
            voucherCode: activeVoucher.code,
            paymentMethod: paymentMethod || "Wallet",
          },
        }),
      ];

      if (hasStockField) {
        autoTxOps.push(
          prisma.variation.update({
            where: { id: variationId },
            data: { stock: { decrement: orderQty } },
          })
        );
      }

      const [_, order] = await prisma.$transaction(autoTxOps);
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
          data: {
            status: "USED",
            usedInOrderId: order.id,
            usedAt: new Date(),
          },
        });

        await prisma.order.update({
          where: { id: order.id },
          data: {
            apiOrderId: apiData.order_id || null,
            status: "PROCESSING",
          },
        });

        return NextResponse.json({
          success: true,
          message: "Order placed successfully! Top-up is processing.",
          orderId: order.id,
          redirectUrl,
        }, { status: 200 });
      } else {
        // ❌ API Failed → Order FAILED, Balance Refund, ✅ Stock Refund
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "FAILED" },
        });

        const refundOps: any[] = [
          prisma.user.update({
            where: { id: parsedUserId },
            data: { balance: { increment: orderAmount } },
          }),
        ];

        if (hasStockField) {
          refundOps.push(
            prisma.variation.update({
              where: { id: variationId },
              data: { stock: { increment: orderQty } },
            })
          );
        }

        await prisma.$transaction(refundOps);

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

    const hasStockField = typeof (variation as any).stock === "number";

    // ⚠️ যদি field-ই না থাকে, সরাসরি জানিয়ে দিন — silent skip না করে
    if (!hasStockField) {
      console.warn(
        `STOCK_FIELD_MISSING_OR_NULL for variationId=${variationId}. ` +
        `variation.stock value: ${(variation as any).stock}. ` +
        `Stock will NOT be decremented. Check your Prisma schema/field name.`
      );
    }

    if (hasStockField && (variation as any).stock < orderQty) {
      return NextResponse.json({
        success: false,
        message: "Stock out! Available stock is lower than requested quantity.",
        redirectUrl,
      }, { status: 200 });
    }

    // ✅ Race-condition-safe stock decrement:
    // আগে conditionally variation আপডেট করি (stock >= orderQty শর্তে),
    // যদি matched row না পাওয়া যায় (count 0), মানে stock শেষ হয়ে গেছে — order আটকে দিন।
    if (hasStockField) {
      const stockUpdateResult = await prisma.variation.updateMany({
        where: {
          id: variationId,
          stock: { gte: orderQty },
        },
        data: {
          stock: { decrement: orderQty },
        },
      });

      if (stockUpdateResult.count === 0) {
        return NextResponse.json({
          success: false,
          message: "Stock out! Someone just grabbed the last item(s).",
          redirectUrl,
        }, { status: 200 });
      }
    }

    // ব্যালেন্স ডেবিট + Order তৈরি
    try {
      const txResults = await prisma.$transaction([
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
            inputValues: inputValues || {},
            paymentMethod: paymentMethod || "Wallet",
          },
        }),
      ]);

      const manualOrder = txResults[1];
      createdOrderId = manualOrder.id;

      return NextResponse.json({
        success: true,
        message: "Manual order placed successfully!",
        orderId: manualOrder.id,
        redirectUrl,
      }, { status: 200 });
    } catch (innerErr) {
      // যদি balance/order transaction fail করে, উপরে যে stock আগেই কেটে ফেলেছি সেটা ফেরত দিন
      if (hasStockField) {
        await prisma.variation.update({
          where: { id: variationId },
          data: { stock: { increment: orderQty } },
        }).catch((e) => console.error("STOCK_REFUND_FAILED:", e));
      }
      throw innerErr;
    }

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