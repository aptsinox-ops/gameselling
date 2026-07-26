import { NextResponse } from "next/server"
import { db } from "@/lib/db" // আপনার Prisma বা DB Instance Path

// PATCH: Navigation Item আপডেট করার জন্য
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, icon, href, targetAudience, slot, status } = body

    if (!id) {
      return NextResponse.json({ error: "Nav Item ID is required" }, { status: 400 })
    }

    const updatedNavItem = await db.navItem.update({
      where: { id },
      data: {
        name,
        icon,
        href,
        targetAudience,
        slot: Number(slot),
        status: status === "ON" || status === true ? "ON" : "OFF",
      },
    })

    return NextResponse.json(updatedNavItem, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update nav item" },
      { status: 500 }
    )
  }
}

// DELETE: Navigation Item মুছে ফেলার জন্য
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "Nav Item ID is required" }, { status: 400 })
    }

    await db.navItem.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: "Nav item deleted successfully" },
      { status: 200 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete nav item" },
      { status: 500 }
    )
  }
}