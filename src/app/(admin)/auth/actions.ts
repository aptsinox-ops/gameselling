"use server";

import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// একটি সিক্রেট কি (এটি .env ফাইলে রাখাই বেস্ট, এখানে ব্যাকআপ হিসেবে দেওয়া)
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key_1001";

export async function checkAdminExists() {
  const count = await prisma.admin.count();
  return count > 0;
}

export async function registerAdmin(formData: FormData) {
  const adminCount = await prisma.admin.count();
  if (adminCount > 0) {
    throw new Error("Security Alert: An admin account already exists.");
  }

  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const company = formData.get("company") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;

  const hashedPassword = await hash(password, 10);

  await prisma.admin.create({
    data: {
      name,
      username,
      company,
      email,
      phone,
      password: hashedPassword,
    },
  });

  return { success: true };
}

export async function loginAdmin(formData: FormData) {
  const emailOrUser = formData.get("emailOrUser") as string;
  const password = formData.get("password") as string;

  if (!emailOrUser || !password) {
    throw new Error("Please fill in all fields.");
  }

  // ১. ইউজারনেম অথবা ইমেইল দিয়ে ডাটাবেজে অ্যাডমিন খোঁজা
  const admin = await prisma.admin.findFirst({
    where: {
      OR: [
        { email: emailOrUser },
        { username: emailOrUser }
      ]
    }
  });

  if (!admin) {
    throw new Error("Wrong Password or AdminName/Gmail!");
  }

  // ২. পাসওয়ার্ড চেক করা
  const isPasswordValid = await compare(password, admin.password);
  if (!isPasswordValid) {
    throw new Error("Wrong Password or AdminName/Gmail!");
  }

  // ৩. JWT টোকেন তৈরি করা
  const token = jwt.sign(
    { adminId: admin.id, username: admin.username },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  // ৪. কুকি সেট করা (মিডলওয়্যার যাতে রিড করতে পারে)
  const cookieStore = await cookies();
  cookieStore.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/", // এইটা মাস্ট, যাতে পুরো /admin রুটে কুকি পাওয়া যায়
    maxAge: 60 * 60 * 24, // ১ দিন
  });

  return { success: true };
}

// ৫. কারেন্ট লগইন থাকা অ্যাডমিনের প্রোফাইল ও ইমেইল তুলে আনার অ্যাকশন
export async function getCurrentAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    // যদি টোকেন না থাকে, তবে সে লগইন নেই
    if (!token) {
      return null;
    }

    // টোকেনটি ভেরিফাই এবং ডিকোড করা
    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: string; username: string };

    // ডাটাবেজ থেকে অ্যাডমিনের ডেটা আনা
    const admin = await prisma.admin.findUnique({
      where: {
        id: decoded.adminId,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true, // <--- তোমার কাঙ্ক্ষিত জিমেইল এড্রেস
        company: true,
        phone: true,
      },
    });

    return admin;
  } catch (error) {
    console.error("Failed to fetch admin:", error);
    return null;
  }
}

// ৬. অ্যাডমিনের প্রোফাইল তথ্য এবং পাসওয়ার্ড আপডেট করার অ্যাকশন
export async function updateAdminProfile(data: {
  name: string;
  username: string;
  company: string;
  phone: string;
  oldPassword?: string;
  newPassword?: string;
}) {
  try {
    const currentAdminData = await getCurrentAdmin();
    if (!currentAdminData) {
      throw new Error("Unauthorized: No active admin session found.");
    }

    // ডাটাবেজ থেকে বর্তমান এডমিনের পাসওয়ার্ডসহ পুরো অবজেক্টটি তুলে আনা ভ্যালিডেশনের জন্য
    const admin = await prisma.admin.findUnique({
      where: { id: currentAdminData.id },
    });

    if (!admin) {
      throw new Error("Admin user not found.");
    }

    const updateData: any = {
      name: data.name,
      username: data.username,
      company: data.company,
      phone: data.phone,
    };

    // 🔒 পাসওয়ার্ড পরিবর্তনের লজিক (যদি ইউজার নতুন পাসওয়ার্ড দিতে চায়)
    if (data.oldPassword && data.newPassword) {
      const isPasswordValid = await compare(data.oldPassword, admin.password);
      if (!isPasswordValid) {
        return { success: false, message: "Type Your Older Password ভুল হয়েছে!" };
      }

      if (data.newPassword.length < 8) {
        return { success: false, message: "New password must be at least 8 characters long." };
      }

      // নতুন পাসওয়ার্ড হ্যাশ করে আপডেটের জন্য সেট করা
      updateData.password = await hash(data.newPassword, 10);
    }

    // ডেটাবেজে আপডেট করা
    const updatedAdmin = await prisma.admin.update({
      where: { id: admin.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        company: true,
        phone: true,
      }
    });

    // যদি এডমিন ইউজারনেম পরিবর্তন করে, তবে নতুন ইউজারনেম দিয়ে কুকি টোকেনটি রি-জেনারেট করা বেস্ট
    const token = jwt.sign(
      { adminId: updatedAdmin.id, username: updatedAdmin.username },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const cookieStore = await cookies();
    cookieStore.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return { success: true, message: "Admin profile updated successfully!" };
  } catch (error: any) {
    console.error("Failed to update admin profile:", error);
    return { success: false, message: error.message || "Something went wrong." };
  }
}