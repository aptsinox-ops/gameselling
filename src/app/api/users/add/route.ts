import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs'; // পাসওয়ার্ড হ্যাশ করার জন্য

export async function POST(req: Request) {
  try {
    const { name, email, phone, password, role } = await req.json();

    // ১. ইমেইল বা ফোন নাম্বার খালি কিনা চেক করা
    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // ২. ইমেইল অলরেডি ডাটাবেসে আছে কিনা চেক করা
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
    }

    // ৩. ফোন নাম্বার অলরে সংশোধিত ডাটাবেসে আছে কিনা চেক করা
    const existingPhone = await prisma.user.findUnique({
      where: { phone },
    });
    if (existingPhone) {
      return NextResponse.json({ error: "Phone number is already registered" }, { status: 400 });
    }

    // ৪. সিকিউরিটির জন্য পাসওয়ার্ড হ্যাশ করা
    const hashedPassword = await bcrypt.hash(password, 10);

    // ৫. ডাটাবেসে নতুন ইউজার তৈরি করা
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: role || "User",
      },
    });

    // রেসপন্সে সিকিউরিটির জন্য পাসওয়ার্ড বাদ দেওয়া
    const { password: _, ...userWithoutPassword } = newUser;

    // ৬. এখানে স্পষ্টভাবে ব্যালেন্স ০ বা ডাটাবেসের ডিফল্ট ভ্যালু রিটার্ন অবজেক্টে সেট করে দেওয়া হলো
    return NextResponse.json({ 
      message: "User added successfully", 
      user: {
        ...userWithoutPassword,
        balance: newUser.balance ?? 0 // যদি প্রিজমা ইনস্ট্যান্স কোনো কারণে নাল দেয়, তাও ০ যাবে
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error("Database error details:", error);
    
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Email or Phone number already exists" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to add user to database" }, { status: 500 });
  }
}