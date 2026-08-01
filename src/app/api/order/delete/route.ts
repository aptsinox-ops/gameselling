import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt"; // 🟢 getServerSession এর বদলে getToken

export async function POST(req: Request) {
  try {
    // 🟢 authOptions ছাড়াই সরাসরি রিকোয়েস্ট কুকি থেকে সেশন চেক
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
    

    const { id, ids } = await req.json();

    // চেক করা হচ্ছে একক আইডি বা আইডির অ্যারে এসেছে কিনা
    if (!id && (!ids || !Array.isArray(ids) || ids.length === 0)) {
      return NextResponse.json(
        { success: false, error: "অর্ডার আইডি পাওয়া যায়নি।" },
        { status: 400 }
      );
    }

    // ১. বাল্ক ডিলিট লজিক (যদি একাধিক আইডি থাকে)
    if (ids && ids.length > 0) {
      await prisma.order.deleteMany({
        where: {
          id: { in: ids },
        },
      });
      return NextResponse.json({ success: true, message: `${ids.length} orders deleted successfully` });
    }

    // ২. একক ডিলিট লজিক
    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Order deleted successfully" });
  } catch (error: any) {
    console.error("Delete Order Error: ", error);
    return NextResponse.json(
      { success: false, error: error.message || "অর্ডার ডিলিট করা যায়নি।" },
      { status: 500 }
    );
  }
}