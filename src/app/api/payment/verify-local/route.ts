import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { token, method } = await req.json();

    if (!token) {
      return NextResponse.json({ message: "Invalid Token" }, { status: 400 });
    }

    const invoice = await prisma.autoPaymentInvoice.findUnique({
      where: { token },
    });

    if (!invoice || invoice.status !== "PENDING") {
      return NextResponse.json({ message: "Invoice invalid or already processed." }, { status: 400 });
    }

    // ট্রানজেকশন সফল করে ওয়ালেট আপডেট করা
    await prisma.$transaction([
      prisma.user.update({
        where: { id: invoice.userId },
        data: {
          balance: {
            increment: invoice.amount,
          },
        },
      }),
      prisma.autoPaymentInvoice.update({
        where: { id: invoice.id },
        data: {
          status: "COMPLETED",
          method: method || "bkash",
          trxId: `LOCAL_TRX_${Date.now()}`,
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Payment verified successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 });
  }
}