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

  // ইনভয়েস না থাকলে 404 পেজে রিডাইরেক্ট করবে
  if (!invoice) {
    notFound();
  }

  const settings = await prisma.siteSettings.findFirst();

  return (
    <div className="min-h-screen bg-white bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:60px_60px]">
      <PaymentCheckoutClient
        invoice={JSON.parse(JSON.stringify(invoice))}
        settings={JSON.parse(JSON.stringify(settings || {}))}
      />
    </div>
  );
}