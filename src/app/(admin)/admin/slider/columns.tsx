"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, MoreVertical, GripVertical, Layers, Video, Share2 } from "lucide-react";
import { useState } from "react";
import React from "react";
import { showToast } from "@/lib/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import "@tanstack/react-table";


// Status Switch Cell
const StatusSwitchCell = ({ row }: { row: any }) => {
  const item = row.original;
  const [isActive, setIsActive] = useState<boolean>(item.status === "ON" || item.status === "ACTIVE");
  const [isChanging, setIsChanging] = useState(false);

  const handleStatusChange = async (checked: boolean) => {
    setIsChanging(true);
    try {
      const response = await fetch("/api/sliders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: item.id, 
          status: checked ? "ON" : "OFF"
        }),
      });

      if (!response.ok) throw new Error();

      setIsActive(checked);
      showToast.success(`Slider status updated to ${checked ? "ON" : "OFF"}`);
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
        className="data-[state=checked]:bg-primary shadow-none"
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
    accessorKey: "imageUrl",
    header: "Banner Image",
    cell: ({ row }) => (
      <div className="w-16 h-10 relative flex items-center overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
        <img 
          src={row.original.imageUrl || "/placeholder.png"} 
          alt="Slide"
          className="w-full h-full object-cover"
        />
      </div>
    ),
    size: 90,
  },
  {
    accessorKey: "type",
    header: "Slide Type",
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <Badge className={`text-[10px] font-bold rounded-lg uppercase px-2.5 py-1 border shadow-none flex items-center gap-1.5 w-max ${
          type === "BANNER"
            ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
            : type === "VIDEO"
            ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
            : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
        }`}>
          {type === "BANNER" && <Layers className="w-3 h-3" />}
          {type === "VIDEO" && <Video className="w-3 h-3" />}
          {type === "SOCIAL" && <Share2 className="w-3 h-3" />}
          {type}
        </Badge>
      );
    },
    size: 130,
  },
  {
    id: "details",
    header: "Target Details & Link",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="text-xs space-y-0.5 truncate max-w-[280px]">
          {item.type === "BANNER" && (
            <span className="text-neutral-600 dark:text-neutral-400 font-medium truncate block">
              Link: <span className="text-neutral-900 dark:text-neutral-200 font-bold">{item.link || "None"}</span>
            </span>
          )}
          {item.type === "VIDEO" && (
            <span className="text-rose-500 font-medium truncate block">
              Video URL: <span className="underline">{item.videoUrl}</span>
            </span>
          )}
          {item.type === "SOCIAL" && (
            <div>
              <p className="font-bold text-neutral-900 dark:text-neutral-100 truncate">{item.title}</p>
              <p className="text-emerald-500 truncate">{item.socialUrl}</p>
            </div>
          )}
        </div>
      );
    },
    size: 280,
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
              
              <DropdownMenuItem 
                onClick={() => {
                  if (meta?.setEditItem) {
                    meta.setEditItem(item);
                  }
                }}
                className="gap-2 cursor-pointer font-medium"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="border-neutral-100 dark:border-neutral-800" />
              
              <DropdownMenuItem 
                onClick={() => {
                  if (meta?.setDeleteTarget && meta?.setIsAlertOpen) {
                    meta.setDeleteTarget({
                      isBulk: false,
                      id: item.id,
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