// 📁 /api/categories/status/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { id, status } = await req.json();

    if (!id || typeof status === "undefined") {
      return NextResponse.json(
        { error: "Category ID and status are required" },
        { status: 400 }
      );
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { status: Boolean(status) }, // Boolean টাইপ নিশ্চিত করা
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Error updating category status:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}