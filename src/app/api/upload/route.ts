import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // ফাইল ডাটা রিড করা
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ইউনিক ফাইলনেম তৈরি এবং public/uploads ডিরেক্টরি সেট করা
    const filename = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // uploads ফোল্ডার না থাকলে স্বয়ংক্রিয়ভাবে তৈরি করবে
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    // ব্রাউজারে বা ডাটাবেসে সেভ করার জন্য পাবলিক ইউআরএল পাথ
    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: "Internal server error during upload" }, { status: 500 });
  }
}