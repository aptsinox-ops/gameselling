// src/app/api/products/delete/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { existsSync } from "fs";
import { join, resolve } from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Product IDs array is required!" },
        { status: 400 }
      );
    }

    // Fetch products to find and remove their uploaded files from disk before DB deletion
    const productsToDelete = await prisma.product.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        image: true,
        variationIcon: true,
        bannerImage: true,
        tagIcon: true,
      },
    });

    const publicDir = resolve(process.cwd(), "public");
    
    // Loop through each product and delete its files from the storage
    for (const product of productsToDelete) {
      const filePaths = [
        product.image,
        product.variationIcon,
        product.bannerImage,
        product.tagIcon,
      ];

      for (const filePath of filePaths) {
        if (filePath && filePath.startsWith("/uploads/")) {
          try {
            const absolutePath = join(publicDir, filePath);
            if (existsSync(absolutePath)) {
              await unlink(absolutePath);
            }
          } catch (err) {
            console.error("Failed to delete file during batch delete:", filePath, err);
          }
        }
      }
    }

    // Perform batch deletion from the database using Prisma
    const deleteResult = await prisma.product.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json(
      { 
        message: "Products deleted successfully!", 
        count: deleteResult.count 
      }, 
      { status: 200 }
    );
  } catch (error: any) {
    console.error("BATCH DELETE API ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error during deletion" },
      { status: 500 }
    );
  }
}