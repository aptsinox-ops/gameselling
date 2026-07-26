"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, MoreVertical, Loader2, Check, X, Copy } from "lucide-react";
import React, { useState } from "react";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Order Type Definition
export type Order = {
  id: string;
  receiptNo: string;
  productTitle: string;
  productType: string;
  variationTitle: string;
  totalPrice: number;
  status: string;
  voucherCode?: string;
  inputValues?: any;
  customerName: string;
  createdAt: string | Date;
  quantity?: number;
  bonus?: number;     
  discount?: number;  
  paymentMethod?: string;
  paymentType?: string;
};

// TanStack Table Meta
declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    setDeleteTarget: React.Dispatch<React.SetStateAction<{ isBulk: boolean; id?: string; receiptNo?: string }>>;
    setIsAlertOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setData: React.Dispatch<React.SetStateAction<Order[]>>;
  }
}

const formatDialogDate = (dateVal: any) => {
  if (!dateVal) return "N/A";
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return "N/A";
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// 📋 Reusable Copy Button Component
const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopied(true);
    showToast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="p-1 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded transition-all cursor-pointer text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 flex-shrink-0"
      title="Copy"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
};

export const columns: ColumnDef<Order>[] = [
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
    size: 40,
  },
  
  // ১. রিসিট নং কলাম
  {
    accessorKey: "receiptNo",
    header: "Receipt No",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-bold text-neutral-500 dark:text-neutral-400">
        #{row.original.receiptNo}
      </span>
    ),
    size: 110,
  },

  // ২. ডেডিকেটেড অর্ডার ডিটেইলস বাটন কলাম
  {
    id: "viewDetails",
    header: () => <div className="whitespace-nowrap">Order Details</div>,
    cell: ({ row, table }) => {
      const order = row.original;
      const meta = table.options.meta;
      const router = useRouter();
      const [openDetails, setOpenDetails] = useState(false);
      const [actionLoading, setActionLoading] = useState(false);
      const [vCode, setVCode] = useState(order.voucherCode || "");

      const isVoucher = order.productType?.toLowerCase() === "vouchers" || order.productType?.toLowerCase() === "voucher";
      const currentStatus = order.status?.toLowerCase() || "pending";
      
      const isProcessing = currentStatus === "processing" || currentStatus === "pending" || currentStatus === "proccesing";
      const isComplete = currentStatus === "completed" || currentStatus === "complete" || currentStatus === "compelet";
      const isCancel = currentStatus === "cancelled" || currentStatus === "cancel" || currentStatus === "failed";

      const orderQty = order.quantity || 1; 

      // ⚡ Dynamic Payment Method (Frontend UI Matching)
      const paymentMethod = order.paymentMethod || order.paymentType || "Wallet";

      const handleStatusUpdate = async (targetStatus: string) => {
        setActionLoading(true);
        const toastId = showToast.loading(`Updating order status to ${targetStatus}...`);
        try {
          const res = await fetch("/api/order/update-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              id: order.id, 
              status: targetStatus,
              voucherCode: isVoucher ? vCode : undefined
            }),
          });
          
          const resData = await res.json();

          if (!res.ok) {
            throw new Error(resData.error || "Status update failed on server");
          }
          
          showToast.dismiss(toastId);
          showToast.success(`Order marked as ${targetStatus}`);
          
          if (meta?.setData) {
            meta.setData((prev) =>
              prev.map((item) =>
                item.id === order.id
                  ? { ...item, status: targetStatus, voucherCode: isVoucher ? vCode : item.voucherCode }
                  : item
              )
            );
          }

          setOpenDetails(false);
          router.refresh();
        } catch (err: any) {
          showToast.dismiss(toastId);
          console.error("Client Error:", err);
          showToast.error(err.message || "Failed to update status");
        } finally {
          setActionLoading(false);
        }
      };

      return (
        <div>
          <Button
            onClick={() => setOpenDetails(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold h-7 px-3 rounded-[10px] shadow-none cursor-pointer border-none transition-all whitespace-nowrap"
          >
            View Order details
          </Button>

          {openDetails && (
            <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-stretch sm:justify-end">
              <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
                onClick={() => setOpenDetails(false)}
              />

              <div className="relative z-50 w-full sm:w-[460px] sm:max-w-full bg-white dark:bg-[#121212] border-t border-x sm:border-t-0 sm:border-r-0 sm:border-l border-neutral-200 dark:border-neutral-800 p-5 sm:p-6 rounded-t-3xl sm:rounded-l-2xl sm:rounded-r-none shadow-2xl max-h-[85vh] sm:max-h-full h-auto sm:h-full overflow-y-auto font-sans animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:slide-in-from-right duration-300 text-left flex flex-col justify-between">
                
                <div>
                  <div className="w-12 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto mb-4 sm:hidden" />

                  <div className="pb-3 border-b border-neutral-100 dark:border-neutral-800/60">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                        Order #{order.receiptNo}
                      </h3>
                      <Badge variant="outline" className="uppercase text-[10px] font-bold px-2 py-0.5 border-neutral-300 dark:border-neutral-700">
                        {order.status}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-neutral-400 font-medium mt-1 text-center sm:text-left">
                      Placed on {formatDialogDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 text-xs my-4">
                    <div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">Receipt No.</p>
                      <div className="flex items-center gap-1">
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">{order.receiptNo}</p>
                        <CopyButton text={order.receiptNo} />
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">Customer</p>
                      <div className="flex items-center gap-1 min-w-0">
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{order.customerName}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">Total Payment</p>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">{order.totalPrice} BDT</p>
                    </div>

                    <div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">Item</p>
                      <div className="flex items-center gap-1 min-w-0">
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{order.variationTitle}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">Bonus</p>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">{order.bonus ?? 0}</p>
                    </div>

                    <div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">Discount</p>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">{order.discount ?? 0} BDT</p>
                    </div>

                    <div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">Quantity</p>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">{orderQty}</p>
                    </div>

                    {/* ⚡ Dynamic Payment Type Field */}
                    <div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">Payment Type</p>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100 capitalize">
                        {paymentMethod}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">Date</p>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">{formatDialogDate(order.createdAt)}</p>
                    </div>
                  </div>

                  {!isVoucher && order.inputValues && typeof order.inputValues === "object" && Object.keys(order.inputValues).length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">User Input Details</h4>
                      <div className="space-y-2">
                        {Object.entries(order.inputValues).map(([key, value]) => {
                          const cleanLabel = key
                            .replace(/^enter[_\s-]*/i, "")
                            .replace(/_/g, " ")
                            .replace(/-/g, " ");

                          return (
                            <div 
                              key={key} 
                              className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider truncate">
                                  {cleanLabel}
                                </p>
                                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 break-all mt-0.5">
                                  {String(value)}
                                </p>
                              </div>
                              <CopyButton text={String(value)} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {isVoucher && (
                    <div className="mt-2 space-y-2 font-sans">
                      {isComplete ? (
                        <div className="space-y-1 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                          <Label className="text-[11px] font-bold text-neutral-400">Voucher Code</Label>
                          <div className="flex items-center justify-between">
                            <p className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400 select-all">
                              {order.voucherCode || "NO CODE DELIVERED"}
                            </p>
                            {order.voucherCode && <CopyButton text={order.voucherCode} />}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Enter Voucher Code</Label>
                          <Input
                            placeholder="Enter Voucher Code"
                            value={vCode}
                            disabled={isCancel || actionLoading}
                            onChange={(e) => setVCode(e.target.value)}
                            className="bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl h-10 font-mono text-xs focus-visible:ring-1"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <hr className="border-neutral-200 dark:border-neutral-800/80 mb-3" />
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 w-full">
                      {(isProcessing || isCancel) && (
                        <Button
                          disabled={actionLoading}
                          onClick={() => handleStatusUpdate("Completed")}
                          className="flex-1 bg-[#00a651] hover:bg-emerald-700 text-white font-bold h-10 rounded-xl shadow-none cursor-pointer text-xs sm:text-sm"
                        >
                          {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Complete Order"}
                        </Button>
                      )}

                      {(isProcessing || isComplete) && (
                        <Button
                          disabled={actionLoading}
                          onClick={() => handleStatusUpdate("Cancelled")}
                          variant="outline"
                          className="flex-1 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold h-10 rounded-xl shadow-none cursor-pointer text-xs sm:text-sm"
                        >
                          {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel Order"}
                        </Button>
                      )}

                      {((!isVoucher && (isComplete || isCancel)) || (isVoucher && (isComplete || isCancel))) && (
                        <Button
                          disabled={actionLoading}
                          onClick={() => {
                            if (meta) {
                              setOpenDetails(false);
                              meta.setDeleteTarget({ isBulk: false, id: order.id, receiptNo: order.receiptNo });
                              meta.setIsAlertOpen(true);
                            }
                          }}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold h-10 rounded-xl shadow-none cursor-pointer text-xs sm:text-sm gap-1.5"
                        >
                          <Trash2 className="h-4 w-4" /> Delete Order
                        </Button>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      onClick={() => setOpenDetails(false)}
                      className="w-full text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-bold h-9 rounded-xl shadow-none cursor-pointer text-xs sm:text-sm"
                    >
                      Close
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      );
    },
    size: 160,
  },

  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => (
      <span className="font-medium text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
        {row.original.customerName}
      </span>
    ),
    size: 140,
  },

  {
    accessorKey: "productTitle",
    header: "Product Item",
    cell: ({ row }) => {
      const pTitle = row.original.productTitle;
      const hasValidTitle = pTitle && pTitle !== "—";
      const qty = row.original.quantity || 1; 

      return (
        <div className="flex flex-col max-w-[280px]">
          {hasValidTitle && (
            <span className="font-bold text-neutral-900 dark:text-neutral-100 truncate leading-tight">
              {pTitle}
            </span>
          )}
          <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
            {row.original.variationTitle}{qty > 1 ? ` x${qty}` : ""} • {row.original.productType}
          </span>
        </div>
      );
    },
    size: 220,
  },

  {
    accessorKey: "bonus",
    header: "Bonus",
    cell: ({ row }) => {
      const bonusVal = row.original.bonus ?? 0;
      return <div className="font-medium text-neutral-700 dark:text-neutral-300 whitespace-nowrap">{bonusVal}</div>;
    },
    size: 80,
  },

  {
    accessorKey: "discount",
    header: "Discount",
    cell: ({ row }) => {
      const discountVal = row.original.discount ?? 0;
      return <div className="font-bold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">৳{discountVal}</div>;
    },
    size: 90,
  },

  {
    accessorKey: "totalPrice",
    header: "Total Pay",
    cell: ({ row }) => {
      const amount = parseFloat(String(row.getValue("totalPrice") || "0"));
      return <div className="font-bold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">৳{amount.toLocaleString()}</div>;
    },
    size: 110,
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status?.toLowerCase() || "pending";
      
      let badgeClass = "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400";
      if (status === "completed" || status === "complete" || status === "compelet") {
        badgeClass = "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400";
      } else if (status === "cancelled" || status === "cancel" || status === "failed") {
        badgeClass = "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400";
      }

      return (
        <Badge 
          variant="secondary" 
          className={`font-bold uppercase text-[10px] px-2.5 py-1 border-none shadow-none rounded-full w-fit whitespace-nowrap ${badgeClass}`}
        >
          {row.original.status}
        </Badge>
      );
    },
    size: 120,
  },

  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const dateVal = row.original.createdAt;
      const displayDate = dateVal instanceof Date ? dateVal.toLocaleDateString("en-GB") : String(dateVal).split("T")[0];
      return (
        <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium whitespace-nowrap">
          {displayDate}
        </span>
      );
    },
    size: 110,
  },

  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row, table }) => {
      const order = row.original;
      const meta = table.options.meta;
      const router = useRouter();
      const [loading, setLoading] = useState(false);

      const currentStatus = order.status?.toLowerCase() || "pending";
      const isComplete = currentStatus === "completed" || currentStatus === "complete" || currentStatus === "compelet";
      const isCancel = currentStatus === "cancelled" || currentStatus === "cancel" || currentStatus === "failed";
      const isProcessing = !isComplete && !isCancel;

      const handleStatusUpdate = async (targetStatus: string) => {
        setLoading(true);
        const toastId = showToast.loading(`Updating order status to ${targetStatus}...`);
        try {
          const res = await fetch("/api/order/update-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: order.id, status: targetStatus }),
          });

          const resData = await res.json();
          if (!res.ok) throw new Error(resData.error || "Failed to update status");

          showToast.dismiss(toastId);
          showToast.success(`Order marked as ${targetStatus}`);
          if (meta?.setData) {
            meta.setData((prev) =>
              prev.map((item) => (item.id === order.id ? { ...item, status: targetStatus } : item))
            );
          }
          router.refresh();
        } catch (err: any) {
          showToast.dismiss(toastId);
          showToast.error(err.message || "Something went wrong");
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-neutral-100 dark:hover:bg-neutral-800 shadow-none cursor-pointer">
                <MoreVertical className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 shadow-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 rounded-xl p-1 space-y-0.5">
              
              {(isProcessing || isCancel) && (
                <DropdownMenuItem 
                  disabled={loading}
                  onClick={() => handleStatusUpdate("Completed")} 
                  className="gap-2 text-green-600 focus:text-green-600 dark:text-green-400 dark:focus:text-green-400 cursor-pointer font-semibold hover:bg-green-50 dark:hover:bg-green-950/20 rounded-lg"
                >
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Complete Order
                </DropdownMenuItem>
              )}

              {(isProcessing || isComplete) && (
                <DropdownMenuItem 
                  disabled={loading}
                  onClick={() => handleStatusUpdate("Cancelled")} 
                  className="gap-2 text-red-500 focus:text-red-500 dark:text-red-400 dark:focus:text-red-400 cursor-pointer font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                >
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />} Cancel Order
                </DropdownMenuItem>
              )}

              <hr className="border-neutral-200 dark:border-neutral-800/60 my-1" />

              <DropdownMenuItem 
                disabled={loading}
                onClick={() => {
                  if (meta) {
                    meta.setDeleteTarget({ isBulk: false, id: order.id, receiptNo: order.receiptNo });
                    meta.setIsAlertOpen(true);
                  }
                }} 
                className="gap-2 text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 cursor-pointer font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Order
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    size: 60,
  },
];