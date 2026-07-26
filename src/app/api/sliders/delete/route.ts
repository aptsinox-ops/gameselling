import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided for deletion" }, { status: 400 });
    }

    // 🗑️ একসাথে একাধিক স্লাইডার ডাটাবেজ থেকে ডিলিট
    await db.slider.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json({ message: "Sliders deleted successfully" });
  } catch (error) {
    console.error("Error bulk deleting sliders:", error);
    return NextResponse.json({ error: "Failed to delete sliders" }, { status: 500 });
  }
}