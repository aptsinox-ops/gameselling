"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, MoreVertical, GripVertical } from "lucide-react";
import { useState } from "react";
import React from "react";
import { showToast } from "@/lib/toast";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// লাইভ স্ট্যাটাস সুইচ সেল
const StatusSwitchCell = ({ row }: { row: any }) => {
  const item = row.original;
  const [isActive, setIsActive] = useState<boolean>(item.status === "ON" || item.status === "ACTIVE");
  const [isChanging, setIsChanging] = useState(false);

  const handleStatusChange = async (checked: boolean) => {
    setIsChanging(true);
    try {
      const response = await fetch("/api/products/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: item.id, 
          status: checked ? "ON" : "OFF"
        }),
      });

      if (!response.ok) throw new Error();

      setIsActive(checked);
      showToast.success(`Status updated to ${checked ? "ON" : "OFF"}`);
    } catch {
      showToast.error("Failed to update status");
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isActive}
        disabled={isChanging}
        onCheckedChange={handleStatusChange}
        className="data-[state=checked]:bg-primary"
      />
      <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${isActive ? "text-neutral-900 dark:text-white" : "text-neutral-500"}`}>
        {isActive ? "ON" : "OFF"}
      </span>
    </div>
  );
};

export const columns: ColumnDef<any>[] = [
  {
    id: "drag",
    header: () => <div className="w-4" />,
    cell: () => <GripVertical className="h-4 w-4 text-neutral-500 select-none cursor-grab active:cursor-grabbing" />,
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
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => (
      <div className="w-10 h-10 relative flex items-center">
        <img 
          src={row.original.image || "/placeholder.png"} 
          alt={row.original.name || "User"}
          className="w-10 h-10 object-cover rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900"
        />
      </div>
    ),
    size: 60,
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-[11px] text-neutral-500 tracking-tight">
        #{String(row.original.id).substring(0, 8)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "name",
    header: "Product Name",
    cell: ({ row }) => (
      <span className="font-bold text-neutral-900 dark:text-neutral-200 block truncate max-w-[180px]">
        {row.original.name || row.original.username || "N/A"}
      </span>
    ),
    size: 180,
  },
  {
    id: "totalOrders",
    header: "Total Order",
    cell: ({ row }) => (
      <span className="font-bold text-neutral-900 dark:text-neutral-200 pr-5">
        {row.original.totalOrders ?? 0}
      </span>
    ),
    size: 100,
  },
  {
    id: "variations",
    header: "Variations",
    cell: ({ row }) => (
      <span className="font-bold text-neutral-900 dark:text-neutral-200">
        {row.original.variations?.length || 0}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "variationsDesign",
    header: "Variation Type",
    cell: ({ row }) => {
      const designType = row.original.variationsDesign || "Grid";
      return (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-400 border border-neutral-200/50 dark:border-neutral-800/60">
          {designType}
        </span>
      );
    },
    size: 130,
  },
  {
    accessorKey: "productType",
    header: "Product Type",
    cell: ({ row }) => (
      <span className="text-neutral-500 dark:text-neutral-400 font-medium text-xs">
        {row.original.productType || "N/A"}
      </span>
    ),
    size: 120,
  },
  {
    accessorKey: "resellerPercentage",
    header: "Reseller %",
    cell: ({ row }) => {
      const percentage = row.original.resellerPercentage ?? 0;
      return (
        <span className="font-bold text-neutral-900 dark:text-neutral-300">
          {percentage}%
        </span>
      );
    },
    size: 100,
  },
  {
    id: "headings",
    header: "Heading Status",
    cell: ({ row }) => {
      const p = row.original;
      const isHeadingOn = p.isTagEnabled || p.isFreeFireAuto || p.isUidNameChecker || p.productTag !== "";
      
      return (
        <div className="flex items-center">
          {isHeadingOn ? (
            <Badge className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-none font-bold rounded-full uppercase px-2.5 py-0.5">
              ON
            </Badge>
          ) : (
            <Badge className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 shadow-none font-bold rounded-full uppercase px-2.5 py-0.5">
              OFF
            </Badge>
          )}
        </div>
      );
    },
    size: 130,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusSwitchCell row={row} />,
    size: 110,
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row, table }) => {
      const item = row.original;
      const meta = table.options.meta; 

      return (
        <div className="flex justify-center items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-neutral-100 dark:hover:bg-neutral-800 shadow-none cursor-pointer">
                <MoreVertical className="h-4 w-4 text-neutral-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 shadow-none rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121212]">
              
              <DropdownMenuItem asChild>
                <Link
                  href={`/admin/products?edit=${item.id}`}
                  className="flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="border-neutral-100 dark:border-neutral-800" />
              <DropdownMenuItem 
                onClick={() => {
                if (meta?.setDeleteTarget && meta?.setIsAlertOpen) {
                  meta.setDeleteTarget({
                    isBulk: false,
                    id: item.id,
                    name: item.name || "This item",
                  });
                  meta.setIsAlertOpen(true);
                }
              }}
                className="gap-2 text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer font-medium"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    size: 80,
  },
];