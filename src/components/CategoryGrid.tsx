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
    <div className="space-y-8 sm:space-y-12 py-6 max-w-[1400px] mx-auto px-2.5 sm:px-6">
      {categories.map((category, index) => (
        <div key={index} className="space-y-4 sm:space-y-6">

          {/* Category Title Header - Clean Black Text */}
          <div className="text-center">
            <h2 className="inline-block font-extrabold text-black tracking-tight text-xl xs:text-2xl sm:text-3xl md:text-4xl">
              {category.name}
            </h2>
          </div>

          {/* Product Grid - Mobile: 3 columns | PC: 7 columns */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 sm:gap-4 md:gap-5 justify-center">
            {category.products?.map((product) => (
              <Link 
                key={product.id}
                href={`/topup/${product.slug}`}
                className="group flex flex-col items-center text-center cursor-pointer transition-transform duration-200 active:scale-95 w-full"
              >
                {/* Image Container - Full Column Width Auto-Scaling */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100">
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
                      className="absolute top-1 left-1 xs:top-1.5 xs:left-1.5 text-[7.5px] xs:text-[9px] sm:text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-md sm:rounded-lg flex items-center gap-0.5 xs:gap-1 z-10"
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

                {/* Product Title - Scaled Font */}
                <div className="mt-1.5 xs:mt-2 px-0.5 w-full flex items-center justify-center">
                  <p className="text-[11px] xs:text-[12px] sm:text-[13.5px] md:text-[14px] font-medium text-black tracking-tight line-clamp-2 leading-tight sm:leading-snug group-hover:opacity-80 transition-opacity">
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