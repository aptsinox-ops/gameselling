import { AppSidebar } from "@/components/app-sidebar"
import AdminHeader from "@/components/admin/Header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { NavTable } from "./nav-table"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function NavManagementPage({ searchParams }: PageProps) {
  const { status } = await searchParams
  const activeStatus = status?.toUpperCase() || "ALL"

  // ডাটাবেস থেকে নেভিগেশন ডাটা নিয়ে আসা হচ্ছে
  const navigations = await getDatabaseNavigations(activeStatus)

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
                  Bottom Navigation Management
                </h1>
                <p className="text-sm text-neutral-400">
                  Manage bottom navigation icons, slots, routes, visibility, and active status
                </p>
              </div>

              {/* ফিল্টার ট্যাব */}
              <div className="flex items-center gap-2 bg-neutral-100/60 dark:bg-neutral-900/40 p-1 rounded-xl w-fit border border-neutral-200/50 dark:border-neutral-800/50 select-none">
                <Link
                  href="/admin/nav"
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeStatus === "ALL"
                      ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-800"
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  All Items
                </Link>
                <Link
                  href="/admin/nav?status=active"
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
                  href="/admin/nav?status=inactive"
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

              {/* নেভিগেশন ডাটা টেবিল */}
              <NavTable initialData={navigations} />

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// 🟢 ডাটাবেস থেকে ফিল্টার অনুযায়ী Navigation Item নিয়ে আসার ফাংশন
async function getDatabaseNavigations(statusFilter: string) {
  try {
    const whereClause: any = {}
    if (statusFilter === "ACTIVE") whereClause.status = "ON"
    else if (statusFilter === "INACTIVE") whereClause.status = "OFF"

    const items = await prisma.navigation.findMany({
      where: whereClause,
      orderBy: [
        { slot: "asc" },
        { sortOrder: "asc" }
      ],
    })

    return items.map((nav) => ({
      id: nav.id,
      icon: nav.icon ?? "LayoutGrid",
      name: nav.name ?? "—",
      href: nav.href ?? "/",
      targetAudience: nav.targetAudience ?? "ALL",
      slot: nav.slot ?? 1,
      status: nav.status === "ON",
      createdAt: nav.createdAt ? nav.createdAt.toISOString() : "",
    }))
  } catch (error) {
    console.error("Failed to fetch database navigations:", error)
    return []
  }
}