"use client";
import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';

// 🟢 TypeScript ইন্টারফেস আপডেট করা হয়েছে যেন কোনো লাল দাগ না আসে
interface Product {
  id: string;
  name: string;
  image: string;
  slug: string;
  productTag: string | null;
  // 🆕 নতুন যুক্ত হওয়া প্রপার্টিজ (অপশনাল রাখা হয়েছে যেন ডাটা না থাকলেও ক্র্যাশ না করে)
  isTagEnabled?: boolean;
  tagType?: "AUTO" | "CUSTOM";
  tagColor?: string;
  tagBgColor?: string;
  tagIcon?: string | null;
}

interface Category {
  name: string;
  products: Product[];
}

interface CategoryGridProps {
  categories: Category[]; // হোমপেজ থেকে পাঠানো categories প্রপ্স রিসিভ করা হচ্ছে
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  if (!categories || categories.length === 0) return null;
  const [siteSettings, setSiteSettings] = useState<any>(null);

  useEffect(() =>{
    const fetchSettings = async () => {
      try{
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSiteSettings (data);
        }
      } catch (err){
        console.error("Faild to Fatch site setting:", err)
      }
    };
    fetchSettings();
  }, []);

  const primaryColor = siteSettings?.primaryColor || "#00d2ff";

  return (
    <div className="space-y-12">
      {categories.map((category, index) => (
        <div key={index} className="space-y-4 pt-2">
          
          {/* Title Header */}
          <div className="text-center">
            <h3 className="inline-flex items-center gap-1 font-bold text-slate-800 tracking-wide uppercase text-2xl md:text-3xl lg:text-4xl">
              {category.name} 
            </h3>
          </div>

          {/* 3-Column Mobile Responsive Grid & 5px Bottom Border */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-6 cursor-pointer">
            {category.products?.map((product) => (
              <Link 
                key={product.id}
                href={`/topup/${product.slug}`}
                style={{borderBottomColor: primaryColor}}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col justify-between text-center cursor-pointer border-b-[2px] transition-all duration-200 active:scale-95"
              >
                {/* Top Game Banner Graphic Image */}
                <div className="relative aspect-square w-full bg-neutral-800 overflow-hidden">
                  <img 
                    src={product.image || "https://placehold.co/400x400/262626/ffffff?text=Game"} 
                    alt={product.name} 
                    className="w-full h-full object-cover object-center"
                    // 🟢 যদি ইমেজ লিংক ব্রোকেন বা ডেড হয়, তবে নিচের ফাংশনটি স্বয়ংক্রিয়ভাবে একটি সুন্দর প্লেসহোল্ডার ইমেজ বসিয়ে দিবে
                    onError={(e) => {
                      e.currentTarget.src = `https://placehold.co/400x400/1e1e2e/ffffff?text=${encodeURIComponent(product.name)}`;
                    }}
                  />
                  
                  {/* 🆕 কন্ডিশনাল এবং ডাইনামিক ট্যাগ ব্যাজ (লাল দাগ মুক্ত) */}
                  {/* 🆕 কন্ডিশনাল এবং ডাইনামিক ট্যাগ ব্যাজ (কালার ফিক্স ও আইকন ডানে শিফট) */}
{product.isTagEnabled && product.productTag && (
<div 
  style={{ 
    // If tagType is AUTO, force dynamic primaryColor. If CUSTOM, use database dynamic color.
    backgroundColor: (product.tagType === "AUTO" || !product.tagType) 
      ? primaryColor 
      : (product.tagBgColor || primaryColor), 
    
    // text color জেনারেলি white রাখাই ভালো, তবে CUSTOM হলে ডাটাবেজেরটা পাবে
    color: (product.tagType === "AUTO" || !product.tagType) 
      ? '#ffffff' 
      : (product.tagColor || '#ffffff') 
  }}
  className="absolute top-1.5 left-1.5 text-[8px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-[10px] flex items-center gap-1 z-10"
>
    {/* 1. Render custom icon or fallback auto SVG icon */}
    {product.tagType === "CUSTOM" && product.tagIcon ? (
      <img 
        src={product.tagIcon} 
        alt="" 
        className="w-2.5 h-2.5 object-contain shrink-0 brightness-0 invert" 
        // Keeps custom uploaded icons white to match premium badge styling
      />
    ) : product.tagType === "AUTO" || !product.tagType ? (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className="w-2.5 h-2.5 shrink-0 aspect-square"
      >
        <path d="M19 10h-5.41l1.82-7.29a1 1 0 0 0-1.57-1.06l-10 11a1 1 0 0 0 .74 1.67h5.41l-1.82 7.29a1 1 0 0 0 1.57 1.06l10-11A1 1 0 0 0 19 10z" />
      </svg>
    ) : null}

    {/* 2. Render the tag text */}
    <span>{product.productTag}</span>
  </div>
)}
                </div>

                {/* Product Meta Card Footer */}
                <div className="p-1.5 sm:p-3 bg-white flex items-center justify-center min-h-[42px] sm:min-h-[58px]">
                  <p className="text-[13px] mb-2 mt-2 sm:text-base md:text-base font-semibold text-black tracking-tight uppercase line-clamp-2 leading-tight">
                    {product.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>

        </div>
      ))}
    </div>
  );
}