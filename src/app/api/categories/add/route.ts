import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slotNo } = body;

    if (!name || slotNo === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newCategory = await prisma.category.create({
      data: {
        name: name,
        slotNo: parseInt(slotNo),
        status: true, // নতুন ক্যাটাগরি ডিফল্টভাবে ON থাকবে
      },
    });

    return NextResponse.json({ 
      message: "Category created successfully!", 
      category: newCategory 
    }, { status: 200 });

  } catch (error: any) {
    // ইউনিক এরর (P2002) হ্যান্ডলিং
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Category name already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}