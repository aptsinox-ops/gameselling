import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // পেমেন্ট গেটওয়ে থেকে আসা রেসপন্স ডাটা (যেমন status, transaction_id ইত্যাদি)
  const status = searchParams.get("status"); // 'COMPLETED' or 'success'
  const productType = searchParams.get("productType")?.toLowerCase();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    // 1. গেটওয়ে থেকে সফল পেমেন্ট কনফার্মেশন যাচাই
    if (status === "COMPLETED" || status === "success") {
      
      // 2. 📝 এখানে ডাটাবেজে অটোমেটিক অর্ডার প্লেস/সেভ করার লজিক লিখুন
      // await createOrderInDatabase({ ... });

      // 3. 🎯 শর্ত অনুযায়ী রিডাইরেক্ট
      if (productType === "vouchers" || productType === "voucher") {
        return NextResponse.redirect(`${baseUrl}/code`);
      } else {
        return NextResponse.redirect(`${baseUrl}/myorder`);
      }
    } else {
      // পেমেন্ট ফেইল করলে
      return NextResponse.redirect(`${baseUrl}/order-failed`);
    }
  } catch (error) {
    console.error("Callback handling error:", error);
    return NextResponse.redirect(`${baseUrl}/order-failed`);
  }
}