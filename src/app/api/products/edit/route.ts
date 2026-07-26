import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // 🟢 FIXED: FormData এর বদলে সরাসরি JSON বডি রিড করা হচ্ছে যাতে ফ্রন্টএন্ডের সাথে ১০০% মিলে যায়
    const body = await request.json();
    
    // ডিবাগ: সার্ভারে কী কী ডাটা আসছে তা টার্মিনালে প্রিন্ট হবে
    console.log("RECEIVED JSON DATA FOR CREATE:", body);

    const name = body.name;
    const categoryId = body.categoryId;
    
    // ভ্যালিডেশন চেক
    if (!name || !categoryId) {
        console.error("DEBUG: Missing name or categoryId");
        return NextResponse.json({ error: "Name and Category are required" }, { status: 400 });
    }

    // 🟢 IMAGES & ICONS FIX: ফ্রন্টএন্ডের ভ্যারিয়েবল নামের সাথে সামঞ্জস্য রাখা হলো
    const imagePath = body.image || body.productImage || "/uploads/placeholder.png";
    const variationIconPath = body.variationIcon || null;
    const bannerImagePath = body.bannerImage || null;
    const tagIconPath = body.tagIcon || null;

    // 🟢 STATUS FIX: ফ্রন্টএন্ড থেকে আসা স্ট্যাটাসকে নিশ্চিতভাবে বড় হাতের অক্ষরে (ON/OFF) কনভার্ট করা হলো
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

    // 🟢 ডাটাবেজে নতুন প্রোডাক্ট সেভ করার ১০০% সলিড লজিক
    const newProduct = await prisma.product.create({
      data: {
        name: name,
        slug: body.slug || name.toLowerCase().replace(/\s+/g, '-'),
        categoryId: categoryId,
        
        status: finalStatus, // 👈 স্ট্যাটাস ফিক্সড
        
        productType: body.productType || 'Uid Topup',
        variationsDesign: body.variationsDesign || 'Grid',
        resellerPercentage: parseFloat(body.resellerPercentage || "0"),
        tutorialLink: body.tutorialLink || null,
        autoDeliveryType: body.autoDeliveryType || null,
        
        description: body.description || null, // 👈 ডেসক্রিপশন ফিক্সড

        // বুলিয়ান ফিল্ডস হ্যান্ডলিং
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

    console.log("PRODUCT CREATED SUCCESSFULLY:", newProduct.id);
    return NextResponse.json({ success: true, data: newProduct });

  } catch (error: any) {
    console.error("PRISMA/DATABASE ERROR:", error); 
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}