"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { toast } from "sonner"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  CircleCheckIcon, 
  EllipsisVerticalIcon, 
  Columns3Icon, 
  ChevronDownIcon, 
  ChevronsLeftIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ChevronsRightIcon,
  XCircleIcon,
  Trash2Icon,
  RefreshCwIcon,
  Loader2Icon,
  CopyIcon,
  CheckIcon
} from "lucide-react"

// ==========================================
// UNIFIED TOAST DESIGN UTILITY FOR ADMIN
// ==========================================
const appToast = {
  success: (message: string) => {
    toast.success(message, {
      style: {
        background: "#f0fdf4",
        border: "1px solid #bbf7d0",
        color: "#166534",
        fontWeight: "500",
        fontSize: "13px",
      }
    })
  },
  error: (message: string) => {
    toast.error(message, {
      style: {
        background: "#fef2f2",
        border: "1px solid #fecaca",
        color: "#991b1b",
        fontWeight: "500",
        fontSize: "13px",
      }
    })
  },
  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
        color: "#1e40af",
        fontWeight: "500",
        fontSize: "13px",
      }
    })
  },
  dismiss: (id?: string | number) => toast.dismiss(id)
}

export type OrderType = {
  id: string
  receiptNo: string
  userId?: number | string
  user?: { name?: string; email?: string }
  customerName?: string
  productId?: string
  product?: { title?: string; name?: string }
  productTitle?: string
  variationId?: string
  variation?: { title?: string; name?: string }
  variationTitle?: string
  quantity?: number
  bonus?: number
  discount?: number
  totalPay?: number
  totalPrice?: number
  paymentMethod?: string
  paymentType?: string
  payment_type?: string
  status: "PROCESSING" | "COMPLETED" | "CANCELLED" | "PENDING" | string
  inputValues?: Record<string, any>
  voucherCode?: string | null
  createdAt: string | Date
  updatedAt?: string | Date
}

interface OrderTableProps {
  data?: OrderType[]
  initialData?: OrderType[]
  onRefresh?: () => void
}

