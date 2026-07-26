"use client" // যেহেতু এটি হুক বা অ্যানিমেশন ব্যবহার করছে

import { cn } from "@/lib/utils"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import Link from "next/link"
import React from "react"

interface NavItemProps {
  item: {
    title?: string
    name?: string
    url: string
    icon: React.ReactNode
  }
  isActive: boolean
}

export function SidebarNavItem({ item, isActive }: NavItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        variant="ghost"
        className={cn(
          "!h-10 !w-full !rounded-md !px-4 !transition-all !duration-300 !ease-in-out",
          isActive
            ? "!bg-primary/20 !text-primary !mt-1.5 !mb-1.5 hover:!bg-primary/20 hover:!text-primary"
            : "!mt-0.5 !mb-0.5 hover:!bg-sidebar-accent hover:!text-sidebar-accent-foreground"
        )}
      >
        <Link href={item.url} className="flex items-center gap-3">
          {/* আইকন সাইজ অ্যানিমেশন */}
          {React.cloneElement(item.icon as React.ReactElement, {
            className: cn(
              "transition-all duration-300 ease-in-out",
              isActive ? "size-6" : "size-5"
            )
          })}
          
          {/* টেক্সট অ্যানিমেশন */}
          <span
            className={cn(
              "font-medium transition-all duration-300 ease-in-out",
              isActive ? "text-[14px] scale-105" : "text-base"
            )}
          >
            {item.title || item.name}
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}