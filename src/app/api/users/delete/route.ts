import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, ids } = body;

    // ১. একক ইউজার ডিলিট (Single Delete)
    if (id) {
      await prisma.user.delete({
        where: { id: Number(id) },
      });
      return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
    }

    // ২. একাধিক ইউজার ডিলিট (Bulk Delete)
    if (ids && Array.isArray(ids) && ids.length > 0) {
      await prisma.user.deleteMany({
        where: {
          id: { in: ids.map((i: any) => Number(i)) },
        },
      });
      return NextResponse.json({ message: "Users deleted successfully" }, { status: 200 });
    }

    // যদি id এবং ids দুটোর একটিও না পাঠানো হয়
    return NextResponse.json(
      { error: "Invalid Request: 'id' or 'ids' is required" }, 
      { status: 400 }
    );

  } catch (error: any) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" }, 
      { status: 500 }
    );
  }
}