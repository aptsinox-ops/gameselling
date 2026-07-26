import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

async function verifyAndProcessPayment(invoice_id: string | null, req: Request) {
  if (!invoice_id) {
    return NextResponse.redirect(new URL('/add-money?status=failed', req.url));
  }

  const settings = await prisma.siteSettings.findFirst();
  const API_KEY = settings?.paymentApiKey || "";
  const BASE_URL = settings?.paymentBaseUrl || "";

  if (!API_KEY || !BASE_URL) {
    return NextResponse.redirect(new URL('/add-money?status=error', req.url));
  }

  const cleanBaseUrl = BASE_URL.replace(/\/$/, "");

  const res = await fetch(`${cleanBaseUrl}/verify-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "RT-UDDOKTAPAY-API-KEY": API_KEY,
    },
    body: JSON.stringify({ invoice_id }),
  });

  const data = await res.json();
  const amount = data.amount || "0";

  // 🟢 ১. পেমেন্ট সফল হলে -> Add Money Page (Success Card)
  if (data.status === "COMPLETED") {
    const addedAmount = Number(amount);
    const rawUserId = data.metadata?.userId;
    
    // 👈 String userId কে Int/Number এ কনভার্ট করা হয়েছে
    const userId = rawUserId ? Number(rawUserId) : null;

    if (userId && !isNaN(userId) && addedAmount > 0) {
      await prisma.user.update({
        where: { id: userId }, // 👈 Prisma Int type matching fixed
        data: {
          balance: {
            increment: addedAmount,
          },
        },
      });
    }

    return NextResponse.redirect(
      new URL(`/add-money?status=success&invoice_id=${invoice_id}&amount=${amount}`, req.url)
    );
  } 
  // 🟡 ২. পেমেন্ট পেন্ডিং হলে -> Add Money Page (Pending Card)
  else if (data.status === "PENDING") {
    return NextResponse.redirect(
      new URL(`/add-money?status=pending&invoice_id=${invoice_id}&amount=${amount}`, req.url)
    );
  } 
  // 🔴 ৩. পেমেন্ট ফেল করলে -> Add Money Page (Failed Card)
  else {
    return NextResponse.redirect(
      new URL(`/add-money?status=failed&invoice_id=${invoice_id}&amount=${amount}`, req.url)
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const invoice_id = searchParams.get("invoice_id");
    return await verifyAndProcessPayment(invoice_id, req);
  } catch (error) {
    return NextResponse.redirect(new URL('/add-money?status=error', req.url));
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

    return await verifyAndProcessPayment(invoice_id, req);
  } catch (error) {
    return NextResponse.redirect(new URL('/add-money?status=error', req.url));
  }
}