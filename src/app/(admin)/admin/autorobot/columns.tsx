// src/app/(admin)/admin/autorobot/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, GripVertical, Pencil, Trash2, Plug2Icon } from "lucide-react";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditAutoRobotDialog } from "@/components/EditAutoRobotDialog";

export type AutoRobotItem = {
  id: string;
  productId: string;
  productName: string;
  title: string;
  price: number;
  amount: number;
  stock: number;
  status: string;
  updatedAt: string;
};

// Backward compatibility-এর জন্য alias
export type AutoRobot = AutoRobotItem;

export const columns: ColumnDef<AutoRobotItem>[] = [
  {
    id: "drag",
    header: () => <div className="w-4" />,
    cell: () => <GripVertical className="h-4 w-4 text-neutral-400" />,
    size: 40,
  },
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    size: 50,
  },
  {
    id: "productName",
    accessorKey: "productName",
    header: "Product & Variation",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-bold text-neutral-900 dark:text-neutral-100">
          {row.original.productName}
        </span>
        <span className="text-xs text-neutral-500 font-medium">
          {row.original.title}
        </span>
      </div>
    ),
  },
  {
    id: "price",
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-bold text-neutral-800 dark:text-neutral-200">
        ৳{row.original.price}
      </span>
    ),
  },
  {
    id: "stock",
    accessorKey: "stock",
    header: "Active Vouchers (Stock)",
    cell: ({ row }) => {
      const stock = row.original.stock;
      return (
        <Badge
          className={`font-bold font-mono px-3 py-1 rounded-lg ${
            stock > 0
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
              : "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400"
          }`}
        >
          {stock} {stock === 1 ? "Voucher" : "Vouchers"} Available
        </Badge>
      );
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const stock = row.original.stock;
      // স্টক ০ হলে অটোমেটিক OFF / Out of Stock দেখাবে
      const isAutoOff = stock <= 0;
      const isActive = (row.original.status === "ON" || row.original.status === "ACTIVE") && !isAutoOff;

      return (
        <Badge
          variant="secondary"
          className={`font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full ${
            isActive
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
              : "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
          }`}
        >
          {isActive ? "ON (ACTIVE)" : isAutoOff ? "OFF (OUT OF STOCK)" : "OFF (DISABLED)"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right pr-4">Actions</div>,
    cell: ({ row, table }) => {
      const item = row.original;
      const meta = table.options.meta as any;

      const [openEdit, setOpenEdit] = useState(false);

      return (
        <div className="text-right pr-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-[#121212] border-neutral-200 dark:border-neutral-800">
              <DropdownMenuItem
                onClick={() => setOpenEdit(true)}
                className="gap-2 cursor-pointer font-medium"
              >
                <Plug2Icon className="h-3.5 w-3.5" /> Add Vouchers
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Edit + full voucher management dialog (same shape as Add dialog) */}
          <EditAutoRobotDialog
            open={openEdit}
            onOpenChange={setOpenEdit}
            variation={{
              id: item.id,
              title: item.title,
              price: item.price,
              productName: item.productName,
            }}
          />
        </div>
      );
    },
  },
];