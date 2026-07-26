"use client"

import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel, // এই কম্পোনেন্টটি ইমপোর্ট করুন
  SidebarMenu,
} from "@/components/ui/sidebar"
import { SidebarNavItem } from "@/components/SidebarNavItem"

export function NavPay({
  items,
}: {
  items: {
    title?: string
    name?: string
    url: string
    icon?: React.ReactNode
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      {/* এখানে Label টি যোগ করা হয়েছে */}
      <SidebarGroupLabel>Payment & Website Confiq</SidebarGroupLabel>
      
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url

            return (
              <SidebarNavItem
                key={item.title || item.name}
                item={item}
                isActive={isActive}
              />
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}