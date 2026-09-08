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
    <div className="space-y-8 sm:space-y-12 py-2">
      {categories.map((category, index) => (
        <div key={index} className="space-y-3 sm:space-y-5">
          
          {/* Category Title Header - স্ক্রিনশটের সাথে মিলিয়ে সেন্টার্ড ও গাঢ় নীল/কালো টোন */}
          <div className="text-center px-2">
            <h2 className="inline-block font-extrabold text-[#0f2942] tracking-tight text-xl xs:text-2xl sm:text-3xl md:text-4xl">
              {category.name}
            </h2>
          </div>

          {/* Product Grid - মোবাইলে ৩-কলাম রেসপন্সিভ লেআউট */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 xs:gap-3.5 sm:gap-5 md:gap-6 px-1 sm:px-3">
            {category.products?.map((product) => (
              <Link 
                key={product.id}
                href={`/topup/${product.slug}`}
                className="group flex flex-col items-center text-center cursor-pointer transition-transform duration-200 active:scale-95"
              >
                {/* Image Container - স্ক্রিনশটের মতো নিখুঁত Rounded Image Card */}
                <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-slate-100">
                  <img 
                    src={product.image || "https://placehold.co/400x400/262626/ffffff?text=Game"} 
                    alt={product.name} 
                    className="w-full h-full object-cover object-center rounded-xl sm:rounded-2xl transition-transform duration-300 ease-out group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = `https://placehold.co/400x400/1e1e2e/ffffff?text=${encodeURIComponent(product.name)}`;
                    }}
                  />
                  
                  {/* Dynamic Tag Badge - ছোট স্ক্রিনের জন্য অটো-স্কেলড */}
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
                      className="absolute top-1 left-1 xs:top-1.5 xs:left-1.5 text-[7px] xs:text-[8.5px] sm:text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-md xs:rounded-lg flex items-center gap-0.5 xs:gap-1 z-10 shadow-sm"
                    >
                      {product.tagType === "CUSTOM" && product.tagIcon ? (
                        <img 
                          src={product.tagIcon} 
                          alt="" 
                          className="w-2 h-2 xs:w-2.5 xs:h-2.5 object-contain shrink-0 brightness-0 invert" 
                        />
                      ) : product.tagType === "AUTO" || !product.tagType ? (
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill="currentColor" 
                          className="w-2 h-2 xs:w-2.5 xs:h-2.5 shrink-0 aspect-square"
                        >
                          <path d="M19 10h-5.41l1.82-7.29a1 1 0 0 0-1.57-1.06l-10 11a1 1 0 0 0 .74 1.67h5.41l-1.82 7.29a1 1 0 0 0 1.57 1.06l10-11A1 1 0 0 0 19 10z" />
                        </svg>
                      ) : null}
                      <span className="truncate max-w-[45px] xs:max-w-none">{product.productTag}</span>
                    </div>
                  )}
                </div>

                {/* Product Title - স্ক্রিনশটের মতো ক্লিন ফন্ট সাইজ ও স্পেসিং */}
                <div className="mt-1.5 xs:mt-2 px-0.5 w-full flex items-center justify-center min-h-[28px] xs:min-h-[34px] sm:min-h-[42px]">
                  <p className="text-[11px] xs:text-[12.5px] sm:text-[14px] md:text-[15px] font-semibold text-[#0f2942] tracking-tight line-clamp-2 leading-tight group-hover:text-sky-600 transition-colors">
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