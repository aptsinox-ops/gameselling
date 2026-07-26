import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // ⚡ ফিক্সড: নতুন পাথ থেকে ইম্পোর্ট করা হলো
import { prisma } from "@/lib/prisma";   // ⚡ ফিক্সড: গ্লোবাল প্রিজমা ব্যবহার করা হলো (new PrismaClient() এর বদলে)

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // সেশন না থাকলে সিকিউরলি ৪০১ রিটার্ন করবে
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { balance: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Decimal/BigInt ক্র্যাশ থেকে বাঁচতে এবং নিখুঁত লাইভ আপডেটের জন্য Number কনভার্সন
    return NextResponse.json({ balance: Number(user.balance) || 0 });
  } catch (error: any) {
    console.error("Balance Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}