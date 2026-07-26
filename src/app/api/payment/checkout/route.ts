import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { amount, name, email, userId } = await req.json();

    // ১. ইউজার আইডি চেক
    if (!userId) {
      return NextResponse.json(
        { message: "ইউজার আইডি পাওয়া যায়নি। পুনরায় লগইন করুন।" },
        { status: 400 }
      );
    }

    // ২. ডেটাবেজ থেকে পেমেন্ট সেটিংস ফেচ করা
    const settings = await prisma.siteSettings.findFirst();

    const API_KEY = settings?.paymentApiKey || "";
    // ⚡ Base URL না থাকলে গেটওয়ের ডিফল্ট ডোমেন বসবে (এখানে আপনার গেটওয়ের API Domain দিন)
    const DEFAULT_BASE_URL = "https://pay.yourdomain.com/api"; 
    const BASE_URL = settings?.paymentBaseUrl || DEFAULT_BASE_URL;

    const minAmount = Number(settings?.paymentMinAmount || "1");
    const maxAmount = Number(settings?.paymentMaxAmount || "9999999");

    if (!API_KEY) {
      return NextResponse.json(
        { message: "পেমেন্ট গেটওয়ে API Key সেটআপ করা হয়নি।" },
        { status: 400 }
      );
    }

    const numAmount = Number(amount);

    // ৩. ডাইনামিক Min / Max অ্যামাউন্ট ভ্যালিডেশন
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

    // ৪. Base URL ক্লিন করে রিডাইরেক্ট ইউআরএল সেটআপ
    const cleanBaseUrl = BASE_URL.replace(/\/$/, "");
    const origin = req.headers.get("origin") || "http://localhost:3000";

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

    // ৫. গেটওয়েতে হিট করা
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