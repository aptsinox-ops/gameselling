import { AppSidebar } from "@/components/app-sidebar"
import AdminHeader from "@/components/admin/Header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { CateTable } from "./cate-table"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function CategoryPage({ searchParams }: PageProps) {
  const { status } = await searchParams
  const activeStatus = status?.toUpperCase() || "ALL"
  const categories = await getDatabaseCategories(activeStatus)

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
                  Category Management
                </h1>
                <p className="text-sm text-neutral-400">Manage your store main home page categories and products grid</p>
              </div>

              {/* ফিল্টার ট্যাব */}
              <div className="flex items-center gap-2 bg-neutral-100/60 dark:bg-neutral-900/40 p-1 rounded-xl w-fit border border-neutral-200/50 dark:border-neutral-800/50 select-none">
                <Link
                  href="/admin/categories"
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeStatus === "ALL"
                      ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-800"
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  All Categories
                </Link>
                <Link
                  href="/admin/categories?status=active"
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
                  href="/admin/categories?status=inactive"
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

              {/* সরাসরি টেবিল কম্পোনেন্ট */}
              <CateTable initialData={categories} />

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

async function getDatabaseCategories(statusFilter: string) {
  try {
    const whereClause: any = {}
    if (statusFilter === "ACTIVE") whereClause.status = true
    else if (statusFilter === "INACTIVE") whereClause.status = false

    const categories = await prisma.category.findMany({
      where: whereClause,
      orderBy: {
        slotNo: "asc",
      },
    })

    return categories.map((cate) => ({
      id: cate.id,
      name: cate.name ?? "—",
      slotNo: cate.slotNo ?? 0,
      status: cate.status ?? false,
      createdAt: cate.createdAt ? cate.createdAt.toISOString() : "",
    }))
  } catch (error) {
    console.error("Failed to fetch database categories:", error)
    return []
  }
}