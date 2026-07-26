"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; // Shadcn UI Switch
import { Loader2, ArrowLeft } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface Category {
  id: string;
  name: string;
}

interface AddProductFormProps {
  onCancel: () => void;
}

export function AddProductForm({ onCancel }: AddProductFormProps) {
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingCreateOthers, setLoadingCreateOthers] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    variationsInput: "",
    isFreeFireAuto: false, // ডিফল্ট অবস্থায় Manual (false) থাকবে
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  const handleCreate = async (keepOpen: boolean) => {
    if (!formData.name || !formData.categoryId) {
      toast.error("Product Name and Category are required!");
      return;
    }

    if (keepOpen) {
      setLoadingCreateOthers(true);
    } else {
      setLoadingCreate(true);
    }

    try {
      const variationsArray = formData.variationsInput
        ? formData.variationsInput.split(",").map((v) => v.trim()).filter(Boolean)
        : [];

      const payload = {
        name: formData.name,
        categoryId: formData.categoryId,
        variations: variationsArray,
        isFreeFireAuto: formData.isFreeFireAuto,
      };

      const res = await fetch("/api/products/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create product");
      }
      
      toast.success(data.message || "Product created successfully!");
      
      // ইনপুট বক্স রিসেট (সুইচ আবার ডিফল্ট false বা Manual এ চলে যাবে)
      setFormData({ name: "", categoryId: "", variationsInput: "", isFreeFireAuto: false });
      
      if (!keepOpen) {
        onCancel();
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong!");
    } finally {
      setLoadingCreate(false);
      setLoadingCreateOthers(false);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl animate-in fade-in duration-200">
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          style: { 
            margin: "11px",
            marginTop: "20px",
            background: '#171717',
            color: '#ffffff',
            border: '1px solid #262626',
            minWidth: '300px',
            minHeight: '70px',
            paddingLeft: "20px",
          } 
        }} 
      />

      {/* ব্যাক বাটন */}
      <button 
        onClick={onCancel}
        className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-6 transition cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </button>

      <h2 className="text-xl font-semibold text-white mb-6">Add New Product</h2>
      
      <div className="flex flex-col gap-6">
        
        {/* Product Name */}
        <div className="flex flex-col gap-2.5">
          <Label className="text-sm font-medium text-neutral-300 tracking-wide">Product Name</Label>
          <Input 
            type="text" 
            placeholder="e.g. Free Fire Diamonds"
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="bg-transparent border-neutral-800 focus-visible:ring-neutral-700 rounded-xl placeholder:text-neutral-600 text-white h-11"
          />
        </div>

        {/* Category Select */}
        <div className="flex flex-col gap-2.5">
          <Label className="text-sm font-medium text-neutral-300 tracking-wide">Category</Label>
          <select 
            value={formData.categoryId}
            onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
            className="flex h-11 w-full rounded-xl border border-neutral-800 bg-neutral-900 text-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-neutral-700 transition cursor-pointer"
          >
            <option value="" disabled className="text-neutral-500">Select game category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-neutral-900 text-white">{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Variations */}
        <div className="flex flex-col gap-2.5">
          <Label className="text-sm font-medium text-neutral-300 tracking-wide">Variations</Label>
          <Input 
            type="text" 
            placeholder="Separate with commas (e.g. 115 Diamonds, 240 Diamonds)"
            value={formData.variationsInput} 
            onChange={(e) => setFormData({...formData, variationsInput: e.target.value})}
            className="bg-transparent border-neutral-800 focus-visible:ring-neutral-700 rounded-xl placeholder:text-neutral-600 text-white h-11"
          />
        </div>

        {/* 🟢 Delivery System - Shadcn UI Switch কাস্টমাইজেশন */}
        <div className="flex flex-col gap-3">
          <Label className="text-sm font-medium text-neutral-300 tracking-wide">Delivery System</Label>
          <div className="flex items-center space-x-3 bg-neutral-950/40 border border-neutral-800/60 w-fit px-4 py-3 rounded-xl">
            <Switch 
              id="delivery-system"
              checked={formData.isFreeFireAuto}
              onCheckedChange={(checked) => setFormData({...formData, isFreeFireAuto: checked})}
              className="data-[state=checked]:bg-white data-[state=unchecked]:bg-neutral-800"
            />
            {/* ডাইনামিক লেবেল: অফ থাকলে Manual, অন থাকলে Auto Delivery */}
            <Label 
              htmlFor="delivery-system" 
              className={`text-sm font-medium transition duration-200 cursor-pointer select-none ${
                formData.isFreeFireAuto ? "text-white" : "text-neutral-400"
              }`}
            >
              {formData.isFreeFireAuto ? "Auto Delivery" : "Manual"}
            </Label>
          </div>
        </div>
      </div>

      {/* বটম বাটন গ্রুপ */}
      <div className="flex justify-start gap-3 pt-8 items-center border-t border-neutral-800/60 mt-8">
        
        {/* Create Button */}
        <Button 
          type="button"
          className="font-bold h-10 px-6 rounded-full bg-white text-neutral-900 hover:bg-white/90 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer min-w-[100px]"
          onClick={() => handleCreate(false)} 
          disabled={loadingCreate || loadingCreateOthers}
        >
          {loadingCreate ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-neutral-900" />
              Creating...
            </>
          ) : (
            "Create"
          )}
        </Button>

        {/* Create & Others Button */}
        <Button 
          type="button"
          className="font-medium h-10 px-6 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer min-w-[150px]"
          onClick={() => handleCreate(true)} 
          disabled={loadingCreate || loadingCreateOthers}
        >
          {loadingCreateOthers ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              Saving...
            </>
          ) : (
            "Create & Others"
          )}
        </Button>

        {/* Cancel Button */}
        <Button 
          variant="outline" 
          type="button"
          className="border-neutral-800 bg-transparent hover:bg-red-600 hover:text-white text-neutral-400 px-6 h-10 rounded-full ml-auto font-medium transition-all duration-200 cursor-pointer" 
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}