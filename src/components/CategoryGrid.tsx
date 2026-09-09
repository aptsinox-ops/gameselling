"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  image: string;
  slug: string;
  productTag: string | null;
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
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  if (!categories || categories.length === 0) return null;
  const [siteSettings, setSiteSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSiteSettings(data);
        }
      } catch (err) {
        console.error("Failed to Fetch site setting:", err);
      }
    };
    fetchSettings();
  }, []);

  const primaryColor = siteSettings?.primaryColor && siteSettings.primaryColor.trim() !== "" 
    ? siteSettings.primaryColor 
    : "#000000";

  return (
    <div className="space-y-10 sm:space-y-16 py-6 max-w-[1400px] mx-auto px-3 sm:px-6">
      {categories.map((category, index) => (
        <div key={index} className="space-y-6 sm:space-y-8">
          
          {/* Category Title Header - বড় সাইজ, টেক্সট কালার বিশুদ্ধ ব্ল্যাক এবং নো শ্যাডো */}
          <div className="text-center">
            <h2 className="inline-block font-extrabold text-black tracking-tight text-2xl xs:text-3xl sm:text-4xl md:text-5xl">
              {category.name}
            </h2>
          </div>

          {/* Product Grid - স্ক্রিনশটের মতো রেসপন্সিভ লেআউট ও ইউআই স্কেলিং */}
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 xs:gap-4 sm:gap-6 justify-center">
            {category.products?.map((product) => (
              <Link 
                key={product.id}
                href={`/topup/${product.slug}`}
                className="group flex flex-col items-center text-center cursor-pointer transition-transform duration-200 active:scale-95"
              >
                {/* Image Container - নো শ্যাডো, রাউন্ডেড অ্যান্ড ক্লিন লুক */}
                <div className="relative aspect-square w-full max-w-[140px] xs:max-w-[160px] sm:max-w-[180px] rounded-2xl overflow-hidden bg-gray-100">
                  <img 
                    src={product.image || "https://placehold.co/400x400/262626/ffffff?text=Game"} 
                    alt={product.name} 
                    className="w-full h-full object-cover object-center rounded-2xl transition-transform duration-300 ease-out group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = `https://placehold.co/400x400/1e1e2e/ffffff?text=${encodeURIComponent(product.name)}`;
                    }}
                  />
                  
                  {/* Dynamic Tag Badge */}
                  {product.isTagEnabled && product.productTag && (
                    <div 
                      style={{ 
                        backgroundColor: (product.tagType === "AUTO" || !product.tagType) 
                          ? primaryColor 
                          : (product.tagBgColor || primaryColor), 
                        color: (product.tagType === "AUTO" || !product.tagType) 
                          ? '#ffffff' 
                          : (product.tagColor || '#ffffff') 
                      }}
                      className="absolute top-1.5 left-1.5 text-[8px] xs:text-[9.5px] sm:text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-lg flex items-center gap-1 z-10"
                    >
                      {product.tagType === "CUSTOM" && product.tagIcon ? (
                        <img 
                          src={product.tagIcon} 
                          alt="" 
                          className="w-2.5 h-2.5 object-contain shrink-0 brightness-0 invert" 
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
                      <span className="truncate max-w-[50px] xs:max-w-none">{product.productTag}</span>
                    </div>
                  )}
                </div>

                {/* Product Title - পিওর ব্ল্যাক, স্পষ্ট সাইজ এবং প্রপার স্কেলিং */}
                <div className="mt-2 px-1 w-full flex items-center justify-center">
                  <p className="text-[12px] xs:text-[13.5px] sm:text-[15px] font-semibold text-black tracking-tight line-clamp-2 leading-snug group-hover:opacity-80 transition-opacity">
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