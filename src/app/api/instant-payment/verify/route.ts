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
      // ⚡ Prisma Transaction শুরু
      const orderResult = await prisma.$transaction(async (tx) => {
        
        // ⚡ ডুপ্লিকেট অর্ডার চেক (পেজ রিফ্রেশ দিলে যেন একাধিক অর্ডার না হয়)
        const existingOrder = await tx.order.findFirst({
          where: {
            inputValues: {
              path: ['invoice_id'],
              equals: invoice_id,
            },
          },
        });

        if (existingOrder) {
          const product = await tx.product.findUnique({ where: { id: productId } });
          const isVoucher = product?.productType?.toLowerCase()?.includes("voucher");
          return { orderId: existingOrder.id, isVoucher };
        }

        let user = null;

        // ১. ID দিয়ে ইউজার খোঁজা (String বা Number উভয় ফরম্যাটের জন্য নিরাপদ)
        if (rawUserId) {
          user = await tx.user.findFirst({
            where: {
              OR: [
                { id: rawUserId as any },
                ...(!isNaN(Number(rawUserId)) ? [{ id: Number(rawUserId) as any }] : []),
              ],
            },
          });
        }

        // ২. ID দিয়ে না পেলে ইমেইল দিয়ে ইউজার খোঁজা
        if (!user && (data.email || metadata.userEmail)) {
          const searchEmail = metadata.userEmail || data.email;
          user = await tx.user.findUnique({
            where: { email: searchEmail },
          });
        }

        if (!user) {
          throw new Error("অর্ডারের জন্য ইউজার খুঁজে পাওয়া যায়নি।");
        }

        // প্রোডাক্ট ও ভ্যারিয়েশন ফেচ
        const product = await tx.product.findUnique({
          where: { id: productId },
        });

        const variation = await tx.variation.findUnique({
          where: { id: variationId },
        });

        if (!product || !variation) {
          throw new Error("প্রোডাক্ট বা ভ্যারিয়েশন খুঁজে পাওয়া যায়নি।");
        }

        const isVoucher =
          product.productType?.toLowerCase() === "vouchers" ||
          product.productType?.toLowerCase() === "voucher";

        // স্টক কমানো (ভাউচার না হলে)
        if (!isVoucher && variation) {
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
        let receiptNo = "";
        let isUnique = false;
        while (!isUnique) {
          receiptNo = Math.floor(1000000 + Math.random() * 9000000).toString();
          const existingReceipt = await tx.order.findFirst({
            where: { receiptNo },
          });
          if (!existingReceipt) {
            isUnique = true;
          }
        }

        // ভাউচার কোড জেনারেট
        let voucherCode = null;
        if (isVoucher) {
          voucherCode = `VCHR-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
        }

        // অফার প্রাইস লজিক ফলব্যাক
        const effectivePrice = (variation.offerPrice !== null && variation.offerPrice !== undefined && Number(variation.offerPrice) > 0)
          ? Number(variation.offerPrice)
          : Number(variation.price || 0);

        const calculatedTotalPrice = effectivePrice * qty;

        // 📝 ডাটাবেজে অর্ডার ক্রিয়েট (inputValues-এর ভেতরে invoice_id সেভ রাখা হচ্ছে)
        const createdOrder = await tx.order.create({
          data: {
            receiptNo,
            userId: user.id,
            productId: product.id,
            variationId: variation.id,
            totalPrice: paidAmount > 0 ? paidAmount : calculatedTotalPrice,
            quantity: qty,
            status: isVoucher ? "Complete" : "Processing",
            inputValues: { ...inputValues, invoice_id },
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
      console.error("🔴 Instant Payment Order Creation Error:", dbError);
      return NextResponse.redirect(`${origin}/myorder?status=error&reason=db_error`);
    }
  } 
  // 🔴 পেমেন্ট ফেল করলে
  else {
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