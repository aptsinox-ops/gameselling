import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // 🟢 ফ্রন্টঅ্যান্ড থেকে পাঠানো JSON ডাটা সরাসরি রিসিভ করা হলো
    const body = await req.json();

    const name = body.name;
    const slug = body.slug;
    const categoryId = body.categoryId;
    const resellerPercentage = parseFloat(body.resellerPercentage) || 0;
    const tutorialLink = body.tutorialLink || "";
    const status = body.status || "ON";
    const productType = body.productType || "";
    const variationsDesign = body.variationsDesign || "Grid";
    const description = body.description || "";

    // অপショナル ও বুলিয়ান ফিল্ডস ম্যাপ করা
    const isFreeFireAuto = Boolean(body.isFreeFireAuto);
    const isCoinSystem = Boolean(body.isCoinSystem);
    const isPremiumUser = Boolean(body.isPremiumUser);
    const isBanner = Boolean(body.isBanner);
    
    // 🟢 নেম চেকার বুলিয়ান ভ্যালু ক্যাচ করা
    const isUidNameChecker = Boolean(body.isUidNameChecker);

    // ট্যাগ সংক্রান্ত ফিল্ডস
    const isTagEnabled = Boolean(body.isTagEnabled);
    const tagType = body.tagType || "AUTO";
    const productTag = body.productTag || "";
    const tagColor = body.tagColor || "#ffffff";
    const tagBgColor = body.tagBgColor || "#2563eb";

    // ইমেজ ইউআরএল স্ট্রিংগুলো সরাসরি বডি থেকে নেওয়া
    const imagePath = body.image || "/uploads/placeholder.png"; 
    const variationIconPath = body.variationIcon || null;
    const bannerImagePath = body.bannerImage || null;
    const tagIconPath = body.tagIcon || null;

    // 🟢 FIXED: dynamicFields যেন ফ্রন্টঅ্যান্ড পার্সিং এবং কন্ডিশনের সাথে ১০০% মিলে যায়
    let finalDynamicFields: any = ["Player UID"];

    // যদি ফ্রন্টঅ্যান্ডে অথবা ক্যাটাগরিতে নেম চেকার একটিভ করা থাকে, তবে ফিল্ডস অটোমেটিক "Player UID" সেট হবে
    if (productType === "UID" || isUidNameChecker === true) {
      finalDynamicFields = ["Player UID"];
    } else if (body.dynamicFields) {
      if (typeof body.dynamicFields === "string") {
        try {
          // যদি ফ্রন্টএন্ড থেকে স্ট্রিংফাইড জেসন (JSON.stringify) আসে
          const parsed = JSON.parse(body.dynamicFields);
          finalDynamicFields = Array.isArray(parsed) ? parsed : [parsed];
        } catch (_) {
          // যদি কমা দিয়ে আলাদা করা সাধারণ স্ট্রিং আসে (যেমন: "Player UID, Player Name")
          if (body.dynamicFields.includes(",")) {
            finalDynamicFields = body.dynamicFields.split(",").map((s: string) => s.trim());
          } else {
            finalDynamicFields = [body.dynamicFields.trim()];
          }
        }
      } else if (Array.isArray(body.dynamicFields)) {
        // যদি ফ্রন্টএন্ড থেকে সরাসরি পিওর অ্যারে আসে
        finalDynamicFields = body.dynamicFields;
      } else if (typeof body.dynamicFields === "object" && body.dynamicFields !== null) {
        // যদি ভুলবশত একক কোনো অবজেক্ট চলে আসে
        finalDynamicFields = [body.dynamicFields];
      }
    }

    // 🟢 ডুপ্লিকেট নাম বা স্ল্যাগ চেক
    if (slug) {
      const existingProduct = await prisma.product.findUnique({
        where: { slug: slug }
      });
      if (existingProduct) {
        return NextResponse.json({ error: "A product with this name or slug already exists!" }, { status: 400 });
      }
    }

    // 🟢 প্রিজমা দিয়ে সরাসরি ডাটাবেজে প্রোডাক্ট পুশ
    const newProduct = await prisma.product.create({
      data: {
        name,
        slug,
        image: imagePath,
        status,
        productType,
        variationsDesign,
        resellerPercentage,
        tutorialLink,
        isFreeFireAuto,
        isUidNameChecker, // 👈 ফ্রন্টঅ্যান্ড শো চেকার এখন এই ডেটার ওপর নির্ভর করবে
        isCoinSystem,
        isPremiumUser,
        isBanner,
        variationIcon: variationIconPath,
        bannerImage: bannerImagePath,
        description,
        categoryId,
        isTagEnabled,
        tagType,
        productTag,
        tagColor,
        tagBgColor,
        tagIcon: tagIconPath,
        dynamicFields: finalDynamicFields // 👈 ব্যাকঅ্যান্ড ক্লিনিং শেষে সলিড অ্যারে হিসেবে সেভ হচ্ছে
      }
    });

    return NextResponse.json({ success: true, message: "Product created successfully!", product: newProduct }, { status: 201 });
    
  } catch (error: any) {
    console.error("CRITICAL API ERROR:", error);
    return NextResponse.json({ error: error.message || "Internal Database or Schema Error" }, { status: 500 });
  }
}