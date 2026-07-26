"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, Loader2, MoreVertical, GripVertical } from "lucide-react";
import { useState } from "react";
import React from "react";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Category Type Definition
export type Category = {
  id: string;
  name: string;
  status: boolean;
  slotNo: number;
};

// TanStack Table Meta টাইপ ডিক্লেয়ারেশন
declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    setDeleteTarget: React.Dispatch<React.SetStateAction<{ isBulk: boolean; id?: string; name?: string }>>;
    setIsAlertOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }
}

const StatusSwitchCell = ({ row }: { row: any }) => {
  const category = row.original;
  const [isActive, setIsActive] = useState<boolean>(category.status ?? false);
  const [isChanging, setIsChanging] = useState(false);

  const handleStatusChange = async (checked: boolean) => {
    setIsChanging(true);
    try {
      const response = await fetch("/api/categories/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: category.id, status: checked }),
      });

      if (!response.ok) throw new Error();

      setIsActive(checked);
      toast.success(`Status updated to ${checked ? "ON" : "OFF"}`);
    } catch {
      toast.error("Failed to update status");
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
      <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? "text-white" : "text-neutral-500"}`}>
        {isActive ? "ON" : "OFF"}
      </span>
    </div>
  );
};

export const columns: ColumnDef<Category>[] = [
  {
    id: "drag",
    header: () => <div className="w-4" />,
    cell: () => <GripVertical className="h-4 w-4 text-neutral-400 dark:text-neutral-600" />,
    size: 40,
  },
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox 
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        className="border-neutral-300 dark:border-neutral-700 data-[state=checked]:bg-neutral-900 dark:data-[state=checked]:bg-white"
      />
    ),
    cell: ({ row }) => (
      <Checkbox 
        checked={row.getIsSelected()} 
        onCheckedChange={(value) => row.toggleSelected(!!value)} 
        className="border-neutral-300 dark:border-neutral-700 data-[state=checked]:bg-neutral-900 dark:data-[state=checked]:bg-white"
      />
    ),
    size: 50,
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400">#{row.original.id.slice(-4)}</span>
    ),
    size: 80,
  },
  {
    accessorKey: "name",
    header: "Category",
    cell: ({ row }) => (
      <span className="font-bold text-neutral-900 dark:text-neutral-100">{row.original.name}</span>
    ),
    size: 160,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusSwitchCell row={row} />,
    size: 150,
  },
  {
    accessorKey: "slotNo",
    header: "Slot No",
    cell: ({ row }) => (
      <span className="font-medium text-neutral-700 dark:text-neutral-300">{row.original.slotNo || 0}</span>
    ),
    size: 120,
  },
  {
    id: "actions",
    header: () => <div className="text-right pr-4">Actions</div>,
    cell: ({ row, table }) => {
      const category = row.original;
      const meta = table.options.meta;
      
      const [openEdit, setOpenEdit] = useState(false);
      const [loading, setLoading] = useState(false);
      const [formData, setFormData] = useState({ name: category.name, slotNo: category.slotNo || 0 });

      const handleUpdate = async () => {
        setLoading(true);
        try {
          const response = await fetch('/api/categories/edit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: category.id, ...formData }),
          });
          if (!response.ok) throw new Error();
          toast.success("Category updated successfully!");
          window.location.reload();
        } catch {
          toast.error("Update failed");
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="text-right pr-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-neutral-100 dark:hover:bg-neutral-800 shadow-none">
                <MoreVertical className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 shadow-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
              <DropdownMenuItem onClick={() => setOpenEdit(true)} className="gap-2 cursor-pointer font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900">
                <Pencil className="h-3.5 w-3.5" /> Edit Category
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-800" />
              <DropdownMenuItem 
                onClick={() => {
                  if (meta) {
                    meta.setDeleteTarget({ isBulk: false, id: category.id, name: category.name });
                    meta.setIsAlertOpen(true);
                  }
                }} 
                className="gap-2 text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 cursor-pointer font-medium hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={openEdit} onOpenChange={setOpenEdit}>
            <DialogContent className="bg-white dark:bg-[#121212] border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white sm:max-w-[425px] p-6 rounded-2xl text-left">
              <DialogHeader>
                <DialogTitle className="mt-2 mb-4 text-xl font-bold tracking-tight">Edit Category</DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4 py-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Category Name</Label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Slot No</Label>
                  <Input 
                    type="number" 
                    value={formData.slotNo} 
                    onChange={(e) => setFormData({...formData, slotNo: parseInt(e.target.value) || 0})} 
                    className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-xl h-11"
                  />
                </div>
              </div>

              <div className="flex justify-start gap-2 pt-6 items-center border-t border-neutral-200 dark:border-neutral-800/60 mt-4">
                <Button 
                  className="font-bold h-11 px-8 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all shadow-none"
                  onClick={handleUpdate} 
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  className="border-neutral-200 dark:border-neutral-800 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-white px-6 h-11 rounded-xl ml-auto transition-all" 
                  onClick={() => setOpenEdit(false)}
                >
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
    size: 100,
  },
];