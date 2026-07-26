import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId, phone } = await req.json();

    if (!userId || !phone) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id: Number(userId) },
      data: { phone },
    });

    return NextResponse.json({ success: true, phone: updatedUser.phone });
  } catch (error: any) {
    console.error("Failed to update phone:", error);
    return NextResponse.json(
      { error: "Phone number update failed or already exists" },
      { status: 500 }
    );
  }
}