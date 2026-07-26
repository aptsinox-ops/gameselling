"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Pencil, Trash2, Loader2, MoreVertical, GripVertical } from "lucide-react";
import { useState } from "react";
import React from "react";
import { showToast } from "@/lib/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// User Type Definition
export type User = {
  id: number;
  name: string;
  balance: number;
  phone: string;
  email: string;
  role: string;
  status?: boolean;
  createdAt: Date | string;
};

// TanStack Table Meta টাইপ ডিক্লেয়ারেশন
declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    setDeleteTarget: React.Dispatch<React.SetStateAction<{ isBulk: boolean; id?: number; name?: string }>>;
    setIsAlertOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }
}

export const columns: ColumnDef<User>[] = [
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
      <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400">#{row.original.id}</span>
    ),
    size: 80,
  },
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-bold text-neutral-900 dark:text-neutral-100 leading-none">{row.original.name}</span>
      </div>
    ),
    size: 160,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 truncate max-w-[220px] block">
        {row.original.email || "N/A"}
      </span>
    ),
    size: 240,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{row.original.phone || "N/A"}</span>
    ),
    size: 140,
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => {
      const amount = parseFloat(String(row.getValue("balance") || "0"));
      return <span className="font-bold text-neutral-900 dark:text-neutral-100">৳{amount.toLocaleString()}</span>;
    },
    size: 120,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-bold uppercase text-[10px] px-2 py-0 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-none shadow-none">
        {row.original.role}
      </Badge>
    ),
    size: 110,
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.status ?? true;
      return (
        <Badge 
          variant="secondary" 
          className={`font-bold uppercase text-[10px] px-2.5 py-0.5 border-none shadow-none rounded-full ${
            isActive 
              ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400" 
              : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
          }`}
        >
          {isActive ? "Active" : "Banned"}
        </Badge>
      );
    },
    size: 120,
  },
  {
    id: "actions",
    header: () => <div className="text-right pr-4">Actions</div>,
    cell: ({ row, table }) => {
      const user = row.original;
      const meta = table.options.meta;
      
      const [openEdit, setOpenEdit] = useState(false);
      const [loading, setLoading] = useState(false);
      const [showPasswordInput, setShowPasswordInput] = useState(false);
      
      const [formData, setFormData] = useState({ 
        name: user.name, 
        email: user.email || "",
        phone: user.phone || "",
        balance: user.balance || 0,
        role: user.role,
        password: ""
      });

      const handleUpdate = async () => {
        setLoading(true);
        const toastId = showToast.loading("Updating user...");

        try {
          const response = await fetch('/api/users/edit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: user.id, ...formData }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Update failed");
          }

          showToast.dismiss(toastId);
          showToast.success("User updated successfully!");
          window.location.reload();
        } catch (error: any) {
          showToast.dismiss(toastId);
          showToast.error(error.message || "Update failed");
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
                <Pencil className="h-3.5 w-3.5" /> Edit Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-800" />
              <DropdownMenuItem 
                onClick={() => {
                  if (meta) {
                    meta.setDeleteTarget({ isBulk: false, id: user.id, name: user.name });
                    meta.setIsAlertOpen(true);
                  }
                }} 
                className="gap-2 text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 cursor-pointer font-medium hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Edit User Dialog */}
          <Dialog open={openEdit} onOpenChange={(open) => {
            setOpenEdit(open);
            if (!open) {
              setShowPasswordInput(false);
              setFormData((prev) => ({ ...prev, password: "" }));
            }
          }}>
            <DialogContent className="bg-white dark:bg-[#121212] border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white sm:max-w-[425px] p-6 rounded-2xl text-left">
              <DialogHeader>
                <DialogTitle className="mt-2 mb-4 text-xl font-bold tracking-tight">
                  Edit User Profile
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4 py-2">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Full Name</Label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl h-11"
                  />
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Phone Number</Label>
                  <Input 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                    className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl h-11"
                  />
                </div>

                {/* Balance & Role */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Balance (৳)</Label>
                    <Input 
                      type="number" 
                      value={formData.balance} 
                      onChange={(e) => setFormData({...formData, balance: parseFloat(e.target.value) || 0})} 
                      className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">User Role</Label>
                    <select 
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="flex w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl h-11 px-3 text-sm focus:outline-none"
                    >
                      <option value="User">User</option>
                      <option value="Reseller">Reseller</option>
                      <option value="Premium">Premium</option>
                    </select>
                  </div>
                </div>

                {/* Dynamic Password Reset Section */}
                {!showPasswordInput ? (
                  /* Security Access Box */
                  <div className="mt-2 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2 mb-3">
                       <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
                          <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                       </div>
                       <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Security Access</p>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-3 leading-relaxed">
                      Only you (admin) can change the user password. For security reasons, you cannot see the existing user password.
                    </p>
                    <Button 
                      type="button"
                      variant="outline" 
                      className="w-full text-xs h-9 rounded-lg border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      onClick={() => setShowPasswordInput(true)}
                    >
                      Change User Password
                    </Button>
                  </div>
                ) : (
                  /* Password Input Field */
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">New Password</Label>
                      <button 
                        type="button"
                        onClick={() => {
                          setShowPasswordInput(false);
                          setFormData((prev) => ({ ...prev, password: "" }));
                        }} 
                        className="text-xs text-red-500 hover:underline cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    <Input 
                      type="password"
                      placeholder="Enter new password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl h-11"
                    />
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-start gap-2 pt-4 items-center border-t border-neutral-200 dark:border-neutral-800/60 mt-2">
                <Button 
                  className="font-bold h-11 px-8 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 transition-all"
                  onClick={handleUpdate} 
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  className="border-neutral-200 dark:border-neutral-800 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-white px-6 h-11 rounded-xl ml-auto" 
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