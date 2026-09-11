import React from "react";
import { db } from "@/lib/db";
import CodePageClient from "@/components/CodePageClient"; // Client Component

export const dynamic = "force-dynamic";

export default async function VoucherCodesListPage() {
  const voucherOrders = await db.order.findMany({
    where: {
      product: {
        productType: {
          equals: "vouchers",
          mode: "insensitive",
        },
      },
    },
    include: {
      variation: true,
      product: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const config = await db.siteSettings.findFirst();
  const primaryColor = config?.primaryColor || "#7c3aed";

  return <CodePageClient orders={voucherOrders as any} primaryColor={primaryColor} />;
}