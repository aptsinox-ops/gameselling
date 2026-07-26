import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { id, name, slotNo, status } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    // আপডেট লজিক
    const updatedCategory = await prisma.category.update({
      where: {
        id: id,
      },
      data: {
        name,
        slotNo,
        // যদি status পাঠানো হয়, তবেই এটি আপডেট হবে, অন্যথায় আগেরটিই থাকবে
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json({ success: true, data: updatedCategory });
  } catch (error) {
    console.error("Edit Error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}