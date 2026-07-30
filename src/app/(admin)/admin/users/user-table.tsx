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
import { columns, type User } from "./columns"
import { toast } from "react-hot-toast"
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

// 🟢 আপনার স্পেসিফিক পাথের AddUserDialog ইমপোর্ট করা হলো
import { AddUserDialog } from "@/components/AddUserDialog"

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

interface UserTableProps {
  initialData: User[]
}

export function UserTable({ initialData }: UserTableProps) {
  const router = useRouter()
  const [data, setData] = React.useState<User[]>(initialData)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = React.useState({})
  const [isDeleting, setIsDeleting] = React.useState(false)

  // 🎛️ প্যাগিনেশন স্টেট
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // ➕ ডায়ালগ ওপেন/ক্লোজ কন্ট্রোল স্টেট
  const [openCreate, setOpenCreate] = React.useState(false)

  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  // 🗑️ Delete State
  const [isAlertOpen, setIsAlertOpen] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<{ id?: number; name?: string; isBulk: boolean }>({
    isBulk: false
  })

  // Bulk Delete Trigger
  const handleBulkDeleteTrigger = () => {
    setDeleteTarget({ isBulk: true })
    setIsAlertOpen(true)
  }

  // Unified Delete Confirm Handler
  const confirmDelete = async () => {
    setIsDeleting(true)
    try {
      if (deleteTarget.isBulk) {
        const selectedIds = table.getSelectedRowModel().rows.map(row => row.original.id)
        const res = await fetch("/api/users/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedIds }),
        })

        if (!res.ok) throw new Error()

        setData((prev) => prev.filter((user) => !selectedIds.includes(user.id)))
        setRowSelection({})
        toast.success(`${selectedIds.length} users deleted successfully!`)
      } else if (deleteTarget.id !== undefined) {
        const res = await fetch("/api/users/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: deleteTarget.id }),
        })

        if (!res.ok) throw new Error()

        setData((prev) => prev.filter((user) => user.id !== deleteTarget.id))
        toast.success(`User "${deleteTarget.name}" deleted successfully!`)
      }
      router.refresh()
    } catch {
      toast.error(deleteTarget.isBulk ? "Bulk deletion failed" : "Failed to delete user")
    } finally {
      setIsDeleting(false)
      setIsAlertOpen(false)
    }
  }

  // TanStack Table Instance
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
      setDeleteTarget: (val: any) => setDeleteTarget(val), // 👈 এভাবে ফাংশন দিয়ে র‍্যাপ করে দিন
      setIsAlertOpen,
    }
  })

  const selectedCount = table.getFilteredSelectedRowModel().rows.length

  // Dynamic Width Class Customizer
  const getColumnWidthClass = (id: string) => {
    switch (id) {
      case "drag": return "w-[40px] shrink-0 justify-start"
      case "select": return "w-[50px] shrink-0 justify-start"
      case "id": return "w-[80px] shrink-0 justify-start text-xs font-mono"
      case "name": return "w-[160px] shrink-0 justify-start" 
      case "email": return "flex-1 min-w-[220px] shrink-0 justify-start"
      case "phone": return "w-[140px] shrink-0 justify-start"
      case "balance": return "w-[120px] shrink-0 justify-start"
      case "role": return "w-[110px] shrink-0 justify-start" 
      case "status": return "w-[120px] shrink-0 justify-center text-center" 
      case "actions": return "w-[100px] shrink-0 justify-center text-center ml-auto" 
      default: return "w-auto"
    }
  }

  return (
    <div className="space-y-4 shadow-none w-full">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <Input
          placeholder="Search users by User ID..."
          value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const val = event.target.value
            table.getColumn("id")?.setFilterValue(val === "" ? undefined : val)
          }}
          className="w-full sm:max-w-sm h-11 bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-990 dark:text-white focus:border-neutral-400 dark:focus:border-neutral-700 rounded-xl shadow-none"
        />
        
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-1 rounded-xl h-11 flex items-center whitespace-nowrap">
            Total Users: {data.length}
          </span>
          <Button
            onClick={() => setOpenCreate(true)}
            className="h-11 gap-1.5 px-4 font-bold text-sm bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-xl transition-all shadow-none cursor-pointer whitespace-nowrap"
          >
            <Plus className="h-4 w-4" /> Add User
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
            onClick={handleBulkDeleteTrigger}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" /> Delete Selected
          </Button>
        </div>
      )}

      {/* Modern Adaptive Table Container */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black overflow-x-auto w-full">
        <div className="w-full flex flex-col min-w-max">
          
          {/* Table Header */}
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

          {/* Table Body */}
          <div className="flex flex-col w-full flex-none">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
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
                No users found.
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 📊 প্রিমিয়াম প্যাগিনেশন লেআউট */}
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
            {table.getPageCount()}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex bg-transparent border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 shadow-none rounded-lg"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </Button>

            <Button
              variant="outline"
              className="h-8 w-8 p-0 bg-transparent border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 shadow-none rounded-lg"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </Button>

            <Button
              variant="outline"
              className="h-8 w-8 p-0 bg-transparent border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 shadow-none rounded-lg"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </Button>

            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex bg-transparent border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 shadow-none rounded-lg"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </Button>
          </div>
        </div>
      </div>

      {/* 🟢 আপনার কাঙ্ক্ষিত নির্দিষ্ট পাথের ডায়ালগটি এখন এখানে রেন্ডার হবে */}
      <AddUserDialog open={openCreate} onOpenChange={setOpenCreate} />

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="max-w-[400px] shadow-none rounded-xl bg-white dark:bg-[#0c0c0e] border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-500 dark:text-neutral-400 text-sm">
              {deleteTarget.isBulk ? (
                `This action will permanently delete all ${selectedCount} selected users from the database. This cannot be undone.`
              ) : (
                <>
                  This action cannot be undone. This will permanently delete user{" "}
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