"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, Image as ImageIcon } from "lucide-react"

export type NavItem = {
  id: string
  name: string
  icon: string 
  href: string
  targetAudience: "ALL" | "GUEST" | "USER"
  slot: number
  status: "ON" | "OFF" | boolean
}

const IconRenderer = ({ icon, name }: { icon: string; name: string }) => {
  if (!icon) {
    return <ImageIcon className="h-4 w-4 text-neutral-400" />
  }

  if (icon.trim().toLowerCase().includes("<svg")) {
    return (
      <div
        className="h-5 w-5 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current text-neutral-700 dark:text-neutral-200"
        dangerouslySetInnerHTML={{ __html: icon }}
      />
    )
  }

  return (
    <div className="relative h-6 w-6 flex items-center justify-center overflow-hidden rounded">
      <img
        src={icon}
        alt={name}
        className="h-full w-full object-contain"
        onError={(e) => {
          e.currentTarget.style.display = "none"
        }}
      />
    </div>
  )
}

interface ColumnProps {
  onEdit: (item: NavItem) => void
  onDelete: (id: string) => void
}

export const getColumns = ({ onEdit, onDelete }: ColumnProps): ColumnDef<NavItem>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // 🟢 ২. ICON COLUMN
  {
    accessorKey: "icon",
    header: "Icon",
    cell: ({ row }) => (
      <div className="flex items-center justify-center p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 h-9 w-9">
        <IconRenderer icon={row.original.icon} name={row.original.name} />
      </div>
    ),
  },

  // 🟢 ৩. NAME & ROUTE COLUMN
  {
    accessorKey: "name",
    header: "Name & Route",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
          {row.original.name}
        </span>
        <span className="text-xs text-neutral-500 font-mono">
          {row.original.href}
        </span>
      </div>
    ),
  },

  // 🟢 ৪. TARGET AUDIENCE COLUMN
  {
    accessorKey: "targetAudience",
    header: "Audience",
    cell: ({ row }) => {
      const val = row.original.targetAudience
      return (
        <Badge
          variant="outline"
          className="text-xs font-normal border-neutral-300 dark:border-neutral-700"
        >
          {val === "ALL" ? "Everyone" : val === "GUEST" ? "Guest Only" : "User Only"}
        </Badge>
      )
    },
  },

  // 🟢 ৫. SLOT COLUMN
  {
    accessorKey: "slot",
    header: "Slot",
    cell: ({ row }) => (
      <span className="font-semibold text-xs px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800">
        Slot {row.original.slot}
      </span>
    ),
  },

  // 🟢 ৬. STATUS COLUMN
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.status === "ON" || row.original.status === true
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isActive
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
              : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      )
    },
  },

  // 🟢 ৭. ACTIONS COLUMN
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(row.original)}
          className="h-8 w-8 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
        >
          <Edit2 className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(row.original.id)}
          className="h-8 w-8 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 rounded-lg"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
]