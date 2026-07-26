"use client"

import * as React from "react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavPay } from "@/components/nav-pay"
import { NavConfiq } from "@/components/nav-confiq"



import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, ListIcon, ChartBarIcon, FolderIcon, UsersIcon, CameraIcon, FileTextIcon, Settings2Icon, CircleHelpIcon, SearchIcon, DatabaseIcon, FileChartColumnIcon, FileIcon, CommandIcon, User2, TagIcon, GiftIcon, BoxSelectIcon, BoxIcon, BookXIcon, RouteIcon, PlusCircleIcon, Package2Icon, Star, LucidePackage2, LucidePackageCheck, Ticket, TicketMinusIcon, Key, CreditCard, Slice, GlassWater, BarChart2Icon, FileDownIcon, Settings, SettingsIcon } from "lucide-react"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    { title: "Dashboard", url: "/admin/dashboard", icon: <LayoutDashboardIcon /> },
    { title: "Users", url: "/admin/users", icon: <User2 /> },
    { title: "Statement", url: "/admin/statement", icon: <TagIcon /> },
    { title: "All Orders", url: "/admin/orders", icon: <BoxIcon /> },
  ],

  documents: [
    { name: "Add Categorys", url: "/admin/categories", icon: <PlusCircleIcon /> },
    { name: "Add Products", url: "/admin/products", icon: <Package2Icon /> },
    { name: "Add Variations", url: "/admin/variations", icon: <LucidePackageCheck /> },
    { name: "Add Auto Vouchers", url: "/admin/auto-vouchers", icon: <Ticket /> },
    { name: "Add Vouchers", url: "/admin/vouchers", icon: <Ticket /> },
    { name: "Shell Configaretion", url: "/admin/shell-config", icon: <Key /> },
  ],

  navPay: [
    { name: "Payment", url: "/admin/payment", icon: <CreditCard /> },
    { name: "Addmoney List", url: "/admin/addmoneylist", icon: <ListIcon /> },
    { name: "Slider", url: "/admin/slider", icon: <Slice /> },
    { name: "Notice Setting", url: "/admin/notice", icon: <Settings2Icon /> },
    { name: "Buttom Navigation", url: "/admin/nav", icon: <FileDownIcon /> },
  ],

  navConfiq: [
    { name: "Website Settings", url: "/admin/settings", icon: <SettingsIcon /> },
    { name: "Admin Settings", url: "/admin/set-admin", icon: <Settings /> },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">APT SINOX</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavPay items={data.navPay} />
        <NavConfiq items={data.navConfiq} />
      </SidebarContent>
    </Sidebar>
  )
}
