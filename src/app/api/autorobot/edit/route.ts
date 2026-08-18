// src/app/api/admin/autorobot/edit/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { id, title, price } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing variation id" }, { status: 400 });
    }

    const updated = await prisma.variation.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(price !== undefined ? { price: Number(price) } : {}),
      },
    });

    return NextResponse.json({ success: true, variation: updated });
  } catch (error) {
    console.error("Failed to update variation:", error);
    return NextResponse.json({ error: "Failed to update variation" }, { status: 500 });
  }
}