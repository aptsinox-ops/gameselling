import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🟢 ১. ভেরিয়েশন তৈরি (Create) এবং আপডেট (Update) করার জন্য পোস্ট মেথড
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, productId, title, price, offerPrice, bonus, stock, status } = body;

    if (!productId || !title || !price) {
      return NextResponse.json({ error: "Required fields are missing!" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { productType: true, isFreeFireAuto: true }
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found!" }, { status: 404 });
    }

    const isVoucherType = product.productType?.toUpperCase() === "VOUCHER";
    const isFreeFireAuto = Boolean(product.isFreeFireAuto);

    // অটো ডেলিভারি (Voucher অথবা FreeFire Auto) হলে ম্যানুয়াল স্টক লাগবে না
    const isAutoDelivery = isVoucherType || isFreeFireAuto;

    if (!isAutoDelivery && (stock === undefined || stock === null || stock === "")) {
      return NextResponse.json({ error: "Stock field is required for manually-fulfilled products!" }, { status: 400 });
    }

    const parsedPrice = parseFloat(price);
    const parsedOfferPrice = offerPrice ? parseFloat(offerPrice) : null;
    const parsedBonus = bonus ? parseInt(bonus) : 0;
    const parsedStock = !isAutoDelivery ? parseInt(stock) : 0;

    const finalStatus = (status === true || status === "ON") ? "ON" : "OFF";

    // ✨ EDIT রিকোয়েস্ট (UPDATE)
    if (id) {
      const updatedVariation = await prisma.variation.update({
        where: { id: id },
        data: {
          productId,
          title: title.trim(),
          price: parsedPrice,
          offerPrice: parsedOfferPrice,
          bonus: parsedBonus,
          stock: parsedStock,
          status: finalStatus
        },
      });
      return NextResponse.json({ message: "Variation updated successfully!", data: updatedVariation }, { status: 200 });
    }

    // ✨ নতুন ভেরিয়েশন ADD করার রিকোয়েস্ট
    const newVariation = await prisma.variation.create({
      data: {
        productId,
        title: title.trim(),
        price: parsedPrice,
        offerPrice: parsedOfferPrice,
        bonus: parsedBonus,
        stock: parsedStock,
        amount: 0, 
        status: finalStatus,
        sortOrder: 0, 
      },
    });

    return NextResponse.json({ message: "Variation added successfully!", data: newVariation }, { status: 201 });
  } catch (error: any) {
    console.error("VARIATION_POST_ERROR:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// 🟢 ২. ভেরিয়েশন লিস্ট বের করার জন্য (GET) - Voucher থাকলে dynamic stock গণনা করা হচ্ছে
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    const includeOptions = {
      product: { 
        select: { 
          name: true, 
          productType: true, 
          isFreeFireAuto: true 
        } 
      },
      vouchers: {
        where: { status: "ACTIVE" }, // কেবল ACTIVE ভাউচারগুলো গুনে নেওয়ার জন্য
        select: { id: true }
      }
    };

    const processVariation = (v: any) => {
      const isVoucherType = v.product?.productType?.toUpperCase() === "VOUCHER";
      
      // যদি Product Type VOUCHER হয়, তাহলে Active Vouchers সংখ্যাই হবে আসল Stock
      const finalStock = isVoucherType ? v.vouchers?.length || 0 : v.stock;

      return {
        id: v.id,
        productId: v.productId,
        productName: v.product?.name || "",
        title: v.title.replace(/\s*\(\+?\d+\s*Bonus\)/gi, "").trim(),
        price: v.price,
        offerPrice: v.offerPrice,
        bonus: v.bonus, 
        stock: finalStock, 
        status: v.status === "ON" ? true : false, 
        sortOrder: v.sortOrder
      };
    };

    if (productId) {
      const variations = await prisma.variation.findMany({
        where: { productId },
        include: includeOptions,
        orderBy: { sortOrder: "asc" },
      });

      return NextResponse.json(variations.map(processVariation), { status: 200 });
    }

    const allVariations = await prisma.variation.findMany({
      include: includeOptions,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(allVariations.map(processVariation), { status: 200 });

  } catch (error: any) {
    console.error("VARIATION_GET_ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch variations" }, { status: 500 });
  }
}