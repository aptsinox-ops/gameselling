"use client"

import * as React from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { SearchCommand } from "./SearchCommand"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  User2,
  TagIcon,
  BoxIcon,
  PlusCircleIcon,
  Package2Icon,
  LucidePackageCheck,
  Ticket,
  Settings,
  ListIcon,
  Slice,
  FileDownIcon,
  SettingsIcon,
  ChevronRight,
  Search,
} from "lucide-react"

const menuGroups = [
  {
    group: "Main Overview",
    list: [
      { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboardIcon },
      { title: "Users", url: "/admin/users", icon: User2 },
      { title: "Statement", url: "/admin/statement", icon: TagIcon },
      { title: "All Orders", url: "/admin/orders", icon: BoxIcon },
    ],
  },
  {
    group: "Inventory & Stock",
    list: [
      { title: "Add Categories", url: "/admin/categories", icon: PlusCircleIcon },
      { title: "Add Products", url: "/admin/products", icon: Package2Icon },
      { title: "Add Variations", url: "/admin/variations", icon: LucidePackageCheck },
      { title: "Add Auto Topup Vouchers", url: "/admin/autorobot", icon: Ticket },
    ],
  },
  {
    group: "System & Management",
    list: [
      { title: "Addmoney List", url: "/admin/addmoneylist", icon: ListIcon },
      { title: "Slider", url: "/admin/slider", icon: Slice },
      { title: "Bottom Navigation", url: "/admin/nav", icon: FileDownIcon },
      { title: "Work Notice App", url: "/admin/store-control", icon: SettingsIcon },
    ],
  },
  {
    group: "Settings",
    list: [
      { title: "Website Settings", url: "/admin/settings", icon: SettingsIcon },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [openSearch, setOpenSearch] = React.useState(false);

  return (
    <>
      <Sidebar collapsible="offcanvas" className="border-r border-neutral-200/60 dark:border-neutral-800/60" {...props}>
        
        {/* Sidebar Header */}
        <SidebarHeader className="p-3">
          <div className="flex items-center gap-3 rounded-lg border border-neutral-200/80 p-2 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-neutral-200 dark:bg-neutral-800">
              <Image 
                src="/developer.png" 
                alt="Developer" 
                width={32} 
                height={32} 
                className="object-cover"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate text-xs font-semibold text-neutral-900 dark:text-white">
                APT SINOX
              </span>
              <span className="truncate text-[10px] text-neutral-500 dark:text-neutral-400">
                Admin Panel
              </span>
            </div>
          </div>

          {/* Quick Search Button (Triggers Dialog) */}
          <button
            onClick={() => setOpenSearch(true)}
            className="relative mt-2 flex h-8 w-full items-center justify-between rounded-md bg-neutral-100/80 px-2.5 text-xs text-neutral-500 hover:bg-neutral-200/60 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-all border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-neutral-400" />
              <span>Quick search...</span>
            </div>
            <kbd className="pointer-events-none inline-flex h-4 select-none items-center rounded border border-neutral-200 bg-white px-1 font-mono text-[9px] text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800">
              Ctrl K
            </kbd>
          </button>
        </SidebarHeader>

        {/* Sidebar Menu Items */}
        <SidebarContent className="px-2">
          {menuGroups.map((group, idx) => (
            <SidebarGroup key={idx} className="py-2">
              <SidebarGroupLabel className="text-[11px] font-medium tracking-wider text-neutral-500 dark:text-neutral-400 uppercase px-2 mb-1">
                {group.group}
              </SidebarGroupLabel>
              <SidebarMenu>
                {group.list.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.url;

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`h-8 rounded-md px-2 text-xs transition-all duration-150 ${
                          isActive 
                            ? "bg-primary/30 text-primary font-semibold shadow-xs border border-primary/20 backdrop-blur-sm" 
                            : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 hover:text-neutral-900 dark:hover:text-white"
                        }`}
                      >
                        <a href={item.url} className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2.5">
                            <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-neutral-500 dark:text-neutral-400"}`} />
                            <span>{item.title}</span>
                          </div>
                          <ChevronRight className={`h-3 w-3 transition-opacity ${isActive ? "opacity-100 text-primary" : "opacity-0 group-hover/menu-button:opacity-100 text-neutral-400"}`} />
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </SidebarContent>

      </Sidebar>

      {/* Command Search Dialog */}
      <SearchCommand 
        open={openSearch} 
        setOpen={setOpenSearch} 
        items={menuGroups} 
      />
    </>
  );
}