"use server"

import { db } from "@/lib/db"; // আপনার Prisma Client ইমপোর্ট করুন

interface CreateOrderPayload {
  userId: number;
  productId: string;
  variationId: string;
  inputValues: Record<string, string>;
}

export async function createTopUpOrder(payload: CreateOrderPayload) {
  const { userId, productId, variationId, inputValues } = payload;

  try {
    // Prisma Transaction শুরু
    const result = await db.$transaction(async (tx) => {
      
      // ১. ইউজার খুঁজে বের করা
      const user = await tx.user.findUnique({
        where: { id: userId },
      });
      if (!user) throw new Error("User not found!");

      // ২. ভ্যারিয়েশন এবং প্রোডাক্ট ডিটেইলস চেক করা
      const variation = await tx.variation.findUnique({
        where: { id: variationId },
        include: { product: true },
      });
      if (!variation) throw new Error("Product variation not found!");
      if (variation.status !== "ON" || variation.product.status !== "ON") {
        throw new Error("This product or variation is currently unavailable.");
      }

      // ৩. স্টক চেক করা
      if (variation.stock < 1) {
        throw new Error("Out of Stock! This package is currently unavailable.");
      }

      // ৪. ব্যালেন্স টাইপ কাস্টিং ও কঠোর চেকিং (Float বা Number মিসম্যাচ সমাধান)
      const currentUserBalance = Number(user.balance);
      const requiredPrice = Number(variation.price);

      if (isNaN(currentUserBalance) || isNaN(requiredPrice)) {
        throw new Error("Invalid balance or price values encountered.");
      }

      if (currentUserBalance < requiredPrice) {
        throw new Error("Insufficient Balance! Please recharge your wallet.");
      }

      // ৫. ৭ ডিজিটের র্যান্ডম এবং ইউনিক Receipt No তৈরি করা
      let receiptNo = "";
      let isUnique = false;
      while (!isUnique) {
        // ৭ ডিজিটের র্যান্ডম সংখ্যা তৈরি (১০০০০০০ থেকে ৯৯৯৯৯৯৯)
        receiptNo = Math.floor(1000000 + Math.random() * 9000000).toString();
        const existingOrder = await tx.order.findUnique({
          where: { receiptNo },
        });
        if (!existingOrder) {
          isUnique = true;
        }
      }

      // ৬. কন্ডিশনাল অর্ডার টাইপ ও ভাউচার হ্যান্ডেলিং
      const productType = variation.product.productType || "";
      const isVoucher = productType.toLowerCase() === "vouchers";
      const status = isVoucher ? "Complete" : "Processing";
      
      // উদাহরণস্বরূপ একটি ডাইনামিক ভাউচার কোড জেনারেট করা হলো (আপনি অ্যাডমিন স্টক লজিকও এখানে লিখতে পারেন)
      const voucherCode = isVoucher 
        ? `VCH-${Math.random().toString(36).substring(2, 10).toUpperCase()}` 
        : null;

      // ৭. ইউজারের ব্যালেন্স কাটা
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          balance: {
            decrement: requiredPrice,
          },
        },
      });

      // ৮. ভ্যারিয়েশনের স্টক ১ মাইনাস করা
      await tx.variation.update({
        where: { id: variation.id },
        data: {
          stock: {
            decrement: 1,
          },
        },
      });

      // ৯. অর্ডার টেবিল সেভ করা
      const newOrder = await tx.order.create({
        data: {
          receiptNo,
          userId: user.id,
          productId: variation.product.id,
          variationId: variation.id,
          totalPrice: requiredPrice,
          status,
          inputValues: inputValues, // JSON ডাটা
          voucherCode,
        },
      });

      return {
        success: true,
        orderId: newOrder.id,
        productType,
      };
    });

    return result;

  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Something went wrong during checkout.",
    };
  }
}