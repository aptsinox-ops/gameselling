import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 💡 টেবিলে category.name রিড করার জন্য অবশ্যই category ইনক্লুড করতে হবে
    const products = await prisma.product.findMany({
      include: {
        category: true,   // এটিই মেইন মিসিং পার্ট ভাই!
        variations: true, // ভ্যারিয়েশন কাউন্ট দেখানোর জন্য (যদি মডেল রিলেশন থাকে)
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}