"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { showToast } from "@/lib/toast";

export function AddCategoryDialog() {
  const [open, setOpen] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingCreateOthers, setLoadingCreateOthers] = useState(false);
  
  const [formData, setFormData] = useState({ name: "", slotNo: "" });

  const handleCreate = async (keepOpen: boolean) => {
    if (!formData.name || !formData.slotNo) {
      showToast.error("All fields are required!");
      return;
    }

    if (keepOpen) setLoadingCreateOthers(true);
    else setLoadingCreate(true);

    // লোডিং টোস্ট শুরু
    const toastId = showToast.loading("Creating category...");

    try {
      const res = await fetch("/api/categories/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: formData.name, 
          slotNo: parseInt(formData.slotNo)
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create category");

      // সাকসেস টোস্ট দেখানোর আগে লোডিং টোস্ট ডিসমিস করা
      showToast.dismiss(toastId);
      showToast.success(data.message || "Category created successfully!");
      setFormData({ name: "", slotNo: "" });
      
      if (!keepOpen) setOpen(false);
    } catch (error: any) {
      showToast.dismiss(toastId);
      showToast.error(error.message || "Something went wrong!");
    } finally {
      setLoadingCreate(false);
      setLoadingCreateOthers(false);
    }
  };

  const renderInput = (label: string, name: keyof typeof formData, placeholder: string, type = "text") => (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{label}</Label>
      <Input 
        type={type} 
        placeholder={placeholder}
        value={formData[name]} 
        onChange={(e) => setFormData({...formData, [name]: e.target.value})}
        className="bg-transparent border-neutral-200 dark:border-neutral-800 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-700 rounded-xl placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-neutral-900 dark:text-white shadow-none"
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 font-semibold rounded-xl shadow-none h-11 px-4 transition-colors">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-[#121212] border-neutral-200 dark:border-neutral-950 text-neutral-900 dark:text-white sm:max-w-[425px] p-6 rounded-2xl shadow-2xl transition-colors duration-200">
        <DialogHeader>
          <DialogTitle className="mt-2 mb-4 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">Add New Category</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-2">
          {renderInput("Category Name", "name", "Enter category name")}
          {renderInput("Slot Number", "slotNo", "Enter slot number", "number")}
        </div>

        <div className="flex justify-start gap-1 pt-6 items-center">
          <Button type="button" onClick={() => handleCreate(false)} disabled={loadingCreate} className="h-10 px-4 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-none font-semibold">
            {loadingCreate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create
          </Button>
          <Button type="button" onClick={() => handleCreate(true)} disabled={loadingCreateOthers} className="h-10 px-4 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-none font-semibold">
            {loadingCreateOthers && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create & Others
          </Button>
          <Button variant="outline" type="button" className="border-neutral-200 dark:border-neutral-800 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 hover:text-neutral-900 dark:hover:text-white ml-auto rounded-full shadow-none" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}