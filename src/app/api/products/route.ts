// src/app/api/products/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, unlink } from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import { join, resolve } from "path";

// Force dynamic rendering to bypass cache and load fresh data on every request
export const dynamic = "force-dynamic";

// ==========================================
// 🛒 GET: Fetch all products for admin list
// ==========================================
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        id: "desc", // Newest products will always appear at the top
      },
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error: any) {
    console.error("GET PRODUCTS ERROR:", error);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}

// ==========================================
// 🔄 PUT: Update (Edit) an existing product
// ==========================================
// ==========================================
// 🔄 PUT: Update (Edit) an existing product
// ==========================================
export async function PUT(req: Request) {
  try {
    // Retrieve ID from URL query parameters
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required!" }, { status: 400 });
    }

    const data = await req.formData();

    // Check if the product exists in the database
    const existingProduct = await prisma.product.findUnique({
      where: { id: id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found!" }, { status: 404 });
    }

    // General fields
    const name = data.get("name") as string;
    const slug = data.get("slug") as string;
    const categoryId = data.get("categoryId") as string;
    const resellerPercentage = parseFloat(data.get("resellerPercentage") as string) || 0;
    const tutorialLink = data.get("tutorialLink") as string || "";
    
    // 🟢 STATUS FIX: ফ্রন্টএন্ড থেকে নতুন স্ট্যাটাস আসলে ওটাকে uppercase করবে, না আসলে ডাটাবেজের আগেরটাই থাকবে।
    const rawStatus = data.get("status") as string;
    const status = rawStatus && rawStatus.trim() !== "" ? rawStatus.trim().toUpperCase() : existingProduct.status;

    const productType = data.get("productType") as string || "";
    const variationsDesign = data.get("variationsDesign") as string || "Grid";
    
    // 🟢 DESCRIPTION FIX: ফ্রন্টএন্ড থেকে ডেসক্রিপশন ফাঁকা বা নাল আসলে ডাটাবেজের আগেরটা বজায় রাখবে, ডাটা হারাবে না।
    const rawDescription = data.get("description") as string;
    const description = rawDescription !== null && rawDescription !== undefined && rawDescription.trim() !== "" 
      ? rawDescription 
      : existingProduct.description;

    // Boolean type casting
    const isFreeFireAuto = data.get("isFreeFireAuto") === "true";
    const isUidNameChecker = data.get("isUidNameChecker") === "true";
    const isCoinSystem = data.get("isCoinSystem") === "true";
    const isPremiumUser = data.get("isPremiumUser") === "true";

    // Tag fields
    const isTagEnabled = data.get("isTagEnabled") === "true";
    const tagType = (data.get("tagType") as string) || "AUTO";
    const productTag = (data.get("productTag") as string) || "";
    const tagColor = (data.get("tagColor") as string) || "#ffffff";
    const tagBgColor = (data.get("tagBgColor") as string) || "#2563eb";

    // Duplicate slug check
    if (slug && slug !== existingProduct.slug) {
      const duplicateCheck = await prisma.product.findUnique({
        where: { slug: slug }
      });
      if (duplicateCheck) {
        return NextResponse.json({ error: "Another product with this slug already exists!" }, { status: 400 });
      }
    }

    // 'productImage' এবং 'image' দুটি নামই চেক করা হচ্ছে
    const file = data.get("productImage") || data.get("image"); 
    const variationIconFile = data.get("variationIcon");
    const bannerImageFile = data.get("bannerImage");
    const tagIconFile = data.get("tagIcon");

    // Keep exact database state instead of forcing empty strings ("")
    let dbImagePath = existingProduct.image;
    let dbVariationIconPath = existingProduct.variationIcon;
    let dbBannerImagePath = existingProduct.bannerImage;
    let dbTagIconPath = existingProduct.tagIcon;

    const uploadDir = resolve(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const deleteOldFile = async (oldPath: string | null | undefined) => {
      if (oldPath && oldPath.startsWith("/uploads/")) {
        try {
          const absolutePath = join(process.cwd(), "public", oldPath);
          if (existsSync(absolutePath)) {
            await unlink(absolutePath);
          }
        } catch (err) {
          console.error("Failed to delete old file:", oldPath, err);
        }
      }
    };

    // 1. Main image update
    if (file && file instanceof File && file.size > 0) {
      await deleteOldFile(dbImagePath);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "-");
      const uniqueFilename = `${Date.now()}-product-${safeFileName}`;
      await writeFile(join(uploadDir, uniqueFilename), buffer);
      dbImagePath = `/uploads/${uniqueFilename}`;
    }

    // 2. Variation icon update
    if (variationIconFile && variationIconFile instanceof File && variationIconFile.size > 0) {
      await deleteOldFile(dbVariationIconPath);
      const bytes = await variationIconFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const safeFileName = variationIconFile.name.replace(/[^a-zA-Z0-9.]/g, "-");
      const uniqueFilename = `${Date.now()}-icon-${safeFileName}`;
      await writeFile(join(uploadDir, uniqueFilename), buffer);
      dbVariationIconPath = `/uploads/${uniqueFilename}`;
    }

    // 3. Banner image update
    if (bannerImageFile && bannerImageFile instanceof File && bannerImageFile.size > 0) {
      await deleteOldFile(dbBannerImagePath);
      const bytes = await bannerImageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const safeFileName = bannerImageFile.name.replace(/[^a-zA-Z0-9.]/g, "-");
      const uniqueFilename = `${Date.now()}-banner-${safeFileName}`;
      await writeFile(join(uploadDir, uniqueFilename), buffer);
      dbBannerImagePath = `/uploads/${uniqueFilename}`;
    }

    // 4. Tag icon update
    if (tagIconFile && tagIconFile instanceof File && tagIconFile.size > 0) {
      await deleteOldFile(dbTagIconPath);
      const bytes = await tagIconFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const safeFileName = tagIconFile.name.replace(/[^a-zA-Z0-9.]/g, "-");
      const uniqueFilename = `${Date.now()}-tagicon-${safeFileName}`;
      await writeFile(join(uploadDir, uniqueFilename), buffer);
      dbTagIconPath = `/uploads/${uniqueFilename}`;
    }

    // Update product in database
    const updatedProduct = await prisma.product.update({
      where: { id: id },
      data: {
        name,
        slug,
        categoryId,
        resellerPercentage: Number(resellerPercentage) || 0,
        tutorialLink,
        
        status, // 👈 ফিক্সড বড় হাতের স্ট্যাটাস সেভ হবে
        description, // 👈 ফিক্সড সুরক্ষিত ডেসক্রিপশন সেভ হবে
        
        productType,
        variationsDesign,
        isFreeFireAuto: Boolean(isFreeFireAuto),
        isUidNameChecker: Boolean(isUidNameChecker),
        isCoinSystem: Boolean(isCoinSystem),
        isPremiumUser: Boolean(isPremiumUser),
        image: dbImagePath || "/uploads/placeholder.png",
        variationIcon: dbVariationIconPath,
        bannerImage: dbBannerImagePath,
        isTagEnabled: Boolean(isTagEnabled),
        tagType,
        productTag,
        tagColor,
        tagBgColor,
        tagIcon: dbTagIconPath,
      },
    });

    console.log("PRODUCT UPDATED SUCCESSFULLY IN DB:", updatedProduct.id);
    return NextResponse.json({ message: "Product updated successfully!", product: updatedProduct }, { status: 200 });
  } catch (error: any) {
    console.error("CRITICAL EDIT API ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" }, 
      { status: 500 }
    );
  }
}