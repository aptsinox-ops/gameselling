import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt"; // 🟢 getServerSession এর বদলে getToken

export async function POST(req: Request) {
  try {
    // 🟢 authOptions ছাড়াই সরাসরি রিকোয়েস্ট কুকি থেকে সেশন চেক
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized! দয়া করে লগইন করুন।" },
        { status: 401 }
      );
    }

    // রিকোয়েস্ট বডি থেকে ডাটা নেওয়া
    const { id, status, voucherCode } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "অর্ডার আইডি এবং স্ট্যাটাস প্রয়োজন।" },
        { status: 400 }
      );
    }

    const updateData: any = { status };
    
    if (voucherCode !== undefined && voucherCode !== "") {
      updateData.voucherCode = voucherCode;
    }

    // ডাটাবেজে অর্ডার আপডেট করা
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error("Update Status Error: ", error);
    return NextResponse.json(
      { success: false, error: error.message || "স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}