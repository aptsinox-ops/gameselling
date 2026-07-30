import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // 🟢 standard prisma instance import

// PATCH: Navigation Item আপডেট করার জন্য
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, icon, href, targetAudience, slot, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Nav Item ID is required" }, { status: 400 });
    }

    // 🟢 db.navItem এর পরিবর্তে prisma.navigation হবে
    const updatedNavItem = await prisma.navigation.update({
      where: { id },
      data: {
        name,
        icon,
        href,
        targetAudience,
        slot: Number(slot),
        status: status === "ON" || status === true ? "ON" : "OFF",
      },
    });

    return NextResponse.json(updatedNavItem, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update nav item" },
      { status: 500 }
    );
  }
}

// DELETE: Navigation Item মুছে ফেলার জন্য
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Nav Item ID is required" }, { status: 400 });
    }

    // 🟢 db.navItem এর পরিবর্তে prisma.navigation হবে
    await prisma.navigation.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Nav item deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete nav item" },
      { status: 500 }
    );
  }
}