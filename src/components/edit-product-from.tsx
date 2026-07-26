"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import { showToast } from "@/lib/toast";
import { 
  ChevronDown, 
  Check, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Link2, 
  Quote, 
  Code, 
  List,       
  LayoutGrid, 
  ListOrdered,
  ImageIcon,
  X, 
  LoaderCircle 
} from "lucide-react";

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ImageUploader } from "@/components/ui/image-uploader";

interface EditProductFormProps {
  initialData: any;
  categories: any[];
  onSuccess?: string | (() => void); // 🟢 ২. স্ট্রিং বা ফাংশন দুটোই সাপোর্ট করবে
  onCancel?: string | (() => void);
}


const productTypeOptions = ["Uid Topup", "Vouchers", "Subscriptions", "Gift Card"];

export default function EditProductForm({ 
  initialData, 
  categories, 
  onSuccess, 
  onCancel 
}: EditProductFormProps) {
  const router = useRouter();
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  
  // ড্রপডাউন স্টেট সমূহ
  const [typeOpen, setTypeOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  // স্টেট ম্যানেজমেন্ট
  const [formData, setFormData] = useState<any>({
    id: "",
    name: "",
    slug: "",
    productType: "",
    categoryId: "",
    resellerPercentage: 0,
    tutorialLink: "",
    variationsDesign: "List", 
    status: "ON",
    productImage: "", 
    variationIcon: "",
    isBanner: false,
    bannerImage: "",
    isCoinSystem: false,
    isPremiumUser: false,
    isFreeFireAuto: false,
    autoDeliveryType: "",
    isUidNameChecker: false,
    productTag: "",
    tagColor: "#ffffff",
    tagBgColor: "#262626",
    tagIcon: "",
    tagType: "AUTO",
  });

  const [dynamicFields, setDynamicFields] = useState<any[]>([{ label: "" }]);
  const [isTagEnabled, setIsTagEnabled] = useState(false);
  const [customTagValue, setCustomTagValue] = useState("");

  const handleCancelAction = () => {
    if (typeof onCancel === "function") {
      onCancel();
    } else if (typeof onCancel === "string") {
      router.push(onCancel); // /admin/products এ নিয়ে যাবে (ফর্ম বন্ধ হয়ে যাবে)
    } else {
      router.push("/admin/products");
    }
  };

  // টিপট্যাপ টেক্সট এডিটর ইনিশিয়ালিস্ট
  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      LinkExtension.configure({ openOnClick: false }),
      ImageExtension,
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[220px] prose prose-sm max-w-none text-foreground bg-transparent w-full",
      },
    },
  });

  // 🟢 ১. ডাটাবেস থেকে এক্সিস্টিং ডাটা সঠিকভাবে ফর্মে লোড ও পপুলেট করা
  useEffect(() => {
    if (initialData) {
      const dbStatus = initialData.status ? String(initialData.status).trim().toUpperCase() : "ON";

      setFormData({
        id: initialData.id || "",
        name: initialData.name || "",
        slug: initialData.slug || "",
        productType: initialData.productType || "",
        categoryId: initialData.categoryId || "",
        resellerPercentage: initialData.resellerPercentage ?? 0,
        tutorialLink: initialData.tutorialLink || "",
        variationsDesign: initialData.variationsDesign === "Grid" ? "Grid" : "List",
        status: dbStatus, 
        productImage: initialData.image || initialData.productImage || "", 
        variationIcon: initialData.variationIcon || "",
        bannerImage: initialData.bannerImage || "",
        tagIcon: initialData.tagIcon || "",

        isBanner: !!initialData.isBanner,
        isCoinSystem: !!initialData.isCoinSystem,
        isPremiumUser: !!initialData.isPremiumUser,
        isFreeFireAuto: !!initialData.isFreeFireAuto,
        autoDeliveryType: initialData.autoDeliveryType || "",
        isUidNameChecker: !!initialData.isUidNameChecker,
        
        productTag: initialData.productTag || "",
        tagColor: initialData.tagColor || "#ffffff",
        tagBgColor: initialData.tagBgColor || "#262626",
        tagType: initialData.tagType || "AUTO",
      });

      const dbFields = initialData.dynamicFields || initialData.inputFields;
      if (dbFields && Array.isArray(dbFields) && dbFields.length > 0) {
        setDynamicFields(dbFields.map((f: any) => ({ label: typeof f === 'string' ? f : f.label || "" })));
      } else {
        setDynamicFields([{ label: "" }]);
      }

      const tagEnabled = initialData.isTagEnabled !== undefined ? !!initialData.isTagEnabled : !!initialData.productTag;
      setIsTagEnabled(tagEnabled);
      
      if (tagEnabled && initialData.productTag) {
        if (initialData.tagType === "CUSTOM") {
          setCustomTagValue(initialData.productTag);
        }
      } else {
        setCustomTagValue("");
      }
    }
  }, [initialData]);

  useEffect(() => {
    if (editor && initialData?.description) {
      const timer = setTimeout(() => {
        if (editor && !editor.isDestroyed) {
          editor.commands.setContent(initialData.description);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [editor, initialData?.description]);

  // স্লুগ জেনারেট এবং নেম হ্যান্ডলার
  const handleNameChange = (value: string) => {
    const generatedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    setFormData({ ...formData, name: value, slug: generatedSlug });
  };

  // টেক্সট এডিটরে ইমেজ যুক্ত করার ফাংশন
  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  // ট্যাগ ব্যাজ টগল হ্যান্ডলার
  const handleTagToggle = (checked: boolean) => {
    setIsTagEnabled(checked);
    if (!checked) {
      setFormData((prev: any) => ({
        ...prev,
        productTag: "",
        tagType: "AUTO",
        tagColor: "#ffffff",
        tagBgColor: "#262626",
        tagIcon: ""
      }));
      setCustomTagValue("");
    } else {
      if (formData.tagType === "AUTO") {
        setFormData((prev: any) => ({
          ...prev,
          productTag: "AUTO DELIVERY",
          tagColor: "#ffffff",
          tagBgColor: "#1e3a8a"
        }));
      } else {
        setFormData((prev: any) => ({
          ...prev,
          productTag: customTagValue,
        }));
      }
    }
  };

  const selectedCategory = categories?.find((cat: any) => cat.id === formData.categoryId) || null;

  const handleUpdate = async () => {
    if (!formData.name.trim()) return showToast.error("Product name is required");
    if (!formData.categoryId) return showToast.error("Please select a category");
    if (!formData.productType) return showToast.error("Please select a product type");

    setLoadingUpdate(true);
    const toastId = showToast.loading("Updating product...");

    let finalInputFields: string[] = [];
    if (formData.productType === "Uid Topup") {
      finalInputFields = ["Enter Player UID"];
    } else if (formData.productType === "Vouchers") {
      finalInputFields = [];
    } else {
      finalInputFields = dynamicFields
        .map((f: any) => f.label.trim())
        .filter((label: string) => label !== "");
    }

    const currentDescription = editor ? editor.getHTML() : formData.description;

    const payload = {
      ...formData,
      status: formData.status || "ON", 
      description: currentDescription, 
      image: formData.productImage, 
      dynamicFields: finalInputFields, 
      isFreeFireAuto: formData.productType === "Uid Topup" ? formData.isFreeFireAuto : false,
      autoDeliveryType: (formData.productType === "Uid Topup" && formData.isFreeFireAuto) ? formData.autoDeliveryType : "",
      isUidNameChecker: formData.productType === "Uid Topup" ? formData.isUidNameChecker : false,
      isTagEnabled: isTagEnabled,
    };

    try {
      const response = await fetch(`/api/products/update?id=${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to update product");
      }

      showToast.dismiss(toastId);
      showToast.success("Product successfully updated!");
      
      if (typeof onSuccess === "function") {
        onSuccess();
      } else if (typeof onSuccess === "string") {
        router.push(onSuccess);
        router.refresh();
      } else {
        router.push("/admin/products");
        router.refresh();
      }
    } catch (error: any) {
      showToast.dismiss(toastId);
      console.error("Update Error:", error);
      showToast.error(error.message || "Something went wrong while updating!");
    } finally {
      setLoadingUpdate(false);
    }
  };
  return (
    <div className="w-full max-w-5xl bg-card border border-border rounded-2xl p-6 shadow-xl text-foreground font-sans">

      {/* প্রধান ইনপুট সেকশন */}
      <div className="flex flex-col gap-5 w-full mb-4">
        
        {/* ১ম লাইন: Product Name & Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div className="flex flex-col gap-2.5 w-full">
            <Label className="text-sm font-medium text-muted-foreground">Product Name</Label>
            <Input 
              type="text" 
              placeholder="Enter product name" 
              value={formData.name || ""} 
              onChange={(e) => handleNameChange(e.target.value)} 
              className="bg-transparent border-input rounded-xl text-foreground h-11 w-full focus:border-ring transition" 
            />
          </div>
          
          <div className="flex flex-col gap-2.5 w-full">
            <Label className="text-sm font-medium text-muted-foreground">Product Slug</Label>
            <Input 
              type="text" 
              placeholder="product-slug" 
              value={formData.slug || ""} 
              readOnly 
              className="bg-muted border-input rounded-xl text-muted-foreground h-11 cursor-not-allowed w-full" 
            />
          </div>
        </div>

        {/* ২য় লাইন: Product Type & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div className="flex flex-col gap-2.5 w-full">
            <Label className="text-sm font-medium text-muted-foreground">Product Type</Label>
            <Popover open={typeOpen} onOpenChange={setTypeOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background px-3 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition">
                  {formData.productType || "Select Type"}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border border-border bg-popover rounded-xl overflow-hidden z-50" align="start">
                <Command className="bg-popover">
                  <CommandGroup>
                    {productTypeOptions.map((type: string) => (
                      <CommandItem 
                        key={type} 
                        onSelect={() => { 
                          if (type === "Uid Topup") {
                            setFormData({
                              ...formData, 
                              productType: type,
                              isUidNameChecker: true
                            });
                          } else {
                            setFormData({
                              ...formData, 
                              productType: type,
                              isUidNameChecker: false,
                              isFreeFireAuto: false,
                              autoDeliveryType: ""
                            });
                          }
                          setTypeOpen(false); 
                        }} 
                        className="cursor-pointer text-popover-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-1"
                      >
                        <Check className={`mr-2 h-4 w-4 ${formData.productType === type ? "opacity-100" : "opacity-0"}`} />
                        {type}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-2.5 w-full">
            <Label className="text-sm font-medium text-muted-foreground tracking-wide">Category</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background px-3 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition">
                  {selectedCategory ? selectedCategory.name : "Select a category"}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border border-border bg-popover rounded-xl overflow-hidden z-50" align="start">
                <Command className="bg-popover">
                  <CommandInput placeholder="Search category..." />
                  <CommandList>
                    <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">No category found.</CommandEmpty>
                    <CommandGroup>
                      {categories?.map((cat: any) => (
                        <CommandItem 
                          key={cat.id} 
                          onSelect={() => { setFormData({...formData, categoryId: cat.id}); setOpen(false); }} 
                          className="cursor-pointer text-popover-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-1"
                        >
                          <Check className={`mr-2 h-4 w-4 ${formData.categoryId === cat.id ? "opacity-100" : "opacity-0"}`} />
                          {cat.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

      </div>

      {/* ৩য় লাইন: Reseller, Tutorial, Variations Design & Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
<div className="flex flex-col gap-2.5">
          <Label className="text-sm font-medium text-muted-foreground tracking-wide">Reseller Percentage</Label>
          <Input 
            type="number" 
            placeholder="e.g. 10" 
            // 🟢 FIXED: 0 কে Falsy না ধরে Nullish Coalescing (??) ব্যবহার করা হলো, যাতে 0 দিলে 0-ই বসে
            value={formData.resellerPercentage ?? ""} 
            // 🟢 SAFE ONCHANGE: ইনপুট পুরো ফাঁকা করলে যেন ফর্মেও ফাঁকা দেখায়, অন্যথায় সংখ্যা বসে
            onChange={(e) => {
              const val = e.target.value;
              setFormData({
                ...formData, 
                resellerPercentage: val === "" ? "" : Number(val)
              });
            }} 
            className="bg-transparent border-input rounded-xl text-foreground h-11 focus:border-ring transition" 
          />
        </div>
        
        <div className="flex flex-col gap-2.5">
          <Label className="text-sm font-medium text-muted-foreground tracking-wide">Tutorial Link</Label>
          <Input type="text" placeholder="https://youtu.be/..." value={formData.tutorialLink || ""} onChange={(e) => setFormData({...formData, tutorialLink: e.target.value})} className="bg-transparent border-input rounded-xl text-foreground h-11 focus:border-ring transition" />
        </div>

        {/* 🟢 ড্রপডাউন ফেলে দিয়ে ২টি সেগমেন্টেড ট্যাব বাটন বসানো হলো */}
      <div className="flex flex-col gap-2.5 md:col-span-1">
        <Label className="text-sm font-medium text-muted-foreground">Variations Design</Label>
        <div className="flex items-center h-11 w-full bg-muted/60 p-1 rounded-xl border border-input">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, variationsDesign: "List" })}
            className={`flex flex-1 items-center justify-center gap-2 h-full text-xs font-semibold rounded-lg transition-all ${
              formData.variationsDesign === "List"
                ? "bg-background text-orange-500 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List size={14} className={formData.variationsDesign === "List" ? "text-orange-500" : ""} />
            List
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, variationsDesign: "Grid" })}
            className={`flex flex-1 items-center justify-center gap-2 h-full text-xs font-semibold rounded-lg transition-all ${
              formData.variationsDesign === "Grid"
                ? "bg-background text-emerald-500 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ImageIcon size={14} className={formData.variationsDesign === "Grid" ? "text-emerald-500" : ""} />
            Grid
          </button>
        </div>
      </div>
        
<div className="flex flex-col gap-2.5">
          <Label className="text-sm font-medium text-muted-foreground tracking-wide">Status</Label>
          <Popover open={statusOpen} onOpenChange={setStatusOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background px-3 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition uppercase font-semibold">
                {/* 🟢 ব্রহ্মাস্ত্র: formData-তে যদি কোনো বাগ থাকে, তবে সরাসরি initialData থেকে রিয়েল ডাটা তুলে দেখাবে */}
                {formData.status 
                  ? String(formData.status) 
                  : (initialData?.status ? String(initialData.status).toUpperCase() : "ON")
                }
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 border-border bg-popover rounded-xl overflow-hidden" align="start">
              {/* 🟢 shouldFilter={false} এর ফলে Shadcn এর ইন্টারনাল ভুল ফিল্টারিং পুরোপুরি অফ থাকবে */}
              <Command className="bg-popover" shouldFilter={false}>
                <CommandGroup>
                  {["ON", "OFF"].map((s) => (
                    <CommandItem 
                      key={s} 
                      value={s} 
                      onSelect={() => { 
                        setFormData({ ...formData, status: s }); 
                        setStatusOpen(false); 
                      }} 
                      className="cursor-pointer text-popover-foreground hover:bg-accent hover:text-accent-foreground flex items-center justify-between"
                    >
                      <span>{s}</span>
                      {/* 🟢 কারেন্টলি সিলেক্টেড আইটেমের পাশে ইন্ডিকেটর */}
                      {(formData.status === s || (!formData.status && initialData?.status?.toUpperCase() === s)) && (
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* ৪র্থ সেকশন: বামে Content Editor এবং ডানে Image Uploaders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Tiptap Text Editor */}
        <div className="w-full rounded-xl border border-border bg-muted/30 overflow-hidden flex flex-col focus-within:border-ring transition relative">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-1.5 bg-muted border-b border-border px-3 py-2">
            <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className={`p-1.5 rounded ${editor?.isActive('bold') ? 'text-primary bg-accent' : 'text-muted-foreground hover:text-foreground'}`}><Bold size={16}/></button>
            <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className={`p-1.5 rounded ${editor?.isActive('italic') ? 'text-primary bg-accent' : 'text-muted-foreground hover:text-foreground'}`}><Italic size={16}/></button>
            <button type="button" onClick={() => editor?.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded ${editor?.isActive('underline') ? 'text-primary bg-accent' : 'text-muted-foreground hover:text-foreground'}`}><Underline size={16}/></button>
            <button type="button" onClick={() => editor?.chain().focus().toggleStrike().run()} className={`p-1.5 rounded ${editor?.isActive('strike') ? 'text-primary bg-accent' : 'text-muted-foreground hover:text-foreground'}`}><Strikethrough size={16}/></button>
            <div className="h-4 w-[1px] bg-border mx-1" />
            <button type="button" onClick={() => {const url = window.prompt('URL:'); if(url) editor?.chain().focus().setLink({href: url}).run()}} className="p-1.5 text-muted-foreground hover:text-foreground"><Link2 size={16}/></button>
            <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className={`text-xs font-bold px-1.5 rounded py-1 ${editor?.isActive('heading', { level: 1 }) ? 'text-primary bg-accent' : 'text-muted-foreground hover:text-foreground'}`}>Heading</button>
            <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={`text-xs font-bold px-1.5 rounded py-1 ${editor?.isActive('heading', { level: 2 }) ? 'text-primary bg-accent' : 'text-muted-foreground hover:text-foreground'}`}>Subheading</button>
            <div className="h-4 w-[1px] bg-border mx-1" />
            <button type="button" onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={`p-1.5 rounded ${editor?.isActive('blockquote') ? 'text-primary bg-accent' : 'text-muted-foreground hover:text-foreground'}`}><Quote size={16}/></button>
            <button type="button" onClick={() => editor?.chain().focus().toggleCode().run()} className={`p-1.5 rounded ${editor?.isActive('code') ? 'text-primary bg-accent' : 'text-muted-foreground hover:text-foreground'}`}><Code size={16}/></button>
            <div className="w-full flex gap-1 mt-1">
              <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded ${editor?.isActive('bulletList') ? 'text-primary bg-accent' : 'text-muted-foreground hover:text-foreground'}`}><List size={16}/></button>
              <button type="button" onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={`p-1.5 rounded ${editor?.isActive('orderedList') ? 'text-primary bg-accent' : 'text-muted-foreground hover:text-foreground'}`}><ListOrdered size={16}/></button>
              <button type="button" onClick={addImage} className="flex items-center gap-1.5 px-3 py-1 bg-background border border-input rounded-md text-emerald-500 hover:bg-accent ml-2">
                <ImageIcon size={14} /> <span className="text-[11px] font-semibold text-muted-foreground">Image</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-[220px] p-3 tiptap-editor">
            <EditorContent editor={editor} />
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            .tiptap-editor h1 { font-size: 1.875rem !important; font-weight: 700 !important; margin-top: 1rem !important; margin-bottom: 0.5rem !important; display: block !important; }
            .tiptap-editor h2 { font-size: 1.5rem !important; font-weight: 600 !important; margin-top: 1rem !important; margin-bottom: 0.5rem !important; display: block !important; }
            .tiptap-editor ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin-top: 0.5rem !important; margin-bottom: 0.5rem !important; display: block !important; }
            .tiptap-editor ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin-top: 0.5rem !important; margin-bottom: 0.5rem !important; display: block !important; }
            .tiptap-editor li { display: list-item !important; list-style: inherit !important; }
            .tiptap-editor blockquote { border-left: 4px solid var(--muted-foreground) !important; padding-left: 1rem !important; font-style: italic !important; color: var(--muted-foreground) !important; margin-top: 0.75rem !important; margin-bottom: 0.75rem !important; }
            .tiptap-editor code { background-color: var(--muted) !important; padding: 0.2rem 0.4rem !important; border-radius: 0.25rem !important; font-family: monospace !important; color: #ef4444 !important; }
          `}} />
        </div>

        {/* ইমেজ আপলোডার সমূহ */}
        <div className="flex flex-col gap-4">
          {/* 🖼️ Product Image */}
          <div className="flex flex-col gap-2.5">
            <Label className="text-sm font-medium text-muted-foreground">Product Image 1920 x 1920</Label>
            <ImageUploader 
              defaultValue={formData.productImage} 
              onFileChange={(file: any) => setFormData({ ...formData, productImage: file })} 
            />
          </div>

          {/* 🖼️ Variation Icon */}
          <div className="flex flex-col gap-2.5">
            <Label className="text-sm font-medium text-muted-foreground">Variation icon 512 x 512</Label>
            <ImageUploader 
              defaultValue={formData.variationIcon} 
              onFileChange={(file: any) => setFormData({ ...formData, variationIcon: file })} 
            />
          </div>
        </div>
      </div>

      {/* পৃষ্ঠা শীর্ষ ব্যানার টগল */}
      <div className="flex items-center gap-3 mt-3">
        <Switch 
          checked={formData.isBanner} 
          onCheckedChange={(c) => setFormData({ ...formData, isBanner: c })} 
        />
        <Label className="uppercase tracking-wider text-muted-foreground my-3 text-sm font-semibold select-none cursor-pointer">
          PAGE TOP HEADING BANNER
        </Label>
      </div>

      {/* 🖼️ Product Banner */}
      {formData.isBanner && (
        <div className="flex flex-col gap-2.5 mt-3 animate-in fade-in duration-200">
          <Label className="text-sm font-medium text-muted-foreground">Product Banner (820 x 360)</Label>
          <ImageUploader 
            defaultValue={formData.bannerImage} 
            onFileChange={(file: any) => setFormData({ ...formData, bannerImage: file })} 
          />
        </div>
      )}

      {/* ডাইনামিক ইনপুট ফিল্ডস ম্যানেজমেন্ট (কন্ডিশনাল রেন্ডারিং) */}
      {formData.productType !== "Uid Topup" && formData.productType !== "Vouchers" && (
        <div className="mt-2 border-t border-border pt-6 animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-4">
            <Label className="text-sm font-medium text-muted-foreground">Product Input Fields</Label>
            <Button 
              type="button"
              variant="default"
              onClick={() => setDynamicFields([...dynamicFields, { label: "" }])}
              className="text-xs h-8 bg-primary hover:bg-primary/90 text-primary-foreground border-none rounded-lg transition"
            >
              + Add New Input Box
            </Button>
          </div>

          {dynamicFields.map((field: any, index: number) => (
            <div key={index} className="flex gap-2 mb-2 animate-in fade-in duration-150">
              <Input
                value={field.label || ""}
                onChange={(e) => {
                  const newFields = [...dynamicFields];
                  newFields[index].label = e.target.value;
                  setDynamicFields(newFields);
                }}
                placeholder="e.g. Enter info..." 
                className="bg-background border-input rounded-xl text-foreground focus:border-ring transition"
              />
              {dynamicFields.length > 1 && (
                <Button type="button" variant="ghost" onClick={() => setDynamicFields(dynamicFields.filter((_, i) => i !== index))} className="hover:bg-accent rounded-xl">
                  <X className="h-5 w-5 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Uid Topup-এর ক্ষেত্রে স্ট্যাটিক ভিজ্যুয়াল ইন্ডিকেটর */}
      {formData.productType === "Uid Topup" && (
        <div className="mt-2 border-t border-border pt-6 animate-in fade-in duration-200">
          <Label className="text-sm font-medium text-muted-foreground block mb-2">Product Input Fields</Label>
          <Input 
            type="text" 
            value="Enter Player UID" 
            readOnly 
            className="bg-muted border-input rounded-xl text-muted-foreground h-11 cursor-not-allowed w-full" 
          />
        </div>
      )}

      {/* কোর সিস্টেম সুইচসমূহ */}
      <div className="space-y-4 py-1 mt-4 border-t border-border pt-6">
        <div className="flex flex-wrap items-center gap-8">
          
          <div className="flex items-center gap-3 uppercase">
            <Switch 
              checked={!!formData.isCoinSystem}
              onCheckedChange={(checked) => setFormData({...formData, isCoinSystem: checked})}
            />
            <Label className="text-sm font-medium text-foreground cursor-pointer select-none">COIN SYSTEM</Label>
          </div>

          <div className="flex items-center gap-3 uppercase">
            <Switch 
              checked={!!formData.isPremiumUser}
              onCheckedChange={(checked) => setFormData({...formData, isPremiumUser: checked})}
            />
            <Label className="text-sm font-medium text-foreground cursor-pointer select-none">Premium user</Label>
          </div>

          {formData.productType === "Uid Topup" && (
            <>
              <div className="flex items-center gap-3 animate-in fade-in duration-200">
                <Switch 
                  checked={!!formData.isFreeFireAuto}
                  onCheckedChange={(checked) => {
                    setFormData({
                      ...formData, 
                      isFreeFireAuto: checked,
                      autoDeliveryType: checked ? "UNIPIN" : "" 
                    });
                  }}
                />
                <Label className="text-sm font-medium text-foreground cursor-pointer select-none uppercase">Auto Delivery System</Label>
              </div>

              <div className="flex items-center gap-3 animate-in fade-in duration-200">
                <Switch 
                  checked={!!formData.isUidNameChecker}
                  onCheckedChange={(checked) => setFormData({...formData, isUidNameChecker: checked})}
                />
                <Label className="text-sm font-medium text-foreground cursor-pointer select-none">UID NAME CHECKER</Label>
              </div>
            </>
          )}
        </div>
        
        {/* অটো ডেলিভারি টাইপ (Unipin/Shell) */}
        {formData.productType === "Uid Topup" && formData.isFreeFireAuto && (
          <div className="pl-2 pt-1 animate-in slide-in-from-top-2 duration-200">
            <RadioGroup
              value={formData.autoDeliveryType || "UNIPIN"}
              onValueChange={(value: string) => setFormData({ ...formData, autoDeliveryType: value })}
              className="flex items-center gap-6"
            >
              <div className="flex items-center space-x-2.5 cursor-pointer group">
                <RadioGroupItem 
                  value="UNIPIN" 
                  id="unipin" 
                  className="border-input text-primary focus:ring-ring bg-transparent" 
                />
                <Label htmlFor="unipin" className="text-sm font-medium text-muted-foreground group-hover:text-foreground cursor-pointer select-none">
                  UNIPIN
                </Label>
              </div>
              
              <div className="flex items-center space-x-2.5 cursor-pointer group">
                <RadioGroupItem 
                  value="SHELL" 
                  id="shell" 
                  className="border-input text-primary focus:ring-ring bg-transparent" 
                />
                <Label htmlFor="shell" className="text-sm font-medium text-muted-foreground group-hover:text-foreground cursor-pointer select-none">
                  SHELL
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* প্রোডাক্ট ট্যাগ ব্যাজ ম্যানেজমেন্ট */}
        <div className="border-t border-border/60 pt-4 mt-2">
          <div className="flex items-center gap-3">
            <Switch 
              checked={isTagEnabled}
              onCheckedChange={handleTagToggle}
            />
            <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide cursor-pointer select-none">
              Enable Product Tag Badge
            </Label>
          </div>

          {isTagEnabled && (
            <div className="mt-4 pl-2 space-y-4 animate-in slide-in-from-top-2 duration-200">
              <RadioGroup
                value={formData.tagType || "AUTO"}
                onValueChange={(value: "AUTO" | "CUSTOM") => {
                  setFormData((prev: any) => ({
                    ...prev,
                    tagType: value,
                    ...(value === "AUTO" 
                      ? { productTag: "AUTO DELIVERY", tagColor: "#ffffff", tagBgColor: "#1e3a8a" } 
                      : { productTag: customTagValue, tagColor: prev.tagColor || "#ffffff", tagBgColor: prev.tagBgColor || "#262626" })
                  }));
                }}
                className="flex flex-wrap items-center gap-8"
              >
                <div className="flex items-center space-x-3 cursor-pointer group">
                  <RadioGroupItem value="AUTO" id="tag-auto" className="border-input text-primary focus:ring-ring bg-transparent" />
                  <Label htmlFor="tag-auto" className="flex items-center gap-1.5 text-sm font-medium text-foreground group-hover:text-foreground/50 cursor-pointer select-none uppercase">
                    Auto Delivery
                  </Label>
                </div>

                <div className="flex items-center space-x-3 cursor-pointer group">
                  <RadioGroupItem value="CUSTOM" id="tag-custom" className="border-input text-primary focus:ring-ring bg-transparent" />
                  <Label htmlFor="tag-custom" className="flex items-center gap-1.5 text-sm font-medium text-foreground group-hover:text-foreground/50 cursor-pointer select-none uppercase">
                    Customize Tag
                  </Label>
                </div>
              </RadioGroup>

              {formData.tagType === "CUSTOM" && (
                <div className="flex flex-wrap items-end gap-5 mt-2 animate-in fade-in duration-200">
                  
                  <div className="flex flex-col gap-2 w-full max-w-xs">
                    <Label className="text-xs font-medium text-muted-foreground">Custom Tag Text</Label>
                    <Input 
                      type="text"
                      placeholder="e.g. POPULAR, 10% OFF, NEW"
                      value={customTagValue}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomTagValue(val);
                        setFormData({ ...formData, productTag: val });
                      }}
                      className="bg-transparent border-input rounded-xl text-foreground h-11 focus:border-ring transition"
                    />
                  </div>

                  <div className="flex gap-4 items-center">
                    <div className="flex flex-col gap-1.5 items-center">
                      <Label className="text-[11px] font-medium text-muted-foreground">Text Color</Label>
                      <div className="relative w-11 h-11 rounded-xl border border-input overflow-hidden bg-background flex items-center justify-center cursor-pointer hover:border-ring transition">
                        <input 
                          type="color" 
                          value={formData.tagColor || "#ffffff"} 
                          onChange={(e) => setFormData({ ...formData, tagColor: e.target.value })}
                          className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer opacity-0"
                        />
                        <div className="w-5 h-5 rounded border border-input" style={{ backgroundColor: formData.tagColor || "#ffffff" }} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 items-center">
                      <Label className="text-[11px] font-medium text-muted-foreground">BG Color</Label>
                      <div className="relative w-11 h-11 rounded-xl border border-input overflow-hidden bg-background flex items-center justify-center cursor-pointer hover:border-ring transition">
                        <input 
                          type="color" 
                          value={formData.tagBgColor || "#262626"} 
                          onChange={(e) => setFormData({ ...formData, tagBgColor: e.target.value })}
                          className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer opacity-0"
                        />
                        <div className="w-5 h-5 rounded border border-input" style={{ backgroundColor: formData.tagBgColor || "#262626" }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-medium text-muted-foreground">Tag Icon (100x100)</Label>
                    <div className="w-[100px] h-[100px] border border-dashed border-input hover:border-ring bg-background rounded-xl overflow-hidden flex items-center justify-center transition-all">
                      <ImageUploader 
                        defaultValue={formData.tagIcon}
                        onFileChange={(file: any) => setFormData({ ...formData, tagIcon: file })} 
                      />
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* অ্যাকশন বাটন সেকশন */}
      <div className="flex justify-start gap-3 pt-6 items-center mt-6 border-t border-border">
        <Button 
          className="font-bold h-11 px-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 cursor-pointer" 
          onClick={handleUpdate} 
          disabled={loadingUpdate}
        >
          {loadingUpdate ? (
            <LoaderCircle className="h-4 w-4 animate-spin text-primary-foreground" />
          ) : (
            "Save Changes"
          )}
        </Button>
        
        {/* 🟢 এখানে onClick এ handleCancelAction ফাংশন বসানো হলো */}
        <Button 
          variant="ghost" 
          type="button" 
          className="text-muted-foreground hover:bg-destructive hover:text-destructive-foreground px-8 h-11 rounded-xl ml-auto font-medium transition-all duration-200 cursor-pointer" 
          onClick={handleCancelAction}
          disabled={loadingUpdate}
        >
          Cancel
        </Button>
      </div>

    </div>
  );
}