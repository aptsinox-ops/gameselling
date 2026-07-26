import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { ids } = await req.json();
    
    // কনসোল লগ দিয়ে দেখুন কী আইডি আসছে
    console.log("IDs to delete:", ids);

    if (!ids || ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }

    const deleted = await prisma.category.deleteMany({
      where: {
        id: {
          in: ids, // যেহেতু আইডি String, তাই এটি কাজ করার কথা
        },
      },
    });

    return NextResponse.json({ success: true, deletedCount: deleted.count });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}