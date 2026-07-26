"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function EditCategoryForm({ currentCategory }: { currentCategory: any }) {
  const router = useRouter();
  const [name, setName] = useState(currentCategory.name);
  const [slotNo, setSlotNo] = useState(currentCategory.slotNo);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // এখানে আপনার API বা Server Action কল করবেন আপডেট করার জন্য
    // উদাহরণ: await fetch(`/api/categories/${currentCategory.id}`, { method: 'PUT', ... })

    console.log("Updated Data:", { name, slotNo });
    
    setLoading(false);
    router.push("/admin/categories"); // আপডেট শেষে লিস্ট পেজে ফেরত যাবে
  };

  return (
    <form onSubmit={handleUpdate} className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg max-w-lg space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-slate-400">Category Name</label>
        <Input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          className="bg-zinc-800 border-zinc-700 text-white"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm text-slate-400">Slot Number</label>
        <Input 
          type="number" 
          value={slotNo} 
          onChange={(e) => setSlotNo(Number(e.target.value))} 
          className="bg-zinc-800 border-zinc-700 text-white"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
          className="border-zinc-700 text-slate-300"
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
          {loading ? "Updating..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}