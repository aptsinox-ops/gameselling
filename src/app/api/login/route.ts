import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // ১. ইমেইল এবং পাসওয়ার্ড ইনপুট দেওয়া হয়েছে কিনা চেক করা
    if (!email || !password) {
      return NextResponse.json(
        { error: "ইমেইল এবং পাসওয়ার্ড দুটিই প্রয়োজন" },
        { status: 400 }
      );
    }

    // ২. ডাটাবেসে এই ইমেইলের কোনো ইউজার আছে কিনা খোঁজা
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট খুঁজে পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    // ৩. ইনপুট দেওয়া পাসওয়ার্ডের সাথে ডাটাবেসের হ্যাশড পাসওয়ার্ড মেলানো
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: "ভুল পাসওয়ার্ড! আবার চেষ্টা করুন" },
        { status: 401 }
      );
    }

    // ৪. সব ঠিক থাকলে সাকসেস রেসপন্স পাঠানো (NextAuth এটি দিয়ে সেশন হ্যান্ডেল করবে)
    return NextResponse.json(
      { 
        message: "লগইন সফল হয়েছে", 
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone } 
      }, 
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { error: error.message || "লগইন করার সময় কোনো সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}