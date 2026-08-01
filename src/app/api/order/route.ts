import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const dynamic = "force-dynamic";

// ==========================================
// 1. GET Request: টেবিলের ডাটা লোড করার জন্য
// ==========================================
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
        product: {
          select: { name: true, image: true },
        },
        variation: {
          select: { title: true, price: true },
        },
      },
    });

    return NextResponse.json(orders, { status: 200 });
  } catch (error: any) {
    console.error("GET Orders Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// ==========================================
// 2. POST Request: নতুন অর্ডার তৈরি করার জন্য
// ==========================================
export async function POST(req: Request) {
  try {
    // 🟢 সেশন ভেরিফাই করা
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized! দয়া করে প্রথমে লগইন করুন।" },
        { status: 401 }
      );
    }

    const { productId, variationId, inputValues, quantity } = await req.json();

    if (!productId || !variationId) {
      return NextResponse.json(
        { success: false, error: "প্রয়োজনীয় তথ্য দেওয়া হয়নি।" },
        { status: 400 }
      );
    }

    const qty = Number(quantity) && Number(quantity) > 0 ? Number(quantity) : 1;

    const orderResult = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { email: session.user.email! },
      });

      if (!user) {
        throw new Error("ইউজার খুঁজে পাওয়া যায়নি।");
      }

      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      const variation = await tx.variation.findUnique({
        where: { id: variationId },
      });

      if (!product || !variation) {
        throw new Error("প্রোডাক্ট বা ভ্যারিয়েশন খুঁজে পাওয়া যায়নি।");
      }

      const userBalance = Number(user.balance);
      const requiredAmount = Number(variation.price) * qty;

      if (userBalance < requiredAmount) {
        throw new Error("Insufficient Balance! আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই।");
      }

      const isVoucher =
        product.productType?.toLowerCase() === "vouchers" ||
        product.productType?.toLowerCase() === "voucher";

      if (!isVoucher) {
        if (variation.stock < qty) {
          throw new Error("Out of Stock! এই ভ্যারিয়েশনটির পর্যাপ্ত স্টক নেই।");
        }

        await tx.variation.update({
          where: { id: variationId },
          data: {
            stock: {
              decrement: qty,
            },
          },
        });
      }

      await tx.user.update({
        where: { id: user.id },
        data: {
          balance: {
            decrement: requiredAmount,
          },
        },
      });

      let receiptNo = "";
      let isUnique = false;
      while (!isUnique) {
        receiptNo = Math.floor(1000000 + Math.random() * 9000000).toString();
        const existingOrder = await tx.order.findFirst({
          where: { receiptNo },
        });
        if (!existingOrder) {
          isUnique = true;
        }
      }

      let voucherCode = null;
      if (isVoucher) {
        voucherCode = `VCHR-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
      }

      const order = await tx.order.create({
        data: {
          receiptNo,
          userId: user.id,
          productId,
          variationId,
          totalPrice: requiredAmount,
          quantity: qty,
          status: isVoucher ? "COMPLETED" : "PROCESSING",
          inputValues: inputValues || {},
          voucherCode,
        },
      });

      return {
        orderId: order.id,
        productType: product.productType || "Other",
      };
    });

    return NextResponse.json({ success: true, order: orderResult });
  } catch (error: any) {
    console.error("Transaction Error: ", error);
    return NextResponse.json(
      { success: false, error: error.message || "অর্ডার প্রসেস করার সময় কোনো ভুল হয়েছে।" },
      { status: 400 }
    );
  }
}