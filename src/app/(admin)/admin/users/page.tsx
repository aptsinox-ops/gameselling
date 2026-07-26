import { AppSidebar } from "@/components/app-sidebar"
import AdminHeader from "@/components/admin/Header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { UserTable } from "./user-table"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

interface PageProps {
  searchParams: Promise<{ role?: string }>
}

export default async function UserPage({ searchParams }: PageProps) {
  const { role } = await searchParams
  const activeRole = role?.toUpperCase() || "ALL"
  const users = await getDatabaseUsers(activeRole) 

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
              
              {/* টাইটেল এবং ডেসক্রিপশন (ওপরের বাটনটি রিমুভড) */}
              <div className="space-y-1">
                <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                  User Management
                </h1>
                <p className="text-sm text-neutral-400">Manage your store products and packages</p>
              </div>
              
              {/* টেবিল কম্পোনেন্ট */}
              <UserTable initialData={users} />

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

async function getDatabaseUsers(roleFilter: string) {
  try {
    const whereClause: any = {}
    if (roleFilter === "RESELLER") whereClause.role = "Reseller"
    else if (roleFilter === "PREMIUM") whereClause.role = "Premium"

    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: { id: "asc" },
    })

    return users.map((user) => ({
      id: user.id,
      name: user.name ?? "—",
      email: user.email ?? "—",
      phone: user.phone ?? "—",
      balance: Number(user.balance) || 0,
      role: user.role ?? "User",
      createdAt: user.createdAt ? user.createdAt.toISOString() : "",
    }))
  } catch (error) {
    console.error("Failed to fetch database users:", error)
    return []
  }
}