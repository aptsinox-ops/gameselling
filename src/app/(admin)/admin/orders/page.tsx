import React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import AdminHeader from "@/components/admin/Header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { OrderTable } from "./order-table"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const { status } = await searchParams
  const activeStatus = status?.toUpperCase() || "ALL"
  const orders = await getDatabaseOrders(activeStatus) 

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      
      <SidebarInset>
        <AdminHeader />
        
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              
              <div className="space-y-1">
                <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                  Order Management
                </h1>
                <p className="text-sm text-neutral-400">Manage your store customer orders, status, and voucher codes</p>
              </div>
              
              <OrderTable initialData={orders} />

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

async function getDatabaseOrders(statusFilter: string) {
  try {
    const whereClause: any = {}
    
    if (statusFilter !== "ALL") {
      whereClause.status = {
        equals: statusFilter,
        mode: "insensitive",
      }
    }

    const orders = await db.order.findMany({
      where: whereClause,
      include: {
        product: true,
        variation: true,
        user: true, // ⚡ ১. ইউজার রিলেশন ইনক্লুড করা হলো কাস্টমার নামের জন্য
      },
      orderBy: { createdAt: "desc" },
    })

    return orders.map((order) => {
      const qty = order.quantity || 1;
      
      // ⚡ ২. Variation থেকে Bonus রিড করা হলো
      const totalBonus = (order.variation?.bonus || 0) * qty;

      // ⚡ ৩. Price এবং offerPrice এর পার্থক্য থেকে Discount হিসাব করা হলো
      const price = order.variation?.price || 0;
      const offerPrice = order.variation?.offerPrice;
      const unitDiscount = (offerPrice && price > offerPrice) ? (price - offerPrice) : 0;
      const totalDiscount = unitDiscount * qty;

      return {
        id: order.id,
        receiptNo: order.receiptNo || order.id.substring(0, 8),
        productTitle: order.product?.name || "—",
        productType: order.product?.productType || "—",
        variationTitle: order.variation?.title || "—",
        totalPrice: Number(order.totalPrice) || 0,
        status: order.status || "Pending",
        voucherCode: order.voucherCode || "",
        inputValues: order.inputValues ? JSON.parse(JSON.stringify(order.inputValues)) : {},
        customerName: order.user?.name || order.user?.email || "Customer", // ⚡ কাস্টমার নাম পাওয়া যাবে
        createdAt: order.createdAt ? order.createdAt.toISOString() : "",
        quantity: qty,
        bonus: totalBonus,
        discount: totalDiscount,
        paymentMethod: (order as any).paymentMethod || (order as any).paymentType || (order as any).method || "Wallet",
      }
    })
  } catch (error) {
    console.error("Failed to fetch database orders:", error)
    return []
  }
}