import React from "react";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import MyOrdersPageClient from "@/components/MyOrdersPageClient";

export const dynamic = "force-dynamic";

export default async function MyOrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const allOrders = await db.order.findMany({
    where: {
      userId: Number((session.user as any).id),
    },
    include: {
      variation: true,
      product: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const filteredOrders = allOrders.filter((order) => {
    const type = order.product?.productType?.toLowerCase();
    return type !== "vouchers" && type !== "voucher";
  });

  const config = await db.siteSettings.findFirst();
  const primaryColor = config?.primaryColor || "#7c3aed";

  return <MyOrdersPageClient orders={filteredOrders as any} primaryColor={primaryColor} />;
}