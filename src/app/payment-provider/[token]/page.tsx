import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PaymentCheckoutClient from "./PaymentCheckoutClient";

export const metadata: Metadata = {
  title: "Secure Checkout",
  description: "Complete your wallet recharge securely.",
};

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function PaymentProviderPage({ params }: PageProps) {
  const { token } = await params;

  if (!token) {
    notFound();
  }

  // 🔍 Database Check
  const invoice = await prisma.autoPaymentInvoice.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!invoice || invoice.status !== "PENDING" || new Date() > invoice.expiresAt) {
    return (
      <main className="min-h-screen bg-[#f4f7f9] flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-6 rounded-xl border border-gray-200 text-center max-w-md w-full shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900">Payment Session Expired</h2>
          <p className="text-xs text-gray-500 mt-1">
            এই পেমেন্ট লিংকটির মেয়াদ শেষ হয়ে গিয়েছে অথবা লিংকটি সঠিক নয়।
          </p>
          <a
            href="/add-money"
            className="inline-block mt-4 px-5 py-2.5 bg-[#2596be] text-white font-medium text-xs rounded-md"
          >
            আবার চেষ্টা করুন
          </a>
        </div>
      </main>
    );
  }

  const settings = await prisma.siteSettings.findFirst();

  return (
    <PaymentCheckoutClient
      invoice={JSON.parse(JSON.stringify(invoice))}
      settings={JSON.parse(JSON.stringify(settings || {}))}
    />
  );
}