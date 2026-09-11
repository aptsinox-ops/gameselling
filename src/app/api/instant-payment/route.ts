import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { productId, variationId, inputValues, quantity, userId, name, email } = await req.json();

    // ⚡ ১. Product ও Variation ID অবশ্যই String হতে হবে
    const strProductId = String(productId || "");
    const strVariationId = String(variationId || "");

    if (!strProductId || !strVariationId) {
      return NextResponse.json(
        { message: "প্রোডাক্ট বা ভ্যারিয়েশন সঠিক নয়।" },
        { status: 400 }
      );
    }

    // ⚡ ২. ডেটাবেজ থেকে ডাটা ফেচ (নিরাপত্তার জন্য variationId এবং productId মিলিয়ে ফেচ করা হচ্ছে)
    const variation = await prisma.variation.findFirst({
      where: {
        id: strVariationId,
        productId: strProductId, // নিশ্চিত করবে এই variation-টি এই product-েরই
      },
      include: {
        product: true, // সাথে Product-এর তথ্যও নিয়ে আসবে
      },
    });

    // যদি variation না পাওয়া যায় বা প্রোডাক্টের সাথে না মিলে
    if (!variation || !variation.product) {
      return NextResponse.json(
        { message: "আইটেমটি খুঁজে পাওয়া যায়নি বা তথ্য সঠিক নয়।" },
        { status: 404 }
      );
    }

    // Product ডাটা ভ্যারিয়েবল এ রাখা
    const product = variation.product;

    // ⚡ ৩. সেটিংস ফেচ
    const settings = await prisma.siteSettings.findFirst();
    const API_KEY = settings?.paymentApiKey || "";
    const BASE_URL = settings?.paymentBaseUrl || "";

    if (!API_KEY || !BASE_URL) {
      return NextResponse.json(
        { message: "পেমেন্ট গেটওয়ে সেটআপ করা নেই।" },
        { status: 400 }
      );
    }

    // ⚡ ৪. প্রাইস ভ্যালিডেশন (offerPrice থাকলে সেটি নিবে, না থাকলে মূল price নিবে)
    const effectivePrice = (variation.offerPrice !== null && variation.offerPrice !== undefined && Number(variation.offerPrice) > 0)
      ? Number(variation.offerPrice)
      : Number(variation.price || 0);

    const itemQty = Number(quantity || 1);
    const totalPrice = effectivePrice * itemQty;

    if (isNaN(totalPrice) || totalPrice <= 0) {
      return NextResponse.json(
        { message: "পণ্যের মূল্য সঠিক নয়।" },
        { status: 400 }
      );
    }

    const cleanBaseUrl = BASE_URL.replace(/\/$/, "");
    const origin = req.headers.get("origin") || "http://localhost:3000";

    // ⚡ ৫. ব্যাকএন্ড থেকে সেশন ইউজার অথবা রিকোয়েস্টের ইউজার কনফার্ম করা
    const finalUserId = userId || (session?.user as any)?.id || "";
    const finalEmail = email || session?.user?.email || "";

    // ⚡ ৬. UddoktaPay Payload
    const payload = {
      full_name: name || session?.user?.name || "Customer",
      email: finalEmail || "customer@gmail.com",
      amount: String(totalPrice),
      metadata: {
        userId: String(finalUserId),
        userEmail: String(finalEmail),
        productId: strProductId,
        variationId: strVariationId,
        quantity: String(itemQty),
        productType: product.productType || "Topup",
        inputValues: JSON.stringify(inputValues || {}),
      },
      redirect_url: `${origin}/api/instant-payment/verify`,
      cancel_url: `${origin}/myorder?status=cancelled`,
    };

    // ⚡ ৭. গেটওয়েতে হিট
    const response = await fetch(`${cleanBaseUrl}/checkout-v2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "RT-UDDOKTAPAY-API-KEY": API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && data?.payment_url) {
      return NextResponse.json({ payment_url: data.payment_url });
    } else {
      return NextResponse.json(
        { message: data?.message || "গেটওয়ে থেকে পেমেন্ট লিংক পাওয়া যায়নি।" },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error("Instant Payment Route Error:", error);
    return NextResponse.json(
      { message: error?.message || "সার্ভারে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}