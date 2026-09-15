import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { amount, name, email, userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { message: "ইউজার আইডি পাওয়া যায়নি। পুনরায় লগইন করুন।" },
        { status: 400 }
      );
    }

    const settings = await prisma.siteSettings.findFirst();

    const minAmount = Number(settings?.paymentMinAmount || "10");
    const maxAmount = Number(settings?.paymentMaxAmount || "50000");
    const numAmount = Number(amount);

    if (!amount || isNaN(numAmount) || numAmount < minAmount) {
      return NextResponse.json(
        { message: `সর্বনিম্ন ${minAmount} টাকা এড করতে পারবেন।` },
        { status: 400 }
      );
    }

    if (numAmount > maxAmount) {
      return NextResponse.json(
        { message: `সর্বোচ্চ ${maxAmount} টাকা এড করতে পারবেন।` },
        { status: 400 }
      );
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const gatewayType = settings?.paymentGateway || "local";

    // 🟢 LOCAL / INTERNAL GATEWAY LOGIC
    if (gatewayType === "local") {
      // র্যান্ডম ১০০+ ক্যারেক্টারের মতো সিকিউর আনপ্রেডিক্টেবল টোকেন তৈরি
      const randomString = crypto.randomBytes(32).toString('hex');
      const timeStamp = Date.now().toString(36);
      const secureToken = `avixtopup_${timeStamp}_${randomString}`;
      
      const invoiceId = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const numUserId = Number(userId);

      // ১০ মিনিটের জন্য এক্সপায়ারি টাইম
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await prisma.autoPaymentInvoice.create({
        data: {
          invoiceId,
          token: secureToken,
          amount: numAmount,
          userId: numUserId,
          expiresAt,
          status: "PENDING",
        },
      });

      const localPaymentUrl = `${origin}/payment-provider/${secureToken}`;
      return NextResponse.json({ payment_url: localPaymentUrl });
    }

    // 🔵 UDDOKTAPAY OFFICIAL API LOGIC
    const API_KEY = settings?.paymentApiKey || "";
    const DEFAULT_BASE_URL = "https://pay.yourdomain.com/api"; 
    const BASE_URL = settings?.paymentBaseUrl || DEFAULT_BASE_URL;

    if (!API_KEY) {
      return NextResponse.json(
        { message: "পেমেন্ট গেটওয়ে API Key সেটআপ করা হয়নি।" },
        { status: 400 }
      );
    }

    const cleanBaseUrl = BASE_URL.replace(/\/$/, "");

    const payload = {
      full_name: name || "Customer",
      email: email || "customer@gmail.com",
      amount: String(numAmount),
      metadata: {
        userId: userId,
      },
      redirect_url: `${origin}/api/payment/verify`,
      cancel_url: `${origin}/add-money?status=cancelled`,
    };

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
        { message: data?.message || "পেমেন্ট গেটওয়ে থেকে সাড়া পাওয়া যায়নি।" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      { message: error?.message || "সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}