import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// সরাসরি ফাইলর ভেতরে প্রিজমা ক্লায়েন্ট ইনস্ট্যান্স তৈরি করা হলো
const prisma = new PrismaClient();

export async function GET() {
  try {
    // ১. আগের সব ডাটা ক্লিন করা (Cascade অন থাকায় প্রোডাক্ট আগে ডিলিট হবে)
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});

    // ২. ডেমো ক্যাটাগরি তৈরি করা
    const discountCategory = await prisma.category.create({
      data: {
        name: 'DISCOUNT OFFER',
        slotNo: 1,
      },
    });

    // ৩. ডেমো প্রোডাক্টগুলো তৈরি করা
    await prisma.product.createMany({
      data: [
        {
          name: 'UID TOPUP [BD]',
          slug: 'uid-topup-bd',
          image: 'https://rrrtopup.com/_next/image?url=https%3A%2F%2Fapis.rrrtopup.com%2Fimages%2Fimages-1759379824664.jpg&w=384&q=75',
          productTag: 'FAST DELIVERY',
          categoryType: 'FreeFire',
          rulesCondition: 'এখানে রুলস থাকবে ভাই।',
          categoryId: discountCategory.id,
        },
        {
          name: 'WEEKLY MONTHLY',
          slug: 'weekly-monthly',
          image: 'https://rrrtopup.com/_next/image?url=https%3A%2F%2Fapis.rrrtopup.com%2Fimages%2Fimages-1759380428872.jpg&w=384&q=75',
          productTag: 'FAST DELIVERY',
          categoryType: 'Subscription',
          rulesCondition: 'এখানে সাবস্ক্রিপশন রুলস থাকবে।',
          categoryId: discountCategory.id,
        },
        {
          name: 'E BADGE EVO_ACCESS_UID',
          slug: 'e-badge-evo-access-uid',
          image: 'https://rrrtopup.com/_next/image?url=https%3A%2F%2Fapis.rrrtopup.com%2Fimages%2Fimages-1759379892232.jpg&w=384&q=75',
          productTag: 'FAST DELIVERY',
          categoryType: 'FreeFire',
          rulesCondition: 'এখানে ই-ব্যাজ রুলস থাকবে।',
          categoryId: discountCategory.id,
        },
      ],
    });

    return NextResponse.json({ success: true, message: "ডামি ডাটাবেস রেডি ভাই!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    // কানেকশন ক্লোজ করা
    await prisma.$disconnect();
  }
}