import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // ১. ইনপুট চেক
    if (!email || !password) {
      return NextResponse.json(
        { error: "ইমেইল এবং পাসওয়ার্ড দুটিই প্রয়োজন" },
        { status: 400 }
      );
    }

    // ২. ইউজার খোঁজা
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট খুঁজে পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    // 🟢 ৩. পাসওয়ার্ড সেট করা আছে কিনা চেক করা (গুগল ইউজারের ক্ষেত্রে null থাকে)
    if (!user.password) {
      return NextResponse.json(
        { error: "এই অ্যাকাউন্টে কোনো পাসওয়ার্ড সেট করা নেই। গুগল দিয়ে লগইন করার চেষ্টা করুন।" },
        { status: 400 }
      );
    }

    // ৪. পাসওয়ার্ড ম্যাচিং (এখন user.password ১০০% string হিসেবে নিশ্চিত)
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: "ভুল পাসওয়ার্ড! আবার চেষ্টা করুন" },
        { status: 401 }
      );
    }

    // ৫. সাকসেস রেসপন্স
    return NextResponse.json(
      { 
        message: "লগইন সফল হয়েছে", 
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone } 
      }, 
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { error: error.message || "লগইন করার সময় কোনো সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}