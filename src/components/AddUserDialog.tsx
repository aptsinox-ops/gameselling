"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner"; 
import { showToast } from "@/lib/toast";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddUserDialog({ open, onOpenChange }: AddUserDialogProps) {
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingCreateOthers, setLoadingCreateOthers] = useState(false);
  
  // 🟢 ডিফল্ট রোল "User"
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", password: "", role: "User" });

  const handleCreate = async (keepOpen: boolean) => {
    if (!formData.name || !formData.phone || !formData.email || !formData.password) {
      showToast.error("All fields are required!");
      return;
    }
    if (formData.password.length < 8) {
      showToast.error("Password must be at least 8 characters!");
      return;
    }

    if (keepOpen) setLoadingCreateOthers(true);
    else setLoadingCreate(true);

    // 🟢 লোডিং টোস্ট শুরু
    const toastId = showToast.loading("Creating user...");

    try {
      const res = await fetch("/api/users/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create user");
      
      // 🟢 লোডিং টোস্ট সরিয়ে সাকসেস টোস্ট দেখানো
      showToast.dismiss(toastId);
      showToast.success(data.message || "User created successfully!");
      setFormData({ name: "", phone: "", email: "", password: "", role: "User" });
      
      if (!keepOpen) onOpenChange(false);
    } catch (error: any) {
      // 🟢 লোডিং টোস্ট সরিয়ে এরর টোস্ট দেখানো
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-[#121212] border-neutral-200 dark:border-neutral-950 text-neutral-900 dark:text-white sm:max-w-[425px] p-6 rounded-2xl shadow-2xl transition-colors duration-200">
        <DialogHeader>
          <DialogTitle className="mt-2 mb-4 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">Add New User</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-2">
          {renderInput("Name", "name", "Enter full name")}
          {renderInput("Phone", "phone", "Enter phone number")}
          {renderInput("Email", "email", "Enter email address", "email")}
          {renderInput("Password", "password", "Minimum 8 characters", "password")}

          {/* রোল অপশন */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Role</Label>
            <RadioGroup value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})} className="flex gap-4 pt-1">
              
              {/* 1. User Option */}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="User" id="r1" className="border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white" />
                <Label htmlFor="r1" className="text-neutral-700 dark:text-neutral-200 cursor-pointer text-sm font-medium">User</Label>
              </div>
              
              {/* 2. Reseller Option */}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Reseller" id="r2" className="border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white" />
                <Label htmlFor="r2" className="text-neutral-700 dark:text-neutral-200 cursor-pointer text-sm font-medium">Reseller</Label>
              </div>

              {/* 3. Premium Option */}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Premium" id="r3" className="border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white" />
                <Label htmlFor="r3" className="text-neutral-700 dark:text-neutral-200 cursor-pointer text-sm font-medium">Premium</Label>
              </div>

            </RadioGroup>
          </div>
        </div>

        <div className="flex justify-start gap-1 pt-6 items-center">
          <Button 
            type="button"
            className="font-semibold h-10 px-4 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-none cursor-pointer"
            onClick={() => handleCreate(false)} 
            disabled={loadingCreate}
          >
            {loadingCreate && <Spinner className="mr-2 h-4 w-4 text-current" />}
            Create
          </Button>

          <Button 
            type="button"
            className="font-semibold h-10 px-4 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-none cursor-pointer"
            onClick={() => handleCreate(true)} 
            disabled={loadingCreateOthers}
          >
            {loadingCreateOthers && <Spinner className="mr-2 h-4 w-4 text-current" />}
            Create & Others
          </Button>

          <Button 
            variant="outline" 
            type="button"
            className="border-neutral-200 dark:border-neutral-800 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 hover:text-neutral-900 dark:hover:text-white px-5 h-10 rounded-full ml-auto shadow-none cursor-pointer" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}