import { AppSidebar } from "@/components/app-sidebar"
import AdminHeader from "@/components/admin/Header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { VarTable } from "./var-table"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function VariationsPage({ searchParams }: PageProps) {
  const { status } = await searchParams
  const activeStatus = status?.toUpperCase() || "ALL"
  
  // একই সাথে ডাটাবেস থেকে সব ভেরিয়েশন এবং নতুন ফর্মের জন্য সব প্রোডাক্টের লিস্ট নিয়ে আসা হচ্ছে
  const [variations, products] = await Promise.all([
    getDatabaseVariations(activeStatus),
    getDatabaseProducts()
  ])

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      
      <SidebarInset>
        <AdminHeader />
        
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              
              {/* টাইটেল এবং ডেসক্রিপশন */}
              <div className="space-y-1">
                <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                  Variation Management
                </h1>
                <p className="text-sm text-neutral-400">Manage all product packages, pricing, amounts and store status</p>
              </div>

              {/* ফিল্টার ট্যাব */}
              <div className="flex items-center gap-2 bg-neutral-100/60 dark:bg-neutral-900/40 p-1 rounded-xl w-fit border border-neutral-200/50 dark:border-neutral-800/50 select-none">
                <Link
                  href="/admin/variations"
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeStatus === "ALL"
                      ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-800"
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  All Variations
                </Link>
                <Link
                  href="/admin/variations?status=active"
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    activeStatus === "ACTIVE"
                      ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-800"
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Active
                </Link>
                <Link
                  href="/admin/variations?status=inactive"
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    activeStatus === "INACTIVE"
                      ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-800"
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Inactive
                </Link>
              </div>

              {/* ভেরিয়েশন ডাটা টেবিল */}
              <VarTable initialData={variations} products={products} />

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// 🟢 ডাটাবেস থেকে ফিল্টার অনুযায়ী ভেরিয়েশন ও রিলেটেড প্রোডাক্ট নিয়ে আসার ফাংশন
async function getDatabaseVariations(statusFilter: string) {
  try {
    const whereClause: any = {}
    if (statusFilter === "ACTIVE") whereClause.status = "ON"
    else if (statusFilter === "INACTIVE") whereClause.status = "OFF"

    const variations = await prisma.variation.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            name: true,
            productType: true,
            isFreeFireAuto: true,
          }
        },
        vouchers: {
          where: { status: "ACTIVE" }, // Active Voucher গুনে dynamic stock বের করার জন্য
          select: { id: true }
        }
      },
      orderBy: {
        sortOrder: "asc",
      },
    })

    return variations.map((v) => {
      const isVoucherType = v.product?.productType?.toUpperCase() === "VOUCHER";
      const calculatedStock = isVoucherType ? v.vouchers.length : ((v as any).stock ?? 0);

      return {
        id: v.id,
        productId: v.productId,
        productName: v.product?.name ?? "—",
        title: v.title ?? "—",
        amount: v.amount ?? 0,
        price: v.price ?? 0,
        offerPrice: v.offerPrice,
        bonus: (v as any).bonus ?? 0,
        stock: calculatedStock,
        status: v.status === "ON",
        sortOrder: v.sortOrder ?? 0,
        createdAt: v.createdAt ? v.createdAt.toISOString() : "",
      };
    })
  } catch (error) {
    console.error("Failed to fetch database variations:", error)
    return []
  }
}

// 🟢 এডমিন ডায়ালগে ড্রপডাউনের জন্য সব প্রোডাক্টের লিস্ট আনার ফাংশন
async function getDatabaseProducts() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        productType: true,
        resellerPercentage: true,
        isFreeFireAuto: true, // 👈 FF Auto চেক ডায়ালগে পাঠানোর জন্য যুক্ত করা হলো
      },
      orderBy: {
        name: "asc",
      }
    })
    return products.map(p => ({
      id: p.id,
      name: p.name,
      productType: p.productType ?? null,
      resellerPercentage: p.resellerPercentage ?? 0,
      isFreeFireAuto: Boolean(p.isFreeFireAuto) // 👈 Boolean হিসেবে পাস করা হচ্ছে
    }))
  } catch (error) {
    console.error("Failed to fetch products for dropdown:", error)
    return []
  }
}