// Date Formatter: YYYY-MM-DD
const formatDate = (dateVal?: string | Date) => {
  if (!dateVal) return "N/A"
  const date = new Date(dateVal)
  if (isNaN(date.getTime())) return "N/A"
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export default function OrderDataTable({ data: dataProp, initialData, onRefresh }: OrderTableProps) {
  const [data, setData] = React.useState<OrderType[]>(dataProp || initialData || [])
  const [loading, setLoading] = React.useState<boolean>(false)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "createdAt", desc: true }])
  const [globalFilter, setGlobalFilter] = React.useState("")

  const fetchOrdersFromDb = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/order", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to fetch orders")
      const result = await res.json()
      const ordersData = Array.isArray(result) ? result : result.orders || result.data || []
      setData(ordersData)
    } catch (error) {
      appToast.error("Failed to load orders from database")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (dataProp) {
      setData(dataProp)
    } else if (initialData) {
      setData(initialData)
    } else {
      fetchOrdersFromDb()
    }
  }, [dataProp, initialData, fetchOrdersFromDb])

  const handleManualRefresh = async () => {
    if (onRefresh) {
      onRefresh()
    }
    await fetchOrdersFromDb()
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const loadingToast = appToast.loading(`Updating status to ${newStatus}...`)
    try {
      const res = await fetch("/api/order/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      })

      if (!res.ok) throw new Error("Failed to update status")

      appToast.dismiss(loadingToast)
      appToast.success(`Order status updated to ${newStatus}`)
      setData((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      )
      if (onRefresh) onRefresh()
    } catch (error) {
      appToast.dismiss(loadingToast)
      appToast.error("Failed to update status")
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return

    const loadingToast = appToast.loading("Deleting order...")
    try {
      const res = await fetch("/api/order/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId }),
      })

      if (!res.ok) throw new Error("Failed to delete order")

      appToast.dismiss(loadingToast)
      appToast.success("Order deleted successfully")
      setData((prev) => prev.filter((order) => order.id !== orderId))
      if (onRefresh) onRefresh()
    } catch (error) {
      appToast.dismiss(loadingToast)
      appToast.error("Failed to delete order")
    }
  }

  const handleBulkDelete = async () => {
    const selectedRows = table.getSelectedRowModel().rows
    const selectedIds = selectedRows.map((r) => r.original.id)
    if (!selectedIds.length) return

    if (!confirm(`Are you sure you want to delete ${selectedIds.length} order(s)?`)) return

    const loadingToast = appToast.loading(`Deleting ${selectedIds.length} order(s)...`)
    try {
      const res = await fetch("/api/order/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      })

      if (!res.ok) throw new Error("Failed to delete selected orders")

      appToast.dismiss(loadingToast)
      appToast.success("Selected orders deleted")
      setData((prev) => prev.filter((order) => !selectedIds.includes(order.id)))
      setRowSelection({})
      if (onRefresh) onRefresh()
    } catch (error) {
      appToast.dismiss(loadingToast)
      appToast.error("Failed to delete selected orders")
    }
  }

  const columns: ColumnDef<OrderType>[] = [
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
          className="rounded border-gray-300 dark:border-neutral-700"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="rounded border-gray-300 dark:border-neutral-700"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "receiptNo",
      header: "Receipt No",
      cell: ({ row }) => (
        <span className="font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap text-xs">
          #{row.original.receiptNo || row.original.id}
        </span>
      ),
    },
    {
      id: "orderDetails",
      header: "Order Details",
      cell: ({ row }) => (
        <OrderDetailsDrawer
          order={row.original}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDeleteOrder}
        />
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => {
        const name = row.original.customerName || row.original.user?.name || row.original.user?.email || `User #${row.original.userId || "N/A"}`
        return <span className="font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap text-xs">{name}</span>
      },
    },
    {
      id: "product",
      header: "Product Item",
      cell: ({ row }) => {
        const prod = row.original.productTitle || row.original.product?.title || row.original.product?.name || "Product"
        const varTitle = row.original.variationTitle || row.original.variation?.title || row.original.variation?.name
        return (
          <span className="text-gray-600 dark:text-gray-400 text-xs">
            {varTitle ? `${varTitle} • ${prod}` : prod}
          </span>
        )
      },
    },
    {
      accessorKey: "bonus",
      header: "Bonus",
      cell: ({ row }) => <span className="text-xs text-gray-700 dark:text-gray-300">{row.original.bonus ?? 0}</span>,
    },
    {
      accessorKey: "discount",
      header: "Discount",
      cell: ({ row }) => <span className="text-xs text-gray-700 dark:text-gray-300">৳{row.original.discount ?? 0}</span>,
    },
    {
      accessorKey: "totalPay",
      header: "Total Pay",
      cell: ({ row }) => (
        <span className="font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap text-xs">
          ৳{row.original.totalPrice ?? row.original.totalPay ?? 0}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = (row.original.status || "PROCESSING").toUpperCase()
        const isCompleted = status === "COMPLETED" || status === "CONFIRMED" || status === "DONE"
        const isProcessing = status === "PROCESSING" || status === "PENDING" || status === "IN PROCESS"

        return (
          <Badge
            variant="secondary"
            className={`font-semibold text-[10px] px-2 py-0.5 rounded-full uppercase border-0 whitespace-nowrap ${
              isCompleted
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                : isProcessing
                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
            }`}
          >
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const order = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0 text-gray-500 dark:text-gray-400 hover:text-foreground dark:hover:text-white">
                <EllipsisVerticalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "COMPLETED")}>
                <CircleCheckIcon className="mr-2 size-4 text-emerald-500" /> Complete
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "CANCELLED")}>
                <XCircleIcon className="mr-2 size-4 text-rose-500" /> Cancel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-rose-600 focus:text-rose-600 cursor-pointer"
                onClick={() => handleDeleteOrder(order.id)}
              >
                <Trash2Icon className="mr-2 size-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const selectedCount = table.getFilteredSelectedRowModel().rows.length

  return (
    <div className="w-full max-w-full shadow-none mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Search & Top Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Input
            placeholder="Search orders by Receipt No..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="h-9 text-xs bg-gray-50/50 dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 focus-visible:ring-1"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {selectedCount > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              className="h-9 gap-1.5 text-xs"
              onClick={handleBulkDelete}
            >
              <Trash2Icon className="size-3.5" />
              Delete ({selectedCount})
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-xs border-gray-200 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-gray-200">
                <Columns3Icon className="mr-1.5 size-3.5" />
                Columns
                <ChevronDownIcon className="ml-1.5 size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 max-h-80 overflow-y-auto">
              <DropdownMenuLabel className="text-xs">Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize text-xs"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 px-3 text-xs gap-1.5 border-gray-200 dark:border-neutral-800 dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800 dark:text-gray-200"
            onClick={handleManualRefresh}
            disabled={loading}
          >
            <RefreshCwIcon className={`size-3.5 ${loading ? "animate-spin text-blue-600 dark:text-blue-400" : ""}`} />
            Refresh
          </Button>

          <div className="h-9 px-4 bg-gray-100/80 dark:bg-neutral-900 font-medium text-xs text-gray-700 dark:text-gray-300 rounded-lg flex items-center justify-center whitespace-nowrap border border-gray-200/80 dark:border-neutral-800">
            Total Orders: {table.getFilteredRowModel().rows.length}
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="rounded-xl border border-border dark:border-neutral-800 bg-card overflow-x-auto shadow-xs">
        <Table>
          <TableHeader className="bg-gray-50/60 dark:bg-neutral-900/60">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-b dark:border-neutral-800">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-bold text-gray-800 dark:text-gray-200 text-xs py-3.5 whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
                    <Loader2Icon className="size-4 animate-spin text-blue-600 dark:text-blue-400" />
                    <span>Loading orders from database...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-gray-50/40 dark:hover:bg-neutral-900/50 border-b dark:border-neutral-800">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 text-xs">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-xs text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
        <div className="text-xs text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Label htmlFor="rows-per-page" className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-16 text-xs dark:border-neutral-800 dark:bg-neutral-900" id="rows-per-page">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectGroup>
                  {[10, 20, 30, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`} className="text-xs">
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-7 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeftIcon className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-7 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeftIcon className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-7 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRightIcon className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-7 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRightIcon className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Order Details Drawer Component
function OrderDetailsDrawer({
  order,
  onUpdateStatus,
  onDelete,
}: {
  order: OrderType
  onUpdateStatus: (id: string, status: string) => void
  onDelete: (id: string) => void
}) {
  const isMobile = useIsMobile()
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null)

  const customerName = order.customerName || order.user?.name || order.user?.email || `User #${order.userId || "N/A"}`
  const itemTitle = order.variationTitle || order.variation?.title || order.productTitle || order.product?.title || "Product Item"

  // Status check variables
  const status = (order.status || "PROCESSING").toUpperCase()
  const isCompleted = status === "COMPLETED" || status === "CONFIRMED" || status === "DONE"
  const isCancelled = status === "CANCELLED" || status === "CANCELED"

  // Helper function to remove "enter" or "Enter" from field keys
  const formatInputLabel = (label: string) => {
    return label
      .replace(/^enter[\s_]*/i, "")
      .replace(/_/g, " ")
      .trim()
  }

  // Handle Copy function
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    appToast.success("Copied to clipboard!")
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Priority check for paymentMethod field
  const rawPaymentMethod =
    order.paymentMethod ||
    order.paymentType ||
    order.payment_type ||
    "N/A"

  const formattedPaymentMethod = rawPaymentMethod.toUpperCase()

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-2.5 py-1 text-[11px] h-7 shadow-none whitespace-nowrap">
          View Order details
        </Button>
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader className="border-b dark:border-neutral-800 pb-3">
          <DrawerTitle className="flex items-center justify-between text-base">
            <span>Order #{order.receiptNo || order.id}</span>
            <Badge variant="outline" className="capitalize text-xs dark:border-neutral-700">
              {order.status}
            </Badge>
          </DrawerTitle>
          <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
            Placed on {formatDate(order.createdAt)}
          </p>
        </DrawerHeader>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Main Details Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 p-4 rounded-xl border border-border dark:border-neutral-800 bg-muted/20 text-sm">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Receipt No.</p>
              <p className="font-semibold text-foreground text-xs">{order.receiptNo || order.id}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground font-medium">Customer</p>
              <p className="font-semibold text-foreground text-xs">{customerName}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Payment</p>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                {order.totalPrice ?? order.totalPay ?? 0} BDT
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground font-medium">Item</p>
              <p className="font-semibold text-foreground text-xs">{itemTitle}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground font-medium">Bonus</p>
              <p className="font-semibold text-foreground text-xs">{order.bonus ?? 0}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground font-medium">Discount</p>
              <p className="font-semibold text-foreground text-xs">{order.discount ?? 0} BDT</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground font-medium">Quantity</p>
              <p className="font-semibold text-foreground text-xs">{order.quantity ?? 1}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground font-medium">Payment Method</p>
              <p className="font-semibold text-foreground text-xs uppercase tracking-wide">
                {formattedPaymentMethod}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground font-medium">Date</p>
              <p className="font-semibold text-foreground text-xs">{formatDate(order.createdAt)}</p>
            </div>
          </div>

          {/* Dynamic Input Fields */}
          {order.inputValues && Object.keys(order.inputValues).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-foreground">User Input Details</h4>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(order.inputValues).map(([key, value]) => {
                  const label = formatInputLabel(key)
                  const valStr = String(value ?? "")
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-border dark:border-neutral-800 bg-card shadow-xs"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase truncate">
                          {label}
                        </p>
                        <p className="font-bold text-blue-600 dark:text-blue-400 text-xs truncate select-all mt-0.5">
                          {valStr}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-foreground shrink-0 rounded-md"
                        onClick={() => handleCopy(valStr, key)}
                        title="Copy to clipboard"
                      >
                        {copiedKey === key ? (
                          <CheckIcon className="size-3.5 text-emerald-500" />
                        ) : (
                          <CopyIcon className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Voucher Code Box */}
          {order.voucherCode ? (
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-foreground">Voucher Code</h4>
              <div className="flex items-center justify-between rounded-xl border border-border dark:border-neutral-800 p-3 bg-card ">
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium">VOUCHER CODE</p>
                  <p className="font-mono font-bold text-sm text-primary select-all tracking-wide mt-0.5">
                    {order.voucherCode}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-foreground shrink-0"
                  onClick={() => handleCopy(order.voucherCode!, "voucherCode")}
                >
                  {copiedKey === "voucherCode" ? (
                    <CheckIcon className="size-3.5 text-emerald-500" />
                  ) : (
                    <CopyIcon className="size-3.5" />
                  )}
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Dynamic Action Buttons based on Order Status */}
        <DrawerFooter className="border-t dark:border-neutral-800 gap-2">
          <div className="flex flex-col gap-2 w-full">
            <div className="grid grid-cols-2 gap-2 w-full">
              {isCompleted ? (
                <>
                  <Button
                    variant="outline"
                    className="w-full text-rose-600 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs h-9 font-medium"
                    onClick={() => onUpdateStatus(order.id, "CANCELLED")}
                  >
                    Cancel Order
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full text-xs h-9 font-medium"
                    onClick={() => onDelete(order.id)}
                  >
                    Delete Order
                  </Button>
                </>
              ) : isCancelled ? (
                <>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 font-medium"
                    onClick={() => onUpdateStatus(order.id, "COMPLETED")}
                  >
                    Complete Order
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full text-xs h-9 font-medium"
                    onClick={() => onDelete(order.id)}
                  >
                    Delete Order
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 font-medium"
                    onClick={() => onUpdateStatus(order.id, "COMPLETED")}
                  >
                    Complete Order
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-rose-600 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs h-9 font-medium"
                    onClick={() => onUpdateStatus(order.id, "CANCELLED")}
                  >
                    Cancel Order
                  </Button>
                </>
              )}
            </div>

            <DrawerClose asChild>
              <Button variant="ghost" className="w-full text-xs h-8 text-muted-foreground">
                Close
              </Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}