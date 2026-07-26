import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🟢 Next.js 15 ডাইনামিক রাউট ফিক্স সহ DELETE মেথড
export async function DELETE(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } // 👈 params-কে Promise টাইপ দেওয়া হলো
) {
  try {
    // 🟢 Next.js 15 রুলস অনুযায়ী params-কে আগে await করতে হবে
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Variation ID is required" }, { status: 400 });
    }

    // সরাসরি ডাটাবেজ থেকে ভেরিয়েশন ডিলিট
    await prisma.variation.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Variation deleted successfully!" }, { status: 200 });
  } catch (error: any) {
    console.error("VARIATION_DELETE_ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete variation permanently" },
      { status: 500 }
    );
  }
}