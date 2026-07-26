"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

// TypeScript ইন্টারফেস
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
  createdAt?: string | Date;
}

interface Category {
  id?: string;
  name?: string;
  products: Product[];
}

interface TopupPageProps {
  categories?: Category[];
  products?: Product[];
}

export default function TopupPage({ categories, products: initialProducts }: TopupPageProps) {
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ১. সাইট সেটিংস ফেচ করা
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSiteSettings(data);
        }
      } catch (err) {
        console.error("Failed to fetch site settings:", err);
      }
    };
    fetchSettings();
  }, []);

  // ২. প্রোডাক্ট ডাটা প্রসেস এবং ফার্স্ট-অ্যাডেড (Ascending Order) অনুযায়ী সাজানো
  useEffect(() => {
    const loadProducts = async () => {
      let productList: Product[] = [];

      if (initialProducts && initialProducts.length > 0) {
        productList = [...initialProducts];
      } else if (categories && categories.length > 0) {
        productList = categories.flatMap((cat) => cat.products || []);
      } else {
        try {
          const res = await fetch('/api/products');
          if (res.ok) {
            const data = await res.json();
            productList = Array.isArray(data) ? data : data.products || [];
          }
        } catch (err) {
          console.error("Failed to fetch products:", err);
        }
      }

      if (productList.length > 0 && productList[0]?.createdAt) {
        productList.sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
      }

      setAllProducts(productList);
      setLoading(false);
    };

    loadProducts();
  }, [categories, initialProducts]);

  const primaryColor = siteSettings?.primaryColor || "#00d2ff";

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-t-transparent border-sky-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!allProducts || allProducts.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm font-medium">
        No products available.
      </div>
    );
  }

  return (
    <div className="py-6 px-4 max-w-5xl mx-auto">
      {/* Mobile: 3 columns | PC: 4 columns */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
        {allProducts.map((product) => (
          <Link 
            key={product.id}
            href={`/topup/${product.slug}`}
            style={{ borderBottomColor: primaryColor }}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col justify-between text-center cursor-pointer border-b-[2px] transition-all duration-200 active:scale-95 hover:shadow-md"
          >
            {/* Top Game Banner Image */}
            <div className="relative aspect-square w-full bg-neutral-800 overflow-hidden">
              <img 
                src={product.image || "https://placehold.co/400x400/262626/ffffff?text=Game"} 
                alt={product.name} 
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  e.currentTarget.src = `https://placehold.co/400x400/1e1e2e/ffffff?text=${encodeURIComponent(product.name)}`;
                }}
              />
              
              {/* কন্ডিশনাল এবং ডাইনামিক ট্যাগ ব্যাজ */}
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
                  className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 text-[7px] sm:text-[9px] font-bold tracking-wider uppercase px-1.5 sm:px-2 py-0.5 rounded-[8px] flex items-center gap-0.5 z-10"
                >
                  {/* Custom Icon or Fallback SVG */}
                  {product.tagType === "CUSTOM" && product.tagIcon ? (
                    <img 
                      src={product.tagIcon} 
                      alt="" 
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 object-contain shrink-0 brightness-0 invert" 
                    />
                  ) : product.tagType === "AUTO" || !product.tagType ? (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="currentColor" 
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 shrink-0 aspect-square"
                    >
                      <path d="M19 10h-5.41l1.82-7.29a1 1 0 0 0-1.57-1.06l-10 11a1 1 0 0 0 .74 1.67h5.41l-1.82 7.29a1 1 0 0 0 1.57 1.06l10-11A1 1 0 0 0 19 10z" />
                    </svg>
                  ) : null}

                  {/* Tag Text */}
                  <span>{product.productTag}</span>
                </div>
              )}
            </div>

            {/* Product Meta Card Footer (Compact Size) */}
            <div className="p-1.5 sm:p-2 bg-white flex items-center justify-center min-h-[36px] sm:min-h-[44px]">
              <p className="text-[11px] sm:text-xs md:text-sm my-1 font-semibold text-black tracking-tight uppercase line-clamp-2 leading-tight">
                {product.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}