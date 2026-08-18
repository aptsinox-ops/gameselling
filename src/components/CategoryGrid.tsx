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

  const primaryColor = siteSettings?.primaryColor || "#00d2ff";

  return (
    <div className="space-y-12">
      {categories.map((category, index) => (
        <div key={index} className="space-y-4 pt-2">
          
          {/* Title Header - ফন্ট ওয়েট 700 bold */}
          <div className="text-center">
            <h3 className="inline-flex items-center font-[700] text-black tracking-wide text-2xl md:text-3xl lg:text-4xl">
              {category.name} 
            </h3>
          </div>

          {/* Product Grid */}
          <div className=" mx-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-5 sm:gap-6 cursor-pointer">
            {category.products?.map((product) => (
              <Link 
                key={product.id}
                href={`/topup/${product.slug}`}
                className="bg-transparent border-none rounded-md flex flex-col justify-between text-center cursor-pointer transition-all duration-200 active:scale-95"
              >
                {/* Top Game Banner Graphic Image */}
                <div className="relative aspect-square w-full filter drop-shadow-xl/20 sm:drop-shadow-xl/10 ">
                  <img 
                    src={product.image || "https://placehold.co/400x400/262626/ffffff?text=Game"} 
                    alt={product.name} 
                    className="w-full h-full object-cover object-center rounded-xl"
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
                      className="absolute top-1.5 left-1.5 text-[8px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-[10px] flex items-center gap-1 z-10"
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
                      <span>{product.productTag}</span>
                    </div>
                  )}
                </div>

                {/* Product Meta Card Footer - ফন্ট 700 bold */}
                <div className="bg-transparent flex items-center justify-center min-h-[34px] sm:min-h-[50px]">
                  <p className="text-[14px] sm:text-[16px] md:text-[16px] font-[600] text-black tracking-tight uppercase line-clamp-2 leading-tight">
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