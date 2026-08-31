import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Provider API সাধারণত orderid (আপনার receiptNo) অথবা api_order_id পাঠায়
    const { status, orderid, api_order_id, message } = payload;

    if (!orderid && !api_order_id) {
      return NextResponse.json({ success: false, message: "Order identifier missing" }, { status: 400 });
    }

    // ১. ডাটাবেজ থেকে অর্ডার খুঁজে বের করা
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(orderid ? [{ receiptNo: String(orderid) }] : []),
          ...(api_order_id ? [{ apiOrderId: String(api_order_id) }] : []),
        ],
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // ২. অর্ডার আগেই প্রসেস হয়ে গেলে স্কিপ করবে (Idempotency)
    if (order.status === "COMPLETED" || order.status === "FAILED") {
      return NextResponse.json({ success: true, message: "Order already processed" }, { status: 200 });
    }

    // ৩. Provider Status চেক (Case-Insensitive)
    const normalizedStatus = String(status || "").toUpperCase();

    const successStatuses = ["SUCCESS", "COMPLETED", "SUCCESSFUL", "TRUE"];
    const failedStatuses = ["FAILED", "CANCELLED", "ERROR", "REJECTED", "FALSE"];

    // 🟢 সফল হলে COMPLETED হবে
    if (successStatuses.includes(normalizedStatus) || status === true) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "COMPLETED" },
      });
      return NextResponse.json({ success: true, message: "Order marked as COMPLETED" }, { status: 200 });
    } 
    
    // 🔴 ব্যর্থ হলেই কেবল FAILED হবে এবং ব্যালেন্স অটো রিফান্ড হবে
    else if (failedStatuses.includes(normalizedStatus) || status === false) {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { status: "FAILED" },
        }),
        prisma.user.update({
          where: { id: order.userId },
          data: { balance: { increment: order.totalPrice } },
        }),
      ]);
      return NextResponse.json({ success: true, message: "Order marked as FAILED and refunded" }, { status: 200 });
    } 
    
    // 🟡 PENDING / PROCESSING হলে কোনো রিফান্ড বা চেঞ্জ হবে না
    else {
      return NextResponse.json({ success: true, message: `Status is ${status}, waiting for final update` }, { status: 200 });
    }

  } catch (error: any) {
    console.error("WEBHOOK_ERROR:", error);
    return NextResponse.json({ success: false, message: error.message || "Webhook error" }, { status: 500 });
  }
}