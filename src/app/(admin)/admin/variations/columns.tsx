"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, Loader2, MoreVertical, GripVertical } from "lucide-react";
import { useState, useEffect } from "react";
import React from "react";
import { showToast } from "@/lib/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export type Variation = {
  id: string;
  productId: string;
  productName?: string;
  title: string;
  amount?: number;
  price: number;
  offerPrice: number | null;
  bonus: number;
  stock: number;
  image?: string | null;
  status: string;
  sortOrder?: number;
};

const StatusSwitchCell = ({ row }: { row: { original: Variation } }) => {
  const variation = row.original;
  const [isActive, setIsActive] = useState<boolean>(
    variation.status === "ON" || variation.status === "ACTIVE"
  );
  const [isChanging, setIsChanging] = useState(false);

  const handleStatusChange = async (checked: boolean) => {
    setIsChanging(true);
    const toastId = showToast.loading("Updating status...");

    try {
      const response = await fetch("/api/variation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: variation.id, 
          productId: variation.productId,
          title: variation.title,
          price: variation.price,
          status: checked ? "ON" : "OFF" 
        }),
      });

      if (!response.ok) throw new Error();

      setIsActive(checked);
      showToast.dismiss(toastId);
      showToast.success(`Status updated to ${checked ? "ON" : "OFF"}`);
    } catch {
      showToast.dismiss(toastId);
      showToast.error("Failed to update status");
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="flex items-center gap-2 justify-center">
      <Switch
        checked={isActive}
        disabled={isChanging}
        onCheckedChange={handleStatusChange}
        className="data-[state=checked]:bg-primary"
      />
      <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? "text-neutral-900 dark:text-white" : "text-neutral-500"}`}>
        {isActive ? "ON" : "OFF"}
      </span>
    </div>
  );
};

export const columns: ColumnDef<Variation>[] = [
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
    accessorKey: "productName",
    header: "Product Name",
    cell: ({ row }) => (
      <span className="font-bold text-neutral-500 dark:text-neutral-400 text-xs tracking-wide uppercase">
        {row.original.productName || "N/A"}
      </span>
    ),
    size: 150,
  },
  {
    accessorKey: "title",
    header: "Variation Title",
    cell: ({ row }) => (
      <span className="font-bold text-neutral-900 dark:text-neutral-100">{row.original.title}</span>
    ),
    size: 160,
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <span className="font-semibold text-neutral-800 dark:text-neutral-200">{row.original.price} ৳</span>
    ),
    size: 100,
  },
  {
    accessorKey: "offerPrice",
    header: "Offer Price",
    cell: ({ row }) => (
      <span className="text-neutral-600 dark:text-neutral-400 font-medium">
        {row.original.offerPrice ? `${row.original.offerPrice} ৳` : "—"}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusSwitchCell row={row} />,
    size: 120,
  },
  {
    id: "actions",
    header: () => <div className="text-right pr-4">Actions</div>,
    cell: ({ row, table }) => {
      const variation = row.original;
      const meta = table.options.meta as any;
      const productDropdownList: any[] = meta?.products || [];
      
      const [openEdit, setOpenEdit] = useState(false);
      const [loading, setLoading] = useState(false);
      
      const [hasDiscount, setHasDiscount] = useState(false);
      const [resellerPrice, setResellerPrice] = useState<number | string>(0);

      const [formData, setFormData] = useState({
        productId: "",
        title: "",
        price: "",
        discountPrice: "",
        bonus: "",
        stock: ""
      });

      useEffect(() => {
        if (openEdit && variation) {
          const holdsDiscount = variation.offerPrice !== undefined && variation.offerPrice !== null && variation.offerPrice > 0;
          
          setFormData({
            productId: variation.productId || "",
            title: variation.title || "",
            price: variation.price !== undefined && variation.price !== null ? String(variation.price) : "",
            discountPrice: holdsDiscount ? String(variation.offerPrice) : "",
            bonus: variation.bonus !== undefined && variation.bonus !== null ? String(variation.bonus) : "",
            stock: variation.stock !== undefined && variation.stock !== null ? String(variation.stock) : ""
          });
          setHasDiscount(holdsDiscount);
        }
      }, [openEdit, variation]);

      const selectedProduct = productDropdownList.find((p: any) => p.id === formData.productId);
      
      // 🎯 Voucher এবং FreeFire Auto ২টির জন্যই স্টক ফিল্ড হাইড করার লজিক
      const isAutoDelivery = 
        selectedProduct?.productType?.toUpperCase() === "VOUCHER" || 
        selectedProduct?.isFreeFireAuto === true;

      useEffect(() => {
        const percentage = selectedProduct?.resellerPercentage ?? 0;
        const currentPrice = parseFloat(formData.price);

        if (!formData.price || isNaN(currentPrice)) {
          setResellerPrice(0);
          return;
        }

        const calculatedResellerPrice = currentPrice - (currentPrice * (percentage / 100));
        setResellerPrice(calculatedResellerPrice.toFixed(2));
      }, [formData.price, formData.productId, productDropdownList, selectedProduct]);

      const handleUpdate = async () => {
        if (!formData.productId || !formData.title || !formData.price) {
          return showToast.error("Product, Title, and Price are required!");
        }
        
        // অটো ডেলিভারি না হলে অবশ্যই স্টকের মান প্রদান করতে হবে
        if (!isAutoDelivery && formData.stock === "") {
          return showToast.error("Stock field is required for this product type!");
        }

        setLoading(true);
        const toastId = showToast.loading("Updating variation...");

        try {
          const finalOfferPrice = hasDiscount && formData.discountPrice ? parseFloat(formData.discountPrice) : null;

          const response = await fetch('/api/variation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              id: variation.id, 
              productId: formData.productId,
              title: formData.title.trim(),
              price: parseFloat(formData.price),
              offerPrice: finalOfferPrice,
              bonus: formData.bonus !== "" ? parseInt(formData.bonus) : 0,
              stock: !isAutoDelivery && formData.stock !== "" ? parseInt(formData.stock) : 0,
              status: variation.status || "ON"
            }),
          });
          
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Update failed");
          
          showToast.dismiss(toastId);
          showToast.success("Variation updated successfully!");
          setOpenEdit(false);
          window.location.reload();
        } catch (error: any) {
          showToast.dismiss(toastId);
          showToast.error(error.message || "Something went wrong!");
        } finally {
          setLoading(false);
        }
      };

      const getDiscountHint = () => {
        const currentPrice = parseFloat(formData.price);
        if (!formData.price || isNaN(currentPrice)) return "e.g., 80";
        return `e.g., ${currentPrice - 20}`;
      };

      return (
        <div className="text-right pr-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-neutral-100 dark:hover:bg-neutral-800 shadow-none">
                <MoreVertical className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 shadow-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white">
              <DropdownMenuItem onClick={() => setOpenEdit(true)} className="gap-2 cursor-pointer font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900">
                <Pencil className="h-3.5 w-3.5" /> Edit Variation
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-800" />
              
              <DropdownMenuItem 
                onClick={() => {
                  if (meta?.setDeleteTarget && meta?.setIsAlertOpen) {
                    meta.setDeleteTarget({ isBulk: false, id: variation.id, name: variation.title });
                    meta.setIsAlertOpen(true);
                  }
                }} 
                className="gap-2 text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 cursor-pointer font-medium hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* এডিট ডায়ালগ */}
          <Dialog open={openEdit} onOpenChange={setOpenEdit}>
            <DialogContent className="bg-white dark:bg-[#121212] border-neutral-200 dark:border-neutral-950 text-neutral-900 dark:text-white max-w-[92%] sm:max-w-[450px] p-5 sm:p-6 rounded-2xl text-left shadow-2xl transition-colors duration-200">
              <DialogHeader>
                <DialogTitle className="mt-1 mb-2 sm:mb-4 text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">Edit Variation</DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-3 sm:gap-4 py-1">
                {/* ১. প্রোডাক্ট সিলেক্ট */}
                <div className="space-y-1.5">
                  <Label className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-200">Select Product</Label>
                  <Select 
                    value={formData.productId} 
                    onValueChange={(val) => setFormData({...formData, productId: val, stock: ""})}
                  >
                    <SelectTrigger className="bg-transparent border-neutral-200 dark:border-neutral-800 focus:ring-neutral-400 dark:focus:ring-neutral-700 rounded-xl text-neutral-900 dark:text-white h-9 sm:h-11 text-xs sm:text-sm shadow-none">
                      <SelectValue placeholder="Choose a product" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#121212] border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white max-h-[200px]">
                      {productDropdownList.map((product: any) => (
                        <SelectItem key={product.id} value={product.id} className="cursor-pointer focus:bg-neutral-100 dark:focus:bg-neutral-800 text-neutral-900 dark:text-white text-xs sm:text-sm">
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* ২. ভেরিয়েশন টাইটেল */}
                <div className="space-y-1.5">
                  <Label className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-200">Variation Title</Label>
                  <Input 
                    placeholder="e.g., 240 DIAMOND"
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="bg-transparent border-neutral-200 dark:border-neutral-800 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-700 rounded-xl text-neutral-900 dark:text-white h-9 sm:h-11 text-xs sm:text-sm shadow-none"
                  />
                </div>

                {/* ৩. প্রাইস (BDT) এবং রেসেলার প্রাইস */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-200">Price (BDT)</Label>
                    <Input 
                      type="number"
                      step="any"
                      placeholder="e.g., 100"
                      value={formData.price} 
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="bg-transparent border-neutral-200 dark:border-neutral-800 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-700 rounded-xl text-neutral-900 dark:text-white h-9 sm:h-11 text-xs sm:text-sm shadow-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm font-medium text-neutral-400 dark:text-neutral-500">Reseller Price</Label>
                    <Input 
                      disabled
                      value={resellerPrice ? `${resellerPrice} TK` : "0 TK"} 
                      className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-xl h-9 sm:h-11 text-xs sm:text-sm cursor-not-allowed select-none font-medium shadow-none"
                    />
                  </div>
                </div>

                {/* ৪. বোনাস ফিল্ড */}
                <div className="space-y-1.5">
                  <Label className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-200">Bonus (Optional)</Label>
                  <Input 
                    type="number"
                    placeholder="e.g., 5"
                    value={formData.bonus ?? ""} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({...formData, bonus: val === "" ? "" : val});
                    }}
                    className="bg-transparent border-neutral-200 dark:border-neutral-800 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-700 rounded-xl text-neutral-900 dark:text-white h-9 sm:h-11 text-xs sm:text-sm w-full shadow-none"
                  />
                </div>

                {/* ৫. স্টক ইনপুট ফিল্ড (অটো ডেলিভারি বা ভাউচার প্রোডাক্ট না হলে দেখাবে) */}
                {formData.productId && !isAutoDelivery && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <Label className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-200 flex items-center gap-1">
                      Stock <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      type="number"
                      placeholder="e.g., 50"
                      value={formData.stock ?? ""} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({...formData, stock: val === "" ? "" : val});
                      }}
                      className="bg-transparent border-neutral-200 dark:border-neutral-800 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-700 rounded-xl text-neutral-900 dark:text-white h-9 sm:h-11 text-xs sm:text-sm w-full shadow-none"
                    />
                  </div>
                )}

                {/* ৬. ডিসকাউন্ট সুইচ বার */}
                <div className="flex items-center justify-between py-1 px-1">
                  <Label htmlFor="edit-discount-mode" className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-200 cursor-pointer">DISCOUNT</Label>
                  <Switch 
                    id="edit-discount-mode"
                    checked={hasDiscount}
                    onCheckedChange={(checked) => {
                      setHasDiscount(checked);
                      if (!checked) setFormData({...formData, discountPrice: ""});
                    }}
                    className="data-[state=checked]:bg-neutral-900 dark:data-[state=checked]:bg-white data-[state=unchecked]:bg-neutral-200 dark:data-[state=unchecked]:bg-neutral-800 scale-90 sm:scale-100"
                  />
                </div>

                {/* ডিসকাউন্ট ইনপুট ফিল্ড */}
                {hasDiscount && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <Label className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-200">DISCOUNT PRICE</Label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs sm:text-sm font-medium text-red-500 line-through select-none">
                        {formData.price ? `${formData.price} tk` : "0 tk"}
                      </span>
                      
                      <div className="absolute left-[65px] sm:left-[75px] h-4 sm:h-5 w-[1px] bg-red-600/40" />

                      <Input 
                        type="number"
                        step="any"
                        placeholder={getDiscountHint()}
                        value={formData.discountPrice} 
                        onChange={(e) => setFormData({...formData, discountPrice: e.target.value})}
                        className="bg-transparent border-neutral-200 dark:border-neutral-800 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-700 rounded-xl placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-neutral-900 dark:text-white h-9 sm:h-11 text-xs sm:text-sm w-full pl-[80px] sm:pl-[95px] shadow-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* অ্যাকশন বাটনসমূহ */}
              <div className="flex justify-start gap-2 pt-4 sm:pt-6 items-center">
                <Button 
                  type="button" 
                  onClick={handleUpdate} 
                  disabled={loading} 
                  className="h-9 sm:h-10 px-4 sm:px-5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 font-semibold text-xs sm:text-sm transition-colors shadow-none"
                >
                  {loading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />} Save Changes
                </Button>
                
                <Button 
                  variant="outline" 
                  type="button" 
                  className="border-neutral-200 dark:border-neutral-800 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 hover:text-neutral-900 dark:hover:text-white ml-auto rounded-full h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm shadow-none" 
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