"use client";

import { useSearchParams, useRouter } from "next/navigation";
import EditProductForm from "@/components/edit-product-from"; 
import { AddProductForm } from "@/components/add-product-form"; 
import { Suspense, useEffect, useState } from "react";

function ProductFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("edit");
  
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  const handleCancel = () => {
    router.back();
    router.refresh(); 
  };

  // 🟢 এডিট মোড অন থাকলে ক্লায়েন্ট সাইড থেকে প্রোডাক্ট ও ক্যাটাগরি ডাটা ফেচ করা
  useEffect(() => {
    if (!editId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // আপনার এডিট ডাটা এবং ক্যাটাগরি নিয়ে আসার API কল (প্রয়োজন অনুযায়ী এন্ডপয়েন্ট চেঞ্জ করতে পারেন)
        const [resProduct, resCategories] = await Promise.all([
          fetch(`/api/admin/products/${editId}`).then(res => res.json()),
          fetch(`/api/admin/categories`).then(res => res.json())
        ]);
        
        if (resProduct) setProductData(resProduct);
        if (resCategories) setCategories(resCategories);
      } catch (error) {
        console.error("Failed to load edit form data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [editId]);

  if (loading) {
    return <div className="p-8 text-center text-sm text-neutral-400">Loading form data...</div>;
  }

  // 🟢 ইউআরএল-এ যদি ?edit=id থাকে, তবে এডিট ফর্ম রেন্ডার হবে
  if (editId) {
    return (
      // 🟢 সমাধান: বাইরের ডাবল বর্ডার, প্যাডিং ও ব্যাকগ্রাউন্ড ফেলে দিয়ে অ্যাড ফর্মের লেআউটের মতো ক্লিন করা হলো
      <div className="w-full max-w-5xl">
        <EditProductForm 
          initialData={productData} 
          categories={categories}    
          onSuccess={handleCancel}
          onCancel={handleCancel} 
        />
      </div>
    );
  }

  // অন্যথায় সাধারণ নতুন প্রোডাক্ট তৈরির পেজটি দেখাবে
  return (
    // 🟢 অ্যাড ফর্মের মেইন কন্টেইনারকেও ক্লিন ও ফুল-উইডথ রাখা হলো
    <div className="w-full max-w-5xl">
      <AddProductForm onCancel={handleCancel} />
    </div>
  );
}

export default function NewProductPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-neutral-400">Loading form...</div>}>
      {/* 🟢 আপনার ড্যাশবোর্ডের ভেতরের মূল লেআউটের সাথে ম্যাচ করানোর জন্য কন্টেইনার */}
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 items-center justify-center w-full min-h-full">
        <ProductFormContent />
      </div>
    </Suspense>
  );
}