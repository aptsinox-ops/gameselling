import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // 🟢 সেশন চেক
    const session = await getServerSession(authOptions);

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

export async function PATCH(req: Request) {
  return POST(req);
}