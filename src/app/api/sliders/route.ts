import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// 🌐 ১. সব স্লাইডার ফেস করা
export async function GET() {
  try {
    const sliders = await db.slider.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(sliders);
  } catch (error) {
    console.error("Error fetching sliders:", error);
    return NextResponse.json({ error: "Failed to fetch sliders" }, { status: 500 });
  }
}

// ➕ ২. নতুন স্লাইডার যোগ করা
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, imageUrl, link, videoUrl, title, socialUrl } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    const newSlider = await db.slider.create({
      data: {
        type: type || "BANNER",
        imageUrl,
        link: link || null,
        videoUrl: videoUrl || null,
        title: title || null,
        socialUrl: socialUrl || null,
      },
    });

    return NextResponse.json(newSlider, { status: 201 });
  } catch (error) {
    console.error("Error creating slider:", error);
    return NextResponse.json({ error: "Failed to create slider" }, { status: 500 });
  }
}

// ✏️ ৩. স্লাইডার এডিট/আপডেট করা (PUT)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, type, imageUrl, link, videoUrl, title, socialUrl } = body;

    if (!id) {
      return NextResponse.json({ error: "Slider ID is required" }, { status: 400 });
    }

    const updatedSlider = await db.slider.update({
      where: { id },
      data: {
        type,
        imageUrl,
        link: link || null,
        videoUrl: videoUrl || null,
        title: title || null,
        socialUrl: socialUrl || null,
      },
    });

    return NextResponse.json(updatedSlider);
  } catch (error) {
    console.error("Error updating slider:", error);
    return NextResponse.json({ error: "Failed to update slider" }, { status: 500 });
  }
}

// 🗑️ ৪. স্লাইডার ডিলিট করা
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Slider ID is required" }, { status: 400 });
    }

    await db.slider.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Slider deleted successfully" });
  } catch (error) {
    console.error("Error deleting slider:", error);
    return NextResponse.json({ error: "Failed to delete slider" }, { status: 500 });
  }
}