// src/app/api/admin/autorobot/vouchers/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET
//   - no query params      -> list eligible variations (for the Add dialog dropdown)
//   - ?variationId=xxx     -> list existing vouchers for that variation (for the Edit dialog)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const variationId = searchParams.get("variationId");

    if (variationId) {
      const vouchers = await prisma.voucher.findMany({
        where: { variationId },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(
        vouchers.map((v) => ({
          id: v.id,
          code: v.code,
          status: v.status,
          createdAt: v.createdAt.toISOString(),
        }))
      );
    }

    const variations = await prisma.variation.findMany({
      where: {
        status: "ON",
        product: { isFreeFireAuto: true },
      },
      include: { product: { select: { name: true } } },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(
      variations.map((v) => ({
        id: v.id,
        title: v.title,
        productName: v.product?.name ?? "Unknown Product",
      }))
    );
  } catch (error) {
    console.error("Failed to fetch vouchers/variations:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// POST — add new voucher codes to a variation (Optimized with Chunking & Batching)
export async function POST(req: Request) {
  try {
    const { variationId, vouchers } = await req.json();

    if (!variationId || !Array.isArray(vouchers) || vouchers.length === 0) {
      return NextResponse.json(
        { error: "variationId and vouchers[] are required" },
        { status: 400 }
      );
    }

    const cleanCodes: string[] = [
      ...new Set(vouchers.map((c: string) => String(c).trim()).filter(Boolean)),
    ];

    if (cleanCodes.length === 0) {
      return NextResponse.json(
        { error: "No valid voucher codes provided" },
        { status: 400 }
      );
    }

    // ১. 기존 (Existing) Vouchers চেক করার জন্য ৫০০ করে চ্যাঙ্ক (Chunk) করা
    const chunkSize = 500;
    const existingCodesSet = new Set<string>();

    for (let i = 0; i < cleanCodes.length; i += chunkSize) {
      const chunk = cleanCodes.slice(i, i + chunkSize);
      const existing = await prisma.voucher.findMany({
        where: {
          variationId,
          code: { in: chunk },
        },
        select: { code: true },
      });
      existing.forEach((e) => existingCodesSet.add(e.code));
    }

    const newCodes = cleanCodes.filter((c) => !existingCodesSet.has(c));

    if (newCodes.length === 0) {
      return NextResponse.json(
        { error: "All submitted codes already exist for this variation" },
        { status: 400 }
      );
    }

    // ২. Create DB Record in Chunks (স্লো হওয়া ও ৪০৪ টাইমআউট ঠেকানোর জন্য)
    const dataToInsert = newCodes.map((code) => ({
      variationId,
      code,
      status: "ACTIVE" as const,
    }));

    for (let i = 0; i < dataToInsert.length; i += chunkSize) {
      const insertChunk = dataToInsert.slice(i, i + chunkSize);
      await prisma.voucher.createMany({
        data: insertChunk,
        skipDuplicates: true, // Prisma Engine লেভেলে ডুপ্লিকেট এড়ানোর জন্য
      });
    }

    return NextResponse.json({
      success: true,
      message: `${newCodes.length} Vouchers added successfully!`,
    });
  } catch (error) {
    console.error("Failed to add vouchers:", error);
    return NextResponse.json({ error: "Failed to add vouchers" }, { status: 500 });
  }
}

// DELETE — remove a single voucher
export async function DELETE(req: Request) {
  try {
    const { voucherId } = await req.json();

    if (!voucherId) {
      return NextResponse.json({ error: "Missing voucherId" }, { status: 400 });
    }

    await prisma.voucher.delete({ where: { id: voucherId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete voucher:", error);
    return NextResponse.json({ error: "Failed to delete voucher" }, { status: 500 });
  }
}