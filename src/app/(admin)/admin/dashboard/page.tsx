import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import OrderDataTable from "@/components/data-table" // 👈 আপনার বিদ্যমান data-table ফাইলটি ইম্পোর্ট করা হলো
import { SectionCards } from "@/components/section-cards"
import AdminHeader from "@/components/admin/Header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getAdminDashboardStats, getInteractiveChartData } from "@/lib/admin-stats"

export const dynamic = "force-dynamic"

export default async function Page() {
  const stats = await getAdminDashboardStats()
  const chartData = await getInteractiveChartData()

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
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards stats={stats} />

              <div className="px-4 lg:px-6">
                <ChartAreaInteractive chartData={chartData} />
              </div>

              {/* ডাটাবেজ টেবিল */}
              <OrderDataTable />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}