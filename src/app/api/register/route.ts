import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma"; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // 🟢 JWT ইম্পোর্ট করুন

export async function POST(req: Request) {
  try {
    const { name, phone, email, password } = await req.json();

    // পাসওয়ার্ড হ্যাশ করা
    const hashedPassword = await bcrypt.hash(password, 10);

    // ডাটাবেসে ইউজার সেভ করা
    const user = await prisma.user.create({
      data: { name, phone, email, password: hashedPassword }
    });

    // 🟢 লগইন সেশনের জন্য JWT টোকেন তৈরি (Secret Key আপনার .env ফাইলে রাখুন)
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your_fallback_secret_key',
      { expiresIn: '7d' } // ৭ দিনের সেশন
    );

    // 🟢 রেসপন্স তৈরি করা
    const response = NextResponse.json(
      { message: "User registered and logged in successfully", user: { name: user.name, email: user.email } }, 
      { status: 201 }
    );

    // 🟢 ব্রাউজারে HttpOnly কুকি সেট করা যাতে ইউজার অটো-লগইন হয়ে যায়
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true, // সিকিউরিটির জন্য এটি ফ্রন্টএন্ড স্ক্রিপ্ট পড়তে পারবে না
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // ৭ দিন
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 });
  }
}