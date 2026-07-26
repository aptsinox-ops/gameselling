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
    
    const rawUserId = metadata.userId;
    const parsedUserId = rawUserId && !isNaN(Number(rawUserId)) ? Number(rawUserId) : null;
    
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
        
        let user = null;

        // ১. ID (Int) দিয়ে ইউজার খোঁজা
        if (parsedUserId) {
          user = await tx.user.findUnique({
            where: { id: parsedUserId },
          });
        }

        // ২. ID দিয়ে না পেলে পেমেন্টের/মেটাডেটার ইমেইল দিয়ে ইউজার খোঁজা
        if (!user && (data.email || metadata.userEmail)) {
          const searchEmail = metadata.userEmail || data.email;
          user = await tx.user.findUnique({
            where: { email: searchEmail },
          });
        }

        // ❌ যদি কোনো ইউজারই না পাওয়া যায়
        if (!user) {
          throw new Error("অর্ডারের জন্য ইউজার খুঁজে পাওয়া যায়নি। মেটাডেটাতে সঠিক User ID/Email ছিল না।");
        }

        console.log(`✅ Order process ongoing for User ID: ${user.id} (${user.email})`);

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
          const existingOrder = await tx.order.findFirst({
            where: { receiptNo },
          });
          if (!existingOrder) {
            isUnique = true;
          }
        }

        // ভাউচার কোড জেনারেট
        let voucherCode = null;
        if (isVoucher) {
          voucherCode = `VCHR-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
        }

        // 📝 ডাটাবেজে ফাইনাল অর্ডার ক্রিয়েট (এখানে paymentMethod: "Instant" যোগ করা হয়েছে)
        const createdOrder = await tx.order.create({
          data: {
            receiptNo,
            userId: user.id,
            productId: product.id,
            variationId: variation.id,
            totalPrice: paidAmount > 0 ? paidAmount : Number(variation.price) * qty,
            quantity: qty,
            status: isVoucher ? "Complete" : "Processing",
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

      // 🎯 ৪. অটোমেটিক রিডাইরেক্ট
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