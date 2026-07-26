import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs'; // পাসওয়ার্ড হ্যাশ করার জন্য ইম্পোর্ট করা হলো

export async function POST(req: Request) {
  try {
    const { id, name, email, phone, balance, role, password } = await req.json();

    // ১. আইডি এবং প্রয়োজনীয় ফিল্ড ভ্যালিডেশন
    if (!id || !name || !email || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ২. ইমেইল ডুপ্লিকেট চেক
    const existingEmail = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: Number(id) }
      },
    });
    if (existingEmail) {
      return NextResponse.json({ error: "Email is already in use by another user" }, { status: 400 });
    }

    // ৩. ফোন নাম্বার ডুপ্লিকেট চেক
    const existingPhone = await prisma.user.findFirst({
      where: {
        phone,
        NOT: { id: Number(id) }
      },
    });
    if (existingPhone) {
      return NextResponse.json({ error: "Phone number is already in use by another user" }, { status: 400 });
    }

    // ৪. ডাইনামিক ডাটা অবজেক্ট তৈরি
    const updateData: any = {
      name,
      email,
      phone,
      balance: parseFloat(balance) || 0,
      role: role || "User",
    };

    // ৫. ইনপুটে নতুন পাসওয়ার্ড দেওয়া হলে তা হ্যাশ করে অবজেক্টে পুশ করা হবে
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // ৬. ডাটাবেসে তথ্য আপডেট করা
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: updateData,
    });

    // রেসপন্স থেকে সিকিউরিটির জন্য পাসওয়ার্ড বাদ দেওয়া
    const { password: _, ...userWithoutPassword } = updatedUser as any;

    return NextResponse.json({ 
      message: "User updated successfully", 
      user: userWithoutPassword 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Database update error:", error);
    return NextResponse.json({ error: "Failed to update user in database" }, { status: 500 });
  }
}