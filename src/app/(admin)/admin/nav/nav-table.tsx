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
import { getColumns, type NavItem } from "./columns"
import { showToast } from "@/lib/toast"
import { ImageUploader } from "@/components/ui/image-uploader"
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

const inputNumberClass = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"

// ========================================================
// 🟢 ১. ADD NAVIGATION DIALOG COMPONENT
// ========================================================
interface AddNavDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  onSuccess: () => void
}

function AddNavDialog({ open, setOpen, onSuccess }: AddNavDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [name, setName] = React.useState("")
  const [icon, setIcon] = React.useState("")
  const [iconType, setIconType] = React.useState<"image" | "url" | "svg">("image")
  const [href, setHref] = React.useState("")
  const [targetAudience, setTargetAudience] = React.useState<"ALL" | "GUEST" | "USER">("ALL")
  const [slot, setSlot] = React.useState("1")
  const [status, setStatus] = React.useState(true)

  const handleCancel = () => {
    showToast.dismiss()
    showToast.error("Add Nav cancelled")
    setOpen(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !icon || !href) {
      showToast.error("Name, Nav Icon, and Route (href) are required!")
      return
    }

    setIsSubmitting(true)
    const toastId = showToast.loading("Creating nav item...")

    try {
      const response = await fetch("/api/nav", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          icon: icon.trim(),
          href: href.trim(),
          targetAudience,
          slot: Number(slot) || 1,
          status: status ? "ON" : "OFF",
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to create nav item")

      showToast.dismiss(toastId)
      showToast.success("Nav item added successfully!")
      onSuccess()
      setOpen(false)
      setName("")
      setIcon("")
      setHref("")
      setSlot("1")
    } catch (error: any) {
      showToast.dismiss(toastId)
      showToast.error(error.message || "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleCancel()
      else setOpen(true)
    }}>
      <DialogContent className="bg-white dark:bg-[#121212] border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white max-w-[92%] sm:max-w-[450px] p-5 sm:p-6 rounded-2xl shadow-2xl focus:outline-none max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="mt-1 mb-2 text-xl sm:text-2xl font-semibold tracking-tight">
            Add Bottom Nav Item
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleCreate} className="grid gap-3 sm:gap-4 py-1">
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-medium">Item Name</Label>
            <Input
              type="text"
              placeholder="e.g., Home, Shop, Profile"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-transparent border-neutral-200 dark:border-neutral-800 rounded-xl h-10 text-xs sm:text-sm"
            />
          </div>

          {/* NAV ICON WITH TABS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs sm:text-sm font-medium">Nav Icon</Label>
              <div className="flex bg-neutral-100 dark:bg-neutral-800/80 p-0.5 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => { setIconType("image"); setIcon(""); }}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    iconType === "image"
                      ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm font-semibold"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  Image
                </button>
                <button
                  type="button"
                  onClick={() => { setIconType("url"); setIcon(""); }}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    iconType === "url"
                      ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm font-semibold"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => { setIconType("svg"); setIcon(""); }}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    iconType === "svg"
                      ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm font-semibold"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  SVG
                </button>
              </div>
            </div>

          <ImageUploader
            value={icon}
            onChange={(url: string | null) => setIcon(url ?? "")}
          />

            {iconType === "url" && (
              <Input
                type="url"
                placeholder="https://example.com/icon.png"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="bg-transparent border-neutral-200 dark:border-neutral-800 rounded-xl h-10 text-xs sm:text-sm font-mono"
              />
            )}

            {iconType === "svg" && (
              <textarea
                placeholder="<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>...</svg>"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                rows={4}
                className="w-full p-3 bg-transparent border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 resize-none"
              />
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-medium">Slot Position</Label>
            <Input
              type="number"
              min="1"
              max="4"
              placeholder="1 to 4"
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              className={`bg-transparent border-neutral-200 dark:border-neutral-800 rounded-xl h-10 text-xs sm:text-sm ${inputNumberClass}`}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-medium">Route Path (href)</Label>
            <Input
              type="text"
              placeholder="e.g., / or /shop or /profile"
              value={href}
              onChange={(e) => setHref(e.target.value)}
              className="bg-transparent border-neutral-200 dark:border-neutral-800 rounded-xl h-10 text-xs sm:text-sm font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-medium">Visibility (Target Audience)</Label>
            <Select value={targetAudience} onValueChange={(val: any) => setTargetAudience(val)}>
              <SelectTrigger className="bg-transparent border-neutral-200 dark:border-neutral-800 rounded-xl h-10 text-xs sm:text-sm">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#121212] border-neutral-200 dark:border-neutral-800">
                <SelectItem value="ALL">User + Guest (Everyone)</SelectItem>
                <SelectItem value="GUEST">Guest Only</SelectItem>
                <SelectItem value="USER">User Only (Logged in)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between py-1">
            <Label htmlFor="add-nav-status" className="text-xs sm:text-sm font-medium cursor-pointer">
              Active Status (ON/OFF)
            </Label>
            <Switch
              id="add-nav-status"
              checked={status}
              onCheckedChange={setStatus}
              className="data-[state=checked]:bg-neutral-900 dark:data-[state=checked]:bg-white"
            />
          </div>

          <div className="flex justify-start gap-2 pt-4 items-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Create
            </button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="ml-auto rounded-full h-10 px-5 text-xs sm:text-sm border-neutral-200 dark:border-neutral-800"
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
// 🟢 ২. EDIT NAVIGATION DIALOG COMPONENT
// ========================================================
interface EditNavDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  navData: NavItem | null
  onUpdateSuccess: () => void
}

function EditNavDialog({ open, setOpen, navData, onUpdateSuccess }: EditNavDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [name, setName] = React.useState("")
  const [icon, setIcon] = React.useState("")
  const [iconType, setIconType] = React.useState<"image" | "url" | "svg">("image")
  const [href, setHref] = React.useState("")
  const [targetAudience, setTargetAudience] = React.useState<"ALL" | "GUEST" | "USER">("ALL")
  const [slot, setSlot] = React.useState("1")
  const [status, setStatus] = React.useState(true)

  React.useEffect(() => {
    if (navData && open) {
      const iconVal = navData.icon || ""
      setName(navData.name || "")
      setIcon(iconVal)
      setHref(navData.href || "/")
      setTargetAudience(navData.targetAudience || "ALL")
      setSlot(String(navData.slot || 1))
      setStatus(Boolean(navData.status === "ON" || navData.status === true))

      if (iconVal.trim().toLowerCase().includes("<svg")) {
        setIconType("svg")
      } else if (iconVal.startsWith("http://") || iconVal.startsWith("https://")) {
        setIconType("url")
      } else {
        setIconType("image")
      }
    }
  }, [navData, open])

  const handleCancel = () => {
    showToast.dismiss()
    showToast.error("Edit operation cancelled")
    setOpen(false)
  }

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !icon || !href) {
      showToast.error("Name, Nav Icon, and Route (href) are required!")
      return
    }

    setIsSubmitting(true)
    const toastId = showToast.loading("Updating nav item...")

    try {
      const response = await fetch(`/api/nav/${navData?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          icon: icon.trim(),
          href: href.trim(),
          targetAudience,
          slot: Number(slot) || 1,
          status: status ? "ON" : "OFF",
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to update nav item")

      showToast.dismiss(toastId)
      showToast.success("Nav item updated successfully!")
      onUpdateSuccess()
      setOpen(false)
    } catch (error: any) {
      showToast.dismiss(toastId)
      showToast.error(error.message || "Failed to update nav item")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleCancel()
      else setOpen(true)
    }}>
      <DialogContent className="bg-white dark:bg-[#121212] border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white max-w-[92%] sm:max-w-[450px] p-5 sm:p-6 rounded-2xl shadow-2xl focus:outline-none max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="mt-1 mb-2 text-xl sm:text-2xl font-semibold tracking-tight">
            Edit Bottom Nav Item
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSaveChanges} className="grid gap-3 sm:gap-4 py-1">
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-medium">Item Name</Label>
            <Input
              type="text"
              placeholder="e.g., Home, Shop, Profile"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-transparent border-neutral-200 dark:border-neutral-800 rounded-xl h-10 text-xs sm:text-sm"
            />
          </div>

          {/* NAV ICON WITH TABS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs sm:text-sm font-medium">Nav Icon</Label>
              <div className="flex bg-neutral-100 dark:bg-neutral-800/80 p-0.5 rounded-lg text-xs font-medium border border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => { setIconType("image"); setIcon(""); }}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    iconType === "image"
                      ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm font-semibold"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  Image
                </button>
                <button
                  type="button"
                  onClick={() => { setIconType("url"); setIcon(""); }}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    iconType === "url"
                      ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm font-semibold"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => { setIconType("svg"); setIcon(""); }}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    iconType === "svg"
                      ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm font-semibold"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  SVG
                </button>
              </div>
            </div>

              <ImageUploader
                value={icon}
                onChange={(url: string | null) => setIcon(url ?? "")}
              />

            {iconType === "url" && (
              <Input
                type="url"
                placeholder="https://example.com/icon.png"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="bg-transparent border-neutral-200 dark:border-neutral-800 rounded-xl h-10 text-xs sm:text-sm font-mono"
              />
            )}

            {iconType === "svg" && (
              <textarea
                placeholder="<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>...</svg>"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                rows={4}
                className="w-full p-3 bg-transparent border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 resize-none"
              />
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-medium">Slot Position</Label>
            <Input
              type="number"
              min="1"
              max="4"
              placeholder="1 to 4"
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              className={`bg-transparent border-neutral-200 dark:border-neutral-800 rounded-xl h-10 text-xs sm:text-sm ${inputNumberClass}`}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-medium">Route Path (href)</Label>
            <Input
              type="text"
              placeholder="e.g., / or /shop or /profile"
              value={href}
              onChange={(e) => setHref(e.target.value)}
              className="bg-transparent border-neutral-200 dark:border-neutral-800 rounded-xl h-10 text-xs sm:text-sm font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-medium">Visibility (Target Audience)</Label>
            <Select value={targetAudience} onValueChange={(val: any) => setTargetAudience(val)}>
              <SelectTrigger className="bg-transparent border-neutral-200 dark:border-neutral-800 rounded-xl h-10 text-xs sm:text-sm">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#121212] border-neutral-200 dark:border-neutral-800">
                <SelectItem value="ALL">User + Guest (Everyone)</SelectItem>
                <SelectItem value="GUEST">Guest Only</SelectItem>
                <SelectItem value="USER">User Only (Logged in)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between py-1">
            <Label htmlFor="edit-nav-status" className="text-xs sm:text-sm font-medium cursor-pointer">
              Active Status (ON/OFF)
            </Label>
            <Switch
              id="edit-nav-status"
              checked={status}
              onCheckedChange={setStatus}
              className="data-[state=checked]:bg-neutral-900 dark:data-[state=checked]:bg-white"
            />
          </div>

          <div className="flex justify-start gap-2 pt-4 items-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save Changes
            </button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="ml-auto rounded-full h-10 px-5 text-xs sm:text-sm border-neutral-200 dark:border-neutral-800"
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
// 🟢 ৩. MAIN NAVTABLE COMPONENT
// ========================================================
interface NavTableProps {
  initialData: NavItem[]
}

export function NavTable({ initialData }: NavTableProps) {
  const router = useRouter()
  const [data, setData] = React.useState<NavItem[]>(initialData)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = React.useState({})
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Dialog States
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [editTargetData, setEditTargetData] = React.useState<NavItem | null>(null)

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  const [isAlertOpen, setIsAlertOpen] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<{ isBulk: boolean; id?: string }>({
    isBulk: true,
  })

  const handleEditRow = (rowItem: NavItem) => {
    setEditTargetData(rowItem)
    setIsEditDialogOpen(true)
  }

  const handleDeleteRow = (id: string) => {
    setDeleteTarget({ isBulk: false, id })
    setIsAlertOpen(true)
  }

  const handleCancelDelete = () => {
    showToast.dismiss()
    showToast.error("Delete operation cancelled")
    setIsAlertOpen(false)
  }

  const confirmDelete = async () => {
    setIsDeleting(true)
    const toastId = showToast.loading("Deleting item(s)...")

    try {
      if (deleteTarget.isBulk) {
        const selectedIds = table.getSelectedRowModel().rows.map((row) => row.original.id)
        const deletePromises = selectedIds.map((id) =>
          fetch(`/api/nav/${id}`, { method: "DELETE" })
        )
        await Promise.all(deletePromises)

        setData((prev) => prev.filter((item) => !selectedIds.includes(item.id)))
        setRowSelection({})
        showToast.dismiss(toastId)
        showToast.success(`${selectedIds.length} items deleted successfully!`)
      } else {
        const res = await fetch(`/api/nav/${deleteTarget.id}`, { method: "DELETE" })
        if (!res.ok) throw new Error()

        setData((prev) => prev.filter((item) => item.id !== deleteTarget.id))
        showToast.dismiss(toastId)
        showToast.success("Nav item deleted successfully!")
      }
      router.refresh()
    } catch {
      showToast.dismiss(toastId)
      showToast.error(deleteTarget.isBulk ? "Bulk deletion failed" : "Failed to delete item")
    } finally {
      setIsDeleting(false)
      setIsAlertOpen(false)
    }
  }

  const columns = React.useMemo(
    () => getColumns({ onEdit: handleEditRow, onDelete: handleDeleteRow }),
    []
  )

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
  })

  const selectedCount = table.getFilteredSelectedRowModel().rows.length

  const getColumnWidthClass = (id: string) => {
    switch (id) {
      case "select": return "w-[48px] shrink-0 justify-center"
      case "icon": return "w-[60px] shrink-0 justify-center"
      case "name": return "flex-1 min-w-[160px] shrink-0 justify-start"
      case "targetAudience": return "w-[150px] shrink-0 justify-start"
      case "slot": return "w-[100px] shrink-0 justify-center text-center"
      case "status": return "w-[100px] shrink-0 justify-center text-center"
      case "actions": return "w-[100px] shrink-0 justify-end text-right"
      default: return "w-auto"
    }
  }

  return (
    <div className="space-y-4 shadow-none w-full">
      {/* Top Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <Input
          placeholder="Search nav item by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="w-full sm:max-w-sm h-11 bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl shadow-none"
        />

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-1 rounded-xl h-11 flex items-center whitespace-nowrap">
            Total Items: {data.length}
          </span>

          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 font-semibold rounded-xl shadow-none h-11 px-4 gap-2"
          >
            <Plus className="h-4 w-4" /> Add Nav Item
          </Button>
        </div>
      </div>

      {/* Bulk Delete Bar */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-950/40 bg-red-50 dark:bg-red-950/10 animate-in fade-in slide-in-from-top-1 duration-200 w-full">
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-medium">
            <AlertTriangle className="h-4 w-4" />
            {selectedCount} item(s) selected for deletion
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
                    className={`text-neutral-900 dark:text-white font-semibold text-xs tracking-wide flex items-center shrink-0 ${getColumnWidthClass(
                      header.column.id
                    )}`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
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
                      className={`text-sm text-neutral-900 dark:text-neutral-300 font-medium flex items-center shrink-0 ${getColumnWidthClass(
                        cell.column.id
                      )}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="h-24 flex items-center justify-center text-neutral-400 dark:text-neutral-500 text-sm w-full">
                No navigation items found.
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
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px] bg-transparent border-neutral-200 dark:border-neutral-800 rounded-lg">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top" className="bg-white dark:bg-[#121212] border-neutral-200 dark:border-neutral-800">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex w-[80px] items-center justify-center text-sm font-semibold">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount() || 1}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex border-neutral-200 dark:border-neutral-800"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 border-neutral-200 dark:border-neutral-800"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 border-neutral-200 dark:border-neutral-800"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex border-neutral-200 dark:border-neutral-800"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Add Dialog */}
      <AddNavDialog
        open={isAddDialogOpen}
        setOpen={setIsAddDialogOpen}
        onSuccess={() => router.refresh()}
      />

      {/* Edit Dialog */}
      <EditNavDialog
        open={isEditDialogOpen}
        setOpen={setIsEditDialogOpen}
        navData={editTargetData}
        onUpdateSuccess={() => router.refresh()}
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isAlertOpen} onOpenChange={(isOpen) => {
        if (!isOpen) handleCancelDelete()
        else setIsAlertOpen(true)
      }}>
        <AlertDialogContent className="max-w-[400px] rounded-xl bg-white dark:bg-[#0c0c0e] border-neutral-200 dark:border-neutral-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-500 text-sm">
              This action will permanently delete the item(s) from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row items-center justify-end gap-3 mt-2">
            <AlertDialogCancel disabled={isDeleting} onClick={handleCancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmDelete()
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
  )
}