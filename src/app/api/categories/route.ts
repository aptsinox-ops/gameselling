import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // শুধুমাত্র status: true (ON) থাকা ক্যাটাগরিগুলো তুলে আনা হচ্ছে
    const categories = await prisma.category.findMany({
      where: {
        status: true, // এটি নিশ্চিত করবে শুধু ON ক্যাটাগরিগুলো দেখাবে
      },
      orderBy: {
        slotNo: 'asc', // স্লট নম্বর অনুযায়ী সিরিয়াল করার জন্য
      },
    });

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("Fetch categories error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}