import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // আপনার প্রজেক্টের আসল প্রিসমা পাথ

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id, ids } = body;

    // ১. বাল্ক ডিলিট (Bulk Delete)
    if (ids && Array.isArray(ids)) {
      await prisma.user.deleteMany({
        where: {
          id: {
            in: ids.map((i: string | number) => Number(i)), // নিশ্চিত করছি ID ইন্টিজার
          },
        },
      });
      return NextResponse.json({ message: "Users deleted successfully" }, { status: 200 });
    }

    // ২. সিঙ্গেল ডিলিট (Single Delete)
    if (id) {
      await prisma.user.delete({
        where: {
          id: Number(id),
        },
      });
      return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  } catch (error: any) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}