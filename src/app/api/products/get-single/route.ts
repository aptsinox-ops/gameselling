import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    // 🟢 ফ্রন্টএন্ড থেকে পাঠানো JSON ডাটা সরাসরি রিসিভ করা হলো
    const body = await request.json();
    
    // কোয়েরি প্যারামিটার বা বডি থেকে আইডি নেওয়া
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || body.id;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required for update" }, { status: 400 });
    }

    // ডিবাগ: এডিট করার জন্য কী ডাটা আসছে তা টার্মিনালে প্রিন্ট হবে
    console.log("RECEIVED JSON DATA FOR UPDATE (ID:", id, "):", body);

    const name = body.name;
    const categoryId = body.categoryId;
    
    // ভ্যালিডেশন চেক
    if (!name || !categoryId) {
        return NextResponse.json({ error: "Name and Category are required" }, { status: 400 });
    }

    // 🟢 IMAGES & ICONS: ফ্রন্টএন্ডের ম্যাপ করা কি-নাম অনুযায়ী চেক
    const imagePath = body.image || body.productImage || "/uploads/placeholder.png";
    const variationIconPath = body.variationIcon || null;
    const bannerImagePath = body.bannerImage || null;
    const tagIconPath = body.tagIcon || null;

    // 🟢 STATUS FIX: এডিট করার সময় ফ্রন্টএন্ড থেকে আসা স্ট্যাটাসকে জোরপূর্বক বড় হাতের অক্ষরে (ON/OFF) ডাটাবেজে পাঠানো
    const finalStatus = body.status ? body.status.trim().toUpperCase() : "ON";

    // Dynamic Fields Parse
    let finalDynamicFields: any = ["Enter Player UID"];
    if (body.productType === "Uid Topup") {
      finalDynamicFields = ["Enter Player UID"];
    } else if (body.dynamicFields) {
      if (Array.isArray(body.dynamicFields)) {
        finalDynamicFields = body.dynamicFields;
      } else if (typeof body.dynamicFields === "string") {
        try {
          finalDynamicFields = JSON.parse(body.dynamicFields);
        } catch {
          finalDynamicFields = [body.dynamicFields];
        }
      }
    }

    // 🟢 ডাটাবেজে এক্সিস্টিং প্রোডাক্ট আপডেট করার পারফেক্ট লজিক
    const updatedProduct = await prisma.product.update({
      where: { id: id },
      data: {
        name: name,
        slug: body.slug || name.toLowerCase().replace(/\s+/g, '-'),
        categoryId: categoryId,
        
        status: finalStatus, // 👈 এই লাইনটি আপনার ওল্ড এডিট রাউটে হয়তো মিসিং ছিল বা ভুল ফিল্ডে যাচ্ছিল!
        
        productType: body.productType || 'Uid Topup',
        variationsDesign: body.variationsDesign || 'Grid',
        resellerPercentage: parseFloat(body.resellerPercentage || "0"),
        tutorialLink: body.tutorialLink || null,
        autoDeliveryType: body.autoDeliveryType || null,
        
        description: body.description || null, // 👈 ডেসক্রিপশন আপডেট ফিক্স

        // বুলিয়ান ফিল্ডস
        isUidNameChecker: Boolean(body.isUidNameChecker),
        isCoinSystem: Boolean(body.isCoinSystem),
        isPremiumUser: Boolean(body.isPremiumUser),
        isBanner: Boolean(body.isBanner),
        isFreeFireAuto: Boolean(body.isFreeFireAuto),
        isTagEnabled: body.isTagEnabled !== undefined ? Boolean(body.isTagEnabled) : true,

        // ইমেজ ও আইকন পাথ
        image: imagePath,
        variationIcon: variationIconPath,
        bannerImage: bannerImagePath,
        tagIcon: tagIconPath,

        // ট্যাগ ইনফো
        tagType: body.tagType || "AUTO",
        productTag: body.productTag || null,
        tagColor: body.tagColor || "#ffffff",
        tagBgColor: body.tagBgColor || "#2563eb",
        
        // ডাইনামিক ফিল্ডস
        dynamicFields: finalDynamicFields,
      },
    });

    console.log("PRODUCT UPDATED SUCCESSFULLY:", updatedProduct.id);
    return NextResponse.json({ success: true, message: "Product updated successfully!", data: updatedProduct });

  } catch (error: any) {
    console.error("PRISMA UPDATE ROUTE ERROR:", error); 
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
  }
}