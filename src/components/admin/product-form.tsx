"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductSchema } from "@/lib/validators/product";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RichEditor } from "@/components/rich-editor"; // TipTap বা Pell এডিটর

export default function AddProductForm({ categories }) {
  const [isFfAuto, setIsFfAuto] = useState(false);

  const { register, handleSubmit, setValue, watch, control } = useForm({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      dynamicFields: ["Enter UID"],
      isFreeFireAuto: false,
      productTag: "",
    },
  });

  // ডাইনামিক QNA/Text Box এর জন্য useFieldArray
  const { fields, append, remove } = useFieldArray({
    control,
    name: "dynamicFields" as never,
  });

  // লজিক ১: প্রোডাক্টের নাম টাইপ করলে অটো স্লুগ ও ডেমো লিংক জেনারেশন
  const productName = watch("name");
  useEffect(() => {
    if (productName) {
      const generatedSlug = productName.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
      setValue("slug", generatedSlug);
    }
  }, [productName, setValue]);

  const slug = watch("slug");

  const onSubmit = async (data: any) => {
    // API Call করে ডাটাবেসে সেভ করার লজিক এখানে হবে
    console.log("Database-ready Data:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl bg-white p-6 rounded-lg shadow">
      
      {/* ক্যাটাগরি সিলেক্ট ড্রপডাউন */}
      <div>
        <label className="block text-sm font-medium mb-2">Select Category</label>
        <select {...register("categoryId")} className="w-full border p-2 rounded">
          {categories.map((cat: any) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* প্রোডাক্টের নাম ও ইমেজ */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <Input {...register("name")} placeholder="e.g., UID TOPUP" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Product Image Link</label>
          <Input {...register("image")} placeholder="Image URL" />
        </div>
      </div>

      {/* ডেমো ইউআরএল লাইভ প্রিভিউ */}
      <div className="bg-slate-50 p-3 rounded text-sm text-slate-600">
        <p><strong>Live URL Preview:</strong> https://demo.com/topup/{slug || "your-product-slug"}</p>
      </div>

      {/* কাস্টম ট্যাগ ইনপুট ফিল্ড (অপশনাল) */}
      <div>
        <label className="block text-sm font-medium mb-1">Product Tag (Optional)</label>
        <Input {...register("productTag")} placeholder="Hint: Tag auto delivery, 10% OFF etc." />
      </div>

      {/* ফ্রি-ফায়ার প্রোডাক্ট সুইচ (অ্যানিমেশন সহ) */}
      <div className="border p-4 rounded-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">FreeFire Product Switch</h4>
            <p className="text-xs text-muted-foreground">Turn on for automatic delivery options</p>
          </div>
          <Switch 
            checked={isFfAuto} 
            onCheckedChange={(checked) => {
              setIsFfAuto(checked);
              setValue("isFreeFireAuto", checked);
              if (checked) setValue("categoryType", "FreeFire AUTO Delivery");
            }} 
          />
        </div>

        {/* সুইচ অন হলে অ্যানিমেটেড অপশন আসবে */}
        {isFfAuto && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-orange-50 p-4 rounded border border-orange-200 space-y-3">
            <label className="block text-sm font-medium text-orange-800">Auto Delivery Provider</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" value="UNIPIN" {...register("autoDeliveryWith")} /> UNIPIN
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" value="SHELL" {...register("autoDeliveryWith")} /> Shell
              </label>
            </div>
            
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-orange-200">
              <span className="text-sm text-orange-900 font-medium">FF Name Checker Feature</span>
              <Switch onCheckedChange={(checked) => setValue("ffNameChecker", checked)} />
            </div>
          </div>
        )}
      </div>

      {/* ক্যাটাগরি টাইপ (যদি ফ্রিফায়ার অন না থাকে) */}
      {!isFfAuto && (
        <div>
          <label className="block text-sm font-medium mb-2">Product Category Type</label>
          <select {...register("categoryType")} className="w-full border p-2 rounded">
            <option value="Voucher">Voucher</option>
            <option value="Subscription">Subscription</option>
            <option value="GAMES">GAMES</option>
          </select>
        </div>
      )}

      {/* ডাইনামিক ইউজার ইনপুট ফিল্ড (Dynamic QNA) */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">User Input Fields (Dynamic)</label>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 items-center">
            <Input 
              {...register(`dynamicFields.${index}` as never)} 
              disabled={index === 0} // ডিফল্ট 'Enter UID' চেঞ্জ করা যাবে না
              placeholder="Enter field placeholder/hint" 
            />
            {index > 0 && (
              <button type="button" onClick={() => remove(index)} className="text-red-500 text-sm">Remove</button>
            )}
          </div>
        ))}
        <button 
          type="button" 
          onClick={() => append("")}
          className="text-sm bg-blue-600 text-white px-3 py-1 rounded"
        >
          + Add Enter Text Box
        </button>
      </div>

      {/* শর্তাবলী (Rich Text Editor) */}
      <div>
        <label className="block text-sm font-medium mb-2">Rules & Condition</label>
        {/* আপনি রিচ টেক্সটের ভ্যালু অন-চেঞ্জ এর মাধ্যমে rulesCondition ফিল্ডে সেট করবেন */}
        <RichEditor onChange={(html) => setValue("rulesCondition", html)} />
      </div>

      {/* ফুটার লিংক ও বটম টেক্সট */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Item Bottom Text Hint</label>
          <Input {...register("itemBottomText")} placeholder="e.g., Support" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Footer Link (WhatsApp/Messenger)</label>
          <Input {...register("footerLink")} placeholder="https://wa.me/..." />
        </div>
      </div>

      <button type="submit" className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 transition">
        Add Product & Live
      </button>
    </form>
  );
}