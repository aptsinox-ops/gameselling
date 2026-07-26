import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const payload = await request.json();
    const { id } = payload;

    if (!id) {
      return NextResponse.json({ message: "Missing product ID" }, { status: 400 });
    }

    // ১. প্রথমে ডাটাবেস থেকে বর্তমান প্রোডাক্টটির ডাটা তুলে আনুন
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const { 
      name, categoryId, slug, status, productType, variationsDesign, 
      resellerPercentage, tutorialLink, autoDeliveryType, description, 
      isUidNameChecker, isCoinSystem, isPremiumUser, isBanner, isFreeFireAuto, 
      isTagEnabled, tagType, productTag, tagColor, tagBgColor, dynamicFields, 
      variationIcon, bannerImage, tagIcon 
    } = payload;

    if (!name || !categoryId) {
      return NextResponse.json({ message: "Name and Category are required" }, { status: 400 });
    }

    // ইমেজ চেক
    const finalImage = payload.image && payload.image.trim() !== "" ? payload.image : existingProduct.image;
    const finalVariationIcon = variationIcon && variationIcon.trim() !== "" ? variationIcon : existingProduct.variationIcon;
    const finalBannerImage = bannerImage && bannerImage.trim() !== "" ? bannerImage : existingProduct.bannerImage;
    const finalTagIcon = tagIcon && tagIcon.trim() !== "" ? tagIcon : existingProduct.tagIcon;

    // 🟢 STATUS FIX: ফ্রন্টএন্ড থেকে স্ট্যাটাস আসলে ভালো, না আসলে ডাটাবেজের আগেরটাই থাকবে। 
    // প্লাস ওটা সবসময় বড় হাতের (ON/OFF) কনভার্ট হয়ে সেভ হবে।
    const finalStatus = status ? status.trim().toUpperCase() : existingProduct.status;

    // ডাটাবেস আপডেট করুন
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        image: finalImage,
        variationIcon: finalVariationIcon,
        bannerImage: finalBannerImage,
        tagIcon: finalTagIcon,
        categoryId,
        
        status: finalStatus, // 🟢 স্ট্যাটাস ফিক্সড অ্যাসাইন
        
        productType: productType || null,
        variationsDesign: variationsDesign || "Grid",
        resellerPercentage: parseFloat(resellerPercentage || "0"),
        tutorialLink: tutorialLink || null,
        autoDeliveryType: autoDeliveryType || null,
        description: description || null,
        isUidNameChecker: !!isUidNameChecker,
        isCoinSystem: !!isCoinSystem,
        isPremiumUser: !!isPremiumUser,
        isBanner: !!isBanner,
        isFreeFireAuto: !!isFreeFireAuto,
        isTagEnabled: isTagEnabled !== undefined ? !!isTagEnabled : true,
        tagType: tagType || "AUTO",
        productTag: productTag || null,
        tagColor: tagColor || "#ffffff",
        tagBgColor: tagBgColor || "#2563eb",
        dynamicFields: Array.isArray(dynamicFields) ? dynamicFields : ["Player UID"],
      },
    });

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error: any) {
    console.error("UPDATE ROUTE ERROR:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}