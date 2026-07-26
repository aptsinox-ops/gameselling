import { NextResponse } from "next/server"
import { db } from "@/lib/db" // আপনার Prisma Client instance
import { TargetAudience, NavStatus } from "@prisma/client"

// 🟢 ১. GET Method (ডাটাবেজ থেকে নেভিগেশন ডাটা পড়ার জন্য)
export async function GET() {
  try {
    const navigations = await db.navigation.findMany({
      orderBy: {
        slot: "asc",
      },
    })

    return NextResponse.json(navigations, { status: 200 })
  } catch (error: any) {
    console.error("[NAV_GET_ERROR]:", error)
    return NextResponse.json(
      { error: "Failed to fetch navigations" },
      { status: 500 }
    )
  }
}

// 🔵 ২. POST Method (নতুন নেভিগেশন যোগ করার জন্য)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { icon, name, href, targetAudience, slot, status, sortOrder } = body

    // ১. Required Fields Validation
    if (!name || !icon || !href) {
      return NextResponse.json(
        { error: "Icon, Name, and Href are required!" },
        { status: 400 }
      )
    }

    // ২. Enum Validation
    const validAudience = Object.values(TargetAudience).includes(targetAudience)
      ? (targetAudience as TargetAudience)
      : TargetAudience.ALL

    const validStatus = Object.values(NavStatus).includes(status)
      ? (status as NavStatus)
      : NavStatus.ON

    // ৩. Number Field Parsing
    const parsedSlot = parseInt(slot, 10)
    const parsedSortOrder = parseInt(sortOrder, 10)

    // ৪. Prisma Database Request
    const newNav = await db.navigation.create({
      data: {
        icon: icon.trim(),
        name: name.trim(),
        href: href.trim(),
        targetAudience: validAudience,
        slot: isNaN(parsedSlot) ? 1 : parsedSlot,
        status: validStatus,
        sortOrder: isNaN(parsedSortOrder) ? 0 : parsedSortOrder,
      },
    })

    return NextResponse.json(newNav, { status: 201 })
  } catch (error: any) {
    console.error("[NAV_POST_ERROR]:", error)

    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    )
  }
}