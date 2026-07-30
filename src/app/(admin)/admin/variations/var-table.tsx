"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { columns } from "./columns"
import { toast, Toaster } from "react-hot-toast"
import { 
  Trash2, 
  AlertTriangle, 
  Loader2, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from "lucide-react"

import { AddVariationDialog } from "@/components/AddVariationDialog" 
import { Switch } from "@/components/ui/switch" 

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// 📌 নাম্বার ইনপুটের আপ-ডাউন কুৎসিত অ্যারো হাইড করার গ্লোবাল স্টাইল
const inputNumberClass = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

// ========================================================
// 🟢 ১. EDIT VARIATION DIALOG COMPONENT (Fixed Stock, Discount & Spinners)
// ========================================================
interface EditVariationDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  products: { id: string; name: string; resellerPercentage?: number; productType?: string | null }[]
  variationData: any | null
  onUpdateSuccess: (updatedVariation: any) => void
}

function EditVariationDialog({
  open,
  setOpen,
  products,
  variationData,
  onUpdateSuccess,
}: EditVariationDialogProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // ফর্ম স্টেটসমূহ
  const [productId, setProductId] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [price, setPrice] = React.useState("")
  const [resellerPrice, setResellerPrice] = React.useState<number | string>(0)
  const [bonus, setBonus] = React.useState("")
  const [stock, setStock] = React.useState("") // 👈 নতুন স্টক স্টেট যুক্ত করা হয়েছে
  const [hasDiscount, setHasDiscount] = React.useState(false)
  const [offerPrice, setOfferPrice] = React.useState("")

  // ডায়ালগ ওপেন হলে সিলেক্টেড রো এর ডেটা ফর্মে সেট করা
  React.useEffect(() => {
    if (variationData && open) {
      const holdsDiscount = variationData.offerPrice !== undefined && variationData.offerPrice !== null && variationData.offerPrice > 0;
      
      setProductId(variationData.productId || "")
      setTitle(variationData.title || "")
      setPrice(variationData.price ? String(variationData.price) : "")
      
      // জিরো বা ফাকা ডাটা থাকলে প্লেসহোল্ডার দেখানোর জন্য ক্লিন কন্ডিশন
      setBonus(variationData.bonus && variationData.bonus > 0 ? String(variationData.bonus) : "")
      setStock(variationData.stock && variationData.stock > 0 ? String(variationData.stock) : "")
      
      setHasDiscount(holdsDiscount)
      setOfferPrice(holdsDiscount ? String(variationData.offerPrice) : "")
    }
  }, [variationData, open])

  // কারেন্ট সিলেক্টেড প্রোডাক্ট টাইপ রিড করা
  const selectedProduct = products.find(p => p.id === productId);
  const isVoucherType = selectedProduct?.productType?.toUpperCase() === "VOUCHER";

  // ডাইনামিক রেসেলার প্রাইস ক্যালকুলেশন
  React.useEffect(() => {
    const percentage = selectedProduct?.resellerPercentage ?? 0;
    const currentPrice = parseFloat(price);

    if (!price || isNaN(currentPrice)) {
      setResellerPrice(0);
      return;
    }

    const calculatedResellerPrice = currentPrice - (currentPrice * (percentage / 100));
    setResellerPrice(calculatedResellerPrice.toFixed(2));
  }, [price, productId, products, selectedProduct]);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productId || !title || !price) {
      toast.error("Product, Title, and Price are required!")
      return
    }

    // ভাউচার না হলে স্টক ফিল্ড ভ্যালিডেশন ম্যান্ডেটরি
    if (!isVoucherType && stock === "") {
      toast.error("Stock field is required for this product type!")
      return
    }

    setIsSubmitting(true)
    try {
      const finalOfferPrice = hasDiscount && offerPrice ? parseFloat(offerPrice) : null;

      const response = await fetch(`/api/variation/${variationData?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          title: title.trim(),
          price: Number(price),
          bonus: bonus !== "" ? Number(bonus) : 0,
          stock: !isVoucherType && stock !== "" ? Number(stock) : 0, // 👈 ব্যাকএন্ডে স্টক ভ্যালু পাঠানো হচ্ছে
          offerPrice: finalOfferPrice,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to update variation")

      toast.success("Variation updated successfully!")
      onUpdateSuccess(data)
      setOpen(false)
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || "Failed to update variation")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDiscountHint = () => {
    const currentPrice = parseFloat(price);
    if (!price || isNaN(currentPrice)) return "e.g., 80";
    return `e.g., ${currentPrice - 20}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-white dark:bg-[#121212] border-neutral-200 dark:border-neutral-950 text-neutral-900 dark:text-white max-w-[92%] sm:max-w-[450px] p-5 sm:p-6 rounded-2xl shadow-2xl focus:outline-none transition-colors duration-200">
        <DialogHeader>
          <DialogTitle className="mt-1 mb-2 sm:mb-4 text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Edit Variation
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSaveChanges} className="grid gap-3 sm:gap-4 py-1">
          {/* ১. প্রোডাক্ট সিলেক্ট */}
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-200">Select Product</Label>
            <Select value={productId} onValueChange={(val) => { setProductId(val); setStock(""); }}>
              <SelectTrigger className="bg-transparent border-neutral-200 dark:border-neutral-800 focus:ring-neutral-400 dark:focus:ring-neutral-700 rounded-xl text-neutral-900 dark:text-white h-10 sm:h-11 text-xs sm:text-sm shadow-none">
                <SelectValue placeholder="Choose a product" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#121212] border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white max-h-[200px]">
                {products.map((product) => (
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
              type="text"
              placeholder="e.g., 240 DIAMOND"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent border-neutral-200 dark:border-neutral-800 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-700 rounded-xl placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-neutral-900 dark:text-white h-10 sm:h-11 text-xs sm:text-sm shadow-none"
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
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`bg-transparent border-neutral-200 dark:border-neutral-800 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-700 rounded-xl placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-neutral-900 dark:text-white h-10 sm:h-11 text-xs sm:text-sm shadow-none ${inputNumberClass}`}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm font-medium text-neutral-400 dark:text-neutral-500">Reseller Price</Label>
              <Input
                disabled
                value={resellerPrice ? `${resellerPrice} TK` : "0 TK"}
                className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-xl h-10 sm:h-11 text-xs sm:text-sm cursor-not-allowed select-none font-medium shadow-none"
              />
            </div>
          </div>

          {/* ৪. বোনাস ফিল্ড */}
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-200">Bonus (Optional)</Label>
            <Input
              type="number"
              placeholder="e.g., 5"
              value={bonus}
              onChange={(e) => setBonus(e.target.value)}
              className={`bg-transparent border-neutral-200 dark:border-neutral-800 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-700 rounded-xl placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-neutral-900 dark:text-white h-10 sm:h-11 text-xs sm:text-sm w-full shadow-none ${inputNumberClass}`}
            />
          </div>

          {/* 🟢 ৫. স্টক ইনপুট ফিল্ড (কন্ডিশনাল রেন্ডারিং যুক্ত করা হয়েছে) */}
          {productId && !isVoucherType && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <Label className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-200 flex items-center gap-1">
                Stock <span className="text-red-500">*</span>
              </Label>
              <Input 
                type="number"
                placeholder="e.g., 50"
                value={stock} 
                onChange={(e) => setStock(e.target.value)}
                className={`bg-transparent border-neutral-200 dark:border-neutral-800 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-700 rounded-xl placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-neutral-900 dark:text-white h-10 sm:h-11 text-xs sm:text-sm w-full shadow-none ${inputNumberClass}`}
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
                if (!checked) setOfferPrice("");
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
                  {price ? `${price} tk` : "0 tk"}
                </span>
                
                <div className="absolute left-[65px] sm:left-[75px] h-4 sm:h-5 w-[1px] bg-red-500/40" />

                <Input
                  type="number"
                  step="any"
                  placeholder={getDiscountHint()}
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className={`bg-transparent border-neutral-200 dark:border-neutral-800 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-700 rounded-xl placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-neutral-900 dark:text-white h-10 sm:h-11 text-xs sm:text-sm w-full pl-[80px] sm:pl-[95px] shadow-none ${inputNumberClass}`}
                />
              </div>
            </div>
          )}

          {/* অ্যাকশন বাটনসমূহ */}
          <div className="flex justify-start gap-2 pt-4 sm:pt-6 items-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-9 sm:h-10 px-5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5 shadow-md"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />} 
              Save Changes
            </button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-neutral-200 dark:border-neutral-800 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 hover:text-neutral-900 dark:hover:text-white ml-auto rounded-full h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm shadow-none"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ========================================================
// 🟢 ২. MAIN VARTABLE COMPONENT
// ========================================================
interface VarTableProps {
  initialData: any[]
  products: { id: string; name: string; resellerPercentage?: number; productType?: string | null }[]
}

export function VarTable({ initialData, products }: VarTableProps) {
  const router = useRouter()
  const [data, setData] = React.useState<any[]>(initialData)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = React.useState({})
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Add & Edit Dialog States
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [editTargetData, setEditTargetData] = React.useState<any | null>(null)

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  const [isAlertOpen, setIsAlertOpen] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<{ isBulk: boolean; id?: string; name?: string }>({
    isBulk: true,
  })

  const confirmDelete = async () => {
    setIsDeleting(true)
    try {
      if (deleteTarget.isBulk) {
        const selectedIds = table.getSelectedRowModel().rows.map(row => row.original.id)
        
        const deletePromises = selectedIds.map(id => 
          fetch(`/api/variation/${id}`, { method: "DELETE" })
        )
        await Promise.all(deletePromises)

        setData((prev) => prev.filter((item) => !selectedIds.includes(item.id)))
        setRowSelection({})
        toast.success(`${selectedIds.length} variations deleted successfully!`)
      } else {
        const res = await fetch(`/api/variation/${deleteTarget.id}`, {
          method: "DELETE",
        })

        if (!res.ok) throw new Error()

        setData((prev) => prev.filter((item) => item.id !== deleteTarget.id))
        toast.success("Variation deleted successfully!")
      }
      router.refresh()
    } catch {
      toast.error(deleteTarget.isBulk ? "Bulk deletion failed" : "Failed to delete variation")
    } finally {
      setIsDeleting(false)
      setIsAlertOpen(false)
    }
  }

  const handleEditRow = (rowOriginalData: any) => {
    setEditTargetData(rowOriginalData)
    setIsEditDialogOpen(true)
  }

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
      meta: {
      setDeleteTarget,
      setIsAlertOpen,
      products,        // 👈 এখানে টাইপস্ক্রিপ্ট আটকে দিয়েছিল
      handleEditRow,
    } as any,          // 👈 শুধু শেষে 'as any' যোগ করে দিন
  })

  const selectedCount = table.getFilteredSelectedRowModel().rows.length

  const getColumnWidthClass = (id: string) => {
    switch (id) {
      case "drag": return "w-[40px] shrink-0 justify-start"
      case "select": return "w-[50px] shrink-0 justify-start"
      case "productName": return "w-[150px] shrink-0 justify-start text-xs font-mono"
      case "title": return "flex-1 min-w-[160px] shrink-0 justify-start" 
      case "price": return "w-[100px] shrink-0 justify-start" 
      case "offerPrice": return "w-[100px] shrink-0 justify-start" 
      case "status": return "w-[120px] shrink-0 justify-center text-center"
      case "sortOrder": return "w-[100px] shrink-0 justify-center text-center"
      case "actions": return "w-[100px] shrink-0 justify-center text-center"
      default: return "w-auto"
    }
  }

  return (
    <div className="space-y-4 shadow-none w-full">
      
      {/* Top Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <Input
          placeholder="Search variation by title..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="w-full sm:max-w-sm h-11 bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:border-neutral-400 dark:focus:border-neutral-700 rounded-xl shadow-none"
        />
        
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-1 rounded-xl h-11 flex items-center whitespace-nowrap">
            Total Variations: {data.length}
          </span>
          
          <Button 
            onClick={() => setIsAddDialogOpen(true)} 
            className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 font-semibold rounded-xl shadow-none h-11 px-4 gap-2"
          >
            <Plus className="h-4 w-4" /> Add Variation
          </Button>
        </div>
      </div>

      {/* Bulk Delete Bar */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-950/40 bg-red-50 dark:bg-red-950/10 animate-in fade-in slide-in-from-top-1 duration-200 w-full">
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-medium">
            <AlertTriangle className="h-4 w-4" />
            {selectedCount} row(s) selected for deletion
          </div>
          <Button 
            variant="destructive" 
            size="sm" 
            className="h-9 gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-none"
            onClick={() => {
              setDeleteTarget({ isBulk: true })
              setIsAlertOpen(true)
            }}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" /> Delete Selected
          </Button>
        </div>
      )}

      {/* TABLE CONTAINER */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black overflow-x-auto w-full">
        <div className="w-full flex flex-col min-w-max">
          
          {/* Header */}
          <div className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 w-full flex-none">
            {table.getHeaderGroups().map((headerGroup) => (
              <div key={headerGroup.id} className="flex items-center h-12 px-4 w-full">
                {headerGroup.headers.map((header) => (
                  <div 
                    key={header.id} 
                    className={`text-neutral-900 dark:text-white font-semibold text-xs tracking-wide flex items-center shrink-0 ${getColumnWidthClass(header.column.id)}`}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Body */}
          <div className="flex flex-col w-full flex-none">
            {table.getRowModel().rows?.length ? (
              table.getSortedRowModel().rows.map((row) => (
                <div 
                  key={row.id} 
                  data-state={row.getIsSelected() && "selected"}
                  className="flex items-center border-b border-neutral-200 dark:border-neutral-800 last:border-none px-4 py-3 data-[state=selected]:bg-neutral-100/50 dark:data-[state=selected]:bg-neutral-900/30 transition-colors w-full"
                >
                  {row.getVisibleCells().map((cell) => (
                    <div 
                      key={cell.id} 
                      className={`text-sm text-neutral-900 dark:text-neutral-300 font-medium flex items-center shrink-0 ${getColumnWidthClass(cell.column.id)}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="h-24 flex items-center justify-center text-neutral-400 dark:text-neutral-500 text-sm w-full">
                No variations found.
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2 py-4 select-none w-full">
        <div className="flex-1 text-sm text-neutral-500 dark:text-neutral-400">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>

        <div className="flex items-center gap-6 lg:gap-8">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-200">
              Rows per page
            </p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px] bg-transparent border-neutral-200 dark:border-neutral-800 focus:ring-0 focus:ring-offset-0 shadow-none text-neutral-900 dark:text-neutral-100 font-medium rounded-lg">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top" className="bg-white dark:bg-[#121212] border-neutral-200 dark:border-neutral-800">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem 
                    key={pageSize} 
                    value={`${pageSize}`}
                    className="focus:bg-neutral-100 dark:focus:bg-neutral-800 cursor-pointer font-medium"
                  >
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex w-[80px] items-center justify-center text-sm font-semibold text-neutral-900 dark:text-neutral-200">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount() || 1}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex bg-transparent border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 shadow-none rounded-lg"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </Button>

            <Button
              variant="outline"
              className="h-8 w-8 p-0 bg-transparent border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 shadow-none rounded-lg"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </Button>

            <Button
              variant="outline"
              className="h-8 w-8 p-0 bg-transparent border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 shadow-none rounded-lg"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </Button>

            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex bg-transparent border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 shadow-none rounded-lg"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </Button>
          </div>
        </div>
      </div>

      {/* Day / Night Theme Synchronized Dialogs */}
      <AddVariationDialog 
        open={isAddDialogOpen} 
        setOpen={setIsAddDialogOpen} 
        products={products} 
      />

      <EditVariationDialog
        open={isEditDialogOpen}
        setOpen={setIsEditDialogOpen}
        products={products}
        variationData={editTargetData}
        onUpdateSuccess={(updated) => {
          setData(prev => prev.map(item => item.id === updated.id ? updated : item))
        }}
      />

      {/* Dynamic Theme Confirmation Alert Dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="max-w-[400px] shadow-none rounded-xl bg-white dark:bg-[#0c0c0e] border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-neutral-500 dark:text-neutral-400 text-sm">
                      {deleteTarget.isBulk ? (
                        `This action will permanently delete all ${selectedCount} selected products from the database. This cannot be undone.`
                      ) : (
                        <>
                          This action cannot be undone. This will permanently delete product{" "}
                          <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                            "{deleteTarget.name}"
                          </span>.
                        </>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex flex-row items-center justify-end gap-3 sm:space-x-0 mt-2 shadow-none">
                    <AlertDialogCancel className="h-9 sm:mt-0 flex-1 sm:flex-none px-4 shadow-none border-neutral-200 dark:border-neutral-800" disabled={isDeleting}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={(e) => {
                        e.preventDefault()
                        confirmDelete()
                      }}
                      disabled={isDeleting}
                      className="h-9 flex-1 sm:flex-none px-4 bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 shadow-none"
                    >
                      {isDeleting ? (
                        <div className="flex items-center gap-1">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Deleting...
                        </div>
                      ) : (
                        "Continue"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}