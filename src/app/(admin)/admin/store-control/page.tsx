import { AppSidebar } from "@/components/app-sidebar"
import AdminHeader from "@/components/admin/Header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { prisma } from "@/lib/prisma"
import { StoreControlForm } from "./store-control-form"

export default async function StoreControlPage() {
  const storeControl = await getStoreControlData()

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
              
              <StoreControlForm initialData={storeControl} />

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

async function getStoreControlData() {
  try {
    let data = await prisma.storeControl.findUnique({
      where: { id: "STATIC" },
    })

    if (!data) {
      data = await prisma.storeControl.create({
        data: { id: "STATIC" },
      })
    }

    return {
      isSiteClosed: data.isSiteClosed,
      closeReason: data.closeReason ?? "",
      openTime: data.openTime ?? "08:00 AM",
      isMaintenance: data.isMaintenance,
      maintNotice: data.maintNotice ?? "",
      maintEndTime: data.maintEndTime ?? "06:00 AM",
    }
  } catch (error) {
    console.error("Failed to fetch store control data:", error)
    return null
  }
}