// 📁 src/app/api/upload/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary কনফিগারেশন
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    // ১. Env Variables চেক
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        { error: "Vercel-এ Environment Variables সেট করা নেই!" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    // 'file' বা 'image' যেকোনো নামে ডাটা পাঠালে ধরবে
    const file = (formData.get("file") || formData.get("image")) as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "ফাইল পাওয়া যায়নি (No file provided)" },
        { status: 400 }
      );
    }

    // ২. ফাইলকে Buffer এবং Base64-এ রূপান্তর (Vercel Safe)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;

    // ৩. Stream ছাড়া সরাসরি Base64 আপলোড
    const uploadResult = await cloudinary.uploader.upload(base64Data, {
      folder: "portfolio_uploads",
    });

    return NextResponse.json({ url: uploadResult.secure_url });
  } catch (error: any) {
    console.error("Cloudinary Upload API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during upload" },
      { status: 500 }
    );
  }
}