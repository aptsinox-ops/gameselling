import React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import AdminHeader from "@/components/admin/Header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SliderTable } from "./slider-table"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic";

export default async function SlidersPage() {
  const sliders = await getDatabaseSliders()

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
                  Hero Slider Management
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Manage your website home page hero banners, video slides, and social link banners.
                </p>
              </div>
              
              <SliderTable initialData={sliders} />

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

async function getDatabaseSliders() {
  try {
    const sliders = await db.slider.findMany({
      orderBy: { createdAt: "desc" },
    })

    return sliders.map((s) => ({
      id: s.id,
      type: s.type, // BANNER, VIDEO, SOCIAL
      imageUrl: s.imageUrl,
      link: s.link || "",
      videoUrl: s.videoUrl || "",
      title: s.title || "",
      socialUrl: s.socialUrl || "",
      status: (s as any).status || "ON",
      createdAt: s.createdAt ? s.createdAt.toISOString() : "",
    }))
  } catch (error) {
    console.error("Failed to fetch database sliders:", error)
    return []
  }
}