
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { columns, type AutoRobotItem } from "./columns";
import { toast } from "react-hot-toast";
import { 
  Trash2, 
  AlertTriangle, 
  Loader2, 
  Plus,
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from "lucide-react";

import { AddAutoRobotDialog } from "@/components/AddAutoRobotDialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AutoRobotTableProps {
  initialData: AutoRobotItem[];
}

export function AutoRobotTable({ initialData }: AutoRobotTableProps) {
  const router = useRouter();
  const [data, setData] = React.useState<AutoRobotItem[]>(initialData);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [isDeleting, setIsDeleting] = React.useState(false);

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [openCreate, setOpenCreate] = React.useState(false);

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id?: string; name?: string; isBulk: boolean }>({
    isBulk: false
  });

  const handleBulkDeleteTrigger = () => {
    setDeleteTarget({ isBulk: true });
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteTarget.isBulk) {
        const selectedIds = table.getSelectedRowModel().rows.map(row => row.original.id);
        const res = await fetch("/api/autorobots/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedIds }),
        });

        if (!res.ok) throw new Error();

        setData((prev) => prev.filter((robot) => !selectedIds.includes(robot.id)));
        setRowSelection({});
        toast.success(`${selectedIds.length} items deleted successfully!`);
      } else if (deleteTarget.id !== undefined) {
        const res = await fetch("/api/autorobots/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: deleteTarget.id }),
        });

        if (!res.ok) throw new Error();

        setData((prev) => prev.filter((robot) => String(robot.id) !== String(deleteTarget.id)));
        toast.success(`"${deleteTarget.name}" deleted successfully!`);
      }
      router.refresh();
    } catch {
      toast.error(deleteTarget.isBulk ? "Bulk deletion failed" : "Failed to delete item");
    } finally {
      setIsDeleting(false);
      setIsAlertOpen(false);
    }
  };

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
      setDeleteTarget: (val: any) => setDeleteTarget(val),
      setIsAlertOpen,
    }
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  // ইমেজের সাইজ ইস্যুর প্রধান সমাধান: সঠিক কলাম আইডি ম্যাপিং
  const getColumnWidthClass = (id: string) => {
    switch (id) {
      case "drag": return "w-[40px] shrink-0 justify-start";
      case "select": return "w-[50px] shrink-0 justify-start";
      case "productName": return "w-[220px] shrink-0 justify-start font-bold";
      case "title": return "w-[200px] shrink-0 justify-start";
      case "price": return "w-[120px] shrink-0 justify-start";
      case "stock": return "w-[220px] shrink-0 justify-start";
      case "status": return "w-[120px] shrink-0 justify-center text-center";
      case "actions": return "w-[100px] shrink-0 justify-center text-center ml-auto";
      default: return "w-auto";
    }
  };

  return (
    <div className="space-y-4 shadow-none w-full">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <Input
          placeholder="Search product..."
          value={(table.getColumn("productName")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const val = event.target.value;
            table.getColumn("productName")?.setFilterValue(val === "" ? undefined : val);
          }}
          className="w-full sm:max-w-sm h-11 bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-xl shadow-none"
        />
        
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-1 rounded-xl h-11 flex items-center whitespace-nowrap">
            Total Items: {data.length}
          </span>
        </div>
      </div>

      {/* Bulk Delete Bar */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-950/40 bg-red-50 dark:bg-red-950/10 w-full">
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

      {/* Adaptive Table Container */}
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
                No AutoRobot items found.
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Pagination Container */}
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
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px] bg-transparent border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium rounded-lg">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top" className="bg-white dark:bg-[#121212] border-neutral-200 dark:border-neutral-800">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem 
                    key={pageSize} 
                    value={`${pageSize}`}
                    className="cursor-pointer font-medium"
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
              className="hidden h-8 w-8 p-0 lg:flex bg-transparent border-neutral-200 dark:border-neutral-800 rounded-lg"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className="h-8 w-8 p-0 bg-transparent border-neutral-200 dark:border-neutral-800 rounded-lg"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className="h-8 w-8 p-0 bg-transparent border-neutral-200 dark:border-neutral-800 rounded-lg"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex bg-transparent border-neutral-200 dark:border-neutral-800 rounded-lg"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <AddAutoRobotDialog open={openCreate} onOpenChange={setOpenCreate} />

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="max-w-[400px] rounded-xl bg-white dark:bg-[#0c0c0e]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-500 text-sm">
              {deleteTarget.isBulk ? (
                `This action will permanently delete all ${selectedCount} selected items.`
              ) : (
                <>
                  This action will permanently delete item{" "}
                  <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                    "{deleteTarget.name}"
                  </span>.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row items-center justify-end gap-3 mt-2">
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
    </div>
  );
}