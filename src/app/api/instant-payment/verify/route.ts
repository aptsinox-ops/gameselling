import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

async function verifyAndProcessOrder(invoice_id: string | null, req: Request) {
  const origin = req.headers.get("origin") || new URL(req.url).origin;

  if (!invoice_id) {
    return NextResponse.redirect(`${origin}/myorder?status=failed`);
  }

  // ১. সাইট সেটিংস ফেচ করা
  const settings = await prisma.siteSettings.findFirst();
  const API_KEY = settings?.paymentApiKey || "";
  const BASE_URL = settings?.paymentBaseUrl || "";

  if (!API_KEY || !BASE_URL) {
    return NextResponse.redirect(`${origin}/myorder?status=error&reason=no_settings`);
  }

  const cleanBaseUrl = BASE_URL.replace(/\/$/, "");

  // ২. পেমেন্ট গেটওয়ে ভেরিফাই
  const res = await fetch(`${cleanBaseUrl}/verify-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "RT-UDDOKTAPAY-API-KEY": API_KEY,
    },
    body: JSON.stringify({ invoice_id }),
  });

  const data = await res.json();

  // 🟢 ৩. পেমেন্ট সফল হলে
  if (data.status === "COMPLETED") {
    const metadata = data.metadata || {};
    
    const rawUserId = String(metadata.userId || "");
    const productId = String(metadata.productId || "");
    const variationId = String(metadata.variationId || "");

    const qty = Number(metadata.quantity || 1) > 0 ? Number(metadata.quantity || 1) : 1;
    const paidAmount = Number(data.amount || 0);

    let inputValues = {};
    try {
      inputValues = typeof metadata.inputValues === "string" 
        ? JSON.parse(metadata.inputValues) 
        : (metadata.inputValues || {});
    } catch {
      inputValues = {};
    }

    try {
      // ⚡ Prisma Transaction
      const orderResult = await prisma.$transaction(async (tx) => {
        
        let user = null;

        // ১. ID দিয়ে ইউজার খোঁজা (Int এবং String উভয় সুরক্ষাসহ)
        if (rawUserId) {
          const numId = Number(rawUserId);
          if (!isNaN(numId)) {
            user = await tx.user.findUnique({ where: { id: numId as any } });
          }
          if (!user) {
            user = await tx.user.findFirst({ where: { id: rawUserId as any } });
          }
        }

        // ২. ইমেইল দিয়ে ইউজার খোঁজা
        if (!user && (data.email || metadata.userEmail)) {
          const searchEmail = metadata.userEmail || data.email;
          user = await tx.user.findUnique({
            where: { email: searchEmail },
          });
        }

        if (!user) {
          throw new Error("User not found in metadata");
        }

        // প্রোডাক্ট ও ভ্যারিয়েশন ফেচ
        const product = await tx.product.findUnique({
          where: { id: productId },
        });

        const variation = await tx.variation.findUnique({
          where: { id: variationId },
        });

        if (!product || !variation) {
          throw new Error("Product or Variation not found");
        }

        const isVoucher =
          product.productType?.toLowerCase() === "vouchers" ||
          product.productType?.toLowerCase() === "voucher";

        // স্টক কমানো (ভাউচার না হলে)
        if (!isVoucher && variation && typeof (variation as any).stock === 'number') {
          await tx.variation.update({
            where: { id: variation.id },
            data: {
              stock: {
                decrement: qty,
              },
            },
          });
        }

        // ৭-ডিজিটের ইউনিক receiptNo জেনারেট
        let receiptNo = `ORD-${Date.now().toString().slice(-6)}`;

        // ভাউচার কোড জেনারেট
        let voucherCode = null;
        if (isVoucher) {
          voucherCode = `VCHR-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
        }

        // অফার প্রাইস হিসাব
        const hasOffer = variation.offerPrice != null && Number(variation.offerPrice) > 0;
        const effectivePrice = hasOffer ? Number(variation.offerPrice) : Number(variation.price || 0);
        const calculatedTotalPrice = effectivePrice * qty;

        // 📝 অর্ডার ক্রিয়েট (Status ক্যাপিটাল লেটারে দেওয়া হয়েছে যাতে Enum Mismatch না হয়)
        const createdOrder = await tx.order.create({
          data: {
            receiptNo,
            userId: user.id,
            productId: product.id,
            variationId: variation.id,
            totalPrice: paidAmount > 0 ? paidAmount : calculatedTotalPrice,
            quantity: qty,
            status: isVoucher ? "COMPLETED" : "PROCESSING", // standard capital values
            inputValues: inputValues,
            voucherCode: voucherCode,
            paymentMethod: "Instant",
          },
        });

        return {
          orderId: createdOrder.id,
          isVoucher,
        };
      });

      // 🎯 ৪. রিডাইরেক্ট
      if (orderResult.isVoucher) {
        return NextResponse.redirect(`${origin}/code`);
      } else {
        return NextResponse.redirect(`${origin}/myorder`);
      }

    } catch (dbError: any) {
      console.error("🔴 Instant Payment Order Creation Error Details:", dbError);
      return NextResponse.redirect(`${origin}/myorder?status=error&reason=db_error`);
    }
  } else {
    return NextResponse.redirect(`${origin}/myorder?status=failed`);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const invoice_id = searchParams.get("invoice_id");
    return await verifyAndProcessOrder(invoice_id, req);
  } catch (error) {
    const origin = new URL(req.url).origin;
    return NextResponse.redirect(`${origin}/myorder?status=error`);
  }
}

export async function POST(req: Request) {
  try {
    let invoice_id = "";
    try {
      const formData = await req.formData();
      invoice_id = (formData.get("invoice_id") as string) || "";
    } catch {
      const { searchParams } = new URL(req.url);
      invoice_id = searchParams.get("invoice_id") || "";
    }

    return await verifyAndProcessOrder(invoice_id, req);
  } catch (error) {
    const origin = new URL(req.url).origin;
    return NextResponse.redirect(`${origin}/myorder?status=error`);
  }
}