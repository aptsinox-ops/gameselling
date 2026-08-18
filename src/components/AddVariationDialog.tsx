"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { showToast } from "@/lib/toast";

interface ProductItem {
  id: string | number;
  name: string;
  resellerPercentage?: number;
  productType?: string | null;
  isFreeFireAuto?: boolean | string | number | null;
}

interface AddVariationDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  products: ProductItem[];
}

export function AddVariationDialog({ open, setOpen, products = [] }: AddVariationDialogProps) {
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingCreateOthers, setLoadingCreateOthers] = useState(false);
  
  const [hasDiscount, setHasDiscount] = useState(false);
  const [resellerPrice, setResellerPrice] = useState<number | string>(0);

  const [formData, setFormData] = useState({
    productId: "",
    title: "",
    price: "",
    discountPrice: "",
    bonus: "",
    stock: ""
  });

  // ১. সিলেক্টেড প্রোডাক্ট বের করা
  const selectedProduct = products.find(
    (p) => String(p.id).trim() === String(formData.productId).trim()
  );

  // ২. isFreeFireAuto চেক (Boolean/String/Number সেফলি চেক)
  const isFreeFireAuto = 
    selectedProduct?.isFreeFireAuto === true ||
    String(selectedProduct?.isFreeFireAuto).toLowerCase() === "true" ||
    Number(selectedProduct?.isFreeFireAuto) === 1;

  useEffect(() => {
    const percentage = selectedProduct?.resellerPercentage ?? 0;
    const currentPrice = parseFloat(formData.price);

    if (!formData.price || isNaN(currentPrice)) {
      setResellerPrice(0);
      return;
    }

    const calculatedResellerPrice = currentPrice - (currentPrice * (percentage / 100));
    setResellerPrice(calculatedResellerPrice.toFixed(2));
  }, [formData.price, formData.productId, products, selectedProduct]);

  const handleCreate = async (keepOpen: boolean) => {
    if (!formData.productId || !formData.title || !formData.price) {
      showToast.error("Product, Title, and Price are required!");
      return;
    }

    // isFreeFireAuto OFF থাকলে স্টক ইনপুট ভ্যালিডেশন
    if (!isFreeFireAuto && (formData.stock === "" || isNaN(parseInt(formData.stock)))) {
      showToast.error("Stock field is required when FreeFire Auto is OFF!");
      return;
    }

    if (keepOpen) setLoadingCreateOthers(true);
    else setLoadingCreate(true);

    const toastId = showToast.loading("Creating variation...");

    try {
      const finalTitle = formData.title.trim();
      const finalOfferPrice = hasDiscount && formData.discountPrice ? parseFloat(formData.discountPrice) : null;

      const res = await fetch("/api/variation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          productId: formData.productId,
          title: finalTitle,
          price: parseFloat(formData.price),
          offerPrice: finalOfferPrice,
          bonus: formData.bonus ? parseInt(formData.bonus) : 0, 
          // isFreeFireAuto ON থাকলে স্টক default 0 পাঠানো হচ্ছে
          stock: !isFreeFireAuto ? parseInt(formData.stock) : 0,
          sortOrder: 0, 
          status: "ON"
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create variation");

      showToast.dismiss(toastId);
      showToast.success(data.message || "Variation created successfully!");
      
      setFormData({
        productId: formData.productId,
        title: "",
        price: "",
        discountPrice: "",
        bonus: "",
        stock: ""
      });
      setHasDiscount(false);
      
      if (!keepOpen) {
        setOpen(false);
        window.location.reload();
      }
    } catch (error: any) {
      showToast.dismiss(toastId);
      showToast.error(error.message || "Something went wrong!");
    } finally {
      setLoadingCreate(false);
      setLoadingCreateOthers(false);
    }
  };

  const getDiscountHint = () => {
    const currentPrice = parseFloat(formData.price);
    if (!formData.price || isNaN(currentPrice)) return "e.g., 80";
    return `e.g., ${currentPrice - 20}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-white dark:bg-[#121212] border-neutral-200 dark:border-neutral-950 text-neutral-900 dark:text-white max-w-[92%] sm:max-w-[450px] p-5 sm:p-6 rounded-2xl shadow-2xl transition-colors duration-200">
        <DialogHeader>
          <DialogTitle className="mt-1 mb-2 sm:mb-4 text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Add New Variation
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-3 sm:gap-4 py-1">
          {/* ১. প্রোডাক্ট সিলেক্ট */}
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-200">Select Product</Label>
            <Select 
              value={formData.productId} 
              onValueChange={(val) => setFormData({...formData, productId: val, stock: ""})}
            >
              <SelectTrigger className="bg-transparent border-neutral-200 dark:border-neutral-800 focus:ring-neutral-400 dark:focus:ring-neutral-700 rounded-xl text-neutral-900 dark:text-white h-9 sm:h-11 text-xs sm:text-sm shadow-none">
                <SelectValue placeholder="Choose a product" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#121212] border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white max-h-[200px]">
                {products.map((product) => (
                  <SelectItem key={product.id} value={String(product.id)} className="cursor-pointer focus:bg-neutral-100 dark:focus:bg-neutral-800 text-neutral-900 dark:text-white text-xs sm:text-sm">
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ২. ভেরিয়েশন টাইটেল */}
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-200">Variation Title</Label>
            <Input 
              placeholder="e.g., 240 DIAMOND"
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="bg-transparent border-neutral-200 dark:border-neutral-800 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-700 rounded-xl placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-neutral-900 dark:text-white h-9 sm:h-11 text-xs sm:text-sm shadow-none"
            />
          </div>

          {/* ৩. প্রাইস (BDT) এবং রেসেলার প্রাইস */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-200">Price (BDT)</Label>
              <Input 
                type="number"
                step="any"
                placeholder="e.g., 100"
                value={formData.price} 
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="bg-transparent border-neutral-200 dark:border-neutral-800 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-700 rounded-xl placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-neutral-900 dark:text-white h-9 sm:h-11 text-xs sm:text-sm shadow-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm font-medium text-neutral-400 dark:text-neutral-500">Reseller Price</Label>
              <Input 
                disabled
                value={resellerPrice ? `${resellerPrice} TK` : "0 TK"} 
                className="bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-xl h-9 sm:h-11 text-xs sm:text-sm cursor-not-allowed select-none font-medium shadow-none"
              />
            </div>
          </div>

          {/* ৪. বোনাস ফিল্ড */}
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-200">Bonus (Optional)</Label>
            <Input 
              type="number"
              placeholder="e.g., 5"
              value={formData.bonus} 
              onChange={(e) => setFormData({...formData, bonus: e.target.value})}
              className="bg-transparent border-neutral-200 dark:border-neutral-800 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-700 rounded-xl placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-neutral-900 dark:text-white h-9 sm:h-11 text-xs sm:text-sm w-full shadow-none"
            />
          </div>

          {/* ৫. স্টক ফিল্ড: কেবল প্রোডাক্ট নির্বাচন করা হলে এবং isFreeFireAuto = OFF (false) থাকলে দেখাবে */}
          {Boolean(formData.productId) && !isFreeFireAuto && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <Label className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-200 flex items-center gap-1">
                Stock <span className="text-red-500">*</span>
              </Label>
              <Input 
                type="number"
                placeholder="e.g., 50"
                value={formData.stock} 
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="bg-transparent border-neutral-200 dark:border-neutral-800 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-700 rounded-xl placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-neutral-900 dark:text-white h-9 sm:h-11 text-xs sm:text-sm w-full shadow-none"
              />
            </div>
          )}

          {/* ৬. ডিসকাউন্ট সুইচ বার */}
          <div className="flex items-center justify-between py-1 px-1">
            <Label htmlFor="discount-mode" className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-200 cursor-pointer">DISCOUNT</Label>
            <Switch 
              id="discount-mode"
              checked={hasDiscount}
              onCheckedChange={setHasDiscount}
              className="data-[state=checked]:bg-neutral-900 dark:data-[state=checked]:bg-white data-[state=unchecked]:bg-neutral-200 dark:data-[state=unchecked]:bg-neutral-800 scale-90 sm:scale-100"
            />
          </div>

          {/* ডিসকাউন্ট ইনপুট ফিল্ড */}
          {hasDiscount && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <Label className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-200">DISCOUNT PRICE</Label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs sm:text-sm font-medium text-red-500 line-through select-none">
                  {formData.price ? `${formData.price} tk` : "0 tk"}
                </span>
                
                <div className="absolute left-[65px] sm:left-[75px] h-4 sm:h-5 w-[1px] bg-red-600/40" />

                <Input 
                  type="number"
                  step="any"
                  placeholder={getDiscountHint()}
                  value={formData.discountPrice} 
                  onChange={(e) => setFormData({...formData, discountPrice: e.target.value})}
                  className="bg-transparent border-neutral-200 dark:border-neutral-800 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-700 rounded-xl placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-neutral-900 dark:text-white h-9 sm:h-11 text-xs sm:text-sm w-full pl-[80px] sm:pl-[95px] shadow-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* অ্যাকশন বাটনসমূহ */}
        <div className="flex justify-start gap-2 pt-4 sm:pt-6 items-center">
          <Button 
            type="button" 
            onClick={() => handleCreate(false)} 
            disabled={loadingCreate} 
            className="h-9 sm:h-10 px-4 sm:px-5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 font-semibold text-xs sm:text-sm transition-colors shadow-none"
          >
            {loadingCreate && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />} Create
          </Button>
          
          <Button 
            type="button" 
            onClick={() => handleCreate(true)} 
            disabled={loadingCreateOthers} 
            className="h-9 sm:h-10 px-4 sm:px-5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 font-semibold text-xs sm:text-sm transition-colors shadow-none"
          >
            {loadingCreateOthers && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />} Create & Others
          </Button>
          
          <Button 
            variant="outline" 
            type="button" 
            className="border-neutral-200 dark:border-neutral-800 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 hover:text-neutral-900 dark:hover:text-white ml-auto rounded-full h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm shadow-none" 
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}